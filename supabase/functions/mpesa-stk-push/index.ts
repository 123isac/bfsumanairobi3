// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Declare Deno locally to avoid IDE TS errors in non-Deno workspaces
declare const Deno: any;

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

serve(async (req: Request) => {
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

    // ── SECURITY: Read the authoritative total_amount directly from the order row ──
    // The total_amount is computed server-side at order creation (includes shipping & discounts).
    // This single query replaces two parallel queries, saving one full DB round trip.
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: orderRow, error: orderError } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('id', orderId)
      .single();

    if (orderError || !orderRow) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const secureAmount = Math.round(Number(orderRow.total_amount));
    console.log('Order total_amount used for STK push:', secureAmount);

    if (secureAmount < 1) {
      return new Response(
        JSON.stringify({ error: 'Invalid order amount' }),
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
