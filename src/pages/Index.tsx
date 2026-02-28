import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Heart, Shield, Leaf, Bone, ArrowRight, Activity, Sun, Baby, Home, Star } from "lucide-react";
import { Link } from "react-router-dom";
import heroBanner from "@/assets/hero-banner.jpg";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { setReferralCode } from "@/utils/referral";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";

const Index = () => {
  const [searchParams] = useSearchParams();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setSubscribing(true);
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email: newsletterEmail.trim().toLowerCase() });
      if (error) {
        if (error.code === '23505') {
          toast.info('You are already subscribed!');
        } else {
          throw error;
        }
      } else {
        toast.success('Successfully subscribed! Welcome to our wellness community.');
        setNewsletterEmail('');
      }
    } catch {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  // Handle referral code from URL
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setReferralCode(ref);
      // Remove the ref parameter from URL without page reload
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: featuredProducts = [] } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .eq("is_active", true)
        .order("rating", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  const categoryIcons = {
    "Digestive Health": Activity,
    "Better Life": Sun,
    "Beauty & Antiaging": Sparkles,
    "Suma Baby": Baby,
    "Suma Living": Home,
    "Immune Boosters": Shield,
    "Premium Selected": Star,
    "Bone & Joint Care": Bone,
    "Cardio Vascular Health": Heart,
  };

  const categoryDescriptions = {
    "Digestive Health": "Support your digestive system health",
    "Better Life": "Products for a better and healthier life",
    "Beauty & Antiaging": "Premium skincare and youth preservation solutions",
    "Suma Baby": "Health and wellness for babies and children",
    "Suma Living": "Essential personal care items for daily use",
    "Immune Boosters": "Strengthen your immune system naturally",
    "Premium Selected": "Our carefully curated premium collection",
    "Bone & Joint Care": "Support for healthy bones and joints",
    "Cardio Vascular Health": "Products for a healthy heart and circulation",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Home"
        description="Authentic BF Suma wellness products in Nairobi — immune support, digestive health, bone care, cardiovascular & more. Science-led nutrition, fast delivery across Kenya."
      />
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroBanner}
            alt="Premium Wellness"
            className="w-full h-full object-cover scale-105 animate-[float_20s_ease-in-out_infinite] origin-center"
          />
          <div className="absolute inset-0 bg-primary/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center pt-20 pb-10">

          <div className="w-full max-w-5xl mx-auto space-y-10 sm:space-y-12 animate-fade-in text-center">

            {/* BF SUMA Interactive Meaning */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 bg-black/20 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl max-w-4xl mx-auto mb-10 transform hover:scale-[1.02] transition-transform duration-500">
              {[
                { l: "B", w: "Bright", c: "text-yellow-400" },
                { l: "F", w: "Future", c: "text-blue-400" },
                { l: "S", w: "Superior", c: "text-purple-400" },
                { l: "U", w: "Unique", c: "text-rose-400" },
                { l: "M", w: "Manufacturer", c: "text-emerald-400" },
                { l: "A", w: "America", c: "text-indigo-400" }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center group cursor-default">
                  <span className={`text-3xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-2 drop-shadow-md group-hover:-translate-y-2 transition-transform duration-300`}>
                    {item.l}
                  </span>
                  <span className={`text-[10px] md:text-xs lg:text-sm font-medium tracking-widest uppercase opacity-0 group-hover:opacity-100 ${item.c} transition-all duration-300 absolute -bottom-6`}>
                    {item.w}
                  </span>
                </div>
              ))}
            </div>

            <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-[1.1] tracking-tight text-white drop-shadow-lg">
              Achieve Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent via-yellow-300 to-accent mt-2 pb-2">Optimal Wellness</span>
            </h1>

            <p className="text-base sm:text-lg md:text-2xl text-white/90 font-light leading-relaxed max-w-3xl mx-auto px-2 sm:px-4 drop-shadow-md">
              Science-led wellness products for immunity, gut health, energy, and longevity. Experience authentic <strong className="font-semibold text-accent">American technology</strong> trusted by thousands across Kenya.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center pt-8 px-2 sm:px-4 max-w-md sm:max-w-none mx-auto">
              <Link to="/shop" className="w-full sm:w-auto">
                <Button size="lg" className="gradient-gold hover:shadow-[0_0_30px_rgba(255,180,0,0.5)] text-accent-foreground font-bold w-full sm:w-auto px-10 py-7 text-lg rounded-full shadow-2xl transition-all duration-300 hover:scale-105">
                  Shop Now <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
              <Link to="/about" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 w-full sm:w-auto px-10 py-7 text-lg rounded-full transition-all duration-300">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="bg-background border-b border-border py-4 relative z-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { icon: "✅", label: "100% Authentic", sub: "Certified BF Suma products" },
              { icon: "🚚", label: "Kenya-Wide Delivery", sub: "Fast shipping nationwide" },
              { icon: "🔒", label: "Secure Checkout", sub: "M-Pesa & card accepted" },
              { icon: "🌿", label: "10+ Years Trusted", sub: "Science-led formulations" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1 py-2">
                <span className="text-2xl">{item.icon}</span>
                <span className="font-semibold text-sm text-foreground">{item.label}</span>
                <span className="text-xs text-muted-foreground">{item.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Offers & New Arrivals */}
      <section className="py-8 bg-transparent relative z-20 -mt-10 sm:-mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Promo Card 1 */}
            <div className="bg-gradient-primary rounded-3xl p-8 text-white shadow-luxury relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold tracking-wider mb-4 border border-white/30 backdrop-blur-sm">BEST SELLER</span>
                <h3 className="font-display font-bold text-2xl mb-2">Immune Booster Bundle</h3>
                <p className="text-white/80 text-sm mb-6 max-w-[200px]">Strengthen your body's natural defences with our #1 immunity protocol.</p>
                <Link to="/shop?category=immune-boosters" className="inline-flex items-center text-sm font-bold hover:translate-x-2 transition-transform">
                  Shop Now <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Promo Card 2 */}
            <div className="gradient-gold rounded-3xl p-8 text-primary shadow-luxury relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/30 rounded-full blur-2xl group-hover:scale-150 transition-all duration-500"></div>
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 bg-primary/10 rounded-full text-[10px] font-bold tracking-wider mb-4 border border-primary/20 backdrop-blur-sm text-primary">SPECIAL OFFER</span>
                <h3 className="font-display font-bold text-2xl mb-2">20% Off Digestive Health</h3>
                <p className="text-primary/80 text-sm mb-6 max-w-[200px]">Support your gut — the foundation of overall health and immunity.</p>
                <Link to="/shop?category=digestive-health" className="inline-flex items-center text-sm font-bold hover:translate-x-2 transition-transform text-primary">
                  Claim Offer <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Promo Card 3 */}
            <div className="bg-card rounded-3xl p-8 text-foreground shadow-luxury relative overflow-hidden group hidden lg:block border border-border">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl group-hover:scale-125 transition-all duration-700"></div>
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 bg-primary/5 rounded-full text-[10px] font-bold tracking-wider mb-4 border border-primary/10 text-primary">BEST SELLER</span>
                <h3 className="font-display font-bold text-2xl mb-2">Bone & Joint Care</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-[200px]">Our #1 rated supplement for active lifestyles.</p>
                <Link to="/shop?category=bone-joint-care" className="inline-flex items-center text-sm font-bold hover:translate-x-2 transition-transform text-primary">
                  Explore <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 sm:py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs font-semibold tracking-widest uppercase mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              What We Offer
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-foreground mb-4 tracking-tight">
              Wellness Categories
            </h2>
            <div className="w-16 h-1 bg-accent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
              Nine science-backed health categories designed for your unique wellness goals
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {categories.map((category, index) => (
              <div key={category.id} className="animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                <CategoryCard
                  title={category.name}
                  description={categoryDescriptions[category.name as keyof typeof categoryDescriptions] || category.description || ""}
                  icon={categoryIcons[category.name as keyof typeof categoryIcons] || Sparkles}
                  href={`/shop?category=${category.slug}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Favorites / Best Sellers */}
      <section className="py-12 sm:py-16 md:py-24" style={{ background: "#FAF7F2" }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 sm:mb-14">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs font-semibold tracking-widest uppercase mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                🔥 Best Sellers
              </div>
              <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-foreground tracking-tight">
                Customer Favorites
              </h2>
              <div className="w-16 h-1 bg-amber-400 rounded-full mt-3 mb-3" />
              <p className="text-muted-foreground text-base max-w-lg">
                Discover the products everyone is adding to their routine.
              </p>
            </div>
            <Link to="/shop">
              <Button variant="outline" className="rounded-full border-primary/30 text-primary hover:bg-primary hover:text-white transition-all duration-300">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-10">
            {featuredProducts.map((product, index) => {
              const badges = ["BEST SELLER", "BEST SELLER", "HOT", "TRENDING"];
              const badge = index < 4 ? badges[index] : undefined;
              return (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={Number(product.price)}
                  comparePrice={product.compare_price ? Number(product.compare_price) : undefined}
                  rating={Number(product.rating) || 5}
                  image={product.image_url || "/placeholder.svg"}
                  category={product.categories?.name || ""}
                  badge={badge}
                />
              );
            })}
          </div>

          {/* Social proof strip */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 py-6 px-6 bg-white rounded-2xl border border-amber-100 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {["🟢", "🟡", "🟣", "🔵"].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-white flex items-center justify-center text-sm">{c}</div>
                ))}
              </div>
              <p className="text-sm font-semibold text-foreground">2,000+ happy customers nationwide</p>
            </div>
            <div className="hidden sm:block w-px h-8 bg-border" />
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-sm font-semibold text-foreground ml-1">Rated 4.8/5 by verified buyers</span>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link to="/shop">
              <Button size="lg" className="gradient-primary hover:shadow-lg hover:shadow-primary/30 px-10 py-6 text-base sm:text-lg rounded-full shadow-medium transition-all duration-300 hover:scale-105">
                Shop All Products <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Ribbon */}
      <section className="bg-primary text-primary-foreground py-10">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "10,000+", label: "Happy Customers" },
              { value: "50+", label: "Wellness Products" },
              { value: "10+", label: "Years of Science" },
              { value: "47", label: "Counties Delivered" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1">
                <span className="font-display font-bold text-3xl sm:text-4xl text-accent">{stat.value}</span>
                <span className="text-sm opacity-80 font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spa Partner Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-accent/10 via-primary/5 to-secondary/10 animated-bg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card/50 backdrop-blur-sm rounded-3xl shadow-luxury border border-border/50 p-6 sm:p-8 md:p-12">
              <div className="text-center space-y-4 sm:space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-gold mb-4">
                  <Sparkles className="h-8 w-8 text-accent-foreground" />
                </div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-foreground tracking-tight px-2">
                  Become a BF Suma Partner
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
                  Join our exclusive referral program and earn commissions on every sale. Perfect for spas, wellness centers, and health practitioners.
                </p>
                <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 pt-6 max-w-2xl mx-auto">
                  <div className="space-y-2">
                    <div className="text-2xl sm:text-3xl font-bold text-primary">15%</div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Commission per sale</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl sm:text-3xl font-bold text-primary">Fast</div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Approval process</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl sm:text-3xl font-bold text-primary">Free</div>
                    <p className="text-xs sm:text-sm text-muted-foreground">No joining fees</p>
                  </div>
                </div>
                <div className="pt-4">
                  <Link to="/spa/register">
                    <Button size="lg" className="gradient-primary hover:shadow-luxury px-8 py-6 text-base sm:text-lg rounded-full shadow-medium">
                      Apply to Become a Partner <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12 sm:py-16 md:py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-4 sm:space-y-6">
            <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-tight px-2">
              Join Our Wellness Community
            </h2>
            <p className="text-sm sm:text-base md:text-lg opacity-90 px-2">
              Subscribe for exclusive offers, wellness tips, and new product launches
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2 sm:pt-4 px-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 h-12 sm:h-14 rounded-full text-base px-6"
                required
              />
              <Button
                type="submit"
                disabled={subscribing}
                className="gradient-gold text-accent-foreground font-semibold h-12 sm:h-14 px-8 rounded-full hover:shadow-gold shadow-medium whitespace-nowrap"
              >
                {subscribing ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
