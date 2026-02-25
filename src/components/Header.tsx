import { ShoppingCart, Menu, X, User, LogOut, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";


const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();


  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

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
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="hidden sm:flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden lg:inline">Sign Out</span>
              </Button>
            ) : (
              <Link to="/auth" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden lg:inline">Login</span>
                </Button>
              </Link>
            )}

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

            {user ? (
              <Button
                variant="outline"
                onClick={() => {
                  handleSignOut();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 justify-center"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            ) : (
              <Link to="/auth" className="block" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full flex items-center gap-2 justify-center">
                  <User className="h-4 w-4" />
                  Login / Sign Up
                </Button>
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
