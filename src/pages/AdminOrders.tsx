import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Package, Search, Clock, CheckCircle, Eye, HandCoins } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Define an interface matching the Supabase orders schema
interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  status: string;
  payment_method?: string;
  payment_status?: string;
  created_at: string;
  shipping_address: string;
  shipping_city: string;
  order_items?: any[];
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
        .select(`
          *,
          order_items (
            quantity,
            price,
            products (
              name,
              image_url
            )
          )
        `)
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

  const handleRetryMpesa = async (orderId: string, phone: string, amount: number) => {
    if (!confirm(`Are you sure you want to trigger an STK Push to ${phone} for KSh ${amount.toLocaleString()}?`)) return;

    try {
      const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
        body: { phone, amount, orderId },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed to initiate M-PESA push");

      toast.success("STK Push successfully fired to the customer's phone!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to retry M-PESA push');
    }
  };

  const filteredOrders = orders.filter((o) =>
    o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    o.id.toLowerCase().includes(search.toLowerCase())
  );

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setSelectedOrder(order)}>
                         <Eye className="h-4 w-4 mr-2" /> View
                      </Button>
                      {order.status === "pending" && (
                        <Button size="sm" onClick={() => updateOrderStatus(order.id, "processing")}>
                          <Clock className="h-4 w-4 mr-2" /> Mark Processing
                        </Button>
                      )}
                      {order.status === "pending" && order.payment_method === "mpesa" && order.payment_status === "pending" && (
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleRetryMpesa(order.id, order.customer_phone, order.total_amount)}>
                          <HandCoins className="h-4 w-4 mr-2" /> Retry M-PESA
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

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.id.slice(0, 8)} - {selectedOrder?.customer_name}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 mt-4">
              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-3">Items Ordered</h3>
                <div className="space-y-3">
                  {selectedOrder.order_items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 bg-secondary/30 rounded-lg p-3">
                      {item.products?.image_url ? (
                        <img
                          src={item.products.image_url}
                          alt={item.products.name || "Product"}
                          className="h-16 w-16 object-contain p-1 rounded-lg bg-white border border-border"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.products?.name || "Product"}</p>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">KSH {Number(item.price).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary info */}
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Total Amount</span>
                  <span>KSH {Number(selectedOrder.total_amount).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
