-- ============================================================
-- UPDATE product descriptions with premium marketing copy
-- Paste and run in Lovable's Supabase SQL Editor
-- ============================================================

-- ── SKIN CARE ────────────────────────────────────────────────

UPDATE public.products SET description =
  'Reveal your best skin every morning with this luxurious Niacinamide-infused cleanser that gently purifies while preserving your skin''s natural moisture barrier — leaving you fresh, radiant, and perfectly prepped.'
WHERE name ILIKE '%cleanser%';

UPDATE public.products SET description =
  'Drench your skin in lasting hydration with this ultra-refined toner, powered by deep-penetrating Hyaluronic Acid and Astaxanthin to restore firmness, balance, and luminosity with every gentle application.'
WHERE name ILIKE '%toner%';

UPDATE public.products SET description =
  'Transform your complexion in minutes with this intensive hydrating mask, expertly crafted to visibly firm, brighten, and deeply renew your skin — revealing a softer, more youthful glow with every use.'
WHERE name ILIKE '%facial%mask%';

UPDATE public.products SET description =
  'A weightless yet profoundly nourishing daily lotion that brightens, firms, and moisturises for a luminous, even-toned complexion — your complete skin renewal ritual from morning to night.'
WHERE name ILIKE '%lotion%' AND name ILIKE '%youth%';

UPDATE public.products SET description =
  'Turn back the clock with this opulent anti-aging cream, meticulously formulated with Rhodiola Rosea, Collagen Peptides, and Astaxanthin to visibly reduce fine lines and restore your skin''s youthful radiance.'
WHERE name ILIKE '%facial%cream%';

-- ── IMMUNE BOOSTER ──────────────────────────────────────────

UPDATE public.products SET description =
  'A powerful immune elixir derived from 99% cell-wall broken Ganoderma spores — nature''s most potent defense activator, concentrated into a precise 30-capsule pack for your daily immune ritual.'
WHERE name ILIKE '%ganoderma%' AND name ILIKE '%30%' AND name NOT ILIKE '%oil%';

UPDATE public.products SET description =
  'Unlock the regenerative power of 99% broken Ganoderma spores with this 60-capsule value pack, delivering sustained immune fortification and uninterrupted cellular protection for long-term wellness.'
WHERE name ILIKE '%ganoderma%60%' AND name NOT ILIKE '%oil%';

UPDATE public.products SET description =
  'Experience immunity at its most concentrated — a 3X potent Ganoderma spore oil formula that penetrates deeper, works harder, and delivers elite-level immune defense, cardiovascular support, and total vitality.'
WHERE name ILIKE '%ganoderma%oil%';

UPDATE public.products SET description =
  'A masterful blend of four revered Reishi mushroom varieties — Red, Black, Purple, and White — working in powerful synergy to deliver comprehensive immune defense, liver detoxification, and lasting vitality.'
WHERE name ILIKE '%quad%reishi%' OR name ILIKE '%reishi%capsule%';

UPDATE public.products SET description =
  'Harness the legendary healing power of purified Yunzhi essence — a premium immune modulator trusted worldwide to strengthen, balance, and protect your body''s defenses from the inside out.'
WHERE name ILIKE '%yunz%';

-- ── PREMIUM SELECTED ─────────────────────────────────────────

UPDATE public.products SET description =
  'Start your day with purpose — a sophisticated fusion of NMN and premium coffee latte that fuels cellular energy, supports longevity, and elevates your morning ritual. No sugar added. Just pure performance.'
WHERE name ILIKE '%nmn%coffee%';

UPDATE public.products SET description =
  'One tablet. 24 hours of cellular renewal. Our breakthrough Duo-Release NMN technology steadily replenishes NAD+ throughout the day for sustained energy, DNA repair, and a body that ages beautifully.'
WHERE name ILIKE '%nmn%duo%' OR name ILIKE '%duo%release%';

UPDATE public.products SET description =
  'Unleash your brain''s full potential with a precision-crafted fusion of NMN, Resveratrol, and Ginkgo Biloba — engineered to sharpen focus, enhance memory, and support cognitive longevity at every age.'
WHERE name ILIKE '%nmn%sharp%' OR name ILIKE '%sharp%mind%';

UPDATE public.products SET description =
  'A luxurious daily antioxidant ritual powered by Resveratrol, NMN, and an elite blend of superberry extracts from around the world — formulated to protect, brighten, and beautifully defy the signs of aging.'
WHERE name ILIKE '%youth%ever%';

-- ── BONE & JOINT ─────────────────────────────────────────────

UPDATE public.products SET description =
  'Clinically-grade Glucosamine sourced from Spain, delivering the essential building blocks your joints need to lubricate, repair, and perform — for a life of comfort, mobility, and freedom from stiffness.'
WHERE name ILIKE '%gluzojoint%' AND name NOT ILIKE '%ultra%' AND name NOT ILIKE '%pro%';

UPDATE public.products SET description =
  'The ultimate triple-action joint formula — Glucosamine, Chondroitin, and MSM in one powerful capsule — engineered for those who demand peak joint performance without compromise, at any intensity level.'
WHERE name ILIKE '%gluzojoint%ultra%' OR name ILIKE '%gluzojoint%pro%';

UPDATE public.products SET description =
  'A potent dual-action formula uniting high-concentration Glucosamine and Chondroitin to repair, nourish, and protect your cartilage — your essential daily companion for active, pain-free living.'
WHERE name ILIKE '%arthroxtra%';

UPDATE public.products SET description =
  'Achieve superior bone and dental health with four precision-chelated minerals in one elegant capsule — our amino acid-bonded formula delivers over 95% calcium absorption, the gold standard in bone nutrition.'
WHERE name ILIKE '%zaminocal%';

-- Preview
SELECT name, LEFT(description, 80) AS description_preview FROM public.products ORDER BY name;
