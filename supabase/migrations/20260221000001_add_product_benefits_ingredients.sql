-- Add separate benefits and ingredients columns to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS benefits TEXT,
ADD COLUMN IF NOT EXISTS ingredients TEXT;
