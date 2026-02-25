/**
 * BF Suma Product Catalog Seeder
 * ─────────────────────────────────────────────────────────────
 * Inserts all 13 real BF Suma products into your Supabase DB.
 * Requires: SUPABASE_SERVICE_ROLE_KEY in your .env file.
 *
 * HOW TO GET YOUR SERVICE ROLE KEY:
 *   1. Go to https://supabase.com/dashboard/project/cwjbdpxolhxbcyhkapmy/settings/api
 *   2. Copy the "service_role" secret key
 *   3. Add it to your .env file: SUPABASE_SERVICE_ROLE_KEY="eyJ..."
 *
 * HOW TO RUN:
 *   node seed-products.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// ── Load .env manually (no dotenv needed) ─────────────────────
const envFile = readFileSync('.env', 'utf-8');
const env = Object.fromEntries(
    envFile.split('\n')
        .filter(l => l.includes('=') && !l.startsWith('#'))
        .map(l => {
            const [k, ...v] = l.split('=');
            return [k.trim(), v.join('=').trim().replace(/^"|"$/g, '')];
        })
);

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('\n❌  Missing environment variables!');
    console.error('   Make sure your .env contains:');
    console.error('   VITE_SUPABASE_URL="https://your-project.supabase.co"');
    console.error('   SUPABASE_SERVICE_ROLE_KEY="eyJ..."');
    console.error('\n   Find your service role key at:');
    console.error('   https://supabase.com/dashboard/project/cwjbdpxolhxbcyhkapmy/settings/api\n');
    process.exit(1);
}

// ── Create admin client (bypasses RLS) ────────────────────────
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
});

// ── Product catalog ──────────────────────────────────────────
const products = [
    {
        slug: 'digestive-health',
        name: `Probio 3+(Strawberry) 30's`,
        price: 5265,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'digestive-health',
        name: `Constirelax solution`,
        price: 5090,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'digestive-health',
        name: `Veggie Veggie`,
        price: 5265,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'digestive-health',
        name: `Elements`,
        price: 5265,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'digestive-health',
        name: `Ntdiarr pills (Dozen)`,
        price: 2106,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'digestive-health',
        name: `EZ-Xlim Capsule`,
        price: 9126,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'digestive-health',
        name: `Novel Depile capsules`,
        price: 3861,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'better-life',
        name: `Feminergy capsules`,
        price: 5265,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'better-life',
        name: `Prostatrelax Capsules`,
        price: 4212,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'better-life',
        name: `Xpower Coffee for Men`,
        price: 2633,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'better-life',
        name: `Xpower man capsules-New`,
        price: 7371,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'better-life',
        name: `Femibiotics`,
        price: 7020,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'beauty-antiaging',
        name: `SUMA GRAND 1: Cleanser+Lotion+Toner`,
        price: 12987,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'beauty-antiaging',
        name: `SUMA GRAND 2: Cleanser+Lotion+Toner+Face mask+ Cream`,
        price: 22113,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'beauty-antiaging',
        name: `Youth Refreshing Facial Cleanser`,
        price: 3861,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'beauty-antiaging',
        name: `Youth Essence lotion`,
        price: 4388,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'beauty-antiaging',
        name: `Youth Essence Toner`,
        price: 4739,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'beauty-antiaging',
        name: `Youth Essence Facial Mask`,
        price: 3159,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'beauty-antiaging',
        name: `Youth Essence Facial Cream`,
        price: 5967,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'suma-baby',
        name: `Vitamin C 100mg`,
        price: 3510,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'suma-baby',
        name: `Calcium & Vitamin D3 Milk Tablet`,
        price: 4212,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'suma-baby',
        name: `Sharp Vision - Eye health Chewable Tablet`,
        price: 4212,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'suma-living',
        name: `Dr Ts Toothpaste`,
        price: 966,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'suma-living',
        name: `Anatic TM Herbal Essence Soap`,
        price: 386,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'suma-living',
        name: `CoolRoll (Dozen)`,
        price: 2106,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'suma-living',
        name: `Femicare Feminine Cleanser (Dozen)`,
        price: 1931,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'immune-boosters',
        name: `Pure & Broken Ganoderma Oil 60s`,
        price: 22464,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'immune-boosters',
        name: `Pure & Broken Ganoderma 60s`,
        price: 19305,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'immune-boosters',
        name: `Pure & Broken Ganoderma 30s`,
        price: 10179,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'immune-boosters',
        name: `Quad Reishi Capsules`,
        price: 6143,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'immune-boosters',
        name: `Refined Yunzhi`,
        price: 5090,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'immune-boosters',
        name: `4 in 1 Reishi Coffee`,
        price: 2300,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'immune-boosters',
        name: `4 in 1 Ginseng Coffee`,
        price: 2300,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'immune-boosters',
        name: `4 in 1 Cordyceps Coffee`,
        price: 2300,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'premium-selected',
        name: `YOUTH EVER`,
        price: 17375,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'premium-selected',
        name: `NMN Sharp mind`,
        price: 28080,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'premium-selected',
        name: `NMN DUO release`,
        price: 26150,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'premium-selected',
        name: `NMN Coffee`,
        price: 4388,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'bone-joint-care',
        name: `Arthroxtra`,
        price: 7020,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'bone-joint-care',
        name: `Zaminocal`,
        price: 4037,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'bone-joint-care',
        name: `Gluzojoint-F Capsules`,
        price: 4914,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'bone-joint-care',
        name: `Gluzojoint Ultra PRO`,
        price: 9828,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'cardio-vascular-health',
        name: `Micro2 cycle tablets`,
        price: 3861,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'cardio-vascular-health',
        name: `Relivin Tea`,
        price: 3159,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'cardio-vascular-health',
        name: `Cerebrain Tablets`,
        price: 4388,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'cardio-vascular-health',
        name: `Detoxlive Capsules`,
        price: 2633,
        stock: 100,
        description: `Premium BF Suma product.`
    },
    {
        slug: 'cardio-vascular-health',
        name: `Gymeffect Capsules`,
        price: 3510,
        stock: 100,
        description: `Premium BF Suma product.`
    },
];

// ── Main seeder ───────────────────────────────────────────────
async function seed() {
    console.log('\n🌿  BF Suma Product Catalog Seeder');
    console.log('────────────────────────────────────\n');

    // 1. Fetch all categories
    const { data: categories, error: catErr } = await supabase
        .from('categories')
        .select('id, slug');

    if (catErr) {
        console.error('❌  Failed to fetch categories:', catErr.message);
        process.exit(1);
    }

    const catMap = Object.fromEntries(categories.map(c => [c.slug, c.id]));
    console.log(`✅  Found ${categories.length} categories:`, Object.keys(catMap).join(', '));

    // 2. Insert products
    let inserted = 0;
    let skipped = 0;

    for (const p of products) {
        const categoryId = catMap[p.slug];
        if (!categoryId) {
            console.warn(`⚠️   No category found for slug "${p.slug}" — skipping "${p.name}"`);
            skipped++;
            continue;
        }

        // Check if product already exists
        const { data: existing } = await supabase
            .from('products')
            .select('id')
            .eq('name', p.name)
            .single();

        if (existing) {
            console.log(`⏭️   Already exists — skipping: ${p.name}`);
            skipped++;
            continue;
        }

        const { error } = await supabase.from('products').insert({
            name: p.name,
            description: p.description,
            price: p.price,
            stock_quantity: p.stock,
            category_id: categoryId,
            image_url: null,
            rating: 5.0,
            is_active: true,
        });

        if (error) {
            console.error(`❌  Failed to insert "${p.name}":`, error.message);
        } else {
            console.log(`✅  Inserted: ${p.name} — KSH ${p.price.toLocaleString()}`);
            inserted++;
        }
    }

    console.log(`\n────────────────────────────────────`);
    console.log(`✅  Done! ${inserted} inserted, ${skipped} skipped.`);
    console.log(`\n📸  Next: Go to Admin → Products to upload real product photos.\n`);
}

seed().catch(err => {
    console.error('\n❌  Unexpected error:', err);
    process.exit(1);
});
