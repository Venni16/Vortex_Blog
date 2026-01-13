
import fs from 'fs';
import path from 'path';

// Load env vars manually
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};

envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        envVars[match[1]] = match[2].trim();
    }
});

const baseUrl = 'http://localhost:3000'; // Assuming dev server is running

async function testUpload() {
    console.log('Testing upload API...');

    // Create a dummy file
    const buffer = Buffer.from('test image content');
    const blob = new Blob([buffer], { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', blob, 'test-upload.txt');
    formData.append('bucket', 'post-images');

    try {
        const res = await fetch(`${baseUrl}/api/upload`, {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();

        if (res.ok) {
            console.log('✅ Upload successful!');
            console.log('URL:', data.url);
        } else {
            console.error('❌ Upload failed:', data);
        }
    } catch (error) {
        console.error('❌ Request failed:', error);
        console.log('Note: Ensure the Next.js dev server is running on localhost:3000');
    }
}

testUpload();
