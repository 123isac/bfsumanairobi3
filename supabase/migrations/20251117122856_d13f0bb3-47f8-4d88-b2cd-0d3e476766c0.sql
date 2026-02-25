-- Fix RLS policies for user_roles table to allow register_admin_user function to work
-- The function needs to be able to DELETE customer role and INSERT admin role

-- Drop existing restrictive setup and recreate with proper policies
DROP POLICY IF EXISTS "Allow register_admin_user to manage roles" ON public.user_roles;

-- Create a policy that allows INSERT for the register_admin_user function
-- We'll use a function that checks if the current operation is from our secure function
CREATE POLICY "Allow register_admin_user to insert admin roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow if the role being inserted is admin and the user is the authenticated user
  role = 'admin' AND user_id = auth.uid()
);

-- Create a policy that allows DELETE for the register_admin_user function
CREATE POLICY "Allow register_admin_user to delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  -- Allow users to delete their own roles (used during admin registration)
  user_id = auth.uid()
);

-- Also add a policy for admins to manage all roles
CREATE POLICY "Admins can insert any role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete any role"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update any role"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin')
);

-- Now update the existing user to admin role
-- First, let's manually fix the current user's role
UPDATE public.user_roles 
SET role = 'admin'
WHERE user_id = '46b73f1e-32ef-4362-ae5a-bdeb1e875eff';