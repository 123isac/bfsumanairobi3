import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingBag, Banknote, Users, Activity, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    visits: 0,
    customers: 0,
    productsCount: 0,
    avgMargin: 0
  });

  const [pipeline, setPipeline] = useState({
    paymentPending: 0,
    paid: 0,
    packed: 0,
    inTransit: 0,
    delivered: 0,
    failedReturned: 0
  });

  const [commissionStats, setCommissionStats] = useState({
    totalGenerated: 0,
    platformFees: 0,
    netPaid: 0,
    pending: 0
  });

  const [topResellers, setTopResellers] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          { data: ordersData },
          { count: visitsCount },
          { count: usersCount },
          { data: allOrdersData },
          { data: commData },
          { data: resellersData },
          { data: productsData }
        ] = await Promise.all([
          supabase.from("orders").select("total_amount").eq("status", "delivered"),
          supabase.from("page_visits").select("*", { count: 'exact', head: true }),
          supabase.from("user_roles").select("*", { count: 'exact', head: true }).eq("role", "customer"),
          supabase.from("orders").select("status"),
          supabase.from("commissions").select("*"),
          supabase.from("orders").select("reseller_id, commissions(amount), spas(name)").not("reseller_id", "is", null),
          supabase.from("products").select("id, name, price, cost_price, is_active").order("name")
        ]);

        const totalRevenue = ordersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

        let totalMargin = 0;
        let marginCount = 0;
        productsData?.forEach(p => {
          if (p.price && p.cost_price && p.price > p.cost_price) {
            totalMargin += (Number(p.price) - Number(p.cost_price));
            marginCount++;
          }
        });
        const avgMargin = marginCount > 0 ? totalMargin / marginCount : 0;

        setStats({
          revenue: totalRevenue,
          orders: ordersData?.length || 0,
          visits: visitsCount || 0,
          customers: usersCount || 0,
          productsCount: productsData?.filter(p => p.is_active)?.length || 0,
          avgMargin: avgMargin
        });

        const pStats = { paymentPending: 0, paid: 0, packed: 0, inTransit: 0, delivered: 0, failedReturned: 0 };
        allOrdersData?.forEach(o => {
          if (o.status === 'payment_pending' || o.status === 'pending') pStats.paymentPending++;
          if (o.status === 'paid') pStats.paid++;
          if (o.status === 'packed') pStats.packed++;
          if (o.status === 'dispatched' || o.status === 'out_for_delivery') pStats.inTransit++;
          if (o.status === 'delivered') pStats.delivered++;
          if (o.status === 'delivery_failed' || o.status === 'returned') pStats.failedReturned++;
        });
        setPipeline(pStats);

        let tGen = 0, pFees = 0, nPaid = 0, pPending = 0;
        commData?.forEach((c: any) => {
          const grossAmount = Number(c.amount || 0);
          const platformFee = grossAmount * 0.15;
          const netComm = grossAmount * 0.85;

          tGen += grossAmount;
          pFees += platformFee;
          if (c.status === 'paid') nPaid += netComm;
          if (c.status === 'pending') pPending += netComm;
        });
        setCommissionStats({ totalGenerated: tGen, platformFees: pFees, netPaid: nPaid, pending: pPending });

        // Calculate top resellers
        const rMap: Record<string, {name: string, count: number, totalComm: number}> = {};
        resellersData?.forEach((o: any) => {
          if (!o.reseller_id || !o.spas) return;
          const rId = o.reseller_id;
          if (!rMap[rId]) rMap[rId] = { name: o.spas.name, count: 0, totalComm: 0 };
          rMap[rId].count++;
          const orderComms = o.commissions || [];
          orderComms.forEach((c: any) => rMap[rId].totalComm += Number(c.amount || 0));
        });
        
        const topList = Object.values(rMap).sort((a, b) => b.count - a.count).slice(0, 5);
        setTopResellers(topList);
        setAllProducts(productsData || []);

      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back. Here is what's happening with your store today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Banknote className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSh {stats.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From completed orders</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orders}</div>
            <p className="text-xs text-muted-foreground">Successfully fulfilled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Website Visits</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.visits}</div>
            <p className="text-xs text-muted-foreground">Organic page views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Customers</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customers}</div>
            <p className="text-xs text-muted-foreground">Active platform users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.productsCount || 0}</div>
            <p className="text-xs text-muted-foreground">In catalog</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Reseller Margin</CardTitle>
            <Banknote className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSh {Math.round(stats.avgMargin || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Gross margin per product</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Order Pipeline Stats</h2>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-xl font-bold">{pipeline.paymentPending}</div>
              <p className="text-xs text-muted-foreground">Payment Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xl font-bold text-blue-600">{pipeline.paid}</div>
              <p className="text-xs text-muted-foreground">Paid (Await Packing)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xl font-bold text-indigo-600">{pipeline.packed}</div>
              <p className="text-xs text-muted-foreground">Packed (Await Dispatch)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xl font-bold text-orange-600">{pipeline.inTransit}</div>
              <p className="text-xs text-muted-foreground">In Transit</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xl font-bold text-green-600">{pipeline.delivered}</div>
              <p className="text-xs text-muted-foreground">Delivered</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xl font-bold text-red-600">{pipeline.failedReturned}</div>
              <p className="text-xs text-muted-foreground">Failed / Returned</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Commission Analytics</h2>
          <div className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Total Commissions Generated</span>
              <span className="font-bold">KSh {commissionStats.totalGenerated.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Platform Fees Collected</span>
              <span className="font-bold">KSh {commissionStats.platformFees.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Net Commissions Paid</span>
              <span className="font-bold text-green-600">KSh {commissionStats.netPaid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Pending Commissions</span>
              <span className="font-bold text-yellow-600">KSh {commissionStats.pending.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Top 5 Resellers</h2>
          {topResellers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No reseller data available.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="text-left px-4 py-2">Reseller</th>
                  <th className="text-center px-4 py-2">Orders</th>
                  <th className="text-right px-4 py-2">Total Comm.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topResellers.map((r, i) => (
                  <tr key={i} className="hover:bg-muted/20">
                    <td className="px-4 py-2 font-medium">{r.name}</td>
                    <td className="px-4 py-2 text-center">{r.count}</td>
                    <td className="px-4 py-2 text-right">KSh {r.totalComm.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h2 className="text-xl font-semibold">Reseller Pricing & Margins per Product</h2>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              className="pl-9" 
              value={productSearch} 
              onChange={(e) => setProductSearch(e.target.value)} 
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 font-medium">Product Name</th>
                <th className="px-4 py-3 font-medium text-right">Reseller Buying Price</th>
                <th className="px-4 py-3 font-medium text-right">Reseller Selling Price</th>
                <th className="px-4 py-3 font-medium text-right">Gross Margin</th>
                <th className="px-4 py-3 font-medium text-right text-orange-600">Platform Fee (15%)</th>
                <th className="px-4 py-3 font-medium text-right text-green-600">Reseller Net Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allProducts.filter(p => (p.name || '').toLowerCase().includes(productSearch.toLowerCase())).map((p) => {
                const costPrice = Number(p.cost_price || 0);
                const sellingPrice = Number(p.price || 0);
                const margin = sellingPrice - costPrice;
                const fee = margin * 0.15;
                const net = margin * 0.85;

                return (
                  <tr key={p.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">
                      {p.name} {!p.is_active && <span className="text-xs text-red-500 ml-2">(Inactive)</span>}
                    </td>
                    <td className="px-4 py-3 text-right">KSh {costPrice.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">KSh {sellingPrice.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-medium">KSh {margin.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-orange-600">KSh {fee.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-bold text-green-600">KSh {net.toLocaleString()}</td>
                  </tr>
                );
              })}
              {allProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
