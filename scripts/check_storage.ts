
import { createClient } from '@supabase/supabase-js';
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

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    console.log('Found:', Object.keys(envVars));
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStorage() {
    console.log('Checking Supabase storage buckets...');

    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error('Error listing buckets:', error);
        return;
    }

    console.log('Available buckets:', buckets.map(b => b.name));

    const bucketsToCheck = ['post-images', 'avatars'];

    for (const bucketName of bucketsToCheck) {
        const bucket = buckets.find(b => b.name === bucketName);

        if (bucket) {
            console.log(`✅ Bucket '${bucketName}' exists.`);
        } else {
            console.error(`❌ Bucket '${bucketName}' NOT found.`);
            console.log(`Creating bucket '${bucketName}'...`);
            const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
                public: true,
                fileSizeLimit: 5242880, // 5MB
                allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
            });

            if (createError) {
                console.error(`Failed to create bucket '${bucketName}':`, createError);
            } else {
                console.log(`✅ Bucket '${bucketName}' created successfully.`);
            }
        }
    }
}

checkStorage();
