import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Link as LinkIcon, HandCoins, Users, TrendingUp, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface PartnerData {
  id: string;
  contact_name: string;
  email: string;
  referral_code: string;
  total_earnings: number;
}

interface OrderSummary {
  id: string;
  customer_name: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
}

const PartnerDashboard = () => {
  const { user } = useAuth();
  const [partner, setPartner] = useState<PartnerData | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Computed totals
  const totalSales = orders
    .filter(o => o.status === "delivered" || o.status === "completed" || o.payment_status === "paid")
    .reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
    
  const totalLeads = orders.length;

  useEffect(() => {
    if (!user?.email) return;

    const fetchPartnerData = async () => {
      setLoading(true);
      try {
        // 1. Get SPA profile
        const { data: spaData, error: spaError } = await supabase
          .from("spas")
          .select("*")
          .eq("email", user.email)
          .single();

        if (spaError) throw spaError;
        setPartner(spaData);

        // 2. Extract their referral links
        if (spaData?.referral_code) {
          const { data: orderData, error: orderError } = await supabase
            .from("orders")
            .select("id, customer_name, total_amount, status, payment_status, created_at")
            .eq("referral_code", spaData.referral_code)
            .order("created_at", { ascending: false });

          if (orderError) throw orderError;
          setOrders(orderData || []);
        }
      } catch (err: any) {
        console.error("Partner sync failed", err);
        toast.error("Failed to load your partner data.");
      } finally {
        setLoading(false);
      }
    };

    fetchPartnerData();
  }, [user]);

  const affiliateLink = typeof window !== 'undefined' && partner 
    ? `${window.location.origin}/?ref=${partner.referral_code}`
    : '';

  const handleCopyLink = () => {
    if (affiliateLink) {
      navigator.clipboard.writeText(affiliateLink);
      toast.success("Affiliate link copied to clipboard!");
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground animate-pulse">Loading dashboard...</div>;
  }

  if (!partner) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Affiliate Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {partner.contact_name}. Track your link performance below.</p>
      </div>

      {/* Copy Link Utility Component */}
      <div className="bg-[#0A1A2F] text-white p-6 md:p-8 rounded-2xl shadow-luxury relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/30 transition-colors" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <LinkIcon className="h-6 w-6 text-[#E29A26]" />
            <h2 className="text-xl font-semibold">Your Referral Link</h2>
          </div>
          <p className="text-white/70 mb-6 max-w-2xl">
            Anyone who clicks your link will be tracked to you for the next 30 days! Share it on WhatsApp, Facebook, or locally to start earning.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 items-center bg-white/10 p-2 pl-4 rounded-xl max-w-3xl backdrop-blur-sm border border-white/20">
            <code className="flex-1 text-[#E29A26] font-mono text-sm sm:text-base break-all text-left w-full h-full my-2">
              {affiliateLink}
            </code>
            <Button 
              onClick={handleCopyLink} 
              className="w-full sm:w-auto bg-[#E29A26] hover:bg-[#C98A22] text-white rounded-lg gap-2"
            >
              <Copy className="h-4 w-4" /> Copy Link
            </Button>
          </div>
        </div>
      </div>

      {/* Analytics Stat Blocks */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referred Orders (Leads)</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground mt-1">Total orders attached to your code</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Sales Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">KSH {totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Gross paid revenue generated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Commissions</CardTitle>
            <HandCoins className="h-4 w-4 text-[#E29A26]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">KSH {(Number(partner.total_earnings) || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Total approved payouts</p>
          </CardContent>
        </Card>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-5 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" /> Recent Associated Orders
          </h2>
        </div>
        
        {orders.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground">
            No orders have been tracked to your link yet. Go spread the word!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-muted/50 border-y border-border">
                <tr>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Date</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Customer (First Name)</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground text-right">Order Value</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {/* Privacy shield: Only show first name */}
                      {order.customer_name.split(' ')[0]}***
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      KSH {Number(order.total_amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                        {order.status === 'delivered' ? 'Completed' : 'Pending'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default PartnerDashboard;
