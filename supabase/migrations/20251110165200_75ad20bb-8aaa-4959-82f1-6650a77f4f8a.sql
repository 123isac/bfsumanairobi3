-- Add missing RLS policies for commissions table
CREATE POLICY "Only admins can insert commissions"
ON public.commissions FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Prevent commission deletion"
ON public.commissions FOR DELETE
USING (false);

-- Create audit logging table for admin access
CREATE TABLE IF NOT EXISTS public.admin_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.admin_access_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.admin_access_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
ON public.admin_access_logs FOR INSERT
WITH CHECK (true);

-- Create contact_messages table for the contact form
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded'))
);

-- Enable RLS on contact messages
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Only admins can view contact messages
CREATE POLICY "Admins can view contact messages"
ON public.contact_messages FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Anyone can insert contact messages (public form)
CREATE POLICY "Anyone can submit contact messages"
ON public.contact_messages FOR INSERT
WITH CHECK (true);

-- Only admins can update status
CREATE POLICY "Admins can update contact messages"
ON public.contact_messages FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));