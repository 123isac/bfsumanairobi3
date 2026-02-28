import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductReviews from "@/components/ProductReviews";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star, ShoppingCart, Heart, Shield, Leaf, Sparkles, Play,
  Truck, RotateCcw, CheckCircle2, Flame, Clock, ArrowRight,
} from "lucide-react";
import { useState } from "react";
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
  });

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
  const p = product as any;

  const price = Number(product.price);
  const comparePrice = p.compare_price ? Number(p.compare_price) : null;
  const savings = comparePrice && comparePrice > price ? comparePrice - price : null;
  const discountPct = savings && comparePrice ? Math.round((savings / comparePrice) * 100) : null;
  const stock = product.stock_quantity ?? 0;
  const lowStock = stock > 0 && stock <= 5;
  const rating = Number(product.rating || 5);

  // Parse benefits as bullet lines
  const benefitLines = (p.benefits || product.description || "")
    .split("\n")
    .filter((l: string) => l.trim().length > 0);

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

        <div className="container mx-auto px-4 lg:px-8 py-8 md:py-14 relative z-10">
          {/* ── Main Product Section ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 mb-16 md:mb-24">

            {/* LEFT — Image */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-secondary/40 shadow-luxury group">
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                {discountPct && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 bg-red-500 text-white text-sm font-bold rounded-full shadow-lg">
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

              {/* Delivery promise — desktop only here */}
              <div className="hidden lg:grid grid-cols-3 gap-3 text-center">
                {[
                  { icon: Truck, label: "2–3 Day Delivery", sub: "Nationwide" },
                  { icon: Shield, label: "100% Authentic", sub: "Certified BF Suma" },
                  { icon: RotateCcw, label: "Easy Returns", sub: "7-day policy" },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="bg-secondary/40 rounded-2xl p-4 flex flex-col items-center gap-1.5">
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="text-xs font-semibold text-foreground">{label}</span>
                    <span className="text-[10px] text-muted-foreground">{sub}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Product Info */}
            <div className="space-y-6">

              {/* Category + Name */}
              <div>
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-3 uppercase tracking-wide">
                  {product.categories?.name}
                </span>
                <h1 className="font-display font-bold text-3xl md:text-4xl xl:text-5xl text-foreground leading-tight mb-3">
                  {product.name}
                </h1>

                {/* Stars + Social proof */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-5 w-5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-foreground">{rating}.0</span>
                  <span className="text-sm text-muted-foreground">· 247 verified buyers</span>
                </div>
              </div>

              {/* Pricing */}
              <div className="flex items-end gap-4">
                <span className="font-display font-bold text-4xl md:text-5xl text-primary leading-none">
                  KSH {price.toLocaleString()}
                </span>
                {comparePrice && comparePrice > price && (
                  <div className="flex flex-col pb-1">
                    <span className="text-lg text-muted-foreground line-through leading-none">
                      KSH {comparePrice.toLocaleString()}
                    </span>
                    {savings && (
                      <span className="text-sm text-emerald-600 font-semibold mt-0.5">
                        Save KSH {savings.toLocaleString()} 🎉
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Urgency / Stock */}
              {lowStock && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
                  <Flame className="h-4 w-4 text-red-500 shrink-0" />
                  <span className="text-sm font-semibold text-red-600">
                    Only {stock} left in stock — order soon!
                  </span>
                </div>
              )}
              {stock === 0 && (
                <div className="flex items-center gap-2 px-4 py-3 bg-muted border border-border rounded-xl">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium text-muted-foreground">Out of stock — back soon</span>
                </div>
              )}
              {stock > 5 && (
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span className="font-medium">In stock — ready to ship</span>
                </div>
              )}

              {/* Description */}
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                {product.description || "Premium quality wellness product from BF Suma."}
              </p>

              {/* Quantity + Add to Cart */}
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <span className="font-medium text-sm">Qty:</span>
                  <div className="flex items-center border border-border rounded-full overflow-hidden">
                    <Button variant="ghost" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="rounded-none px-5 h-11">−</Button>
                    <span className="px-6 font-bold text-base">{quantity}</span>
                    <Button variant="ghost" size="sm" onClick={() => setQuantity(q => q + 1)} className="rounded-none px-5 h-11">+</Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    size="lg"
                    className={`flex-1 h-14 text-base font-bold rounded-full transition-all duration-300 ${added
                      ? "bg-green-500 hover:bg-green-500 text-white"
                      : "gradient-primary hover:shadow-luxury hover:scale-[1.02]"
                      }`}
                    onClick={handleAddToCart}
                    disabled={stock < 1}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {added ? "Added to Cart ✓" : stock > 0 ? `Add to Cart · KSH ${(price * quantity).toLocaleString()}` : "Out of Stock"}
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 w-14 rounded-full shrink-0 border-border hover:border-red-300 hover:text-red-500 transition-colors">
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>

                {/* Delivery + Returns row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-primary shrink-0" />
                    Order today → delivered in 2–3 days
                  </span>
                  <span className="hidden sm:block text-border">|</span>
                  <span className="flex items-center gap-1.5">
                    <RotateCcw className="h-4 w-4 text-primary shrink-0" />
                    7-day returns
                  </span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                {[
                  { Icon: Shield, label: "Authentic" },
                  { Icon: Leaf, label: "Natural" },
                  { Icon: Sparkles, label: "Premium" },
                ].map(({ Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                    <div className="w-10 h-10 rounded-full bg-primary/8 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Product Tabs ── */}
          <div className="mb-16 md:mb-24">
            <Tabs defaultValue="benefits" className="w-full">
              <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent h-auto p-0 gap-6 md:gap-8 overflow-x-auto">
                {[
                  { value: "benefits", label: "Benefits" },
                  { value: "ingredients", label: "Ingredients" },
                  ...(hasVideo ? [{ value: "video", label: "▶ Video" }] : []),
                  { value: "reviews", label: "Reviews" },
                ].map(({ value, label }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 whitespace-nowrap font-semibold text-base text-muted-foreground data-[state=active]:text-primary transition-colors"
                  >
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Benefits — visual checkmarks */}
              <TabsContent value="benefits" className="mt-8">
                <div className="max-w-3xl">
                  {benefitLines.length > 0 ? (
                    <ul className="space-y-3">
                      {benefitLines.map((line: string, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          </span>
                          <span className="text-base md:text-lg text-foreground leading-relaxed">{line}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-lg">
                      Premium quality wellness product from BF Suma — backed by science and nature.
                    </p>
                  )}
                </div>
              </TabsContent>

              {/* Ingredients */}
              <TabsContent value="ingredients" className="mt-8">
                <div className="max-w-3xl space-y-3">
                  {(p.ingredients || "").split("\n").filter((l: string) => l.trim()).map((line: string, i: number) => (
                    <p key={i} className="text-base md:text-lg text-foreground leading-relaxed">{line}</p>
                  ))}
                  {!p.ingredients && (
                    <p className="text-muted-foreground text-lg">
                      Premium natural ingredients carefully selected for quality and effectiveness.
                    </p>
                  )}
                </div>
              </TabsContent>

              {/* Video */}
              {hasVideo && (
                <TabsContent value="video" className="mt-8">
                  <div className="max-w-3xl">
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-luxury">
                      <iframe
                        src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0`}
                        title={`${product.name} - Video Demo`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                    <p className="mt-4 text-muted-foreground text-sm">
                      Watch how {product.name} works and its key benefits.
                    </p>
                  </div>
                </TabsContent>
              )}

              {/* Reviews */}
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
                    comparePrice={(rp as any).compare_price ? Number((rp as any).compare_price) : undefined}
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