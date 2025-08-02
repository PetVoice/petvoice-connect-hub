-- Remove subscription-related columns from profiles (safe with IF EXISTS)
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