import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, Users, ExternalLink, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Customer {
  id: string;
  full_name: string;
  phone: string;
  created_at: string;
  order_count?: number;
}

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Group counting orders per customer
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("user_id");

      if (ordersError) throw ordersError;

      const orderCounts: Record<string, number> = {};
      ordersData.forEach(order => {
        orderCounts[order.user_id] = (orderCounts[order.user_id] || 0) + 1;
      });

      const merged = profilesData.map(p => ({
        ...p,
        order_count: orderCounts[p.id] || 0
      }));

      setCustomers(merged);
    } catch (error: any) {
      toast.error("Failed to fetch customers: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDeleteUser = async (userId: string, fullName: string) => {
    if (!confirm(`Are you absolutely sure you want to permanently delete ${fullName || "this user"}? This action cannot be undone.`)) return;

    try {
      const { data, error } = await supabase.functions.invoke("delete-user", {
        body: { userIdToDelete: userId }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed to delete user");

      toast.success("User securely erased.");
      fetchCustomers(); // Refresh the grid
    } catch (error: any) {
      console.error(error);
      toast.error(`Error deleting user: ${error.message}`);
    }
  };

  const filtered = customers.filter(c =>
    (c.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Customer CRM
          </h1>
          <p className="text-muted-foreground mt-1">View all registered customers and their order history summary.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-[250px]">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input
               type="search"
               placeholder="Search name or phone..."
               className="pl-9 w-full"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-muted-foreground">Loading customers...</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground border-t border-border">
            No customers found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-muted/50 border-y border-border">
                <tr>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Name</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Phone Number</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Registration Date</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Total Orders</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{customer.full_name || "N/A"}</td>
                    <td className="px-6 py-4">{customer.phone || "N/A"}</td>
                    <td className="px-6 py-4">{new Date(customer.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-primary">
                      {customer.order_count}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                       <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" /> View Orders
                       </Button>
                       <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteUser(customer.id, customer.full_name)}
                       >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                       </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;
