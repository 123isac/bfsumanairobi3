import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Package, MapPin, Phone, Mail, CreditCard, Truck, Copy, ArrowRight, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    image_url: string | null;
  };
}

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string | null;
  payment_method: string;
  payment_status: string;
  status: string;
  total_amount: number;
  order_items: OrderItem[];
}

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        navigate('/');
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            price,
            product:products (
              name,
              image_url
            )
          )
        `)
        .eq('id', orderId)
        .single();

      if (error || !data) {
        toast.error('Order not found');
        navigate('/');
        return;
      }

      // Transform the data to match our interface
      const transformedOrder: Order = {
        ...data,
        order_items: data.order_items.map((item: any) => ({
          ...item,
          product: item.product
        }))
      };

      setOrder(transformedOrder);
      setLoading(false);
    };

    fetchOrder();
  }, [orderId, navigate]);

  const copyOrderId = () => {
    if (order) {
      navigator.clipboard.writeText(order.id);
      toast.success('Order ID copied to clipboard');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstimatedDelivery = () => {
    const orderDate = new Date(order?.created_at || new Date());
    const minDays = 2;
    const maxDays = 5;
    const minDate = new Date(orderDate);
    minDate.setDate(minDate.getDate() + minDays);
    const maxDate = new Date(orderDate);
    maxDate.setDate(maxDate.getDate() + maxDays);
    
    return `${minDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${maxDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />

      {/* Success Hero */}
      <section className="bg-gradient-to-br from-primary via-primary to-accent py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-background/20 backdrop-blur-sm rounded-full mb-6 animate-bounce-gentle">
            <CheckCircle className="w-10 h-10 md:w-12 md:h-12 text-primary-foreground" />
          </div>
          <h1 className="font-display font-bold text-3xl md:text-5xl text-primary-foreground mb-3">
            Order Confirmed!
          </h1>
          <p className="text-primary-foreground/80 text-lg md:text-xl max-w-xl mx-auto">
            Thank you for your purchase. We're preparing your order and will notify you when it ships.
          </p>
        </div>
      </section>

      <section className="py-8 md:py-12 flex-1">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Order ID & Status Card */}
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-sm md:text-base bg-muted px-3 py-1.5 rounded-lg">
                      {order.id.slice(0, 8).toUpperCase()}
                    </code>
                    <Button variant="ghost" size="icon" onClick={copyOrderId} className="h-8 w-8">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-sm text-muted-foreground mb-1">Order Date</p>
                  <p className="font-medium text-foreground">{formatDate(order.created_at)}</p>
                </div>
              </div>
              
              {/* Order Progress */}
              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-foreground">Order Progress</span>
                  <span className="text-sm text-muted-foreground">Est. Delivery: {getEstimatedDelivery()}</span>
                </div>
                <div className="relative">
                  <div className="flex justify-between items-center">
                    {['Confirmed', 'Processing', 'Shipped', 'Delivered'].map((step, index) => {
                      const isCompleted = index === 0 || (order.status === 'processing' && index <= 1) || (order.status === 'shipped' && index <= 2) || (order.status === 'delivered' && index <= 3);
                      const isCurrent = (order.status === 'pending' && index === 0) || (order.status === 'processing' && index === 1) || (order.status === 'shipped' && index === 2) || (order.status === 'delivered' && index === 3);
                      
                      return (
                        <div key={step} className="flex flex-col items-center z-10">
                          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
                            isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}>
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                            ) : (
                              <span className="text-xs md:text-sm">{index + 1}</span>
                            )}
                          </div>
                          <span className={`text-xs md:text-sm mt-2 ${isCompleted ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="absolute top-4 md:top-5 left-0 right-0 h-0.5 bg-muted -z-0">
                    <div className={`h-full bg-primary transition-all ${
                      order.status === 'pending' ? 'w-0' : 
                      order.status === 'processing' ? 'w-1/3' : 
                      order.status === 'shipped' ? 'w-2/3' : 'w-full'
                    }`} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Order Items */}
              <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="font-display font-bold text-xl text-foreground">Order Items</h2>
                </div>
                
                <div className="space-y-4">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-3 bg-muted/50 rounded-xl">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {item.product?.image_url ? (
                          <img 
                            src={item.product.image_url} 
                            alt={item.product?.name || 'Product'} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">{item.product?.name || 'Product'}</h3>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        <p className="font-semibold text-primary mt-1">
                          KSH {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">KSH {order.total_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium text-primary">Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2">
                    <span>Total</span>
                    <span className="text-primary">KSH {order.total_amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Delivery & Payment Info */}
              <div className="space-y-6">
                {/* Delivery Info */}
                <div className="bg-card rounded-2xl p-6 shadow-soft border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="font-display font-bold text-lg text-foreground">Delivery Details</h2>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">{order.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{order.shipping_address}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.shipping_city}{order.shipping_postal_code ? `, ${order.shipping_postal_code}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-card rounded-2xl p-6 shadow-soft border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-secondary" />
                    </div>
                    <h2 className="font-display font-bold text-lg text-foreground">Payment Info</h2>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Method</span>
                      <span className="font-medium text-foreground uppercase">{order.payment_method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${
                        order.payment_status === 'paid' 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-warning/10 text-warning'
                      }`}>
                        {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                    {order.payment_status !== 'paid' && (
                      <div className="mt-4 p-4 bg-warning/5 border border-warning/20 rounded-xl">
                        <p className="text-sm text-foreground font-medium mb-1">Payment Instructions</p>
                        <p className="text-xs text-muted-foreground">
                          {order.payment_method === 'mpesa' 
                            ? 'You will receive an M-PESA payment prompt on your phone shortly. Alternatively, pay via Lipa na M-PESA: Till Number 123456'
                            : 'Our team will contact you for card payment processing.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/my-orders">
                <Button variant="outline" size="lg" className="rounded-full w-full sm:w-auto">
                  View All Orders
                </Button>
              </Link>
              <Link to="/shop">
                <Button size="lg" className="gradient-primary rounded-full w-full sm:w-auto">
                  Continue Shopping
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;
