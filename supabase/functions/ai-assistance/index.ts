import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Comprehensive knowledge base about PetVoice platform
const PETVOICE_KNOWLEDGE = `
PetVoice è una piattaforma completa per la gestione e il monitoraggio del benessere degli animali domestici utilizzando l'intelligenza artificiale.

FUNZIONALITÀ PRINCIPALI:

1. GESTIONE PET (/pets):
- Registrazione profili pet con nome, tipo, razza, età, peso
- Caricamento foto avatar
- Gestione informazioni sanitarie e comportamentali
- Storico medico e vaccinazioni

2. ANALISI AI (/analysis):
- Caricamento e analisi di file audio, video e immagini
- Riconoscimento emozioni e comportamenti tramite AI
- Insights comportamentali personalizzati
- Storico completo delle analisi
- Download dei report in PDF
- Filtri per data, tipo di file, emozione principale

3. DIARIO COMPORTAMENTALE (/diary):
- Registrazione quotidiana dell'umore (scala 1-10)
- Tag comportamentali (felice, ansioso, giocoso, etc.)
- Caricamento foto e note vocali
- Tracking temperatura corporea
- Visualizzazione trend temporali
- Esportazione dati

4. CALENDARIO (/calendar):
- Programmazione appuntamenti veterinari
- Promemoria per medicazioni
- Eventi per attività e training
- Visualizzazione mensile e settimanale
- Notifiche automatiche
- Sincronizzazione con Google Calendar

5. WELLNESS (/wellness):
- Calcolo automatico del Wellness Score (0-100)
- Monitoraggio metriche sanitarie
- Allerte automatiche per anomalie
- Trend di salute a lungo termine
- Suggerimenti personalizzati per il miglioramento

6. PROTOCOLLI DI TRAINING AI (/training):
- Protocolli personalizzati generati dall'AI
- Esercizi comportamentali specifici
- Tracking progressi giornalieri
- Valutazione efficacia protocolli
- Community sharing dei protocolli
- Sistema di rating e feedback

7. MUSICOTERAPIA AI (/ai-music-therapy):
- Generazione musica terapeutica personalizzata
- Playlist basate sull'umore del pet
- Sessioni di rilassamento guidate
- Monitoraggio risposta del pet alla musica
- Algoritmi adattivi per optimizzazione

8. STATISTICHE (/stats):
- Dashboard completo con KPI
- Grafici trend umore e comportamento
- Analisi predittive
- Comparazioni temporali
- Metriche di coinvolgimento
- Report di salute mensili

9. COMMUNITY (/community):
- Social network per proprietari di pet
- Condivisione esperienze e consigli
- Chat private tra utenti
- Gruppi tematici per tipo di animale
- Sistema di raccomandazioni

10. PET MATCHING (/pet-matching):
- Algoritmo per trovare pet compatibili
- Suggerimenti di socializzazione
- Organizzazione incontri
- Valutazione compatibilità caratteriale

11. SUPPORTO (/support):
- Sistema ticketing integrato
- FAQ complete e knowledge base
- Chat dal vivo con assistenza
- Guide utente dettagliate
- Video tutorial

12. IMPOSTAZIONI (/settings):
- Gestione profilo utente
- Preferenze privacy e notifiche
- Esportazione dati personali
- Gestione abbonamento
- Personalizzazione interfaccia

CARATTERISTICHE TECNICHE:
- Analisi AI con modelli proprietari
- Sincronizzazione cloud automatica
- Sicurezza end-to-end
- API REST per integrazioni
- App mobile in sviluppo
- Backup automatico dei dati

PIANI DI ABBONAMENTO:
- Piano Gratuito: funzionalità base, 1 pet
- Piano Premium: funzionalità complete, pet illimitati, analisi avanzate
- Piano Famiglia: per più utenti, condivisione dati

SUPPORTO E ASSISTENZA:
- Chat live 24/7
- Email support
- Video call su appuntamento
- Community forum attivo
- Documentazione completa online

ASSISTENTE AI LIVE CHAT:
- Disponibile 24/7 tramite pulsante in basso a destra
- Conosce ogni aspetto della piattaforma
- Fornisce supporto tecnico immediato
- Risolve dubbi su tutte le funzionalità
- Guida nell'uso ottimale delle features
- Interpreta risultati e analisi
- Suggerisce best practices personalizzate
- Aiuta nella risoluzione di problemi
- Fornisce consigli per il benessere del pet
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