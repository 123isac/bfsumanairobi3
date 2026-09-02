-- ================================================================
-- BF Suma Nairobi — Fix user_roles & workers RLS policies
-- Allows all users (Admin, Staff, Customer) to read their own role
-- ================================================================

-- 1. Create a bulletproof SECURITY DEFINER function to get current user's role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  _role text;
BEGIN
  -- First check user_roles
  SELECT role::text INTO _role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;

  -- If not in user_roles or customer, check workers table
  IF _role IS NULL OR _role = 'customer' THEN
    SELECT role::text INTO _role
    FROM public.workers
    WHERE user_id = auth.uid() AND status = 'active'
    LIMIT 1;
  END IF;

  RETURN COALESCE(_role, 'customer');
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO anon;

-- 2. Fix RLS on public.user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
DROP POLICY IF EXISTS "Allow authenticated to read own role" ON public.user_roles;

CREATE POLICY "Allow authenticated to read own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Fix RLS on public.workers
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Worker reads own profile" ON public.workers;
DROP POLICY IF EXISTS "Allow worker to read own profile" ON public.workers;

CREATE POLICY "Allow worker to read own profile"
ON public.workers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
