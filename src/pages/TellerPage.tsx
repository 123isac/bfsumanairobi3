import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePermission } from "@/hooks/usePermission";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Banknote, Search, Clock, CheckCircle, AlertCircle, PlusCircle, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
}

const TellerPage = () => {
  const canRecord = usePermission("record_payment");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [correctionOrder, setCorrectionOrder] = useState<Order | null>(null);
  const [correctionNotes, setCorrectionNotes] = useState("");
  const [submittingCorrection, setSubmittingCorrection] = useState(false);

  const fetchTellerData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("orders")
        .select("id, customer_name, customer_phone, total_amount, payment_method, payment_status, created_at")
        .gte("created_at", today)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      toast.error("Failed to load transactions: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTellerData();
  }, []);

  const handleRequestCorrection = async () => {
    if (!correctionOrder || !correctionNotes.trim()) {
      toast.error("Please provide a reason for the correction request.");
      return;
    }

    setSubmittingCorrection(true);
    try {
      const { data: userData } = await supabase.auth.getUser();

      const { error } = await supabase.from("approval_requests").insert({
        requested_by: userData.user?.id,
        type: "transaction_correction",
        status: "pending",
        notes: correctionNotes,
        payload: {
          order_id: correctionOrder.id,
          customer: correctionOrder.customer_name,
          amount: correctionOrder.total_amount,
          current_payment_status: correctionOrder.payment_status,
        },
      });

      if (error) throw error;

      toast.success("Correction request submitted for Manager approval.");
      setCorrectionOrder(null);
      setCorrectionNotes("");
    } catch (err: any) {
      toast.error("Failed to submit request: " + err.message);
    } finally {
      setSubmittingCorrection(false);
    }
  };

  const filtered = orders.filter((o) =>
    o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_phone?.includes(search)
  );

  const paidOrders = orders.filter((o) => o.payment_status === "paid");
  const totalCollections = paidOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const pendingCount = orders.filter((o) => o.payment_status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teller & Shift Register</h1>
          <p className="text-muted-foreground mt-1">
            Monitor shift collections, customer payment settlements, and register receipts.
          </p>
        </div>
        <Button variant="outline" onClick={fetchTellerData} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh Shift
        </Button>
      </div>

      {/* Shift Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Collections</CardTitle>
            <Banknote className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              KSh {totalCollections.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total settled today</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Settled Transactions</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidOrders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Successful transactions</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Settlements</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Unconfirmed payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Search and Table */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search today's transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground text-xs uppercase font-medium">
              <tr>
                <th className="text-left px-4 py-3">Time</th>
                <th className="text-left px-4 py-3">Order Ref</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Method</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading shift transactions...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    No transactions recorded for this shift yet.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-xs">
                      {order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{order.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{order.customer_phone}</div>
                    </td>
                    <td className="px-4 py-3 uppercase text-xs font-medium">
                      {order.payment_method || "M-PESA"}
                    </td>
                    <td className="px-4 py-3 font-bold text-foreground">
                      KSh {order.total_amount?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {order.payment_status === "paid" ? (
                        <Badge className="bg-green-100 text-green-800">Paid ✓</Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => setCorrectionOrder(order)}
                      >
                        Request Correction
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Correction Modal */}
      <Dialog open={!!correctionOrder} onOpenChange={(open) => !open && setCorrectionOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Transaction Correction</DialogTitle>
            <DialogDescription>
              Submit an adjustment request to the Shop Manager for Order #{correctionOrder?.id.slice(0, 8).toUpperCase()}.
            </DialogDescription>
          </DialogHeader>
          {correctionOrder && (
            <div className="space-y-4 text-sm mt-2">
              <div className="bg-muted/30 p-3 rounded-lg space-y-1">
                <p><span className="text-muted-foreground">Customer:</span> {correctionOrder.customer_name}</p>
                <p><span className="text-muted-foreground">Amount:</span> KSh {correctionOrder.total_amount.toLocaleString()}</p>
                <p><span className="text-muted-foreground">Status:</span> {correctionOrder.payment_status}</p>
              </div>

              <div className="space-y-2">
                <Label>Reason for Correction / Adjustment Request</Label>
                <Textarea
                  placeholder="Explain why this transaction needs correction (e.g. overpayment, incorrect reference, customer refund request)..."
                  value={correctionNotes}
                  onChange={(e) => setCorrectionNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setCorrectionOrder(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleRequestCorrection}
                  disabled={submittingCorrection || !correctionNotes.trim()}
                >
                  {submittingCorrection ? "Submitting..." : "Submit to Manager"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TellerPage;
