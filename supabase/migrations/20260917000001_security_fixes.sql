-- Revoke anonymous execution of send_email_resend
REVOKE EXECUTE ON FUNCTION public.send_email_resend(text, text, text, text) FROM anon;

-- Remove secrets from store_settings
DELETE FROM public.store_settings WHERE key IN ('resend_api_key', 'lipana_secret', 'mpesa_secret', 'lipana_secret_key', 'mpesa_secret_key');

-- Drop policy that allows public read to all store settings and recreate
DROP POLICY IF EXISTS "Public read store settings" ON public.store_settings;

CREATE POLICY "Public read non-secret store settings" ON public.store_settings
    FOR SELECT USING (key NOT IN ('resend_api_key', 'lipana_secret', 'mpesa_secret', 'lipana_secret_key', 'mpesa_secret_key'));

-- Add missing statuses to orders payment_status
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_status_check CHECK (payment_status IN ('pending', 'completed', 'failed', 'paid'));

-- Add missing statuses to order status (including full reseller fulfillment pipeline)
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (
    status IN (
        'payment_pending', 'paid', 'packed', 'dispatched', 'out_for_delivery', 
        'delivered', 'delivery_failed', 'returned', 'cancelled', 
        'pending', 'processing', 'completed', 'shipped'
    )
);
