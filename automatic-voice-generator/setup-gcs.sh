#!/bin/bash

# Google Cloud Storage Setup Script

echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                       ║"
echo "║           ☁️  GOOGLE CLOUD STORAGE SETUP ☁️                          ║"
echo "║                                                                       ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud SDK not found!"
    echo ""
    echo "Please install it first:"
    echo "  macOS: brew install --cask google-cloud-sdk"
    echo "  Or visit: https://cloud.google.com/sdk/docs/install"
    echo ""
    exit 1
fi

echo "✅ Google Cloud SDK found"
echo ""

# Authenticate
echo "Step 1: Authenticating..."
echo "   This will open a browser window for login"
echo ""
gcloud auth application-default login

if [ $? -ne 0 ]; then
    echo "❌ Authentication failed"
    exit 1
fi

echo ""
echo "✅ Authentication successful!"
echo ""

# Test bucket access
echo "Step 2: Testing bucket access..."
echo "   Checking gs://vice-voices..."
echo ""

gsutil ls gs://vice-voices/ > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Bucket access confirmed!"
    echo ""
    
    # Show bucket contents
    echo "📦 Current bucket contents:"
    gsutil ls gs://vice-voices/
    echo ""
    
    # Show bucket size
    echo "📊 Bucket size:"
    gsutil du -sh gs://vice-voices/
    echo ""
else
    echo "⚠️  Could not access bucket. This might be normal if it's empty."
    echo "   Make sure you have permissions for: gs://vice-voices"
    echo ""
fi

# Make bucket public (optional)
echo "Step 3: Configure public access..."
read -p "   Make files publicly accessible? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "   Setting public access..."
    gsutil iam ch allUsers:objectViewer gs://vice-voices
    echo "   ✅ Bucket configured for public access"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║                      ✅ SETUP COMPLETE! ✅                           ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Your Google Cloud Storage is ready!"
echo ""
echo "📦 Bucket: gs://vice-voices"
echo "🌐 Console: https://console.cloud.google.com/storage/browser/vice-voices"
echo ""
echo "Next steps:"
echo "  1. Generate audio with GCS upload:"
echo "     $ node generate_with_gcs.js"
echo ""
echo "  2. Or upload existing files:"
echo "     $ gsutil -m cp -r output_jimmy_audio/* gs://vice-voices/SlippinJimmy/"
echo ""
echo "  3. Access files at:"
echo "     https://storage.googleapis.com/vice-voices/SlippinJimmy/..."
echo ""

