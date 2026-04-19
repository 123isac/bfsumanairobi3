-- =============================================================
-- BF SUMA NAIROBI — ENTERPRISE SECURITY AUDIT SQL
-- Run this in Supabase SQL Editor: Dashboard > SQL Editor > Run
-- =============================================================

-- ──────────────────────────────────────────
-- SECTION 1: Enable RLS on all core tables
-- ──────────────────────────────────────────
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────
-- SECTION 2: ORDERS TABLE — strict user isolation
-- ──────────────────────────────────────────

-- Drop any existing loose policies
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated inserts" ON public.orders;

-- Customers can only see THEIR OWN orders
CREATE POLICY "customers_select_own_orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

-- Customers can create orders (insert)
CREATE POLICY "customers_insert_own_orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can read ALL orders (bypass via role check)
CREATE POLICY "admins_full_orders_access"
  ON public.orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Edge functions using the service_role key bypass RLS automatically — no extra policy needed

-- ──────────────────────────────────────────
-- SECTION 3: ORDER_ITEMS TABLE
-- ──────────────────────────────────────────

DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;

-- Users can see items only from their own orders
CREATE POLICY "customers_select_own_order_items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Users can insert items into their own orders
CREATE POLICY "customers_insert_own_order_items"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Admins can see everything
CREATE POLICY "admins_full_order_items_access"
  ON public.order_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ──────────────────────────────────────────
-- SECTION 4: PROFILES TABLE
-- ──────────────────────────────────────────

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;

-- Users can only see THEIR OWN profile
CREATE POLICY "users_select_own_profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_update_own_profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (on sign-up)
CREATE POLICY "users_insert_own_profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admins can read all profiles for CRM
CREATE POLICY "admins_full_profiles_access"
  ON public.profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ──────────────────────────────────────────
-- SECTION 5: PAGE_VISITS — anonymous inserts only, no reads for public
-- ──────────────────────────────────────────

DROP POLICY IF EXISTS "Allow anonymous inserts on page_visits" ON public.page_visits;
DROP POLICY IF EXISTS "Admins can see all page visits" ON public.page_visits;

-- Anyone (even unauthenticated) can INSERT a visit row (required for tracking)
CREATE POLICY "anon_insert_page_visits"
  ON public.page_visits FOR INSERT
  WITH CHECK (true);

-- Only admins can SELECT/read the analytics data
CREATE POLICY "admins_select_page_visits"
  ON public.page_visits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ──────────────────────────────────────────
-- SECTION 6: STORAGE — Harden the products bucket
-- Remove "God Mode" public upload policy; restrict to admins only
-- ──────────────────────────────────────────

-- Drop the old overly permissive upload policy
DROP POLICY IF EXISTS "GodModeUploads" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload to products" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "anyone can upload" ON storage.objects;

-- Allow public READ access to product images (so the shop can display them)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage'
    AND policyname = 'public_read_products_bucket'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "public_read_products_bucket"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'products')
    $pol$;
  END IF;
END;
$$;

-- Only verified admins can UPLOAD product images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage'
    AND policyname = 'admins_only_upload_products'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "admins_only_upload_products"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (
          bucket_id = 'products'
          AND EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
          )
        )
    $pol$;
  END IF;
END;
$$;

-- Only admins can delete/update product images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage'
    AND policyname = 'admins_only_modify_products'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "admins_only_modify_products"
        ON storage.objects FOR ALL
        TO authenticated
        USING (
          bucket_id = 'products'
          AND EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
          )
        )
    $pol$;
  END IF;
END;
$$;

-- ──────────────────────────────────────────
-- SECTION 7: Also ensure the admin_updates migrations run 
-- (adds kenya_address + page_visits table if not already done)
-- ──────────────────────────────────────────

-- Add kenya_address column to profiles if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'kenya_address'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN kenya_address JSONB DEFAULT NULL;
  END IF;
END;
$$;

-- Create page_visits table if not exists
CREATE TABLE IF NOT EXISTS public.page_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  path TEXT NOT NULL,
  visited_at TIMESTAMPTZ DEFAULT now()
);

-- ──────────────────────────────────────────
-- DONE! Your platform is now enterprise-secured.
-- ──────────────────────────────────────────
