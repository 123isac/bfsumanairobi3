import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUpload() {
    console.log('1. Logging in as admin user...');
    const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: 'isaacmutin.2004@gmail.com',
        password: '@Muteti11052004'
    });

    if (authError || !data.session) {
        console.error('Failed to log in:', authError?.message);
        return;
    }

    console.log(`Successfully logged in as: ${data.user.email}`);

    const dummyFile = Buffer.from('HelloWorld123');
    const filename = `test_upload_${Date.now()}.png`;

    console.log(`2. Attempting to upload ${filename} to products bucket...`);
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('products')
        .upload(`images/${filename}`, dummyFile, {
            contentType: 'image/png'
        });

    if (uploadError) {
        console.error('❌ UPLOAD FAILED (RLS Triggered):', uploadError.message);

        console.log('3. Trying without "images/" prefix just in case...');
        const { data: uploadData2, error: uploadError2 } = await supabase.storage
            .from('products')
            .upload(filename, dummyFile, {
                contentType: 'image/png'
            });

        if (uploadError2) {
            console.error('❌ SECOND UPLOAD FAILED:', uploadError2.message);
        } else {
            console.log('✅ SECOND UPLOAD SUCCEEDED!', uploadData2);
        }
    } else {
        console.log('✅ UPLOAD SUCCEEDED!', uploadData);
    }
}

testUpload();
