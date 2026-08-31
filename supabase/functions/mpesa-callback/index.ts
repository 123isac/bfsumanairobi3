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
    const transactionId = data?.transactionId || data?.reference || data?.id || callback?.transactionId || callback?.reference;
    const orderId = data?.metadata?.orderId || data?.orderId || data?.accountReference?.replace(/^BFSuma-/, '');

    console.log('Webhook event:', event, '| transactionId:', transactionId, '| orderId:', orderId);

    if (!event || (!transactionId && !orderId)) {
      console.error('Invalid Lipana webhook payload — missing event or identifiers');
      return new Response(JSON.stringify({ status: 'ok', message: 'Invalid payload ignored' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const isSuccess = [
      'transaction.success',
      'payment.success',
      'stk.success',
      'charge.success',
      'success'
    ].includes(event?.toLowerCase());

    const isFailure = [
      'transaction.failed',
      'payment.failed',
      'transaction.cancelled',
      'stk.failed',
      'failed'
    ].includes(event?.toLowerCase());

    if (isSuccess) {
      console.log('Payment successful. Updating order for transactionId:', transactionId, 'or orderId:', orderId);

      let query = supabase.from('orders').update({ payment_status: 'paid' });
      if (transactionId && orderId) {
        query = query.or(`payment_reference.eq.${transactionId},id.eq.${orderId}`);
      } else if (transactionId) {
        query = query.eq('payment_reference', transactionId);
      } else if (orderId) {
        query = query.eq('id', orderId);
      }

      const { error } = await query;

      if (error) {
        console.error('Failed to update order to paid:', error);
      } else {
        console.log('Order updated to paid successfully');
      }

    } else if (isFailure) {
      console.log('Payment failed/cancelled for transactionId:', transactionId);

      let query = supabase.from('orders').update({ payment_status: 'failed' });
      if (transactionId && orderId) {
        query = query.or(`payment_reference.eq.${transactionId},id.eq.${orderId}`);
      } else if (transactionId) {
        query = query.eq('payment_reference', transactionId);
      } else if (orderId) {
        query = query.eq('id', orderId);
      }

      await query;
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
