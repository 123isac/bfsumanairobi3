import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Link as LinkIcon, HandCoins, Users, TrendingUp, CheckCircle, PackagePlus, Info } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  commissions?: any[];
}

const PartnerDashboard = () => {
  const { user } = useAuth();
  const [partner, setPartner] = useState<PartnerData | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [orderForm, setOrderForm] = useState({
    customerName: "",
    customerPhone: "",
    address: "",
    productId: "",
    quantity: "1",
    deliveryFee: "",
    notes: ""
  });

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
        const cleanEmail = (user.email || "").trim().toLowerCase();

        // 1. Try RPC get_my_partner_profile
        let spaData: any = null;
        try {
          const { data: rpcData } = await supabase.rpc("get_my_partner_profile" as any);
          if (rpcData && typeof rpcData === "object" && (rpcData as any).id) {
            spaData = rpcData;
          }
        } catch {}

        if (!spaData) {
          // 2. Direct lookup
          const { data, error: spaError } = await supabase
            .from("spas")
            .select("*")
            .ilike("email", cleanEmail)
            .maybeSingle();

          if (spaError) throw spaError;
          spaData = data;
        }

        if (!spaData) {
          toast.error("Partner profile not found. Please contact support.");
          setLoading(false);
          return;
        }
        setPartner(spaData);

        // 3. Extract their referral links
        if (spaData?.referral_code) {
          const { data: orderData, error: orderError } = await supabase
            .from("orders")
            .select(`
              id, customer_name, total_amount, status, payment_status, created_at,
              commissions ( amount, status )
            `)
            .eq("referral_code", spaData.referral_code)
            .order("created_at", { ascending: false });

          if (!orderError) {
            setOrders(orderData || []);
          }

          const { data: commsData } = await supabase
            .from("commissions")
            .select("*")
            .eq("spa_id", spaData.id);
          if (commsData) {
            setCommissions(commsData);
          }
        }

        const { data: prodData } = await supabase
          .from("products")
          .select("id, name, price, commission_rate")
          .order("name");
        if (prodData) {
          setProducts(prodData);
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

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partner || !orderForm.productId) return;
    
    setSubmitting(true);
    try {
      const product = products.find(p => p.id === orderForm.productId);
      if (!product) throw new Error("Product not found");

      const quantity = parseInt(orderForm.quantity);
      if (isNaN(quantity) || quantity <= 0) throw new Error("Invalid quantity");

      const deliveryFee = parseFloat(orderForm.deliveryFee) || 0;

      // Commission is based on product margin (selling price - cost price)
      // Delivery fee is charged to the customer but does NOT affect commission
      const sellingPrice = Number(product.price) || 0;
      const costPrice = Number(product.cost_price) || 0;
      const profitPerUnit = sellingPrice - costPrice;
      const commissionAmount = profitPerUnit * quantity;

      // Customer pays: product total + delivery fee
      const productTotal = sellingPrice * quantity;
      const totalAmount = productTotal + deliveryFee;

      // Insert Order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: orderForm.customerName,
          customer_phone: orderForm.customerPhone,
          customer_email: partner.email,
          shipping_address: orderForm.address,
          shipping_city: "",
          payment_method: 'mpesa',
          payment_status: 'pending',
          status: 'payment_pending',
          reseller_id: partner.id,
          referral_code: partner.referral_code,
          total_amount: totalAmount,
          delivery_fee: deliveryFee,
          commission_amount: commissionAmount,
          delivery_notes: orderForm.notes
        } as any)
        .select("id")
        .single();

      if (orderError) throw orderError;

      // Insert Order Item
      const { error: itemError } = await supabase
        .from("order_items")
        .insert({
          order_id: orderData.id,
          product_id: product.id,
          quantity: quantity,
          price: product.price
        });

      if (itemError) throw itemError;

      toast.success("Order submitted successfully!");
      setOrderForm({
        customerName: "",
        customerPhone: "",
        address: "",
        productId: "",
        quantity: "1",
        deliveryFee: "",
        notes: ""
      });
    } catch (err: any) {
      toast.error("Failed to submit order: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referred Orders</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground mt-1">Total orders attached to your code</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Commissions</CardTitle>
            <HandCoins className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              KSH {commissions.filter(c => c.status === 'pending').reduce((sum, c) => {
                const gross = Number(c.amount || 0);
                const net = c.net_commission != null ? Number(c.net_commission) : (gross * 0.85);
                return sum + net;
              }, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting release</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Released Commissions</CardTitle>
            <HandCoins className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              KSH {commissions.filter(c => c.status === 'paid').reduce((sum, c) => {
                const gross = Number(c.amount || 0);
                const net = c.net_commission != null ? Number(c.net_commission) : (gross * 0.85);
                return sum + net;
              }, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total approved net payouts</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              KSH {commissions.reduce((sum, c) => {
                const gross = Number(c.amount || 0);
                const fee = c.platform_fee_amount != null ? Number(c.platform_fee_amount) : (gross * 0.15);
                return sum + fee;
              }, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total platform fees deducted (15%)</p>
          </CardContent>
        </Card>
      </div>

      {/* Place an Order for a Customer Form */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><PackagePlus className="h-5 w-5" /> Place an Order for a Customer</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitOrder} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Customer Name</Label>
                <Input required value={orderForm.customerName} onChange={e => setOrderForm({...orderForm, customerName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Customer Phone</Label>
                <Input required type="tel" value={orderForm.customerPhone} onChange={e => setOrderForm({...orderForm, customerPhone: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Delivery Address (Include City/Region)</Label>
              <Input required value={orderForm.address} onChange={e => setOrderForm({...orderForm, address: e.target.value})} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product</Label>
                <Select required value={orderForm.productId} onValueChange={val => setOrderForm({...orderForm, productId: val})}>
                  <SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name} — KSh {Number(p.price).toLocaleString()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input required type="number" min="1" value={orderForm.quantity} onChange={e => setOrderForm({...orderForm, quantity: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Delivery Fee (KSh) — Charged to customer, not deducted from commission</Label>
              <Input
                type="number"
                min="0"
                placeholder="e.g. 300"
                value={orderForm.deliveryFee}
                onChange={e => setOrderForm({...orderForm, deliveryFee: e.target.value})}
              />
            </div>

            {/* Live Cost Breakdown */}
            {orderForm.productId && (() => {
              const product = products.find(p => p.id === orderForm.productId);
              if (!product) return null;
              const qty = parseInt(orderForm.quantity) || 1;
              const deliveryFee = parseFloat(orderForm.deliveryFee) || 0;
              const sellingPrice = Number(product.price) || 0;
              const costPrice = Number(product.cost_price) || 0;
              const productTotal = sellingPrice * qty;
              const customerTotal = productTotal + deliveryFee;
              const profit = (sellingPrice - costPrice) * qty;
              const platformFee = profit * 0.15;
              const resellerNets = profit - platformFee;
              return (
                <div className="bg-muted/40 rounded-lg border border-border p-4 space-y-2 text-sm">
                  <p className="font-semibold text-xs uppercase text-muted-foreground tracking-wide mb-2">Order Breakdown</p>
                  <div className="flex justify-between"><span className="text-muted-foreground">Product Total ({qty}×)</span><span>KSh {productTotal.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Delivery Fee</span><span>KSh {deliveryFee.toLocaleString()}</span></div>
                  <div className="flex justify-between font-semibold border-t pt-2"><span>Customer Pays</span><span>KSh {customerTotal.toLocaleString()}</span></div>
                  <div className="border-t pt-2 space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Your Commission</p>
                    <div className="flex justify-between"><span className="text-muted-foreground">Gross Profit (margin)</span><span>KSh {profit.toLocaleString()}</span></div>
                    <div className="flex justify-between text-orange-600"><span>Platform Fee (15%)</span><span>− KSh {platformFee.toLocaleString()}</span></div>
                    <div className="flex justify-between font-bold text-green-700 border-t pt-1"><span>You Receive</span><span>KSh {resellerNets.toLocaleString()}</span></div>
                  </div>
                </div>
              );
            })()}

            <div className="space-y-2">
              <Label>Special Instructions (Optional)</Label>
              <Textarea value={orderForm.notes} onChange={e => setOrderForm({...orderForm, notes: e.target.value})} />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Order"}
            </Button>
          </form>
        </CardContent>
      </Card>

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
                  <th className="px-6 py-4 font-medium text-muted-foreground text-right">Gross Commission</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground text-right">Platform Fee (15%)</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground text-right">Net Commission</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => {
                  const comm = order.commissions && order.commissions.length > 0 ? order.commissions[0] : null;
                  const gross = comm ? Number(comm.amount || 0) : 0;
                  const fee = comm ? (comm.platform_fee_amount != null ? Number(comm.platform_fee_amount) : gross * 0.15) : 0;
                  const net = comm ? (comm.net_commission != null ? Number(comm.net_commission) : gross * 0.85) : 0;

                  return (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {order.customer_name.split(' ')[0]}***
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        KSH {Number(order.total_amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {comm ? `KSH ${gross.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {comm ? `KSH ${fee.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-green-600">
                        {comm ? `KSH ${net.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                          {order.status === 'delivered' ? 'Completed' : 'Pending'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default PartnerDashboard;
