import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const formatPhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/[\s\-()'+]/g, '');
  if (cleaned.startsWith('0')) return '254' + cleaned.substring(1);
  if (cleaned.startsWith('7') || cleaned.startsWith('1')) return '254' + cleaned;
  if (cleaned.startsWith('254')) return cleaned;
  return cleaned;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── SECURITY: Only trust orderId + phone from client, NEVER the amount ──
    const { phone, orderId } = await req.json();

    if (!phone || !orderId) {
      return new Response(
        JSON.stringify({ error: 'Phone and orderId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const secretKey = Deno.env.get('LIPANA_SECRET_KEY');
    if (!secretKey) throw new Error('LIPANA_SECRET_KEY is not configured');

    // ── SECURITY FIX: Independently compute the correct amount server-side ──
    // Never trust the frontend amount — re-calculate from the actual order_items in the DB
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch this order's line items with their true product prices
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('quantity, price')
      .eq('order_id', orderId);

    if (itemsError || !orderItems || orderItems.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Order not found or has no items' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Also fetch the shipping fee from store_settings
    const { data: shippingSetting } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'shipping_base_fee')
      .maybeSingle();

    const shippingFee = shippingSetting?.value ? Number(shippingSetting.value) : 0;

    // Server-computed authoritative total — immune to frontend tampering
    const itemsTotal = orderItems.reduce(
      (sum, item) => sum + (Number(item.price) * Number(item.quantity)),
      0
    );
    const secureAmount = Math.round(itemsTotal + shippingFee);

    console.log('Server-computed secure amount:', secureAmount, '(shipping:', shippingFee, ')');

    if (secureAmount < 1) {
      return new Response(
        JSON.stringify({ error: 'Invalid order amount computed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formattedPhone = formatPhoneNumber(phone);
    console.log('Formatted phone for Lipana:', formattedPhone);
    console.log('Lipana payload:', { phone: formattedPhone, amount: secureAmount });

    const lipanaResponse = await fetch(
      'https://api.lipana.dev/v1/transactions/push-stk',
      {
        method: 'POST',
        headers: {
          'x-api-key': secretKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: formattedPhone, amount: secureAmount }),
      }
    );

    const lipanaResult = await lipanaResponse.json();
    console.log('Lipana response status:', lipanaResponse.status);
    console.log('Lipana response body:', JSON.stringify(lipanaResult));

    if (lipanaResponse.ok && lipanaResult.success && lipanaResult.data?.transactionId) {
      // Store transaction reference for webhook matching
      await supabase
        .from('orders')
        .update({ payment_reference: lipanaResult.data.transactionId })
        .eq('id', orderId);

      return new Response(
        JSON.stringify({
          success: true,
          checkoutRequestId: lipanaResult.data.transactionId,
          message: 'M-PESA prompt sent. Enter your PIN on your phone.',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.error('Lipana STK push failed:', JSON.stringify(lipanaResult));
      return new Response(
        JSON.stringify({
          success: false,
          error: lipanaResult.message || lipanaResult.error || `Payment initiation failed (HTTP ${lipanaResponse.status})`,
          details: lipanaResult,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error in mpesa-stk-push:', error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
