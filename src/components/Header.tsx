import { ShoppingCart, Menu, X, Sun, Moon, User as UserIcon, LogOut, LayoutDashboard, ShoppingBag, Settings, Sparkles, Headphones, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useStaffAuth } from "@/contexts/StaffAuthContext";
import { useTheme } from "next-themes";
import { WellnessAssistantModal } from "@/components/WellnessAssistantModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { user, signOut } = useAuth();
  const { isAdmin, isStaff, role } = useStaffAuth();
  const { theme, setTheme } = useTheme();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-soft">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group shrink-0 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full gradient-primary flex items-center justify-center transition-smooth group-hover:scale-110 shrink-0 shadow-sm">
                <span className="text-primary-foreground font-display font-bold text-lg sm:text-xl">B</span>
              </div>
              <div className="flex flex-col leading-tight min-w-0">
                <span className="font-display font-bold text-base sm:text-xl text-foreground truncate">BF Suma</span>
                <span className="text-[9px] sm:text-xs text-muted-foreground tracking-wider font-semibold uppercase truncate">PREMIUM WELLNESS</span>
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
                to="/my-orders"
                className={`font-medium transition-smooth hover:text-primary ${isActive("/my-orders") ? "text-primary" : "text-foreground"
                  }`}
              >
                My Orders
              </Link>
              <Link
                to="/contact"
                className={`font-medium transition-smooth hover:text-primary ${isActive("/contact") ? "text-primary" : "text-foreground"
                  }`}
              >
                Contact
              </Link>
            </nav>

            {/* Cart & Upper Header Actions */}
            <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
              {/* Upper Support & Help Desk Button */}
              <button
                type="button"
                onClick={() => setAssistantOpen(true)}
                className="group flex items-center gap-1.5 rounded-full pl-1 sm:pl-1.5 pr-2.5 sm:pr-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700/50 shadow-sm transition-all duration-200 shrink-0"
                aria-label="Customer Support and Health Advisor"
              >
                {/* Support Agent Avatar Image / Badge */}
                <div className="relative flex items-center justify-center shrink-0">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                    <Headphones className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </div>
                  {/* Live Online Green Pulse Indicator */}
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 border border-background"></span>
                  </span>
                </div>

                <div className="flex flex-col text-left leading-none">
                  <span className="text-[10px] sm:text-[11px] font-bold text-foreground group-hover:text-primary transition-colors">
                    Support
                  </span>
                  <span className="text-[8px] sm:text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 hidden min-[420px]:inline">
                    Online
                  </span>
                </div>

              </button>

              {/* Dark Mode Toggle (Desktop) */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9 hidden sm:inline-flex"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle dark mode"
              >
                {theme === "dark" ? <Sun className="h-4 w-4 sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5" />}
              </Button>

              {/* Shopping Cart */}
              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative hover:bg-secondary h-8 w-8 sm:h-9 sm:w-9 shrink-0">
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] sm:text-xs font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center shadow-gold">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </Link>

              {/* User Account / Profile Dropdown */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full bg-primary/10 hover:bg-primary/20 text-primary h-8 w-8 sm:h-9 sm:w-9 shrink-0">
                      <UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none text-foreground truncate">
                          {user.user_metadata?.full_name || "My Account"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <span>Profile & Address Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/my-orders" className="cursor-pointer flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4" />
                        <span>Order History</span>
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin/dashboard" className="cursor-pointer flex items-center gap-2 text-primary font-medium">
                          <LayoutDashboard className="h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {isStaff && !isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/staff/dashboard" className="cursor-pointer flex items-center gap-2 text-purple-600 font-medium">
                          <LayoutDashboard className="h-4 w-4" />
                          <span>Staff Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-1.5 rounded-full px-4 h-9">
                    <UserIcon className="h-4 w-4" />
                    <span>Sign In</span>
                  </Button>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8 sm:h-9 sm:w-9 shrink-0"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 space-y-3 border-t border-border animate-fade-in">
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
                to="/my-orders"
                className={`block py-2 font-medium transition-smooth hover:text-primary ${isActive("/my-orders") ? "text-primary" : "text-foreground"
                  }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                My Orders
              </Link>
              {user ? (
                <Link
                  to="/profile"
                  className={`block py-2 font-medium transition-smooth hover:text-primary ${isActive("/profile") ? "text-primary" : "text-foreground"
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile & Address Settings
                </Link>
              ) : (
                <Link
                  to="/auth"
                  className={`block py-2 font-medium transition-smooth text-primary`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In / Register
                </Link>
              )}
              <Link
                to="/contact"
                className={`block py-2 font-medium transition-smooth hover:text-primary ${isActive("/contact") ? "text-primary" : "text-foreground"
                  }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>

              {/* Mobile Theme Switcher */}
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Theme</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="h-8 text-xs gap-1.5 rounded-full"
                >
                  {theme === "dark" ? <Sun className="h-3.5 w-3.5 text-yellow-500" /> : <Moon className="h-3.5 w-3.5 text-blue-500" />}
                  <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                </Button>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Upper Wellness Assistant Dialog */}
      <WellnessAssistantModal open={assistantOpen} onOpenChange={setAssistantOpen} />
    </>
  );
};

export default Header;
