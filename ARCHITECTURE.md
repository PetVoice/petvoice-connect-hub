# Architettura PetVoice Connect Hub

## 🏗️ Panoramica Architetturale

PetVoice Connect Hub segue un'architettura moderna **JAMstack** con backend serverless, ottimizzata per scalabilità e performance.

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Supabase      │    │  External APIs  │
│   React + TS    │◄──►│   Backend        │◄──►│   (AI, Maps,    │
│   (Lovable)     │    │   (PostgreSQL)   │    │   Weather, etc) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🎯 Principi Architetturali

### 1. **Separation of Concerns**
- **Presentation Layer**: React components con logica di presentazione
- **Business Logic**: Custom hooks e utility functions  
- **Data Layer**: Supabase client e RLS policies
- **External Integration**: Edge Functions isolate

### 2. **Security First**
- Row Level Security (RLS) su tutte le tabelle
- JWT authentication con refresh automatico
- Edge Functions con verification JWT
- Validazione input a livello database e frontend

### 3. **Performance Oriented**
- Lazy loading componenti e routes
- Caching intelligente (React Query)
- Performance monitoring integrato
- Bundle optimization con Vite

### 4. **Scalabilità**
- Database ottimizzato con indici appropriati
- Edge Functions serverless auto-scaling
- CDN integration per assets statici
- Mobile-first responsive design

## 🧩 Componenti Principali

### Frontend Architecture

```
src/
├── pages/              # Route-level components
├── components/         # Reusable UI components
│   ├── ui/            # Base design system
│   ├── features/      # Feature-specific components
│   └── common/        # Shared components
├── hooks/             # Business logic & state management
├── contexts/          # Global state providers
├── lib/              # Core utilities & configurations
├── utils/            # Helper functions
└── integrations/     # External service configurations
```

### Component Hierarchy

```
App
├── AuthContext
├── ThemeContext  
├── PetContext
├── NotificationEventsContext
└── Router
    ├── ProtectedRoute
    ├── Layout/AdminLayout
    └── Pages
        ├── Dashboard
        ├── Analysis
        ├── Calendar
        ├── Community
        ├── Diary
        └── Settings
```

### Backend Architecture (Supabase)

```
Database (PostgreSQL)
├── Auth Schema (Supabase managed)
├── Public Schema
│   ├── Core Tables (profiles, pets, diary_entries)
│   ├── AI Tables (pet_analyses, training_protocols)
│   ├── Community Tables (messages, channels)
│   ├── Calendar Tables (events, notifications)
│   └── Business Tables (subscribers, referrals)
├── Storage Buckets
│   ├── pet-photos
│   ├── analysis-files
│   └── user-avatars
└── Edge Functions
    ├── AI Processing (analyze-pet-*)
    ├── Business Logic (subscriptions, payments)
    └── Integrations (weather, maps, notifications)
```

## 🔄 Flusso Dati

### 1. **Autenticazione**
```
User Login → Supabase Auth → JWT Token → RLS Context → App State
```

### 2. **Analisi AI**
```
User Upload → File Storage → Edge Function → AI API → Analysis Results → Database → UI Update
```

### 3. **Real-time Updates**
```
Database Change → Supabase Realtime → React Hook → Component Re-render
```

### 4. **Notifiche**
```
Database Trigger → Edge Function → Push Notification → Browser/Mobile Notification
```

## 🔐 Sicurezza

### Row Level Security (RLS)

Ogni tabella implementa policies specifiche:

```sql
-- Esempio: Accesso ai diary entries
CREATE POLICY "Users can view their diary entries" 
ON diary_entries FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their diary entries" 
ON diary_entries FOR INSERT 
WITH CHECK (auth.uid() = user_id);
```

### Validazione Multi-Layer

1. **Frontend**: Zod schemas per form validation
2. **Database**: Trigger functions per business rules
3. **Edge Functions**: Input sanitization e validation

### Gestione Secrets

- API keys in Supabase Vault
- Environment-specific configurations
- Automatic key rotation capability

## 📊 Gestione Stato

### 1. **Local State**: React useState/useReducer
- Component-specific UI state
- Form state management
- Modal/dialog state

### 2. **Global State**: React Context
- Authentication state
- Theme preferences  
- Selected pet context
- Notification events

### 3. **Server State**: React Query (TanStack Query)
- Database queries caching
- Background refetching
- Optimistic updates
- Error retry logic

### 4. **Persistent State**: LocalStorage/SessionStorage  
- User preferences
- Temporary form data
- Offline capability support

## 🎨 Design System

### Component Architecture

```
Design Tokens (CSS Variables)
├── Colors (semantic tokens)
├── Typography (fluid scales)
├── Spacing (consistent grid)
└── Shadows & Effects

Base Components (shadcn/ui)
├── Primitives (Button, Input, etc.)
├── Layout (Container, Grid, etc.)
└── Overlays (Modal, Tooltip, etc.)

Feature Components
├── Analysis Components
├── Calendar Components
├── Community Components
└── Training Components
```

### Responsive Strategy

- **Mobile First**: Design system ottimizzato per mobile
- **Fluid Typography**: Clamp functions per scaling automatico
- **Container Queries**: Component-level responsiveness
- **Touch Optimization**: Gesture support e touch targets

## 🚀 Performance

### Bundle Optimization

```
Entry Point (main.tsx)
├── Core Chunks (React, Router)
├── Vendor Chunks (Supabase, UI libs)  
├── Feature Chunks (lazy-loaded pages)
└── Asset Chunks (CSS, images)
```

### Caching Strategy

1. **Browser Cache**: Static assets (1 year)
2. **CDN Cache**: API responses (configurable)
3. **React Query Cache**: Database queries (5 min default)
4. **Service Worker**: Offline capability

### Performance Monitoring

- **Core Web Vitals**: LCP, FID, CLS tracking
- **Custom Metrics**: Database query performance
- **Error Tracking**: Sentry integration capability
- **Analytics**: User behavior insights

## 🔗 Integrazioni Esterne

### AI Services
```
Audio Analysis → Speech-to-Text API → Emotion Analysis
Image Analysis → Computer Vision API → Behavior Detection  
Text Analysis → NLP API → Sentiment Analysis
```

### Mapping & Location
```
User Location → Geocoding API → Veterinary Search → Results Display
```

### Payment Processing
```
Stripe Integration → Webhook Processing → Database Update → UI Notification
```

### Weather Data
```
Location → Weather API → Context Analysis → Behavior Correlation
```

## 📱 Mobile Architecture

### Capacitor Integration

```
Web App (React)
├── Capacitor Core
├── Platform Plugins
│   ├── Camera
│   ├── Filesystem
│   ├── Push Notifications
│   └── Geolocation
└── Native Shell
    ├── iOS App
    └── Android App
```

### Progressive Web App (PWA)

- Service Worker per offline functionality
- App manifest per installazione
- Push notifications web standard
- Background sync capability

## 🔧 Development Workflow

### 1. **Local Development**
```
Lovable IDE → Hot Reload → Browser Preview → Real-time Collaboration
```

### 2. **Testing Strategy**
```
Unit Tests (Vitest) → Integration Tests → E2E Tests (Playwright) → Manual QA
```

### 3. **Deployment Pipeline** 
```
Git Push → Lovable Build → Supabase Deploy → Production Release
```

### 4. **Monitoring**
```
Production Metrics → Performance Alerts → Error Tracking → User Feedback
```

## 📈 Scalabilità

### Database Scaling
- Read replicas per query heavy operations
- Partitioning per tabelle con high volume
- Index optimization per query performance
- Archive strategy per dati storici

### Application Scaling  
- Edge Functions auto-scaling
- CDN distribution globale
- Database connection pooling
- Background job processing

### Cost Optimization
- Serverless billing model
- Resource usage monitoring
- Automated cleanup policies
- Tiered storage strategy

---

**Versione**: 2.0.0  
**Ultimo aggiornamento**: Gennaio 2025