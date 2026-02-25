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
    console.log('M-PESA Callback received:', JSON.stringify(callback, null, 2));

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const stkCallback = callback.Body?.stkCallback;

    if (!stkCallback) {
      console.error('Invalid callback format');
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { CheckoutRequestID, ResultCode, ResultDesc } = stkCallback;
    console.log('Callback details:', { CheckoutRequestID, ResultCode, ResultDesc });

    if (ResultCode === 0) {
      // Payment successful — extract metadata
      const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];

      const getMetadataValue = (name: string) => {
        const item = callbackMetadata.find((i: any) => i.Name === name);
        return item?.Value;
      };

      const mpesaReceiptNumber = getMetadataValue('MpesaReceiptNumber');
      const transactionDate = getMetadataValue('TransactionDate');
      console.log('Payment successful:', { mpesaReceiptNumber, transactionDate });

      // Match order by CheckoutRequestID stored in payment_reference during STK push
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          payment_reference: mpesaReceiptNumber, // replace temp CheckoutRequestID with real receipt
        })
        .eq('payment_reference', CheckoutRequestID);

      if (error) {
        console.error('Failed to update order:', error);
      } else {
        console.log('Order payment_status updated to paid for CheckoutRequestID:', CheckoutRequestID);
      }
    } else {
      // Payment failed or cancelled
      console.log('Payment failed/cancelled:', ResultDesc);

      await supabase
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('payment_reference', CheckoutRequestID);
    }

    // M-PESA always expects this exact response
    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in mpesa-callback:', error);
    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
