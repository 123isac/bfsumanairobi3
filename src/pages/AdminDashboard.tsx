import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingBag, Banknote, Users, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    visits: 0,
    customers: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          { data: ordersData },
          { count: visitsCount },
          { count: usersCount }
        ] = await Promise.all([
          supabase.from("orders").select("total_amount").eq("status", "completed"),
          supabase.from("page_visits").select("*", { count: 'exact', head: true }),
          supabase.from("user_roles").select("*", { count: 'exact', head: true }).eq("role", "customer")
        ]);

        const totalRevenue = ordersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

        setStats({
          revenue: totalRevenue,
          orders: ordersData?.length || 0,
          visits: visitsCount || 0,
          customers: usersCount || 0
        });
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      </div>

      <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Low Stock Alerts</h2>
        <div className="text-center py-8 text-muted-foreground">
          No low stock alerts at the moment.
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
