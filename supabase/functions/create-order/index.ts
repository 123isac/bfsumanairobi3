import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      items, 
      promoCode, 
      orderData, // contains user_id, customer_name, etc.
      phone
    } = await req.json();

    if (!items || items.length === 0) {
      throw new Error("Cart is empty");
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Re-read product prices and validate stock
    const productIds = items.map((i: any) => i.id);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, cost_price, stock_quantity')
      .in('id', productIds);

    if (productsError || !products) {
      throw new Error("Failed to fetch products: " + (productsError?.message || "Not found"));
    }

    let calculatedTotal = 0;
    let calculatedCommission = 0;
    const finalItems = [];

    for (const item of items) {
      const product = products.find(p => p.id === item.id);
      if (!product) throw new Error(`Product ${item.id} not found`);
      if (product.stock_quantity != null && product.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name || item.id} (available: ${product.stock_quantity})`);
      }

      const itemPrice = Number(product.price) || 0;
      const itemCost = Number(product.cost_price) || 0;
      calculatedTotal += itemPrice * item.quantity;
      
      const margin = (itemPrice - itemCost) * item.quantity;
      if (margin > 0) {
        calculatedCommission += margin;
      }

      finalItems.push({
        product_id: product.id,
        quantity: item.quantity,
        price: itemPrice
      });
    }

    // Fetch shipping fee
    let shippingFee = 0;
    const { data: shippingSetting } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'shipping_base_fee')
      .single();
      
    if (shippingSetting?.value) {
      shippingFee = Number(shippingSetting.value);
    }
    calculatedTotal += shippingFee;

    // Validate promo code
    if (promoCode) {
      const { data: promo, error: promoError } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.toUpperCase().trim())
        .eq('is_active', true)
        .maybeSingle();
        
      if (promo && !promoError) {
        if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
          // expired
        } else {
          let discount = 0;
          if (promo.discount_type === 'percentage') {
            discount = ((calculatedTotal - shippingFee) * promo.discount_amount) / 100;
          } else {
            discount = promo.discount_amount;
          }
          calculatedTotal = Math.max(0, calculatedTotal - discount);
        }
      }
    }

    // Insert order with server-calculated totals, fees, and statuses
    orderData.total_amount = calculatedTotal;
    orderData.delivery_fee = shippingFee;
    orderData.status = orderData.status || 'payment_pending';
    orderData.payment_status = orderData.payment_status || 'pending';
    if (orderData.referral_code && calculatedCommission > 0) {
      orderData.commission_amount = calculatedCommission;
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const orderItemsToInsert = finalItems.map(item => ({
      order_id: order.id,
      ...item
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItemsToInsert);
    if (itemsError) throw itemsError;

    // Optionally start payment if paymentMethod is M-Pesa. But wait, we can just return the order and let client invoke mpesa-stk-push, OR invoke it here.
    // Given the prompt: "... calculates all totals, and starts payment", let's call STK push API directly from here or invoke the function.
    let paymentResponse = null;
    if (orderData.payment_method === 'mpesa' && phone) {
      // Invoke mpesa-stk-push
      const { data: stkData, error: stkError } = await supabase.functions.invoke('mpesa-stk-push', {
        body: {
          phone,
          amount: calculatedTotal,
          orderId: order.id,
          accountReference: `BFSuma-${order.id.substring(0, 8)}`,
        },
      });
      if (stkError) {
        console.error("STK push error:", stkError);
      } else {
        paymentResponse = stkData;
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      order, 
      paymentResponse 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
