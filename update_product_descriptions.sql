-- UPDATE product descriptions with premium marketing copy
-- ── PERSONAL CARE & HYGIENE ──────────────────────────────────

UPDATE public.products SET description =
  '**Dr. Ts Toothpaste**
Revitalize your oral health with 4D care technology. Infused with double active factors—a unique blue cleaning factor and a green herbal factor with ginseng essence—this premium toothpaste ensures thorough cleaning, prevents cavities, and leaves your breath exceptionally fresh. 
*Active Ingredients*: Blue cleaning factor, green herbal factor, ginseng essence.
*Suggested Usage*: Brush thoroughly after meals or twice daily for optimal oral hygiene.'
WHERE name ILIKE '%Dr. T%Toothpaste%' OR name ILIKE '%Dr.Ts%';

UPDATE public.products SET description =
  '**Anatic Herbal Essence Soap**
Enjoy a body-pleasing spa experience at home. This classic sandalwood-fragranced soap brings a calm mood while its rich wild honey, green tea, and grapefruit extracts provide intense anti-oxidizing and moisturizing benefits.
*Active Ingredients*: Wild honey, green tea extract, grapefruit extract.
*Benefit*: Suitable for all skin types.'
WHERE name ILIKE '%Anatic%' OR name ILIKE '%Soap%';

UPDATE public.products SET description =
  '**FemiCare Feminine Cleanser**
100% natural antibacterial care with ingredients sourced from the USA Great Salt Lake. Formulated to reinforce your natural resistance against infection, eliminate abnormal discharge, and keep the vaginal area clean, comfortable, and refreshed.
*Active Ingredients*: Rejuvenating minerals, natural essential plant oils, amino acids, and multiple vitamins.
*Suggested Usage*: Wash once a day, 7-10 days as a full treatment.'
WHERE name ILIKE '%FemiCare%';

UPDATE public.products SET description =
  '**CoolRoll**
Remove discomforts anytime, anywhere. This portable, purely plant-extracted medicated oil features a unique roller ball design for convenient, safe application to relieve mosquito bites, cold-related headaches, dizziness, and motion sickness.
*Active Ingredients*: Menthol crystals, menthyl salicylate, camphor, eucalyptus oil.
*Suggested Usage*: Apply on the area you need to relax and unwind.'
WHERE name ILIKE '%CoolRoll%';

-- ── DIGESTIVE HEALTH & WEIGHT MANAGEMENT ──────────────────────

UPDATE public.products SET description =
  '**Veggie Veggie**
Dance smoothly with your digestion! Rich in nutrition with 120 kinds of fresh vegetable and fruit fermentation. This powerful blend features French Nufilrose dietary fiber and a six-probiotics combination for outstanding detoxification, relief from intestinal discomfort, and effective weight management.
*Ingredients*: Fruit and vegetable fermentation essence, dietary fiber, probiotics.
*Usage*: Brew 1 sachet a day with warm or cold water.'
WHERE name ILIKE '%Veggie Veggie%';

UPDATE public.products SET description =
  '**Probio3+**
Unlock your gut vitality and build healthy immunity. Accurately formulated with 7 live probiotic strains and 2 prebiotics to maintain intestinal health while boosting immunity. Enhanced with symbiotic fermentation technology and a delicious strawberry flavor.
*Active Ingredients*: Lactobacillus (fermentum, paracasei, rhamnosus, acidophilus, helveticus), Streptococcus thermophilus, Bifidobacterium longum.
*Benefit*: Ideal for those with poor absorption, weak immunity, or digestion issues.'
WHERE name ILIKE '%Probio3+%';

UPDATE public.products SET description =
  '**Ez-Xlim Tablets**
Eat everything, carry nothing. A powerful fat-blocking and starch-blocking formula featuring a patented slim figure technology. Designed for those who can''t resist the temptation of food but want to effectively manage their weight and keep slim.
*Active Ingredients*: Chitosan, white kidney bean, gymnema sylvestre, citrus aurantium.
*Suggested Usage*: 3 tablets per time, 15 minutes before a meal, twice daily.'
WHERE name ILIKE '%Ez-Xlim%';

UPDATE public.products SET description =
  '**ConstiRelax Solution**
Your optimal internal cleaner. Formulated with FOS (fructooligosaccharide) to breed healthy intestinal flora and Radix Astragali to nourish vitality. Highly effective for people with chronic or acute constipation wanting to promote regular bowel movements.
*Active Ingredients*: Radix astragali, FOS.
*Suggested Usage*: 1 sachet before a meal, twice daily.'
WHERE name ILIKE '%ConstiRelax%';

-- ── SPECIALTY TREATMENTS & BONE CARE ────────────────────────

UPDATE public.products SET description =
  '**Novel-Depile Capsules**
Discover citrus, discover the relief for hemorrhoids. A painless and 100% natural, scientifically proven method to control hemorrhoids and support chronic venous insufficiency using highly effective citrus extracts.
*Active Ingredients*: Citrus extract and its derivatives.
*Suggested Usage*: Take with a meal. 2 capsules daily for venous insufficiency.'
WHERE name ILIKE '%Novel-Depile%';

UPDATE public.products SET description =
  '**ZaminoCal Plus Capsules**
Basic care for bones and teeth. A perfectly balanced supplementation formula for higher calcium absorption and utilization. This bone-activating formula is also highly appropriate for individuals with weak gastrointestinal function.
*Active Ingredients*: Calcium amino acid chelate, zinc amino acid chelate, magnesium carbonate, selenium yeast.
*Suggested Usage*: 2 capsules per day with meals.'
WHERE name ILIKE '%ZaminoCal%';

UPDATE public.products SET description =
  '**ArthroXtra Tablets**
Special care for physically active people and joint health. Dual nourishment featuring high concentrations of Glucosamine (from crustacean shells) and Chondroitin (from mammalian cartilage) to treat sprain-induced joint damage and joint aging.
*Active Ingredients*: Glucosamine hydrochloride (375mg), Chondroitin sulfate sodium (300mg).
*Suggested Usage*: 2 tablets per time, twice daily with meals.'
WHERE name ILIKE '%ArthroXtra%';

UPDATE public.products SET description =
  '**GluzoJoint-F Capsules**
Basic care for joint health. Maintain healthy cartilage with this focused formula featuring quality raw materials sourced from Spain. Pure Glucosamine hydrochloride ensures targeted joint discomfort relief with no harm to heart, kidney, or lung, and fewer side effects.
*Active Ingredients*: Glucosamine hydrochloride.
*Suggested Usage*: 1 capsule per time, twice daily with a meal.'
WHERE name ILIKE '%GluzoJoint%';

-- ── IMMUNE SYSTEM & VITALITY ────────────────────────────────

UPDATE public.products SET description =
  '**NTDiarr Pills**
Fast, safe, and cost-effective relief. Relieve the symptoms of gastrointestinal discomfort and stomachaches caused by diarrhea. Formulated with a traditional blend of Red Bamboo ingredients.
*Active Ingredients*: Honey, radix glycyrrhizae, creosote, cortex cinnamomi, pericarpium citrireticulatae, cortex phellodendri, flos caryophylli, menthol.
*Suggested Usage*: See package insert for age-specific dosage instructions. Take three times daily.'
WHERE name ILIKE '%NTDiarr%';

UPDATE public.products SET description =
  '**Detoxilive Capsules**
The elimination of toxins in the flow! A pure and 100% natural North American bean recipe delivering an exceptionally high 38% Soy PC Content for easy absorption. Perfect for drinkers, the sub-health population, and individuals experiencing memory decline.
*Active Ingredients*: Soy Lecithin.
*Suggested Usage*: 1 soft gel capsule with meal time, 3 times daily.'
WHERE name ILIKE '%Detoxilive%';

UPDATE public.products SET description =
  '**Feminergy Capsules**
Stay shiny, stay young! Formulated with highly-concentrated grape seed extract sourced from top-quality vineyards in France. Each capsule contains 330 mg of grape seed extract, delivering powerful anti-oxidizing ability to improve skin tone, elasticity, and reduce wrinkles.
*Active Ingredients*: Grape seed extract.
*Suggested Usage*: 1 capsule half an hour after meal, twice daily.'
WHERE name ILIKE '%Feminergy%';

UPDATE public.products SET description =
  '**Xpower Man Plus Capsules**
For men, vitality without limit! Experience high efficiency and optimized quality of life. This powerful US Patented formula blends five major gold raw materials in a scientific ratio to improve endurance, vitality, and sperm motility.
*Active Ingredients*: Maca, epimedium, black ginger, L-arginine, taurine.
*Suggested Usage*: 1-2 capsules daily after a meal.'
WHERE name ILIKE '%Xpower Man Plus%' OR name ILIKE '%Xpower Man%';

UPDATE public.products SET description =
  '**ProstatRelax Capsules**
Farewell anxiety, let life return to beauty! This heavily researched, US Patented formula features Prostaep to help efficiently maintain prostate health and improve sexual performance. World-class QC strictly manufactured in accordance to FDA and GMP standards.
*Active Ingredients*: Epimedium extract.
*Suggested Usage*: 2 capsules per time, three times daily for optimal results.'
WHERE name ILIKE '%ProstatRelax%';

UPDATE public.products SET description =
  '**Relivin Tea**
A relaxing sip of tea for a healthier cardiovascular system. Finely selected Luobuma tea from desert wetlands matched with excellent green tea to help combat anti-aging free radicals and maintain healthy cholesterol and blood pressure levels.
*Active Ingredients*: Folium apocyni veneti and green tea.
*Suggested Usage*: Brew one tea bag in fresh boiling water for 10-15 mins. Consume one bag daily.'
WHERE name ILIKE '%Relivin%';

-- ── CARDIOVASCULAR & BRAIN HEALTH ──────────────────────────

UPDATE public.products SET description =
  '**MicrO2 Cycle Tablets**
Heart''s Direction, Healthy Choice. Extracted from a 1/1000 proportion of superior raw herbs using innovative technology for maximum efficacy. Perfect for those looking to maintain exceptional cardiovascular health and prevent thrombosis.
*Active Ingredients*: Radix salvia miltiorrhiza, radix panax notoginseng, borneolum syntheticum.
*Suggested Usage*: 3 tablets per time, 3 times daily.'
WHERE name ILIKE '%MicrO2%';

UPDATE public.products SET description =
  '**GymEffect Capsules**
Keep Sugar at Bay. A specialized supplement that supports healthy blood glucose metabolism and helps maintain healthy blood sugar levels, perfect for anyone concerned about their daily sugar processing.
*Active Ingredients*: Organic Chromium from Yeast, Gymnema Sylvestris Extract, Pyrroloquinoline Quinone Disodium Salt.
*Suggested Usage*: 2 capsules to be taken daily before meals.'
WHERE name ILIKE '%GymEffect%';

UPDATE public.products SET description =
  '**CereBrain Tablets**
Power Up Your Brain. Combat the demands of a high-stress, mentally demanding lifestyle or prevent age-related memory loss. Formulated to significantly improve brain cell metabolism, enhance blood flow, and deliver essential nutrients straight to your brain.
*Active Ingredients*: Ginkgo leaves extract.
*Suggested Usage*: 2 tablets per time, three times daily.'
WHERE name ILIKE '%CereBrain%';

-- ── SPECIALTY IMMUNITY & RECOVERY (GANODERMA/YUNZHI) ────────

UPDATE public.products SET description =
  '**Pure & Broken Ganoderma Spores Deluxe**
The next-level supplement gifted by Mother Nature. Comprehensively promote your cardiovascular, metabolic, and immune health with top-tier, pure Ganoderma Spore Oil to achieve peak general wellness.
*Active Ingredients*: Ganoderma Spore Oil, Gelatin.
*Suggested Usage*: 2 capsules daily in the morning or evening for consistent, optimal results.'
WHERE name ILIKE '%Spore%Deluxe%' OR (name ILIKE '%Ganoderma%' AND name ILIKE '%Oil%');

UPDATE public.products SET description =
  '**Pure & Broken Ganoderma Spores Capsules**
The Power of Nature: Rebuilding Immunity. Featuring organic raw materials and a revolutionary technique achieving a 99% breaking rate. Highly effective at fighting disease, reducing illness risks, and supporting post-operation recovery.
*Active Ingredients*: Broken Ganoderma spores.
*Suggested Usage*: 2 capsules daily in the morning or evening.'
WHERE name ILIKE '%Ganoderma Spore%Capsule%';

UPDATE public.products SET description =
  '**Refined Yunzhi Essence**
Great Yunzhi, Great Power. Sourced from pure & unpolluted nature, offering a highly concentrated active ingredient (PSP). Each capsule contains 300 mg of powerful Yunzhi extract, designed for those undergoing serious immune challenges or chemotherapy recovery.
*Active Ingredients*: Refined Yunzhi essence.
*Suggested Usage*: 2 capsules twice daily.'
WHERE name ILIKE '%Yunzhi%';

-- ── BEVERAGES (COFFEES) ──────────────────────────────────────

UPDATE public.products SET description =
  '**4 in 1 Cordyceps Coffee**
Enjoy every cup of warmth with vigor! Each rich and mellow sachet contains 180mg of Ganoderma lucidum essence mixed with powerful Cordyceps to improve overall physical health, enhance your active immunity, and deliver high antioxidant action to prevent aging.
*Active Ingredients*: Cordyceps sinensis mycelium extract, Ganoderma extract.
*Suggested Usage*: Brew with water at 80-90°C for the best extraction.'
WHERE name ILIKE '%Cordyceps Coffee%';

UPDATE public.products SET description =
  '**4 in 1 Reishi Coffee**
Enjoy every cup of warmth with vigor! A perfectly crafted coffee featuring 180mg of Ganoderma lucidum essence. Designed to significantly promote the detoxifying function of the liver and kidneys while strengthening your baseline immune system.
*Active Ingredients*: Reishi (Ganoderma) extract.
*Suggested Usage*: Brew with water at 80-90°C for the best extraction.'
WHERE name ILIKE '%Reishi Coffee%';

UPDATE public.products SET description =
  '**4 in 1 Ginseng Coffee**
Enjoy every cup of warmth with vigor! Infused with 180mg of Ganoderma lucidum essence and premium Ginseng to successfully regulate the body''s endocrine and metabolism systems while maintaining proper and healthy heart functionality.
*Active Ingredients*: Ginseng extract, Ganoderma extract.
*Suggested Usage*: Brew with water at 80-90°C for the best extraction.'
WHERE name ILIKE '%Ginseng Coffee%';

UPDATE public.products SET description =
  '**NMN Coffee**
Rejuvenate every drop! Support unprecedented longevity, supercharge energy production, endurance, and promote complete metabolic optimization with a delicious, no-sugar-added coffee latte formulation.
*Active Ingredients*: NMN, Instant Coffee Powder, Non-dairy Creamer.
*Suggested Usage*: Dissolve 1 sachet into 140ml hot water. Take twice daily.'
WHERE name ILIKE '%NMN Coffee%';

-- ── NMN & PREMIUM ANTI-AGING ─────────────────────────────────

UPDATE public.products SET description =
  '**YouthEver**
You deserve the beauty miracle! A powerful combination of Resveratrol and NMN to essentially freeze time. This globally selected formula uses various super antioxidant berries to deliver highly effective antioxidants at the cellular level.
*Active Ingredients*: Resveratrol, anthocyanins, procyanidins, NMN.
*Suggested Usage*: 1 pouch per day.'
WHERE name ILIKE '%YouthEver%';

UPDATE public.products SET description =
  '**NMN Sharp Mind**
Release the Alpha Brain. A potent brain health formula combining NMN, Resveratrol, and Ginkgo Biloba Extract. Utilizing 14 mm tri-particle absorption technology, this supplement is designed for those concerned about brain health and age-related genetic repair.
*Active Ingredients*: NMN, Resveratrol, Ginkgo Biloba Extract.
*Suggested Usage*: Take 2 capsules per day.'
WHERE name ILIKE '%Sharp Mind%';

UPDATE public.products SET description =
  '**NMN Duo Release**
Unstoppable Youth Power. Featuring cutting-edge technology that provides a full 24 hours of DNA repair. Get the energy and productivity boost you need at work while supporting genetic repair as you age.
*Active Ingredients*: NMN.
*Suggested Usage*: Take 1 tablet per day in the morning.'
WHERE name ILIKE '%Duo Release%';

UPDATE public.products SET description =
  '**Quad-Reishi Capsules**
Most precious gift infused with nature. Contains fine-extracts from four 100% pure Reishi species in a perfect 1:1:1:1 ratio. Expertly formulated to support liver health, promote immune health, and significantly enhance vitality.
*Active Ingredients*: Reishi Extract, Coriolus Versicolor Extract, Chaga Extract, Antrodia Camphorate Extract.
*Suggested Usage*: Take 2 capsules per day for at least 3 weeks for initial effects.'
WHERE name ILIKE '%Quad-Reishi%';

UPDATE public.products SET description =
  '**NMN 4500**
Reversing the flow of time. A powerful anti-aging supplement designed to boost energy metabolism, activate Sirtuins, and provide critical anti-aging DNA repair. Excellent for maintaining brain and heart health.
*Active Ingredients*: NMN.
*Suggested Usage*: Take 2 capsules per day.'
WHERE name ILIKE '%NMN 4500%';
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
-- Add separate benefits and ingredients columns to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS benefits TEXT,
ADD COLUMN IF NOT EXISTS ingredients TEXT;
