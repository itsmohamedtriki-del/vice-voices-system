# 🎤 Quick Guide for Team Members

## Upload Your Character in 4 Easy Steps!

---

### Step 1: Prepare Your PDF 📄

Create your PDF with your character's dialogue library (same format as Jimmy).

**IMPORTANT - Name your file correctly:**
```
VoiceID_CharacterName.pdf
```

**Examples:**
- `eT3X4VCP0uNoyW4G4qHy_SlippinJimmy.pdf` ✅
- `abc123xyz789_WalterWhite.pdf` ✅
- `myvoice_SaulGoodman.pdf` ✅

**Where to get Voice ID:**
- Go to ElevenLabs dashboard
- Copy your character's voice ID
- It's the long string in the voice URL

---

### Step 2: Open the Upload Page 🌐

Open your browser and go to:
```
http://localhost:3000
```

You'll see a beautiful purple upload interface!

---

### Step 3: Upload Your PDF 📤

**Option A:** Click the upload area
**Option B:** Drag and drop your PDF

The system will automatically show:
- ✅ Voice ID extracted from filename
- ✅ Character Name extracted from filename
- ✅ File size

---

### Step 4: Generate! 🚀

1. Enter your ElevenLabs API key
2. Click "Generate Voice Files"
3. Wait for confirmation
4. Done!

**Your files will be in:**
```
output/YourCharacterName/
├── Category_1/
│   ├── 0001.mp3
│   ├── 0002.mp3
│   └── ...
└── Category_2/
    └── ...
```

---

## ⏱️ How Long Does It Take?

| Number of Lines | Time |
|----------------|------|
| 100 lines | ~8 minutes |
| 500 lines | ~40 minutes |
| 1,000 lines | ~1.5 hours |
| 2,000+ lines | ~2-3 hours |

**Note:** The server responds immediately, but generation runs in the background!

---

## 🐛 Troubleshooting

### "Invalid filename format"
- Make sure filename is: `VoiceID_CharacterName.pdf`
- Must have exactly one underscore `_`
- No spaces in the name

### "API Error"
- Check your API key is correct (starts with `sk_`)
- Check you have enough quota on ElevenLabs
- Verify your Voice ID is correct

### Need Help?
Contact the admin or check `UPLOAD_SYSTEM.md` for full documentation.

---

## 📋 Checklist

Before uploading, make sure:

- [ ] PDF follows the standard dialogue format
- [ ] Filename is `VoiceID_CharacterName.pdf`
- [ ] Voice ID is correct from ElevenLabs
- [ ] You have your API key ready
- [ ] You have enough ElevenLabs quota

---

## 🎉 That's It!

Super simple - just upload and generate! 

The system handles everything else automatically:
- ✅ Extracts text from your PDF
- ✅ Organizes by category
- ✅ Generates all audio files
- ✅ Saves in organized folders

**Happy generating!** 🎤

