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