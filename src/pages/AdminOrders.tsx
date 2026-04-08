import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Package, Search, Clock, CheckCircle } from "lucide-react";

// Define an interface matching the Supabase orders schema
interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  shipping_address: string;
  shipping_city: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast.error("Failed to load orders: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders();
    } catch (error: any) {
      toast.error("Failed to update order: " + error.message);
    }
  };

  const filteredOrders = orders.filter((o) =>
    o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    o.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-8 w-8 text-primary" />
            Order Management
          </h1>
          <p className="text-muted-foreground mt-1">View incoming orders and update fulfillment status.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by customer or ID..."
              className="pl-9 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-muted-foreground">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground border-t border-border">
            No orders found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-muted/50 border-y border-border">
                <tr>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Order ID & Date</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Customer</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Address</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Amount</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Status</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs">{order.id.split("-")[0]}...</div>
                      <div className="text-muted-foreground text-xs mt-1">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{order.customer_name}</div>
                      <div className="text-muted-foreground text-xs">{order.customer_email}</div>
                      <div className="text-muted-foreground text-xs">{order.customer_phone}</div>
                    </td>
                    <td className="px-6 py-4 max-w-[200px]">
                      <div className="truncate" title={order.shipping_address}>{order.shipping_address}</div>
                      <div className="text-muted-foreground text-xs">{order.shipping_city}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      KSh {Number(order.total_amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={order.status === "delivered" ? "default" : "secondary"}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {order.status === "pending" && (
                        <Button size="sm" onClick={() => updateOrderStatus(order.id, "processing")}>
                          <Clock className="h-4 w-4 mr-2" /> Mark Processing
                        </Button>
                      )}
                      {order.status === "processing" && (
                        <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, "shipped")}>
                          Mark Shipped
                        </Button>
                      )}
                      {order.status === "shipped" && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateOrderStatus(order.id, "delivered")}>
                          <CheckCircle className="h-4 w-4 mr-2" /> Mark Delivered
                        </Button>
                      )}
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

export default AdminOrders;
