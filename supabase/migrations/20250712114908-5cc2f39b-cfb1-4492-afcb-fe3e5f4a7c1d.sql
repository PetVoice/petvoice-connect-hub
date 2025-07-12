-- Create comprehensive health monitoring tables for PetVoice wellness page

-- Veterinarian Information
CREATE TABLE public.veterinarians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  clinic_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  specialization TEXT,
  is_primary BOOLEAN DEFAULT false,
  vet_type TEXT DEFAULT 'primary' CHECK (vet_type IN ('primary', 'specialist', 'emergency')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Medical Records
CREATE TABLE public.medical_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pet_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  record_type TEXT NOT NULL CHECK (record_type IN ('vaccination', 'exam', 'treatment', 'lab_work', 'surgery', 'emergency', 'medication', 'other')),
  document_url TEXT,
  record_date DATE NOT NULL,
  veterinarian_id UUID,
  cost NUMERIC,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Health Metrics Tracking
CREATE TABLE public.health_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pet_id UUID NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('weight', 'temperature', 'heart_rate', 'appetite', 'sleep', 'activity', 'behavior')),
  value NUMERIC NOT NULL,
  unit TEXT,
  notes TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Medications Management
CREATE TABLE public.medications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pet_id UUID NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  administration_method TEXT,
  prescribing_vet UUID,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  side_effects TEXT,
  notes TEXT,
  reminder_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Symptoms Tracking
CREATE TABLE public.symptoms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pet_id UUID NOT NULL,
  symptom_name TEXT NOT NULL,
  severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 10),
  description TEXT,
  duration_hours INTEGER,
  observed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  related_medication_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insurance Information
CREATE TABLE public.pet_insurance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pet_id UUID NOT NULL,
  provider_name TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  policy_type TEXT,
  coverage_details JSONB,
  premium_amount NUMERIC,
  deductible NUMERIC,
  start_date DATE NOT NULL,
  end_date DATE,
  contact_info JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Emergency Contacts
CREATE TABLE public.emergency_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  is_primary BOOLEAN DEFAULT false,
  contact_type TEXT DEFAULT 'family' CHECK (contact_type IN ('family', 'friend', 'vet', 'emergency_vet', 'poison_control')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Health Alerts
CREATE TABLE public.health_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pet_id UUID NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('weight_change', 'behavior_change', 'medication_due', 'vet_appointment', 'vaccination_due', 'symptom_worsening')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  is_read BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies
ALTER TABLE public.veterinarians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for veterinarians
CREATE POLICY "Users can manage their veterinarians" ON public.veterinarians FOR ALL USING (auth.uid() = user_id);

-- RLS policies for medical_records
CREATE POLICY "Users can manage their pet medical records" ON public.medical_records FOR ALL USING (auth.uid() = user_id);

-- RLS policies for health_metrics
CREATE POLICY "Users can manage their pet health metrics" ON public.health_metrics FOR ALL USING (auth.uid() = user_id);

-- RLS policies for medications
CREATE POLICY "Users can manage their pet medications" ON public.medications FOR ALL USING (auth.uid() = user_id);

-- RLS policies for symptoms
CREATE POLICY "Users can manage their pet symptoms" ON public.symptoms FOR ALL USING (auth.uid() = user_id);

-- RLS policies for pet_insurance
CREATE POLICY "Users can manage their pet insurance" ON public.pet_insurance FOR ALL USING (auth.uid() = user_id);

-- RLS policies for emergency_contacts
CREATE POLICY "Users can manage their emergency contacts" ON public.emergency_contacts FOR ALL USING (auth.uid() = user_id);

-- RLS policies for health_alerts
CREATE POLICY "Users can manage their health alerts" ON public.health_alerts FOR ALL USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_veterinarians_updated_at
  BEFORE UPDATE ON public.veterinarians
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON public.medical_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON public.medications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pet_insurance_updated_at
  BEFORE UPDATE ON public.pet_insurance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at
  BEFORE UPDATE ON public.emergency_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key references where appropriate
ALTER TABLE public.medical_records ADD CONSTRAINT fk_medical_records_veterinarian 
  FOREIGN KEY (veterinarian_id) REFERENCES public.veterinarians(id) ON DELETE SET NULL;

ALTER TABLE public.medications ADD CONSTRAINT fk_medications_prescribing_vet 
  FOREIGN KEY (prescribing_vet) REFERENCES public.veterinarians(id) ON DELETE SET NULL;

ALTER TABLE public.symptoms ADD CONSTRAINT fk_symptoms_related_medication 
  FOREIGN KEY (related_medication_id) REFERENCES public.medications(id) ON DELETE SET NULL;

-- Add indexes for better performance
CREATE INDEX idx_medical_records_pet_id ON public.medical_records(pet_id);
CREATE INDEX idx_medical_records_date ON public.medical_records(record_date DESC);
CREATE INDEX idx_health_metrics_pet_id ON public.health_metrics(pet_id);
CREATE INDEX idx_health_metrics_recorded_at ON public.health_metrics(recorded_at DESC);
CREATE INDEX idx_medications_pet_id ON public.medications(pet_id);
CREATE INDEX idx_medications_active ON public.medications(is_active) WHERE is_active = true;
CREATE INDEX idx_symptoms_pet_id ON public.symptoms(pet_id);
CREATE INDEX idx_symptoms_observed_at ON public.symptoms(observed_at DESC);
CREATE INDEX idx_health_alerts_user_id ON public.health_alerts(user_id);
CREATE INDEX idx_health_alerts_unread ON public.health_alerts(is_read) WHERE is_read = false;