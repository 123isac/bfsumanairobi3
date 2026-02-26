import { Facebook, Instagram, Mail, Phone, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-6">
          {/* Brand Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                <span className="text-accent-foreground font-display font-bold text-2xl">B</span>
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="font-display font-bold text-2xl">BF Suma</span>
                <span className="text-xs tracking-wider opacity-90 font-medium">PREMIUM WELLNESS</span>
              </div>
            </div>
            <p className="text-base opacity-90 leading-relaxed max-w-lg mx-auto">
              Authentic wellness products for a healthier, more beautiful you. Experience premium quality that transforms lives.
            </p>
            <div className="flex space-x-4 pt-4">
              <a href="#" className="w-12 h-12 rounded-full bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-smooth hover:scale-110">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-12 h-12 rounded-full bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-smooth hover:scale-110">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-12 h-12 rounded-full bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-smooth hover:scale-110">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm opacity-80">
            © {new Date().getFullYear()} BF Suma. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-sm opacity-80 hover:opacity-100 hover:text-accent transition-smooth">
              Privacy Policy
            </a>
            <a href="#" className="text-sm opacity-80 hover:opacity-100 hover:text-accent transition-smooth">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
