# 🎤 Voice Character Upload System

## ✅ What This Is

A **web-based upload system** that allows team members to easily generate voice files for **any character** by simply uploading a PDF!

---

## 🚀 How to Start the Server

```bash
cd /Users/macbookpro/automatic-voice-generator
npm run server
```

**You'll see:**
```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║       🎤  Voice Character Generator - Server Running  🎤      ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

   📡 Server:  http://localhost:3000
   📁 Upload:  http://localhost:3000/

   Ready to accept PDF uploads!
```

---

## 🌐 Access the Upload Page

Open your browser and go to:
```
http://localhost:3000
```

You'll see a beautiful upload interface! 🎨

---

## 📋 PDF Naming Format (IMPORTANT!)

Your team members MUST name their PDF files in this exact format:

```
VoiceID_CharacterName.pdf
```

### ✅ Examples:

| Filename | Voice ID | Character Name |
|----------|----------|----------------|
| `eT3X4VCP0uNoyW4G4qHy_SlippinJimmy.pdf` | `eT3X4VCP0uNoyW4G4qHy` | `SlippinJimmy` |
| `abc123xyz789_WalterWhite.pdf` | `abc123xyz789` | `WalterWhite` |
| `voiceId12345_SaulGoodman.pdf` | `voiceId12345` | `SaulGoodman` |
| `xYz789AbC_MikEhrmantraut.pdf` | `xYz789AbC` | `MikEhrmantraut` |

### 🔍 What Gets Extracted:

The system automatically parses the filename:
- **Everything before the first `_`** = Voice ID (for ElevenLabs API)
- **Everything after the first `_`** (minus `.pdf`) = Character Name

---

## 📄 PDF Content Format

The PDF should follow the same format as the Jimmy PDF:

```
1) Character Profile
Name: Character Name
Age: XX
Role: ...

2) Voice Creation Prompt
...

3) Dialogue Response Library — A. Category Name
Response line 1
Response line 2
Response line 3

3) Dialogue Response Library — B. Another Category
Response line 1
Response line 2
...
```

**The system will:**
1. Extract all dialogue lines
2. Organize by category
3. Generate audio for each line
4. Save in organized folders

---

## 🎯 How Team Members Use It

### Step 1: Prepare the PDF
1. Create dialogue library in the standard format
2. Get the ElevenLabs Voice ID for their character
3. Name file: `VoiceID_CharacterName.pdf`

### Step 2: Upload
1. Open `http://localhost:3000`
2. Click the upload area or drag & drop the PDF
3. System automatically extracts Voice ID and Character Name

### Step 3: Enter API Key
1. Enter their ElevenLabs API key
2. (Or share a team API key)

### Step 4: Generate!
1. Click "Generate Voice Files"
2. System processes automatically
3. Audio files generated in organized folders

---

## 📁 Output Structure

Files are saved to:
```
output/CharacterName/
├── Category_1/
│   ├── 0001.mp3
│   ├── 0002.mp3
│   └── ...
├── Category_2/
│   └── ...
└── ...
```

**Example:**
```
output/
├── SlippinJimmy/
│   ├── A._Greeting/
│   │   └── ... (MP3 files)
│   └── Purchase_Requests_-_$20/
│       └── ... (MP3 files)
│
├── WalterWhite/
│   ├── Threats/
│   │   └── ... (MP3 files)
│   └── Business_Talk/
│       └── ... (MP3 files)
│
└── SaulGoodman/
    ├── Legal_Jargon/
    │   └── ... (MP3 files)
    └── Jokes/
        └── ... (MP3 files)
```

Each character gets their own organized folder tree!

---

## 🔒 Security Notes

### API Key Handling
- API keys are NOT stored
- Used only for the current generation
- Team members can use their own keys
- Or share a team key (not recommended for production)

### Production Recommendations:
```javascript
// In server.js, you could add:
const TEAM_API_KEY = process.env.ELEVENLABS_API_KEY;

// Then users don't need to enter it
```

---

## ⚙️ Server Configuration

### Port
Default: `3000`

To change:
```javascript
// In server.js
const PORT = 8080; // Your preferred port
```

### File Size Limit
Default: `50MB`

To change:
```javascript
// In server.js, multer config
limits: { fileSize: 100 * 1024 * 1024 } // 100MB
```

---

## 🛠️ Technical Details

### What Happens When You Upload:

1. **File Upload** ✅
   - PDF uploaded to `/uploads/` folder
   - Filename validated

2. **Extraction** ✅
   - Voice ID and Character Name extracted from filename
   - PDF text extracted using PyPDF2
   - Responses parsed and organized by category
   - Saved to JSON

3. **Generation** ✅
   - Each response sent to ElevenLabs API
   - Audio files generated with the specified Voice ID
   - Saved to organized category folders

4. **Cleanup** ✅
   - Temporary files deleted
   - Upload folder cleared

---

## 📊 Processing Time

Depends on number of responses:

| Responses | Estimated Time |
|-----------|----------------|
| 100 | 6-8 minutes |
| 500 | 30-40 minutes |
| 1,000 | 1-1.5 hours |
| 2,000 | 2-3 hours |

**Note:** Server responds immediately with "Generation started" - the process runs in the background!

---

## 🐛 Troubleshooting

### Problem: "Invalid filename format"
**Solution:** Ensure filename is `VoiceID_CharacterName.pdf`

### Problem: "API Error"
**Solution:** 
- Check API key is valid
- Check API quota on ElevenLabs
- Verify Voice ID exists

### Problem: "No responses extracted"
**Solution:** 
- Check PDF format matches template
- Ensure PDF has text (not scanned images)

### Problem: Server won't start
**Solution:**
```bash
# Reinstall dependencies
npm install

# Check for port conflicts
lsof -i :3000

# Try different port in server.js
```

---

## 🎨 Customization

### Change UI Colors
Edit `upload.html`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
/* Change to your brand colors */
```

### Add Team Logo
In `upload.html`:
```html
<h1>
  <img src="logo.png" alt="Logo"> 
  Voice Character Generator
</h1>
```

### Custom Validation
In `server.js`, add validation:
```javascript
// Validate character name format
if (!/^[a-zA-Z0-9_]+$/.test(characterName)) {
  return res.status(400).json({ 
    error: 'Character name must be alphanumeric' 
  });
}
```

---

## 📝 Example Workflow

### For Team Member "Sarah" adding "Gus Fring":

1. **Prepares PDF:**
   - Creates `abc123_GusFring.pdf`
   - Contains all Gus dialogue in standard format

2. **Uploads:**
   - Opens `http://localhost:3000`
   - Drags PDF to upload area
   - Sees: Voice ID: `abc123`, Character: `GusFring`

3. **Enters API Key:**
   - Enters her ElevenLabs API key
   - Clicks "Generate Voice Files"

4. **Waits:**
   - Server confirms "Generation started"
   - Process runs in background
   - Takes ~2-3 hours for 2000 lines

5. **Gets Files:**
   - Files saved to `/output/GusFring/`
   - Organized by category
   - Ready to use!

---

## 🚀 Production Deployment

### Option 1: Local Network
```bash
# In server.js, change:
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server: http://YOUR_IP:${PORT}`);
});
```

Now accessible from other computers on your network!

### Option 2: Deploy to Cloud
- Deploy to Heroku, AWS, or DigitalOcean
- Add authentication (optional)
- Use environment variables for API keys

### Option 3: Docker
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN pip3 install PyPDF2
COPY . .
EXPOSE 3000
CMD ["npm", "run", "server"]
```

---

## 📚 Files Created

- ✅ `upload.html` - Beautiful web upload interface
- ✅ `server.js` - Node.js server handling uploads
- ✅ `package.json` - Updated with server dependencies

---

## 🎯 Summary

You now have a **complete web-based system** where anyone on your team can:

1. Upload a PDF for any character
2. System automatically extracts Voice ID and name
3. Generates all audio files with proper organization
4. No command-line knowledge needed!

**Perfect for team collaboration!** 🎉

---

## ▶️ Quick Start for Team Members

Send them this:

```
🎤 Voice Character Generator

1. Open: http://localhost:3000
2. Upload your PDF (format: VoiceID_CharacterName.pdf)
3. Enter your ElevenLabs API key
4. Click "Generate Voice Files"
5. Wait for completion (check server console)
6. Files in: /output/YourCharacter/

Done! 🎉
```

