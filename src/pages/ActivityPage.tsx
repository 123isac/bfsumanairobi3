import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePermission } from "@/hooks/usePermission";
import { useStaffAuth } from "@/contexts/StaffAuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Activity, Clock, Search, RefreshCw, FileText } from "lucide-react";
import { toast } from "sonner";

interface LogEntry {
  id: string;
  user_id: string;
  action: string;
  target_table?: string;
  target_id?: string;
  details?: any;
  created_at: string;
}

const ActivityPage = () => {
  const { role } = useStaffAuth();
  const canViewAll = usePermission("view_activity_all") || role === "admin" || usePermission("view_activity_shop");

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (!canViewAll) {
        const { data: userRes } = await supabase.auth.getUser();
        if (userRes.user) {
          query = query.eq("user_id", userRes.user.id);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      setLogs(data || []);
    } catch (err: any) {
      toast.error("Failed to load activity logs: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [canViewAll]);

  const filtered = logs.filter((l) =>
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    JSON.stringify(l.details || {}).toLowerCase().includes(search.toLowerCase())
  );

  const formatAction = (action: string) => {
    switch (action) {
      case "report_damage":
        return <Badge variant="destructive">Damage Reported</Badge>;
      case "update_delivery_status":
        return <Badge className="bg-blue-100 text-blue-800">Delivery Status Updated</Badge>;
      case "received_stock":
        return <Badge className="bg-green-100 text-green-800">Stock Received</Badge>;
      case "issued_stock":
        return <Badge className="bg-yellow-100 text-yellow-800">Stock Issued</Badge>;
      default:
        return <Badge variant="secondary">{action.replace(/_/g, " ")}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activity & Audit Logs</h1>
          <p className="text-muted-foreground mt-1">
            {canViewAll
              ? "Comprehensive operational audit trail across all staff actions."
              : "Your personal activity record and transaction history."}
          </p>
        </div>
        <Button variant="outline" onClick={fetchLogs} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh Log
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activity records..."
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
                <th className="text-left px-4 py-3">Timestamp</th>
                <th className="text-left px-4 py-3">Action</th>
                <th className="text-left px-4 py-3">Target</th>
                <th className="text-left px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground">
                    Loading activity records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground">
                    No activity records found.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3">{formatAction(log.action)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                      {log.target_table ? `${log.target_table} #${log.target_id?.slice(0, 8)}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground">
                      {log.details ? (
                        <span className="font-mono bg-muted/40 px-2 py-1 rounded">
                          {typeof log.details === "object"
                            ? JSON.stringify(log.details)
                            : String(log.details)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivityPage;
