-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Categories are public (everyone can read)
CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  USING (true);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url TEXT,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  rating DECIMAL(2,1) DEFAULT 5.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products are public (everyone can read active products)
CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (is_active = true);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Customer info
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  
  -- Shipping info
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_postal_code TEXT,
  
  -- Payment info
  payment_method TEXT NOT NULL CHECK (payment_method IN ('mpesa', 'card')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  payment_reference TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Order items inherit access from orders
CREATE POLICY "Users can view their own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert order items for their orders"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Create user_roles table for admin access
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- Admin policies for products
CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for categories
CREATE POLICY "Admins can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update categories"
  ON public.categories FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for orders (can view all orders)
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  
  -- Assign customer role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'customer');
  
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Insert default categories
INSERT INTO public.categories (name, slug, description) VALUES
  ('Digestive Health', 'digestive-health', 'Support your digestive system health'),
  ('Better Life', 'better-life', 'Products for a better and healthier life'),
  ('Beauty & Antiaging', 'beauty-antiaging', 'Premium skincare and youth preservation solutions'),
  ('Suma Baby', 'suma-baby', 'Health and wellness for babies and children'),
  ('Suma Living', 'suma-living', 'Essential personal care items for daily use'),
  ('Immune Boosters', 'immune-boosters', 'Strengthen your immune system naturally'),
  ('Premium Selected', 'premium-selected', 'Our carefully curated premium collection'),
  ('Bone & Joint Care', 'bone-joint-care', 'Support for healthy bones and joints'),
  ('Cardio Vascular Health', 'cardio-vascular-health', 'Products for a healthy heart and circulation');
-- Create spas table
CREATE TABLE public.spas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text NOT NULL,
  referral_code text NOT NULL UNIQUE,
  total_earnings numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on spas
ALTER TABLE public.spas ENABLE ROW LEVEL SECURITY;

-- Spas can view their own data
CREATE POLICY "Spas can view their own data"
ON public.spas
FOR SELECT
USING (auth.uid() = id);

-- Admins can view all spas
CREATE POLICY "Admins can view all spas"
ON public.spas
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert spas
CREATE POLICY "Admins can insert spas"
ON public.spas
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update spas
CREATE POLICY "Admins can update spas"
ON public.spas
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add referral_code to orders table
ALTER TABLE public.orders
ADD COLUMN referral_code text,
ADD COLUMN commission_amount numeric DEFAULT 1000,
ADD COLUMN commission_paid boolean DEFAULT false;

-- Create index for referral lookups
CREATE INDEX idx_orders_referral_code ON public.orders(referral_code);
CREATE INDEX idx_spas_referral_code ON public.spas(referral_code);

-- Create commissions tracking table
CREATE TABLE public.commissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  spa_id uuid NOT NULL REFERENCES public.spas(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 1000,
  status text NOT NULL DEFAULT 'pending',
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'paid'))
);

-- Enable RLS on commissions
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- Spas can view their own commissions
CREATE POLICY "Spas can view their own commissions"
ON public.commissions
FOR SELECT
USING (spa_id = auth.uid());

-- Admins can view all commissions
CREATE POLICY "Admins can view all commissions"
ON public.commissions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update commissions
CREATE POLICY "Admins can update commissions"
ON public.commissions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updating spa earnings
CREATE OR REPLACE FUNCTION public.update_spa_earnings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a commission is marked as paid, update spa total_earnings
  IF NEW.status = 'paid' AND OLD.status = 'pending' THEN
    UPDATE public.spas
    SET total_earnings = total_earnings + NEW.amount,
        updated_at = now()
    WHERE id = NEW.spa_id;
    
    NEW.paid_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_commission_paid
  BEFORE UPDATE ON public.commissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_spa_earnings();

-- Create trigger for automatic commission creation
CREATE OR REPLACE FUNCTION public.create_commission_on_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  spa_record RECORD;
BEGIN
  -- If order has a referral code, create a commission
  IF NEW.referral_code IS NOT NULL THEN
    SELECT id INTO spa_record
    FROM public.spas
    WHERE referral_code = NEW.referral_code
    AND is_active = true;
    
    IF FOUND THEN
      INSERT INTO public.commissions (spa_id, order_id, amount)
      VALUES (spa_record.id, NEW.id, NEW.commission_amount);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_order_with_referral
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.create_commission_on_order();

-- Add trigger for updating spas updated_at
CREATE TRIGGER update_spas_updated_at
  BEFORE UPDATE ON public.spas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
-- Fix the update_updated_at function to have proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
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
-- Add application tracking fields to spas table
ALTER TABLE public.spas 
ADD COLUMN IF NOT EXISTS application_status text NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS applied_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Add check constraint for application status
ALTER TABLE public.spas 
ADD CONSTRAINT valid_application_status 
CHECK (application_status IN ('pending', 'approved', 'rejected'));

-- Update RLS policies to allow public spa registration
CREATE POLICY "Anyone can apply as spa"
ON public.spas
FOR INSERT
WITH CHECK (application_status = 'pending');

-- Allow spas to view their own application status even when pending
DROP POLICY IF EXISTS "Spas can view their own data" ON public.spas;
CREATE POLICY "Spas can view their own data"
ON public.spas
FOR SELECT
USING (auth.uid() = id OR application_status = 'approved');

-- Admins can view all spa applications including pending
-- (already covered by existing "Admins can view all spas" policy)

-- Add index for faster filtering of pending applications
CREATE INDEX IF NOT EXISTS idx_spas_application_status ON public.spas(application_status);

-- Add trigger to set approved_at timestamp when status changes to approved
CREATE OR REPLACE FUNCTION public.set_spa_approval_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.application_status = 'approved' AND OLD.application_status != 'approved' THEN
    NEW.approved_at = now();
    NEW.is_active = true;
  END IF;
  
  IF NEW.application_status = 'rejected' THEN
    NEW.is_active = false;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER spa_approval_timestamp_trigger
BEFORE UPDATE ON public.spas
FOR EACH ROW
EXECUTE FUNCTION public.set_spa_approval_timestamp();
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
-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Storage policies for product images
CREATE POLICY "Anyone can view product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update product images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'product-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete product images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to view all users
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all user roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for products
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
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
-- Enable realtime for orders table if not already added
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  EXCEPTION
    WHEN duplicate_object THEN
      NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.spas;
  EXCEPTION
    WHEN duplicate_object THEN
      NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.commissions;
  EXCEPTION
    WHEN duplicate_object THEN
      NULL;
  END;
END $$;
-- Add YouTube URL column to products table
ALTER TABLE public.products 
ADD COLUMN youtube_url TEXT;
-- Newsletter subscribers
create table if not exists public.newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  created_at timestamp with time zone default now()
);

alter table public.newsletter_subscribers enable row level security;

-- Anyone can subscribe (insert), only admins can read
create policy "Public can subscribe" on public.newsletter_subscribers
  for insert with check (true);

create policy "Admins can view subscribers" on public.newsletter_subscribers
  for select using (
    public.has_role(auth.uid(), 'admin')
  );

-- Product reviews
create table if not exists public.product_reviews (
  id uuid default gen_random_uuid() primary key,
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default now(),
  unique(product_id, user_id)
);

alter table public.product_reviews enable row level security;

create policy "Anyone can read reviews" on public.product_reviews
  for select using (true);

create policy "Authenticated users can insert reviews" on public.product_reviews
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own reviews" on public.product_reviews
  for update using (auth.uid() = user_id);
-- ============================================================
-- UPDATE product descriptions with premium marketing copy
-- Paste and run in Lovable's Supabase SQL Editor
-- ============================================================

-- ── SKIN CARE ────────────────────────────────────────────────

UPDATE public.products SET description =
  'Reveal your best skin every morning with this luxurious Niacinamide-infused cleanser that gently purifies while preserving your skin''s natural moisture barrier — leaving you fresh, radiant, and perfectly prepped.'
WHERE name ILIKE '%cleanser%';

UPDATE public.products SET description =
  'Drench your skin in lasting hydration with this ultra-refined toner, powered by deep-penetrating Hyaluronic Acid and Astaxanthin to restore firmness, balance, and luminosity with every gentle application.'
WHERE name ILIKE '%toner%';

UPDATE public.products SET description =
  'Transform your complexion in minutes with this intensive hydrating mask, expertly crafted to visibly firm, brighten, and deeply renew your skin — revealing a softer, more youthful glow with every use.'
WHERE name ILIKE '%facial%mask%';

UPDATE public.products SET description =
  'A weightless yet profoundly nourishing daily lotion that brightens, firms, and moisturises for a luminous, even-toned complexion — your complete skin renewal ritual from morning to night.'
WHERE name ILIKE '%lotion%' AND name ILIKE '%youth%';

UPDATE public.products SET description =
  'Turn back the clock with this opulent anti-aging cream, meticulously formulated with Rhodiola Rosea, Collagen Peptides, and Astaxanthin to visibly reduce fine lines and restore your skin''s youthful radiance.'
WHERE name ILIKE '%facial%cream%';

-- ── IMMUNE BOOSTER ──────────────────────────────────────────

UPDATE public.products SET description =
  'A powerful immune elixir derived from 99% cell-wall broken Ganoderma spores — nature''s most potent defense activator, concentrated into a precise 30-capsule pack for your daily immune ritual.'
WHERE name ILIKE '%ganoderma%' AND name ILIKE '%30%' AND name NOT ILIKE '%oil%';

UPDATE public.products SET description =
  'Unlock the regenerative power of 99% broken Ganoderma spores with this 60-capsule value pack, delivering sustained immune fortification and uninterrupted cellular protection for long-term wellness.'
WHERE name ILIKE '%ganoderma%60%' AND name NOT ILIKE '%oil%';

UPDATE public.products SET description =
  'Experience immunity at its most concentrated — a 3X potent Ganoderma spore oil formula that penetrates deeper, works harder, and delivers elite-level immune defense, cardiovascular support, and total vitality.'
WHERE name ILIKE '%ganoderma%oil%';

UPDATE public.products SET description =
  'A masterful blend of four revered Reishi mushroom varieties — Red, Black, Purple, and White — working in powerful synergy to deliver comprehensive immune defense, liver detoxification, and lasting vitality.'
WHERE name ILIKE '%quad%reishi%' OR name ILIKE '%reishi%capsule%';

UPDATE public.products SET description =
  'Harness the legendary healing power of purified Yunzhi essence — a premium immune modulator trusted worldwide to strengthen, balance, and protect your body''s defenses from the inside out.'
WHERE name ILIKE '%yunz%';

-- ── PREMIUM SELECTED ─────────────────────────────────────────

UPDATE public.products SET description =
  'Start your day with purpose — a sophisticated fusion of NMN and premium coffee latte that fuels cellular energy, supports longevity, and elevates your morning ritual. No sugar added. Just pure performance.'
WHERE name ILIKE '%nmn%coffee%';

UPDATE public.products SET description =
  'One tablet. 24 hours of cellular renewal. Our breakthrough Duo-Release NMN technology steadily replenishes NAD+ throughout the day for sustained energy, DNA repair, and a body that ages beautifully.'
WHERE name ILIKE '%nmn%duo%' OR name ILIKE '%duo%release%';

UPDATE public.products SET description =
  'Unleash your brain''s full potential with a precision-crafted fusion of NMN, Resveratrol, and Ginkgo Biloba — engineered to sharpen focus, enhance memory, and support cognitive longevity at every age.'
WHERE name ILIKE '%nmn%sharp%' OR name ILIKE '%sharp%mind%';

UPDATE public.products SET description =
  'A luxurious daily antioxidant ritual powered by Resveratrol, NMN, and an elite blend of superberry extracts from around the world — formulated to protect, brighten, and beautifully defy the signs of aging.'
WHERE name ILIKE '%youth%ever%';

-- ── BONE & JOINT ─────────────────────────────────────────────

UPDATE public.products SET description =
  'Clinically-grade Glucosamine sourced from Spain, delivering the essential building blocks your joints need to lubricate, repair, and perform — for a life of comfort, mobility, and freedom from stiffness.'
WHERE name ILIKE '%gluzojoint%' AND name NOT ILIKE '%ultra%' AND name NOT ILIKE '%pro%';

UPDATE public.products SET description =
  'The ultimate triple-action joint formula — Glucosamine, Chondroitin, and MSM in one powerful capsule — engineered for those who demand peak joint performance without compromise, at any intensity level.'
WHERE name ILIKE '%gluzojoint%ultra%' OR name ILIKE '%gluzojoint%pro%';

UPDATE public.products SET description =
  'A potent dual-action formula uniting high-concentration Glucosamine and Chondroitin to repair, nourish, and protect your cartilage — your essential daily companion for active, pain-free living.'
WHERE name ILIKE '%arthroxtra%';

UPDATE public.products SET description =
  'Achieve superior bone and dental health with four precision-chelated minerals in one elegant capsule — our amino acid-bonded formula delivers over 95% calcium absorption, the gold standard in bone nutrition.'
WHERE name ILIKE '%zaminocal%';

-- Preview
SELECT name, LEFT(description, 80) AS description_preview FROM public.products ORDER BY name;
-- Add separate benefits and ingredients columns to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS benefits TEXT,
ADD COLUMN IF NOT EXISTS ingredients TEXT;
