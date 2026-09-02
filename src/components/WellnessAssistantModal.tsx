import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SUPPORT_WHATSAPP_NUMBER, SUPPORT_PHONE_DISPLAY } from "@/config/site";
import { 
  Headphones,
  Sparkles, 
  MessageCircle, 
  Search, 
  Truck, 
  ShieldCheck, 
  HeartPulse, 
  HelpCircle, 
  ArrowRight, 
  Loader2, 
  CheckCircle2,
  Clock,
  Package
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WellnessAssistantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HEALTH_GOALS = [
  { label: "Immune Boosters", category: "immune-boosters", icon: "🛡️", desc: "Pure & Refined Micropowder, Ansobot, Reishi" },
  { label: "Bone & Joint Care", category: "bone-joint-care", icon: "🦴", desc: "Zaminocal, Glucosamine, ArthroXtra" },
  { label: "Digestive Health", category: "digestive-health", icon: "🌿", desc: "ConstiRelax, Probiotics, Detox Tea" },
  { label: "Cardiovascular Care", category: "cardiovascular-health", icon: "❤️", desc: "MicrO2 Cycle Tea, Purewell, CereBrain" },
  { label: "Energy & Vitality", category: "energy-vitality", icon: "⚡", desc: "Cordyceps, Maca, Ginseng" },
];

const FAQS = [
  { q: "How fast is delivery within Nairobi?", a: "Same-day delivery within Nairobi (2–4 hours) and next-day countrywide delivery across Kenya." },
  { q: "Are all products 100% authentic?", a: "Yes! All products are directly certified by BF Suma with genuine seal verification." },
  { q: "How do I pay?", a: "We accept automated M-Pesa STK Push during checkout, manual Paybill, and card payments." },
];

export const WellnessAssistantModal = ({ open, onOpenChange }: WellnessAssistantModalProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"guide" | "track" | "faq">("guide");
  const [orderQuery, setOrderQuery] = useState("");
  const [searchingOrder, setSearchingOrder] = useState(false);
  const [foundOrder, setFoundOrder] = useState<any>(null);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) {
      toast.error("Please enter an Order ID or Phone number");
      return;
    }

    setSearchingOrder(true);
    setFoundOrder(null);
    try {
      const q = orderQuery.trim().replace(/^N3\s*\/\s*/i, "");
      
      const { data, error } = await supabase
        .from("orders")
        .select("id, status, total_amount, created_at, customer_name, shipping_city")
        .or(`id.ilike.%${q}%,customer_phone.ilike.%${q}%`)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error("No matching order found. Please verify your details.");
      } else {
        setFoundOrder(data);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to search order");
    } finally {
      setSearchingOrder(false);
    }
  };

  const handleGoalClick = (category: string) => {
    onOpenChange(false);
    navigate(`/shop?category=${category}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl border-border bg-card shadow-2xl">
        {/* Header with Emerald Gradient */}
        <div className="bg-gradient-primary p-6 text-white relative">
          <div className="flex items-center gap-3">
            {/* Support Specialist Avatar */}
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner">
                <Headphones className="h-6 w-6 text-white animate-bounce-slight" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-emerald-900"></span>
              </span>
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                BF Suma Customer Support
                <Badge className="bg-emerald-400 text-emerald-950 font-bold text-[10px] px-2 py-0.5">Live 24/7</Badge>
              </DialogTitle>
              <DialogDescription className="text-white/85 text-xs mt-0.5">
                Nairobi Wellness Advisor • Product Finder • Instant Order Tracking
              </DialogDescription>
            </div>
          </div>


          {/* Quick Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => setActiveTab("guide")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === "guide" 
                  ? "bg-white text-primary shadow-sm" 
                  : "bg-white/15 text-white hover:bg-white/25"
              }`}
            >
              🩺 Product Finder
            </button>
            <button
              onClick={() => setActiveTab("track")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === "track" 
                  ? "bg-white text-primary shadow-sm" 
                  : "bg-white/15 text-white hover:bg-white/25"
              }`}
            >
              📦 Track Order
            </button>
            <button
              onClick={() => setActiveTab("faq")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === "faq" 
                  ? "bg-white text-primary shadow-sm" 
                  : "bg-white/15 text-white hover:bg-white/25"
              }`}
            >
              ❓ Quick FAQs
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* TAB 1: PRODUCT & HEALTH GUIDE */}
          {activeTab === "guide" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Select Your Health Goal
                </span>
                <span className="text-xs text-primary font-medium">Click to view products</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {HEALTH_GOALS.map((goal) => (
                  <button
                    key={goal.category}
                    onClick={() => handleGoalClick(goal.category)}
                    className="flex items-start gap-3 p-3 text-left rounded-2xl border border-border/80 bg-secondary/30 hover:bg-secondary/80 hover:border-primary/40 transition-all group"
                  >
                    <span className="text-2xl mt-0.5 group-hover:scale-110 transition-transform">{goal.icon}</span>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                        {goal.label} <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{goal.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Direct WhatsApp Consultant Banner */}
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <MessageCircle className="h-4 w-4 text-[#25D366]" /> Chat with a Nairobi Wellness Specialist
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Get tailored dosage and health recommendations for your condition.
                  </p>
                </div>
                <a
                  href={`https://wa.me/${SUPPORT_WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello! I need health guidance and product recommendations from a BF Suma specialist.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button size="sm" className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold rounded-full gap-1.5 shadow-sm">
                    <MessageCircle className="h-3.5 w-3.5" /> Chat on WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          )}

          {/* TAB 2: ORDER TRACKER */}
          {activeTab === "track" && (
            <div className="space-y-4">
              <form onSubmit={handleTrackOrder} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter Order ID (e.g. 5a9b...) or Phone Number"
                    value={orderQuery}
                    onChange={(e) => setOrderQuery(e.target.value)}
                    className="pl-9 text-sm"
                  />
                </div>
                <Button type="submit" disabled={searchingOrder} className="gap-1.5">
                  {searchingOrder ? <Loader2 className="h-4 w-4 animate-spin" /> : "Track"}
                </Button>
              </form>

              {foundOrder && (
                <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Order ID</p>
                      <p className="font-mono font-bold text-sm text-foreground">
                        N3 / {foundOrder.id.substring(0, 8).toUpperCase()}
                      </p>
                    </div>
                    <Badge className={
                      foundOrder.status === "delivered" ? "bg-emerald-600 text-white" :
                      foundOrder.status === "shipped" ? "bg-blue-600 text-white" :
                      foundOrder.status === "processing" ? "bg-amber-600 text-white" :
                      "bg-yellow-500 text-white"
                    }>
                      {foundOrder.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border">
                    <div>
                      <span className="text-muted-foreground">Customer:</span>{" "}
                      <span className="font-medium text-foreground">{foundOrder.customer_name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Amount:</span>{" "}
                      <span className="font-bold text-foreground">KSh {foundOrder.total_amount?.toLocaleString()}</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs gap-1.5"
                    onClick={() => {
                      onOpenChange(false);
                      navigate(`/order-confirmation/${foundOrder.id}`);
                    }}
                  >
                    View Full Order Details <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FAQS */}
          {activeTab === "faq" && (
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-secondary/40 border border-border/80 space-y-1">
                  <p className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5 text-primary" /> {faq.q}
                  </p>
                  <p className="text-xs text-muted-foreground pl-5 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
