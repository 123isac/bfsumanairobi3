import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
    const { data } = await supabaseAdmin.from('products').select('*').limit(1);
    if (data && data.length > 0) {
        console.log('COLUMNS:', Object.keys(data[0]).join(', '));
    } else {
        console.log('No data');
    }
}

checkSchema();
