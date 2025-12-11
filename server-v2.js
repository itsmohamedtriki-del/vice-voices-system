import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Storage } from '@google-cloud/storage';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Google Cloud Storage
const storage = new Storage();
const GCS_BUCKET = 'vice-voices';

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
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
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

    // Create temp directory
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Step 1: Extract text from PDF
    const extractScript = `
import PyPDF2
import json
import re
import sys

pdf_path = "${pdfPath.replace(/\\/g, '\\\\')}"
output_path = "${path.join(tempDir, `${characterName}_extracted.txt`).replace(/\\/g, '\\\\')}"
json_path = "${path.join(tempDir, `${characterName}_lines.json`).replace(/\\/g, '\\\\')}"

# Extract text
with open(pdf_path, 'rb') as file:
    pdf_reader = PyPDF2.PdfReader(file)
    full_text = ""
    for page in pdf_reader.pages:
        full_text += page.extract_text() + "\\n"
    
    with open(output_path, 'w', encoding='utf-8') as out:
        out.write(full_text)

# Parse responses
responses = []
current_category = ""
response_id = 1

lines = full_text.split('\\n')
for line in lines:
    line = re.sub(r'^\\s+\\d+\\|', '', line).strip()
    if not line:
        continue
    
    # Category headers
    if re.match(r'^\\d+\\)\\s+', line) or 'Dialogue Response Library' in line or 'Response' in line:
        category_match = re.search(r'(?:—\\s*)?([A-Z][^—\\(]+?)(?:\\s*\\(|$)', line)
        if category_match:
            current_category = category_match.group(1).strip()
            current_category = re.sub(r'\\s+\\d+\\s*$', '', current_category)
            current_category = re.sub(r'^\\d+\\)\\s*', '', current_category)
            current_category = current_category.replace('Dialogue Response Library', '').strip()
        continue
    
    # Skip meta lines
    if len(line) > 3 and not re.match(r'^[\\d\\.\\)\\s]+$', line) and current_category:
        responses.append({
            "id": f"{response_id:04d}",
            "category": current_category,
            "text": line
        })
        response_id += 1

# Save to JSON
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(responses, f, indent=2, ensure_ascii=False)

print(f"✅ Extracted {len(responses)} responses")
`;

    const scriptPath = path.join(tempDir, `extract_${jobId}.py`);
    fs.writeFileSync(scriptPath, extractScript);

    await execAsync(`cd ${__dirname} && source venv/bin/activate && python3 ${scriptPath}`);

    // Load extracted JSON
    const jsonPath = path.join(tempDir, `${characterName}_lines.json`);
    const extractedLines = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

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
        
        // Save locally
        const categoryFolder = ensureCategoryFolder(outputFolder, category);
        const filePath = path.join(categoryFolder, `${id}.mp3`);
        fs.writeFileSync(filePath, audioBuffer);
        
        // Upload to GCS
        const gcsUrl = await uploadToGCS(audioBuffer, characterName, category, `${id}.mp3`);
        
        completed++;
        
        // Update progress
        const progress = 5 + Math.floor((completed / extractedLines.length) * 90);
        const elapsed = (Date.now() - startTime) / 1000;
        const rate = completed / elapsed;
        const remaining = (extractedLines.length - completed) / rate;
        
        job.progress = progress;
        job.completed = completed;
        job.failed = failed;
        job.currentFile = `${id}.mp3`;
        job.currentCategory = category;
        job.message = `Processing ${id} (${category})...`;
        job.estimatedTimeRemaining = Math.ceil(remaining);
        
        console.log(`✅ [${jobId}] [${completed}/${extractedLines.length}] ${progress}% | ${id} | ${category}`);
        
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
    fs.unlinkSync(scriptPath);
    fs.unlinkSync(jsonPath);

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
      return res.status(400).json({ error: 'No PDF files uploaded' });
    }

    if (!ELEVEN_API_KEY) {
      return res.status(500).json({
        error: 'Server ElevenLabs API key is not configured. Please set ELEVEN_API_KEY on the server.',
      });
    }

    const jobs = [];

    // Create a job for each uploaded file
    for (const file of req.files) {
      // Extract character name and voice ID from filename
      // Expected format: CharacterName_VoiceID.pdf
      const fileBasename = path.basename(file.originalname, '.pdf');
      const parts = fileBasename.split('_');
      
      if (parts.length < 2) {
        console.error(`❌ Invalid filename format: ${file.originalname}`);
        console.error(`   Expected format: CharacterName_VoiceID.pdf`);
        continue;
      }

      const characterName = parts.slice(0, -1).join('_');
      const voiceId = parts[parts.length - 1];

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

