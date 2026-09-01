-- ================================================================
-- BF Suma Nairobi — RBAC Staff System Migration
-- Run this in your Supabase SQL Editor (or deploy via Supabase CLI)
-- ================================================================

-- 1. Extend the app_role enum with staff roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'shop_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'warehouse';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'logistics';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'teller';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'logistics_asst';

-- ================================================================
-- 2. Workers table (staff profiles)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  position TEXT NOT NULL,
  department TEXT,
  role app_role NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to workers"
  ON public.workers FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Worker reads own profile"
  ON public.workers FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Shop manager views all workers"
  ON public.workers FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'shop_manager'
  ));

-- ================================================================
-- 3. Permissions master list
-- ================================================================
CREATE TABLE IF NOT EXISTS public.permissions (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  module TEXT NOT NULL
);

INSERT INTO public.permissions (key, label, module) VALUES
  ('view_dashboard_full',      'View Full Dashboard',          'dashboard'),
  ('view_dashboard_shop',      'View Shop Dashboard',          'dashboard'),
  ('view_dashboard_warehouse', 'View Warehouse Dashboard',     'dashboard'),
  ('view_dashboard_logistics', 'View Logistics Dashboard',     'dashboard'),
  ('view_dashboard_teller',    'View Teller Dashboard',        'dashboard'),
  ('manage_workers',           'Create / Manage Workers',      'workers'),
  ('view_workers',             'View Worker Profiles',         'workers'),
  ('manage_roles',             'Manage Roles & Permissions',   'workers'),
  ('view_inventory',           'View Inventory',               'inventory'),
  ('manage_inventory',         'Manage Inventory',             'inventory'),
  ('receive_stock',            'Receive Stock',                'warehouse'),
  ('issue_stock',              'Issue / Dispatch Stock',       'warehouse'),
  ('report_damage',            'Report Damaged Stock',         'warehouse'),
  ('view_deliveries',          'View All Deliveries',          'logistics'),
  ('manage_deliveries',        'Create & Manage Deliveries',   'logistics'),
  ('update_own_deliveries',    'Update Assigned Deliveries',   'logistics'),
  ('record_payment',           'Record Payments / Receipts',   'teller'),
  ('view_teller',              'View Teller Activity',         'teller'),
  ('view_sales',               'View Sales Reports',           'sales'),
  ('manage_sales',             'Manage Sales',                 'sales'),
  ('view_reports_all',         'View All Reports',             'reports'),
  ('view_reports_shop',        'View Shop Reports',            'reports'),
  ('view_reports_own',         'View Own Reports',             'reports'),
  ('assign_tasks',             'Assign Tasks to Workers',      'tasks'),
  ('manage_tasks',             'Manage All Tasks',             'tasks'),
  ('view_own_tasks',           'View Own Tasks',               'tasks'),
  ('view_activity_all',        'View All Activity Logs',       'logs'),
  ('view_activity_shop',       'View Shop Activity Logs',      'logs'),
  ('view_activity_own',        'View Own Activity',            'logs'),
  ('manage_settings',          'Change System Settings',       'settings'),
  ('view_settings',            'View Store Settings',          'settings'),
  ('approve_requests',         'Approve Staff Requests',       'approvals'),
  ('submit_requests',          'Submit Approval Requests',     'approvals'),
  ('manage_customers',         'Manage Customers',             'customers'),
  ('view_customers',           'View Customers',               'customers'),
  ('manage_promotions',        'Manage Promotions',            'promotions')
ON CONFLICT (key) DO NOTHING;

-- ================================================================
-- 4. Role to Permission mapping
-- ================================================================
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role app_role NOT NULL,
  permission_key TEXT NOT NULL REFERENCES public.permissions(key) ON DELETE CASCADE,
  PRIMARY KEY (role, permission_key)
);

-- Shop Manager
INSERT INTO public.role_permissions (role, permission_key) VALUES
  ('shop_manager', 'view_dashboard_shop'),
  ('shop_manager', 'view_dashboard_warehouse'),
  ('shop_manager', 'view_dashboard_logistics'),
  ('shop_manager', 'view_dashboard_teller'),
  ('shop_manager', 'view_workers'),
  ('shop_manager', 'view_inventory'),
  ('shop_manager', 'manage_inventory'),
  ('shop_manager', 'view_deliveries'),
  ('shop_manager', 'manage_deliveries'),
  ('shop_manager', 'view_teller'),
  ('shop_manager', 'view_sales'),
  ('shop_manager', 'manage_sales'),
  ('shop_manager', 'view_reports_shop'),
  ('shop_manager', 'assign_tasks'),
  ('shop_manager', 'manage_tasks'),
  ('shop_manager', 'view_activity_shop'),
  ('shop_manager', 'approve_requests'),
  ('shop_manager', 'view_settings'),
  ('shop_manager', 'view_customers'),
  ('shop_manager', 'manage_promotions')
ON CONFLICT DO NOTHING;

-- Warehouse
INSERT INTO public.role_permissions (role, permission_key) VALUES
  ('warehouse', 'view_dashboard_warehouse'),
  ('warehouse', 'view_inventory'),
  ('warehouse', 'manage_inventory'),
  ('warehouse', 'receive_stock'),
  ('warehouse', 'issue_stock'),
  ('warehouse', 'report_damage'),
  ('warehouse', 'view_reports_own'),
  ('warehouse', 'view_own_tasks'),
  ('warehouse', 'view_activity_own'),
  ('warehouse', 'submit_requests')
ON CONFLICT DO NOTHING;

-- Logistics
INSERT INTO public.role_permissions (role, permission_key) VALUES
  ('logistics', 'view_dashboard_logistics'),
  ('logistics', 'view_inventory'),
  ('logistics', 'view_deliveries'),
  ('logistics', 'manage_deliveries'),
  ('logistics', 'update_own_deliveries'),
  ('logistics', 'view_customers'),
  ('logistics', 'view_reports_own'),
  ('logistics', 'view_own_tasks'),
  ('logistics', 'view_activity_own'),
  ('logistics', 'submit_requests')
ON CONFLICT DO NOTHING;

-- Teller
INSERT INTO public.role_permissions (role, permission_key) VALUES
  ('teller', 'view_dashboard_teller'),
  ('teller', 'record_payment'),
  ('teller', 'view_teller'),
  ('teller', 'view_sales'),
  ('teller', 'view_reports_own'),
  ('teller', 'view_own_tasks'),
  ('teller', 'view_activity_own'),
  ('teller', 'submit_requests')
ON CONFLICT DO NOTHING;

-- Logistics Assistant
INSERT INTO public.role_permissions (role, permission_key) VALUES
  ('logistics_asst', 'view_dashboard_logistics'),
  ('logistics_asst', 'update_own_deliveries'),
  ('logistics_asst', 'view_customers'),
  ('logistics_asst', 'view_own_tasks'),
  ('logistics_asst', 'view_activity_own'),
  ('logistics_asst', 'submit_requests')
ON CONFLICT DO NOTHING;

-- RLS for permissions and role_permissions
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All authenticated users can read permissions"
  ON public.permissions FOR SELECT TO authenticated USING (true);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All authenticated users can read role_permissions"
  ON public.role_permissions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin manages role_permissions"
  ON public.role_permissions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- ================================================================
-- 5. Activity logs
-- ================================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  worker_id UUID REFERENCES public.workers(id),
  action TEXT NOT NULL,
  target_table TEXT,
  target_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin views all activity logs"
  ON public.activity_logs FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Worker views own activity"
  ON public.activity_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Worker inserts own activity"
  ON public.activity_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Shop manager views shop activity"
  ON public.activity_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'shop_manager'
  ));

-- ================================================================
-- 6. Approval requests
-- ================================================================
CREATE TABLE IF NOT EXISTS public.approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payload JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages all approval requests"
  ON public.approval_requests FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Worker submits and views own requests"
  ON public.approval_requests FOR ALL
  USING (requested_by = auth.uid());

CREATE POLICY "Shop manager manages approval requests"
  ON public.approval_requests FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'shop_manager'
  ));

-- ================================================================
-- 7. Helper function: get user permissions array
-- ================================================================
CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id UUID)
RETURNS TEXT[]
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(ARRAY_AGG(rp.permission_key), ARRAY[]::TEXT[])
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON rp.role = ur.role
  WHERE ur.user_id = _user_id
    AND ur.role != 'admin'
$$;

-- ================================================================
-- DONE
-- ================================================================
