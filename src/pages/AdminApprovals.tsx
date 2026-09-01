import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, RefreshCw, FileText, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ApprovalRequest {
  id: string;
  requested_by: string;
  approved_by?: string;
  type: string;
  status: string;
  payload?: any;
  notes?: string;
  created_at: string;
  resolved_at?: string;
}

const TYPE_LABELS: Record<string, string> = {
  transaction_correction: "Transaction Correction",
  price_change: "Price Change Authorization",
  inventory_adjustment: "Inventory Write-Off",
};

const AdminApprovals = () => {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  const [rejectDialogReq, setRejectDialogReq] = useState<ApprovalRequest | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("approval_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err: any) {
      toast.error("Failed to load approval requests: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (req: ApprovalRequest) => {
    setProcessingId(req.id);
    try {
      const { data: userData } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("approval_requests")
        .update({
          status: "approved",
          approved_by: userData.user?.id,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", req.id);

      if (error) throw error;

      toast.success("Request approved successfully!");
      fetchRequests();
    } catch (err: any) {
      toast.error("Failed to approve request: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectDialogReq) return;
    setProcessingId(rejectDialogReq.id);
    try {
      const { data: userData } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("approval_requests")
        .update({
          status: "rejected",
          approved_by: userData.user?.id,
          notes: rejectNotes || rejectDialogReq.notes,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", rejectDialogReq.id);

      if (error) throw error;

      toast.success("Request rejected.");
      setRejectDialogReq(null);
      setRejectNotes("");
      fetchRequests();
    } catch (err: any) {
      toast.error("Failed to reject request: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = requests.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 gap-1"><Check className="h-3 w-3" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="gap-1"><X className="h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 gap-1"><Clock className="h-3 w-3" /> Pending Review</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Approval Requests</h1>
          <p className="text-muted-foreground mt-1">
            Review, authorize, or reject operational adjustments requested by assistants.
          </p>
        </div>
        <Button variant="outline" onClick={fetchRequests} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh Requests
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border pb-3">
        {(["pending", "approved", "rejected", "all"] as const).map((tab) => (
          <Button
            key={tab}
            size="sm"
            variant={filter === tab ? "default" : "ghost"}
            onClick={() => setFilter(tab)}
            className="capitalize text-xs font-medium"
          >
            {tab} {tab === "pending" && `(${requests.filter(r => r.status === 'pending').length})`}
          </Button>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground text-xs uppercase font-medium">
              <tr>
                <th className="text-left px-4 py-3">Submitted</th>
                <th className="text-left px-4 py-3">Request Type</th>
                <th className="text-left px-4 py-3">Details / Reason</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    Loading approval queue...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    No requests found in this view.
                  </td>
                </tr>
              ) : (
                filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(req.created_at).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {TYPE_LABELS[req.type] || req.type.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3 text-xs max-w-xs">
                      <div className="text-foreground font-medium">{req.notes || "No notes provided"}</div>
                      {req.payload && (
                        <div className="mt-1 font-mono text-[11px] bg-muted/40 p-1 rounded text-muted-foreground">
                          {typeof req.payload === "object" ? JSON.stringify(req.payload) : String(req.payload)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {req.status === "pending" ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white h-8 px-2.5 text-xs gap-1"
                            onClick={() => handleApprove(req)}
                            disabled={processingId === req.id}
                          >
                            <Check className="h-3.5 w-3.5" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 px-2.5 text-xs gap-1"
                            onClick={() => {
                              setRejectDialogReq(req);
                              setRejectNotes("");
                            }}
                            disabled={processingId === req.id}
                          >
                            <X className="h-3.5 w-3.5" /> Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Reason Modal */}
      <Dialog open={!!rejectDialogReq} onOpenChange={(open) => !open && setRejectDialogReq(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Provide feedback to the staff member on why this request was declined.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm mt-2">
            <div className="space-y-2">
              <Label>Rejection Reason / Notes</Label>
              <Textarea
                placeholder="Explain why this request is rejected..."
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setRejectDialogReq(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                Confirm Rejection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminApprovals;
