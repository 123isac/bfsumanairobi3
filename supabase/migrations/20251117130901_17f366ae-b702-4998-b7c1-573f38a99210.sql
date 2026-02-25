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