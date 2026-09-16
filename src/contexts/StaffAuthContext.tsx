import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppRole =
  | "admin"
  | "shop_manager"
  | "warehouse"
  | "logistics"
  | "teller"
  | "logistics_asst"
  | "customer"
  | null;

export interface WorkerProfile {
  id: string;
  user_id: string;
  employee_id: string;
  full_name: string;
  position: string;
  department: string | null;
  role: AppRole;
  status: string;
}

interface StaffAuthState {
  role: AppRole;
  isAdmin: boolean;
  isStaff: boolean;
  workerProfile: WorkerProfile | null;
  permissions: string[];
  hasPermission: (key: string) => boolean;
  loading: boolean;
  refreshAuth: () => Promise<void>;
}

const StaffAuthContext = createContext<StaffAuthState>({
  role: null,
  isAdmin: false,
  isStaff: false,
  workerProfile: null,
  permissions: [],
  hasPermission: () => false,
  loading: true,
  refreshAuth: async () => {},
});

const STAFF_ROLES: AppRole[] = [
  "shop_manager",
  "warehouse",
  "logistics",
  "teller",
  "logistics_asst",
];

export const StaffAuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<AppRole>(null);
  const [workerProfile, setWorkerProfile] = useState<WorkerProfile | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAuth = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setRole(null);
        setWorkerProfile(null);
        setPermissions([]);
        return;
      }

      const userId = session.user.id;

      // 1. Try RPC function first
      const { data: rpcRole } = await (supabase as any).rpc('get_current_user_role');
      let userRole = (rpcRole as AppRole) ?? null;

      // 2. Fallback: Load role from user_roles
      if (!userRole || userRole === "customer") {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle();

        if (roleData?.role) userRole = roleData.role as AppRole;
      }

      // 3. Fallback: check workers table if user_roles is missing or customer
      if (!userRole || userRole === "customer") {
        const { data } = await (supabase as any)
          .from("workers")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
          
        const workerRow = data as any;

        if (workerRow && workerRow.status === "active" && workerRow.role && STAFF_ROLES.includes(workerRow.role as AppRole)) {
          userRole = workerRow.role as AppRole;
          setWorkerProfile(workerRow);
        }
      }

      setRole(userRole);

      if (userRole === "admin") {
        // Admin gets all permissions — no DB query needed
        setPermissions(["*"]);
        setWorkerProfile(null);
        return;
      }

      if (userRole && STAFF_ROLES.includes(userRole)) {
        // Load worker profile if not already loaded
        if (!workerProfile) {
          const { data: profile } = await (supabase as any)
            .from("workers")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();

          setWorkerProfile((profile as any) ?? null);
        }

        // Load permissions for this role
        const { data: perms } = await (supabase as any)
          .from("role_permissions")
          .select("permission_key")
          .eq("role", userRole);

        setPermissions((perms as any[])?.map((p) => p.permission_key) ?? []);
      }
    } catch (err) {
      console.error("StaffAuthContext error:", err);
    } finally {
      setLoading(false);
    }


  };

  useEffect(() => {
    loadAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadAuth();
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasPermission = (key: string): boolean => {
    if (permissions.includes("*")) return true; // admin
    return permissions.includes(key);
  };

  const isAdmin = role === "admin";
  const isStaff = role !== null && STAFF_ROLES.includes(role);

  return (
    <StaffAuthContext.Provider
      value={{
        role,
        isAdmin,
        isStaff,
        workerProfile,
        permissions,
        hasPermission,
        loading,
        refreshAuth: loadAuth,
      }}
    >
      {children}
    </StaffAuthContext.Provider>
  );
};

export const useStaffAuth = () => useContext(StaffAuthContext);
