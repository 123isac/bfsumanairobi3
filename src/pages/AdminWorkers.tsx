import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, Plus, Search, UserCheck, UserX, Edit, Shield, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sendWorkerInviteEmail } from "@/utils/email";


interface Worker {
  id: string;
  user_id: string;
  employee_id: string;
  full_name: string;
  position: string;
  department: string | null;
  role: string;
  status: string;
  created_at: string;
}

const ROLE_DISPLAY: Record<string, { label: string; color: string }> = {
  shop_manager:   { label: "Shop Manager", color: "bg-purple-100 text-purple-800" },
  warehouse:      { label: "Warehouse Asst", color: "bg-blue-100 text-blue-800" },
  logistics:      { label: "Logistics Officer", color: "bg-amber-100 text-amber-800" },
  teller:         { label: "Teller Services", color: "bg-green-100 text-green-800" },
  logistics_asst: { label: "Logistics Asst", color: "bg-orange-100 text-orange-800" },
  admin:          { label: "Administrator", color: "bg-red-100 text-red-800" },
};

const AdminWorkers = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editWorker, setEditWorker] = useState<Worker | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("Warehouse");
  const [role, setRole] = useState("warehouse");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("workers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWorkers(data || []);
    } catch (err: any) {
      toast.error("Failed to load staff list: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const openCreateModal = () => {
    const nextNum = (workers.length + 1).toString().padStart(3, "0");
    setEmployeeId(`EMP-${nextNum}`);
    setFullName("");
    setPosition("");
    setDepartment("Warehouse");
    setRole("warehouse");
    setEmail("");
    setPassword("");
    setCreateOpen(true);
  };

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !employeeId || !email || !password || !role) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    const cleanEmpId = employeeId.trim();
    const cleanPosition = position.trim() || ROLE_DISPLAY[role]?.label || role;

    try {
      // 1. Primary Method: Invoke 'create-worker' Edge Function
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke("create-worker", {
        body: {
          email: cleanEmail,
          password,
          fullName: cleanName,
          employeeId: cleanEmpId,
          position: cleanPosition,
          department,
          role,
        },
      });

      if (!edgeError && edgeData?.success) {
        sendWorkerInviteEmail({
          email: cleanEmail,
          fullName: cleanName,
          role: ROLE_DISPLAY[role]?.label || role,
          tempPassword: password,
        }).catch(e => console.warn("Worker invite email error:", e));

        toast.success(edgeData.message || `Staff account for ${cleanName} configured successfully!`);
        setCreateOpen(false);
        fetchWorkers();
        return;
      }

      // 2. Secondary Method (Database RPC Fallback for existing customers)
      const { data: rpcData, error: rpcError } = await supabase.rpc("admin_upsert_worker", {
        _email: cleanEmail,
        _full_name: cleanName,
        _employee_id: cleanEmpId,
        _position: cleanPosition,
        _department: department,
        _role: role,
      });

      if (!rpcError && rpcData?.success) {
        sendWorkerInviteEmail({
          email: cleanEmail,
          fullName: cleanName,
          role: ROLE_DISPLAY[role]?.label || role,
          tempPassword: password,
        }).catch(e => console.warn("Worker invite email error:", e));

        toast.success(rpcData.message || `Customer (${cleanEmail}) upgraded to ${ROLE_DISPLAY[role]?.label || role}!`);
        setCreateOpen(false);
        fetchWorkers();
        return;
      }

      // 3. Tertiary Method (Standard client-side creation for brand new email)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { full_name: cleanName },
        },
      });

      if (authError) {
        // If email already registered but RPC couldn't upgrade, report clear reason
        if (authError.message.includes("already registered") || authError.message.includes("already exists")) {
          throw new Error(`This email (${cleanEmail}) is already registered in the system. Deploy the create-worker function or run the admin_upsert_worker SQL to upgrade them.`);
        }
        throw authError;
      }

      if (authData.user) {
        const newUserId = authData.user.id;

        // Assign user role
        await supabase.from("user_roles").upsert({
          user_id: newUserId,
          role: role as any,
        }, { onConflict: 'user_id' });

        // Insert worker profile
        await supabase.from("workers").upsert({
          user_id: newUserId,
          employee_id: cleanEmpId,
          full_name: cleanName,
          position: cleanPosition,
          department,
          role: role as any,
          status: "active",
        }, { onConflict: 'user_id' });

        sendWorkerInviteEmail({
          email: cleanEmail,
          fullName: cleanName,
          role: ROLE_DISPLAY[role]?.label || role,
          tempPassword: password,
        }).catch(e => console.warn("Worker invite email error:", e));

        toast.success(`Staff account for ${cleanName} created successfully!`);
        setCreateOpen(false);
        fetchWorkers();
        return;
      }


      throw new Error(edgeData?.error || "Failed to configure worker account");
    } catch (err: any) {
      console.error("Create worker error:", err);
      toast.error(err.message || "Failed to create worker account");
    } finally {
      setSubmitting(false);
    }
  };


  const toggleStatus = async (worker: Worker) => {
    const newStatus = worker.status === "active" ? "suspended" : "active";
    try {
      const { error } = await supabase
        .from("workers")
        .update({ status: newStatus })
        .eq("id", worker.id);

      if (error) throw error;
      toast.success(`Account marked as ${newStatus}`);
      fetchWorkers();
    } catch (err: any) {
      toast.error("Failed to update status: " + err.message);
    }
  };

  const handleUpdateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editWorker) return;

    try {
      const { error } = await supabase
        .from("workers")
        .update({
          full_name: editWorker.full_name,
          position: editWorker.position,
          department: editWorker.department,
          role: editWorker.role as any,
        })
        .eq("id", editWorker.id);

      if (error) throw error;

      // Update user_roles table too
      await supabase
        .from("user_roles")
        .update({ role: editWorker.role as any })
        .eq("user_id", editWorker.user_id);

      toast.success("Worker details updated");
      setEditWorker(null);
      fetchWorkers();
    } catch (err: any) {
      toast.error("Failed to update: " + err.message);
    }
  };

  const filtered = workers.filter((w) =>
    w.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    w.employee_id?.toLowerCase().includes(search.toLowerCase()) ||
    w.position?.toLowerCase().includes(search.toLowerCase()) ||
    w.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff & Worker Accounts</h1>
          <p className="text-muted-foreground mt-1">
            Create employee credentials, manage roles, and control system access.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchWorkers} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="h-4 w-4" /> Add New Worker
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, position..."
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
                <th className="text-left px-4 py-3">Employee ID</th>
                <th className="text-left px-4 py-3">Full Name</th>
                <th className="text-left px-4 py-3">Position</th>
                <th className="text-left px-4 py-3">Department</th>
                <th className="text-left px-4 py-3">System Role</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading staff records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    No workers registered yet. Click "Add New Worker" above.
                  </td>
                </tr>
              ) : (
                filtered.map((worker) => (
                  <tr key={worker.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-xs">
                      {worker.employee_id}
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {worker.full_name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {worker.position}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {worker.department || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={ROLE_DISPLAY[worker.role]?.color || "bg-muted text-foreground"}>
                        {ROLE_DISPLAY[worker.role]?.label || worker.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {worker.status === "active" ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Suspended</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditWorker(worker)}
                          className="h-8 w-8 p-0"
                          title="Edit Worker"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleStatus(worker)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          title={worker.status === "active" ? "Suspend Account" : "Activate Account"}
                        >
                          {worker.status === "active" ? (
                            <UserX className="h-4 w-4 text-destructive" />
                          ) : (
                            <UserCheck className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Worker Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Register New Worker</DialogTitle>
            <DialogDescription>
              Create credentials and assign an operational role.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateWorker} className="space-y-4 text-sm mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Full Name *</Label>
                <Input
                  required
                  placeholder="e.g. Jackson Muli"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Employee ID *</Label>
                <Input
                  required
                  placeholder="EMP-001"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Position Title</Label>
                <Input
                  placeholder="e.g. Warehouse Assistant"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Warehouse">Warehouse</SelectItem>
                    <SelectItem value="Logistics">Logistics</SelectItem>
                    <SelectItem value="Teller Services">Teller Services</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                    <SelectItem value="General Operations">General Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>System Role * (Determines Default Permissions)</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="shop_manager">Shop Manager (Supervises store & assistants)</SelectItem>
                  <SelectItem value="warehouse">Warehouse Assistant (Inventory, receive & issue)</SelectItem>
                  <SelectItem value="logistics">Logistics Officer (Deliveries, dispatches)</SelectItem>
                  <SelectItem value="teller">Teller (Settlements & collections)</SelectItem>
                  <SelectItem value="logistics_asst">Logistics Assistant (Task fulfillment)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
              <div className="space-y-1.5">
                <Label>Login Email *</Label>
                <Input
                  required
                  type="email"
                  placeholder="staff@bfsumanairobi3.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Temporary Password *</Label>
                <Input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground mt-1">Min 6 characters. If user is already registered, this overrides their login password.</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border/50">
              💡 <strong>Tip:</strong> Works for brand new staff or existing customer accounts. If the person already registered on the website, their account will be upgraded to this staff role and their password set to the one above.
            </p>

            <div className="flex justify-end gap-2 pt-3">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Processing Account..." : "Create / Upgrade Worker"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Worker Modal */}
      <Dialog open={!!editWorker} onOpenChange={(open) => !open && setEditWorker(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Worker Profile</DialogTitle>
          </DialogHeader>
          {editWorker && (
            <form onSubmit={handleUpdateWorker} className="space-y-4 text-sm mt-2">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input
                  value={editWorker.full_name}
                  onChange={(e) => setEditWorker({ ...editWorker, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Position</Label>
                <Input
                  value={editWorker.position}
                  onChange={(e) => setEditWorker({ ...editWorker, position: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Input
                  value={editWorker.department || ""}
                  onChange={(e) => setEditWorker({ ...editWorker, department: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select
                  value={editWorker.role}
                  onValueChange={(val) => setEditWorker({ ...editWorker, role: val })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shop_manager">Shop Manager</SelectItem>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                    <SelectItem value="logistics">Logistics</SelectItem>
                    <SelectItem value="teller">Teller</SelectItem>
                    <SelectItem value="logistics_asst">Logistics Asst</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" onClick={() => setEditWorker(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWorkers;
