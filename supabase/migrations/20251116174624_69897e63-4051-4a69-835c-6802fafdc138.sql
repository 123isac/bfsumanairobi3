-- Create a secure function to register admin users
CREATE OR REPLACE FUNCTION public.register_admin_user(
  _user_id uuid,
  _email text,
  _full_name text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the user exists and matches the authenticated user
  IF _user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot register admin for different user';
  END IF;

  -- Insert or update the profile
  INSERT INTO public.profiles (id, full_name)
  VALUES (_user_id, _full_name)
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name;

  -- Add admin role (remove customer role if exists)
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin');
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.register_admin_user(uuid, text, text) TO authenticated;

-- Add policy to allow users to insert their own profile during registration
DROP POLICY IF EXISTS "Users can insert their own profile during signup" ON public.profiles;
CREATE POLICY "Users can insert their own profile during signup"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Ensure profiles RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;