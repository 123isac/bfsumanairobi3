-- Fix spas table RLS policy and provide SECURITY DEFINER helper for partner dashboard
DROP POLICY IF EXISTS "Spas can view only their own data" ON public.spas;
DROP POLICY IF EXISTS "Spas can view their own data" ON public.spas;
DROP POLICY IF EXISTS "Users can view their own spa data" ON public.spas;
DROP POLICY IF EXISTS "Admins can view all spas" ON public.spas;
DROP POLICY IF EXISTS "Anyone can apply as spa" ON public.spas;
DROP POLICY IF EXISTS "Admins can update spas" ON public.spas;

ALTER TABLE public.spas ENABLE ROW LEVEL SECURITY;

-- 1. Anyone can apply (INSERT)
CREATE POLICY "Anyone can apply as spa"
ON public.spas
FOR INSERT
WITH CHECK (true);

-- 2. Partner can view their own record by email or admin
CREATE POLICY "Users can view their own spa data"
ON public.spas
FOR SELECT
USING (
  lower(email) = lower(auth.jwt() ->> 'email')
  OR auth.uid() = id
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 3. Admins can update spa records (Approve / Reject)
CREATE POLICY "Admins can update spas"
ON public.spas
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. SECURITY DEFINER function to reliably fetch current user's partner profile
CREATE OR REPLACE FUNCTION public.get_my_partner_profile()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  _user_email text;
  _spa record;
BEGIN
  _user_email := auth.jwt() ->> 'email';
  
  IF _user_email IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT id, name, contact_name, email, phone, referral_code, total_earnings, is_active, application_status, created_at
  INTO _spa
  FROM public.spas
  WHERE LOWER(TRIM(email)) = LOWER(TRIM(_user_email))
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'id', _spa.id,
    'name', _spa.name,
    'contact_name', _spa.contact_name,
    'email', _spa.email,
    'phone', _spa.phone,
    'referral_code', _spa.referral_code,
    'total_earnings', _spa.total_earnings,
    'is_active', _spa.is_active,
    'application_status', _spa.application_status,
    'created_at', _spa.created_at
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_partner_profile() TO authenticated, anon;
