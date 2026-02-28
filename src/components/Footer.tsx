import { Facebook, Instagram, Mail, Phone, Youtube } from "lucide-react";
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
              Science-led wellness products for immunity, gut health, energy and longevity.
              Authentic BF Suma &#8212; trusted by thousands across Kenya.
            </p>
            <div className="flex space-x-4 pt-4">
              <a
                href="https://www.facebook.com/bfsumanairobi"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-12 h-12 rounded-full bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/bfsumanairobi"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-12 h-12 rounded-full bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.youtube.com/@bfsumanairobi"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-12 h-12 rounded-full bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="mailto:info@bfsumanairobi.com"
                aria-label="Email us"
                className="w-12 h-12 rounded-full bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <Mail className="h-5 w-5" />
              </a>
              <a
                href="tel:+254700000000"
                aria-label="Call us"
                className="w-12 h-12 rounded-full bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <Phone className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm opacity-80">
            &copy; {new Date().getFullYear()} BF Suma Nairobi. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link to="/contact" className="text-sm opacity-80 hover:opacity-100 hover:text-accent transition-all duration-300">
              Contact Us
            </Link>
            <a href="mailto:info@bfsumanairobi.com" className="text-sm opacity-80 hover:opacity-100 hover:text-accent transition-all duration-300">
              Privacy Policy
            </a>
            <a href="mailto:info@bfsumanairobi.com" className="text-sm opacity-80 hover:opacity-100 hover:text-accent transition-all duration-300">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
