# 🎨 Deploy to Render.com - FREE & Easy

## ✅ Why Render.com?

- ✅ **100% FREE** tier (750 hours/month)
- ✅ **No credit card** required
- ✅ **Handles subdirectories** (fixes Railway issue)
- ✅ **No timeout limits** - Your long jobs work
- ✅ **Queue system works** perfectly
- ✅ **Easy deployment** - 5 minutes

---

## 🚀 Step-by-Step Deployment

### Step 1: Sign Up for Render

1. Go to: **https://render.com**
2. Click **"Get Started for Free"**
3. Sign up with **GitHub** (easiest)
4. Authorize Render to access your repositories

---

### Step 2: Create New Web Service

1. In Render dashboard, click **"New +"**
2. Select **"Web Service"**
3. Choose **"Build and deploy from a Git repository"**
4. Click **"Connect"** next to your GitHub account
5. Find and select your repository
6. Click **"Connect"**

---

### Step 3: Configure Service Settings

Fill in the following settings:

**Basic Settings:**
- **Name:** `voice-generator` (or any name you like)
- **Region:** `US East (Ohio)` (or closest to you)
- **Branch:** `main` (or your default branch)
- **Root Directory:** `automatic-voice-generator` ⭐ (This fixes the directory issue!)

**Build & Deploy Settings:**
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm run server-v2`

**Instance Type:**
- Select **"Free"** ✅

---

### Step 4: Add Environment Variables

This is the most important step!

1. Scroll down to **"Environment Variables"**
2. Click **"Add Environment Variable"**
3. Add the following:

**Variable 1:**
```
Key: GOOGLE_APPLICATION_CREDENTIALS
Value: {"type":"service_account","project_id":"gen-lang-client-0017980673","private_key_id":"4116e2d12cda76b109e8ee9fc2226cbe92778864","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC5kE5jzeP9SXGKOL0V3HC2MMnNF3fWFlgA1FfYaC9FjH4XN+j6xlP8VqWaxxwNu4SnIIDFZB6NfPbBc2maT/c9+sx0EFkUWfY/OInrGWyqPeClk3tEMNhsb1GvvjRp/KG/9X7tPmJixdZt30ENoDGyuQGBaGk/OIGTx6zzrzXaQGGkiNtAUTRf2Ft/9uSo1O6FvJRj1xlI+V/A1WhvvwAAIqS9OjotmmAQbqNz/Q2ADxBvQ6fy4ibqPo987T37P5FgHFTSoY4FyalmxWelwtlLE8rKJCHqum+2qV7aaeuUnCme715elztYNwjMrz9ITb8h00oiraspnXcaC1g0E2NTAgMBAAECggEAHyT0uzSJwO+sMkY+miYy9qkunZEESHbck1sQWV53HKWtXglAvaI+41nJlrY3Y6im5YQDiN26cQXZxnMv9LnaJdlrqkk6IjvNJCRBpadRQSt8gl3D8Rh/ood2ftgeJPHFVhoGkRwI2EobKLqxSO+rl7MMaSNUkstRmDOJuCaek8AzpHXV+TjGAQA7apLzFZrBpuLjwiq4vR7/1/0PTgw9TYt7hKIEpJqUAUPK4s73ZvDrX+WCsL8/eEE7hEdSxHNFO/ol3Rwf7lPtTX5NYC214eTigsNVU8oVnKVIpZ+AgOLrpxVqB8+u3owyCdld7g3MtshbABOAcXUAOptVZOIMEQKBgQD6caNeIZd+pjfr7BIjUKA/qXwBWuHkOduWqWH64HggYqQYRZgq5m69jBaAS5ODeBGgFahuTClZI3wiOcrBFAghxfhXBnpgMt+AFdZG6OmaYSxq2B06zbvtivkxR+QEzwNVFcHKBEJ/vB5KMAG/zJij8tRlXHc+tfG6eAnRRNGI8QKBgQC9rjCYRH43gUZ/CThH+221oTSnoYeUCwO+MyMmXNduMghZ7+80sw0J9gGr9XUuzNUKNKZ24+YCEpGyYpfMYHXgDibJt2Sh6iUuQIYMvvbrHS5ujtN6LW1x/XITpcRajMab3TTcjfV7DfZPGzU2asI/6F6on/BVjSgtbT4quv9QgwKBgQCxGnVl1ql0NYUsQAffk1+PRYJczvEZXNTtaSDRsbUhacATLfvaspOzVQKAfXF2sgz8wPQX86H12EMrTOUVvt21THM+z2Tw7GjjAg5CnOi9dGRdtjCNafmwlOt9rxIPWHlJzRX6jyKbg+ODoQlLohp7LfiHKWlmHnIv5D1FEL6AcQKBgGL/cBN45BtaGI4jJMHFA2yht5aqItXsrcZucDEMkc/MwzkVllZ+ARcq05KJaODFPYe3FQ7GQXzhbjOZa7rauYr4N9xeIGK1jzRFrvEmFj9+GobPeqaw4Qd2jTyd7w6HnP0qhfV7Dh1smxqMi8hcDghG4mjGGSy9oLOc6a5prOm7AoGAVDlYl+5vZrVPL+eWa/5C5ga87pvOKMLm/Sdb4A7smFMciz0nbfzMNM5qIto3un3YtAbSDSjWSzQudj9Qnj9/3YLocgL+t/6SvjBBT+juyMIpKUEaq3CxQHQ3aNT67DNRRAK5o41Hxhs8ffgyJ+iEkH27n+4Khmd2A/XotKHz7yI=\n-----END PRIVATE KEY-----\n","client_email":"vice-918@gen-lang-client-0017980673.iam.gserviceaccount.com","client_id":"111250242050459371368","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/vice-918%40gen-lang-client-0017980673.iam.gserviceaccount.com","universe_domain":"googleapis.com"}
```

⚠️ **Important:** Copy the entire JSON as one line, no line breaks!

---

### Step 5: Deploy!

1. Click **"Create Web Service"**
2. Render will start building your app
3. Watch the build logs in real-time
4. Wait for: **"Your service is live"** ✅

---

### Step 6: Get Your Public URL

1. Once deployed, you'll see your service URL
2. It will look like: `https://voice-generator-xxxx.onrender.com`
3. Click the URL to test it
4. You should see your upload interface!

---

## 🧪 Test Your Deployment

1. Visit your Render URL
2. Upload a test PDF (format: `TestCharacter_VoiceID123.pdf`)
3. Enter your ElevenLabs API key
4. Watch the queue and progress bars!
5. Verify files upload to GCS

---

## 🔍 Monitor & Debug

### View Logs
1. In Render dashboard, click your service
2. Go to **"Logs"** tab
3. See real-time logs of jobs processing

### Restart Service
1. Go to service page
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

### Update Environment Variables
1. Go to **"Environment"** tab
2. Edit variables as needed
3. Service auto-restarts

---

## 💰 Free Tier Limits

**Render Free Tier:**
- ✅ 750 hours/month (enough for your use case)
- ✅ 512 MB RAM
- ✅ Shared CPU
- ⚠️ Sleeps after 15 minutes of inactivity
- ⚠️ Takes ~30 seconds to wake up

**What "sleeping" means:**
- If no one uses the app for 15 minutes, server pauses
- When someone visits, it takes ~30 seconds to wake up
- Once awake, works normally
- For your use case (occasional uploads), this is fine!

---

## 🔄 Update Your App

After making changes locally:

```bash
# Commit and push changes
git add .
git commit -m "Updated feature"
git push

# Render auto-deploys! ✅
```

Render watches your GitHub repo and redeploys automatically.

---

## 🆚 Render vs Railway vs ngrok

| Feature | Render FREE | Railway | ngrok |
|---------|-------------|---------|-------|
| **Cost** | FREE ✅ | $5/month | FREE |
| **Credit Card** | Not needed ✅ | Required | Not needed |
| **Uptime** | Sleeps after 15min | Always on | When computer on |
| **URL** | Permanent ✅ | Permanent | Changes |
| **Setup** | 5 minutes | 5 minutes | 30 seconds |
| **Best For** | Production (budget) | Production (premium) | Testing |

---

## 🚨 Troubleshooting

### "Build failed"
- Check Root Directory is set to: `automatic-voice-generator`
- Verify Build Command: `npm install`
- Verify Start Command: `npm run server-v2`

### "Service unavailable"
- Service might be sleeping (free tier)
- Wait 30 seconds for it to wake up
- Check logs for errors

### "GCS upload failed"
- Verify `GOOGLE_APPLICATION_CREDENTIALS` environment variable
- Make sure JSON is valid (no extra spaces/quotes)
- Check service account has `Storage Object Admin` role

### "Python errors"
- Render auto-installs Python
- If issues persist, check logs for specific error

---

## ✅ Success Checklist

After deployment, verify:

- [ ] Can access Render URL
- [ ] Upload interface loads
- [ ] Can select PDF files
- [ ] Upload starts successfully
- [ ] Job appears in queue
- [ ] Progress bar updates
- [ ] Files upload to GCS bucket
- [ ] Multiple uploads queue properly

---

## 🎉 You're Done!

Your voice generator is now running on Render for FREE!

**Share this URL with your team:**
```
https://voice-generator-xxxx.onrender.com
```

They can upload PDFs anytime, and the system will:
1. Queue them automatically
2. Process one by one
3. Show real-time progress
4. Upload to Google Cloud Storage
5. Provide download links

---

## 📊 Monitoring Usage

**Check your usage:**
1. Render dashboard → Your service
2. See metrics: CPU, Memory, Requests
3. Monitor free tier hours used

**Upgrade if needed:**
- If you exceed 750 hours/month
- Upgrade to paid plan ($7/month)
- Get always-on service (no sleeping)

---

## 🎯 Next Steps

1. **Test thoroughly** - Upload several characters
2. **Share with team** - Give them the Render URL  
3. **Monitor usage** - Check hours used weekly
4. **Consider upgrade** - If you need always-on service

Render.com is perfect for your voice generation system! 🚀
