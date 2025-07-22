-- Fix search_path security issue for reset_affiliation_system function
ALTER FUNCTION public.reset_affiliation_system() SET search_path = 'public', 'pg_temp';