-- ================================================================
-- BF Suma Nairobi — Admin Worker Upgrade RPC Function
-- Allows Admin to upgrade an existing customer account to a worker
-- ================================================================

CREATE OR REPLACE FUNCTION public.admin_upsert_worker(
  _email text,
  _full_name text,
  _employee_id text,
  _position text,
  _department text,
  _role app_role
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  _target_user_id uuid;
  _caller_is_admin boolean;
BEGIN
  -- 1. Verify caller is admin
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ) INTO _caller_is_admin;

  IF NOT _caller_is_admin THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized: Only administrators can create or upgrade workers'
    );
  END IF;

  -- 2. Find user by email in auth.users
  SELECT id INTO _target_user_id
  FROM auth.users
  WHERE LOWER(email) = LOWER(TRIM(_email))
  LIMIT 1;

  IF _target_user_id IS NOT NULL THEN
    -- Update profile
    INSERT INTO public.profiles (id, full_name)
    VALUES (_target_user_id, TRIM(_full_name))
    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

    -- Update role in user_roles
    DELETE FROM public.user_roles WHERE user_id = _target_user_id;
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_target_user_id, _role);

    -- Insert or update in workers table
    INSERT INTO public.workers (
      user_id, employee_id, full_name, position, department, role, status, created_by, updated_at
    )
    VALUES (
      _target_user_id,
      TRIM(_employee_id),
      TRIM(_full_name),
      TRIM(_position),
      TRIM(_department),
      _role,
      'active',
      auth.uid(),
      now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      employee_id = EXCLUDED.employee_id,
      full_name = EXCLUDED.full_name,
      position = EXCLUDED.position,
      department = EXCLUDED.department,
      role = EXCLUDED.role,
      status = 'active',
      updated_at = now();

    RETURN jsonb_build_object(
      'success', true,
      'isExistingUser', true,
      'message', 'Existing customer account successfully upgraded to staff worker!'
    );
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'isExistingUser', false,
      'message', 'User does not exist in auth yet'
    );
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_upsert_worker(text, text, text, text, text, app_role) TO authenticated;
