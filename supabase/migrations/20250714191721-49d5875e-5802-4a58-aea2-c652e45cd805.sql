-- Fix activity_log table to allow NULL pet_id for referral activities
ALTER TABLE public.activity_log ALTER COLUMN pet_id DROP NOT NULL;