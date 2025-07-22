-- Fix the 3 remaining functions without search_path
ALTER FUNCTION public.auto_delete_messages_on_chat_deletion() SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.delete_user_account() SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.calculate_wellness_score() SET search_path = 'public', 'pg_temp';