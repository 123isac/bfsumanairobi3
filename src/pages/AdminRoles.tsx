import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface PermissionItem {
  key: string;
  label: string;
  module: string;
}

interface RolePerm {
  role: string;
  permission_key: string;
}

const ROLES = [
  { id: "shop_manager",   label: "Shop Manager" },
  { id: "warehouse",      label: "Warehouse" },
  { id: "logistics",      label: "Logistics" },
  { id: "teller",         label: "Teller" },
  { id: "logistics_asst", label: "Logistics Asst" },
];

const AdminRoles = () => {
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [rolePerms, setRolePerms] = useState<RolePerm[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatrix = async () => {
    setLoading(true);
    try {
      const [permRes, rolePermRes] = await Promise.all([
        supabase.from("permissions").select("*").order("module"),
        supabase.from("role_permissions").select("*"),
      ]);

      if (permRes.error) throw permRes.error;
      if (rolePermRes.error) throw rolePermRes.error;

      setPermissions(permRes.data || []);
      setRolePerms(rolePermRes.data || []);
    } catch (err: any) {
      toast.error("Failed to load permission matrix: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, []);

  const hasPerm = (role: string, permKey: string) => {
    return rolePerms.some((rp) => rp.role === role && rp.permission_key === permKey);
  };

  const togglePerm = async (role: string, permKey: string) => {
    const isCurrentlyGranted = hasPerm(role, permKey);

    try {
      if (isCurrentlyGranted) {
        // Delete from role_permissions
        const { error } = await supabase
          .from("role_permissions")
          .delete()
          .eq("role", role as any)
          .eq("permission_key", permKey);

        if (error) throw error;
        setRolePerms((prev) => prev.filter((rp) => !(rp.role === role && rp.permission_key === permKey)));
        toast.success(`Removed permission`);
      } else {
        // Insert into role_permissions
        const { error } = await supabase
          .from("role_permissions")
          .insert({ role: role as any, permission_key: permKey });

        if (error) throw error;
        setRolePerms((prev) => [...prev, { role, permission_key: permKey }]);
        toast.success(`Granted permission`);
      }
    } catch (err: any) {
      toast.error("Failed to update permission: " + err.message);
    }
  };

  // Group permissions by module
  const groupedModules = permissions.reduce<Record<string, PermissionItem[]>>((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Roles & Permissions Matrix</h1>
          <p className="text-muted-foreground mt-1">
            Configure system capabilities for each operational tier. Changes apply instantly.
          </p>
        </div>
        <Button variant="outline" onClick={fetchMatrix} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh Matrix
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground text-xs uppercase font-medium">
              <tr>
                <th className="text-left px-5 py-3.5 w-1/3">Permission Capability</th>
                {ROLES.map((r) => (
                  <th key={r.id} className="text-center px-3 py-3.5 whitespace-nowrap">
                    {r.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-muted-foreground">
                    Loading permission matrix...
                  </td>
                </tr>
              ) : (
                Object.entries(groupedModules).map(([moduleName, perms]) => (
                  <>
                    <tr key={`header-${moduleName}`} className="bg-muted/20">
                      <td
                        colSpan={6}
                        className="px-5 py-2 font-bold text-xs uppercase tracking-wider text-primary"
                      >
                        {moduleName} Operations
                      </td>
                    </tr>
                    {perms.map((p) => (
                      <tr key={p.key} className="hover:bg-muted/10 transition-colors">
                        <td className="px-5 py-3">
                          <div className="font-medium text-foreground">{p.label}</div>
                          <div className="text-xs text-muted-foreground font-mono">{p.key}</div>
                        </td>
                        {ROLES.map((r) => {
                          const checked = hasPerm(r.id, p.key);
                          return (
                            <td key={`${r.id}-${p.key}`} className="text-center px-3 py-3">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() => togglePerm(r.id, p.key)}
                                aria-label={`${p.label} for ${r.label}`}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminRoles;
