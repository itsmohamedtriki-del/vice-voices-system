# ☁️ Quick GCS Test & Setup

## ✅ Your Credentials

File: `gen-lang-client-0017980673-4116e2d12cda.json`
Service Account: `vice-918@gen-lang-client-0017980673.iam.gserviceaccount.com`
Bucket: `vice-voices`

---

## 🔧 One-Time Setup (Do This First!)

### Grant Bucket Access

1. Open your bucket: https://console.cloud.google.com/storage/browser/vice-voices

2. Click **"PERMISSIONS"** tab

3. Click **"GRANT ACCESS"**

4. Fill in:
   - **New principals:** `vice-918@gen-lang-client-0017980673.iam.gserviceaccount.com`
   - **Role:** `Storage Object Admin`

5. Click **"SAVE"**

---

## 🧪 Test Connection

```bash
# Set credentials
export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/gen-lang-client-0017980673-4116e2d12cda.json"

# Run test
node test-gcs.js
```

**Expected output:**
```
🎉 ALL TESTS PASSED!

✅ Your Google Cloud Storage is configured correctly!
```

---

## 🚀 Generate Jimmy's Voice Library to Cloud

Once test passes:

```bash
# Set credentials (if not already set)
export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/gen-lang-client-0017980673-4116e2d12cda.json"

# Generate and upload to GCS
node generate_with_gcs.js
```

This will:
- ✅ Generate all 2,100+ voice files
- ✅ Save locally in `output_jimmy_audio/`
- ✅ Upload to GCS in organized folders
- ✅ Generate public URLs

---

## 📂 Files Will Be In GCS At:

```
gs://vice-voices/
└── SlippinJimmy/
    ├── A._Greeting/
    │   ├── 0001.mp3
    │   ├── 0002.mp3
    │   └── ...
    ├── Purchase_Requests_-_$10/
    └── ... (all categories)
```

**Public URLs:**
```
https://storage.googleapis.com/vice-voices/SlippinJimmy/A._Greeting/0001.mp3
https://storage.googleapis.com/vice-voices/SlippinJimmy/Purchase_Requests_-_$10/0042.mp3
```

---

## 🌐 Start Team Upload Server

```bash
# Set credentials
export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/gen-lang-client-0017980673-4116e2d12cda.json"

# Start server
npm run server
```

Then share the URL with your team so they can upload other character PDFs!

---

## 📝 Important Notes

1. **Always set credentials first:**
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/gen-lang-client-0017980673-4116e2d12cda.json"
   ```

2. **For permanent setup** (add to `~/.zshrc`):
   ```bash
   echo 'export GOOGLE_APPLICATION_CREDENTIALS="/Users/macbookpro/automatic-voice-generator/gen-lang-client-0017980673-4116e2d12cda.json"' >> ~/.zshrc
   source ~/.zshrc
   ```

3. **Security:** Credentials file is in `.gitignore` - never commit it!

---

## 🐛 Troubleshooting

### "Permission denied" error
- Make sure you granted `Storage Object Admin` role
- Check service account email is correct
- Wait 1-2 minutes for permissions to propagate

### "Bucket not found" error
- Check bucket name: `vice-voices`
- Make sure you're in the correct Google Cloud project

### "Cannot make public" error
- This is optional - files still work without public access
- To enable: Bucket → Permissions → Grant Access → Add `allUsers` with role `Storage Object Viewer`

