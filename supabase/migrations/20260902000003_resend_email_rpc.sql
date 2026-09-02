-- Migration: Resend Email RPC Function using pg_net
-- Allows sending transactional emails directly via Supabase PostgreSQL

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Ensure store_settings contains resend_api_key placeholder if not present
INSERT INTO public.store_settings (key, value, description)
VALUES (
  'resend_api_key',
  '"YOUR_RESEND_API_KEY_HERE"',
  'API key for Resend transactional email delivery'
)
ON CONFLICT (key) DO NOTHING;


CREATE OR REPLACE FUNCTION send_email_resend(
  to_email text,
  subject text,
  html_body text,
  from_email text DEFAULT 'BF Suma Nairobi <onboarding@resend.dev>'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  resend_key text;
  request_id bigint;
  payload jsonb;
BEGIN
  -- Retrieve configured API key from store_settings
  SELECT COALESCE(
    (SELECT value#>>'{}' FROM public.store_settings WHERE key = 'resend_api_key'),
    current_setting('app.settings.resend_api_key', true)
  ) INTO resend_key;

  IF resend_key IS NULL OR resend_key = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'resend_api_key is not configured in store_settings');
  END IF;

  payload := jsonb_build_object(
    'from', from_email,
    'to', jsonb_build_array(to_email),
    'subject', subject,
    'html', html_body
  );

  SELECT net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || resend_key,
      'Content-Type', 'application/json'
    ),
    body := payload
  ) INTO request_id;

  RETURN jsonb_build_object('success', true, 'request_id', request_id);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION send_email_resend(text, text, text, text) TO anon, authenticated, service_role;

