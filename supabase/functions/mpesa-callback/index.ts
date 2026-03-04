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
    const callback = await req.json();
    console.log('IntaSend Webhook received:', JSON.stringify(callback, null, 2));

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // IntaSend webhook payload contains `invoice_id`, `state` (e.g. COMPLETED, FAILED), 
    // and `api_ref` which we set to our orderId.
    const { invoice_id, state, api_ref } = callback;
    console.log('Callback details:', { invoice_id, state, api_ref });

    if (!invoice_id || !state) {
      console.error('Invalid IntaSend payload');
      return new Response(JSON.stringify({ status: 200, message: 'Invalid payload ignored' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // We used api_ref as orderId when creating the STK push, but we also saved 
    // the invoice_id into `orders.payment_reference` for safety.
    // Let's match by `payment_reference` just to be certain.

    if (state === 'COMPLETED') {
      console.log('Payment successful. Updating order with invoice:', invoice_id);

      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
        })
        .eq('payment_reference', invoice_id);

      if (error) {
        console.error('Failed to update order:', error);
      } else {
        console.log('Order payment_status updated to paid for invoice_id:', invoice_id);
      }
    } else if (state === 'FAILED' || state === 'EXPIRED') {
      console.log('Payment failed or expired:', invoice_id);

      await supabase
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('payment_reference', invoice_id);
    } else {
      console.log('Payment pending/processing, ignoring state:', state);
    }

    // Acknowledge receipt to IntaSend (status 200 tells them to stop retrying)
    return new Response(
      JSON.stringify({ status: 'success' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in intasend-webhook:', error);
    // Return 200 to prevent Webhook retries if it's our DB's fault or payload structure
    return new Response(
      JSON.stringify({ status: 'error', message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
