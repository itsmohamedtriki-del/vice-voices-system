import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    cb(null, `${timestamp}_${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
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

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'upload.html'));
});

// API endpoint for generation
app.post('/api/generate', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const { voiceId, characterName, apiKey } = req.body;

    if (!voiceId || !characterName || !apiKey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('\n🎤 New Generation Request:');
    console.log(`   Character: ${characterName}`);
    console.log(`   Voice ID: ${voiceId}`);
    console.log(`   PDF: ${req.file.originalname}`);

    const pdfPath = req.file.path;
    const outputFolder = path.join(__dirname, 'output', characterName);

    // Create output folder
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }

    // Step 1: Extract text from PDF using Python
    console.log('\n📄 Step 1: Extracting text from PDF...');
    
    const extractScript = `
import PyPDF2
import json
import re
import sys

pdf_path = "${pdfPath.replace(/\\/g, '\\\\')}"
output_path = "${path.join(__dirname, 'temp', `${characterName}_extracted.txt`).replace(/\\/g, '\\\\')}"
json_path = "${path.join(__dirname, 'temp', `${characterName}_lines.json`).replace(/\\/g, '\\\\')}"

# Create temp directory
import os
temp_dir = os.path.dirname(output_path)
if not os.path.exists(temp_dir):
    os.makedirs(temp_dir)

# Extract text
with open(pdf_path, 'rb') as file:
    pdf_reader = PyPDF2.PdfReader(file)
    full_text = ""
    for page in pdf_reader.pages:
        full_text += page.extract_text() + "\\n"
    
    with open(output_path, 'w', encoding='utf-8') as out:
        out.write(full_text)

# Parse responses (similar logic to Jimmy)
responses = []
current_category = ""
response_id = 1

lines = full_text.split('\\n')
for line in lines:
    line = re.sub(r'^\\s+\\d+\\|', '', line).strip()
    if not line:
        continue
    
    # Check if it's a category header
    if re.match(r'^\\d+\\)\\s+', line) or 'Dialogue Response Library' in line or 'Response' in line:
        category_match = re.search(r'(?:—\\s*)?([A-Z][^—\\(]+?)(?:\\s*\\(|$)', line)
        if category_match:
            current_category = category_match.group(1).strip()
            current_category = re.sub(r'\\s+\\d+\\s*$', '', current_category)
            current_category = re.sub(r'^\\d+\\)\\s*', '', current_category)
            current_category = current_category.replace('Dialogue Response Library', '').strip()
        continue
    
    # Skip meta lines and numbers
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

    // Create temp directory
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Write and execute Python script
    const scriptPath = path.join(tempDir, `extract_${characterName}.py`);
    fs.writeFileSync(scriptPath, extractScript);

    try {
      await execAsync(`cd ${__dirname} && source venv/bin/activate && python3 ${scriptPath}`);
    } catch (error) {
      console.error('Python extraction error:', error);
      throw new Error('Failed to extract text from PDF');
    }

    // Load extracted JSON
    const jsonPath = path.join(tempDir, `${characterName}_lines.json`);
    const extractedLines = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    console.log(`✅ Extracted ${extractedLines.length} responses`);

    // Step 2: Generate audio files using modified generation script
    console.log('\n🎵 Step 2: Generating audio files...');

    const generationScript = `
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const ELEVEN_API_KEY = "${apiKey}";
const VOICE_ID = "${voiceId}";
const CHARACTER_NAME = "${characterName}";

const MODEL_ID = "eleven_multilingual_v2";
const VOICE_SETTINGS = { stability: 0.4, similarity_boost: 0.8 };
const DELAY_BETWEEN_REQUESTS = 500;
const MAX_RETRIES = 3;

const inputFile = "${jsonPath.replace(/\\/g, '\\\\')}";
const outputFolder = "${outputFolder.replace(/\\/g, '\\\\')}";

if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
}

const lines = JSON.parse(fs.readFileSync(inputFile, "utf-8"));

function sanitizeCategoryName(category) {
  return category
    .replace(/[/\\\\?%*:|"<>]/g, '-')
    .replace(/\\s+/g, '_')
    .replace(/[—–-]+/g, '-')
    .replace(/^\\.+/, '')
    .replace(/\\.+$/, '')
    .replace(/_+/g, '_')
    .substring(0, 100);
}

function ensureCategoryFolder(category) {
  const folderName = sanitizeCategoryName(category);
  const folderPath = path.join(outputFolder, folderName);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  return folderPath;
}

async function generateAudio(id, text, retryCount = 0) {
  const url = \`https://api.elevenlabs.io/v1/text-to-speech/\${VOICE_ID}?optimize_streaming_latency=0\`;
  const payload = { text, model_id: MODEL_ID, voice_settings: VOICE_SETTINGS };

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

    if (!response.ok) throw new Error(\`API Error \${response.status}\`);
    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      await new Promise(res => setTimeout(res, 2000 * (retryCount + 1)));
      return generateAudio(id, text, retryCount + 1);
    }
    throw error;
  }
}

async function main() {
  console.log(\`\\n🎤 Generating \${lines.length} audio files for \${CHARACTER_NAME}...\\n\`);
  
  let completed = 0;
  let failed = 0;

  for (const { id, category, text } of lines) {
    try {
      const audioBuffer = await generateAudio(id, text);
      const categoryFolder = ensureCategoryFolder(category);
      const filePath = path.join(categoryFolder, \`\${id}.mp3\`);
      fs.writeFileSync(filePath, audioBuffer);
      
      completed++;
      const percent = ((completed / lines.length) * 100).toFixed(1);
      console.log(\`✅ [\${completed}/\${lines.length}] \${percent}% | \${id} | \${category}\`);
      
      await new Promise(res => setTimeout(res, DELAY_BETWEEN_REQUESTS));
    } catch (error) {
      failed++;
      console.error(\`❌ Error on \${id}: \${error.message}\`);
    }
  }

  console.log(\`\\n🎉 Complete! ✅ \${completed} | ❌ \${failed}\\n\`);
  process.exit(0);
}

main();
`;

    const genScriptPath = path.join(tempDir, `generate_${characterName}.js`);
    fs.writeFileSync(genScriptPath, generationScript);

    // Execute generation in background
    const genProcess = exec(`node ${genScriptPath}`, {
      cwd: __dirname,
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });

    // Stream output to console
    genProcess.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    genProcess.stderr.on('data', (data) => {
      console.error(data.toString());
    });

    // Don't wait for completion - return immediately
    res.json({
      success: true,
      message: 'Generation started successfully',
      characterName: characterName,
      totalLines: extractedLines.length,
      outputFolder: outputFolder,
      status: 'processing'
    });

    // Cleanup after process completes
    genProcess.on('exit', (code) => {
      console.log(`\n✅ Generation complete for ${characterName} (exit code: ${code})`);
      
      // Cleanup temp files
      try {
        fs.unlinkSync(pdfPath);
        fs.unlinkSync(scriptPath);
        fs.unlinkSync(genScriptPath);
        fs.unlinkSync(jsonPath);
      } catch (err) {
        console.error('Cleanup error:', err);
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
    
    // Cleanup on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {}
    }

    res.status(500).json({
      error: error.message || 'Generation failed'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                                                               ║');
  console.log('║       🎤  Voice Character Generator - Server Running  🎤      ║');
  console.log('║                                                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
  console.log(`   📡 Server:  http://localhost:${PORT}`);
  console.log(`   📁 Upload:  http://localhost:${PORT}/\n`);
  console.log('   Ready to accept PDF uploads!\n');
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: error.message });
});

