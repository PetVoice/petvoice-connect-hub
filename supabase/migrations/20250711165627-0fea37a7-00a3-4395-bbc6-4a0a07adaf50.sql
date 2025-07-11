-- Remove the duplicate function and recreate the correct one
DROP FUNCTION IF EXISTS public.delete_user_account();
DROP FUNCTION IF EXISTS public.delete_user_account(uuid);

-- Recreate the function with proper implementation and search_path
CREATE OR REPLACE FUNCTION public.delete_user_account(user_id_to_delete uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete all user-related data
  DELETE FROM public.profiles WHERE user_id = user_id_to_delete;
  DELETE FROM public.pets WHERE user_id = user_id_to_delete;
  DELETE FROM public.pet_analyses WHERE user_id = user_id_to_delete;
  DELETE FROM public.diary_entries WHERE user_id = user_id_to_delete;
  DELETE FROM public.pet_wellness_scores WHERE user_id = user_id_to_delete;
  DELETE FROM public.activity_log WHERE user_id = user_id_to_delete;
  DELETE FROM public.subscribers WHERE user_id = user_id_to_delete;
  
  -- Note: Actual auth user deletion would need to be handled through admin API
  -- This function just cleans up the associated data
END;
$$;