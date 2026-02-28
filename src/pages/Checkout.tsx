import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import KenyaAddressForm, { KenyaAddress } from "@/components/KenyaAddressForm";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { CreditCard, Smartphone, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getReferralCode } from "@/utils/referral";
import { checkoutSchema } from "@/utils/validation";

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mpesaStatus, setMpesaStatus] = useState<'idle' | 'pending' | 'polling' | 'success' | 'error'>('idle');
  const [pollingOrderId, setPollingOrderId] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingCountRef = useRef(0);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [kenyaAddress, setKenyaAddress] = useState<KenyaAddress>({
    county: "",
    area: "",
    street: "",
    building: "",
    landmark: "",
  });

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      const loadProfile = async () => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        if (profile) {
          setFullName(profile.full_name || "");
          setPhone(profile.phone || "");
        }
      };
      loadProfile();
    }
  }, [user]);

  // Poll for payment confirmation after STK push
  useEffect(() => {
    if (!pollingOrderId) return;

    pollingCountRef.current = 0;
    pollingRef.current = setInterval(async () => {
      pollingCountRef.current += 1;

      const { data: order } = await supabase
        .from("orders")
        .select("payment_status")
        .eq("id", pollingOrderId)
        .single();

      if (order?.payment_status === 'paid') {
        clearInterval(pollingRef.current!);
        setMpesaStatus('success');
        clearCart();
        toast.success('Payment confirmed! Redirecting...');
        setTimeout(() => navigate(`/order-confirmation/${pollingOrderId}`), 1500);
      } else if (order?.payment_status === 'failed') {
        clearInterval(pollingRef.current!);
        setMpesaStatus('error');
        toast.error('Payment failed or cancelled. You can retry from My Orders.');
        setTimeout(() => navigate(`/order-confirmation/${pollingOrderId}`), 2000);
      } else if (pollingCountRef.current >= 24) {
        // 24 × 5s = 2 minutes timeout
        clearInterval(pollingRef.current!);
        setMpesaStatus('error');
        toast.info('Payment pending. Check My Orders to track status.');
        setTimeout(() => navigate(`/order-confirmation/${pollingOrderId}`), 2000);
      }
    }, 5000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [pollingOrderId]);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const initiateSTKPush = async (orderId: string) => {
    try {
      setMpesaStatus('pending');
      const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
        body: {
          phone,
          amount: totalPrice,
          orderId,
          accountReference: `BFSuma-${orderId.substring(0, 8)}`,
        },
      });
      if (error) throw error;
      if (data.success) {
        toast.success('M-PESA prompt sent! Enter your PIN on your phone.');
        setMpesaStatus('polling');
        setPollingOrderId(orderId);
        return true;
      } else {
        throw new Error(data.error || 'Failed to initiate payment');
      }
    } catch (error: any) {
      setMpesaStatus('error');
      toast.error(error.message || 'Failed to initiate M-PESA payment');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate Kenya address fields
      if (!kenyaAddress.county || !kenyaAddress.area || !kenyaAddress.street || !kenyaAddress.building) {
        toast.error("Please fill in all required delivery address fields (County, Area, Street, Building).");
        setIsSubmitting(false);
        return;
      }

      const validationResult = checkoutSchema.safeParse({

        fullName,
        email,
        phone,
        address: [kenyaAddress.street, kenyaAddress.area].filter(Boolean).join(", ") || ".",
        city: kenyaAddress.county || ".",
        postalCode: undefined,
      });
      if (!validationResult.success) {
        toast.error(validationResult.error.errors[0].message);
        setIsSubmitting(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      const referralCode = getReferralCode();

      const orderData = {
        user_id: user?.id || '00000000-0000-0000-0000-000000000000',
        customer_name: fullName,
        customer_email: email,
        customer_phone: phone,
        shipping_address: [kenyaAddress.street, kenyaAddress.building].filter(Boolean).join(", "),
        shipping_city: kenyaAddress.county,
        shipping_postal_code: null,
        shipping_area: kenyaAddress.area,
        shipping_building: kenyaAddress.building,
        shipping_landmark: kenyaAddress.landmark || null,
        payment_method: paymentMethod,
        total_amount: totalPrice,
        referral_code: referralCode,
      };

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      if (paymentMethod === 'mpesa') {
        const stkSuccess = await initiateSTKPush(order.id);
        if (!stkSuccess) {
          // STK push failed — navigate anyway, order is created
          clearCart();
          navigate(`/order-confirmation/${order.id}`);
        }
        // If STK push succeeded, useEffect polling takes over navigation
      } else {
        clearCart();
        toast.success('Order placed! Pay on delivery.');
        navigate(`/order-confirmation/${order.id}`);
      }
    } catch (error: any) {
      if (import.meta.env.DEV) console.error('Checkout error:', error);
      toast.error('Unable to process order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // M-PESA waiting screen
  if (mpesaStatus === 'polling' || mpesaStatus === 'success' || mpesaStatus === 'error') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center bg-background px-4">
          <div className="text-center max-w-sm space-y-6">
            {mpesaStatus === 'polling' && (
              <>
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
                <h2 className="font-display font-bold text-2xl text-foreground">Waiting for Payment</h2>
                <p className="text-muted-foreground">
                  Enter your M-PESA PIN on your phone to confirm payment of{' '}
                  <span className="font-semibold text-foreground">KSH {totalPrice.toLocaleString()}</span>.
                </p>
                <p className="text-sm text-muted-foreground">This page will update automatically once confirmed.</p>
              </>
            )}
            {mpesaStatus === 'success' && (
              <>
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="font-display font-bold text-2xl text-foreground">Payment Confirmed!</h2>
                <p className="text-muted-foreground">Redirecting to your order confirmation...</p>
              </>
            )}
            {mpesaStatus === 'error' && (
              <>
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                  <XCircle className="h-10 w-10 text-red-500" />
                </div>
                <h2 className="font-display font-bold text-2xl text-foreground">Payment Not Confirmed</h2>
                <p className="text-muted-foreground">Redirecting to your order...</p>
              </>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="bg-gradient-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="font-display font-bold text-4xl md:text-5xl">Checkout</h1>
        </div>
      </section>

      <section className="py-8 md:py-12 bg-background flex-1">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="lg:col-span-2 space-y-6 md:space-y-8">
                {/* Contact Information */}
                <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border">
                  <h2 className="font-display font-bold text-xl md:text-2xl text-foreground mb-4 md:mb-6">Contact Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Full Name</label>
                      <Input required className="mt-2 h-12 rounded-xl" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Email Address</label>
                      <Input required type="email" className="mt-2 h-12 rounded-xl" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Phone Number</label>
                      <Input required type="tel" className="mt-2 h-12 rounded-xl" placeholder="+254 700 000 000" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border">
                  <h2 className="font-display font-bold text-xl md:text-2xl text-foreground mb-4 md:mb-6">Shipping Address</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Delivery Address</label>
                      <p className="text-xs text-muted-foreground mb-3 mt-1">Fill in your full delivery details so our rider can find you easily</p>
                      <KenyaAddressForm value={kenyaAddress} onChange={setKenyaAddress} />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border">
                  <h2 className="font-display font-bold text-xl md:text-2xl text-foreground mb-4 md:mb-6">Payment Method</h2>
                  <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('mpesa')}
                      className={`p-4 md:p-6 rounded-xl border-2 transition-smooth ${paymentMethod === 'mpesa' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                    >
                      <Smartphone className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
                      <p className="font-semibold text-sm md:text-base text-foreground">M-PESA</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 md:p-6 rounded-xl border-2 transition-smooth ${paymentMethod === 'card' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                    >
                      <CreditCard className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
                      <p className="font-semibold text-sm md:text-base text-foreground">Pay on Delivery</p>
                    </button>
                  </div>
                  {paymentMethod === 'mpesa' && (
                    <p className="text-sm text-muted-foreground">
                      You'll receive an M-PESA STK push notification. Enter your PIN to confirm payment instantly.
                    </p>
                  )}
                  {paymentMethod === 'card' && (
                    <p className="text-sm text-muted-foreground">
                      Pay when your order is delivered. Cash or card accepted at the door.
                    </p>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-2xl p-6 md:p-8 shadow-luxury border border-border lg:sticky lg:top-24">
                  <h2 className="font-display font-bold text-xl md:text-2xl text-foreground mb-4 md:mb-6">Order Summary</h2>
                  <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.name} x{item.quantity}</span>
                        <span className="font-semibold text-foreground">KSH {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="border-t border-border pt-4 space-y-2">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span className="font-semibold">KSH {totalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Shipping</span>
                        <span className="font-semibold">Free</span>
                      </div>
                      <div className="flex justify-between text-foreground text-xl font-bold pt-2">
                        <span>Total</span>
                        <span className="text-primary">KSH {totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="gradient-primary w-full rounded-full h-12 text-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? (paymentMethod === 'mpesa' ? 'Initiating M-PESA...' : 'Placing Order...')
                      : (paymentMethod === 'mpesa' ? 'Pay with M-PESA' : 'Place Order')
                    }
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Checkout;
