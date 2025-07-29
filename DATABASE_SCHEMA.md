# Database Schema - PetVoice Connect Hub

## 🗄️ Panoramica Database

**Database Type**: PostgreSQL 15+ (Supabase Managed)  
**Security**: Row Level Security (RLS) abilitato su tutte le tabelle  
**Connection**: Pool connections con auto-scaling  
**Backup**: Automated daily backups with point-in-time recovery

## 📊 Schema Logico

```
Authentication Layer (Supabase Auth)
├── auth.users (managed by Supabase)
└── auth.sessions (managed by Supabase)

Application Layer (Public Schema)
├── User Management
│   ├── profiles
│   ├── user_roles
│   └── user_referrals
├── Pet Management
│   ├── pets
│   ├── diary_entries
│   ├── pet_analyses
│   ├── pet_wellness_scores
│   └── health_metrics
├── AI & Training
│   ├── ai_training_protocols
│   ├── ai_training_exercises
│   ├── ai_training_schedules
│   ├── ai_training_metrics
│   ├── ai_training_templates
│   ├── ai_suggested_protocols
│   ├── protocol_ratings
│   └── behavior_predictions
├── Calendar & Events
│   ├── calendar_events
│   ├── event_notifications
│   └── event_templates
├── Community
│   ├── community_channels
│   ├── community_messages
│   ├── community_notifications
│   ├── community_message_deletions
│   ├── private_chats
│   ├── private_messages
│   └── message_reports
├── Medical & Health
│   ├── medical_records
│   ├── medications
│   ├── insurance_policies
│   ├── emergency_contacts
│   ├── health_alerts
│   ├── health_risk_assessments
│   ├── health_data_sync
│   ├── early_warnings
│   ├── intervention_recommendations
│   └── care_approach_predictions
├── Business Logic
│   ├── subscribers
│   ├── referrals
│   ├── referral_commissions
│   ├── support_tickets
│   ├── support_ticket_replies
│   ├── support_ticket_unread_counts
│   ├── support_feature_requests
│   └── support_sla_config
├── Learning & Tutorial
│   ├── learning_paths
│   ├── lessons
│   └── lesson_completions
├── Notifications & Alerts
│   ├── ai_insights_notifications
│   └── local_alerts
└── System
    ├── activity_log
    ├── user_channel_subscriptions
    └── integrations
```

## 📋 Tabelle Principali

### 👤 User Management

#### `profiles`
```sql
CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  language TEXT DEFAULT 'it' CHECK (language IN ('it', 'en', 'es', 'fr', 'de')),
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  timezone TEXT,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
```

#### `user_roles`
```sql
CREATE TYPE app_role AS ENUM ('user', 'admin', 'moderator');

CREATE TABLE public.user_roles (
  user_id UUID REFERENCES auth.users(id),
  role app_role NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  PRIMARY KEY (user_id, role)
);
```

### 🐾 Pet Management

#### `pets`
```sql
CREATE TABLE public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'cane', 'gatto', 'uccello', etc.
  breed TEXT,
  age INTEGER CHECK (age >= 0 AND age <= 50),
  weight DECIMAL(5,2) CHECK (weight > 0 AND weight <= 1000),
  birth_date DATE CHECK (birth_date <= CURRENT_DATE),
  gender TEXT CHECK (gender IN ('maschio', 'femmina')),
  avatar_url TEXT,
  health_conditions TEXT[],
  personality_traits TEXT[],
  microchip_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers
CREATE TRIGGER validate_pet_data BEFORE INSERT OR UPDATE ON pets
  FOR EACH ROW EXECUTE FUNCTION validate_pet_data();
CREATE TRIGGER log_pet_activity AFTER INSERT OR UPDATE OR DELETE ON pets
  FOR EACH ROW EXECUTE FUNCTION log_pet_activity();
```

#### `diary_entries`
```sql
CREATE TABLE public.diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  pet_id UUID NOT NULL REFERENCES pets(id),
  entry_date DATE NOT NULL,
  title TEXT,
  content TEXT,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
  behavioral_tags TEXT[] DEFAULT '{}',
  photo_urls TEXT[] DEFAULT '{}',
  voice_note_url TEXT,
  temperature DECIMAL(4,1) CHECK (temperature >= 35 AND temperature <= 45),
  weather_condition TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_diary_entries_user_pet_date ON diary_entries(user_id, pet_id, entry_date);
CREATE INDEX idx_diary_entries_mood_score ON diary_entries(mood_score);
CREATE INDEX idx_diary_entries_behavioral_tags ON diary_entries USING GIN(behavioral_tags);
```

#### `pet_analyses`
```sql
CREATE TABLE public.pet_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  pet_id UUID NOT NULL REFERENCES pets(id),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('text') OR file_type LIKE 'audio/%' OR file_type LIKE 'video/%' OR file_type LIKE 'image/%'),
  storage_path TEXT,
  analysis_type TEXT NOT NULL,
  primary_emotion TEXT NOT NULL,
  primary_confidence DECIMAL(3,2) CHECK (primary_confidence >= 0 AND primary_confidence <= 1),
  emotion_scores JSONB NOT NULL DEFAULT '{}',
  behavioral_insights TEXT,
  recommendations TEXT[],
  analysis_duration INTEGER, -- milliseconds
  analysis_model TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Validation trigger
CREATE TRIGGER validate_pet_analysis BEFORE INSERT OR UPDATE ON pet_analyses
  FOR EACH ROW EXECUTE FUNCTION validate_pet_analysis();
```

### 🤖 AI & Training

#### `ai_training_protocols`
```sql
CREATE TABLE public.ai_training_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  pet_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  difficulty TEXT CHECK (difficulty IN ('principiante', 'intermedio', 'avanzato')),
  duration_days BIGINT,
  status TEXT CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
  current_day BIGINT DEFAULT 1,
  progress_percentage TEXT DEFAULT '0',
  target_behavior TEXT,
  required_materials JSONB,
  triggers JSONB,
  estimated_cost TEXT,
  ai_generated BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  success_rate BIGINT,
  community_rating DOUBLE PRECISION,
  community_usage TEXT DEFAULT '0',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ
);

-- Function for starting public protocols
CREATE OR REPLACE FUNCTION start_public_protocol(p_public_protocol_id UUID, p_user_id TEXT)
RETURNS UUID AS $$ ... $$;
```

#### `ai_training_exercises`
```sql
CREATE TABLE public.ai_training_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id UUID NOT NULL REFERENCES ai_training_protocols(id),
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER DEFAULT 15,
  exercise_type TEXT DEFAULT 'behavioral',
  level TEXT DEFAULT 'intermedio',
  instructions TEXT[],
  materials TEXT[],
  objectives TEXT[],
  success_criteria TEXT[],
  tips TEXT[],
  video_url TEXT,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  effectiveness_score INTEGER CHECK (effectiveness_score >= 1 AND effectiveness_score <= 5),
  feedback TEXT,
  photos TEXT[],
  voice_notes TEXT[],
  ai_analysis TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_exercises_protocol_day ON ai_training_exercises(protocol_id, day_number);
CREATE INDEX idx_exercises_completed ON ai_training_exercises(completed, completed_at);
```

#### `protocol_ratings`
```sql
CREATE TABLE public.protocol_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  protocol_id UUID NOT NULL REFERENCES ai_training_protocols(id),
  effectiveness_rating NUMERIC(2,1) CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 10),
  ease_rating NUMERIC(2,1) CHECK (ease_rating >= 1 AND ease_rating <= 10),
  improvement_rating NUMERIC(2,1) CHECK (improvement_rating >= 1 AND improvement_rating <= 10),
  overall_satisfaction NUMERIC(2,1) CHECK (overall_satisfaction >= 1 AND overall_satisfaction <= 10),
  rating NUMERIC(2,1) GENERATED ALWAYS AS ((effectiveness_rating + ease_rating + improvement_rating + overall_satisfaction) / 4) STORED,
  completion_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, protocol_id)
);

-- Trigger to update protocol success rates
CREATE TRIGGER update_protocol_success_rate_trigger 
  AFTER INSERT OR UPDATE OR DELETE ON protocol_ratings
  FOR EACH ROW EXECUTE FUNCTION update_protocol_success_rate();
```

### 📅 Calendar & Events

#### `calendar_events`
```sql
CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  pet_id UUID NOT NULL REFERENCES pets(id),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  is_all_day BOOLEAN DEFAULT false,
  category TEXT DEFAULT 'activity' CHECK (category IN ('activity', 'medical', 'training', 'grooming', 'social', 'travel')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  location TEXT,
  cost NUMERIC(10,2),
  attendees TEXT[],
  reminder_settings JSONB DEFAULT '{"times": ["24h", "2h"], "enabled": true}',
  recurring_pattern JSONB,
  notes TEXT,
  photo_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_calendar_events_user_pet ON calendar_events(user_id, pet_id);
CREATE INDEX idx_calendar_events_datetime ON calendar_events(start_time, end_time);
CREATE INDEX idx_calendar_events_category ON calendar_events(category);
```

### 💬 Community

#### `community_channels`
```sql
CREATE TABLE public.community_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  channel_type TEXT NOT NULL CHECK (channel_type IN ('species', 'breed', 'location', 'topic', 'support')),
  pet_type TEXT,
  breed TEXT,
  country_code TEXT,
  emoji TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `community_messages`
```sql
CREATE TABLE public.community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES community_channels(id),
  channel_name TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'voice', 'file')),
  file_url TEXT,
  voice_duration INTEGER,
  reply_to_id UUID REFERENCES community_messages(id),
  is_emergency BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  deleted_at TIMESTAMPTZ,
  deleted_by_all BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_community_messages_channel ON community_messages(channel_id, created_at);
CREATE INDEX idx_community_messages_channel_name ON community_messages(channel_name, created_at);
CREATE INDEX idx_community_messages_user ON community_messages(user_id, created_at);
```

#### `private_chats`
```sql
CREATE TABLE public.private_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id UUID NOT NULL REFERENCES auth.users(id),
  participant_2_id UUID NOT NULL REFERENCES auth.users(id),
  last_message_at TIMESTAMPTZ,
  deleted_by_participant_1 BOOLEAN DEFAULT false,
  deleted_by_participant_2 BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (participant_1_id != participant_2_id),
  UNIQUE(participant_1_id, participant_2_id)
);

-- Triggers for message management
CREATE TRIGGER auto_delete_messages_on_chat_deletion 
  AFTER UPDATE ON private_chats
  FOR EACH ROW EXECUTE FUNCTION auto_delete_messages_on_chat_deletion();
```

#### `private_messages`
```sql
CREATE TABLE public.private_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES private_chats(id),
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  recipient_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'voice', 'file')),
  file_url TEXT,
  voice_duration INTEGER,
  reply_to_id UUID REFERENCES private_messages(id),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  deleted_by_sender BOOLEAN DEFAULT false,
  deleted_by_recipient BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers
CREATE TRIGGER auto_reactivate_deleted_chat 
  AFTER INSERT ON private_messages
  FOR EACH ROW EXECUTE FUNCTION auto_reactivate_deleted_chat();
CREATE TRIGGER update_chat_last_message 
  AFTER INSERT ON private_messages
  FOR EACH ROW EXECUTE FUNCTION update_chat_last_message();
```

### 🏥 Medical & Health

#### `medical_records`
```sql
CREATE TABLE public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  pet_id UUID NOT NULL REFERENCES pets(id),
  record_type TEXT NOT NULL CHECK (record_type IN ('vaccination', 'checkup', 'surgery', 'treatment', 'emergency', 'diagnostic')),
  title TEXT NOT NULL,
  description TEXT,
  record_date DATE NOT NULL,
  veterinarian_id UUID,
  cost NUMERIC(10,2),
  document_url TEXT,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `medications`
```sql
CREATE TABLE public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  pet_id UUID NOT NULL REFERENCES pets(id),
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  administration_method TEXT,
  prescribing_vet UUID,
  side_effects TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  reminder_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `health_risk_assessments`
```sql
CREATE TABLE public.health_risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  pet_id UUID NOT NULL REFERENCES pets(id),
  overall_risk_score INTEGER NOT NULL CHECK (overall_risk_score >= 0 AND overall_risk_score <= 100),
  risk_categories JSONB NOT NULL DEFAULT '{}',
  risk_factors JSONB NOT NULL DEFAULT '{}',
  recommendations JSONB NOT NULL DEFAULT '{}',
  assessment_date DATE DEFAULT CURRENT_DATE,
  next_assessment_due DATE,
  trend_direction TEXT CHECK (trend_direction IN ('improving', 'stable', 'worsening')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, pet_id, assessment_date)
);

-- Trigger to update risk scores
CREATE TRIGGER update_risk_score_on_diary_change 
  AFTER INSERT OR UPDATE OR DELETE ON diary_entries
  FOR EACH ROW EXECUTE FUNCTION update_risk_score_on_diary_change();
```

### 💼 Business Logic

#### `subscribers`
```sql
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id),
  stripe_customer_id TEXT UNIQUE,
  subscription_plan TEXT NOT NULL DEFAULT 'free' CHECK (subscription_plan IN ('free', 'premium', 'pro')),
  subscription_status TEXT NOT NULL DEFAULT 'free' CHECK (subscription_status IN ('free', 'active', 'past_due', 'cancelled', 'incomplete')),
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  max_pets_allowed INTEGER DEFAULT 1,
  is_cancelled BOOLEAN DEFAULT false,
  cancellation_type TEXT CHECK (cancellation_type IN ('immediate', 'end_of_period')),
  cancellation_date TIMESTAMPTZ,
  cancellation_effective_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Functions
CREATE OR REPLACE FUNCTION get_user_subscription(p_user_id UUID)
RETURNS TABLE(...) AS $$ ... $$;
CREATE OR REPLACE FUNCTION reactivate_user_subscription(p_user_id UUID)
RETURNS BOOLEAN AS $$ ... $$;
```

#### `support_tickets`
```sql
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('technical', 'billing', 'feature_request', 'bug_report', 'general')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  sla_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

-- Triggers
CREATE TRIGGER set_ticket_number_trigger 
  BEFORE INSERT ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION set_ticket_number();
CREATE TRIGGER set_sla_deadline_trigger 
  BEFORE INSERT ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION set_sla_deadline();
```

## 🔧 Database Functions

### Core Functions

```sql
-- User management
CREATE OR REPLACE FUNCTION handle_new_user_simple() RETURNS TRIGGER;
CREATE OR REPLACE FUNCTION generate_referral_on_profile_creation() RETURNS TRIGGER;
CREATE OR REPLACE FUNCTION normalize_profile_data() RETURNS TRIGGER;

-- Pet management  
CREATE OR REPLACE FUNCTION validate_pet_data() RETURNS TRIGGER;
CREATE OR REPLACE FUNCTION log_pet_activity() RETURNS TRIGGER;
CREATE OR REPLACE FUNCTION calculate_wellness_score() RETURNS TRIGGER;

-- Analysis
CREATE OR REPLACE FUNCTION log_analysis_activity() RETURNS TRIGGER;
CREATE OR REPLACE FUNCTION validate_pet_analysis() RETURNS TRIGGER;

-- Training protocols
CREATE OR REPLACE FUNCTION start_public_protocol(UUID, TEXT) RETURNS UUID;
CREATE OR REPLACE FUNCTION calculate_protocol_success_rate(UUID) RETURNS NUMERIC;
CREATE OR REPLACE FUNCTION update_protocol_success_rate() RETURNS TRIGGER;

-- Health & risk assessment
CREATE OR REPLACE FUNCTION calculate_pet_risk_score(UUID, UUID) RETURNS INTEGER;
CREATE OR REPLACE FUNCTION update_risk_score_on_diary_change() RETURNS TRIGGER;

-- Support system
CREATE OR REPLACE FUNCTION generate_ticket_number() RETURNS TEXT;
CREATE OR REPLACE FUNCTION calculate_sla_deadline(TEXT, TEXT) RETURNS TIMESTAMPTZ;

-- Messaging
CREATE OR REPLACE FUNCTION auto_delete_messages_on_chat_deletion() RETURNS TRIGGER;
CREATE OR REPLACE FUNCTION auto_reactivate_deleted_chat() RETURNS TRIGGER;
CREATE OR REPLACE FUNCTION update_chat_last_message() RETURNS TRIGGER;

-- Utilities
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER;
CREATE OR REPLACE FUNCTION cleanup_old_data() RETURNS TRIGGER;
```

## 🔒 Row Level Security (RLS)

Ogni tabella implementa policies RLS specifiche:

### Standard User Policies
```sql
-- Self-access pattern (profiles, diary_entries, pets, etc.)
CREATE POLICY "Users can view own data" ON table_name FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own data" ON table_name FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data" ON table_name FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own data" ON table_name FOR DELETE 
USING (auth.uid() = user_id);
```

### Community Policies
```sql
-- Channel subscription based access
CREATE POLICY "Users can view messages in subscribed channels" ON community_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_channel_subscriptions 
    WHERE user_id = auth.uid() AND channel_id = community_messages.channel_id
  )
);
```

### Public Data Policies
```sql
-- Public templates and learning content
CREATE POLICY "Everyone can view active content" ON table_name FOR SELECT
USING (is_active = true);
```

## 📈 Performance Optimization

### Indexes

```sql
-- User-specific queries
CREATE INDEX idx_table_user_id ON table_name(user_id);
CREATE INDEX idx_table_user_pet ON table_name(user_id, pet_id);

-- Time-based queries  
CREATE INDEX idx_table_created_at ON table_name(created_at);
CREATE INDEX idx_table_date_range ON table_name(start_date, end_date);

-- Search optimization
CREATE INDEX idx_messages_content_search ON community_messages USING gin(to_tsvector('english', content));
CREATE INDEX idx_pets_breed_type ON pets(type, breed);

-- JSONB queries
CREATE INDEX idx_table_jsonb_field ON table_name USING gin((jsonb_field));
CREATE INDEX idx_diary_behavioral_tags ON diary_entries USING gin(behavioral_tags);
```

### Query Optimization

```sql
-- Materialized views for complex aggregations
CREATE MATERIALIZED VIEW mv_pet_wellness_summary AS
SELECT 
  pet_id,
  user_id,
  AVG(mood_score) as avg_mood,
  COUNT(*) as total_entries,
  MAX(entry_date) as last_entry
FROM diary_entries 
WHERE entry_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY pet_id, user_id;

-- Refresh strategy
CREATE OR REPLACE FUNCTION refresh_wellness_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_pet_wellness_summary;
END;
$$ LANGUAGE plpgsql;
```

## 🧹 Maintenance

### Cleanup Procedures

```sql
-- Automatic cleanup of old data
CREATE OR REPLACE FUNCTION cleanup_old_data() RETURNS void AS $$
BEGIN
  -- Remove old activity logs (>1 year)
  DELETE FROM activity_log WHERE created_at < NOW() - INTERVAL '1 year';
  
  -- Archive old analyses (>2 years, low confidence)
  DELETE FROM pet_analyses 
  WHERE created_at < NOW() - INTERVAL '2 years' 
    AND primary_confidence < 0.7;
    
  -- Clean soft-deleted messages (>30 days)
  DELETE FROM private_messages 
  WHERE deleted_at < NOW() - INTERVAL '30 days'
    AND deleted_by_sender = true 
    AND deleted_by_recipient = true;
END;
$$ LANGUAGE plpgsql;

-- Scheduled via pg_cron
SELECT cron.schedule('cleanup-old-data', '0 2 * * 0', 'SELECT cleanup_old_data();');
```

### Monitoring Queries

```sql
-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Active connections
SELECT 
  state,
  COUNT(*) 
FROM pg_stat_activity 
WHERE datname = current_database()
GROUP BY state;

-- Slow queries
SELECT 
  query,
  mean_exec_time,
  calls,
  total_exec_time
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

---

**Schema Version**: 2.0.0  
**Last Updated**: January 2025  
**Total Tables**: 50+  
**Total Functions**: 35+  
**Storage Buckets**: 4