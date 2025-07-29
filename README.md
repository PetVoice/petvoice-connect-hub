# PetVoice Connect Hub

**Un'applicazione completa per la gestione del benessere e dell'addestramento degli animali domestici con intelligenza artificiale.**

## 🐾 Panoramica del Progetto

PetVoice Connect Hub è una piattaforma moderna per proprietari di animali domestici che combina:

- **Analisi comportamentale AI** - Analisi di audio, video e testi per comprendere le emozioni degli animali
- **Protocolli di addestramento personalizzati** - Programmi AI-generati basati sui dati del tuo pet
- **Diario digitale** - Tracciamento giornaliero del benessere e comportamento
- **Community** - Chat e condivisione esperienze con altri proprietari
- **Calendario intelligente** - Gestione appuntamenti, medicinali e attività
- **Sistema di notifiche** - Promemoria sonori e visivi per tutte le attività importanti

## 🛠️ Stack Tecnologico

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components  
- **Backend**: Supabase (Database + Auth + Edge Functions + Storage)
- **Database**: PostgreSQL con Row Level Security (RLS)
- **Deployment**: Lovable Platform
- **Mobile**: Capacitor (iOS/Android support)

## 🚀 Setup Locale

### Prerequisiti
- Node.js 18+ 
- npm/yarn/bun

### Installazione

```bash
# Clona il repository
git clone <YOUR_GIT_URL>
cd petvoice-connect-hub

# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev
```

### Variabili d'ambiente

Le configurazioni Supabase sono già integrate nel codice. Non sono necessarie variabili d'ambiente aggiuntive.

## 📁 Struttura del Progetto

```
src/
├── components/           # Componenti React riutilizzabili
│   ├── ui/              # Componenti base (shadcn/ui)
│   ├── analysis/        # Componenti per analisi AI
│   ├── calendar/        # Gestione calendario ed eventi
│   ├── community/       # Chat e messaggistica
│   ├── diary/          # Diario digitale pet
│   ├── settings/       # Impostazioni utente
│   └── training/       # Protocolli addestramento
├── pages/              # Pagine principali dell'app
├── hooks/              # Custom React hooks
├── contexts/           # Context providers (Auth, Pet, Theme)
├── lib/               # Utility e configurazioni
├── utils/             # Funzioni helper
└── integrations/      # Configurazioni Supabase

supabase/
├── functions/         # Edge Functions (AI, payments, etc.)
├── migrations/       # Database migrations
└── config.toml      # Configurazione Supabase
```

## 🔐 Autenticazione e Sicurezza

- **Autenticazione**: Supabase Auth (email/password)
- **Autorizzazione**: Row Level Security (RLS) policies
- **Dati**: Crittografati e protetti per utente
- **API**: Secured Edge Functions con JWT verification

## 🤖 Funzionalità AI

### Analisi Comportamentale
- **Audio**: Analisi delle vocalizzazioni per rilevare emozioni
- **Video**: Riconoscimento comportamentale da movimento/postura  
- **Testo**: NLP per interpretare descrizioni comportamentali
- **Immagini**: Computer vision per analisi visiva

### Protocolli di Addestramento
- Generazione automatica basata su AI
- Personalizzazione per specie, razza, età
- Progress tracking e feedback continuo
- Community rating e miglioramento collaborativo

## 📱 Funzionalità Principali

### Dashboard
- Overview benessere pet
- Metriche e trend
- Prossimi appuntamenti
- Raccomandazioni AI

### Diario Digitale  
- Entries giornaliere con mood tracking
- Upload foto/audio/video
- Tag comportamentali
- Weather context integration

### Calendario Intelligente
- Appuntamenti veterinari
- Promemoria medicinali  
- Attività e training sessions
- Sync con calendari esterni

### Community
- Chat channels per specie/razza/località
- Condivisione esperienze
- Sistema di supporto peer-to-peer
- Messaggi privati

### Sistema Notifiche
- Notifiche sonore personalizzate
- Bell icon con contatore
- Categorizzazione per tipo
- Impostazioni granulari

## 💾 Database Schema

### Tabelle Principali
- `profiles` - Dati utente e preferenze
- `pets` - Informazioni animali domestici
- `diary_entries` - Entries del diario giornaliero
- `pet_analyses` - Risultati analisi AI
- `ai_training_protocols` - Protocolli addestramento
- `calendar_events` - Eventi e appuntamenti
- `community_messages` - Messaggi community
- `private_messages` - Chat private
- `subscribers` - Gestione abbonamenti

### Edge Functions Attive
- `analyze-pet-behavior` - Analisi comportamentale AI
- `analyze-pet-image` - Computer vision per immagini
- `ai-assistance` - Assistente AI generale
- `get-weather` - Integrazione meteo
- `find-nearby-vets` - Ricerca veterinari
- `create-checkout` - Pagamenti Stripe
- `check-subscription` - Verifica abbonamenti

## 🔔 Sistema Notifiche

Il sistema include notifiche sonore e visive per:
- Messaggi privati e community
- Promemoria calendario ed eventi
- Scadenze medicinali
- Analisi completate
- Updates sistema

Ogni notifica è configurabile e include:
- Suoni personalizzati per categoria
- Persistenza preferenze utente  
- Contatore nella bell icon
- Gestione read/unread state

## 📊 Monitoraggio e Performance

- Performance monitoring integrato (`src/lib/performance.ts`)
- API monitoring per chiamate Supabase (`src/lib/apiMonitoring.ts`)
- Logging strutturato (`src/lib/logger.ts`)
- Error boundary e fallback UI

## 🚢 Deployment

### Lovable Platform (Raccomandato)
1. Apri [Lovable Project](https://lovable.dev/projects/5902ad23-96c6-4f99-95c4-8e601d99495a)
2. Click su "Share" → "Publish"
3. Il deployment è automatico

### Build Locale
```bash
npm run build
```

### Mobile Apps (Capacitor)
```bash
# iOS
npm run ios

# Android  
npm run android
```

## 🔧 Configurazione Avanzata

### Custom Domain
- Navigate to Project > Settings > Domains
- Click "Connect Domain"
- Segui la [guida ufficiale](https://docs.lovable.dev/tips-tricks/custom-domain)

### Integrazioni Esterne
- **Stripe**: Pagamenti e abbonamenti
- **OpenWeather**: Dati meteo per context analysis
- **Veterinary APIs**: Ricerca cliniche locali
- **Calendar Sync**: Google Calendar, Apple Calendar, Outlook

## 🤝 Contribuzioni

Il progetto segue la filosofia Lovable di sviluppo collaborativo AI-assisted:

1. Use Lovable per modifiche principali
2. Git standard workflow per contribuzioni esterne
3. Testing automatico su PR
4. Code review required

## 📞 Supporto

- **Documentazione**: [Lovable Docs](https://docs.lovable.dev/)
- **Community**: [Discord Lovable](https://discord.com/channels/1119885301872070706/1280461670979993613)
- **Issues**: GitHub Issues tab
- **Email**: Contatto tramite form nell'app

## 📜 Licenza

Questo progetto è sviluppato sulla piattaforma Lovable. Consulta i termini di servizio Lovable per dettagli sulla licenza.

---

**Ultimo aggiornamento**: Gennaio 2025  
**Versione**: 2.0.0  
**Maintainer**: Team di sviluppo PetVoice Connect Hub