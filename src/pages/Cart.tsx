import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Trash2, Plus, Minus, ShoppingBag, LogIn, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Cart = () => {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Login dialog state
  const [showLogin, setShowLogin] = useState(false);
  const [loginMode, setLoginMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const handleCheckout = () => {
    if (!user) {
      setShowLogin(true);
    } else {
      navigate("/checkout");
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (loginMode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in! Proceeding to checkout…");
        setShowLogin(false);
        navigate("/checkout");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Account created! Check your email to confirm, then proceed to checkout.");
        setShowLogin(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <section className="flex-1 py-20 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground/50" />
              <h1 className="font-display font-bold text-4xl text-foreground">Your Cart is Empty</h1>
              <p className="text-lg text-muted-foreground">Start adding products to your cart</p>
              <Link to="/shop">
                <Button size="lg" className="gradient-primary rounded-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="bg-gradient-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="font-display font-bold text-4xl md:text-5xl">Shopping Cart</h1>
        </div>
      </section>

      <section className="py-12 bg-background flex-1">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-card rounded-2xl p-4 md:p-6 shadow-soft border border-border">
                  <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full sm:w-24 h-48 sm:h-24 object-cover rounded-xl"
                    />
                    <div className="flex-1 space-y-2">
                      <h3 className="font-display font-semibold text-lg md:text-xl text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                      <p className="font-semibold text-base md:text-lg text-primary">KSH {item.price.toLocaleString()}</p>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-between gap-4 sm:gap-0">
                      <div className="flex items-center gap-2 border border-border rounded-full px-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-8 w-8"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl p-8 shadow-luxury border border-border sticky top-24">
                <h2 className="font-display font-bold text-2xl text-foreground mb-6">Order Summary</h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-semibold">KSH {totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="font-semibold">Free</span>
                  </div>
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between text-foreground text-xl font-bold">
                      <span>Total</span>
                      <span className="text-primary">KSH {totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {!user && (
                  <p className="text-sm text-muted-foreground mb-3 text-center">
                    Sign in to proceed to checkout
                  </p>
                )}

                <Button
                  size="lg"
                  className="gradient-primary w-full rounded-full h-12 text-lg"
                  onClick={handleCheckout}
                >
                  {user ? "Proceed to Checkout" : "Sign In to Checkout"}
                </Button>
                <Link to="/shop">
                  <Button variant="outline" size="lg" className="w-full rounded-full h-12 mt-3">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Login / Sign-up dialog */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {loginMode === "signin" ? "Sign In to Continue" : "Create an Account"}
            </DialogTitle>
            <DialogDescription>
              {loginMode === "signin"
                ? "Enter your credentials to proceed with checkout."
                : "Create a free account to place your order."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAuth} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label htmlFor="cart-email">Email</Label>
              <Input
                id="cart-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cart-password">Password</Label>
              <Input
                id="cart-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={loginMode === "signin" ? "current-password" : "new-password"}
              />
            </div>

            <Button
              type="submit"
              className="w-full gradient-primary rounded-full h-11"
              disabled={authLoading}
            >
              {loginMode === "signin"
                ? <><LogIn className="h-4 w-4 mr-2" />{authLoading ? "Signing in…" : "Sign In & Checkout"}</>
                : <><UserPlus className="h-4 w-4 mr-2" />{authLoading ? "Creating account…" : "Create Account"}</>
              }
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground mt-2">
            {loginMode === "signin" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  className="text-primary font-medium hover:underline"
                  onClick={() => setLoginMode("signup")}
                  type="button"
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  className="text-primary font-medium hover:underline"
                  onClick={() => setLoginMode("signin")}
                  type="button"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cart;
