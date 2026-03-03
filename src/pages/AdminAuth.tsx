import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, Loader2 } from "lucide-react";

const AdminAuth = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);

    // Check if already logged in as admin
    useEffect(() => {
        const checkExistingSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    const { data } = await supabase
                        .from('user_roles')
                        .select('role')
                        .eq('user_id', session.user.id)
                        .maybeSingle();

                    if (data?.role === 'admin') {
                        navigate("/admin/products", { replace: true });
                        return;
                    }
                }
            } catch (error) {
                console.error("Session check error:", error);
            } finally {
                setVerifying(false);
            }
        };

        checkExistingSession();
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Please enter email and password");
            return;
        }

        setLoading(true);

        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            if (authData.user) {
                // Verify admin role immediately
                const { data: roleData, error: roleError } = await supabase
                    .from('user_roles')
                    .select('role')
                    .eq('user_id', authData.user.id)
                    .maybeSingle();

                if (roleError) throw roleError;

                if (roleData?.role === 'admin') {
                    toast.success("Admin access granted.");
                    navigate("/admin/products", { replace: true });
                } else {
                    // If not an admin, sign them out immediately
                    await supabase.auth.signOut();
                    toast.error("Access Denied: You do not have administrator privileges.");
                }
            }
        } catch (error: any) {
            let message = error.message;
            if (message.includes("Invalid login credentials")) {
                message = "Invalid email or password.";
            }
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md shadow-xl border-slate-200">
                <CardHeader className="space-y-3 pb-6 text-center">
                    <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-2">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Admin Portal</CardTitle>
                    <CardDescription className="text-base">
                        Secure login for BF Suma Nairobi administrators.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Administrator Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@bfsumanairobi3.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                className="h-11"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-medium mt-6"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                "Log In to Dashboard"
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t border-slate-100 pt-6">
                    <Button variant="ghost" className="text-muted-foreground" onClick={() => navigate("/")}>
                        &larr; Return to Storefront
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default AdminAuth;
