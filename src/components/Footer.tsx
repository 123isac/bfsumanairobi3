import { Facebook, Instagram, Mail, Phone, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { SUPPORT_EMAIL, SUPPORT_PHONE_RAW, SUPPORT_WHATSAPP_NUMBER } from "@/config/site";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-16">

        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">

          {/* Brand column */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                <span className="text-accent-foreground font-display font-bold text-2xl">B</span>
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="font-display font-bold text-2xl">BF Suma</span>
                <span className="text-xs tracking-wider opacity-90 font-medium">PREMIUM WELLNESS</span>
              </div>
            </div>
            <p className="text-sm opacity-90 leading-relaxed">
              Science-led wellness products for immunity, gut health, energy and longevity.
              Authentic BF Suma &#8212; trusted by thousands across Kenya.
            </p>
            <div className="flex space-x-3 pt-2">
              <a
                href="https://www.facebook.com/bfsumanairobi"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com/bfsumanairobi"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.youtube.com/@bfsumanairobi"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <Youtube className="h-4 w-4" />
              </a>
              <a
                href={`https://wa.me/${SUPPORT_WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                {/* WhatsApp icon inline SVG */}
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
              <a
                href={"mailto:" + SUPPORT_EMAIL}
                aria-label="Email us"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <Mail className="h-4 w-4" />
              </a>
              <a
                href={"tel:" + SUPPORT_PHONE_RAW}
                aria-label="Call us"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <Phone className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-semibold text-base mb-4 uppercase tracking-widest opacity-70 text-xs">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { label: "Home", to: "/" },
                { label: "Shop All Products", to: "/shop" },
                { label: "About Us", to: "/about" },
                { label: "Contact Us", to: "/contact" },
                { label: "My Orders", to: "/my-orders" },
                { label: "Become a Partner", to: "/partner/apply" },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm opacity-80 hover:opacity-100 hover:text-accent transition-all duration-300"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-base mb-4 uppercase tracking-widest opacity-70 text-xs">Shop by Category</h3>
            <ul className="space-y-2.5">
              {[
                { label: "Immune Boosters", slug: "immune-boosters" },
                { label: "Digestive Health", slug: "digestive-health" },
                { label: "Bone & Joint Care", slug: "bone-joint-care" },
                { label: "Cardiovascular Health", slug: "cardio-vascular-health" },
                { label: "Beauty & Antiaging", slug: "beauty-antiaging" },
                { label: "Suma Baby", slug: "suma-baby" },
                { label: "Premium Selected", slug: "premium-selected" },
                { label: "Better Life", slug: "better-life" },
                { label: "Suma Living", slug: "suma-living" },
              ].map(({ label, slug }) => (
                <li key={slug}>
                  <Link
                    to={`/shop?category=${slug}`}
                    className="text-sm opacity-80 hover:opacity-100 hover:text-accent transition-all duration-300"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm opacity-80">
            &copy; {new Date().getFullYear()} BF Suma Nairobi. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Link to="/contact" className="text-sm opacity-80 hover:opacity-100 hover:text-accent transition-all duration-300">
              Contact Us
            </Link>
            <Link to="/privacy-policy" className="text-sm opacity-80 hover:opacity-100 hover:text-accent transition-all duration-300">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-sm opacity-80 hover:opacity-100 hover:text-accent transition-all duration-300">
              Terms of Service
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
