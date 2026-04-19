-- 1. Add jsonb column for auto-saving addresses securely
ALTER TABLE IF EXISTS public.profiles 
ADD COLUMN IF NOT EXISTS kenya_address JSONB;

-- 2. Create the anonymous website tracker table
CREATE TABLE IF NOT EXISTS public.page_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    path TEXT NOT NULL,
    visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Security policies to allow browsers to drop anonymous tracking data natively
ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public tracking inserts" ON public.page_visits FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow admin tracking reads" ON public.page_visits FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
  )
);

-- 4. Secure User Deletion Prep: Make order.user_id nullable so receipts don't vanish!
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- 5. Drop the harsh foreign key constraint and recreate with ON DELETE SET NULL
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE public.orders ADD CONSTRAINT orders_user_id_fkey 
   FOREIGN KEY (user_id) 
   REFERENCES public.profiles(id) 
   ON DELETE SET NULL;
