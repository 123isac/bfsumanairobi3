import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Percent, Plus, Tag, ToggleLeft, ToggleRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface PromoCode {
  id: string;
  code: string;
  discount_amount: number;
  discount_type: string;
  is_active: boolean;
  created_at: string;
}

const AdminPromotions = () => {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);

  // New promo form state
  const [newCode, setNewCode] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newType, setNewType] = useState("percentage");

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPromos(data || []);
    } catch (error: any) {
      toast.error("Failed to load promo codes: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleCreate = async () => {
    if (!newCode || !newAmount) return;
    try {
      const { error } = await supabase.from("promo_codes").insert({
        code: newCode.toUpperCase().trim(),
        discount_amount: Number(newAmount),
        discount_type: newType,
        is_active: true
      });
      if (error) throw error;
      
      toast.success("Promo code created successfully");
      setNewCode("");
      setNewAmount("");
      fetchPromos();
    } catch (error: any) {
      toast.error("Error creating promo code: " + error.message);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("promo_codes")
        .update({ is_active: !currentStatus })
        .eq("id", id);
      
      if (error) throw error;
      toast.success(currentStatus ? "Promo code disabled" : "Promo code enabled");
      fetchPromos();
    } catch (error: any) {
      toast.error("Error updating promo code: " + error.message);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Percent className="h-8 w-8 text-primary" />
          Promotions & Discounts
        </h1>
        <p className="text-muted-foreground mt-1">Manage discount codes and active sales campaigns.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex flex-col md:flex-row items-center gap-4">
        <Input 
          placeholder="Code (e.g. SUMMER10)" 
          value={newCode}
          onChange={(e) => setNewCode(e.target.value)}
          className="w-full md:w-[200px]"
        />
        <div className="flex bg-muted rounded-lg p-1 w-full md:w-auto overflow-hidden border border-border">
          <button 
            className={`flex-1 md:w-[100px] text-sm py-2 px-3 rounded-md transition-colors ${newType === 'percentage' ? 'bg-white shadow-sm font-medium' : 'text-muted-foreground hover:bg-white/50'}`}
            onClick={() => setNewType('percentage')}
          >
            Percentage %
          </button>
          <button 
            className={`flex-1 md:w-[100px] text-sm py-2 px-3 rounded-md transition-colors ${newType === 'fixed' ? 'bg-white shadow-sm font-medium' : 'text-muted-foreground hover:bg-white/50'}`}
            onClick={() => setNewType('fixed')}
          >
            Fixed KSh
          </button>
        </div>
        <Input 
          type="number"
          placeholder="Amount" 
          value={newAmount}
          onChange={(e) => setNewAmount(e.target.value)}
          className="w-full md:w-[150px]"
        />
        <Button onClick={handleCreate} className="w-full md:w-auto shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Create Code
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-muted-foreground">Loading promos...</div>
        ) : promos.length === 0 ? (
           <div className="p-16 text-center text-muted-foreground border-t border-border">No promotional codes found.</div>
        ) : (
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-muted/50 border-y border-border">
              <tr>
                <th className="px-6 py-4 font-medium text-muted-foreground">Promo Code</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Discount</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Created</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Status</th>
                <th className="px-6 py-4 font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {promos.map((p) => (
                <tr key={p.id} className={`hover:bg-muted/30 ${!p.is_active && 'opacity-60'}`}>
                  <td className="px-6 py-4">
                     <span className="bg-primary/10 text-primary font-mono font-bold px-3 py-1 rounded-md border border-primary/20 flex items-center justify-center w-fit gap-2">
                        <Tag className="h-3 w-3" />
                        {p.code}
                     </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-lg">
                     {p.discount_type === 'percentage' ? `${p.discount_amount}% OFF` : `KSh ${p.discount_amount} OFF`}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                     {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded text-xs font-bold ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {p.is_active ? 'ACTIVE' : 'INACTIVE'}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => toggleStatus(p.id, p.is_active)}>
                      {p.is_active ? <ToggleRight className="h-6 w-6 text-green-500" /> : <ToggleLeft className="h-6 w-6 text-slate-400" />}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPromotions;
