-- 1. Create promo_codes table
CREATE TABLE IF NOT EXISTS public.promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_amount DECIMAL NOT NULL,
    discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Turn on RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active codes
CREATE POLICY "Public read active promo codes" ON public.promo_codes
    FOR SELECT USING (is_active = true);

-- Allow admins full access
CREATE POLICY "Admins have full access to promo codes" ON public.promo_codes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
        )
    );

-- 2. Create store_settings table
CREATE TABLE IF NOT EXISTS public.store_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Turn on RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to store settings
CREATE POLICY "Public read store settings" ON public.store_settings
    FOR SELECT USING (true);

-- Allow admins full access
CREATE POLICY "Admins have full access to store settings" ON public.store_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
        )
    );

-- Insert some default settings
INSERT INTO public.store_settings (key, value, description)
VALUES 
    ('store_name', '"BF Suma Nairobi"', 'The name of the store'),
    ('contact_whatsapp', '"+254700000000"', 'Contact number for WhatsApp widget'),
    ('shipping_base_fee', '500', 'Base shipping cost within Nairobi')
ON CONFLICT (key) DO NOTHING;
