import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductReviews from "@/components/ProductReviews";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, ShoppingCart, Heart, Shield, Leaf, Sparkles, Play } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";


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
        .limit(3);
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
  };

  const youtubeVideoId = getYouTubeVideoId(product.youtube_url || "");
  const hasVideo = !!youtubeVideoId;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12 bg-background animated-bg animated-bg-secondary">
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          {/* Product Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-secondary shadow-luxury">
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full mb-4">
                  {product.categories?.name}
                </span>
                <h1 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4">
                  {product.name}
                </h1>
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < Number(product.rating || 5) ? "fill-accent text-accent" : "text-muted"}`} />
                  ))}
                </div>
                <div className="font-display font-bold text-5xl text-primary mb-6">
                  KSH {Number(product.price).toLocaleString()}
                </div>
              </div>

              <p className="text-muted-foreground text-lg leading-relaxed">
                {product.description || "Premium quality wellness product from BF Suma"}
              </p>

              {/* Stock Info */}
              <div className="bg-secondary/50 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Stock Status:</span>
                  <span className={`font-semibold ${product.stock_quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                    {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : "Out of stock"}
                  </span>
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="font-medium">Quantity:</span>
                  <div className="flex items-center border border-border rounded-full overflow-hidden">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="rounded-none px-4"
                    >
                      -
                    </Button>
                    <span className="px-6 font-semibold">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                      className="rounded-none px-4"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    size="lg"
                    className="gradient-primary hover:shadow-luxury flex-1 h-14 text-lg rounded-full"
                    onClick={handleAddToCart}
                    disabled={product.stock_quantity < 1}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {product.stock_quantity > 0 ? "Add to Cart" : "Out of Stock"}
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 rounded-full">
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 md:gap-4 pt-4 md:pt-6 border-t border-border">
                <div className="text-center space-y-1 md:space-y-2">
                  <Shield className="h-6 w-6 md:h-8 md:w-8 text-primary mx-auto" />
                  <p className="text-xs md:text-sm font-medium">Authentic Products</p>
                </div>
                <div className="text-center space-y-1 md:space-y-2">
                  <Leaf className="h-6 w-6 md:h-8 md:w-8 text-primary mx-auto" />
                  <p className="text-xs md:text-sm font-medium">Natural Ingredients</p>
                </div>
                <div className="text-center space-y-1 md:space-y-2">
                  <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-primary mx-auto" />
                  <p className="text-xs md:text-sm font-medium">Premium Quality</p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mb-12 md:mb-20">
            <Tabs defaultValue="benefits" className="w-full">
              <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent h-auto p-0 space-x-4 md:space-x-8 overflow-x-auto">
                <TabsTrigger
                  value="benefits"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 md:pb-4 whitespace-nowrap"
                >
                  <span className="font-semibold text-base md:text-lg">Benefits</span>
                </TabsTrigger>
                <TabsTrigger
                  value="ingredients"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 md:pb-4 whitespace-nowrap"
                >
                  <span className="font-semibold text-base md:text-lg">Ingredients</span>
                </TabsTrigger>
                {hasVideo && (
                  <TabsTrigger
                    value="video"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 md:pb-4 whitespace-nowrap"
                  >
                    <span className="font-semibold text-base md:text-lg flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      Video Demo
                    </span>
                  </TabsTrigger>
                )}
                <TabsTrigger
                  value="reviews"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 md:pb-4 whitespace-nowrap"
                >
                  <span className="font-semibold text-base md:text-lg">Reviews</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="benefits" className="mt-6 md:mt-8">
                <div className="max-w-3xl space-y-3">
                  {(product.benefits || product.description || "").split("\n").map((line: string, i: number) => (
                    line.trim() ? (
                      <p key={i} className="text-base md:text-lg text-foreground leading-relaxed">
                        {line}
                      </p>
                    ) : <br key={i} />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="ingredients" className="mt-6 md:mt-8">
                <div className="max-w-3xl space-y-3">
                  {(product.ingredients || "").split("\n").map((line: string, i: number) => (
                    line.trim() ? (
                      <p key={i} className="text-base md:text-lg text-foreground leading-relaxed">
                        {line}
                      </p>
                    ) : <br key={i} />
                  ))}
                  {!product.ingredients && (
                    <p className="text-base md:text-lg text-muted-foreground">
                      Premium natural ingredients carefully selected for quality and effectiveness.
                    </p>
                  )}
                </div>
              </TabsContent>
              {hasVideo && (
                <TabsContent value="video" className="mt-6 md:mt-8">
                  <div className="max-w-3xl">
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-luxury">
                      <iframe
                        src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0`}
                        title={`${product.name} - Video Demo`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                    <p className="mt-4 text-muted-foreground text-sm">
                      Watch this video to learn more about how {product.name} works and its benefits.
                    </p>
                  </div>
                </TabsContent>
              )}
              <TabsContent value="reviews" className="mt-6 md:mt-8">
                <div className="max-w-3xl">
                  {id && <ProductReviews productId={id} />}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="font-display font-bold text-2xl md:text-3xl lg:text-4xl text-foreground mb-6 md:mb-8">You May Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {relatedProducts
                  .filter((rp) => rp.id !== id)
                  .map((relatedProduct) => (
                    <ProductCard
                      key={relatedProduct.id}
                      id={relatedProduct.id}
                      name={relatedProduct.name}
                      price={Number(relatedProduct.price)}
                      rating={Number(relatedProduct.rating) || 5}
                      image={relatedProduct.image_url || "/placeholder.svg"}
                      category={relatedProduct.categories?.name || ""}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;