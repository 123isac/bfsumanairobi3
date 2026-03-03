// @ts-nocheck
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
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');

  if (cleaned.startsWith('+254')) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    cleaned = '254' + cleaned;
  }

  return cleaned;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, amount, orderId, accountReference }: STKPushRequest = await req.json();
    console.log('Mobile Money request:', { phone, amount, orderId });

    if (!phone || !amount || !orderId) {
      return new Response(
        JSON.stringify({ error: 'Phone, amount, and orderId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const publishableKey = Deno.env.get('INTASEND_PUBLISHABLE_KEY');
    const secretKey = Deno.env.get('INTASEND_SECRET_KEY');

    if (!publishableKey || !secretKey) {
      throw new Error('IntaSend keys not configured');
    }

    const formattedPhone = formatPhoneNumber(phone);

    // IntaSend allows "BUSINESS-PAYS" or "CUSTOMER-PAYS" for M-Pesa fees. 
    // Usually CUSTOMER-PAYS is expected for normal checkouts.
    const payload = {
      amount: Math.round(amount),
      phone_number: formattedPhone,
      api_ref: orderId, // We use this in webhook to match the DB record
      mobile_tarrif: "CUSTOMER-PAYS"
    };

    console.log('IntaSend payload:', JSON.stringify(payload, null, 2));

    // Notice we're hitting the main IntaSend STK push endpoint
    const intasendResponse = await fetch(
      'https://payment.intasend.com/api/v1/payment/mpesa-stk-push/',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'X-IntaSend-Public-API-Key': publishableKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const intasendResult = await intasendResponse.json();
    console.log('IntaSend response:', JSON.stringify(intasendResult, null, 2));

    if (intasendResponse.ok && intasendResult.invoice) {
      // Create supabase client to save invoice_id
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      // Save IntaSend's invoice_id to the order so webhook can match it
      await supabase
        .from('orders')
        .update({ payment_reference: intasendResult.invoice.invoice_id })
        .eq('id', orderId);

      return new Response(
        JSON.stringify({
          success: true,
          checkoutRequestId: intasendResult.invoice.invoice_id,
          message: 'M-PESA prompt sent successfully. Please check your phone.',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      console.error('IntaSend charge failed:', intasendResult);
      return new Response(
        JSON.stringify({
          success: false,
          error: intasendResult.errors ? JSON.stringify(intasendResult.errors) : 'Payment initiation failed',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: any) {
    console.error('Error in mpesa-stk-push:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
