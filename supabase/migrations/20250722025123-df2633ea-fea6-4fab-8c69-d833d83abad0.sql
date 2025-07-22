-- Fix remaining functions without search_path
ALTER FUNCTION public.update_learning_progress() SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.handle_new_user_simple() SET search_path = 'public', 'pg_temp';  
ALTER FUNCTION public.sync_user_display_names() SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.auto_delete_messages_on_chat_deletion() SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.delete_user_account() SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.log_analysis_activity() SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.normalize_email() SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.log_pet_activity() SET search_path = '';
ALTER FUNCTION public.log_diary_activity() SET search_path = '';
ALTER FUNCTION public.validate_pet_data() SET search_path = '';