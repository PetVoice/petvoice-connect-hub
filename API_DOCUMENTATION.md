# API Documentation - PetVoice Connect Hub

## 🔌 Panoramica API

PetVoice Connect Hub utilizza **Supabase** come backend principale, fornendo:

- **Database REST API**: Accesso diretto alle tabelle tramite PostgREST
- **Edge Functions**: Logica personalizzata serverless  
- **Realtime API**: WebSocket per aggiornamenti in tempo reale
- **Auth API**: Gestione autenticazione e autorizzazione
- **Storage API**: Upload e gestione file

**Base URL**: `https://unwxkufzauulzhmjxxqi.supabase.co`

## 🔐 Autenticazione

Tutte le API richiedono autenticazione tramite **JWT Bearer Token**.

```typescript
// Client configuration
const supabase = createClient(
  'https://unwxkufzauulzhmjxxqi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVud3hrdWZ6YXV1bHpobWp4eHFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMDcwMTIsImV4cCI6MjA2NzU4MzAxMn0.QfjmWCFEIaHzeYy0Z1gROZQchzqcCCo9In4ayqR3cXw'
);

// Automatic auth headers
const { data, error } = await supabase
  .from('table_name')
  .select('*');
```

## 📋 Database REST API

### Core Entities

#### 1. **Profiles** (`/rest/v1/profiles`)

```typescript
interface Profile {
  user_id: string;
  display_name: string;
  email: string;
  avatar_url?: string;
  language: 'it' | 'en' | 'es';
  theme: 'light' | 'dark' | 'system';
  timezone?: string;
  referral_code?: string;
  referred_by?: string;
  created_at: string;
  updated_at: string;
}

// GET /rest/v1/profiles?user_id=eq.{user_id}
// POST /rest/v1/profiles
// PATCH /rest/v1/profiles?user_id=eq.{user_id}
```

#### 2. **Pets** (`/rest/v1/pets`)

```typescript
interface Pet {
  id: string;
  user_id: string;
  name: string;
  type: string; // 'cane', 'gatto', etc.
  breed?: string;
  age?: number;
  weight?: number;
  birth_date?: string;
  gender?: 'maschio' | 'femmina';
  avatar_url?: string;
  health_conditions?: string[];
  personality_traits?: string[];
  created_at: string;
  updated_at: string;
}

// GET /rest/v1/pets?user_id=eq.{user_id}
// POST /rest/v1/pets
// PATCH /rest/v1/pets?id=eq.{pet_id}
// DELETE /rest/v1/pets?id=eq.{pet_id}
```

#### 3. **Diary Entries** (`/rest/v1/diary_entries`)

```typescript
interface DiaryEntry {
  id: string;
  user_id: string;
  pet_id: string;
  entry_date: string;
  title?: string;
  content?: string;
  mood_score?: number; // 1-10
  behavioral_tags?: string[];
  photo_urls?: string[];
  voice_note_url?: string;
  temperature?: number;
  weather_condition?: string;
  created_at: string;
  updated_at: string;
}

// GET /rest/v1/diary_entries?user_id=eq.{user_id}&pet_id=eq.{pet_id}
// POST /rest/v1/diary_entries
// PATCH /rest/v1/diary_entries?id=eq.{diary_id}
// DELETE /rest/v1/diary_entries?id=eq.{diary_id}
```

#### 4. **Pet Analyses** (`/rest/v1/pet_analyses`)

```typescript
interface PetAnalysis {
  id: string;
  user_id: string;
  pet_id: string;
  file_name: string;
  file_type: 'audio' | 'video' | 'image' | 'text';
  storage_path?: string;
  analysis_type: string;
  primary_emotion: string;
  primary_confidence: number; // 0-1
  emotion_scores: Record<string, number>;
  behavioral_insights?: string;
  recommendations?: string[];
  analysis_duration?: number;
  analysis_model: string;
  created_at: string;
}

// GET /rest/v1/pet_analyses?user_id=eq.{user_id}
// POST /rest/v1/pet_analyses (usually via Edge Function)
```

#### 5. **Calendar Events** (`/rest/v1/calendar_events`)

```typescript
interface CalendarEvent {
  id: string;
  user_id: string;
  pet_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  is_all_day: boolean;
  category: 'activity' | 'medical' | 'training' | 'grooming';
  status: 'scheduled' | 'completed' | 'cancelled';
  location?: string;
  cost?: number;
  reminder_settings: {
    enabled: boolean;
    times: string[]; // ['24h', '2h', '30m']
  };
  recurring_pattern?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number;
    end_date?: string;
  };
  created_at: string;
  updated_at: string;
}
```

### Advanced Querying

```typescript
// Filtering & Sorting
const { data } = await supabase
  .from('diary_entries')
  .select('*')
  .eq('pet_id', petId)
  .gte('entry_date', startDate)
  .lte('entry_date', endDate)
  .order('entry_date', { ascending: false })
  .limit(20);

// Joins
const { data } = await supabase
  .from('pets')
  .select(`
    *,
    diary_entries(
      entry_date,
      mood_score,
      behavioral_tags
    )
  `)
  .eq('user_id', userId);

// Aggregations  
const { data } = await supabase
  .rpc('calculate_avg_mood', { 
    pet_id: petId,
    days: 7 
  });
```

## ⚡ Edge Functions

### 1. **analyze-pet-behavior**

Analizza comportamento animale da audio, video o testo.

```typescript
// POST /functions/v1/analyze-pet-behavior
interface AnalysisRequest {
  petId: string;
  fileName: string;
  fileType: 'audio' | 'video' | 'text';
  analysisType: 'emotion' | 'behavior' | 'health';
  content?: string; // Per analisi testo
  storageUrl?: string; // Per file media
}

interface AnalysisResponse {
  analysisId: string;
  primaryEmotion: string;
  confidence: number;
  emotionScores: Record<string, number>;
  insights: string;
  recommendations: string[];
  processingTime: number;
}

// Usage
const { data, error } = await supabase.functions.invoke('analyze-pet-behavior', {
  body: {
    petId: '123',
    fileName: 'bark_recording.wav',
    fileType: 'audio',
    analysisType: 'emotion',
    storageUrl: 'storage/audio/bark_recording.wav'
  }
});
```

### 2. **analyze-pet-image**

Computer vision per analisi immagini animali.

```typescript
// POST /functions/v1/analyze-pet-image
interface ImageAnalysisRequest {
  petId: string;
  imageUrl: string;
  analysisTypes: ('posture' | 'emotion' | 'health' | 'activity')[];
}

interface ImageAnalysisResponse {
  detectedObjects: Array<{
    label: string;
    confidence: number;
    boundingBox: [number, number, number, number];
  }>;
  postureAnalysis: {
    posture: string;
    confidence: number;
    indicators: string[];
  };
  emotionalState: {
    emotion: string;
    confidence: number;
  };
  recommendations: string[];
}
```

### 3. **get-weather**

Recupera dati meteo per contest analysis.

```typescript
// POST /functions/v1/get-weather
interface WeatherRequest {
  latitude: number;
  longitude: number;
  date?: string; // ISO date, default: today
}

interface WeatherResponse {
  current: {
    temperature: number;
    humidity: number;
    pressure: number;
    condition: string;
    windSpeed: number;
  };
  forecast?: Array<{
    date: string;
    maxTemp: number;
    minTemp: number;
    condition: string;
  }>;
}
```

### 4. **find-nearby-vets**

Ricerca veterinari nelle vicinanze.

```typescript
// POST /functions/v1/find-nearby-vets
interface VetSearchRequest {
  latitude: number;
  longitude: number;
  radius?: number; // km, default: 10
  specialty?: string;
  emergency?: boolean;
}

interface VetSearchResponse {
  veterinarians: Array<{
    id: string;
    name: string;
    address: string;
    phone: string;
    rating: number;
    distance: number;
    isOpen: boolean;
    specialties: string[];
    emergency24h: boolean;
  }>;
}
```

### 5. **ai-assistance**

Assistente AI generale per consigli.

```typescript
// POST /functions/v1/ai-assistance
interface AssistanceRequest {
  petId: string;
  query: string;
  context?: {
    recentDiaryEntries?: DiaryEntry[];
    petInfo?: Pet;
    recentAnalyses?: PetAnalysis[];
  };
}

interface AssistanceResponse {
  response: string;
  suggestions: string[];
  resources: Array<{
    title: string;
    url: string;
    type: 'article' | 'video' | 'contact';
  }>;
  followUpQuestions: string[];
}
```

### 6. **Subscription Management**

#### check-subscription
```typescript
// POST /functions/v1/check-subscription
interface SubscriptionStatus {
  isActive: boolean;
  plan: 'free' | 'premium' | 'pro';
  features: string[];
  expiresAt?: string;
  maxPets: number;
}
```

#### create-checkout
```typescript
// POST /functions/v1/create-checkout
interface CheckoutRequest {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

interface CheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
}
```

## 📡 Realtime API

Sottoscrizioni WebSocket per aggiornamenti in tempo reale.

```typescript
// Subscribe to changes
const subscription = supabase
  .channel('diary-changes')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'diary_entries',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('New diary entry:', payload.new);
    }
  )
  .subscribe();

// Community messages
const communitySubscription = supabase
  .channel('community-messages')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public', 
      table: 'community_messages',
      filter: `channel_name=eq.${channelName}`
    },
    handleNewMessage
  )
  .subscribe();
```

## 📁 Storage API

Gestione upload e download file.

```typescript
// Upload file
const { data, error } = await supabase.storage
  .from('pet-photos')
  .upload(`${userId}/${petId}/${fileName}`, file, {
    contentType: file.type,
    upsert: false
  });

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('pet-photos')
  .getPublicUrl(filePath);

// Download file
const { data, error } = await supabase.storage
  .from('analysis-files')
  .download(filePath);
```

### Storage Buckets

- **pet-photos**: Foto profilo animali e album
- **analysis-files**: File per analisi AI (audio, video)
- **user-avatars**: Avatar utenti
- **document-storage**: Documenti medici e certificati

## 🔄 Rate Limiting

### Database API
- **SELECT**: 1000 req/min per utente
- **INSERT/UPDATE/DELETE**: 100 req/min per utente

### Edge Functions
- **AI Analysis**: 10 req/min per utente
- **Other Functions**: 60 req/min per utente

### Storage API
- **Upload**: 50 files/min per utente (max 10MB/file)
- **Download**: 200 req/min per utente

## 📊 Error Handling

### Standard Error Format

```typescript
interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// Example error responses
{
  "error": {
    "message": "duplicate key value violates unique constraint",
    "details": "Key (email)=(user@example.com) already exists.",
    "code": "23505"
  }
}
```

### Common Error Codes

- **400**: Bad Request - Invalid parameters
- **401**: Unauthorized - Invalid/missing auth token
- **403**: Forbidden - RLS policy violation
- **404**: Not Found - Resource doesn't exist
- **409**: Conflict - Duplicate resource
- **422**: Unprocessable Entity - Validation errors
- **429**: Too Many Requests - Rate limit exceeded
- **500**: Internal Server Error - Server issue

## 🔍 Testing & Debugging

### Testing Endpoints

```bash
# Using curl with auth
curl -X GET 'https://unwxkufzauulzhmjxxqi.supabase.co/rest/v1/pets' \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "apikey: YOUR_ANON_KEY"

# Test Edge Function
curl -X POST 'https://unwxkufzauulzhmjxxqi.supabase.co/functions/v1/get-weather' \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"latitude": 45.4642, "longitude": 9.1900}'
```

### Debug Headers

Include per debugging dettagliato:

```typescript
const { data, error } = await supabase
  .from('table')
  .select('*', { 
    headers: { 
      'X-Debug': 'true',
      'X-Trace-Id': 'unique-request-id'
    }
  });
```

---

**Versione API**: v1  
**Ultimo aggiornamento**: Gennaio 2025  
**Supporto**: [Supabase Dashboard](https://supabase.com/dashboard/project/unwxkufzauulzhmjxxqi)