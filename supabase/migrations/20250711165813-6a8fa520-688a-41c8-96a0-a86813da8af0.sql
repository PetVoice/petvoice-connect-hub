-- Add new columns to pets table
ALTER TABLE public.pets 
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS allergies TEXT,
ADD COLUMN IF NOT EXISTS fears TEXT,
ADD COLUMN IF NOT EXISTS favorite_activities TEXT,
ADD COLUMN IF NOT EXISTS health_conditions TEXT,
ADD COLUMN IF NOT EXISTS personality_traits TEXT;