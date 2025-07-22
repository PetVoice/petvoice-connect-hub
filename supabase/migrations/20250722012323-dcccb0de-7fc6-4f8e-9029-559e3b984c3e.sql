-- Fix security warnings: Set search_path for all functions
ALTER FUNCTION public.generate_ticket_number() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.set_ticket_number() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.calculate_protocol_success_rate(uuid) SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.get_protocol_ratings_count(uuid) SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.update_chat_last_message() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.calculate_sla_deadline(text, text) SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.set_sla_deadline() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.auto_reactivate_deleted_chat() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.delete_user_account() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.update_protocol_success_rate() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.auto_delete_messages_on_chat_deletion() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.log_analysis_activity() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.calculate_pet_risk_score(uuid, uuid) SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.update_risk_score_on_diary_change() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.validate_pet_analysis() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.convert_referral_on_payment(text) SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.handle_payment_simple() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.delete_user_account(uuid) SET search_path TO 'public', 'pg_temp';