# Slippin' Jimmy Voice Generator

Automated voice generation system for the Slippin' Jimmy AI character using ElevenLabs TTS API with AWS S3 storage.

## 📊 Dataset

- **Total Responses**: 2,397 unique Jimmy dialogue lines
- **Categories**: 69+ dialogue categories including greetings, negotiations, threats, apologies, etc.
- **Format**: JSON with ID, category, and text fields

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Settings

Open `generate_jimmy_audio.js` and update:

```javascript
// Already configured for you:
const ELEVEN_API_KEY = "sk_f3c78e568d133f3cb5bd9e25d4f9a70ed147d1b2c527f429";
const VOICE_ID = "eT3X4VCP0uNoyW4G4qHy";

// Optional - Configure S3 (if you want cloud storage):
const AWS_REGION = "us-east-1";
const S3_BUCKET = "your-bucket-name";
const UPLOAD_TO_S3 = false; // Set to true when ready
```

### 3. Run Generation

```bash
npm start
```

## 📁 File Structure

```
automatic-voice-generator/
├── generate_jimmy_audio.js    # Main generation script
├── jimmy_lines.json           # All 2,397 Jimmy responses
├── package.json               # Dependencies
├── output_jimmy_audio/        # Generated MP3 files (created automatically)
├── progress.json              # Resume support (created automatically)
└── README.md                  # This file
```

## ⚙️ Features

### ✅ Resume Support
- Script tracks progress in `progress.json`
- If interrupted, run again to resume from where you left off
- Failed lines are retried automatically

### ✅ Rate Limiting
- Built-in 500ms delay between requests
- Respects ElevenLabs API limits
- Automatic retry with exponential backoff

### ✅ Progress Tracking
- Real-time progress display with percentage
- ETA calculation
- Speed metrics (seconds per line)

### ✅ AWS S3 Upload (Optional)
- Automatic upload to S3 bucket
- Public URL generation
- Organized in `jimmy-audio/` folder

### ✅ Error Handling
- Automatic retries (up to 3 attempts)
- Detailed error logging
- Failed lines saved to progress.json

## 🔧 Configuration Options

Edit `generate_jimmy_audio.js`:

```javascript
// Rate limiting
const DELAY_BETWEEN_REQUESTS = 500; // milliseconds
const MAX_RETRIES = 3;

// Voice settings
const VOICE_SETTINGS = {
  stability: 0.4,        // 0-1: Lower = more variable
  similarity_boost: 0.8  // 0-1: Higher = closer to original voice
};

// Model selection
const MODEL_ID = "eleven_multilingual_v2";
// Options: "eleven_monolingual_v1", "eleven_multilingual_v2"
```

## ☁️ AWS S3 Setup (Optional)

### Step 1: Create S3 Bucket

```bash
aws s3 mb s3://your-bucket-name
```

### Step 2: Configure Bucket Policy

Create a policy for public read access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/jimmy-audio/*"
    }
  ]
}
```

### Step 3: Configure AWS Credentials

```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your region (e.g., us-east-1)
```

### Step 4: Enable S3 Upload

In `generate_jimmy_audio.js`:

```javascript
const S3_BUCKET = "your-actual-bucket-name";
const UPLOAD_TO_S3 = true;
```

## 📊 Expected Output

```
🚀 Starting audio generation...
================================================================================
✅ [1/2397] 0.0% | 0003 | Yo—pick up, pick up—okay, you there? It's Jimmy....
   ⏱️  ETA: 2h 15m 30s | Speed: 3.45s/line

✅ [2/2397] 0.1% | 0004 | Heyhey—listen, quick question, quick. You good to...
   ⏱️  ETA: 2h 14m 12s | Speed: 3.38s/line

...

🎉 GENERATION COMPLETE!

📊 Statistics:
   Total lines:     2397
   ✅ Successful:   2397
   ❌ Failed:       0
   ⏱️  Total time:   2h 15m 43s
   📁 Output folder: ./output_jimmy_audio/
```

## ⏱️ Time Estimate

- **Total Lines**: 2,397
- **Avg Time per Line**: 3-4 seconds (including API + rate limit)
- **Estimated Total Time**: ~2-3 hours
- **Output Size**: ~2,397 MP3 files (~240-360 MB total)

## 🎯 Usage in Your App

Once generated, you can:

1. **Local Storage**: Use files from `./output_jimmy_audio/`
2. **S3 CDN**: Access via public URLs like:
   ```
   https://your-bucket.s3.us-east-1.amazonaws.com/jimmy-audio/0001.mp3
   ```
3. **Supabase/Firebase**: Upload to your preferred storage

## 🐛 Troubleshooting

### API Rate Limit Errors
- Increase `DELAY_BETWEEN_REQUESTS` to 1000ms or higher
- Check your ElevenLabs quota

### S3 Upload Fails
- Verify AWS credentials: `aws sts get-caller-identity`
- Check bucket permissions
- Ensure bucket name is correct

### Resume from Failure
- Simply run `npm start` again
- Script will skip completed lines
- Failed lines will be retried

### Clear Progress and Start Fresh
```bash
rm progress.json
rm -rf output_jimmy_audio/
npm start
```

## 📝 Response Categories

The dataset includes:
- Greetings (5 variants)
- Purchase requests ($10, $20, $50, $100, $150, $200)
- Location confirmations (20 locations, multiple variants each)
- Negotiations & threats
- Emotional responses
- Insults & comebacks
- Apologies
- Confirmations (yes/no)
- Filler words & verbal tics
- Error handling (confusion, off-topic, etc.)
- Safety checks & paranoia
- Call endings

## 🔐 Security Notes

- Your API key is embedded in the script (for convenience)
- For production, use environment variables:
  ```javascript
  const ELEVEN_API_KEY = process.env.ELEVEN_API_KEY;
  ```
- Consider using AWS IAM roles instead of access keys

## 📞 Support

- ElevenLabs API Docs: https://docs.elevenlabs.io/
- AWS S3 Docs: https://docs.aws.amazon.com/s3/

## 📄 License

MIT

