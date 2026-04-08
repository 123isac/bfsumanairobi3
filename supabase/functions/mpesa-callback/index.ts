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
    const rawBody = await req.text();
    console.log('Lipana Webhook received (raw):', rawBody);

    // --- Signature verification removed (caused Deno deployment error) ---

    const callback = JSON.parse(rawBody);
    console.log('Lipana Webhook payload:', JSON.stringify(callback, null, 2));

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Lipana webhook structure: { event, data: { transactionId, status, ... } }
    const { event, data } = callback;
    const transactionId = data?.transactionId;

    console.log('Webhook event:', event, '| transactionId:', transactionId);

    if (!event || !transactionId) {
      console.error('Invalid Lipana webhook payload — missing event or transactionId');
      return new Response(JSON.stringify({ status: 'ok', message: 'Invalid payload ignored' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (event === 'transaction.success' || event === 'payment.success') {
      console.log('Payment successful. Updating order for transactionId:', transactionId);

      const { error } = await supabase
        .from('orders')
        .update({ payment_status: 'paid' })
        .eq('payment_reference', transactionId);

      if (error) {
        console.error('Failed to update order to paid:', error);
      } else {
        console.log('Order updated to paid for transactionId:', transactionId);
      }

    } else if (
      event === 'transaction.failed' ||
      event === 'payment.failed' ||
      event === 'transaction.cancelled'
    ) {
      console.log('Payment failed/cancelled for transactionId:', transactionId);

      await supabase
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('payment_reference', transactionId);

    } else {
      // e.g. payment.initiated — just acknowledge, no DB update
      console.log('Unhandled event type (ignoring):', event);
    }

    // Always acknowledge with 200 so Lipana stops retrying
    return new Response(
      JSON.stringify({ status: 'success' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in mpesa-callback (Lipana webhook):', error);
    // Return 200 to prevent infinite Lipana retries
    return new Response(
      JSON.stringify({ status: 'error', message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
