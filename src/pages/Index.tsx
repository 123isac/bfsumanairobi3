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
        .limit(4);
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
        description="Discover authentic BF Suma wellness, health & beauty products. Shop online with fast delivery across Kenya."
      />
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[85vh] md:h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroBanner}
            alt="Premium Wellness"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 gradient-hero" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center text-primary-foreground py-8 md:py-0">
          <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6 md:space-y-8 animate-fade-in">
            <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-6xl lg:text-7xl leading-[1.1] tracking-tight">
              Discover Your
              <span className="block text-accent mt-2">Natural Beauty</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl opacity-90 leading-relaxed max-w-2xl mx-auto px-2 sm:px-4">
              Premium BF Suma wellness products crafted to enhance your health and radiance. Experience authentic quality that transforms lives.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 sm:pt-6 px-2 sm:px-4 max-w-md sm:max-w-none mx-auto">
              <Link to="/shop" className="w-full sm:w-auto">
                <Button size="lg" className="gradient-gold hover:shadow-gold text-accent-foreground font-semibold w-full sm:w-auto px-8 py-6 text-base rounded-full shadow-luxury">
                  Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="bg-primary-foreground/10 backdrop-blur-sm border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 w-full sm:w-auto px-8 py-6 text-base rounded-full">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-10 sm:py-14 md:py-20 bg-background animated-bg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-foreground mb-3 md:mb-4 tracking-tight">
              Wellness Categories
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2 sm:px-4">
              Explore our premium collection of wellness products designed for your unique needs
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
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

      {/* Featured Products */}
      <section className="py-10 sm:py-14 md:py-20 bg-secondary/30 animated-bg animated-bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-foreground mb-3 sm:mb-4 tracking-tight">
              Featured Products
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2 sm:px-4">
              Discover our best-selling wellness solutions trusted by thousands
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-10 md:mb-12">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={Number(product.price)}
                rating={Number(product.rating) || 5}
                image={product.image_url || "/placeholder.svg"}
                category={product.categories?.name || ""}
              />
            ))}
          </div>

          <div className="text-center px-4">
            <Link to="/shop" className="block sm:inline-block">
              <Button size="lg" className="gradient-primary hover:shadow-luxury px-8 py-6 text-base sm:text-lg rounded-full w-full sm:w-auto shadow-medium">
                View All Products <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
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
