import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useStaffAuth } from "@/contexts/StaffAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  ShieldCheck, 
  ShoppingBag, 
  LogOut, 
  Save, 
  Loader2, 
  CheckCircle2, 
  KeyRound,
  LayoutDashboard,
  Truck
} from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { role, isStaff, isAdmin } = useStaffAuth();

  // Profile Form States
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("Nairobi");
  const [savingProfile, setSavingProfile] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Security Form States
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Order stats
  const [orderCount, setOrderCount] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      loadUserProfile();
      loadUserOrdersCount();
    }
  }, [user, authLoading, navigate]);

  const loadUserProfile = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      // 1. Fetch profile table row
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .maybeSingle();

      const meta = user.user_metadata || {};
      
      setFullName(profile?.full_name || meta.full_name || meta.name || "");
      setPhone(profile?.phone || meta.phone || "");
      setShippingAddress(meta.shipping_address || meta.address || "");
      setShippingCity(meta.shipping_city || meta.city || "Nairobi");
    } catch (err: any) {
      console.error("Error loading profile:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const loadUserOrdersCount = async () => {
    if (!user) return;
    try {
      const { count } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("customer_email", user.email);

      setOrderCount(count || 0);
    } catch {
      setOrderCount(0);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!fullName.trim()) {
      toast.error("Full Name cannot be empty.");
      return;
    }

    setSavingProfile(true);
    try {
      // 1. Update public.profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: fullName.trim(),
          phone: phone.trim(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      // 2. Update user metadata in Supabase Auth (saves address & city for checkout auto-fill)
      const { error: authMetaError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
          shipping_address: shippingAddress.trim(),
          shipping_city: shippingCity.trim(),
        },
      });

      if (authMetaError) throw authMetaError;

      toast.success("Profile updated successfully!");
    } catch (err: any) {
      console.error("Profile update error:", err);
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success("Password changed successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Signed out successfully.");
    navigate("/");
  };

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading your profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {/* Profile Header Card */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-border rounded-3xl p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-display font-bold text-2xl sm:text-3xl shadow-md">
                {(fullName || user?.email || "U").charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {fullName || "Valued Customer"}
                  </h1>
                  {isAdmin ? (
                    <Badge className="bg-red-500 hover:bg-red-600 text-white font-semibold">Administrator</Badge>
                  ) : isStaff ? (
                    <Badge className="bg-purple-600 text-white font-semibold capitalize">Staff: {role?.replace('_', ' ')}</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Customer</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {user?.email}
                </p>
              </div>
            </div>

            {/* Quick Portals & Orders Links */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Link to="/my-orders">
                <Button variant="outline" className="gap-2">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                  My Orders {orderCount !== null ? `(${orderCount})` : ""}
                </Button>
              </Link>
              {isAdmin && (
                <Link to="/admin/dashboard">
                  <Button className="gap-2 bg-primary hover:bg-primary/90">
                    <LayoutDashboard className="h-4 w-4" /> Admin Portal
                  </Button>
                </Link>
              )}
              {isStaff && !isAdmin && (
                <Link to="/staff/dashboard">
                  <Button className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                    <LayoutDashboard className="h-4 w-4" /> Staff Portal
                  </Button>
                </Link>
              )}
              <Button variant="ghost" onClick={handleLogout} className="text-destructive hover:bg-destructive/10 gap-1.5">
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Settings Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Personal Information & Delivery Address (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Details Card */}
            <Card className="shadow-sm border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                </div>
                <CardDescription>
                  Update your contact details so we can reach you regarding orders.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleUpdateProfile}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John Kamau"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        value={user?.email || ""}
                        disabled
                        className="bg-muted text-muted-foreground cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number (M-Pesa)</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 0712 345 678"
                      />
                    </div>
                  </div>

                  {/* Default Delivery Address */}
                  <div className="pt-4 border-t border-border space-y-4">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">Default Delivery Location</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="shippingAddress">Street / Building / Area</Label>
                        <Input
                          id="shippingAddress"
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                          placeholder="e.g. Westlands, Mpaka Road"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shippingCity">City / Town</Label>
                        <Input
                          id="shippingCity"
                          value={shippingCity}
                          onChange={(e) => setShippingCity(e.target.value)}
                          placeholder="e.g. Nairobi"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 border-t border-border px-6 py-4 flex justify-end">
                  <Button type="submit" disabled={savingProfile} className="gap-2">
                    {savingProfile ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" /> Save Profile Details
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          {/* Right Column: Security / Change Password */}
          <div className="space-y-8">
            <Card className="shadow-sm border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Security & Password</CardTitle>
                </div>
                <CardDescription>
                  Change your account login password.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleChangePassword}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                    />
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 border-t border-border px-6 py-4 flex justify-end">
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={savingPassword || !newPassword}
                    className="w-full gap-2"
                  >
                    {savingPassword ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Updating...
                      </>
                    ) : (
                      <>
                        <KeyRound className="h-4 w-4 text-primary" /> Update Password
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            {/* Quick Trust Summary */}
            <div className="bg-muted/40 rounded-2xl p-5 border border-border space-y-3">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <ShieldCheck className="h-4 w-4" /> BF Suma Nairobi Account
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your account stores your order tracking history, saved delivery locations, and provides priority customer assistance.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
