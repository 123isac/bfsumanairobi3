import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function AdminRoute({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        let mounted = true;

        const checkAuth = async () => {
            try {
                // 1. Check direct session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !session?.user) {
                    if (mounted) {
                        setIsAuthorized(false);
                        setLoading(false);
                    }
                    return;
                }

                // 2. Check admin role directly
                const { data: roleData, error: roleError } = await supabase
                    .from('user_roles')
                    .select('role')
                    .eq('user_id', session.user.id)
                    .maybeSingle();

                if (mounted) {
                    if (!roleError && roleData?.role === 'admin') {
                        setIsAuthorized(true);
                    } else {
                        // Force signout if they shouldn't be here to keep the admin portal clean
                        await supabase.auth.signOut();
                        setIsAuthorized(false);
                    }
                    setLoading(false);
                }
            } catch (error) {
                console.error("Admin Route Auth Error:", error);
                if (mounted) {
                    setIsAuthorized(false);
                    setLoading(false);
                }
            }
        };

        checkAuth();

        return () => {
            mounted = false;
        };
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/20">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground animate-pulse">Entering Secure Admin Portal...</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return <Navigate to="/admin/login" replace />;
    }

    return <>{children}</>;
}
