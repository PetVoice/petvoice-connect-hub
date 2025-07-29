-- Funzione per contare utenti nei gruppi community bypassando RLS
CREATE OR REPLACE FUNCTION public.get_channel_user_count(channel_name_param text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM public.user_channel_subscriptions 
    WHERE channel_name = channel_name_param
  );
END;
$$;