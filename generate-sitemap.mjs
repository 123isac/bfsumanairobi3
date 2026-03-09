#!/usr/bin/env node
/**
 * generate-sitemap.mjs
 * Run after build: node generate-sitemap.mjs
 * Fetches all active product IDs + category slugs from Supabase
 * and writes /public/sitemap.xml
 *
 * Usage: node generate-sitemap.mjs
 * Requires: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 */

import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "fs";
import { config } from "dotenv";

config(); // Load .env

const SITE_URL = "https://bfsumanairobi3.com";
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const today = new Date().toISOString().split("T")[0];

// Static pages with their priorities
const staticPages = [
    { path: "/", priority: "1.0", changefreq: "daily" },
    { path: "/shop", priority: "0.9", changefreq: "daily" },
    { path: "/about", priority: "0.7", changefreq: "monthly" },
    { path: "/contact", priority: "0.7", changefreq: "monthly" },
    { path: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
    { path: "/terms-of-service", priority: "0.3", changefreq: "yearly" },
];

const toSitemapEntry = (url, priority = "0.6", changefreq = "weekly") => `
  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

async function generateSitemap() {
    console.log("Fetching products from Supabase...");

    const { data: products, error: prodErr } = await supabase
        .from("products")
        .select("id, slug, updated_at")
        .eq("is_active", true);

    if (prodErr) {
        console.warn("Could not fetch products:", prodErr.message);
    }

    const { data: categories, error: catErr } = await supabase
        .from("categories")
        .select("slug");

    if (catErr) {
        console.warn("Could not fetch categories:", catErr.message);
    }

    const entries = [];

    // Static pages
    for (const page of staticPages) {
        entries.push(toSitemapEntry(`${SITE_URL}${page.path}`, page.priority, page.changefreq));
    }

    // Category filter pages
    if (categories) {
        for (const cat of categories) {
            entries.push(toSitemapEntry(`${SITE_URL}/shop?category=${cat.slug}`, "0.7", "weekly"));
        }
    }

    // Product pages — use slug if available, fall back to ID
    if (products) {
        for (const product of products) {
            const urlKey = product.slug || product.id;
            const lastmod = product.updated_at ? product.updated_at.split("T")[0] : today;
            entries.push(`
  <url>
    <loc>${SITE_URL}/product/${urlKey}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
        }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join("")}
</urlset>`;

    writeFileSync("./public/sitemap.xml", xml, "utf-8");
    console.log(`✅ sitemap.xml written with ${entries.length} URLs`);
}

generateSitemap().catch((e) => {
    console.error("Sitemap generation failed:", e);
    process.exit(1);
});
