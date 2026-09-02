import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SUPPORT_WHATSAPP_NUMBER } from "@/config/site";
import { X, MessageCircle, ShieldCheck } from "lucide-react";

/**
 * Floating WhatsApp Support Button & Trust Badge
 * - Only visible on public/customer pages (hidden on /admin/* and /staff/*)
 * - Shows an interactive welcome badge on arrival that gently minimizes
 */
const WhatsAppButton = () => {
    const location = useLocation();
    const [showPopup, setShowPopup] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    // Hide completely on Admin and Staff portals
    const isAdminOrStaff = 
        location.pathname.startsWith("/admin") || 
        location.pathname.startsWith("/staff");

    useEffect(() => {
        if (isAdminOrStaff) {
            setShowPopup(false);
            return;
        }

        // Show welcome popup 1.5s after page load (if not manually dismissed)
        const showTimer = setTimeout(() => {
            if (!dismissed) {
                setShowPopup(true);
            }
        }, 1500);

        // Auto-minimize popup after 8 seconds so it doesn't block content
        const hideTimer = setTimeout(() => {
            setShowPopup(false);
        }, 9500);

        return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
        };
    }, [location.pathname, isAdminOrStaff, dismissed]);

    if (isAdminOrStaff) {
        return null;
    }

    const msg = encodeURIComponent(
        "Hello BF Suma Nairobi! I'm on your website and would like assistance with your products and orders."
    );
    const href = `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}?text=${msg}`;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 pointer-events-none">
            {/* Welcoming Trust Popup */}
            {showPopup && !dismissed && (
                <div 
                    className="pointer-events-auto max-w-xs bg-card border border-border/80 shadow-2xl rounded-2xl p-4 animate-in fade-in slide-in-from-bottom-5 duration-500 relative transition-all"
                    role="alert"
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowPopup(false);
                            setDismissed(true);
                        }}
                        aria-label="Close message"
                        className="absolute top-2.5 right-2.5 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted/80 transition-colors"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0 text-emerald-600 mt-0.5">
                            <MessageCircle className="h-5 w-5" />
                        </div>
                        <div className="space-y-1 pr-3">
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-foreground">BF Suma Support</span>
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 text-[10px] font-medium bg-emerald-100 text-emerald-800 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Online
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Need health guidance or order assistance? Chat directly with our Nairobi team!
                            </p>
                            <div className="pt-1.5 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold hover:underline">
                                <ShieldCheck className="h-3.5 w-3.5" /> 100% Genuine BF Suma Products
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Floating Button */}
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with us on WhatsApp"
                className="pointer-events-auto relative group flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-transform duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-emerald-400/50"
                style={{ backgroundColor: "#25D366" }}
            >
                {/* Ping animation indicator */}
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white"></span>
                </span>

                {/* WhatsApp SVG Icon */}
                <svg
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-7 h-7 fill-white"
                >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
            </a>
        </div>
    );
};

export default WhatsAppButton;

