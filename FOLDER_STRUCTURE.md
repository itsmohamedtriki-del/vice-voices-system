# 📁 Organized Folder Structure

## ✅ Updated! Files Now Organized by Category

Your audio files will now be automatically organized into **category folders** for easy browsing and management.

---

## 🗂️ Output Structure

After running the full generation, you'll have:

```
output_jimmy_audio/
├── A._Greeting/
│   ├── 0002.mp3  "Yo—pick up, pick up..."
│   ├── 0003.mp3  "Heyhey—listen, quick question..."
│   ├── 0004.mp3  "It's me—Slippin' Jimmy..."
│   ├── 0005.mp3  "Answer faster next time..."
│   └── 0006.mp3  "Shhh—talk soft..."
│
├── B._Buying_-_Selling/
│   ├── 0007.mp3
│   ├── 0008.mp3
│   ├── 0009.mp3
│   └── ...
│
├── C._Negotiating/
│   ├── 0030.mp3
│   ├── 0031.mp3
│   └── ...
│
├── D._Threats/
│   ├── 0059.mp3
│   ├── 0060.mp3
│   └── ...
│
├── Purchase_Requests_-_$10/
│   ├── 0125.mp3  "$10 rock—can you do that?"
│   ├── 0126.mp3  "$10 rock—possible?"
│   ├── 0127.mp3  "Can you swing a ten spot?"
│   └── ... (40 files)
│
├── Purchase_Requests_-_$20/
│   ├── 0166.mp3  "Can you do a skinny twenty..."
│   ├── 0167.mp3  "Skinny twenty—fast?"
│   └── ... (40 files)
│
├── Purchase_Requests_-_$50/
│   └── ... (40 files)
│
├── Purchase_Requests_-_$100/
│   └── ... (40 files)
│
├── Purchase_Requests_-_$150/
│   └── ... (40 files)
│
├── Purchase_Requests_-_$200/
│   └── ... (40 files)
│
├── Locations/
│   ├── Maple_&_Third_payphone/
│   ├── Under_Cedar_Overpass/
│   ├── Bus_Stop_K7/
│   ├── Riverview_Laundromat/
│   └── ... (152 location files)
│
├── User_Insults/
│   ├── 0919.mp3  "Stop chewing my ear..."
│   ├── 0920.mp3  "Quit nibbling my minutes..."
│   └── ... (120 files)
│
├── Escalations_-_Angry_-_Cold_-_Explosive/
│   ├── 1138.mp3  "Don't raise your voice..."
│   └── ... (72 files)
│
├── Apologies_-_Grudging_-_Flat_-_Chill/
│   ├── 1309.mp3  "Fine—my bad, I got hot."
│   └── ... (48 files)
│
├── Wrong_Drug_Responses/
│   ├── 1405.mp3  "Nah, not my lane—keep that."
│   ├── 1406.mp3  "I said glass, not bedtime stories."
│   └── ...
│
├── Quick_Yes/
│   ├── 1669.mp3  "Yeah."
│   ├── 1670.mp3  "Yep—do it."
│   ├── 1671.mp3  "Say less: yes."
│   └── ... (53 files)
│
├── Quick_No/
│   ├── 1772.mp3  "Nope."
│   ├── 1773.mp3  "Nah, not that."
│   ├── 1774.mp3  "Pass."
│   └── ... (54 files)
│
├── Verbal_Fillers_-_Short_Pauses/
│   ├── 1965.mp3  "mmm"
│   ├── 1966.mp3  "mm"
│   ├── 1967.mp3  "mhm"
│   └── ... (101 files)
│
├── Erratic_-_Impulsive_Filler/
│   └── ... (58 files)
│
├── Combined/
│   └── ... (392 combined responses)
│
└── ... (69+ total category folders)
```

---

## 🎯 Benefits of This Structure

### ✅ Easy to Browse
- All greetings in one folder
- All purchase requests organized by price
- All threats together, etc.

### ✅ Easy Development
```javascript
// Load all greetings
const greetingFiles = fs.readdirSync('./output_jimmy_audio/A._Greeting/');

// Load all $20 purchase requests
const twenty = fs.readdirSync('./output_jimmy_audio/Purchase_Requests_-_$20/');
```

### ✅ Clear Organization
- See exactly how many responses per category
- Find specific types of responses instantly
- Perfect for testing individual categories

### ✅ S3 Organized Too
If you enable S3 upload, the structure is maintained:
```
s3://your-bucket/jimmy-audio/
├── A._Greeting/
│   ├── 0002.mp3
│   ├── 0003.mp3
│   └── ...
├── Purchase_Requests_-_$20/
│   └── ...
└── ...
```

---

## 📊 Folder Naming Rules

Category names are cleaned for filesystem compatibility:

| Original | Cleaned Folder Name |
|----------|-------------------|
| `A. Greeting` | `A._Greeting` |
| `B. Buying / Selling` | `B._Buying_-_Selling` |
| `Purchase Requests — $20` | `Purchase_Requests_-_$20` |
| `Escalations — Angry / Cold` | `Escalations_-_Angry_-_Cold` |

**Rules applied:**
- Spaces → Underscores (`_`)
- Slashes (`/`) → Dashes (`-`)
- Special chars → Dashes (`-`)
- Safe for all operating systems ✅

---

## 🗂️ Expected Category Folders (69+ folders)

Here's what you'll get:

1. `A._Greeting` (5 files)
2. `B._Buying_-_Selling` (5 files)
3. `C._Negotiating` (5 files)
4. `D._Threats` (5 files)
5. `E._Favors` (5 files)
6. `F._Loyalty` (5 files)
7. `G._Betrayal` (5 files)
8. `H._Small_Talk` (5 files)
9. `I._Emotional_Breakdown` (245 files) ⭐ Largest
10. `Purchase_Requests_-_$10` (40 files)
11. `Purchase_Requests_-_$20` (40 files)
12. `Purchase_Requests_-_$50` (40 files)
13. `Purchase_Requests_-_$100` (40 files)
14. `Purchase_Requests_-_$150` (40 files)
15. `Purchase_Requests_-_$200` (40 files)
16. `Locations` (152 files)
17. `User_Insults` (120 files)
18. `Escalations_-_Angry_-_Cold_-_Explosive` (72 files)
19. `Apologies_-_Grudging_-_Flat_-_Chill` (48 files)
20. `Wrong_Drug_Responses` (3 files)
21. `Off-Topic_Responses` (3 files)
22. `Timewasters` (16 files)
23. `Call_Endings_-_Success_-_Timeout` (48 files)
24. `Erratic_-_Impulsive_Filler` (58 files)
25. `Quick_Yes` (53 files)
26. `Quick_No` (54 files)
27. `Verbal_Fillers_-_Short_Pauses` (101 files)
28. `Quick_Affirmations_-_ok_cool` (40 files)
29. `Quick_Pushbacks_-_not_cool` (40 files)
30. `Caller_ID_Variants_-_it's_me_Jimmy` (20 files)
31. `Not_on_Topic_-_Jimmy_Doesn't_Understand` (60 files)
32. ... and 38+ more categories!

---

## 💡 Using in Your App

### Option 1: Load by Category Folder

```javascript
import fs from 'fs';
import path from 'path';

const audioBase = './output_jimmy_audio/';

// Get random greeting
function getRandomGreeting() {
  const folder = path.join(audioBase, 'A._Greeting');
  const files = fs.readdirSync(folder);
  const random = files[Math.floor(Math.random() * files.length)];
  return path.join(folder, random);
}

// Get random $20 purchase request
function getPurchaseRequest20() {
  const folder = path.join(audioBase, 'Purchase_Requests_-_$20');
  const files = fs.readdirSync(folder);
  const random = files[Math.floor(Math.random() * files.length)];
  return path.join(folder, random);
}
```

### Option 2: Use JSON Mapping (Recommended)

```javascript
import jimmyLines from './jimmy_lines.json';

// Find by ID
function getAudioPath(id) {
  const line = jimmyLines.find(l => l.id === id);
  const folderName = sanitizeCategoryName(line.category);
  return `./output_jimmy_audio/${folderName}/${id}.mp3`;
}

// Find by category
function getRandomFromCategory(category) {
  const matches = jimmyLines.filter(l => l.category === category);
  const random = matches[Math.floor(Math.random() * matches.length)];
  const folderName = sanitizeCategoryName(random.category);
  return `./output_jimmy_audio/${folderName}/${random.id}.mp3`;
}
```

---

## 📦 Test Files

Check your test output now:

```bash
cd /Users/macbookpro/automatic-voice-generator
tree test_output
```

You'll see:
```
test_output/
├── A._Greeting/
│   ├── 0003.mp3
│   ├── 0004.mp3
│   ├── 0005.mp3
│   └── 0006.mp3
└── B._Buying_-_Selling/
    └── 0007.mp3
```

---

## 🚀 Ready to Generate!

Everything is set up with organized folders. When you run:

```bash
npm start
```

You'll get **2,397 MP3 files** organized into **69+ category folders**!

Each category will have its own folder, making it super easy to:
- Browse specific types of responses
- Test individual categories
- Load responses by context
- Organize in your app

**Much better than 2,397 files in one flat folder!** 🎉

