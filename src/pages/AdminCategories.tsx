import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tags, Plus, Pencil, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  product_count?: number;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data: catData, error: catError } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (catError) throw catError;

      const { data: prodData, error: prodError } = await supabase
        .from("products")
        .select("category_id");

      if (prodError) throw prodError;

      const pcounts: Record<string, number> = {};
      prodData.forEach(p => {
        if (p.category_id) pcounts[p.category_id] = (pcounts[p.category_id] || 0) + 1;
      });

      const merged = (catData || []).map(c => ({
        ...c,
        product_count: pcounts[c.id] || 0
      }));

      setCategories(merged);
    } catch (error: any) {
      toast.error("Failed to fetch categories: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!newCatName.trim()) return;
    try {
      const slug = newCatName.trim().toLowerCase().replace(/\s+/g, '-');
      const { error } = await supabase.from("categories").insert({
        name: newCatName.trim(),
        slug: slug
      });
      if (error) throw error;
      toast.success("Category created!");
      setNewCatName("");
      fetchCategories();
    } catch (error: any) {
      toast.error("Error creating category: " + error.message);
    }
  };

  const handleDelete = async (id: string, count: number) => {
    if (count > 0) {
      toast.error("Cannot delete a category that has products!");
      return;
    }
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      toast.success("Category deleted.");
      fetchCategories();
    } catch (error: any) {
      toast.error("Error deleting category: " + error.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Tags className="h-8 w-8 text-primary" />
          Categories
        </h1>
        <p className="text-muted-foreground mt-1">Manage product categories to organize your store inventory.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
        <Input 
          placeholder="New category name (e.g. Skin Care)" 
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        {loading ? (
           <div className="p-16 text-center text-muted-foreground">Loading categories...</div>
        ) : categories.length === 0 ? (
           <div className="p-16 text-center text-muted-foreground border-t border-border">No categories found.</div>
        ) : (
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-muted/50 border-y border-border">
              <tr>
                <th className="px-6 py-4 font-medium text-muted-foreground">Name</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Slug</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Products</th>
                <th className="px-6 py-4 font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4 font-medium">{c.name}</td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{c.slug}</td>
                  <td className="px-6 py-4 font-medium">
                     <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-bold">{c.product_count}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id, c.product_count || 0)}>
                      <Trash className="h-4 w-4 text-red-500" />
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
export default AdminCategories;
