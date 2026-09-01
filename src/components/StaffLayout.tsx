import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Truck,
  Banknote,
  CheckSquare,
  Activity,
  Users,
  Menu,
  X,
  LogOut,
  Warehouse,
  Bell,
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { useStaffAuth } from "@/contexts/StaffAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "./ui/badge";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  permission: string;
}

const ALL_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",   href: "/staff/dashboard",  icon: LayoutDashboard, permission: "" }, // always visible
  { label: "Warehouse",   href: "/staff/warehouse",  icon: Warehouse,       permission: "view_inventory" },
  { label: "Logistics",   href: "/staff/logistics",  icon: Truck,           permission: "view_deliveries" },
  { label: "Teller",      href: "/staff/teller",     icon: Banknote,        permission: "view_teller" },
  { label: "Tasks",       href: "/staff/tasks",      icon: CheckSquare,     permission: "view_own_tasks" },
  { label: "Customers",   href: "/staff/customers",  icon: Users,           permission: "view_customers" },
  { label: "My Activity", href: "/staff/activity",   icon: Activity,        permission: "view_activity_own" },
];

const ROLE_LABELS: Record<string, string> = {
  shop_manager:   "Shop Manager",
  warehouse:      "Warehouse Assistant",
  logistics:      "Logistics Officer",
  teller:         "Teller",
  logistics_asst: "Logistics Assistant",
  admin:          "Main Administrator",
};

export const StaffLayout = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { workerProfile, role, hasPermission } = useStaffAuth();

  const visibleNav = ALL_NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const firstName = workerProfile?.full_name?.split(" ")[0] ?? "Staff";
  const roleLabel = ROLE_LABELS[role ?? ""] ?? role ?? "Staff";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-border sticky top-0 z-20 shadow-sm">
        <span className="font-display font-bold text-xl text-primary tracking-tight">
          BF Suma <span className="text-foreground">Staff</span>
        </span>
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Staff Identity */}
        <div className="p-5 border-b border-slate-800">
          <p className="text-xs text-slate-500 mb-1">{greeting()},</p>
          <p className="font-bold text-white text-lg leading-tight">{firstName}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs font-medium px-2 py-0.5 rounded-full">
              {roleLabel}
            </Badge>
          </div>
          {workerProfile?.department && (
            <p className="text-xs text-slate-500 mt-1">{workerProfile.department}</p>
          )}
          {workerProfile?.employee_id && (
            <p className="text-xs text-slate-600 mt-0.5">{workerProfile.employee_id}</p>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
          {visibleNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                  ${isActive
                    ? "bg-primary text-white font-medium shadow-md shadow-primary/20"
                    : "hover:bg-slate-800 hover:text-white"}
                `}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 space-y-1">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-start gap-3 hover:bg-slate-800 hover:text-white text-slate-300"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 text-slate-400" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen w-full md:max-w-[calc(100vw-256px)]">
        <div className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
