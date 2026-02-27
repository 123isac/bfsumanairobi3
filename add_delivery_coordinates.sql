-- Migration: add delivery coordinates to orders table
-- Run this in Supabase Dashboard → SQL Editor

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_lat  DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS delivery_lng  DOUBLE PRECISION;

COMMENT ON COLUMN orders.delivery_lat IS 'Customer pinned delivery latitude from Google Maps';
COMMENT ON COLUMN orders.delivery_lng IS 'Customer pinned delivery longitude from Google Maps';
