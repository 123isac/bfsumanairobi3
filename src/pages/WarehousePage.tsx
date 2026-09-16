import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePermission } from "@/hooks/usePermission";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Package, AlertTriangle, Search, ArrowDown, ArrowUp, Flag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Product {
  id: string;
  name: string;
  stock_quantity: number | null;
  price: number;
  image_url: string | null;
}

const WarehousePage = () => {
  const canManage = usePermission("manage_inventory");
  const canReceive = usePermission("receive_stock");
  const canIssue = usePermission("issue_stock");
  const canReport = usePermission("report_damage");

  const [products, setProducts] = useState<Product[]>([]);
  const [paidOrders, setPaidOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [damageOpen, setDamageOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [qty, setQty] = useState("");
  const [notes, setNotes] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("id, name, stock_quantity, price, image_url")
      .order("name");
    if (error) toast.error("Failed to load products");
    else setProducts(data || []);
    setLoading(false);
  };

  const fetchPaidOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id, customer_name, customer_phone, shipping_address, shipping_city, created_at,
          order_items ( quantity, products ( name ) ),
          spas ( name )
        `)
        .eq("status", "paid")
        .order("created_at", { ascending: true });
      if (error) throw error;
      // Also fetch them with simple spas join in case the fk name is different
      setPaidOrders(data || []);
    } catch (err: any) {
      toast.error("Failed to load paid orders: " + err.message);
    }
  };

  useEffect(() => { 
    fetchProducts(); 
    fetchPaidOrders();
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleReceive = async () => {
    if (!selected || !qty) return;
    const newQty = (selected.stock_quantity ?? 0) + parseInt(qty);
    const { error } = await supabase
      .from("products")
      .update({ stock_quantity: newQty })
      .eq("id", selected.id);
    if (error) toast.error("Failed to update stock");
    else {
      toast.success(`Received ${qty} units of ${selected.name}`);
      setReceiveOpen(false);
      setQty("");
      fetchProducts();
    }
  };

  const handleIssue = async () => {
    if (!selected || !qty) return;
    const newQty = Math.max(0, (selected.stock_quantity ?? 0) - parseInt(qty));
    const { error } = await supabase
      .from("products")
      .update({ stock_quantity: newQty })
      .eq("id", selected.id);
    if (error) toast.error("Failed to update stock");
    else {
      toast.success(`Issued ${qty} units of ${selected.name}`);
      setIssueOpen(false);
      setQty("");
      fetchProducts();
    }
  };

  const handleDamageReport = async () => {
    if (!selected || !notes) return;
    await (supabase as any).from("activity_logs").insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      action: "report_damage",
      target_table: "products",
      target_id: selected.id,
      details: { product_name: selected.name, quantity: qty, notes },
    });
    toast.success("Damage report submitted");
    setDamageOpen(false);
    setQty("");
    setNotes("");
  };

  const openDialog = (product: Product, type: "receive" | "issue" | "damage") => {
    setSelected(product);
    setQty("");
    setNotes("");
    if (type === "receive") setReceiveOpen(true);
    else if (type === "issue") setIssueOpen(true);
    else setDamageOpen(true);
  };

  const handleMarkAsPacked = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: 'packed' })
        .eq('id', orderId);
      if (error) throw error;

      const { data: userData } = await supabase.auth.getUser();
      await (supabase as any).from("activity_logs").insert({
        user_id: userData.user?.id,
        action: "order_packed",
        entity_type: "order",
        entity_id: orderId,
      });

      toast.success(`Order #${orderId.slice(0, 8).toUpperCase()} marked as packed`);
      fetchPaidOrders();
    } catch (err: any) {
      toast.error("Failed to mark order as packed: " + err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Warehouse</h1>
        <p className="text-muted-foreground">Manage inventory, receive stock, and fulfill orders.</p>
      </div>

      {/* Fulfillment/Packing Queue */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Paid Orders — Ready to Pack</h2>
        {paidOrders.length === 0 ? (
          <div className="text-muted-foreground bg-card p-6 rounded-xl border border-border text-center">
            No paid orders waiting to be packed.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paidOrders.map((order) => (
              <div key={order.id} className="bg-card rounded-xl border border-border p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono font-medium">#{order.id.slice(0, 8).toUpperCase()}</span>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      To Pack
                    </Badge>
                  </div>
                  <div className="text-sm space-y-1 mb-3">
                    <p><span className="text-muted-foreground">Customer:</span> {order.customer_name} ({order.customer_phone})</p>
                    <p><span className="text-muted-foreground">Location:</span> {order.shipping_address}, {order.shipping_city}</p>
                    {order.spas && <p><span className="text-muted-foreground">Reseller:</span> {order.spas.name}</p>}
                  </div>
                  <div className="text-sm bg-muted/50 p-2 rounded">
                    <p className="font-medium text-xs text-muted-foreground uppercase mb-1">Products:</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {order.order_items?.map((item: any, idx: number) => (
                        <li key={idx}>
                          {item.quantity}x {item.products?.name || "Unknown Product"}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <Button 
                  className="w-full mt-4" 
                  disabled={!canManage}
                  onClick={() => handleMarkAsPacked(order.id)}
                >
                  <Package className="mr-2 h-4 w-4" /> Mark as Packed
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Inventory Management</h2>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Product</th>
              <th className="text-center px-4 py-3 font-medium">Stock</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              {(canReceive || canIssue || canReport) && (
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
            ) : filtered.map((p) => (
              <tr key={p.id} className="hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-center font-bold">{p.stock_quantity ?? 0}</td>
                <td className="px-4 py-3">
                  {(p.stock_quantity ?? 0) < 5 ? (
                    <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> Critical</Badge>
                  ) : (p.stock_quantity ?? 0) < 10 ? (
                    <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800">In Stock</Badge>
                  )}
                </td>
                {(canReceive || canIssue || canReport) && (
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {canReceive && (
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => openDialog(p, "receive")}>
                          <ArrowDown className="h-3 w-3" /> Receive
                        </Button>
                      )}
                      {canIssue && (
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => openDialog(p, "issue")}>
                          <ArrowUp className="h-3 w-3" /> Issue
                        </Button>
                      )}
                      {canReport && (
                        <Button size="sm" variant="ghost" className="gap-1 text-destructive" onClick={() => openDialog(p, "damage")}>
                          <Flag className="h-3 w-3" /> Damage
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>

      <Dialog open={receiveOpen} onOpenChange={setReceiveOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Receive Stock — {selected?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current Stock</Label>
              <p className="text-2xl font-bold mt-1">{selected?.stock_quantity ?? 0} units</p>
            </div>
            <div><Label>Quantity Received</Label>
              <Input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} className="mt-1" />
            </div>
            <Button className="w-full" onClick={handleReceive} disabled={!qty}>Confirm Receive</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Issue Stock — {selected?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current Stock</Label>
              <p className="text-2xl font-bold mt-1">{selected?.stock_quantity ?? 0} units</p>
            </div>
            <div><Label>Quantity to Issue</Label>
              <Input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} className="mt-1" />
            </div>
            <Button className="w-full" onClick={handleIssue} disabled={!qty}>Confirm Issue</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={damageOpen} onOpenChange={setDamageOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Report Damage — {selected?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Quantity Damaged</Label>
              <Input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} className="mt-1" />
            </div>
            <div><Label>Description / Notes</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Describe the damage..." className="mt-1" />
            </div>
            <Button variant="destructive" className="w-full" onClick={handleDamageReport} disabled={!notes}>Submit Report</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WarehousePage;
