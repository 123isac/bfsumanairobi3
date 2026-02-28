import { ShoppingCart, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  comparePrice?: number;   // original / crossed-out price
  rating: number;
  image: string;
  category: string;
  badge?: string;          // e.g. "BEST SELLER", "HOT", "TRENDING"
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
    addItem({ id, name, price, image, category });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const savings = comparePrice && comparePrice > price ? comparePrice - price : null;
  const discountPct = savings && comparePrice ? Math.round((savings / comparePrice) * 100) : null;

  return (
    <div className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 shadow-sm hover:shadow-xl transition-all duration-400 flex flex-col">
      <Link to={`/product/${id}`} className="block">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-secondary/50">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-600 ease-out"
          />

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badge (top-left) — Best Seller, Hot, etc. */}
          <div className="absolute top-3 left-3">
            {badge ? (
              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full shadow-sm uppercase tracking-wider ${BADGE_STYLES[badge] ?? "bg-primary text-primary-foreground"}`}>
                {badge}
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-primary text-[10px] font-semibold rounded-full shadow-sm uppercase tracking-wider">
                {category}
              </span>
            )}
          </div>

          {/* Discount % bubble (top-right) */}
          {discountPct && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                -{discountPct}%
              </span>
            </div>
          )}

          {/* Quick View button — appears on hover */}
          <div className="absolute inset-x-0 bottom-3 flex justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <span className="flex items-center gap-1.5 px-4 py-2 bg-white/95 backdrop-blur-sm text-primary text-xs font-semibold rounded-full shadow-lg">
              <Eye className="h-3.5 w-3.5" />
              View Details
            </span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Stars */}
        <div className="flex items-center gap-0.5 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
            />
          ))}
          <span className="text-[10px] text-muted-foreground ml-1">{rating}.0</span>
        </div>

        {/* Name */}
        <Link to={`/product/${id}`} className="flex-1">
          <h3 className="font-semibold text-sm md:text-base text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2 leading-snug mb-3">
            {name}
          </h3>
        </Link>

        {/* Price + Add to Cart */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <div className="flex flex-col">
            <span className="font-bold text-lg md:text-xl text-primary leading-none">
              KSH {price.toLocaleString()}
            </span>
            {comparePrice && comparePrice > price && (
              <span className="text-xs text-muted-foreground line-through leading-tight mt-0.5">
                KSH {comparePrice.toLocaleString()}
              </span>
            )}
          </div>

          <Button
            size="sm"
            className={`rounded-full h-9 px-4 text-xs font-semibold transition-all duration-300 shrink-0 ${added
                ? "bg-green-500 hover:bg-green-500 text-white shadow-green-200 shadow-md"
                : "gradient-primary hover:shadow-md hover:shadow-primary/30"
              }`}
            onClick={handleAddToCart}
          >
            {added ? (
              "Added ✓"
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                Add
              </>
            )}
          </Button>
        </div>

        {/* Savings tag */}
        {savings && savings > 0 && (
          <p className="text-[10px] text-emerald-600 font-semibold mt-1.5">
            You save KSH {savings.toLocaleString()} 🎉
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
