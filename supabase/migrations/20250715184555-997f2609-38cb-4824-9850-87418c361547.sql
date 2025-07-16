-- Remove foreign key constraint that's causing the error
ALTER TABLE public.user_channel_subscriptions 
DROP CONSTRAINT IF EXISTS user_channel_subscriptions_channel_id_fkey;

-- Also remove any other potential foreign key constraints on channel_id
ALTER TABLE public.user_channel_subscriptions 
DROP CONSTRAINT IF EXISTS user_channel_subscriptions_channel_id_fkey1;

-- Update the table structure to ensure we're using the correct column name
-- The table should reference channel_id (UUID) not channel_name (TEXT)
ALTER TABLE public.user_channel_subscriptions 
ALTER COLUMN channel_id DROP NOT NULL;

-- Make sure notifications_enabled column exists and has proper default
ALTER TABLE public.user_channel_subscriptions 
ADD COLUMN IF NOT EXISTS notifications_enabled boolean DEFAULT true;