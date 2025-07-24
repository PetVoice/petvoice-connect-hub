-- Aggiungo campi per tutte le impostazioni mancanti
ALTER TABLE public.profiles ADD COLUMN appearance_settings JSONB DEFAULT '{
  "timezone": "Europe/Rome",
  "dateFormat": "dd/MM/yyyy", 
  "timeFormat": "24h",
  "language": "it",
  "fontSize": "medium",
  "animations": true
}'::jsonb;

ALTER TABLE public.profiles ADD COLUMN data_management_settings JSONB DEFAULT '{
  "autoBackup": true,
  "backupFrequency": "daily",
  "retentionPeriod": "2years", 
  "crossDeviceSync": true
}'::jsonb;

ALTER TABLE public.profiles ADD COLUMN accessibility_settings JSONB DEFAULT '{
  "screenReader": false,
  "highContrast": false,
  "fontSize": "medium",
  "animations": true
}'::jsonb;