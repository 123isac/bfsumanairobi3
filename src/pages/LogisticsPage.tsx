import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePermission } from "@/hooks/usePermission";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Truck, Search, MapPin, Phone, CheckCircle, Clock, Package, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  status: string;
  total_amount: number;
  created_at: string;
  payment_status?: string;
  order_items?: any[];
}

const LogisticsPage = () => {
  const canManage = usePermission("manage_deliveries");
  const canUpdateOwn = usePermission("update_own_deliveries");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [updating, setUpdating] = useState(false);

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
            product:products (
              name
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      toast.error("Failed to load delivery orders: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", selectedOrder.id);

      if (error) throw error;

      // Log activity
      const { data: userData } = await supabase.auth.getUser();
      await supabase.from("activity_logs").insert({
        user_id: userData.user?.id,
        action: "update_delivery_status",
        target_table: "orders",
        target_id: selectedOrder.id,
        details: { old_status: selectedOrder.status, new_status: newStatus },
      });

      toast.success(`Order status updated to ${newStatus}`);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err: any) {
      toast.error("Failed to update status: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const filtered = orders.filter((o) =>
    o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.shipping_city?.toLowerCase().includes(search.toLowerCase()) ||
    o.shipping_address?.toLowerCase().includes(search.toLowerCase()) ||
    o.id.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>;
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800">In Transit</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Dispatch</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Logistics & Deliveries</h1>
        <p className="text-muted-foreground mt-1">
          Monitor dispatches, track customer deliveries, and update shipment statuses.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer, city, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={fetchOrders} className="gap-2">
          <Clock className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground text-xs uppercase font-medium">
              <tr>
                <th className="text-left px-4 py-3">Order ID</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Destination</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Delivery Status</th>
                <th className="text-right px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading deliveries...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    No delivery records found.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-xs">
                      {order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{order.customer_name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3" /> {order.customer_phone}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-1 text-xs">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <span>{order.shipping_address}, {order.shipping_city}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">
                      KSh {order.total_amount?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => {
                          setSelectedOrder(order);
                          setNewStatus(order.status);
                        }}
                      >
                        <Eye className="h-3.5 w-3.5" /> Manage
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details & Status Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delivery Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.id.slice(0, 8).toUpperCase()}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 text-sm mt-2">
              <div className="bg-muted/30 p-3 rounded-lg space-y-1">
                <p className="font-medium text-foreground">{selectedOrder.customer_name}</p>
                <p className="text-muted-foreground text-xs">{selectedOrder.customer_phone}</p>
                <p className="text-muted-foreground text-xs">{selectedOrder.shipping_address}, {selectedOrder.shipping_city}</p>
              </div>

              {(canManage || canUpdateOwn) && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <Label>Update Delivery Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending Dispatch</SelectItem>
                      <SelectItem value="processing">In Transit</SelectItem>
                      <SelectItem value="completed">Delivered (Completed)</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    className="w-full mt-3"
                    onClick={handleUpdateStatus}
                    disabled={updating || newStatus === selectedOrder.status}
                  >
                    {updating ? "Saving..." : "Save Delivery Status"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LogisticsPage;
