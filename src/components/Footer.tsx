import { Facebook, Instagram, Mail, Phone, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <span className="text-accent-foreground font-display font-bold text-xl">B</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-xl">BF Suma</span>
                <span className="text-xs tracking-wider opacity-80">PREMIUM WELLNESS</span>
              </div>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              Authentic wellness products for a healthier, more beautiful you. Experience premium quality that transforms lives.
            </p>
            <div className="flex space-x-3 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-smooth">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-smooth">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-smooth">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/shop" className="text-sm opacity-80 hover:opacity-100 hover:text-accent transition-smooth">
                  Shop All Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm opacity-80 hover:opacity-100 hover:text-accent transition-smooth">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm opacity-80 hover:opacity-100 hover:text-accent transition-smooth">
                  Contact
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm opacity-80 hover:opacity-100 hover:text-accent transition-smooth">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Categories</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm opacity-80 hover:opacity-100 hover:text-accent transition-smooth">
                  Youth Essence
                </a>
              </li>
              <li>
                <a href="#" className="text-sm opacity-80 hover:opacity-100 hover:text-accent transition-smooth">
                  Skin Care
                </a>
              </li>
              <li>
                <a href="#" className="text-sm opacity-80 hover:opacity-100 hover:text-accent transition-smooth">
                  Immune Booster
                </a>
              </li>
              <li>
                <a href="#" className="text-sm opacity-80 hover:opacity-100 hover:text-accent transition-smooth">
                  Bone & Joint Care
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Get in Touch</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <Phone className="h-5 w-5 mt-0.5 opacity-80" />
                <div>
                  <p className="text-sm font-medium">Call Us</p>
                  <p className="text-sm opacity-80">+254 700 000 000</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Mail className="h-5 w-5 mt-0.5 opacity-80" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm opacity-80">info@bfsuma.com</p>
                </div>
              </li>
            </ul>
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
