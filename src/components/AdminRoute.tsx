import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function AdminRoute({ children }: { children: React.ReactNode }) {
    const { session, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/20">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground animate-pulse">Verifying Access...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/auth" replace />;
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-border text-center max-w-md">
                    <h2 className="text-2xl font-bold font-display text-destructive mb-2">Access Denied</h2>
                    <p className="text-muted-foreground mb-6">
                        Your current account does not have administrator privileges required to view or manage products.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button onClick={() => (window.location.href = "/")}>Return to Store</Button>
                        <Button
                            variant="outline"
                            onClick={async () => {
                                await supabase.auth.signOut();
                                window.location.href = "/auth";
                            }}
                        >
                            Sign Out & Try Another Account
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
