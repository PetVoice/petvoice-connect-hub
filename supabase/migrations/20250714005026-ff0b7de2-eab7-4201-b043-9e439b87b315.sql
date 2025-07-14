-- Remove the restrictive check constraint on medical_records record_type
ALTER TABLE public.medical_records DROP CONSTRAINT medical_records_record_type_check;

-- Add a new check constraint with both English and Italian values allowed
ALTER TABLE public.medical_records 
ADD CONSTRAINT medical_records_record_type_check 
CHECK (record_type IN (
  'visit', 'visita',
  'exam', 'esame', 
  'vaccination', 'vaccino',
  'surgery', 'operazione', 'chirurgia',
  'document', 'documento',
  'treatment', 'trattamento',
  'lab_work', 'analisi',
  'emergency', 'emergenza',
  'medication', 'farmaco',
  'other', 'altro'
));