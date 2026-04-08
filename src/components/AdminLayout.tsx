import { Link, useLocation } from "react-router-dom";
import { 
  Bell, 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Tags, 
  Users, 
  Handshake, 
  Percent, 
  Settings, 
  Menu,
  X,
  LogOut
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: Tags },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Partner Applications", href: "/admin/partners", icon: Handshake },
  { label: "Promotions", href: "/admin/promotions", icon: Percent },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-border sticky top-0 z-20 shadow-sm">
        <Link to="/" className="font-display font-bold text-xl text-primary tracking-tight">
          BF Suma <span className="text-foreground">Admin</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
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
        <div className="p-6 hidden md:block">
          <Link to="/" className="font-display font-bold text-2xl text-white tracking-tight flex items-center gap-2">
            <span className="bg-primary text-white p-1 rounded-md shadow-sm">
              <Package className="h-5 w-5" />
            </span>
            Admin <span className="text-primary">Panel</span>
          </Link>
        </div>

        <div className="md:hidden p-4 flex justify-end">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="text-white hover:text-white hover:bg-slate-800">
            <X className="h-6 w-6" />
          </Button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4 md:mt-0 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
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

        <div className="p-4 border-t border-slate-800">
          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-start gap-3 hover:bg-slate-800 hover:text-white text-slate-300"
            onClick={() => signOut()}
          >
            <LogOut className="h-5 w-5 text-slate-400" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen relative w-full md:max-w-[calc(100vw-256px)]">
        <div className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
