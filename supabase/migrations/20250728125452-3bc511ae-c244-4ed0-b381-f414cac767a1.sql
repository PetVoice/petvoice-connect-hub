-- Create veterinary_contacts table
CREATE TABLE public.veterinary_contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  pet_id uuid NOT NULL,
  name text NOT NULL,
  clinic_name text NOT NULL,
  specialization text,
  phone text NOT NULL,
  email text,
  address text,
  emergency_available boolean DEFAULT false,
  notes text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.veterinary_contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for veterinary_contacts
CREATE POLICY "Users can view their veterinary contacts" 
ON public.veterinary_contacts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their veterinary contacts" 
ON public.veterinary_contacts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their veterinary contacts" 
ON public.veterinary_contacts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their veterinary contacts" 
ON public.veterinary_contacts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_veterinary_contacts_updated_at
BEFORE UPDATE ON public.veterinary_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();