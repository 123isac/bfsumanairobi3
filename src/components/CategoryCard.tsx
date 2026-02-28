import { LucideIcon, ArrowUpRight } from "lucide-react";
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
      className="group relative overflow-hidden rounded-2xl bg-card p-6 md:p-8 border border-border hover:border-primary/40 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
    >
      {/* Background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-2xl" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Icon */}
        <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
          <Icon className="h-7 w-7 text-primary-foreground" />
        </div>

        {/* Text */}
        <h3 className="font-display font-bold text-lg md:text-xl text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
          {title}
        </h3>

        <p className="text-muted-foreground text-sm leading-relaxed flex-1">
          {description}
        </p>

        {/* CTA row */}
        <div className="mt-5 flex items-center justify-between">
          <span className="text-sm font-semibold text-primary">
            Explore
          </span>
          <div className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
            <ArrowUpRight className="h-4 w-4 text-primary group-hover:text-white transition-colors duration-300" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
