# ☁️ Google Cloud Storage - Simple Setup with Service Account

## 🎯 Easiest Way: Use Service Account Key

Instead of installing Google Cloud SDK, you can use a service account key file.

---

## 📋 Step-by-Step Setup

### Step 1: Create Service Account Key

1. Go to Google Cloud Console:
   https://console.cloud.google.com/iam-admin/serviceaccounts

2. Click **"Create Service Account"**
   - Name: `voice-generator`
   - Description: `Service account for voice file uploads`
   - Click **Create**

3. Grant permissions:
   - Role: **Storage Object Admin**
   - Click **Continue**
   - Click **Done**

4. Create key:
   - Click on the service account you just created
   - Go to **Keys** tab
   - Click **Add Key** → **Create new key**
   - Choose **JSON**
   - Click **Create**
   - File downloads automatically (e.g., `your-project-xxxxx.json`)

5. Save the key file:
   ```bash
   mv ~/Downloads/your-project-xxxxx.json /Users/macbookpro/automatic-voice-generator/gcs-key.json
   ```

---

### Step 2: Set Environment Variable

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/Users/macbookpro/automatic-voice-generator/gcs-key.json"

# Or add to your ~/.zshrc for permanent:
echo 'export GOOGLE_APPLICATION_CREDENTIALS="/Users/macbookpro/automatic-voice-generator/gcs-key.json"' >> ~/.zshrc
source ~/.zshrc
```

---

### Step 3: Test It!

```bash
node test-gcs.js
```

This will:
1. ✅ Test connection to your bucket
2. ✅ Upload a test file
3. ✅ Make it public
4. ✅ Return the public URL
5. ✅ Clean up

---

## 🔒 Security Note

**IMPORTANT:** The `gcs-key.json` file contains sensitive credentials!

Add it to `.gitignore`:
```bash
echo "gcs-key.json" >> .gitignore
```

**Never commit this file to Git!**

---

## 🎯 Quick Commands

**Test GCS connection:**
```bash
node test-gcs.js
```

**Generate with GCS upload:**
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/Users/macbookpro/automatic-voice-generator/gcs-key.json"
node generate_with_gcs.js
```

**Upload existing files:**
```bash
# If you have gcloud/gsutil installed:
gsutil -m cp -r output_jimmy_audio/* gs://vice-voices/SlippinJimmy/

# Or use the Node.js script:
node upload-to-gcs.js
```

---

## 🐛 Troubleshooting

### Error: "GOOGLE_APPLICATION_CREDENTIALS not set"

**Solution:**
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/Users/macbookpro/automatic-voice-generator/gcs-key.json"
```

### Error: "Permission denied"

**Solution:** Make sure the service account has **Storage Object Admin** role

1. Go to: https://console.cloud.google.com/storage/browser/vice-voices
2. Click **Permissions** tab
3. Add your service account email with **Storage Object Admin** role

### Error: "Bucket not found"

**Solution:** Check bucket name is correct: `vice-voices`

---

## ✅ Summary

With service account key:
- ✅ No need to install Google Cloud SDK
- ✅ Works on any machine
- ✅ Easy to deploy to servers (Railway, etc.)
- ✅ Just set environment variable and go!

Just 3 steps:
1. Download service account key JSON
2. Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable
3. Run scripts!

