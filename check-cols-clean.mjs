import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
    const { data } = await supabaseAdmin.from('products').select('*').limit(1);
    if (data && data.length > 0) {
        fs.writeFileSync('cols-clean.txt', Object.keys(data[0]).join(', '), 'utf8');
    }
}

checkSchema();
