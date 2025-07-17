-- Add privacy preference columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN community_participation boolean DEFAULT true,
ADD COLUMN analytics_contribution boolean DEFAULT true,
ADD COLUMN marketing_communications boolean DEFAULT false,
ADD COLUMN third_party_sharing boolean DEFAULT false;

-- Add comment to describe the new columns
COMMENT ON COLUMN public.profiles.community_participation IS 'Allow participation in community features';
COMMENT ON COLUMN public.profiles.analytics_contribution IS 'Allow contributing anonymous data for analytics';
COMMENT ON COLUMN public.profiles.marketing_communications IS 'Allow receiving marketing communications';
COMMENT ON COLUMN public.profiles.third_party_sharing IS 'Allow sharing data with selected third parties';