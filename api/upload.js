// Vercel Serverless Function for Character Upload
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the uploaded file
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const pdfFile = files.pdf?.[0];
    const voiceId = fields.voiceId?.[0];
    const characterName = fields.characterName?.[0];
    const apiKey = fields.apiKey?.[0];

    if (!pdfFile || !voiceId || !characterName || !apiKey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // For Vercel, we'll return immediately and use a webhook/queue for processing
    // This is a simplified version that returns a job ID
    
    const jobId = `${Date.now()}_${characterName}`;

    // In production, you'd:
    // 1. Upload PDF to cloud storage (S3, Cloudinary, etc.)
    // 2. Queue a background job (Upstash, Railway, etc.)
    // 3. Return job ID for status tracking

    res.status(200).json({
      success: true,
      message: 'File received. Processing will start shortly.',
      jobId: jobId,
      characterName: characterName,
      voiceId: voiceId,
      note: 'For Vercel deployment, use a separate worker service for long-running tasks'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
}

