import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Check, X } from "lucide-react";

type PartnerApplication = Database["public"]["Tables"]["spas"]["Row"];

const AdminPartners = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [applications, setApplications] = useState<PartnerApplication[]>([]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("spas")
        .select("*")
        .order("applied_at", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error("Failed to load applications: " + message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const updateStatus = async (item: PartnerApplication, status: "approved" | "rejected") => {
    let rejectionReason: string | null = null;

    if (status === "rejected") {
      const entered = window.prompt("Rejection reason (optional):", item.rejection_reason || "");
      if (entered === null) return;
      rejectionReason = entered.trim() || null;
    }

    try {
      const payload: Database["public"]["Tables"]["spas"]["Update"] = {
        application_status: status,
        rejection_reason: status === "rejected" ? rejectionReason : null,
        approved_by: user?.id || null,
        approved_at: status === "approved" ? new Date().toISOString() : null,
      };

      const { error } = await supabase.from("spas").update(payload).eq("id", item.id);
      if (error) throw error;

      toast.success("Application " + status + ".");
      fetchApplications();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error("Failed to update application: " + message);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return applications;
    const q = search.toLowerCase();
    return applications.filter((item) =>
      item.contact_name.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.phone.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q),
    );
  }, [applications, search]);

  const pendingCount = applications.filter((item) => item.application_status === "pending").length;

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-border">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold font-display">Partner Applications</h1>
              <p className="text-muted-foreground text-sm mt-1">Applications submitted from the public partner form.</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm px-3 py-1 border-primary/30 text-primary">
                Pending: {pendingCount}
              </Badge>
              <Input
                type="search"
                placeholder="Search applications..."
                className="w-full md:w-[260px]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-muted-foreground">Loading applications...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">No partner applications found.</div>
          ) : (
            <div className="space-y-4">
              {filtered.map((item) => (
                <div key={item.id} className="border border-border rounded-xl p-4 md:p-5 bg-background">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="space-y-1.5">
                      <h2 className="font-semibold text-foreground text-lg">{item.contact_name}</h2>
                      <p className="text-sm text-muted-foreground">{item.email} | {item.phone}</p>
                      <p className="text-xs text-muted-foreground">Referral code: {item.referral_code}</p>
                      <p className="text-xs text-muted-foreground">
                        Applied: {item.applied_at ? new Date(item.applied_at).toLocaleString() : new Date(item.created_at).toLocaleString()}
                      </p>
                      {item.rejection_reason && item.application_status === "rejected" && (
                        <p className="text-sm text-red-600">Reason: {item.rejection_reason}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {item.application_status === "pending" ? (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-600 text-white"
                            onClick={() => updateStatus(item, "approved")}
                          >
                            <Check className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateStatus(item, "rejected")}
                          >
                            <X className="h-4 w-4 mr-1" /> Reject
                          </Button>
                        </>
                      ) : item.application_status === "approved" ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                          <Check className="h-3.5 w-3.5 mr-1" /> Approved
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
                          <X className="h-3.5 w-3.5 mr-1" /> Rejected
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPartners;

