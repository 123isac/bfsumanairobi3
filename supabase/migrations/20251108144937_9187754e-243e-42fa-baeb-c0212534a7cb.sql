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