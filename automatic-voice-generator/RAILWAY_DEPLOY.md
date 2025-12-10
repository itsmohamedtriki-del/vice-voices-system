# 🚂 Deploy to Railway - Step by Step Guide

## ✅ Why Railway?

- ✅ **No timeout limits** - Your 20-60 minute jobs work perfectly
- ✅ **Background jobs** - Queue system works great
- ✅ **Always running** - 24/7 uptime
- ✅ **500 hours FREE** trial ($5 credit)
- ✅ **$5/month** after trial
- ✅ **Easy setup** - 5 minutes to deploy

---

## 📋 Prerequisites

1. ✅ GitHub account
2. ✅ This project pushed to GitHub
3. ✅ Railway account (free signup)

---

## 🚀 Deployment Steps

### Step 1: Push to GitHub (if not already done)

```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Voice generator v2 with queue system"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

### Step 2: Sign Up for Railway

1. Go to: **https://railway.app**
2. Click **"Login"** or **"Start a New Project"**
3. Sign in with **GitHub**
4. Authorize Railway to access your repos

---

### Step 3: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository (e.g., `automatic-voice-generator`)
4. Railway will detect it's a Node.js project and configure automatically

---

### Step 4: Configure Environment Variables

This is the most important step!

1. In Railway dashboard, click on your deployed service
2. Go to **"Variables"** tab
3. Click **"New Variable"**
4. Add the following:

**Variable 1: Google Cloud Credentials**
```
Variable Name: GOOGLE_APPLICATION_CREDENTIALS
Variable Value: (see below)
```

For the value, you have **2 options**:

#### Option A: Paste JSON directly (Easiest)
Copy the ENTIRE content of `gen-lang-client-0017980673-4116e2d12cda.json` and paste it as a single line:

```json
{"type":"service_account","project_id":"gen-lang-client-0017980673","private_key_id":"4116e2d12cda76b109e8ee9fc2226cbe92778864","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC5kE5jzeP9SXGK...","client_email":"vice-918@gen-lang-client-0017980673.iam.gserviceaccount.com",...}
```

#### Option B: Use Railway's file system (Alternative)
If Option A doesn't work, you can use Railway's CLI to upload the file.

---

### Step 5: Configure Start Command (if needed)

Railway should auto-detect, but to be sure:

1. Go to **"Settings"** tab
2. Scroll to **"Deploy"** section
3. Set **Start Command**: `npm run server-v2`
4. Set **Build Command**: `npm install`

---

### Step 6: Deploy!

1. Railway will automatically deploy after you save settings
2. You'll see build logs in real-time
3. Wait for: **"Deployed successfully"** ✅

---

### Step 7: Get Your Public URL

1. Go to **"Settings"** tab
2. Scroll to **"Networking"** section
3. Click **"Generate Domain"**
4. Railway gives you a URL like: `https://your-app.up.railway.app`

**This is your permanent URL!** Share it with your team.

---

## 🧪 Test Your Deployment

1. Visit your Railway URL: `https://your-app.up.railway.app`
2. You should see the upload interface
3. Try uploading a test PDF:
   - Name it: `TestCharacter_VoiceID123.pdf`
   - Enter your ElevenLabs API key
   - Upload!
4. Watch the queue and progress bars update in real-time

---

## 🔍 Monitor & Debug

### View Logs
1. In Railway dashboard, click your service
2. Click **"Deployments"** tab
3. Click on latest deployment
4. See live logs - watch jobs processing!

### Restart Service
If needed:
1. Go to service page
2. Click the **⋯** (three dots)
3. Click **"Restart"**

### Check Environment Variables
1. Go to **"Variables"** tab
2. Make sure `GOOGLE_APPLICATION_CREDENTIALS` is set

---

## 💰 Cost Breakdown

**Free Trial:**
- 500 hours free ($5 credit)
- Perfect for testing

**After Trial:**
- $5/month for 500 execution hours
- Your use case: probably 100-200 hours/month
- **Total: $5/month** (very affordable!)

**What if you exceed?**
- Railway pauses service
- Add more credits
- Service resumes automatically

---

## 🎯 Railway vs Your Current Setup

| Feature | Local (ngrok) | Railway |
|---------|---------------|---------|
| **Uptime** | Only when computer on | 24/7 ✅ |
| **Cost** | Free | $5/month |
| **URL** | Changes each restart | Permanent ✅ |
| **Team Access** | While you're online | Always ✅ |
| **Reliability** | Depends on your computer | Professional ✅ |
| **Deployment** | Manual | Automatic ✅ |

---

## 🚨 Troubleshooting

### "Build failed"
- Check that `package.json` has all dependencies
- Make sure `node_modules` is NOT in git (should be in `.gitignore`)

### "Application failed to respond"
- Check start command is `npm run server-v2`
- Check port: Railway auto-assigns `PORT` environment variable
- Our server uses `process.env.PORT || 3000` ✅

### "GCS upload failed"
- Check `GOOGLE_APPLICATION_CREDENTIALS` is set correctly
- Make sure the JSON is valid (no extra quotes or spaces)
- Verify service account has `Storage Object Admin` role

### "Python errors"
- Railway should auto-install Python
- If issues, add `nixpacks.toml`:
```toml
[phases.setup]
nixPkgs = ["python3", "python3Packages.pip"]
```

---

## 📁 What Gets Deployed

Railway automatically deploys:
- ✅ `server-v2.js` (your main server)
- ✅ `upload-v2.html` (web interface)
- ✅ `package.json` (dependencies)
- ✅ All necessary files

Railway does NOT deploy (thanks to `.gitignore`):
- ❌ `node_modules/` (rebuilt on Railway)
- ❌ `output*/` (temporary local files)
- ❌ Credential files (set as env var instead)

---

## 🔄 Update Your Deployment

After making changes locally:

```bash
# Commit changes
git add .
git commit -m "Updated feature X"

# Push to GitHub
git push

# Railway auto-deploys! ✅
```

Railway watches your GitHub repo and automatically redeploys on every push.

---

## ✅ Success Checklist

After deployment, verify:

- [ ] Can access Railway URL
- [ ] Upload interface loads
- [ ] Can select PDF files
- [ ] Upload starts successfully
- [ ] Job appears in queue
- [ ] Progress bar updates in real-time
- [ ] Files upload to GCS bucket
- [ ] Multiple uploads queue properly
- [ ] Can access from other computers/phones

---

## 🎉 You're Done!

Your voice generator is now running 24/7 on Railway!

**Share this URL with your team:**
```
https://your-app.up.railway.app
```

They can:
1. Upload PDFs anytime
2. Watch real-time progress
3. Get GCS links to generated files
4. Upload multiple files - they queue automatically

---

## 🆘 Need Help?

**Railway Docs:** https://docs.railway.app
**Railway Discord:** https://discord.gg/railway
**This Project Issues:** (your GitHub repo issues)

---

## 📊 Monitoring Your Service

**Check usage:**
1. Railway dashboard
2. Click your service
3. See metrics: CPU, Memory, Network
4. See execution hours used

**Set up alerts:**
1. Railway can email you when credit runs low
2. Go to Account Settings → Notifications

---

## 🎯 Next Steps

1. **Test thoroughly** - Upload a few characters
2. **Monitor costs** - Check usage after a week
3. **Share with team** - Give them the Railway URL
4. **Set up backups** - GCS already handles this! ✅

Railway is the perfect solution for your use case! 🚀

