import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Home, Store, Settings, LineChart, Handshake } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";

export const PartnerLayout = ({ children }: { children: React.ReactNode }) => {
  const { signOut } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const navItems = [
    { name: "My Performance", path: "/partner/dashboard", icon: LineChart },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#0A1A2F] text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <Handshake className="h-8 w-8 text-[#E29A26]" />
          <div>
            <h1 className="font-display font-bold text-xl leading-none">Affiliate</h1>
            <p className="text-xs text-white/50 mt-1">Partner Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-[#E29A26]" : ""}`} />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition-colors"
          >
            <Store className="h-5 w-5" />
            <span className="font-medium text-sm">Main Store</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-white/5 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium text-sm">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden min-h-screen">
        <div className="max-w-7xl mx-auto p-6 lg:p-10">{children}</div>
      </main>
    </div>
  );
};
