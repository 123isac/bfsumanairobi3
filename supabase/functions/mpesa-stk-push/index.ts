import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface STKPushRequest {
  phone: string;
  amount: number;
  orderId: string;
  accountReference?: string;
}

const formatPhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/[\s\-()']/g, '').replace(/'/g, '');

  // Lipana requires international format: +254...
  if (cleaned.startsWith('+254')) {
    return cleaned;
  } else if (cleaned.startsWith('254')) {
    return '+' + cleaned;
  } else if (cleaned.startsWith('0')) {
    return '+254' + cleaned.substring(1);
  } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    return '+254' + cleaned;
  }

  return cleaned;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, amount, orderId }: STKPushRequest = await req.json();
    console.log('Lipana STK Push request:', { phone, amount, orderId });

    if (!phone || !amount || !orderId) {
      return new Response(
        JSON.stringify({ error: 'Phone, amount, and orderId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const secretKey = Deno.env.get('LIPANA_SECRET_KEY');
    if (!secretKey) {
      throw new Error('LIPANA_SECRET_KEY is not configured');
    }

    const formattedPhone = formatPhoneNumber(phone);
    console.log('Formatted phone for Lipana:', formattedPhone);

    // NOTE: callbackUrl is configured in the Lipana dashboard, NOT sent per-request.
    const payload = {
      phone: formattedPhone,
      amount: Math.round(amount),
    };

    console.log('Lipana payload:', JSON.stringify(payload, null, 2));

    const lipanaResponse = await fetch(
      'https://api.lipana.dev/v1/transactions/push-stk',
      {
        method: 'POST',
        headers: {
          'x-api-key': secretKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const lipanaResult = await lipanaResponse.json();
    console.log('Lipana response status:', lipanaResponse.status);
    console.log('Lipana response:', JSON.stringify(lipanaResult, null, 2));

    if (lipanaResponse.ok && lipanaResult.success && lipanaResult.data?.transactionId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      // Save Lipana's transactionId so the webhook can match the order
      await supabase
        .from('orders')
        .update({ payment_reference: lipanaResult.data.transactionId })
        .eq('id', orderId);

      return new Response(
        JSON.stringify({
          success: true,
          checkoutRequestId: lipanaResult.data.transactionId,
          message: 'M-PESA prompt sent successfully. Please check your phone.',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      console.error('Lipana STK push failed. Status:', lipanaResponse.status, 'Body:', JSON.stringify(lipanaResult));
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
