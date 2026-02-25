import { ShoppingCart, Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

import { useTheme } from "next-themes";


const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();

  const { theme, setTheme } = useTheme();


  const isActive = (path: string) => location.pathname === path;



  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-soft">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center transition-smooth group-hover:scale-110">
              <span className="text-primary-foreground font-display font-bold text-xl">B</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl text-foreground">BF Suma</span>
              <span className="text-xs text-muted-foreground tracking-wider">PREMIUM WELLNESS</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`font-medium transition-smooth hover:text-primary ${isActive("/") ? "text-primary" : "text-foreground"
                }`}
            >
              Home
            </Link>
            <Link
              to="/shop"
              className={`font-medium transition-smooth hover:text-primary ${isActive("/shop") ? "text-primary" : "text-foreground"
                }`}
            >
              Shop
            </Link>
            <Link
              to="/about"
              className={`font-medium transition-smooth hover:text-primary ${isActive("/about") ? "text-primary" : "text-foreground"
                }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`font-medium transition-smooth hover:text-primary ${isActive("/contact") ? "text-primary" : "text-foreground"
                }`}
            >
              Contact
            </Link>
          </nav>

          {/* Cart & User Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>


            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative hover:bg-secondary">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-gold">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 space-y-4 border-t border-border animate-fade-in">
            <Link
              to="/"
              className={`block py-2 font-medium transition-smooth hover:text-primary ${isActive("/") ? "text-primary" : "text-foreground"
                }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/shop"
              className={`block py-2 font-medium transition-smooth hover:text-primary ${isActive("/shop") ? "text-primary" : "text-foreground"
                }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Shop
            </Link>
            <Link
              to="/about"
              className={`block py-2 font-medium transition-smooth hover:text-primary ${isActive("/about") ? "text-primary" : "text-foreground"
                }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`block py-2 font-medium transition-smooth hover:text-primary ${isActive("/contact") ? "text-primary" : "text-foreground"
                }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>


          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
