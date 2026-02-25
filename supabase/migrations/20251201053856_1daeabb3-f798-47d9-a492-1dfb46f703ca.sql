-- Add YouTube URL column to products table
ALTER TABLE public.products 
ADD COLUMN youtube_url TEXT;