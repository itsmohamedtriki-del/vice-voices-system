# 🚀 Slippin' Jimmy Voice Generation - Setup Guide

## ✅ What's Been Created

You now have a **complete automated voice generation system** with:

- ✅ **2,397 unique Jimmy dialogue lines** extracted from PDF
- ✅ **ElevenLabs TTS integration** with your API key pre-configured
- ✅ **AWS S3 upload support** (optional, disabled by default)
- ✅ **Resume/retry functionality** (won't lose progress if interrupted)
- ✅ **Rate limiting & error handling**
- ✅ **Progress tracking with ETA**

## 📁 Files Created

```
automatic-voice-generator/
├── generate_jimmy_audio.js    # Main script (2,397 lines)
├── test_generation.js         # Test script (5 lines only)
├── jimmy_lines.json           # All 2,397 responses
├── package.json               # Dependencies
├── README.md                  # Full documentation
├── SETUP_GUIDE.md            # This file
└── Slippin' Jimmy V3.pdf     # Original source
```

## 🎯 Quick Start (3 Steps)

### Step 1: Test with 5 Files (Recommended)

Run this first to make sure everything works:

```bash
node test_generation.js
```

**What this does:**
- Generates 5 sample MP3 files
- Tests your API key
- Verifies the voice sounds good
- Takes ~30 seconds

**Check the output:**
- Files will be in `./test_output/`
- Listen to them to verify quality
- If they sound good, proceed to Step 2

### Step 2: Run Full Generation

Once the test looks good:

```bash
npm start
```

**What this does:**
- Generates all 2,397 MP3 files
- Saves to `./output_jimmy_audio/`
- Takes ~2-3 hours
- Can be resumed if interrupted

**You'll see:**
```
🚀 Starting audio generation...
✅ [1/2397] 0.0% | 0003 | Yo—pick up, pick up—okay...
   ⏱️  ETA: 2h 15m 30s | Speed: 3.45s/line
✅ [2/2397] 0.1% | 0004 | Heyhey—listen, quick...
   ⏱️  ETA: 2h 14m 12s | Speed: 3.38s/line
...
```

### Step 3: Use the Audio Files

Once complete, you'll have:
- **2,397 MP3 files** in `./output_jimmy_audio/`
- Each file named by ID: `0001.mp3`, `0002.mp3`, etc.
- Ready to use in your application

## ☁️ Optional: AWS S3 Upload

If you want to upload to S3 automatically:

### 1. Create S3 Bucket

```bash
aws s3 mb s3://jimmy-voice-files
```

### 2. Configure AWS Credentials

```bash
aws configure
# Enter your Access Key ID
# Enter your Secret Access Key
# Enter region (e.g., us-east-1)
```

### 3. Enable in Script

Edit `generate_jimmy_audio.js`:

```javascript
const S3_BUCKET = "jimmy-voice-files";  // Your bucket name
const UPLOAD_TO_S3 = true;              // Enable upload
```

### 4. Run

```bash
npm start
```

Files will be uploaded to: `s3://jimmy-voice-files/jimmy-audio/XXXX.mp3`

Public URLs will be: `https://jimmy-voice-files.s3.us-east-1.amazonaws.com/jimmy-audio/XXXX.mp3`

## 🎛️ Configuration Options

Edit `generate_jimmy_audio.js` to adjust:

### Voice Quality

```javascript
const VOICE_SETTINGS = {
  stability: 0.4,        // 0-1: Lower = more expressive
  similarity_boost: 0.8  // 0-1: Higher = closer to original
};
```

**Recommended settings:**
- Stable/consistent: `stability: 0.7, similarity_boost: 0.9`
- Expressive/varied: `stability: 0.3, similarity_boost: 0.7`
- Current (balanced): `stability: 0.4, similarity_boost: 0.8`

### Speed Control

```javascript
const DELAY_BETWEEN_REQUESTS = 500; // milliseconds
```

**Options:**
- Faster (if you have high quota): `300`
- Safer (avoid rate limits): `1000`
- Current (balanced): `500`

### Model Selection

```javascript
const MODEL_ID = "eleven_multilingual_v2";
```

**Options:**
- `eleven_monolingual_v1` - English only, faster
- `eleven_multilingual_v2` - Better quality (recommended)
- `eleven_turbo_v2` - Fastest (if available)

## 📊 Response Statistics

Your dataset includes:

| Category | Count | Examples |
|----------|-------|----------|
| Purchase Requests | 240 | "$20 rock—can you do that?" |
| Locations | 152 | "Maple & Third payphone" |
| User Insults | 120 | "Stop chewing my ear..." |
| Confirmations | 107 | "Yeah", "Nope", "Lock it" |
| Emotional | 245 | "I'm trying, alright?" |
| Threats | 72 | "Ghost me and I'll redial..." |
| Other Categories | 1,461 | Various responses |
| **TOTAL** | **2,397** | |

## 🔧 Troubleshooting

### Problem: API Error 401 (Unauthorized)

**Solution:** Check your API key in `generate_jimmy_audio.js`
```javascript
const ELEVEN_API_KEY = "sk_f3c78e568d133f3cb5bd9e25d4f9a70ed147d1b2c527f429";
```

### Problem: API Error 429 (Rate Limit)

**Solution:** Increase delay between requests:
```javascript
const DELAY_BETWEEN_REQUESTS = 1000; // Slower but safer
```

### Problem: Script Crashes/Interrupted

**Solution:** Just run again - it will resume!
```bash
npm start
```
The script saves progress every 10 files in `progress.json`

### Problem: Want to Start Over

**Solution:** Delete progress and output:
```bash
rm progress.json
rm -rf output_jimmy_audio/
npm start
```

### Problem: S3 Upload Fails

**Solutions:**
1. Check credentials: `aws sts get-caller-identity`
2. Verify bucket exists: `aws s3 ls`
3. Check bucket name is correct in script
4. Ensure bucket has write permissions

## ⏱️ Time Estimates

| Lines | Estimated Time | Output Size |
|-------|----------------|-------------|
| 5 (test) | 30 seconds | ~500 KB |
| 100 | 6-8 minutes | ~10 MB |
| 500 | 30-40 minutes | ~50 MB |
| 2,397 (full) | 2-3 hours | ~240 MB |

## 💡 Pro Tips

### 1. Run in Background

Use `screen` or `tmux` for long runs:
```bash
# Start screen session
screen -S jimmy

# Run generation
npm start

# Detach: Ctrl+A, then D
# Reattach later: screen -r jimmy
```

### 2. Monitor Progress

Check the progress file:
```bash
tail -f progress.json
```

### 3. Test Voice Settings

Run test script with different settings:
```bash
node test_generation.js
# Listen to output
# Adjust settings in script
# Run again
```

### 4. Batch Processing

Split into chunks if needed:
```javascript
// In generate_jimmy_audio.js, after loading lines:
const lines = JSON.parse(fs.readFileSync(inputFile, "utf-8"))
  .slice(0, 500); // First 500 lines only
```

## 🎤 Voice ID Info

Your current voice:
- **ID**: `eT3X4VCP0uNoyW4G4qHy`
- **Name**: Jimmy voice (pre-configured)
- **Language**: English

To use a different voice:
1. Go to ElevenLabs dashboard
2. Copy the voice ID
3. Update in `generate_jimmy_audio.js`:
```javascript
const VOICE_ID = "your-new-voice-id";
```

## 📝 Next Steps After Generation

1. **Local Storage**: Files are in `./output_jimmy_audio/`
2. **Use in App**: Import and play based on dialogue context
3. **Mapping**: Use the JSON file to map text → audio file
4. **CDN**: Upload to S3/CloudFront for web delivery

Example usage in your app:
```javascript
import jimmyLines from './jimmy_lines.json';

function getAudioForResponse(category, index) {
  const line = jimmyLines.find(l => 
    l.category === category && /* your logic */
  );
  return `/audio/${line.id}.mp3`;
}
```

## 🆘 Need Help?

- ElevenLabs API Docs: https://docs.elevenlabs.io/
- Check your API quota: https://elevenlabs.io/app/subscription
- AWS S3 Docs: https://docs.aws.amazon.com/s3/

## ✨ Summary

You have everything you need! Just run:

```bash
# Quick test (recommended first)
node test_generation.js

# Full generation (when ready)
npm start
```

**That's it!** The script handles everything else automatically. 🎉

