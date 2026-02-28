-- Migration: add Kenya-specific delivery address fields to orders
-- Run this in Supabase Dashboard → SQL Editor

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shipping_area        TEXT,      -- Estate/Area e.g. Westlands, Kilimani
  ADD COLUMN IF NOT EXISTS shipping_building    TEXT,      -- Building name / house number
  ADD COLUMN IF NOT EXISTS shipping_landmark    TEXT;      -- Nearest landmark for delivery rider

COMMENT ON COLUMN public.orders.shipping_area     IS 'Estate or area within city e.g. Westlands, Kilimani, Lang''ata';
COMMENT ON COLUMN public.orders.shipping_building IS 'Building name or house/plot number';
COMMENT ON COLUMN public.orders.shipping_landmark IS 'Nearest landmark to help the rider locate the address';
