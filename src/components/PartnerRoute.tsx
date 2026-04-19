import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import Header from "./Header";
import Footer from "./Footer";

export const PartnerRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [partnerStatus, setPartnerStatus] = useState<"checking" | "approved" | "pending" | "none">("checking");

  useEffect(() => {
    if (authLoading || !user) return;

    const checkPartnerStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("spas")
          .select("application_status, is_active")
          .eq("email", user.email)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          if (data.application_status === "approved" || data.is_active) {
            setPartnerStatus("approved");
          } else {
            setPartnerStatus("pending");
          }
        } else {
          setPartnerStatus("none");
        }
      } catch (error) {
        console.error("Error checking partner access", error);
        setPartnerStatus("none");
      }
    };

    checkPartnerStatus();
  }, [user, authLoading]);

  if (authLoading || partnerStatus === "checking") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // Save where they wanted to go so we can bounce them back after login
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (partnerStatus === "pending") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <ShieldAlert className="h-20 w-20 text-yellow-500" />
          <h1 className="text-3xl font-bold">Application Pending</h1>
          <p className="text-muted-foreground max-w-md">
            Your partner application is currently under review by our administration team. 
            We will contact you at <strong>{user.email}</strong> once your account is activated!
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (partnerStatus === "none") {
     return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <ShieldAlert className="h-20 w-20 text-destructive" />
          <h1 className="text-3xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground max-w-md">
            The email <strong>{user.email}</strong> is not associated with any Partner account.
            If you wish to become a partner, please apply first.
          </p>
          <a href="/partner/apply" className="text-primary hover:underline underline-offset-4 font-semibold mt-4">
            Apply to be a Partner
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  return <>{children}</>;
};
