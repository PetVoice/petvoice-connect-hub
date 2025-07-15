-- Fix profiles table to have unique constraint on user_id
-- This is needed for the ON CONFLICT clause in handle_new_user_no_subscription function

-- Add unique constraint on user_id in profiles table
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);