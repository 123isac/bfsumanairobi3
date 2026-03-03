import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Upload, X, Check, Image as ImageIcon } from "lucide-react";

const AdminImageUpload = () => {
    const { session, profile, isAdmin } = useAuth();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (isAdmin) {
            fetchProducts();
        } else {
            setLoading(false);
        }
    }, [isAdmin]);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from("products")
                .select("id, name, image_url, categories(name)")
                .order("name");

            if (error) throw error;
            setProducts(data || []);
        } catch (error: any) {
            toast.error("Failed to load products: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (productId: string, file: File) => {
        if (!file) return;

        // Check file type
        if (!file.type.startsWith('image/')) {
            toast.error("Please select an image file");
            return;
        }

        setUploadingId(productId);
        try {
            // 1. Upload to Supabase Storage (products bucket)
            const fileExt = file.name.split('.').pop();
            const fileName = `${productId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `images/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // 2. Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(filePath);

            // 3. Update product record
            const { error: updateError } = await supabase
                .from('products')
                .update({ image_url: publicUrl })
                .eq('id', productId);

            if (updateError) throw updateError;

            toast.success("Image uploaded successfully!");
            fetchProducts(); // Refresh list

        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error("Upload failed: " + error.message);
        } finally {
            setUploadingId(null);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    // Security check: Only admins can view this page
    if (!session || !isAdmin) {
        return <Navigate to="/auth" replace />;
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.categories?.name || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen flex flex-col bg-muted/20">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-border">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold font-display flex items-center gap-2">
                                <ImageIcon className="h-6 w-6 text-primary" />
                                Product Image Manager
                            </h1>
                            <p className="text-muted-foreground text-sm mt-1">Upload and manage images for all products in the catalog.</p>
                        </div>
                        <Input
                            type="search"
                            placeholder="Search products..."
                            className="max-w-xs"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map((product) => {
                            const hasImage = product.image_url && !product.image_url.includes('placeholder');

                            return (
                                <div key={product.id} className="border border-border rounded-xl flex flex-col overflow-hidden bg-white shadow-sm hover:shadow-md hover:border-primary/30 transition-all">

                                    {/* Image Preview Block */}
                                    <div className="aspect-square bg-secondary relative group flex items-center justify-center border-b border-border/50">
                                        {hasImage ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center text-muted-foreground">
                                                <ImageIcon className="h-10 w-10 mb-2 opacity-30" />
                                                <span className="text-sm font-medium opacity-50">No Image</span>
                                            </div>
                                        )}

                                        {/* Status badge */}
                                        <div className="absolute top-3 right-3 shadow-sm rounded-full bg-white">
                                            {hasImage ? (
                                                <div className="bg-emerald-100 text-emerald-700 p-1.5 rounded-full">
                                                    <Check className="h-4 w-4" />
                                                </div>
                                            ) : (
                                                <div className="bg-rose-100 text-rose-700 p-1.5 rounded-full">
                                                    <X className="h-4 w-4" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Info Block */}
                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">
                                            {product.categories?.name}
                                        </div>
                                        <h3 className="font-semibold text-lg leading-tight mb-4" title={product.name}>
                                            {product.name}
                                        </h3>

                                        {/* Upload Action */}
                                        <div className="mt-auto relative group-upload">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleImageUpload(product.id, file);
                                                    e.target.value = '';
                                                }}
                                                disabled={uploadingId === product.id}
                                            />
                                            <Button
                                                variant={hasImage ? "outline" : "default"}
                                                className={`w-full relative z-0 ${hasImage ? '' : 'gradient-primary hover:shadow-md'}`}
                                                disabled={uploadingId === product.id}
                                            >
                                                {uploadingId === product.id ? (
                                                    "Uploading..."
                                                ) : (
                                                    <>
                                                        <Upload className="h-4 w-4 mr-2" />
                                                        {hasImage ? "Replace Image" : "Upload Image"}
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                </div>
                            );
                        })}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            No products found matching "{search}"
                        </div>
                    )}

                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AdminImageUpload;
