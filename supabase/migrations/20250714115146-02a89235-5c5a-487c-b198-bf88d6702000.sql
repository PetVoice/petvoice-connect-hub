-- Add cancellation fields to subscribers table
ALTER TABLE public.subscribers 
ADD COLUMN cancellation_type TEXT CHECK (cancellation_type IN ('immediate', 'end_of_period')),
ADD COLUMN cancellation_date TIMESTAMPTZ,
ADD COLUMN cancellation_effective_date TIMESTAMPTZ,
ADD COLUMN is_cancelled BOOLEAN DEFAULT false;