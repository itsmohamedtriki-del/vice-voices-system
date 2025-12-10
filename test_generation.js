import fs from "fs";
import path from "path";
import fetch from "node-fetch";

// ========== CONFIGURATION ==========
const ELEVEN_API_KEY = "sk_f3c78e568d133f3cb5bd9e25d4f9a70ed147d1b2c527f429";
const VOICE_ID = "eT3X4VCP0uNoyW4G4qHy";

const MODEL_ID = "eleven_multilingual_v2";
const VOICE_SETTINGS = {
  stability: 0.4,
  similarity_boost: 0.8
};

const outputFolder = "./test_output/";

// ========== SETUP ==========
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
}

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

// Load just the first 5 lines for testing
const allLines = JSON.parse(fs.readFileSync("./jimmy_lines.json", "utf-8"));
const testLines = allLines.slice(2, 7); // Skip first 2 (they're meta), take next 5

console.log("🧪 TEST MODE - Generating 5 sample audio files\n");
console.log("=" .repeat(80));

async function generateAudio(id, text) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?optimize_streaming_latency=0`;

  const payload = {
    text,
    model_id: MODEL_ID,
    voice_settings: VOICE_SETTINGS
  };

  console.log(`\n🎤 Generating: ${id}`);
  console.log(`   Text: "${text.substring(0, 70)}..."`);

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
}

async function main() {
  console.log(`\n📋 Testing with ${testLines.length} lines...\n`);

  for (const { id, category, text } of testLines) {
    try {
      const audioBuffer = await generateAudio(id, text);
      
      // Create category folder and save
      const categoryFolder = ensureCategoryFolder(category);
      const fileName = `${id}.mp3`;
      const filePath = path.join(categoryFolder, fileName);
      fs.writeFileSync(filePath, audioBuffer);
      
      const sizeKB = (audioBuffer.length / 1024).toFixed(2);
      const relativePath = path.relative(outputFolder, filePath);
      console.log(`   ✅ Saved: ${relativePath} (${sizeKB} KB)`);
      console.log(`   📁 Category: ${category}`);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`   ❌ ERROR: ${error.message}`);
    }
  }

  console.log("\n" + "=" .repeat(80));
  console.log("\n🎉 TEST COMPLETE!");
  console.log(`\n📁 Test files saved to: ${path.resolve(outputFolder)}`);
  console.log("\n💡 If these look good, run the full generation:");
  console.log("   npm start\n");
}

main().catch(err => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});

