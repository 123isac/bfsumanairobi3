-- Add cost_price (buying price) to products table
-- Reseller profit = selling price (price) - buying price (cost_price)
-- Platform fee = 15% of that profit
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost_price NUMERIC;

-- Add delivery_fee to orders table
-- This is charged to the customer on top of the product price
-- It does NOT affect the reseller's commission calculation
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC NOT NULL DEFAULT 0;
