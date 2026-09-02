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
  if (cleaned.startsWith('2540')) return '254' + cleaned.substring(4);
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
    const { phone, orderId } = await req.json();

    if (!phone || !orderId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Phone and orderId are required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    let secretKey = Deno.env.get('LIPANA_SECRET_KEY');
    if (!secretKey) {
      const { data: settingRow } = await supabase
        .from('store_settings')
        .select('value')
        .eq('key', 'lipana_secret_key')
        .maybeSingle();
      if (settingRow?.value) {
        secretKey = typeof settingRow.value === 'string' ? settingRow.value : String(settingRow.value);
      }
    }

    if (!secretKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'M-PESA STK prompt gateway is unconfigured. Please use the Paybill details (4115354) shown below.' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }


    const { data: orderRow, error: orderError } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('id', orderId)
      .single();

    if (orderError || !orderRow) {
      return new Response(
        JSON.stringify({ success: false, error: 'Order not found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const secureAmount = Math.round(Number(orderRow.total_amount));

    if (secureAmount < 1) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid order amount' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formattedPhone = formatPhoneNumber(phone);

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

    const transactionId = lipanaResult.data?.transactionId || lipanaResult.data?.reference || lipanaResult.data?.id || lipanaResult.transactionId || lipanaResult.reference;

    if (lipanaResponse.ok && (lipanaResult.success || transactionId)) {
      if (transactionId) {
        await supabase
          .from('orders')
          .update({ payment_reference: String(transactionId) })
          .eq('id', orderId);
      }

      return new Response(
        JSON.stringify({
          success: true,
          checkoutRequestId: transactionId || 'initiated',
          message: 'M-PESA prompt sent. Enter your PIN on your phone.',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.error('Lipana STK push failed:', JSON.stringify(lipanaResult));
      return new Response(
        JSON.stringify({
          success: false,
          error: lipanaResult.message || lipanaResult.error || `M-PESA push failed (HTTP ${lipanaResponse.status})`,
          details: lipanaResult,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error in mpesa-stk-push:', error);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

