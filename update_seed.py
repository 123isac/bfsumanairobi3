import re

products_data = [
    # DIGESTIVE HEALTH
    ("Probio 3+(Strawberry) 30's", 5265, "digestive-health"),
    ("Constirelax solution", 5090, "digestive-health"),
    ("Veggie Veggie", 5265, "digestive-health"),
    ("Elements", 5265, "digestive-health"),
    ("Ntdiarr pills (Dozen)", 2106, "digestive-health"),
    ("EZ-Xlim Capsule", 9126, "digestive-health"),
    ("Novel Depile capsules", 3861, "digestive-health"),
    # BETTER LIFE
    ("Feminergy capsules", 5265, "better-life"),
    ("Prostatrelax Capsules", 4212, "better-life"),
    ("Xpower Coffee for Men", 2633, "better-life"),
    ("Xpower man capsules-New", 7371, "better-life"),
    ("Femibiotics", 7020, "better-life"),
    # BEAUTY & ANTIAGING
    ("SUMA GRAND 1: Cleanser+Lotion+Toner", 12987, "beauty-antiaging"),
    ("SUMA GRAND 2: Cleanser+Lotion+Toner+Face mask+ Cream", 22113, "beauty-antiaging"),
    ("Youth Refreshing Facial Cleanser", 3861, "beauty-antiaging"),
    ("Youth Essence lotion", 4388, "beauty-antiaging"),
    ("Youth Essence Toner", 4739, "beauty-antiaging"),
    ("Youth Essence Facial Mask", 3159, "beauty-antiaging"),
    ("Youth Essence Facial Cream", 5967, "beauty-antiaging"),
    # SUMA BABY
    ("Vitamin C 100mg", 3510, "suma-baby"),
    ("Calcium & Vitamin D3 Milk Tablet", 4212, "suma-baby"),
    ("Sharp Vision - Eye health Chewable Tablet", 4212, "suma-baby"),
    # SUMA LIVING
    ("Dr Ts Toothpaste", 966, "suma-living"),
    ("Anatic TM Herbal Essence Soap", 386, "suma-living"),
    ("CoolRoll (Dozen)", 2106, "suma-living"),
    ("Femicare Feminine Cleanser (Dozen)", 1931, "suma-living"),
    # IMMUNE BOOSTERS
    ("Pure & Broken Ganoderma Oil 60s", 22464, "immune-boosters"),
    ("Pure & Broken Ganoderma 60s", 19305, "immune-boosters"),
    ("Pure & Broken Ganoderma 30s", 10179, "immune-boosters"),
    ("Quad Reishi Capsules", 6143, "immune-boosters"),
    ("Refined Yunzhi", 5090, "immune-boosters"),
    ("4 in 1 Reishi Coffee", 2300, "immune-boosters"),
    ("4 in 1 Ginseng Coffee", 2300, "immune-boosters"),
    ("4 in 1 Cordyceps Coffee", 2300, "immune-boosters"),
    # PREMIUM SELECTED
    ("YOUTH EVER", 17375, "premium-selected"),
    ("NMN Sharp mind", 28080, "premium-selected"),
    ("NMN DUO release", 26150, "premium-selected"),
    ("NMN Coffee", 4388, "premium-selected"),
    # BONE & JOINT CARE
    ("Arthroxtra", 7020, "bone-joint-care"),
    ("Zaminocal", 4037, "bone-joint-care"),
    ("Gluzojoint-F Capsules", 4914, "bone-joint-care"),
    ("Gluzojoint Ultra PRO", 9828, "bone-joint-care"),
    # CARDIO VASCULAR HEALTH
    ("Micro2 cycle tablets", 3861, "cardio-vascular-health"),
    ("Relivin Tea", 3159, "cardio-vascular-health"),
    ("Cerebrain Tablets", 4388, "cardio-vascular-health"),
    ("Detoxlive Capsules", 2633, "cardio-vascular-health"),
    ("Gymeffect Capsules", 3510, "cardio-vascular-health")
]

products_js = "const products = [\n"
for name, price, slug in products_data:
    products_js += f"""    {{
        slug: '{slug}',
        name: `{name}`,
        price: {price},
        stock: 100,
        description: `Premium BF Suma product.`
    }},\n"""
products_js += "];"

with open(r'c:\Users\isaac\OneDrive\Desktop\bf-aura-lux\seed-products.mjs', 'r', encoding='utf-8') as f:
    content = f.read()

# Try to find the const products = [ ... ];
# Using regex to replace everything from "const products = [" to "];"
# We know it starts right after "// ── Product catalog ──────────────────────────────────────────"
parts = re.split(r'(// ── Product catalog ──────────────────────────────────────────\nconst products = \[[\s\S]*?\];\n)', content)

if len(parts) == 3:
    new_content = parts[0] + "// ── Product catalog ──────────────────────────────────────────\n" + products_js + "\n" + parts[2]
    with open(r'c:\Users\isaac\OneDrive\Desktop\bf-aura-lux\seed-products.mjs', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Updated successfully")
else:
    print("Could not find the products array")
