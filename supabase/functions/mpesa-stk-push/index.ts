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

const getAccessToken = async (): Promise<string> => {
  const consumerKey = Deno.env.get('MPESA_CONSUMER_KEY');
  const consumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET');

  if (!consumerKey || !consumerSecret) {
    throw new Error('M-PESA credentials not configured');
  }

  const auth = btoa(`${consumerKey}:${consumerSecret}`);

  const response = await fetch(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OAuth error:', errorText);
    throw new Error('Failed to get access token');
  }

  const data = await response.json();
  return data.access_token;
};

const formatPhoneNumber = (phone: string): string => {
  // Remove any spaces, dashes, or special characters
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // Handle different formats
  if (cleaned.startsWith('+254')) {
    cleaned = cleaned.substring(1); // Remove +
  } else if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    cleaned = '254' + cleaned;
  }

  return cleaned;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, amount, orderId, accountReference }: STKPushRequest = await req.json();

    console.log('STK Push request:', { phone, amount, orderId });

    if (!phone || !amount || !orderId) {
      return new Response(
        JSON.stringify({ error: 'Phone, amount, and orderId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = await getAccessToken();
    const shortcode = Deno.env.get('MPESA_SHORTCODE');
    const passkey = Deno.env.get('MPESA_PASSKEY');

    if (!shortcode || !passkey) {
      throw new Error('M-PESA shortcode or passkey not configured');
    }

    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').substring(0, 14);
    const password = btoa(`${shortcode}${passkey}${timestamp}`);
    const formattedPhone = formatPhoneNumber(phone);

    // Use the project's callback URL
    const callbackUrl = `https://cwjbdpxolhxbcyhkapmy.supabase.co/functions/v1/mpesa-callback`;

    const stkPushPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerBuyGoodsOnline', // Till number transaction type
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: accountReference || `Order-${orderId.substring(0, 8)}`,
      TransactionDesc: `Payment for order ${orderId.substring(0, 8)}`,
    };

    console.log('STK Push payload:', JSON.stringify(stkPushPayload, null, 2));

    const stkResponse = await fetch(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stkPushPayload),
      }
    );

    const stkResult = await stkResponse.json();
    console.log('STK Push response:', JSON.stringify(stkResult, null, 2));

    if (stkResult.ResponseCode === '0') {
      // Save CheckoutRequestID to the order so the callback can match and update payment status
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      await supabase
        .from('orders')
        .update({ payment_reference: stkResult.CheckoutRequestID })
        .eq('id', orderId);

      return new Response(
        JSON.stringify({
          success: true,
          checkoutRequestId: stkResult.CheckoutRequestID,
          merchantRequestId: stkResult.MerchantRequestID,
          message: 'STK push sent successfully. Please check your phone.',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      console.error('STK Push failed:', stkResult);
      return new Response(
        JSON.stringify({
          success: false,
          error: stkResult.errorMessage || stkResult.ResponseDescription || 'STK push failed',
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
