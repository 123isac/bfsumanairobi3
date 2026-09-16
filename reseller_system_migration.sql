-- Migration: Reseller Fulfillment & Commission System
DO $$ 
DECLARE
  cons_name text;
BEGIN
  -- Drop constraint on orders.status
  FOR cons_name IN
    SELECT constraint_name
    FROM information_schema.constraint_column_usage
    WHERE table_name = 'orders' AND column_name = 'status'
  LOOP
    EXECUTE 'ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS ' || cons_name;
  END LOOP;
  
  -- Drop constraint on orders.payment_status
  FOR cons_name IN
    SELECT constraint_name
    FROM information_schema.constraint_column_usage
    WHERE table_name = 'orders' AND column_name = 'payment_status'
  LOOP
    EXECUTE 'ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS ' || cons_name;
  END LOOP;
END $$;

ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
CHECK (status IN ('payment_pending', 'paid', 'packed', 'dispatched', 'out_for_delivery', 'delivered', 'delivery_failed', 'returned', 'cancelled', 'pending', 'processing', 'completed'));

ALTER TABLE public.orders ADD CONSTRAINT orders_payment_status_check
CHECK (payment_status IN ('pending', 'paid', 'failed'));

-- Add columns to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS reseller_id UUID REFERENCES public.spas(id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_notes TEXT;

-- Update commissions table
ALTER TABLE public.commissions ADD COLUMN IF NOT EXISTS platform_fee_percent NUMERIC DEFAULT 15;
ALTER TABLE public.commissions ADD COLUMN IF NOT EXISTS platform_fee_amount NUMERIC DEFAULT 0;
ALTER TABLE public.commissions ADD COLUMN IF NOT EXISTS net_commission NUMERIC DEFAULT 0;

-- Add commission_rate to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS commission_rate NUMERIC;

-- Drop old trigger
DROP TRIGGER IF EXISTS on_order_with_referral ON public.orders;
DROP TRIGGER IF EXISTS create_commission_on_order_trigger ON public.orders;

-- Fix create_commission_on_order() function
CREATE OR REPLACE FUNCTION public.create_commission_on_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_spa_id UUID;
  v_commission_amount NUMERIC;
  v_platform_fee NUMERIC;
  v_net_commission NUMERIC;
BEGIN
  v_spa_id := NEW.reseller_id;

  IF v_spa_id IS NULL AND NEW.referral_code IS NOT NULL THEN
    SELECT id INTO v_spa_id
    FROM public.spas
    WHERE referral_code = NEW.referral_code
    AND is_active = true;
  END IF;
  
  IF v_spa_id IS NOT NULL THEN
    v_commission_amount := COALESCE(NEW.commission_amount, 0);
    v_platform_fee := v_commission_amount * 0.15;
    v_net_commission := v_commission_amount - v_platform_fee;

    INSERT INTO public.commissions (
      spa_id, 
      order_id, 
      amount,
      platform_fee_percent,
      platform_fee_amount,
      net_commission,
      status
    )
    VALUES (
      v_spa_id, 
      NEW.id, 
      v_commission_amount,
      15,
      v_platform_fee,
      v_net_commission,
      'pending'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create new trigger
CREATE TRIGGER create_commission_on_order_trigger
AFTER UPDATE ON public.orders
FOR EACH ROW
WHEN (NEW.status = 'delivered' AND OLD.status != 'delivered')
EXECUTE FUNCTION public.create_commission_on_order();

-- RLS for Partners inserting orders
DROP POLICY IF EXISTS "Partners can insert orders" ON public.orders;
CREATE POLICY "Partners can insert orders" ON public.orders
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM spas 
        WHERE id = auth.uid() 
        AND is_active = true 
        AND application_status = 'approved'
    )
);

-- RLS for Partners viewing their submitted orders
DROP POLICY IF EXISTS "Partners can view their own submitted orders" ON public.orders;
CREATE POLICY "Partners can view their own submitted orders" ON public.orders
FOR SELECT 
USING (reseller_id = auth.uid());
