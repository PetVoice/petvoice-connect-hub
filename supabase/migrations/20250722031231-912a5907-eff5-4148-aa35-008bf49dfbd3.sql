-- Fix search_path security issue for execute_affiliation_reset function
ALTER FUNCTION public.execute_affiliation_reset() SET search_path = 'public', 'pg_temp';