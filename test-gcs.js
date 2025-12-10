import { Storage } from "@google-cloud/storage";
import fs from "fs";

console.log('\n╔═══════════════════════════════════════════════════════════════════════╗');
console.log('║                                                                       ║');
console.log('║           ☁️  TESTING GOOGLE CLOUD STORAGE ☁️                        ║');
console.log('║                                                                       ║');
console.log('╚═══════════════════════════════════════════════════════════════════════╝\n');

const BUCKET_NAME = 'vice-voices';

// Check for credentials
const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!credPath) {
  console.log('❌ GOOGLE_APPLICATION_CREDENTIALS not set!\n');
  console.log('📋 To fix this:\n');
  console.log('1. Download service account key from:');
  console.log('   https://console.cloud.google.com/iam-admin/serviceaccounts\n');
  console.log('2. Save it as gcs-key.json in this directory\n');
  console.log('3. Set environment variable:');
  console.log('   export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/gcs-key.json"\n');
  console.log('4. Run this test again:\n');
  console.log('   node test-gcs.js\n');
  console.log('📖 See GCS_SIMPLE_SETUP.md for detailed instructions\n');
  process.exit(1);
}

console.log('✅ Credentials found:', credPath);

if (!fs.existsSync(credPath)) {
  console.log('❌ Credentials file does not exist:', credPath);
  console.log('\n📖 See GCS_SIMPLE_SETUP.md for setup instructions\n');
  process.exit(1);
}

console.log('✅ Credentials file exists\n');

// Initialize Storage
let storage;
let bucket;

try {
  console.log('🔌 Connecting to Google Cloud Storage...');
  storage = new Storage();
  bucket = storage.bucket(BUCKET_NAME);
  console.log(`✅ Connected to bucket: ${BUCKET_NAME}\n`);
} catch (error) {
  console.log('❌ Failed to initialize GCS:', error.message);
  console.log('\n📖 See GCS_SIMPLE_SETUP.md for setup instructions\n');
  process.exit(1);
}

// Test bucket access
async function testBucketAccess() {
  try {
    console.log('🔍 Testing bucket access...');
    const [exists] = await bucket.exists();
    
    if (!exists) {
      console.log('❌ Bucket does not exist or you don\'t have access');
      console.log(`   Bucket: ${BUCKET_NAME}`);
      console.log('\n📋 Make sure:');
      console.log('   1. Bucket exists: https://console.cloud.google.com/storage/browser');
      console.log('   2. Service account has Storage Object Admin role\n');
      return false;
    }
    
    console.log('✅ Bucket exists and accessible\n');
    return true;
  } catch (error) {
    console.log('❌ Error accessing bucket:', error.message);
    return false;
  }
}

// Test file upload
async function testFileUpload() {
  try {
    console.log('📤 Testing file upload...');
    
    // Create a test audio buffer (empty MP3)
    const testBuffer = Buffer.from([
      0xFF, 0xFB, 0x90, 0x00, // MP3 header
      0x00, 0x00, 0x00, 0x00
    ]);
    
    const testFileName = `test-${Date.now()}.mp3`;
    const testPath = `test/${testFileName}`;
    
    const file = bucket.file(testPath);
    
    await file.save(testBuffer, {
      metadata: {
        contentType: 'audio/mpeg',
        cacheControl: 'public, max-age=3600',
      },
    });
    
    console.log(`✅ File uploaded: ${testPath}\n`);
    return { file, testPath };
  } catch (error) {
    console.log('❌ Upload failed:', error.message);
    console.log('\n📋 Make sure service account has write permissions\n');
    return null;
  }
}

// Test making file public
async function testMakePublic(file, testPath) {
  try {
    console.log('🌐 Testing public access...');
    
    await file.makePublic();
    
    const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${testPath}`;
    console.log('✅ File is now public');
    console.log(`   URL: ${publicUrl}\n`);
    
    return publicUrl;
  } catch (error) {
    console.log('⚠️  Could not make file public:', error.message);
    console.log('   This is OK - you can set bucket-wide public access instead\n');
    return null;
  }
}

// Test file deletion (cleanup)
async function testFileDelete(file, testPath) {
  try {
    console.log('🗑️  Cleaning up test file...');
    await file.delete();
    console.log(`✅ Test file deleted: ${testPath}\n`);
  } catch (error) {
    console.log('⚠️  Could not delete test file:', error.message);
    console.log('   (This is OK - you can delete it manually)\n');
  }
}

// List existing files
async function listFiles() {
  try {
    console.log('📂 Listing existing files in bucket...');
    const [files] = await bucket.getFiles({ maxResults: 10 });
    
    if (files.length === 0) {
      console.log('   (Bucket is empty)\n');
    } else {
      console.log(`   Found ${files.length} file(s):`);
      files.forEach(file => {
        console.log(`   - ${file.name}`);
      });
      console.log();
    }
  } catch (error) {
    console.log('⚠️  Could not list files:', error.message, '\n');
  }
}

// Run all tests
async function runTests() {
  console.log('═'.repeat(75));
  console.log('RUNNING TESTS\n');
  
  // Test 1: Bucket Access
  const bucketOk = await testBucketAccess();
  if (!bucketOk) {
    console.log('❌ TESTS FAILED - Cannot access bucket\n');
    process.exit(1);
  }
  
  // Test 2: List files
  await listFiles();
  
  // Test 3: Upload
  const uploadResult = await testFileUpload();
  if (!uploadResult) {
    console.log('❌ TESTS FAILED - Cannot upload files\n');
    process.exit(1);
  }
  
  const { file, testPath } = uploadResult;
  
  // Test 4: Make public
  const publicUrl = await testMakePublic(file, testPath);
  
  // Test 5: Cleanup
  await testFileDelete(file, testPath);
  
  // Summary
  console.log('═'.repeat(75));
  console.log('\n🎉 ALL TESTS PASSED!\n');
  console.log('✅ Your Google Cloud Storage is configured correctly!\n');
  console.log('📊 Summary:');
  console.log(`   Bucket: ${BUCKET_NAME}`);
  console.log(`   Status: Accessible ✅`);
  console.log(`   Upload: Working ✅`);
  console.log(`   Public Access: ${publicUrl ? 'Working ✅' : 'Needs setup ⚠️'}`);
  console.log();
  
  if (!publicUrl) {
    console.log('💡 To enable public access for all files:');
    console.log('   1. Go to: https://console.cloud.google.com/storage/browser/vice-voices');
    console.log('   2. Click "Permissions" tab');
    console.log('   3. Click "Grant Access"');
    console.log('   4. Add: allUsers');
    console.log('   5. Role: Storage Object Viewer');
    console.log();
  }
  
  console.log('🚀 You can now use GCS with your scripts!');
  console.log();
  console.log('Next steps:');
  console.log('   • Generate with GCS: node generate_with_gcs.js');
  console.log('   • Upload existing: node upload-to-gcs.js');
  console.log('   • Start server: npm run server');
  console.log();
}

// Run
runTests().catch(error => {
  console.error('\n❌ Fatal error:', error);
  console.log('\n📖 See GCS_SIMPLE_SETUP.md for help\n');
  process.exit(1);
});

