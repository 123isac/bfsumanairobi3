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
  rating: number;
  image: string;
  category: string;
}

const ProductCard = ({ id, name, price, rating, image, category }: ProductCardProps) => {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({ id, name, price, image, category });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

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

          {/* Category pill */}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-primary text-[10px] font-semibold rounded-full shadow-sm uppercase tracking-wider">
              {category}
            </span>
          </div>

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
          <div>
            <span className="font-bold text-lg md:text-xl text-primary leading-none">
              KSH {price.toLocaleString()}
            </span>
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
      </div>
    </div>
  );
};

export default ProductCard;
