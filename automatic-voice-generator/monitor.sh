#!/bin/bash

# Monitor Jimmy Voice Generation Progress

clear

echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                       ║"
echo "║           🎤  JIMMY VOICE GENERATION - LIVE MONITOR  🎤              ║"
echo "║                                                                       ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if progress file exists
if [ -f "progress.json" ]; then
    COMPLETED=$(grep -o '"completed"' progress.json | wc -l)
    echo "📊 PROGRESS:"
    echo "   Files completed: $COMPLETED / 2,397"
    PERCENT=$(echo "scale=2; ($COMPLETED / 2397) * 100" | bc)
    echo "   Progress: ${PERCENT}%"
    echo ""
fi

# Count folders
FOLDERS=$(ls -d output_jimmy_audio/*/ 2>/dev/null | wc -l)
echo "📁 CATEGORY FOLDERS CREATED: $FOLDERS"
echo ""

# Count MP3 files
MP3_COUNT=$(find output_jimmy_audio -name "*.mp3" 2>/dev/null | wc -l)
echo "🎵 TOTAL MP3 FILES: $MP3_COUNT"
echo ""

# Show latest progress
echo "📝 LATEST PROGRESS (last 10 lines):"
echo "════════════════════════════════════════════════════════════════════════"
tail -10 generation.log 2>/dev/null || echo "Generation log not found"
echo ""

echo "════════════════════════════════════════════════════════════════════════"
echo ""
echo "💡 Commands:"
echo "   Watch live:  tail -f generation.log"
echo "   See folders: ls output_jimmy_audio/"
echo "   This script: ./monitor.sh"
echo ""

