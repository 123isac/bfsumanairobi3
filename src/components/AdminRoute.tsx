import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const STAFF_ROLES = ["shop_manager", "warehouse", "logistics", "teller", "logistics_asst"];

export function AdminRoute({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isStaff, setIsStaff] = useState(false);

    useEffect(() => {
        let mounted = true;

        const checkAuth = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !session?.user) {
                    if (mounted) { setIsAdmin(false); setLoading(false); }
                    return;
                }

                const { data: roleData, error: roleError } = await supabase
                    .from('user_roles')
                    .select('role')
                    .eq('user_id', session.user.id)
                    .maybeSingle();

                if (mounted) {
                    if (!roleError && roleData?.role === 'admin') {
                        setIsAdmin(true);
                    } else if (!roleError && STAFF_ROLES.includes(roleData?.role ?? '')) {
                        // Staff member trying to access /admin — redirect them to staff portal
                        setIsStaff(true);
                    } else {
                        await supabase.auth.signOut();
                    }
                    setLoading(false);
                }
            } catch (error) {
                console.error("Admin Route Auth Error:", error);
                if (mounted) { setIsAdmin(false); setLoading(false); }
            }
        };

        checkAuth();
        return () => { mounted = false; };
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/20">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground animate-pulse">Verifying access...</p>
                </div>
            </div>
        );
    }

    // Staff members who accidentally navigate to /admin get sent to their portal
    if (isStaff) return <Navigate to="/staff/dashboard" replace />;

    if (!isAdmin) return <Navigate to="/admin/login" replace />;

    return <>{children}</>;
}

