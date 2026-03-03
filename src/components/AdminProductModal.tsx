import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Upload, X, Loader2 } from "lucide-react";

interface AdminProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product?: any; // If null, it's "Create" mode
    onSaved: () => void;
}

export function AdminProductModal({ isOpen, onClose, product, onSaved }: AdminProductModalProps) {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    // Form State
    const [name, setName] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [description, setDescription] = useState("");
    const [benefits, setBenefits] = useState("");
    const [ingredients, setIngredients] = useState("");
    const [price, setPrice] = useState("");
    const [comparePrice, setComparePrice] = useState("");
    const [badge, setBadge] = useState("none");
    const [imageUrl, setImageUrl] = useState("");
    const [isActive, setIsActive] = useState(true);

    // Image Upload State
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const isEditMode = !!product;

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (isOpen) {
            if (product) {
                // Populate form for editing
                setName(product.name || "");
                setCategoryId(product.category_id || "");
                setDescription(product.description || "");
                setBenefits(product.benefits || "");
                setIngredients(product.ingredients || "");
                setPrice(product.price ? product.price.toString() : "");
                setComparePrice(product.compare_price ? product.compare_price.toString() : "");
                setBadge(product.badge || "none");
                setImageUrl(product.image_url || "");
                setImagePreview(product.image_url || null);
                setIsActive(product.is_active ?? true);
            } else {
                // Clear form for creating
                resetForm();
            }
        }
    }, [isOpen, product]);

    const resetForm = () => {
        setName("");
        setCategoryId(categories.length > 0 ? categories[0].id : "");
        setDescription("");
        setBenefits("");
        setIngredients("");
        setPrice("");
        setComparePrice("");
        setBadge("none");
        setImageUrl("");
        setImagePreview(null);
        setImageFile(null);
        setIsActive(true);
    };

    const fetchCategories = async () => {
        const { data } = await supabase.from("categories").select("id, name").order("name");
        setCategories(data || []);
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const url = URL.createObjectURL(file);
            setImagePreview(url);
        }
    };

    const uploadImageToStorage = async (file: File): Promise<string> => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `images/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(filePath);

        return publicUrl;
    };

    const handleSave = async () => {
        if (!name || !price || !categoryId) {
            toast.error("Name, Category, and Price are required.");
            return;
        }

        setLoading(true);
        try {
            let finalImageUrl = imageUrl;

            // 1. Upload new image if selected
            if (imageFile) {
                setUploadingImage(true);
                finalImageUrl = await uploadImageToStorage(imageFile);
                setUploadingImage(false);
            }

            // 2. Prepare payload
            const payload = {
                name,
                category_id: categoryId,
                description,
                price: Number(price),
                stock_quantity: 100, // Default for now
                image_url: finalImageUrl,
                is_active: isActive,
                benefits,
                ingredients,
                updated_at: new Date().toISOString()
            };

            // 3. Save to database
            if (isEditMode) {
                const { error } = await supabase
                    .from("products")
                    .update(payload)
                    .eq("id", product.id);
                if (error) throw error;
                toast.success("Product updated successfully!");
            } else {
                const { error } = await supabase
                    .from("products")
                    .insert([payload]);
                if (error) throw error;
                toast.success("Product created successfully!");
            }

            onSaved();
            onClose();
        } catch (error: any) {
            console.error("Save error:", error);
            toast.error("Failed to save product: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-display">{isEditMode ? "Edit Product" : "Create New Product"}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? "Update the details and pricing for this product." : "Fill in the details to add a new product to the catalog."}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">

                    {/* Top Row: Image & Key Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Image Uploader */}
                        <div className="col-span-1">
                            <Label className="mb-2 block">Product Image</Label>
                            <div className="aspect-square bg-secondary rounded-lg border-2 border-dashed border-border/60 relative flex flex-col items-center justify-center overflow-hidden hover:bg-secondary/80 transition-colors group cursor-pointer">
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white font-medium text-sm flex items-center gap-2">
                                                <Upload className="h-4 w-4" /> Change
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-4">
                                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground block">Click to upload image</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleImageSelect}
                                />
                            </div>
                        </div>

                        {/* Key Info */}
                        <div className="col-span-2 space-y-4">
                            <div>
                                <Label htmlFor="name">Product Name *</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. ZaminoCal Plus" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="price">Price (KSh) *</Label>
                                    <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
                                </div>
                                <div>
                                    <Label htmlFor="comparePrice">Compare-At Price (Optional)</Label>
                                    <Input id="comparePrice" type="number" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} placeholder="Higher crossed-out price" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="category">Category *</Label>
                                    <Select value={categoryId} onValueChange={setCategoryId}>
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="badge">Display Badge</Label>
                                    <Select value={badge} onValueChange={setBadge}>
                                        <SelectTrigger id="badge">
                                            <SelectValue placeholder="No Badge" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No Badge</SelectItem>
                                            <SelectItem value="BEST SELLER">BEST SELLER</SelectItem>
                                            <SelectItem value="HOT">HOT</SelectItem>
                                            <SelectItem value="TRENDING">TRENDING</SelectItem>
                                            <SelectItem value="NEW">NEW</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-border" />

                    {/* Marketing Content */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="description">Short Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="A brief overview of the product..."
                                className="resize-y"
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label htmlFor="benefits">Key Benefits (One per line)</Label>
                            <Textarea
                                id="benefits"
                                value={benefits}
                                onChange={(e) => setBenefits(e.target.value)}
                                placeholder="Supports joint health\nEnhances mobility\nFast absorption"
                                className="resize-y"
                                rows={4}
                            />
                            <p className="text-xs text-muted-foreground mt-1">Press Enter to separate each benefit point. These will appear as checkmarks on the product page.</p>
                        </div>

                        <div>
                            <Label htmlFor="ingredients">Ingredients (One per line)</Label>
                            <Textarea
                                id="ingredients"
                                value={ingredients}
                                onChange={(e) => setIngredients(e.target.value)}
                                placeholder="Calcium Carbonate\nVitamin D3\nZinc"
                                className="resize-y"
                                rows={3}
                            />
                        </div>
                    </div>

                    <hr className="border-border" />

                    {/* Status */}
                    <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border border-border">
                        <div>
                            <Label className="text-base">Product Visibility</Label>
                            <p className="text-sm text-muted-foreground">If disabled, this product will be hidden from the public store.</p>
                        </div>
                        <Switch checked={isActive} onCheckedChange={setIsActive} />
                    </div>

                </div>

                <DialogFooter className="mt-4 sm:justify-between gap-4">
                    <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading} className="min-w-[120px]">
                        {loading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                        ) : (
                            isEditMode ? "Save Changes" : "Create Product"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
