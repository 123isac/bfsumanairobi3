import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { StaffAuthProvider, useStaffAuth } from "@/contexts/StaffAuthContext";
import { AdminRoute } from "./components/AdminRoute";
import { AdminLayout } from "./components/AdminLayout";
import { StaffLayout } from "./components/StaffLayout";
import { PartnerLayout } from "./components/PartnerLayout";
import { PartnerRoute } from "./components/PartnerRoute";
import { Outlet } from "react-router-dom";
import { supabase } from "./integrations/supabase/client";

const Index = lazy(() => import("./pages/Index"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const Profile = lazy(() => import("./pages/Profile"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin pages
const AdminProducts = lazy(() => import("./pages/AdminProducts"));
const AdminAuth = lazy(() => import("./pages/AdminAuth"));
const AdminPartners = lazy(() => import("./pages/AdminPartners"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
const AdminCustomers = lazy(() => import("./pages/AdminCustomers"));
const AdminCategories = lazy(() => import("./pages/AdminCategories"));
const AdminPromotions = lazy(() => import("./pages/AdminPromotions"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AdminWorkers = lazy(() => import("./pages/AdminWorkers"));
const AdminRoles = lazy(() => import("./pages/AdminRoles"));
const AdminApprovals = lazy(() => import("./pages/AdminApprovals"));

// Staff pages
const StaffDashboard = lazy(() => import("./pages/StaffDashboard"));
const WarehousePage = lazy(() => import("./pages/WarehousePage"));
const LogisticsPage = lazy(() => import("./pages/LogisticsPage"));
const TellerPage = lazy(() => import("./pages/TellerPage"));
const TasksPage = lazy(() => import("./pages/TasksPage"));
const ActivityPage = lazy(() => import("./pages/ActivityPage"));

// Partner & policy pages
const PartnerApply = lazy(() => import("./pages/PartnerApply"));
const PartnerDashboard = lazy(() => import("./pages/PartnerDashboard"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const ReturnPolicy = lazy(() => import("./pages/ReturnPolicy"));
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
    },
  },
});

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const RouteLoader = () => (
  <div className="min-h-[40vh] flex items-center justify-center bg-background">
    <div className="h-8 w-8 rounded-full border-b-2 border-primary animate-spin" />
  </div>
);

const StaffAuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { isStaff, isAdmin, loading } = useStaffAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground animate-pulse">Entering Staff Portal...</p>
        </div>
      </div>
    );
  }

  if (!isStaff && !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.pathname.startsWith("/admin") && !location.pathname.startsWith("/staff")) {
      const sessionId = sessionStorage.getItem("bfsuma_session") || Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem("bfsuma_session", sessionId);

      const logVisit = async () => {
        try {
          await supabase.from("page_visits").insert({
            session_id: sessionId,
            path: location.pathname
          });
        } catch (e) {}
      };
      logVisit();
    }
  }, [location.pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <StaffAuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <AnalyticsTracker />
            <ScrollToTop />
            <Suspense fallback={<RouteLoader />}>

              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                <Route path="/auth" element={<Auth />} />

                <Route path="/admin/login" element={<AdminAuth />} />
                
                {/* Admin Portal Routing */}
                <Route path="/admin" element={<AdminRoute><AdminLayout><Outlet /></AdminLayout></AdminRoute>}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="partners" element={<AdminPartners />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="promotions" element={<AdminPromotions />} />
                  <Route path="workers" element={<AdminWorkers />} />
                  <Route path="roles" element={<AdminRoles />} />
                  <Route path="approvals" element={<AdminApprovals />} />
                  <Route path="activity" element={<ActivityPage />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* Staff Operations Portal Routing */}
                <Route path="/staff" element={<StaffAuthRoute><StaffLayout><Outlet /></StaffLayout></StaffAuthRoute>}>
                  <Route index element={<Navigate to="/staff/dashboard" replace />} />
                  <Route path="dashboard" element={<StaffDashboard />} />
                  <Route path="warehouse" element={<WarehousePage />} />
                  <Route path="logistics" element={<LogisticsPage />} />
                  <Route path="teller" element={<TellerPage />} />
                  <Route path="tasks" element={<TasksPage />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="activity" element={<ActivityPage />} />
                </Route>
                
                {/* Partner Affiliate Portal Routing */}
                <Route path="/partner" element={<PartnerRoute><PartnerLayout><Outlet /></PartnerLayout></PartnerRoute>}>
                  <Route index element={<Navigate to="/partner/dashboard" replace />} />
                  <Route path="dashboard" element={<PartnerDashboard />} />
                </Route>

                <Route path="/partner/apply" element={<PartnerApply />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/return-policy" element={<ReturnPolicy />} />
                <Route path="/shipping-policy" element={<ShippingPolicy />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </CartProvider>
        </StaffAuthProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
