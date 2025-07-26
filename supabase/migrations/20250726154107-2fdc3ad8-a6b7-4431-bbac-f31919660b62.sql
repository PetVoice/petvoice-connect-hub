-- Add evaluation fields to pet_medications table
ALTER TABLE public.pet_medications 
ADD COLUMN has_been_evaluated BOOLEAN DEFAULT FALSE,
ADD COLUMN effectiveness_rating TEXT DEFAULT NULL;