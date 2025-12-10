# ☁️ Google Cloud Storage Setup Guide

## ✅ Your GCS Bucket

You have a bucket ready at:
- **Bucket Name**: `vice-voices`
- **Console**: https://console.cloud.google.com/storage/browser/vice-voices
- **gs:// URL**: `gs://vice-voices`

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Install Google Cloud CLI

```bash
# macOS (using Homebrew)
brew install --cask google-cloud-sdk

# Or download from: https://cloud.google.com/sdk/docs/install
```

### Step 2: Authenticate

```bash
# Login to Google Cloud
gcloud auth login

# Set up application default credentials (for Node.js)
gcloud auth application-default login

# Set your project
gcloud config set project YOUR_PROJECT_ID
```

### Step 3: Test Access

```bash
# List files in your bucket
gsutil ls gs://vice-voices

# Should show your bucket contents or empty if new
```

✅ **Done!** The scripts can now upload to GCS automatically.

---

## 🎯 How It Works

### For Jimmy (Current Generation)

The existing generation is running with local storage. To switch to GCS:

**Option 1: Use the new GCS-enabled script**
```bash
# This will save locally AND upload to GCS
node generate_with_gcs.js
```

**Option 2: Upload existing files to GCS**
```bash
# Upload all generated files at once
gsutil -m cp -r output_jimmy_audio gs://vice-voices/SlippinJimmy/
```

### For New Characters (Team Uploads)

When team members upload PDFs through the web interface, files will:
1. ✅ Generate locally
2. ✅ Upload to GCS automatically
3. ✅ Be accessible at public URLs

---

## 📁 GCS Folder Structure

Files will be organized like this:

```
gs://vice-voices/
├── SlippinJimmy/
│   ├── A._Greeting/
│   │   ├── 0001.mp3
│   │   ├── 0002.mp3
│   │   └── ...
│   ├── Purchase_Requests_-_$10/
│   │   └── ...
│   └── ... (all categories)
│
├── WalterWhite/
│   ├── Threats/
│   │   └── ...
│   └── ...
│
└── SaulGoodman/
    └── ...
```

Each character gets their own folder with category subfolders!

---

## 🌐 Public URLs

After uploading, files are accessible at:

```
https://storage.googleapis.com/vice-voices/SlippinJimmy/A._Greeting/0001.mp3
https://storage.googleapis.com/vice-voices/WalterWhite/Threats/0042.mp3
```

**These URLs work from anywhere!** No authentication needed (files are public).

---

## 🎨 Bucket Configuration

### Make Files Public by Default

In Google Cloud Console:

1. Go to https://console.cloud.google.com/storage/browser/vice-voices
2. Click **Permissions** tab
3. Click **Grant Access**
4. Add principal: `allUsers`
5. Role: **Storage Object Viewer**
6. Click **Save**

Now all uploaded files will be publicly accessible automatically!

---

### Enable CORS (for web playback)

```bash
# Create cors.json
cat > cors.json << 'EOF'
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
EOF

# Apply CORS settings
gsutil cors set cors.json gs://vice-voices
```

This allows audio files to be played directly in web browsers!

---

## 💰 Cost Estimate

Google Cloud Storage pricing:

| Usage | Cost |
|-------|------|
| **Storage** | $0.020/GB per month |
| **Network (first 1GB)** | Free |
| **Network (next 10TB)** | $0.12/GB |

**For 2,397 files (~240 MB per character):**

- **Storage**: $0.005/month per character (~$0.01 for Jimmy)
- **Bandwidth**: First 1GB free, then $0.12/GB
- **Operations**: Negligible cost

**Total estimated cost:** ~$1-5/month for small usage

Google Cloud also offers:
- ✅ $300 free credit for new accounts (90 days)
- ✅ Always free tier for limited usage

---

## 🔧 Configuration Options

### In `generate_with_gcs.js`:

```javascript
// Google Cloud Storage Configuration
const GCS_BUCKET_NAME = "vice-voices";
const UPLOAD_TO_GCS = true; // Set to false to disable GCS upload
```

### Change Folder Structure:

```javascript
// Current: gs://vice-voices/SlippinJimmy/Category/file.mp3
const gcsPath = `SlippinJimmy/${folderName}/${fileName}`;

// Alternative: Flat structure
const gcsPath = `${fileName}`;

// Alternative: Date-based
const gcsPath = `${new Date().toISOString().split('T')[0]}/${folderName}/${fileName}`;
```

---

## 🛠️ Useful Commands

### Upload Files

```bash
# Upload single file
gsutil cp file.mp3 gs://vice-voices/SlippinJimmy/A._Greeting/

# Upload entire folder
gsutil -m cp -r output_jimmy_audio/* gs://vice-voices/SlippinJimmy/

# Upload with public access
gsutil cp -a public-read file.mp3 gs://vice-voices/
```

### Download Files

```bash
# Download single file
gsutil cp gs://vice-voices/SlippinJimmy/A._Greeting/0001.mp3 ./

# Download entire folder
gsutil -m cp -r gs://vice-voices/SlippinJimmy/ ./downloads/
```

### List Files

```bash
# List all files
gsutil ls gs://vice-voices/

# List specific folder
gsutil ls gs://vice-voices/SlippinJimmy/

# List recursively with details
gsutil ls -lh -r gs://vice-voices/
```

### Make Files Public

```bash
# Make single file public
gsutil acl ch -u AllUsers:R gs://vice-voices/SlippinJimmy/0001.mp3

# Make all files public
gsutil -m acl ch -r -u AllUsers:R gs://vice-voices/*
```

### Delete Files

```bash
# Delete single file
gsutil rm gs://vice-voices/SlippinJimmy/A._Greeting/0001.mp3

# Delete entire folder
gsutil -m rm -r gs://vice-voices/SlippinJimmy/

# Delete everything (careful!)
gsutil -m rm -r gs://vice-voices/**
```

---

## 🎯 Integration with Your App

### Loading Audio in Your App

```javascript
// Option 1: Direct URL
const audioUrl = 'https://storage.googleapis.com/vice-voices/SlippinJimmy/A._Greeting/0001.mp3';
const audio = new Audio(audioUrl);
audio.play();

// Option 2: Dynamic from character data
function getAudioUrl(character, category, fileId) {
  const sanitizedCategory = category.replace(/\s+/g, '_').replace(/[/\\?%*:|"<>]/g, '-');
  return `https://storage.googleapis.com/vice-voices/${character}/${sanitizedCategory}/${fileId}.mp3`;
}

const url = getAudioUrl('SlippinJimmy', 'A. Greeting', '0001');
const audio = new Audio(url);
audio.play();

// Option 3: With error handling
async function playAudio(character, category, fileId) {
  const url = getAudioUrl(character, category, fileId);
  
  try {
    const audio = new Audio(url);
    audio.addEventListener('canplaythrough', () => {
      audio.play();
    });
    audio.addEventListener('error', (e) => {
      console.error('Audio load error:', e);
    });
  } catch (error) {
    console.error('Playback error:', error);
  }
}
```

---

## 📊 Monitoring

### Check Storage Usage

```bash
# Get total size
gsutil du -sh gs://vice-voices/

# Get size by character
gsutil du -h gs://vice-voices/*/

# Count files
gsutil ls -r gs://vice-voices/ | wc -l
```

### View in Console

https://console.cloud.google.com/storage/browser/vice-voices

Shows:
- ✅ File count
- ✅ Total size
- ✅ Folder structure
- ✅ Public access status
- ✅ Bandwidth usage

---

## 🐛 Troubleshooting

### "Authentication error"

```bash
# Re-authenticate
gcloud auth application-default login
```

### "Permission denied"

```bash
# Check your permissions
gcloud projects get-iam-policy YOUR_PROJECT_ID

# Need: Storage Admin or Storage Object Creator role
```

### "Bucket not found"

```bash
# Verify bucket exists
gsutil ls gs://vice-voices/

# Check you're in the right project
gcloud config get-value project
```

### "Files not public"

```bash
# Make bucket contents public
gsutil iam ch allUsers:objectViewer gs://vice-voices
```

---

## 🚀 Quick Start Commands

**For immediate use:**

```bash
# 1. Authenticate
gcloud auth application-default login

# 2. Test access
gsutil ls gs://vice-voices/

# 3. Upload Jimmy's files
gsutil -m cp -r output_jimmy_audio/* gs://vice-voices/SlippinJimmy/

# 4. Make public
gsutil -m acl ch -r -u AllUsers:R gs://vice-voices/*

# Done! Files accessible at:
# https://storage.googleapis.com/vice-voices/SlippinJimmy/...
```

---

## 📝 Summary

✅ **Bucket ready**: `vice-voices`  
✅ **New script created**: `generate_with_gcs.js`  
✅ **Auto-upload enabled**  
✅ **Public URLs generated**  
✅ **Organized folder structure**  

**Next steps:**
1. Authenticate: `gcloud auth application-default login`
2. Test: `gsutil ls gs://vice-voices/`
3. Generate with GCS: `node generate_with_gcs.js`

Or upload existing files:
```bash
gsutil -m cp -r output_jimmy_audio/* gs://vice-voices/SlippinJimmy/
```

