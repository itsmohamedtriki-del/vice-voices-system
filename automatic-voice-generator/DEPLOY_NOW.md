# 🚀 Deploy for Your Team - 2 Options

## ⚡ Option 1: Quick Setup with ngrok (2 minutes)

**Perfect for immediate access. Your team can start uploading right away!**

### Step 1: Start your server
```bash
npm run server
```

### Step 2: In a new terminal, expose to internet
```bash
npx ngrok http 3000
```

### Step 3: Share the URL
You'll see something like:
```
Forwarding https://abc123.ngrok.io -> http://localhost:3000
```

**Share this URL with your team:** `https://abc123.ngrok.io`

✅ **Done!** Your team can now access the upload page from anywhere!

**Note:** Keep both terminals open. If you close them or restart, the URL will change.

---

## 🚂 Option 2: Deploy to Railway (10 minutes, permanent URL)

**Best for production. Get a permanent URL that works 24/7!**

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway
```bash
railway login
```
(Opens browser - create free account or login)

### Step 3: Initialize project
```bash
railway init
```
- Choose: "Create new project"
- Name it: "voice-generator" (or whatever you like)

### Step 4: Add Python buildpack
```bash
railway variables set NIXPACKS_BUILD_CMD="npm install"
railway variables set NIXPACKS_INSTALL_CMD="npm install && pip3 install PyPDF2"
```

### Step 5: Deploy!
```bash
railway up
```

### Step 6: Get your URL
```bash
railway domain
```

Or generate a custom domain:
```bash
railway domain generate
```

**Your app is now live!** Example: `https://voice-generator-production.up.railway.app`

✅ **Permanent URL - works 24/7!**
✅ **$5 free credit included**
✅ **~$10-20/month after that**

---

## 📋 What Your Team Gets

After deploying with either option, your team can:

1. **Open the URL** in their browser
2. **Upload their character PDF** (format: `VoiceID_CharacterName.pdf`)
3. **Enter their ElevenLabs API key**
4. **Click Generate**
5. **Audio files generated automatically!**

---

## 🎯 Which Should I Choose?

| Feature | ngrok (Option 1) | Railway (Option 2) |
|---------|------------------|-------------------|
| **Setup Time** | 2 minutes | 10 minutes |
| **Cost** | Free | $5 free, then ~$10/month |
| **URL** | Changes on restart | Permanent |
| **Uptime** | When your computer is on | 24/7 |
| **Best For** | Testing/Development | Production/Team |

**My recommendation:**
- **Start with ngrok** - test with your team today
- **Switch to Railway** - when you're ready for production

---

## 🆘 Troubleshooting

### ngrok issues:

**URL changes every time?**
- This is normal for free ngrok
- Upgrade to ngrok paid ($8/month) for static URLs
- Or use Railway for permanent URL

**Connection refused?**
- Make sure `npm run server` is running
- Check port 3000 is not blocked by firewall

### Railway issues:

**Build failed?**
- Make sure you ran the variables commands
- Check logs: `railway logs`

**Can't access uploaded files?**
- Railway has ephemeral storage
- Consider adding S3 for permanent storage
- Or download files immediately after generation

---

## 📊 Current Status

Your system is **ready to deploy** with:

✅ Upload interface (`upload.html`)  
✅ Server with processing (`server.js`)  
✅ PDF extraction (PyPDF2)  
✅ ElevenLabs integration  
✅ Category folder organization  
✅ Background processing  

**Everything works!** Just pick a deployment method above.

---

## 🎉 Quick Start Commands

**For ngrok (immediate):**
```bash
# Terminal 1
npm run server

# Terminal 2
npx ngrok http 3000

# Share the https://xxx.ngrok.io URL with team
```

**For Railway (production):**
```bash
npm install -g @railway/cli
railway login
railway init
railway up
railway domain
# Share the railway URL with team
```

**That's it!** Your team can start uploading characters! 🚀

