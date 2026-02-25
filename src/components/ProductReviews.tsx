import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Star, User } from "lucide-react";

interface ProductReviewsProps {
    productId: string;
}

interface Review {
    id: string;
    user_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    profiles?: { full_name: string | null };
}

const StarRating = ({
    value,
    onChange,
    readonly = false,
}: {
    value: number;
    onChange?: (v: number) => void;
    readonly?: boolean;
}) => {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-5 w-5 transition-colors ${star <= (readonly ? value : hovered || value)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        } ${!readonly ? "cursor-pointer" : ""}`}
                    onMouseEnter={() => !readonly && setHovered(star)}
                    onMouseLeave={() => !readonly && setHovered(0)}
                    onClick={() => !readonly && onChange?.(star)}
                />
            ))}
        </div>
    );
};

const ProductReviews = ({ productId }: ProductReviewsProps) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    const { data: reviews = [], isLoading } = useQuery<Review[]>({
        queryKey: ["reviews", productId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("product_reviews")
                .select("*, profiles(full_name)")
                .eq("product_id", productId)
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data as Review[];
        },
    });

    const hasReviewed = user ? reviews.some((r) => r.user_id === user.id) : false;

    const submitMutation = useMutation({
        mutationFn: async () => {
            if (!user) throw new Error("Please sign in to leave a review");
            const { error } = await supabase.from("product_reviews").insert({
                product_id: productId,
                user_id: user.id,
                rating,
                comment: comment.trim() || null,
            });
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success("Review submitted!");
            setComment("");
            setRating(5);
            queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to submit review");
        },
    });

    const avgRating =
        reviews.length > 0
            ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
            : null;

    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="flex items-center gap-4">
                <h2 className="font-display font-bold text-2xl text-foreground">
                    Reviews
                </h2>
                {avgRating !== null && (
                    <div className="flex items-center gap-2">
                        <StarRating value={Math.round(avgRating)} readonly />
                        <span className="text-muted-foreground text-sm">
                            {avgRating} / 5 ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
                        </span>
                    </div>
                )}
            </div>

            {/* Submit form */}
            {user && !hasReviewed && (
                <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                    <h3 className="font-semibold text-lg">Leave a Review</h3>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                            Your Rating
                        </label>
                        <StarRating value={rating} onChange={setRating} />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                            Comment (optional)
                        </label>
                        <Textarea
                            placeholder="Share your experience with this product..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="rounded-xl resize-none"
                            rows={3}
                        />
                    </div>
                    <Button
                        onClick={() => submitMutation.mutate()}
                        disabled={submitMutation.isPending}
                        className="gradient-primary rounded-full px-8"
                    >
                        {submitMutation.isPending ? "Submitting..." : "Submit Review"}
                    </Button>
                </div>
            )}

            {!user && (
                <p className="text-sm text-muted-foreground bg-secondary/30 rounded-xl p-4">
                    <a href="/auth" className="text-primary hover:underline font-medium">Sign in</a> to leave a review.
                </p>
            )}

            {hasReviewed && (
                <p className="text-sm text-muted-foreground bg-secondary/30 rounded-xl p-4">
                    You've already reviewed this product. Thank you!
                </p>
            )}

            {/* Reviews list */}
            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
                    ))}
                </div>
            ) : reviews.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4">
                    No reviews yet. Be the first to review this product!
                </p>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-card border border-border rounded-2xl p-5 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-4 w-4 text-primary" />
                                    </div>
                                    <span className="font-medium text-sm">
                                        {review.profiles?.full_name || "Customer"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StarRating value={review.rating} readonly />
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(review.created_at).toLocaleDateString("en-KE", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </span>
                                </div>
                            </div>
                            {review.comment && (
                                <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductReviews;
