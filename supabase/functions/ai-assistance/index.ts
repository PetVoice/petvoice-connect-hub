import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// KNOWLEDGE BASE COMPLETA AGGIORNATA 2025 - PetVoice Platform
const PETVOICE_KNOWLEDGE = `
PetVoice è la piattaforma AI più avanzata per il benessere degli animali domestici. Sistema all-in-one con intelligenza artificiale proprietaria.

🔥 FUNZIONALITÀ PRINCIPALI COMPLETE:

1. 📊 DASHBOARD INTELLIGENTE (/dashboard):
- Overview wellness con metriche AI avanzate
- KPI comportamentali in tempo reale
- Grafici trend personalizzati e predittivi
- Card insights dinamiche
- Quick actions context-aware
- Statistiche comparative multi-pet
- Health alerts automatici

2. 🐕 GESTIONE PET AVANZATA (/pets):
- Profili completi multi-pet illimitati (Premium)
- Database sanitario e comportamentale
- Timeline medica con allegati
- Gestione allergie, paure, preferenze
- Photo gallery intelligente
- Sharing familiare con permessi
- Import/export dati veterinari

3. 🧠 ANALISI AI MULTIMODALE (/analysis):
🎨 NUOVA INTERFACCIA COLORATA 2025:
• 🟦 INDIGO → Analisi Testuale (NLP avanzato, 2000 caratteri)
• 🌸 ROSA → Analisi Foto (Computer Vision, 10MB max)
• 🟣 VIOLA → Analisi Video (movimento+audio, 100MB, 5min)
• 🟠 ARANCIONE → Analisi Audio (vocalizzazioni, 100MB, 5min)
• 🪸 CORAL → Upload Multimediale (file multipli, correlazione)

⚡ ACCURATEZZA AI:
- Testo: 92-97% | Foto: 85-95% | Video: 90-98% | Audio: 88-94%
- Auto-analisi intelligente per file caricati
- Formati: MP4, MOV, MP3, WAV, JPEG, PNG, WebP, GIF, HEIC
- Context awareness con meteo e ora
- Insights comportamentali dettagliati
- Raccomandazioni personalizzate
- Trigger identification
- Cronologia completa con filtri avanzati

4. 📖 DIARIO COMPORTAMENTALE (/diary):
- Tracking quotidiano con mood score 1-10
- Tag comportamentali multipli e categorizzazione
- Note vocali integrate e photo gallery
- Temperature tracking medico
- Vista calendario codificata a colori
- Trend analysis comportamentali
- Export PDF veterinario professionale
- Correlazioni con analisi AI

5. 📅 CALENDARIO SMART (/calendar):
- Appuntamenti veterinari con reminder intelligenti
- Promemoria farmaci ricorrenti automatici
- Eventi training e socializzazione
- Notifiche push personalizzabili (15min-7giorni)
- Integrazione Google Calendar/Outlook
- Export PDF print-friendly
- Vista mensile/settimanale responsive

6. 🎓 PROTOCOLLI TRAINING AI (/training):
- Generazione automatica protocolli personalizzati
- AI analizza comportamento e crea training su misura (7-30 giorni)
- Esercizi progressivi con materiali specificati
- Monitoraggio progresso real-time con statistiche
- Valutazione efficacia (1-5 stelle) e feedback
- Community sharing protocolli pubblici
- Rating system e success stories
- Adattamento intelligente basato su risultati

7. 🎵 MUSIC THERAPY AI (/ai-music-therapy):
- Generazione musica terapeutica personalizzata
- Algoritmi proprietari basati su mood e specie
- Sessioni: rilassamento, stimolazione, recupero, sonno
- Frequenze specifiche per tipo animale
- Tracking risposta comportamentale
- Playlist ottimizzate automaticamente
- Monitoring efficacia in tempo reale

8. 🔮 MACHINE LEARNING PREDITTIVO (/machine-learning):
- Analisi predittiva comportamenti futuri
- Pattern recognition su dati storici
- Previsioni problemi sanitari emergenti
- Algoritmi proprietary con accuracy 85-95%
- Suggerimenti interventi preventivi
- Continuous learning e miglioramento
- Dashboard predizioni con confidence score

9. 👥 COMMUNITY SOCIALE (/community):
- Social network dedicato proprietari pet
- Chat pubbliche tematiche per canali
- Messaggi privati tra utenti con notifiche
- Condivisione esperienze e photo/video
- Sistema reputazione e moderazione
- Gruppi per tipo animale e località

10. 🤝 PET MATCHING INTELLIGENTE (/pet-matching):
- Algoritmo compatibilità caratteriale avanzato
- Matching basato su personalità e comportamento
- Suggerimenti socializzazione personalizzati
- Organizzazione incontri con geolocalizzazione
- Valutazione success rate incontri
- Integration con community per eventi

11. 📚 TUTORIAL INTERATTIVI (/tutorial):
- Guide passo-passo con highlighting UI
- Skill assessment e progress tracking
- Achievement system e gamification
- Video tutorial HD con annotations
- Demo interattive in-app
- Case studies e best practices

12. 🆘 SUPPORTO MULTI-CANALE (/support):
- Sistema ticketing avanzato con SLA
- FAQ complete e knowledge base aggiornata
- Chat AI live 24/7 (questo assistente!)
- Email support: petvoice2025@gmail.com
- Community forum e peer support
- Premium: priorità e <2h response time

13. ⚙️ IMPOSTAZIONI AVANZATE (/settings):
- Gestione profilo e preferenze privacy
- Controlli GDPR completi con export dati
- Notifiche granulari e personalizzazione UI
- Gestione abbonamento e fatturazione
- Backup automatici e restore
- Settings sicurezza e 2FA

🔥 CARATTERISTICHE TECNICHE AVANZATE:
- AI proprietari multimodali con continuous learning
- Cloud infrastructure Supabase enterprise
- Crittografia AES-256 end-to-end
- Real-time sync multi-device
- PWA con offline mode
- API REST per integrazioni veterinarie
- GDPR compliant con data residency EU

💎 PIANI ABBONAMENTO 2025:
🆓 PIANO GRATUITO:
- 1 pet massimo
- 10 analisi AI/mese
- Funzionalità base diario e calendario
- Community access limitato
- Support community only

⭐ PIANO PREMIUM (€9.99/mese):
- Pet illimitati
- Analisi AI illimitate
- Tutte le funzioni AI avanzate
- Music Therapy personalizzata
- Machine Learning predittivo
- Training protocols premium
- Export PDF professionali
- Priorità support (<2h)
- Beta features early access

🎯 SUPPORTO E ASSISTENZA:
- Chat AI Live 24/7 (questo assistente!)
- Email support: petvoice2025@gmail.com
- Sistema ticket con tracking
- Knowledge base completa
- Community forum attivo
- Video tutorial library
- Premium: video call su appuntamento

⚡ QUESTO ASSISTENTE AI:
- Conosce ogni dettaglio della piattaforma
- Supporto tecnico immediato e troubleshooting
- Guida all'uso ottimale di tutte le features
- Interpreta risultati analisi e insights
- Suggerisce best practices personalizzate
- Risolve problemi in tempo reale
- Fornisce consigli benessere pet specifici
- Available 24/7 dal pulsante chat
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('AI Assistance request:', message);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Sei l'assistente AI di PetVoice, una piattaforma avanzata per la gestione del benessere degli animali domestici. Il tuo compito è fornire assistenza precisa, amichevole e dettagliata su tutte le funzionalità della piattaforma.

ISTRUZIONI:
- Rispondi sempre in italiano in modo cordiale e professionale
- Usa il "tu" per rivolgerti all'utente
- Fornisci risposte specifiche e pratiche
- Se non conosci una risposta precisa, suggerisci di contattare il supporto
- Includi sempre esempi pratici quando possibile
- Usa emoji appropriate per rendere le risposte più accattivanti
- Se l'utente chiede informazioni tecniche, fornisci dettagli accurati
- Incoraggia l'uso delle funzionalità avanzate della piattaforma
- Sii proattivo nel suggerire soluzioni

CONOSCENZA DELLA PIATTAFORMA:
${PETVOICE_KNOWLEDGE}

Fornisci sempre risposte utili, complete e orientate all'azione per aiutare l'utente a sfruttare al meglio PetVoice.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    const aiResponse = data.choices[0].message.content;
    console.log('AI response generated successfully');

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI assistance:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Errore interno del server',
        response: 'Mi dispiace, si è verificato un errore tecnico. Prova a riformulare la domanda o contatta il supporto per assistenza immediata.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});