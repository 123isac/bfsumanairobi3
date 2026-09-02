import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductReviews from "@/components/ProductReviews";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star, ShoppingCart, Heart, Shield, ShieldCheck, Leaf, Sparkles,
  Truck, RotateCcw, CheckCircle2, Flame, Clock, ArrowRight,
  MessageCircle, HelpCircle, Activity, Info, Award, Check
} from "lucide-react";
import { SUPPORT_WHATSAPP_NUMBER } from "@/config/site";

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";

// Helper to extract YouTube video ID
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// Robust bullet / list parser that strips tags, colons, and prefixes
const parseListItems = (val: any): string[] => {
  if (!val) return [];
  let rawList: string[] = [];

  if (Array.isArray(val)) {
    rawList = val.map(String);
  } else if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) rawList = parsed.map(String);
      } catch {}
    }
    if (rawList.length === 0) {
      rawList = trimmed.split(/\r?\n|•/);
    }
  }

  const cleaned: string[] = [];
  for (const raw of rawList) {
    const str = raw.trim();
    if (!str) continue;

    // Check if the item contains a prefix tag with colon e.g. "Youth Refreshing Cleanser: Thoroughly purifies..."
    let content = str;
    if (content.includes(":") && !content.startsWith("http")) {
      const parts = content.split(":");
      // If the part after the colon is substantial, take it
      if (parts[1] && parts[1].trim().length > 3) {
        content = parts.slice(1).join(":").trim();
      }
    }

    // Clean leading bullets, numbers, hyphens, ticks
    content = content.replace(/^[-*•\d\.\s✓–—]+/, "").trim();

    if (content.length > 0) {
      // Capitalize first character
      content = content.charAt(0).toUpperCase() + content.slice(1);
      cleaned.push(content);
    }
  }

  return cleaned;
};

// Ingredient parser that splits comma-separated items into clean individual pills
const parseIngredientItems = (val: any): string[] => {
  if (!val) return [];
  const list = parseListItems(val);
  const result: string[] = [];

  for (const item of list) {
    // If an ingredient line has multiple items separated by commas
    if (item.includes(",")) {
      const subItems = item.split(",");
      for (const sub of subItems) {
        let s = sub.trim().replace(/^[-*•\d\.\s✓–—]+/, "").trim();
        if (s.includes(":")) {
          s = s.split(":").pop()?.trim() || "";
        }
        if (s.length > 1) {
          s = s.charAt(0).toUpperCase() + s.slice(1);
          result.push(s);
        }
      }
    } else {
      let s = item.trim();
      if (s.includes(":")) {
        s = s.split(":").pop()?.trim() || "";
      }
      if (s.length > 1) {
        result.push(s);
      }
    }
  }

  return result;
};



const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ["related-products", product?.category_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .eq("category_id", product?.category_id)
        .eq("is_active", true)
        .neq("id", id)
        .limit(4);
      if (error) throw error;
      return data;
    },
    enabled: !!product?.category_id,
    staleTime: 1000 * 60 * 5,
  });


  // Dynamic review count
  const { data: reviewCount = 0 } = useQuery({
    queryKey: ["review-count", id],
    queryFn: async () => {
      // Cast supabase to any to bypass strict type checking for 'product_reviews'
      // which is missing from the generated database.types.ts
      const { count, error } = await (supabase as any)
        .from("product_reviews")
        .select("id", { count: "exact", head: true })
        .eq("product_id", id);
      if (error) return 0;
      return count ?? 0;
    },
    enabled: !!id,
  });

  // Inject Schema.org Product structured data
  useEffect(() => {
    if (!product) return;
    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description || "",
      image: product.image_url || "",
      brand: { "@type": "Brand", name: "BF Suma" },
      offers: {
        "@type": "Offer",
        priceCurrency: "KES",
        price: String(product.price),
        availability:
          (product.stock_quantity ?? 0) > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        seller: { "@type": "Organization", name: "BF Suma Nairobi" },
      },
      ...(Number(product.rating) > 0
        ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: String(Number(product.rating).toFixed(1)),
            reviewCount: String(reviewCount > 0 ? reviewCount : 1),
            bestRating: "5",
            worstRating: "1",
          },
        }
        : {}),
    };
    const scriptId = "product-schema-ld";
    let existing = document.getElementById(scriptId);
    if (!existing) {
      existing = document.createElement("script");
      existing.id = scriptId;
      (existing as HTMLScriptElement).type = "application/ld+json";
      document.head.appendChild(existing);
    }
    existing.textContent = JSON.stringify(schema);
    return () => { existing?.remove(); };
  }, [product, reviewCount]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
              <div className="aspect-square rounded-2xl bg-muted animate-pulse" />
              <div className="space-y-4">
                <div className="h-6 w-24 rounded-full bg-muted animate-pulse" />
                <div className="h-12 w-3/4 rounded-xl bg-muted animate-pulse" />
                <div className="h-8 w-32 rounded-xl bg-muted animate-pulse" />
                <div className="h-40 rounded-2xl bg-muted animate-pulse" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Product not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.image_url || "/placeholder.svg",
        category: product.categories?.name || "",
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const youtubeVideoId = getYouTubeVideoId(product.youtube_url || "");
  const hasVideo = !!youtubeVideoId;

  // Cast to access extended DB columns not yet in auto-generated Supabase types
  type ExtendedProduct = typeof product & {
    compare_price?: number | null;
    benefits?: string | null;
    ingredients?: string | null;
  };
  const p = product as ExtendedProduct;

  const price = Number(product.price);
  const comparePrice = p.compare_price ? Number(p.compare_price) : null;
  const savings = comparePrice && comparePrice > price ? comparePrice - price : null;
  const discountPct = savings && comparePrice ? Math.round((savings / comparePrice) * 100) : null;
  const stock = product.stock_quantity ?? 0;
  const lowStock = stock > 0 && stock <= 5;
  const rating = Number(product.rating || 5);
  const filledStars = Math.max(0, Math.min(5, Math.round(rating)));

  // Parse benefits and ingredients robustly
  const benefitItems = parseListItems(p.benefits);
  const ingredientItems = parseIngredientItems(p.ingredients);
  const fullDesc = product.description || "";


  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={product.name}
        description={(product.description || "").slice(0, 160) || `Buy ${product.name} from BF Suma Nairobi. Premium wellness products.`}
      />
      <Header />

      <main className="flex-1 bg-background">
        {/* Breadcrumb */}
        <div className="border-b border-border bg-secondary/30">
          <div className="container mx-auto px-4 lg:px-8 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <span>/</span>
              <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
              {product.categories?.name && (
                <>
                  <span>/</span>
                  <Link to={`/shop?category=${product.categories.name.toLowerCase().replace(/ /g, '-')}`} className="hover:text-primary transition-colors">
                    {product.categories.name}
                  </Link>
                </>
              )}
              <span>/</span>
              <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 py-8 md:py-12 relative z-10">
          {/* ── Main Product Section ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 mb-14 md:mb-20">

            {/* LEFT — Image */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-white dark:bg-muted/10 border border-border shadow-luxury group flex items-center justify-center p-6">
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  decoding="async"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                {discountPct && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 bg-red-500 text-white text-xs sm:text-sm font-bold rounded-full shadow-lg">
                      -{discountPct}% OFF
                    </span>
                  </div>
                )}
                {stock === 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Delivery promise — desktop */}
              <div className="hidden lg:grid grid-cols-3 gap-3 text-center">
                {[
                  { icon: Truck, label: "Nairobi Same-Day", sub: "2–4 hr Dispatch", anim: "animate-truck text-emerald-600" },
                  { icon: ShieldCheck, label: "100% Authentic", sub: "Genuine BF Suma Seal", anim: "animate-badge-shimmer text-amber-600" },
                  { icon: RotateCcw, label: "7-Day Returns", sub: "Guaranteed Satisfaction", anim: "text-primary" },
                ].map(({ icon: Icon, label, sub, anim }) => (
                  <div key={label} className="bg-card border border-border rounded-2xl p-3.5 flex flex-col items-center gap-1 transition-all duration-300 shadow-sm">
                    <Icon className={`h-5 w-5 ${anim}`} />
                    <span className="text-xs font-bold text-foreground">{label}</span>
                    <span className="text-[10px] text-muted-foreground">{sub}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Product Info */}
            <div className="space-y-6">

              {/* Category + Name */}
              <div>
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                  {product.categories?.name}
                </span>
                <h1 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-foreground leading-snug mb-3">
                  {product.name}
                </h1>

                {/* Stars + Social proof */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 sm:h-5 sm:w-5 ${i < filledStars ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-foreground">{rating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">
                    {reviewCount > 0 ? `· ${reviewCount} verified reviews` : "· Top Rated Authentic Product"}
                  </span>
                </div>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-4">
                <span className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-primary leading-none">
                  KSH {price.toLocaleString()}
                </span>
                {comparePrice && comparePrice > price && (
                  <div className="flex flex-col">
                    <span className="text-base sm:text-lg text-muted-foreground line-through leading-none">
                      KSH {comparePrice.toLocaleString()}
                    </span>
                    {savings && (
                      <span className="text-xs sm:text-sm text-emerald-600 font-bold mt-1">
                        Save KSH {savings.toLocaleString()}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Stock Status */}
              {lowStock && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl">
                  <Flame className="h-4 w-4 text-red-500 shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400">
                    Only {stock} units left in stock — order today!
                  </span>
                </div>
              )}
              {stock === 0 && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-muted border border-border rounded-xl">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground">Currently out of stock — restocked shortly</span>
                </div>
              )}
              {stock > 5 && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>In Stock — Dispatched within 2–4 hours in Nairobi</span>
                </div>
              )}

              {/* ── Product Overview Card (Clear & Easy to Relate) ── */}
              <div className="rounded-2xl bg-secondary/30 border border-border/80 p-4 sm:p-5 space-y-3.5 shadow-sm">
                <div className="space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    How It Helps You
                  </span>
                  <p className="text-foreground text-sm sm:text-base leading-relaxed font-normal">
                    {fullDesc || "Authentic premium health and wellness formula from BF Suma."}
                  </p>
                </div>

                {/* Top 3 Quick Benefits preview */}
                {benefitItems.length > 0 && (
                  <div className="pt-2 border-t border-border/60 space-y-2">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Key Highlights:
                    </p>
                    <ul className="space-y-1.5">
                      {benefitItems.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-foreground">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Direct WhatsApp Specialist Callout */}
                <div className="pt-1">
                  <a
                    href={`https://wa.me/${SUPPORT_WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello! I would like more information and dosage advice for ${product.name}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800/40 transition-colors w-full justify-center sm:justify-start"
                  >
                    <MessageCircle className="h-4 w-4 text-[#25D366] shrink-0" />
                    <span>Have questions? Ask our Nairobi Wellness Advisor on WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Quantity + Add to Cart */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-sm">Quantity:</span>
                  <div className="flex items-center border border-border rounded-full overflow-hidden bg-card">
                    <Button variant="ghost" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="rounded-none px-4 h-10 text-base font-bold">−</Button>
                    <span className="px-4 font-bold text-sm">{quantity}</span>
                    <Button variant="ghost" size="sm" onClick={() => setQuantity(q => q + 1)} className="rounded-none px-4 h-10 text-base font-bold">+</Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    size="lg"
                    className={`flex-1 h-13 text-base font-bold rounded-full transition-all duration-300 ${added
                      ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                      : "gradient-primary hover:shadow-luxury hover:scale-[1.01]"
                      }`}
                    onClick={handleAddToCart}
                    disabled={stock < 1}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {added ? "Added to Cart ✓" : stock > 0 ? `Add to Cart • KSH ${(price * quantity).toLocaleString()}` : "Out of Stock"}
                  </Button>
                  <Button size="lg" variant="outline" className="h-13 w-13 rounded-full shrink-0 border-border hover:border-red-300 hover:text-red-500 transition-colors">
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Structured Product Tabs (Readable & Easy to Understand) ── */}
          <div className="mb-16 md:mb-24">
            <Tabs defaultValue="benefits" className="w-full">
              <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent h-auto p-0 gap-4 sm:gap-8 overflow-x-auto">
                <TabsTrigger
                  value="benefits"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 pb-3 whitespace-nowrap font-bold text-sm sm:text-base text-muted-foreground data-[state=active]:text-primary transition-colors"
                >
                  Health Benefits ({benefitItems.length || 1})
                </TabsTrigger>

                <TabsTrigger
                  value="ingredients"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 pb-3 whitespace-nowrap font-bold text-sm sm:text-base text-muted-foreground data-[state=active]:text-primary transition-colors"
                >
                  Ingredients & Formulation
                </TabsTrigger>

                <TabsTrigger
                  value="delivery"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 pb-3 whitespace-nowrap font-bold text-sm sm:text-base text-muted-foreground data-[state=active]:text-primary transition-colors"
                >
                  Delivery & Guarantee
                </TabsTrigger>

                {hasVideo && (
                  <TabsTrigger
                    value="video"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 pb-3 whitespace-nowrap font-bold text-sm sm:text-base text-muted-foreground data-[state=active]:text-primary transition-colors"
                  >
                    Video Guide
                  </TabsTrigger>
                )}

                <TabsTrigger
                  value="reviews"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 pb-3 whitespace-nowrap font-bold text-sm sm:text-base text-muted-foreground data-[state=active]:text-primary transition-colors"
                >
                  Reviews ({reviewCount})
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: HEALTH BENEFITS */}
              <TabsContent value="benefits" className="mt-8">
                <div className="max-w-4xl space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-primary" /> Key Health Benefits & Results
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Science-led results you can expect with consistent use of this authentic BF Suma formula:
                    </p>
                  </div>

                  {benefitItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {benefitItems.map((benefit, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-card border border-border/80 flex items-start gap-3 shadow-xs hover:border-primary/40 transition-colors">
                          <span className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="h-3.5 w-3.5 text-emerald-600 font-bold" />
                          </span>
                          <span className="text-sm text-foreground leading-relaxed font-medium">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl bg-card border border-border text-sm text-foreground leading-relaxed">
                      {fullDesc || "Formulated with premium natural ingredients and certified American wellness technology to support your vitality, immunity, and overall body balance."}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* TAB 2: INGREDIENTS */}
              <TabsContent value="ingredients" className="mt-8">
                <div className="max-w-4xl space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-emerald-600" /> Active Natural Ingredients
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Pure, tested, and high-potency ingredients selected for maximum bioavailability:
                    </p>
                  </div>

                  {ingredientItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {ingredientItems.map((ing, i) => (
                        <div key={i} className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center gap-3">
                          <span className="w-7 h-7 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center shrink-0">
                            <Leaf className="h-4 w-4" />
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-foreground">{ing}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
                      <p className="text-sm font-semibold text-foreground">Natural Botanical & Bio-Active Formula</p>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        Contains pure, GMP-certified active botanical extracts and micronutrients formulated without harmful additives or synthetic fillers.
                      </p>
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-secondary/30 border border-border/80 flex items-center gap-3 text-xs text-muted-foreground mt-4">
                    <Shield className="h-5 w-5 text-primary shrink-0" />
                    <span>All ingredients comply with international Good Manufacturing Practices (GMP) and BF Suma authenticity testing standards.</span>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 3: DELIVERY & GUARANTEE */}
              <TabsContent value="delivery" className="mt-8">
                <div className="max-w-4xl space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                      <Truck className="h-5 w-5 text-primary" /> Delivery Timelines & Authenticity Guarantee
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Fast and reliable delivery from our Nairobi dispatch hub directly to your location:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-4 rounded-2xl bg-card border border-border space-y-1.5 shadow-xs">
                      <p className="font-bold text-sm text-foreground flex items-center gap-2">
                        <Clock className="h-4 w-4 text-emerald-600" /> Nairobi Same-Day Delivery
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Orders placed before 4:00 PM are delivered within <strong>2–4 hours</strong> via direct rider across Nairobi.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-card border border-border space-y-1.5 shadow-xs">
                      <p className="font-bold text-sm text-foreground flex items-center gap-2">
                        <Truck className="h-4 w-4 text-blue-600" /> Countrywide Kenya Delivery
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Next-day parcel delivery (<strong>24–48 hours</strong>) to Mombasa, Kisumu, Nakuru, Eldoret, and all 47 counties.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-card border border-border space-y-1.5 shadow-xs">
                      <p className="font-bold text-sm text-foreground flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-amber-600" /> 100% Genuine Seal
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Every package carries the official BF Suma hologram seal and authentic batch verification code.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-card border border-border space-y-1.5 shadow-xs">
                      <p className="font-bold text-sm text-foreground flex items-center gap-2">
                        <RotateCcw className="h-4 w-4 text-primary" /> 7-Day Return Policy
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Unopened products can be returned or exchanged within 7 days of delivery with receipt.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 4: VIDEO */}
              {hasVideo && (
                <TabsContent value="video" className="mt-8">
                  <div className="max-w-3xl space-y-3">
                    <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black shadow-luxury border border-border">
                      <iframe
                        src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0`}
                        title={`${product.name} - Video Demo`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      Watch how {product.name} works and how to incorporate it into your daily wellness routine.
                    </p>
                  </div>
                </TabsContent>
              )}

              {/* TAB 5: REVIEWS */}
              <TabsContent value="reviews" className="mt-8">
                <div className="max-w-3xl">
                  {id && <ProductReviews productId={id} />}
                </div>
              </TabsContent>
            </Tabs>
          </div>


          {/* ── Related Products ── */}
          {relatedProducts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground">
                  You May Also Like
                </h2>
                <Link to="/shop">
                  <Button variant="outline" className="rounded-full border-primary/30 text-primary hover:bg-primary hover:text-white transition-all">
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map((rp) => (
                  <ProductCard
                    key={rp.id}
                    id={rp.id}
                    name={rp.name}
                    price={Number(rp.price)}
                    comparePrice={(rp as ExtendedProduct).compare_price ? Number((rp as ExtendedProduct).compare_price) : undefined}
                    rating={Number(rp.rating) || 5}
                    image={rp.image_url || "/placeholder.svg"}
                    category={rp.categories?.name || ""}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Sticky Mobile Add to Cart ── */}
      {stock > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/95 backdrop-blur-md border-t border-border shadow-luxury px-4 py-3 safe-area-inset-bottom">
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <div>
              <p className="font-bold text-primary text-lg leading-none">KSH {price.toLocaleString()}</p>
              {comparePrice && comparePrice > price && (
                <p className="text-xs text-muted-foreground line-through">{comparePrice.toLocaleString()}</p>
              )}
            </div>
            <Button
              className={`flex-1 h-12 rounded-full font-bold text-sm transition-all duration-300 ${added ? "bg-green-500 hover:bg-green-500 text-white" : "gradient-primary"
                }`}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {added ? "Added ✓" : "Add to Cart"}
            </Button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProductDetail;

