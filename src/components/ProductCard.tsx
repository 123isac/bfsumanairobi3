import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({ id, name, price, image, category });
  };
  return (
    <div className="group relative bg-card rounded-xl sm:rounded-2xl overflow-hidden shadow-soft hover:shadow-luxury transition-smooth border border-border">
      <Link to={`/product/${id}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-secondary">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 sm:group-hover:scale-110 transition-smooth duration-500"
          />

          {/* Category Badge */}
          <div className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4">
            <span className="px-2 sm:px-3 py-1 bg-primary text-primary-foreground text-[10px] sm:text-xs font-medium rounded-full shadow-medium">
              {category}
            </span>
          </div>

          {/* Quick View Overlay - Hidden on mobile */}
          <div className="hidden sm:flex absolute inset-0 bg-gradient-hero opacity-0 group-hover:opacity-100 transition-smooth items-center justify-center">
            <span className="text-primary-foreground font-medium text-sm">Quick View</span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 sm:p-4 md:p-5">
        <Link to={`/product/${id}`}>
          <h3 className="font-display font-semibold text-sm sm:text-base md:text-lg mb-1 sm:mb-2 text-foreground group-hover:text-primary transition-smooth line-clamp-2 leading-tight">
            {name}
          </h3>
        </Link>

        {/* Rating - Hidden on smallest mobile */}
        <div className="hidden xs:flex items-center space-x-1 mb-2 sm:mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-3 sm:h-4 w-3 sm:w-4 ${i < rating ? "fill-accent text-accent" : "text-muted"
                }`}
            />
          ))}
        </div>

        {/* Price & Cart */}
        <div className="flex items-center justify-between mt-2 sm:mt-3">
          <div className="flex flex-col">
            <span className="font-display font-bold text-base sm:text-lg md:text-xl lg:text-2xl text-primary leading-tight">
              KSH {price.toLocaleString()}
            </span>
          </div>

          <Button
            size="icon"
            className="gradient-primary hover:shadow-gold transition-smooth rounded-full h-9 w-9 sm:h-10 sm:w-10 shrink-0"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
