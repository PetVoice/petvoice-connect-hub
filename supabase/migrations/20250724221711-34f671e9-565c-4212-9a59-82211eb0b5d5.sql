ALTER TABLE public.profiles ADD COLUMN notification_settings JSONB DEFAULT '{
  "push": {
    "healthAlerts": true,
    "appointments": true,
    "community": true,
    "analysis": true,
    "achievements": true,
    "system": true
  },
  "email": {
    "healthAlerts": true,
    "appointments": true,
    "community": false,
    "analysis": true,
    "achievements": false,
    "system": true,
    "newsletter": false,
    "marketing": false
  },
  "frequency": "realtime"
}'::jsonb;