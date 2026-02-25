import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
}

const CategoryCard = ({ title, description, icon: Icon, href }: CategoryCardProps) => {
  return (
    <Link
      to={href}
      className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-card p-5 sm:p-6 md:p-8 shadow-soft hover:shadow-luxury transition-smooth border border-border"
    >
      <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-smooth" />
      
      <div className="relative z-10">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl gradient-primary flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-smooth shadow-medium">
          <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary-foreground" />
        </div>
        
        <h3 className="font-display font-semibold text-base sm:text-lg md:text-xl mb-2 text-foreground group-hover:text-primary transition-smooth">
          {title}
        </h3>
        
        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
          {description}
        </p>
        
        <div className="mt-3 sm:mt-4 flex items-center text-primary font-medium text-xs sm:text-sm group-hover:translate-x-2 transition-smooth">
          Explore <span className="ml-2">→</span>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
