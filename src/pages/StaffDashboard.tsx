import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStaffAuth } from "@/contexts/StaffAuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Package, Truck, Banknote, Users, AlertTriangle,
  ArrowDown, ArrowUp, CheckCircle, Clock, ListTodo,
} from "lucide-react";

const StatCard = ({
  title, value, sub, icon: Icon, color = "text-primary",
}: {
  title: string; value: string | number; sub?: string;
  icon: React.ElementType; color?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className={`h-4 w-4 ${color}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </CardContent>
  </Card>
);

// ─── Role-specific stat panels ───────────────────────────────────────────────

const WarehouseDashboard = () => {
  const [stats, setStats] = useState({ total: 0, lowStock: 0, incoming: 0, outgoing: 0 });
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("products").select("stock_quantity");
      const total = data?.length ?? 0;
      const lowStock = data?.filter((p) => (p.stock_quantity ?? 0) < 10).length ?? 0;
      setStats({ total, lowStock, incoming: 0, outgoing: 0 });
    };
    load();
  }, []);
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total Stock Items"    value={stats.total}    sub="Products in inventory" icon={Package} />
      <StatCard title="Low Stock Alerts"     value={stats.lowStock} sub="Below 10 units"         icon={AlertTriangle} color="text-destructive" />
      <StatCard title="Incoming Deliveries"  value={stats.incoming} sub="Expected today"         icon={ArrowDown} color="text-blue-500" />
      <StatCard title="Outgoing Dispatches"  value={stats.outgoing} sub="Dispatched today"       icon={ArrowUp}   color="text-green-500" />
    </div>
  );
};

const LogisticsDashboard = () => {
  const [stats, setStats] = useState({ pending: 0, transit: 0, completed: 0 });
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("orders").select("status");
      setStats({
        pending:   data?.filter((o) => o.status === "pending").length ?? 0,
        transit:   data?.filter((o) => o.status === "processing").length ?? 0,
        completed: data?.filter((o) => o.status === "completed").length ?? 0,
      });
    };
    load();
  }, []);
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard title="Pending Deliveries" value={stats.pending}   sub="Awaiting dispatch"   icon={Clock}       color="text-yellow-500" />
      <StatCard title="In Transit"         value={stats.transit}   sub="Out for delivery"    icon={Truck}       color="text-blue-500" />
      <StatCard title="Completed Today"    value={stats.completed} sub="Successfully delivered" icon={CheckCircle} color="text-green-500" />
    </div>
  );
};

const TellerDashboard = () => {
  const [stats, setStats] = useState({ collections: 0, transactions: 0, pending: 0 });
  useEffect(() => {
    const load = async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("orders")
        .select("total_amount, payment_status, created_at")
        .gte("created_at", today);
      const paid = data?.filter((o) => o.payment_status === "paid") ?? [];
      setStats({
        collections:  paid.reduce((s, o) => s + (o.total_amount ?? 0), 0),
        transactions: paid.length,
        pending:      data?.filter((o) => o.payment_status === "pending").length ?? 0,
      });
    };
    load();
  }, []);
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard title="Today's Collections" value={`KSh ${stats.collections.toLocaleString()}`} sub="Paid orders today"    icon={Banknote} color="text-green-600" />
      <StatCard title="Transactions"         value={stats.transactions}                           sub="Completed payments"  icon={CheckCircle} />
      <StatCard title="Pending Payments"     value={stats.pending}                                sub="Awaiting confirmation" icon={Clock} color="text-yellow-500" />
    </div>
  );
};

const ShopManagerDashboard = () => {
  const [stats, setStats] = useState({ sales: 0, stock: 0, deliveries: 0, staff: 0, tasks: 0 });
  useEffect(() => {
    const load = async () => {
      const today = new Date().toISOString().split("T")[0];
      const [ordersRes, productsRes, workersRes] = await Promise.all([
        supabase.from("orders").select("total_amount, status").gte("created_at", today),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("workers").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        sales:     ordersRes.data?.filter(o => o.status === "completed").reduce((s, o) => s + (o.total_amount ?? 0), 0) ?? 0,
        stock:     productsRes.count ?? 0,
        deliveries: ordersRes.data?.filter(o => o.status === "processing").length ?? 0,
        staff:     workersRes.count ?? 0,
        tasks:     0,
      });
    };
    load();
  }, []);
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <StatCard title="Today's Sales"      value={`KSh ${stats.sales.toLocaleString()}`} icon={Banknote}   color="text-green-600" />
      <StatCard title="Stock Items"        value={stats.stock}                             icon={Package} />
      <StatCard title="Pending Deliveries" value={stats.deliveries}                        icon={Truck}      color="text-blue-500" />
      <StatCard title="Active Staff"       value={stats.staff}                             icon={Users} />
      <StatCard title="Pending Tasks"      value={stats.tasks}                             icon={ListTodo}   color="text-yellow-500" />
    </div>
  );
};

const LogisticsAsstDashboard = () => {
  const { workerProfile } = useStaffAuth();
  const [stats, setStats] = useState({ assigned: 0, tasks: 0 });
  useEffect(() => {
    setStats({ assigned: 0, tasks: 0 });
  }, [workerProfile]);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <StatCard title="My Assigned Deliveries" value={stats.assigned} sub="Active deliveries" icon={Truck} />
      <StatCard title="My Tasks"               value={stats.tasks}    sub="Pending tasks"     icon={ListTodo} color="text-yellow-500" />
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const StaffDashboard = () => {
  const { role, workerProfile } = useStaffAuth();

  const firstName = workerProfile?.full_name?.split(" ")[0] ?? "there";
  const roleLabel = {
    shop_manager:   "Shop Manager",
    warehouse:      "Warehouse Assistant",
    logistics:      "Logistics Officer",
    teller:         "Teller",
    logistics_asst: "Logistics Assistant",
  }[role ?? ""] ?? "Staff";

  const renderDashboard = () => {
    switch (role) {
      case "shop_manager":   return <ShopManagerDashboard />;
      case "warehouse":      return <WarehouseDashboard />;
      case "logistics":      return <LogisticsDashboard />;
      case "teller":         return <TellerDashboard />;
      case "logistics_asst": return <LogisticsAsstDashboard />;
      default: return <p className="text-muted-foreground">No dashboard configured for your role.</p>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {firstName} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          {roleLabel} · {workerProfile?.department ?? "BF Suma Nairobi"}
        </p>
      </div>
      {renderDashboard()}
    </div>
  );
};

export default StaffDashboard;
