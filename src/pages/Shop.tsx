import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import SEOHead from "@/components/SEOHead";

const PAGE_SIZE = 12;

type SortOption = "newest" | "price_asc" | "price_desc" | "rating";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);
  const selectedCategory = searchParams.get("category");

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ["products", selectedCategory, searchQuery, sortBy],
    queryFn: async () => {
      let query = supabase.from("products").select("*, categories(name)").eq("is_active", true);

      if (selectedCategory) {
        const category = categories.find((c) => c.slug === selectedCategory);
        if (category) query = query.eq("category_id", category.id);
      }

      if (searchQuery) query = query.ilike("name", `%${searchQuery}%`);

      switch (sortBy) {
        case "price_asc":
          query = query.order("price", { ascending: true });
          break;
        case "price_desc":
          query = query.order("price", { ascending: false });
          break;
        case "rating":
          query = query.order("rating", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: categories.length > 0,
  });

  const handleCategoryClick = (slug: string | null) => {
    setPage(1);
    if (slug) setSearchParams({ category: slug });
    else setSearchParams({});
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleSort = (value: SortOption) => {
    setSortBy(value);
    setPage(1);
  };

  // Client-side paginate
  const products = allProducts.slice(0, page * PAGE_SIZE);
  const hasMore = products.length < allProducts.length;

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Shop"
        description="Browse our full range of authentic BF Suma wellness products — immune boosters, digestive health, bone care, cardiovascular support & more. Fast delivery across Kenya."
      />
      <Header />

      <section className="relative bg-gradient-primary text-primary-foreground py-14 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-semibold tracking-wider uppercase mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Authentic BF Suma Products
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 tracking-tight leading-tight">
              Wellness Collection
            </h1>
            <p className="text-sm sm:text-base md:text-lg opacity-85 leading-relaxed max-w-2xl">
              Browse our complete range of science-led health products — from immune support and gut health to bone care and cardiovascular wellness.
            </p>
            {/* Stat pills */}
            <div className="flex flex-wrap gap-3 mt-8">
              {[
                { label: "Products", value: "50+" },
                { label: "Categories", value: "9" },
                { label: "Delivery", value: "Kenya-Wide" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-sm">
                  <span className="font-bold text-accent">{s.value}</span>
                  <span className="opacity-80">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12 bg-background flex-1 animated-bg animated-bg-secondary">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          {/* Filters & Search */}
          <div className="mb-6 md:mb-8 space-y-3 md:space-y-4">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 md:pl-12 h-11 md:h-12 rounded-full border-border text-sm md:text-base"
                />
              </div>
              {/* Sort */}
              <Select value={sortBy} onValueChange={(v) => handleSort(v as SortOption)}>
                <SelectTrigger className="w-full md:w-52 h-11 md:h-12 rounded-full">
                  <SlidersHorizontal className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price_asc">Price: Low &rarr; High</SelectItem>
                  <SelectItem value="price_desc">Price: High → Low</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Navigation */}
            <div className="w-full overflow-x-auto pb-4 scrollbar-none rounded-2xl bg-secondary/30 p-2 sm:p-3 border border-border/50 shadow-soft">
              <div className="flex gap-2 sm:gap-3 min-w-max">
                <button
                  className={`px-6 py-3 rounded-xl font-medium text-sm md:text-base border transition-all duration-300 ${!selectedCategory ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105" : "bg-card text-muted-foreground border-border hover:bg-primary/5 hover:border-primary/30"}`}
                  onClick={() => handleCategoryClick(null)}
                >
                  All Collection
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`px-6 py-3 rounded-xl font-medium text-sm md:text-base border transition-all duration-300 ${selectedCategory === category.slug ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105" : "bg-card text-muted-foreground border-border hover:bg-primary/5 hover:border-primary/30"}`}
                    onClick={() => handleCategoryClick(category.slug)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 md:mb-12">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-muted animate-pulse h-72" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 md:mb-12">
                {products.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground text-base sm:text-lg">No products found</p>
                  </div>
                ) : (
                  products.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      price={Number(product.price)}
                      rating={Number(product.rating) || 5}
                      image={product.image_url || "/placeholder.svg"}
                      category={product.categories?.name || ""}
                    />
                  ))
                )}
              </div>

              {hasMore && (
                <div className="text-center mb-8">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full px-10"
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Load More ({allProducts.length - products.length} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Shop;
