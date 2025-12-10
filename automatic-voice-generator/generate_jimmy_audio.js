import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// ========== CONFIGURATION ==========
const ELEVEN_API_KEY = "sk_f3c78e568d133f3cb5bd9e25d4f9a70ed147d1b2c527f429";
const VOICE_ID = "eT3X4VCP0uNoyW4G4qHy"; // Jimmy voice ID

// AWS S3 Configuration (fill these in)
const AWS_REGION = "us-east-1"; // Change to your region
const S3_BUCKET = "your-bucket-name"; // Change to your bucket name
const UPLOAD_TO_S3 = false; // Set to true when you're ready to upload to S3

// Local storage
const inputFile = "./jimmy_lines.json";
const outputFolder = "./output_jimmy_audio/";
const progressFile = "./progress.json";

// ElevenLabs settings
const MODEL_ID = "eleven_multilingual_v2";
const VOICE_SETTINGS = {
  stability: 0.4,
  similarity_boost: 0.8
};

// Rate limiting
const DELAY_BETWEEN_REQUESTS = 500; // milliseconds
const MAX_RETRIES = 3;

// ========== SETUP ==========
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
}

// Initialize S3 client (only if uploading)
let s3Client;
if (UPLOAD_TO_S3) {
  s3Client = new S3Client({ region: AWS_REGION });
}

// Load progress (resume support)
let progress = { completed: [], failed: [], lastIndex: 0 };
if (fs.existsSync(progressFile)) {
  progress = JSON.parse(fs.readFileSync(progressFile, "utf-8"));
  console.log(`📂 Resuming from line ${progress.lastIndex + 1}`);
}

// Load all lines
const lines = JSON.parse(fs.readFileSync(inputFile, "utf-8"));
console.log(`\n🎤 Total lines to process: ${lines.length}`);
console.log(`✅ Already completed: ${progress.completed.length}`);
console.log(`❌ Previously failed: ${progress.failed.length}`);
console.log(`📝 Remaining: ${lines.length - progress.completed.length}\n`);

// ========== CORE FUNCTIONS ==========

/**
 * Clean category name for folder structure
 */
function sanitizeCategoryName(category) {
  return category
    .replace(/[/\\?%*:|"<>]/g, '-')  // Replace invalid chars
    .replace(/\s+/g, '_')              // Replace spaces with underscores
    .replace(/[—–-]+/g, '-')           // Replace dashes
    .replace(/^\.+/, '')               // Remove leading dots
    .replace(/\.+$/, '')               // Remove trailing dots
    .replace(/_+/g, '_')               // Remove duplicate underscores
    .substring(0, 100);                // Limit length
}

/**
 * Create category folder if it doesn't exist
 */
function ensureCategoryFolder(category) {
  const folderName = sanitizeCategoryName(category);
  const folderPath = path.join(outputFolder, folderName);
  
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  
  return folderPath;
}

/**
 * Generate audio from text using ElevenLabs API
 */
async function generateAudio(id, text, retryCount = 0) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?optimize_streaming_latency=0`;

  const payload = {
    text,
    model_id: MODEL_ID,
    voice_settings: VOICE_SETTINGS
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
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer);
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.log(`   ⚠️  Retry ${retryCount + 1}/${MAX_RETRIES} for ${id}...`);
      await sleep(2000 * (retryCount + 1)); // Exponential backoff
      return generateAudio(id, text, retryCount + 1);
    }
    throw error;
  }
}

/**
 * Upload file to AWS S3
 */
async function uploadToS3(fileBuffer, fileName) {
  const key = `jimmy-audio/${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: "audio/mpeg",
    ACL: "public-read" // Make files publicly accessible
  });

  await s3Client.send(command);
  
  // Return public URL
  return `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;
}

/**
 * Save progress to file
 */
function saveProgress() {
  fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
}

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format duration
 */
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

// ========== MAIN PROCESS ==========
async function main() {
  const startTime = Date.now();
  const totalLines = lines.length;
  let processedCount = progress.completed.length;
  let failedCount = 0;

  console.log("🚀 Starting audio generation...\n");
  console.log("=" .repeat(80));

  for (let i = 0; i < lines.length; i++) {
    const { id, category, text } = lines[i];

    // Skip if already completed
    if (progress.completed.includes(id)) {
      continue;
    }

    const lineNumber = i + 1;
    const percentage = ((lineNumber / totalLines) * 100).toFixed(1);

    try {
      // Generate audio
      const audioBuffer = await generateAudio(id, text);

      // Create category folder and save locally
      const categoryFolder = ensureCategoryFolder(category);
      const fileName = `${id}.mp3`;
      const filePath = path.join(categoryFolder, fileName);
      fs.writeFileSync(filePath, audioBuffer);

      let s3Url = "N/A";
      
      // Upload to S3 if enabled (with category path)
      if (UPLOAD_TO_S3) {
        const s3FileName = `${sanitizeCategoryName(category)}/${fileName}`;
        s3Url = await uploadToS3(audioBuffer, s3FileName);
      }

      // Update progress
      progress.completed.push(id);
      progress.lastIndex = i;
      processedCount++;

      // Calculate ETA
      const elapsed = Date.now() - startTime;
      const avgTimePerLine = elapsed / processedCount;
      const remaining = totalLines - processedCount;
      const eta = formatDuration(avgTimePerLine * remaining);

      // Log success
      console.log(`✅ [${lineNumber}/${totalLines}] ${percentage}% | ${id} | ${text.substring(0, 50)}...`);
      console.log(`   📁 Category: ${category}`);
      if (UPLOAD_TO_S3) {
        console.log(`   📦 S3: ${s3Url}`);
      }
      console.log(`   ⏱️  ETA: ${eta} | Speed: ${(avgTimePerLine / 1000).toFixed(2)}s/line\n`);

      // Save progress every 10 lines
      if (processedCount % 10 === 0) {
        saveProgress();
      }

      // Rate limiting
      await sleep(DELAY_BETWEEN_REQUESTS);

    } catch (error) {
      failedCount++;
      progress.failed.push({ id, error: error.message });
      console.error(`❌ [${lineNumber}/${totalLines}] ${id} | ERROR: ${error.message}\n`);
      
      // Save progress after failures
      saveProgress();
    }
  }

  // Final save
  saveProgress();

  // Summary
  const totalTime = Date.now() - startTime;
  console.log("=" .repeat(80));
  console.log("\n🎉 GENERATION COMPLETE!\n");
  console.log(`📊 Statistics:`);
  console.log(`   Total lines:     ${totalLines}`);
  console.log(`   ✅ Successful:   ${progress.completed.length}`);
  console.log(`   ❌ Failed:       ${progress.failed.length}`);
  console.log(`   ⏱️  Total time:   ${formatDuration(totalTime)}`);
  console.log(`   📁 Output folder: ${outputFolder}`);
  
  if (UPLOAD_TO_S3) {
    console.log(`   ☁️  S3 Bucket:    s3://${S3_BUCKET}/jimmy-audio/`);
  }

  if (progress.failed.length > 0) {
    console.log(`\n⚠️  Failed lines (see progress.json for details):`);
    progress.failed.forEach(f => console.log(`   - ${f.id}: ${f.error}`));
  }

  console.log("\n💾 All audio files saved to:", path.resolve(outputFolder));
  console.log("📋 Progress file:", path.resolve(progressFile));
  console.log("\n✨ You're all set! Use these audio files in your app.\n");
}

// Run the script
main().catch(err => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});

