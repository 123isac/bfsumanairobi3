import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Package, Clock, Truck, CheckCircle, MapPin, Phone, Calendar, Hash, ShoppingBag, ArrowRight } from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product?: {
    name: string;
    image_url: string | null;
  };
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  total_amount: number;
  status: string;
  payment_method: string;
  payment_status: string;
  referral_code: string | null;
  created_at: string;
  order_items?: OrderItem[];
}

const ORDER_STATUSES = [
  { value: "pending", label: "Pending", icon: Clock, color: "bg-yellow-100 text-yellow-800", description: "Your order is being reviewed" },
  { value: "processing", label: "Processing", icon: Package, color: "bg-blue-100 text-blue-800", description: "Your order is being prepared" },
  { value: "shipped", label: "Shipped", icon: Truck, color: "bg-purple-100 text-purple-800", description: "Your order is on the way" },
  { value: "delivered", label: "Delivered", icon: CheckCircle, color: "bg-green-100 text-green-800", description: "Your order has been delivered" },
  { value: "cancelled", label: "Cancelled", icon: Clock, color: "bg-red-100 text-red-800", description: "Your order was cancelled" },
];

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
    loadOrders(user.id);
  };

  const loadOrders = async (userId: string) => {
    try {
      const { data: ordersData, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get order items for each order
      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: itemsData } = await supabase
            .from("order_items")
            .select("*, products(name, image_url)")
            .eq("order_id", order.id);

          const orderItems = (itemsData || []).map(item => ({
            ...item,
            product: item.products
          }));

          return { ...order, order_items: orderItems };
        })
      );

      setOrders(ordersWithItems);
    } catch (error: any) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    return ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0];
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-KE", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground">My Orders</h1>
            <p className="text-muted-foreground mt-2">Track and manage your orders</p>
          </div>

          {orders.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
                <Button onClick={() => navigate("/shop")}>
                  Start Shopping
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Order Summary */}
                        <div className="flex-1 p-4 md:p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(order.created_at)}
                              </div>
                              <div className="flex items-center gap-2">
                                <Hash className="h-4 w-4 text-muted-foreground" />
                                <span className="font-mono text-sm">{order.id.slice(0, 8)}...</span>
                              </div>
                            </div>
                            <Badge className={`${statusConfig.color} border-0 flex items-center gap-1 w-fit`}>
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.label}
                            </Badge>
                          </div>

                          {/* Order Items Preview */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex -space-x-2">
                              {order.order_items?.slice(0, 3).map((item, idx) => (
                                <div key={item.id} className="h-12 w-12 rounded-lg border-2 border-background overflow-hidden bg-secondary">
                                  {item.product?.image_url ? (
                                    <img
                                      src={item.product.image_url}
                                      alt={item.product.name || "Product"}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center">
                                      <Package className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                              ))}
                              {(order.order_items?.length || 0) > 3 && (
                                <div className="h-12 w-12 rounded-lg border-2 border-background bg-secondary flex items-center justify-center text-sm font-medium">
                                  +{(order.order_items?.length || 0) - 3}
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {order.order_items?.length} item{(order.order_items?.length || 0) > 1 ? "s" : ""}
                            </div>
                          </div>

                          {/* Total */}
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Total</span>
                            <span className="font-bold text-lg">KSH {Number(order.total_amount).toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Action */}
                        <div className="flex md:flex-col items-center justify-center gap-2 p-4 md:p-6 border-t md:border-t-0 md:border-l border-border bg-secondary/20">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Status Timeline */}
              <div className="bg-secondary/30 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  {(() => {
                    const config = getStatusConfig(selectedOrder.status);
                    const Icon = config.icon;
                    return (
                      <>
                        <div className={`p-3 rounded-full ${config.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-semibold">{config.label}</p>
                          <p className="text-sm text-muted-foreground">{config.description}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-3">Items Ordered</h3>
                <div className="space-y-3">
                  {selectedOrder.order_items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 bg-secondary/20 rounded-lg p-3">
                      {item.product?.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name || "Product"}
                          className="h-16 w-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.product?.name || "Product"}</p>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">KSH {Number(item.price).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-secondary/30 rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Delivery Address
                </h3>
                <p>{selectedOrder.shipping_address}</p>
                <p>{selectedOrder.shipping_city}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {selectedOrder.customer_phone}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span>{selectedOrder.payment_method}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Payment Status</span>
                  <Badge variant={selectedOrder.payment_status === "paid" ? "default" : "secondary"}>
                    {selectedOrder.payment_status}
                  </Badge>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                  <span>Total Amount</span>
                  <span>KSH {Number(selectedOrder.total_amount).toLocaleString()}</span>
                </div>
              </div>

              {selectedOrder.referral_code && (
                <div className="text-sm text-muted-foreground">
                  Referred by: <Badge variant="outline">{selectedOrder.referral_code}</Badge>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default MyOrders;