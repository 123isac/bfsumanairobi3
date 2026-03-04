import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Image as ImageIcon, Plus, Edit2, LayoutGrid, Bell } from "lucide-react";
import { AdminProductModal } from "@/components/AdminProductModal";

const AdminProducts = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [search, setSearch] = useState("");
    const [pendingApplications, setPendingApplications] = useState(0);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

    useEffect(() => {
        fetchProducts();
        fetchPendingApplications();
    }, []);

    const fetchProducts = async () => {
        setLoadingProducts(true);
        try {
            const { data, error } = await supabase
                .from("products")
                .select("*, categories(name)")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error: any) {
            toast.error("Failed to load products: " + error.message);
        } finally {
            setLoadingProducts(false);
        }
    };

    const fetchPendingApplications = async () => {
        try {
            const { count } = await supabase.from("spas").select("id", { count: "exact", head: true }).eq("application_status", "pending");
            setPendingApplications(count || 0);
        } catch {
            setPendingApplications(0);
        }
    };

    const handleCreateNew = () => {
        setSelectedProduct(null);
        setIsModalOpen(true);
    };

    const handleEdit = (product: any) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    if (loadingProducts) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/20">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground animate-pulse">Loading Products...</p>
                </div>
            </div>
        );
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.categories?.name || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen flex flex-col bg-muted/20">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-border">

                    {/* Header Area */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold font-display flex items-center gap-2">
                                <LayoutGrid className="h-6 w-6 text-primary" />
                                Product Manager
                            </h1>
                            <p className="text-muted-foreground text-sm mt-1">
                                Create, edit, and manage all products on your store.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <Input
                                type="search"
                                placeholder="Search products..."
                                className="w-full sm:w-[250px]"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Button onClick={handleCreateNew} className="gradient-primary text-white whitespace-nowrap">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Product
                            </Button>
                            <Link to="/admin/partners">
                                <Button variant="outline" className="whitespace-nowrap">
                                    <Bell className="h-4 w-4 mr-2" />
                                    Partner Applications ({pendingApplications})
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => {
                            const hasImage = product.image_url && !product.image_url.includes('placeholder');

                            return (
                                <div key={product.id} className={`border ${product.is_active ? 'border-border' : 'border-dashed border-muted-foreground/30 opacity-75'} rounded-xl flex flex-col overflow-hidden bg-white shadow-sm hover:shadow-md transition-all group`}>

                                    {/* Image Preview Block */}
                                    <div className="aspect-square bg-secondary relative flex items-center justify-center border-b border-border/50">
                                        {hasImage ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                loading="lazy"
                                                decoding="async"
                                                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 bg-secondary/20 ${!product.is_active && 'grayscale'}`}
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center text-muted-foreground">
                                                <ImageIcon className="h-10 w-10 mb-2 opacity-30" />
                                                <span className="text-sm font-medium opacity-50">No Image</span>
                                            </div>
                                        )}

                                        {/* Badges layer */}
                                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                                            {!product.is_active && (
                                                <span className="bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                                                    HIDDEN
                                                </span>
                                            )}
                                            {product.badge && (
                                                <span className="bg-accent text-accent-foreground text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                                                    {product.badge}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Info Block */}
                                    <div className="p-4 flex flex-col flex-1">
                                        <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1 line-clamp-1">
                                            {product.categories?.name || 'Uncategorized'}
                                        </div>
                                        <h3 className="font-semibold text-base leading-tight mb-2 line-clamp-2" title={product.name}>
                                            {product.name}
                                        </h3>

                                        <div className="mt-auto pt-3 flex items-center justify-between border-t border-border/50">
                                            <div className="font-bold text-lg">
                                                KSh {Number(product.price).toLocaleString()}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 group-hover:bg-primary group-hover:text-white transition-colors"
                                                onClick={() => handleEdit(product)}
                                            >
                                                <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                                            </Button>
                                        </div>
                                    </div>

                                </div>
                            );
                        })}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="text-center py-16 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl mt-4">
                            <ImageIcon className="h-12 w-12 text-muted-foreground/30 mb-4" />
                            <h3 className="text-lg font-medium text-foreground">No products found</h3>
                            <p className="text-muted-foreground mt-1 mb-4">You haven't added any products yet, or none match your search.</p>
                            <Button onClick={handleCreateNew} variant="outline" className="border-primary text-primary">
                                <Plus className="h-4 w-4 mr-2" /> Add Your First Product
                            </Button>
                        </div>
                    )}

                </div>
            </main>
            <Footer />

            <AdminProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={selectedProduct}
                onSaved={fetchProducts}
            />
        </div>
    );
};

export default AdminProducts;





