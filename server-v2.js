import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Storage } from '@google-cloud/storage';
import { createRequire } from 'module';

// Use CommonJS require for pdf-parse to avoid its debug auto-run code in ESM
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse/lib/pdf-parse.js');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Google Cloud Storage
let storage;
const GCS_BUCKET = 'vice-voices';

// Handle both file path (local) and JSON content (Railway) for GCS credentials
try {
  const gcpCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
  if (!gcpCredentials) {
    console.warn('Warning: GOOGLE_APPLICATION_CREDENTIALS not set. GCS uploads will fail.');
    storage = new Storage(); // Fallback
  } else if (gcpCredentials.trim().startsWith('{')) {
    // JSON content provided directly (Railway deployment)
    const credentials = JSON.parse(gcpCredentials);
    storage = new Storage({
      projectId: credentials.project_id,
      credentials: credentials
    });
    console.log('✅ GCS initialized with JSON credentials for project:', credentials.project_id);
    
    // IMPORTANT: Clear the env var to prevent other code from treating it as a file path
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
  } else {
    // File path provided (local development)
    storage = new Storage({
      keyFilename: gcpCredentials
    });
    console.log('✅ GCS initialized with key file:', gcpCredentials);
  }
} catch (error) {
  console.error('❌ Error initializing GCS:', error.message);
  console.error('Full error:', error);
  storage = new Storage(); // Fallback
}

// ElevenLabs API key (configured on the server, not entered by users)
const ELEVEN_API_KEY = process.env.ELEVEN_API_KEY;

if (!ELEVEN_API_KEY) {
  console.warn(
    'Warning: ELEVEN_API_KEY environment variable is not set. ' +
      'ElevenLabs requests will fail until this is configured.',
  );
}

// Queue system
const jobQueue = [];
const activeJobs = new Map(); // jobId -> job status
let isProcessing = false;

// Configure multer for multiple file uploads
const uploadStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    cb(null, `${timestamp}_${random}_${file.originalname}`);
  }
});

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB per file
  fileFilter: (req, file, cb) => {
    // Accept both PDF and CSV files
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'text/csv' || 
        file.originalname.toLowerCase().endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and CSV files are allowed'));
    }
  }
});

// Serve static files
app.use(express.static(__dirname));
app.use(express.json());

// SSE endpoint for real-time progress updates
app.get('/api/progress/:jobId', (req, res) => {
  const { jobId } = req.params;
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial status
  const job = activeJobs.get(jobId);
  if (job) {
    res.write(`data: ${JSON.stringify(job)}\n\n`);
  }

  // Send updates every second
  const intervalId = setInterval(() => {
    const job = activeJobs.get(jobId);
    if (job) {
      res.write(`data: ${JSON.stringify(job)}\n\n`);
      
      // Close connection when job is complete or failed
      if (job.status === 'completed' || job.status === 'failed') {
        clearInterval(intervalId);
        res.end();
      }
    } else {
      clearInterval(intervalId);
      res.end();
    }
  }, 1000);

  // Cleanup on client disconnect
  req.on('close', () => {
    clearInterval(intervalId);
  });
});

// Get all jobs status
app.get('/api/jobs', (req, res) => {
  const jobs = Array.from(activeJobs.values());
  res.json({ 
    jobs,
    queueLength: jobQueue.length,
    processing: isProcessing
  });
});

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'upload-v2.html'));
});

// Helper: Sanitize category names for folders
function sanitizeCategoryName(category) {
  return category
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '_')
    .replace(/[—–-]+/g, '-')
    .replace(/^\.+/, '')
    .replace(/\.+$/, '')
    .replace(/_+/g, '_')
    .substring(0, 100);
}

// Helper: Sanitize transcript text for filename
function sanitizeFilename(text) {
  return text
    .replace(/[/\\?%*:|"<>]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[—–-]+/g, '-')
    .replace(/[^\w\s-]/g, '') // Remove special chars except word chars, spaces, hyphens
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .substring(0, 100) // Limit length
    .trim();
}

// Helper: Upload to GCS
async function uploadToGCS(fileBuffer, characterName, categoryName, fileName) {
  const sanitizedCharacterName = sanitizeCategoryName(characterName);
  const sanitizedCategoryName = sanitizeCategoryName(categoryName);
  const destinationPath = `${sanitizedCharacterName}/${sanitizedCategoryName}/${fileName}`;
  
  const file = storage.bucket(GCS_BUCKET).file(destinationPath);
  await file.save(fileBuffer, {
    metadata: {
      contentType: "audio/mpeg",
      cacheControl: "public, max-age=3600"
    }
  });
  
  return `https://storage.googleapis.com/${GCS_BUCKET}/${destinationPath}`;
}

// Extract structured lines from a CSV file
function extractLinesFromCsv(csvPath) {
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    console.error('❌ CSV file must have at least 2 rows (headers + descriptions)');
    return [];
  }

  // Parse CSV manually (handling quoted fields with commas inside)
  function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = i + 1 < line.length ? line[i + 1] : '';
      
      if (char === '"') {
        // Handle escaped quotes ("")
        if (nextChar === '"' && inQuotes) {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  // Row 1 (index 0): Category names (headers)
  const categoryHeaders = parseCSVLine(lines[0]);
  console.log(`\n📊 CSV Row 1 (Categories): ${categoryHeaders.length} columns found`);
  console.log(`   Column 0 (Categories): SKIPPED - contains row labels`);
  console.log(`   Processing columns 1-${categoryHeaders.length - 1}: ${categoryHeaders.slice(1, 6).join(', ')}${categoryHeaders.length > 6 ? '...' : ''}`);

  // Row 2 (index 1): Descriptions - SKIP THIS ROW
  if (lines.length > 1) {
    const descriptions = parseCSVLine(lines[1]);
    console.log(`📝 CSV Row 2 (Descriptions): Skipping ${descriptions.length} description cells`);
  }

  // Row 3+ (index 2+): Responses - START PROCESSING FROM HERE
  // Column 0: SKIP (contains "Example 1", "Example 2", etc.)
  // Column 1+: Process (actual category responses)
  const responses = [];
  let responseId = 1;

  console.log(`\n📄 Processing data rows starting from row 3 (index 2)...`);
  console.log(`   ⚠️  Column 0 will be skipped (contains row labels)`);
  for (let rowIndex = 2; rowIndex < lines.length; rowIndex++) {
    const row = parseCSVLine(lines[rowIndex]);
    
    // Process each column (category) - SKIP COLUMN 0 (start from index 1)
    for (let colIndex = 1; colIndex < categoryHeaders.length && colIndex < row.length; colIndex++) {
      const category = categoryHeaders[colIndex].trim();
      const text = row[colIndex].trim();
      
      // Skip empty cells
      if (!category || !text || text === '' || text.trim() === '') {
        continue;
      }
      
      // Skip description row if it somehow appears again
      if (text.toLowerCase().includes('description of category') || 
          text.toLowerCase().includes('example')) {
        continue;
      }
      
      // Remove quotes if present
      const cleanText = text.replace(/^["']|["']$/g, '').trim();
      if (!cleanText) {
        continue;
      }
      
      responses.push({
        id: String(responseId).padStart(4, '0'),
        category: category,
        text: cleanText,
      });
      responseId += 1;
    }
  }

  console.log(`\n📊 CSV Extraction Summary:`);
  console.log(`   - Row 1 (Categories): ${categoryHeaders.length} columns`);
  console.log(`   - Column 0: SKIPPED ✓ (row labels)`);
  console.log(`   - Columns 1-${categoryHeaders.length - 1}: Processed ✓`);
  console.log(`   - Row 2 (Descriptions): SKIPPED ✓`);
  console.log(`   - Row 3+ (Data): ${lines.length - 2} rows processed`);
  console.log(`   - Total responses extracted: ${responses.length}`);

  return responses;
}

// Extract structured lines from a PDF using pdf-parse (Node-only, no Python)
async function extractLinesFromPdf(pdfPath) {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(dataBuffer);
  const fullText = data.text || '';

  console.log('\n📄 PDF Text Preview (first 1000 chars):');
  console.log(fullText.substring(0, 1000));
  console.log('\n📊 Total PDF text length:', fullText.length);
  console.log('📊 Total lines:', fullText.split('\n').length);

  const responses = [];
  let currentCategory = '';
  let responseId = 1;
  let dialogueStarted = false;  // Track when we've entered actual dialogue sections
  let lastCharacterProfileLine = null;  // Hold the last Character Profile line

  const lines = fullText.split('\n');

  let categoryCount = 0;
  let lineCount = 0;

  for (let rawLine of lines) {
    let line = rawLine.replace(/^\s+\d+\|/, '').trim();
    if (!line) continue;

    // Category headers - matches "1) ", "1A) ", "1B) ", etc.
    if (/^\d+[A-Z]?\)\s+/.test(line) || line.includes('Dialogue Response Library') || line.includes('Response')) {
      categoryCount++;
      console.log(`📂 Found category header: "${line}"`);
      lineCount = 0;
      // Before switching categories, if we're leaving Character Profile and have a saved line, add it
      if (!dialogueStarted && lastCharacterProfileLine && currentCategory === 'Character Profile') {
        responses.push(lastCharacterProfileLine);
        responseId += 1;
        lastCharacterProfileLine = null;
      }
      
      const match = line.match(/(?:—\s*)?([A-Z][^—\(]+?)(?:\s*\(|$)/);
      if (match) {
        let category = match[1].trim();
        category = category.replace(/\s+\d+\s*$/, '');
        category = category.replace(/^\d+[A-Z]?\)\s*/, ''); // Remove "1) " or "1A) " prefix
        category = category.replace('Dialogue Response Library', '').trim();
        
        // Mark dialogue as started when we see "Dialogue Response Library" OR any numbered section
        if (line.includes('Dialogue Response Library') || /^\d+[A-Z]?\)\s+/.test(line)) {
          dialogueStarted = true;
        }
        
        // Skip metadata-only categories entirely (and clear currentCategory so lines don't get added)
        const isMetadataCategory = /^(Voice Creation Prompt|Metadata|Profile|Instructions|Guidelines|Notes|Description|No Location Category)$/i.test(category);
        if (isMetadataCategory) {
          currentCategory = '';  // Clear category so subsequent lines are skipped
        } else {
          currentCategory = category;
        }
      }
      continue;
    }

    // Skip metadata fields (like "Name:", "Age:", "Role:", etc.)
    const isMetadata = /^(Name|Age|Role|Background|Traits|Voice Creation Prompt|Tone|Style|Delivery|Pitch|Speed|Volume|Emphasis|Pacing):/i.test(line);
    
    // Handle Character Profile before dialogue differently: save only the last line
    if (!dialogueStarted && currentCategory === 'Character Profile' && line.length > 3 && !/^[\d\.\)\s]+$/.test(line) && !isMetadata) {
      lastCharacterProfileLine = {
        id: String(responseId).padStart(4, '0'),
        category: currentCategory,
        text: line,
      };
      continue;  // Don't add yet, just save it
    }
    
    // Skip meta lines (pure numbers, metadata labels, etc.) and require a current category
    if (line.length > 3 && !/^[\d\.\)\s]+$/.test(line) && currentCategory && !isMetadata && dialogueStarted) {
      lineCount++;
      if (lineCount <= 3) {
        console.log(`  ✅ Adding line ${responseId} to "${currentCategory}": ${line.substring(0, 60)}...`);
      }
      responses.push({
        id: String(responseId).padStart(4, '0'),
        category: currentCategory,
        text: line,
      });
      responseId += 1;
    }
  }

  console.log(`\n📊 Extraction Summary:`);
  console.log(`   - Categories found: ${categoryCount}`);
  console.log(`   - Dialogue started: ${dialogueStarted}`);
  console.log(`   - Total responses extracted: ${responses.length}`);

  return responses;
}

// Process a single job
async function processJob(job) {
  const { jobId, pdfPath, voiceId, characterName, originalName } = job;
  
  try {
    // Update job status
    job.status = 'extracting';
    job.message = 'Extracting text from PDF...';
    job.progress = 0;
    
    const outputFolder = path.join(__dirname, 'output', characterName);
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }

    // Step 1: Extract text and responses from file (PDF or CSV)
    const fileExt = path.extname(pdfPath).toLowerCase();
    let extractedLines;
    
    if (fileExt === '.csv') {
      console.log(`\n📄 Processing CSV file: ${originalName}`);
      extractedLines = extractLinesFromCsv(pdfPath);
    } else {
      console.log(`\n📄 Processing PDF file: ${originalName}`);
      extractedLines = await extractLinesFromPdf(pdfPath);
    }

    job.totalLines = extractedLines.length;
    job.status = 'generating';
    job.message = `Generating ${extractedLines.length} audio files...`;
    job.progress = 5;

    console.log(`\n✅ [${jobId}] Extracted ${extractedLines.length} responses for ${characterName}`);

    // Step 2: Generate audio files with progress tracking
    let completed = 0;
    let failed = 0;
    const startTime = Date.now();

    for (const { id, category, text } of extractedLines) {
      try {
        // Generate audio
        const audioBuffer = await generateAudioWithElevenLabs(voiceId, text);
        
        // Create filename from transcript text + category
        const sanitizedText = sanitizeFilename(text);
        const sanitizedCategory = sanitizeCategoryName(category);
        const fileName = `${sanitizedCategory}_${sanitizedText}.mp3`;
        
        // Fallback to ID if filename is too short or empty
        const finalFileName = fileName.length > 10 ? fileName : `${id}.mp3`;
        
        // Save locally
        const categoryFolder = ensureCategoryFolder(outputFolder, category);
        const filePath = path.join(categoryFolder, finalFileName);
        fs.writeFileSync(filePath, audioBuffer);
        
        // Upload to GCS
        const gcsUrl = await uploadToGCS(audioBuffer, characterName, category, finalFileName);
        
        completed++;
        
        // Update progress
        const progress = 5 + Math.floor((completed / extractedLines.length) * 90);
        const elapsed = (Date.now() - startTime) / 1000;
        const rate = completed / elapsed;
        const remaining = (extractedLines.length - completed) / rate;
        
        job.progress = progress;
        job.completed = completed;
        job.failed = failed;
        job.currentFile = finalFileName;
        job.currentCategory = category;
        job.message = `Processing ${id} (${category})...`;
        job.estimatedTimeRemaining = Math.ceil(remaining);
        
        console.log(`✅ [${jobId}] [${completed}/${extractedLines.length}] ${progress}% | ${id} | ${category}`);
        console.log(`   📝 "${text.substring(0, 60)}${text.length > 60 ? '...' : ''}"`);
        console.log(`   💾 ${finalFileName}`);
        
        // Rate limiting
        await new Promise(res => setTimeout(res, 500));
        
      } catch (error) {
        failed++;
        job.failed = failed;
        console.error(`❌ [${jobId}] Error on ${id}: ${error.message}`);
      }
    }

    // Cleanup
    fs.unlinkSync(pdfPath);

    // Mark as complete
    job.status = 'completed';
    job.progress = 100;
    job.message = `Complete! ✅ ${completed} files | ❌ ${failed} failed`;
    job.completedAt = new Date().toISOString();
    job.outputFolder = outputFolder;
    job.gcsPath = `gs://${GCS_BUCKET}/${sanitizeCategoryName(characterName)}/`;
    job.publicUrl = `https://storage.googleapis.com/${GCS_BUCKET}/${sanitizeCategoryName(characterName)}/`;

    console.log(`\n🎉 [${jobId}] Complete! ${characterName}: ✅ ${completed} | ❌ ${failed}\n`);

  } catch (error) {
    console.error(`❌ [${jobId}] Fatal error:`, error);
    job.status = 'failed';
    job.message = `Error: ${error.message}`;
    job.error = error.message;
    
    // Cleanup on error
    try {
      if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
    } catch (err) {}
  }
}

// Generate audio with ElevenLabs
async function generateAudioWithElevenLabs(voiceId, text, retryCount = 0) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=0`;
  const payload = {
    text,
    model_id: "eleven_multilingual_v2",
    voice_settings: { stability: 0.4, similarity_boost: 0.8 }
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "xi-api-key": ELEVEN_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API Error ${response.status}: ${await response.text()}`);
    }
    
    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    if (retryCount < 3) {
      await new Promise(res => setTimeout(res, 2000 * (retryCount + 1)));
      return generateAudioWithElevenLabs(voiceId, text, retryCount + 1);
    }
    throw error;
  }
}

// Ensure category folder exists
function ensureCategoryFolder(baseFolder, category) {
  const folderName = sanitizeCategoryName(category);
  const folderPath = path.join(baseFolder, folderName);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  return folderPath;
}

// Queue processor (runs continuously)
async function processQueue() {
  if (isProcessing || jobQueue.length === 0) {
    return;
  }

  isProcessing = true;
  const job = jobQueue.shift();
  
  console.log(`\n🎬 Starting job: ${job.jobId} (${job.characterName})`);
  console.log(`   Queue remaining: ${jobQueue.length}\n`);
  
  await processJob(job);
  
  isProcessing = false;
  
  // Process next job in queue
  if (jobQueue.length > 0) {
    setTimeout(() => processQueue(), 1000);
  }
}

// API endpoint for multiple file uploads
app.post('/api/generate-batch', upload.array('pdfs', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    if (!ELEVEN_API_KEY) {
      return res.status(500).json({
        error: 'Server ElevenLabs API key is not configured. Please set ELEVEN_API_KEY on the server.',
      });
    }

    const jobs = [];

    // Create a job for each uploaded file
    for (const file of req.files) {
      // Extract voice ID and character name from filename
      // Expected format: VoiceID_BP1A_CharacterName.pdf or VoiceID_BP1A_CharacterName.csv
      const fileExt = path.extname(file.originalname).toLowerCase();
      const fileBasename = path.basename(file.originalname, fileExt);
      const parts = fileBasename.split('_');
      
      if (parts.length < 3) {
        console.error(`❌ Invalid filename format: ${file.originalname}`);
        console.error(`   Expected format: VoiceID_BP1A_CharacterName.pdf or VoiceID_BP1A_CharacterName.csv`);
        continue;
      }

      const voiceId = parts[0];
      const characterName = parts.slice(2).join('_'); // Everything after "BP1A"

      const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      const job = {
        jobId,
        pdfPath: file.path,
        voiceId,
        characterName,
        originalName: file.originalname,
        status: 'queued',
        message: 'Waiting in queue...',
        progress: 0,
        completed: 0,
        failed: 0,
        totalLines: 0,
        createdAt: new Date().toISOString(),
        queuePosition: jobQueue.length + 1
      };

      activeJobs.set(jobId, job);
      jobQueue.push(job);
      jobs.push({
        jobId,
        characterName,
        voiceId,
        filename: file.originalname,
        queuePosition: job.queuePosition
      });

      console.log(`📥 Queued: ${characterName} (${voiceId}) - ${file.originalname}`);
    }

      if (jobs.length === 0) {
        return res.status(400).json({
          success: false,
          error:
            'No jobs created. Make sure each file filename follows the format VoiceID_BP1A_CharacterName.pdf or VoiceID_BP1A_CharacterName.csv, e.g. eT3X4VCP0uNoyW4G4qHy_BP1A_SlippinJimmy.pdf',
        });
      }

    res.json({
      success: true,
      message: `${jobs.length} job(s) added to queue`,
      jobs,
      queueLength: jobQueue.length
    });

    // Start processing queue
    processQueue();

  } catch (error) {
    console.error('❌ Batch upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                                                               ║');
  console.log('║   🎤  Voice Generator V2 - Queue System + Progress  🎤       ║');
  console.log('║                                                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
  console.log(`   📡 Server:    http://localhost:${PORT}`);
  console.log(`   📁 Upload:    http://localhost:${PORT}/`);
  console.log(`   ☁️  Storage:   gs://${GCS_BUCKET}\n`);
  console.log('   ✅ Ready for batch uploads!\n');
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: error.message });
});

