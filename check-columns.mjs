import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
    console.log('Checking available columns in "products" table...');
    const { data, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else if (data && data.length > 0) {
        console.log('Available Columns:', Object.keys(data[0]));
    } else {
        console.log('No products found, checking raw select to get headers...');
        // We can force an error to reveal the schema
        const { error: err } = await supabaseAdmin.from('products').select('unknown_column').limit(1);
        console.log('Schema Error (should list columns if lucky):', err?.message);
    }
}

checkSchema();
