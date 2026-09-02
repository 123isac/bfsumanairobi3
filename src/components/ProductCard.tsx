import { ShoppingCart, Star, Eye, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  comparePrice?: number;
  rating: number;
  image: string;
  category: string;
  badge?: string;
}

const BADGE_STYLES: Record<string, string> = {
  "BEST SELLER": "bg-amber-500 text-white",
  "HOT": "bg-red-500 text-white",
  "TRENDING": "bg-primary text-primary-foreground",
  "MOST LOVED": "bg-rose-500 text-white",
  "NEW": "bg-emerald-500 text-white",
};

const ProductCard = ({ id, name, price, comparePrice, rating, image, category, badge }: ProductCardProps) => {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id, name, price, image, category });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const savings = comparePrice && comparePrice > price ? comparePrice - price : null;
  const discountPct = savings && comparePrice ? Math.round((savings / comparePrice) * 100) : null;
  const filledStars = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <div className="group relative bg-card rounded-2xl overflow-hidden border border-border/80 hover:border-primary/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full justify-between">
      {/* Product Image Area */}
      <Link to={`/product/${id}`} className="block relative aspect-square w-full bg-white dark:bg-muted/20 overflow-hidden flex items-center justify-center p-3 sm:p-4">
        <img
          src={image}
          alt={name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Subtle Dark Hover Tint */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badge (top-left) */}
        <div className="absolute top-2.5 left-2.5 z-10">
          {badge ? (
            <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-bold rounded-full shadow-sm uppercase tracking-wider ${BADGE_STYLES[badge] ?? "bg-primary text-primary-foreground"}`}>
              {badge}
            </span>
          ) : category ? (
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-white/95 dark:bg-card/90 backdrop-blur-sm text-primary text-[9px] sm:text-[10px] font-semibold rounded-full shadow-sm border border-border/40 uppercase tracking-wider truncate max-w-[120px] inline-block">
              {category}
            </span>
          ) : null}
        </div>

        {/* Discount Badge (top-right) */}
        {discountPct && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full shadow-sm">
              -{discountPct}%
            </span>
          </div>
        )}

        {/* Quick View Pill on Hover */}
        <div className="hidden sm:flex absolute inset-x-0 bottom-3 justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-10">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 dark:bg-card/95 backdrop-blur-sm text-primary text-xs font-semibold rounded-full shadow-md border border-border/40">
            <Eye className="h-3.5 w-3.5" />
            Quick View
          </span>
        </div>
      </Link>

      {/* Product Content Details */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2">
        <div>
          {/* Rating Stars */}
          <div className="flex items-center gap-0.5 mb-1.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${i < filledStars ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
              />
            ))}
            <span className="text-[10px] text-muted-foreground ml-1 font-medium">{rating.toFixed(1)}</span>
          </div>

          {/* Product Title */}
          <Link to={`/product/${id}`} className="block">
            <h3 className="font-semibold text-xs sm:text-sm md:text-base text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] leading-snug">
              {name}
            </h3>
          </Link>
        </div>

        {/* Price & Add to Cart Action Footer */}
        <div className="mt-auto pt-2.5 border-t border-border/50 flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Price Container */}
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm sm:text-base md:text-lg text-primary leading-tight truncate">
              KSH {price.toLocaleString()}
            </span>
            {comparePrice && comparePrice > price ? (
              <span className="text-[10px] sm:text-xs text-muted-foreground line-through leading-none mt-0.5 truncate">
                KSH {comparePrice.toLocaleString()}
              </span>
            ) : null}
          </div>

          {/* Add to Cart Button */}
          <Button
            size="sm"
            onClick={handleAddToCart}
            className={`h-8 sm:h-9 px-2.5 sm:px-3.5 text-xs font-semibold rounded-full shrink-0 flex items-center justify-center transition-all duration-300 ${
              added
                ? "bg-emerald-600 hover:bg-emerald-600 text-white shadow-sm"
                : "gradient-primary hover:shadow-md hover:shadow-primary/20 text-white"
            }`}
          >
            {added ? (
              <span className="flex items-center gap-1">
                <Check className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Added</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>Add</span>
              </span>
            )}

          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;




