import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const FOLDER_PATH = 'C:/Users/isaac/OneDrive/Desktop/suma boss';

function capitalizeWords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

async function bulkUpload() {
    console.log(`Scanning folder: ${FOLDER_PATH}`);
    const files = fs.readdirSync(FOLDER_PATH);

    const imageFiles = files.filter(f =>
        f.toLowerCase().endsWith('.jpg') ||
        f.toLowerCase().endsWith('.jpeg') ||
        f.toLowerCase().endsWith('.png') ||
        f.toLowerCase().endsWith('.webp')
    );

    console.log(`Found ${imageFiles.length} images to process.`);

    // Get a default category id
    const { data: categories } = await supabaseAdmin.from('categories').select('id').limit(1);
    const defaultCategoryId = categories?.[0]?.id;

    if (!defaultCategoryId) {
        console.error('No categories found! Stop.');
        return;
    }

    let successCount = 0;

    for (const file of imageFiles) {
        try {
            const filePath = path.join(FOLDER_PATH, file);
            const fileBuffer = fs.readFileSync(filePath);

            const fileExt = file.split('.').pop();
            // Safe file name for storage
            const storageName = `bulk_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
            const storagePath = `images/${storageName}`;

            console.log(`Uploading ${file}...`);

            const { error: uploadError } = await supabaseAdmin.storage
                .from('products')
                .upload(storagePath, fileBuffer, {
                    contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
                    upsert: true
                });

            if (uploadError) {
                console.error(`  -> Upload failed for ${file}:`, uploadError.message);
                continue;
            }

            const { data: { publicUrl } } = supabaseAdmin.storage
                .from('products')
                .getPublicUrl(storagePath);

            // Clean up the name for the product title
            const rawName = file.replace(/\.[^/.]+$/, ""); // remove extension
            const cleanName = capitalizeWords(rawName.replace(/_+|-+/g, " ").trim());

            // Insert product
            const { error: insertError } = await supabaseAdmin.from('products').insert({
                name: cleanName,
                category_id: defaultCategoryId,
                description: `Uploaded from desktop file: ${file}`,
                price: 0,
                image_url: publicUrl,
                is_active: false, // hidden by default so user can edit them first!
                stock_quantity: 100
            });

            if (insertError) {
                console.error(`  -> DB insert failed for ${cleanName}:`, insertError.message);
            } else {
                console.log(`  -> Successfully created product: ${cleanName}`);
                successCount++;
            }
        } catch (err) {
            console.error(`  -> Unexpected error on ${file}:`, err);
        }
    }

    console.log(`\nDONE! Successfully created ${successCount} products out of ${imageFiles.length}.`);
}

bulkUpload();
