-- Remove all subscription-related tables and functions
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS stripe_customers CASCADE;
DROP TABLE IF EXISTS payment_history CASCADE;

-- Remove subscription-related columns from profiles
ALTER TABLE profiles 
DROP COLUMN IF EXISTS subscription_status,
DROP COLUMN IF EXISTS subscription_plan,
DROP COLUMN IF EXISTS subscription_start_date,
DROP COLUMN IF EXISTS subscription_end_date,
DROP COLUMN IF EXISTS trial_end_date,
DROP COLUMN IF EXISTS cancellation_date,
DROP COLUMN IF EXISTS cancellation_type,
DROP COLUMN IF EXISTS is_cancelled,
DROP COLUMN IF EXISTS stripe_customer_id;

-- Remove subscription-related functions
DROP FUNCTION IF EXISTS handle_subscription_created CASCADE;
DROP FUNCTION IF EXISTS handle_subscription_updated CASCADE;
DROP FUNCTION IF EXISTS handle_subscription_deleted CASCADE;
DROP FUNCTION IF EXISTS get_user_subscription CASCADE;
DROP FUNCTION IF EXISTS check_subscription_status CASCADE;

-- Update handle_new_user function to remove subscription logic
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    display_name,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove subscription-related storage buckets
DELETE FROM storage.buckets WHERE id IN ('payment-receipts', 'subscription-docs');

-- Remove subscription-related storage policies
DELETE FROM storage.policies WHERE bucket_id IN ('payment-receipts', 'subscription-docs');

-- Clean up any subscription-related triggers
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
DROP TRIGGER IF EXISTS subscription_status_update ON user_subscriptions;