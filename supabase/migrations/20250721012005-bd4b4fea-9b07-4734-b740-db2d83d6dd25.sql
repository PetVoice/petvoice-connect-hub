-- Add policy to allow viewing all pets for matching purposes
-- This is needed for the Pet Matching feature to work
CREATE POLICY "Users can view all pets for matching" 
ON public.pets 
FOR SELECT 
USING (true);

-- Note: This allows users to see all pets, which is necessary for:
-- 1. Pet matching functionality
-- 2. Community features
-- 3. Finding potential pet twins
-- The pets table doesn't contain sensitive personal data, only pet information