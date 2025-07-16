-- Fix RLS policy for user_onboarding table
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own onboarding records
CREATE POLICY "Users can manage their own onboarding" ON user_onboarding
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);