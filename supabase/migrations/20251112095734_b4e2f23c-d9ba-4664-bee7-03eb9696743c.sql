-- Fix spa data exposure: restrict spa data visibility to own records only
DROP POLICY IF EXISTS "Spas can view their own data" ON public.spas;

CREATE POLICY "Spas can view only their own data"
ON public.spas
FOR SELECT
USING (auth.uid() = id);

-- Fix admin access logs: restrict INSERT to admins only
DROP POLICY IF EXISTS "System can insert audit logs" ON public.admin_access_logs;

CREATE POLICY "Only admins can insert audit logs"
ON public.admin_access_logs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));
