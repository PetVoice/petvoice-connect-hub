import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  X, 
  Minimize2, 
  Maximize2,
  HelpCircle,
  Sparkles,
  Clock,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
}

interface FlowOption {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  children?: FlowOption[];
  response?: string;
}

interface AILiveChatProps {
  isOpen: boolean;
  onClose: () => void;
  minimized?: boolean;
  onToggleMinimize?: () => void;
}

const AILiveChat: React.FC<AILiveChatProps> = ({ 
  isOpen, 
  onClose, 
  minimized = false, 
  onToggleMinimize 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFlow, setCurrentFlow] = useState<FlowOption[]>([]); // Initialize empty, will be set by useEffect
  const [flowPath, setFlowPath] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // FLUSSO CONVERSAZIONALE COMPLETO AGGIORNATO 2025
  const mainFlow: FlowOption[] = [
    {
      id: 'getting-started',
      title: '🚀 Primi Passi',
      description: 'Inizia con PetVoice',
      children: [
        {
          id: 'platform-overview',
          title: 'Panoramica piattaforma',
          response: '🎯 **BENVENUTO IN PETVOICE!**\n\nPetVoice è la piattaforma AI più avanzata per il benessere dei pet.\n\n📊 **SEZIONI PRINCIPALI:**\n• Dashboard - Overview wellness e metriche\n• Pet - Gestione profili completi\n• Analisi AI - Sistema multimodale colorato\n• Diario - Tracking comportamentale\n• Calendario - Appuntamenti smart\n• Training - Protocolli AI personalizzati\n• Music Therapy - Musicoterapia AI\n• Community - Social network pet\n\n💡 **SUGGERIMENTO:** Inizia aggiungendo il tuo primo pet e fai un\'analisi per vedere la magia dell\'AI!'
        },
        {
          id: 'first-setup',
          title: 'Setup iniziale completo',
          response: '⚙️ **SETUP OTTIMALE IN 5 PASSI:**\n\n1️⃣ **Aggiungi Pet** (Pet → Aggiungi Pet)\n   • Nome, tipo, razza, data nascita\n   • Allergie, paure, preferenze\n   • Foto profilo\n\n2️⃣ **Prima Analisi** (Analisi → scegli modalità colorata)\n   • Registra audio/video del pet\n   • Ottieni insights comportamentali\n\n3️⃣ **Setup Diario** (Diario → Nuova Voce)\n   • Mood score giornaliero\n   • Tag comportamentali\n\n4️⃣ **Calendario Base** (Calendario → Nuovo Evento)\n   • Prossimo appuntamento veterinario\n\n5️⃣ **Esplora Training AI** (Training → Genera Protocollo)\n   • L\'AI creerà il primo protocollo personalizzato!'
        },
        {
          id: 'navigation-tips',
          title: 'Come navigare efficacemente',
          response: '🧭 **NAVIGATION MASTER TIPS:**\n\n🎨 **CODICI COLORE ANALISI:**\n• 🟦 Indigo = Testo | 🌸 Rosa = Foto\n• 🟣 Viola = Video | 🟠 Arancione = Audio\n• 🪸 Coral = Upload multiplo\n\n⚡ **SHORTCUTS UTILI:**\n• Selettore pet in alto per cambio rapido\n• Dashboard cards = quick actions\n• Filtri avanzati in ogni sezione\n• Export PDF da Dashboard/Calendario/Diario\n\n📱 **MOBILE FRIENDLY:**\n• Touch gestures ottimizzate\n• Interface responsive\n• Registrazione diretta da mobile\n\n💡 **PRO TIP:** Usa i colori per identificare rapidamente le funzioni!'
        }
      ]
    },
    {
      id: 'pets',
      title: '🐕 Gestione Pet',
      description: 'Tutto sui tuoi animali domestici',
      children: [
        {
          id: 'add-pet-advanced',
          title: 'Aggiungere pet completo',
          response: '➕ **AGGIUNTA PET PROFESSIONALE:**\n\n📋 **DATI ESSENZIALI:**\n1. Pet → Aggiungi Pet\n2. Info base: nome, tipo, razza, nascita\n3. Dettagli fisici: peso, taglia, colore\n4. Caratteristiche: temperamento, energia\n\n🏥 **DATI SANITARI:**\n• Allergie alimentari/ambientali\n• Condizioni mediche attuali\n• Farmaci e dosaggi\n• Veterinario di riferimento\n\n🎯 **PREFERENZE COMPORTAMENTALI:**\n• Attività favorite\n• Paure e trigger\n• Socializzazione (altri pet/persone)\n• Abitudini alimentari\n\n📸 **FOTO PROFILO:** Carica immagine chiara del viso per migliorare accuracy dell\'AI!'
        },
        {
          id: 'multi-pet-management',
          title: 'Gestione multi-pet avanzata',
          response: '🏠 **MULTI-PET MASTERY:**\n\n🔄 **SWITCH RAPIDO:**\n• Dropdown pet selector sempre visibile\n• Dati completamente separati per pet\n• Cronologie indipendenti\n• Settings personalizzati\n\n📊 **ANALYTICS COMPARATIVE:**\n• Dashboard mostra tutti i pet\n• Confronti wellness score\n• Trend comportamentali paralleli\n• Allerte per anomalie\n\n👨‍👩‍👧‍👦 **FAMIGLIA SHARING:**\n• Condividi accesso con familiari\n• Permessi differenziati (view/edit)\n• Notifiche multi-utente\n• Backup condiviso\n\n💎 **PREMIUM UNLOCKS:**\n• Pet illimitati (vs 1 gratuito)\n• Advanced comparisons\n• Family plan disponibile'
        },
        {
          id: 'pet-health-tracking',
          title: 'Tracking sanitario avanzato',
          response: '🏥 **HEALTH MONITORING PRO:**\n\n📋 **TIMELINE MEDICA:**\n• Cronologia visite veterinarie\n• Upload documenti/referti\n• Tracking vaccinazioni\n• Reminder controlli periodici\n\n💊 **GESTIONE FARMACI:**\n• Database farmaci con dosaggi\n• Reminder automatici\n• Tracking aderenza terapia\n• Monitoraggio effetti collaterali\n\n⚠️ **ALERT SISTEMA:**\n• Anomalie comportamentali\n• Cambiamenti wellness score\n• Scadenze farmaci/visite\n• Integration con analisi AI\n\n📊 **EXPORT VETERINARIO:**\n• Report PDF professionali\n• Dati comportamentali correlati\n• Timeline eventi sanitari\n• Insights AI per diagnosi'
        }
      ]
    },
    {
      id: 'analysis',
      title: 'Analisi AI Avanzata',
      description: 'Sistema di analisi comportamentale con interfaccia colorata',
      children: [
        {
          id: 'how-analysis-works',
          title: 'Come funziona l\'analisi AI avanzata',
          response: 'Il sistema di analisi PetVoice è stato completamente rinnovato:\n\n🎯 **Nuova Interfaccia Colorata:**\n• Ogni modalità ha un colore distintivo per facilità d\'uso\n• Pulsanti arancioni per la funzione principale "Registra Audio"\n• Colori tematici per ogni tipo di analisi\n\n🔬 **Modalità Disponibili:**\n• 🧠 Analisi Testuale (Indigo) - NLP avanzato\n• 📸 Analisi Foto (Rosa) - Computer Vision\n• 🎬 Analisi Video (Viola) - Dinamica\n• 🎙️ Analisi Audio (Arancione) - Riconoscimento audio\n• 📊 Analisi Multimediale (Coral) - Combinata\n\n📊 **Accuratezza:**\n• Testo: 92-97% • Foto: 85-95% • Video: 90-98% • Audio: 88-94%'
        },
        {
          id: 'new-interface',
          title: 'Nuova interfaccia colorata',
          response: 'La pagina di analisi ora ha un\'interfaccia completamente rinnovata:\n\n🎨 **Sistema di Colori Intuitivo:**\n• 🟦 INDIGO → Analisi Testuale (scrittura descrizioni)\n• 🌸 ROSA → Analisi Foto (scatta/carica immagini)\n• 🟣 VIOLA → Analisi Video (registra/carica video)\n• 🟠 ARANCIONE → Analisi Audio (registra/carica audio)\n• 🪸 CORAL → Upload Multimediale (file multipli)\n\n✨ **Funzionalità Migliorate:**\n• Pulsanti più grandi e visibili\n• Colori coordinati tra titoli e azioni\n• Auto-analisi per alcuni tipi di file\n• Interfaccia più intuitiva e accessibile\n\n🎯 **Benefici:** Navigazione più semplice e veloce per tutte le età!'
        },
        {
          id: 'analysis-types-detailed',
          title: 'Tipi di analisi dettagliati',
          response: 'Ogni modalità di analisi ha caratteristiche specifiche:\n\n🧠 **ANALISI TESTUALE** (Indigo):\n• Max 2.000 caratteri\n• Elaborazione NLP istantanea\n• Accuratezza: 92-97%\n• Ideale per: Descrizioni comportamentali dettagliate\n\n📸 **ANALISI FOTO** (Rosa):\n• Max 10MB per immagine\n• Computer Vision avanzata\n• Tempo: 10-20 secondi\n• Rileva: Espressioni, postura, micro-segnali\n\n🎬 **ANALISI VIDEO** (Viola):\n• Max 5 minuti di durata\n• Analisi movimento + audio\n• Tempo: 20-45 secondi\n• Combina: Visual + audio analysis\n\n🎙️ **ANALISI AUDIO** (Arancione):\n• Max 5 minuti di registrazione\n• Riconoscimento tono e pitch\n• Tempo: 15-30 secondi\n• Rileva: Vocalizzazioni, stress, emozioni'
        },
        {
          id: 'auto-analysis',
          title: 'Auto-analisi intelligente',
          response: 'Alcune modalità ora includono l\'auto-analisi:\n\n⚡ **Analisi Automatica per:**\n• File immagine caricati\n• File video caricati\n• File audio (se abilitato nelle impostazioni)\n\n🔄 **Come Funziona:**\n1. Carichi/registri il contenuto\n2. Il sistema rileva automaticamente il tipo\n3. Avvia l\'analisi senza click aggiuntivi\n4. Ricevi notifica quando pronta\n\n⚙️ **Controllo Utente:**\n• Puoi disabilitare l\'auto-analisi\n• Mantieni sempre il controllo manuale\n• Possibilità di rivedere prima dell\'invio\n\n💡 **Beneficio:** Workflow più veloce e automatizzato!'
        },
        {
          id: 'multimodal-analysis',
          title: 'Analisi multimediale combinata',
          response: 'La funzione più avanzata: analisi di file multipli!\n\n📊 **Caricamento Multiplo:**\n• Trascina più file contemporaneamente\n• Diversi tipi di media insieme\n• Analisi correlata e incrociata\n• Risultati unificati e completi\n\n🔗 **Correlazioni Intelligenti:**\n• Audio + Video = Analisi comportamentale completa\n• Foto + Descrizione = Context enhancement\n• File multipli stesso evento = Maggiore precisione\n\n📈 **Vantaggi:**\n• Accuratezza superiore (fino al 98%)\n• Insights più profondi e dettagliati\n• Raccomandazioni più specifiche\n• Report veterinario più completo\n\n💫 **Tip:** Combina più modalità per i migliori risultati!'
        }
      ]
    },
    {
      id: 'diary',
      title: 'Diario Comportamentale',
      description: 'Registra e monitora i comportamenti',
      children: [
        {
          id: 'using-diary',
          title: 'Come usare il diario',
          response: 'Il diario comportamentale è essenziale:\n\n📝 **Cosa registrare:**\n• Umore del pet (1-10)\n• Comportamenti osservati\n• Attività della giornata\n• Note particolari\n\n⏰ **Quando registrare:**\n• Ogni giorno alla stessa ora\n• Dopo eventi significativi\n• Prima e dopo le visite veterinarie\n\n📊 **Benefici:**\n• Trend comportamentali\n• Correlazioni con salute\n• Supporto per diagnosi veterinarie'
        },
        {
          id: 'mood-score',
          title: 'Registrare l\'umore',
          response: 'Come valutare l\'umore del pet:\n\n😢 **1-3: Triste/Depresso**\n• Letargico, non reattivo\n• Poco appetito\n• Isolamento sociale\n\n😐 **4-6: Neutrale/Normale**\n• Comportamento standard\n• Attività regolari\n• Appetito normale\n\n😊 **7-10: Felice/Energico**\n• Molto attivo e giocoso\n• Affettuoso e socievole\n• Ottimo appetito\n\n💡 **Suggerimento:** Sii consistente nelle valutazioni!'
        },
        {
          id: 'add-photos',
          title: 'Aggiungere foto al diario',
          response: 'Foto nel diario comportamentale:\n\n📸 **Come aggiungere:**\n1. Apri il diario del giorno\n2. Clicca su "Aggiungi foto"\n3. Scatta o seleziona dalla galleria\n4. Aggiungi una descrizione\n5. Salva la voce\n\n🎯 **Foto utili:**\n• Espressioni facciali\n• Posture corporee\n• Interazioni sociali\n• Luoghi preferiti\n\n💾 **Storage:** Foto salvate nel cloud, accessibili sempre!'
        },
        {
          id: 'behavioral-tags',
          title: 'Usare i tag comportamentali',
          response: 'I tag comportamentali ti aiutano a categorizzare:\n\n🏷️ **Tag Positivi:**\n• Giocoso, Affettuoso, Calmo\n• Energico, Socievole, Curioso\n\n⚠️ **Tag di Attenzione:**\n• Ansioso, Aggressivo, Letargico\n• Spaventato, Agitato, Depresso\n\n📊 **Come usarli:**\n1. Seleziona tutti i tag appropriati\n2. Combina più tag se necessario\n3. I tag alimentano le statistiche\n4. Aiutano a identificare pattern\n\n💡 **Tip:** Sii specifico e consistente!'
        },
        {
          id: 'diary-frequency',
          title: 'Frequenza di aggiornamento',
          response: 'Frequenza ideale per il diario:\n\n🗓️ **Quotidiana (Consigliata):**\n• Migliori trend e statistiche\n• Rilevamento precoce problemi\n• Dati completi per veterinario\n\n📅 **Alternativa minima:**\n• Almeno 3 volte a settimana\n• Dopo eventi significativi\n• Durante cambiamenti comportamentali\n\n⏰ **Orario fisso:**\n• Stessa ora ogni giorno\n• Preferibilmente sera\n• 5-10 minuti sufficienti\n\n🎯 **Obiettivo:** Creare una routine per te e il pet!'
        }
      ]
    },
    {
      id: 'training',
      title: 'Protocolli di Training',
      description: 'Training personalizzato con AI',
      children: [
        {
          id: 'how-protocols-work',
          title: 'Come funzionano i protocolli',
          response: 'I protocolli di training AI sono generati automaticamente:\n\n🤖 **Generazione AI:**\n• Analisi del comportamento del pet\n• Protocolli personalizzati e adattivi\n• Progressione graduale e sicura\n• Aggiornamenti automatici basati sui risultati\n\n📋 **Struttura:**\n• Esercizi giornalieri programmati\n• Durata: 7-30 giorni\n• Difficoltà progressive\n• Materiali necessari specificati\n\n📊 **Monitoraggio:**\n• Progresso tracciato automaticamente\n• Valutazioni di efficacia\n• Aggiustamenti in tempo reale'
        },
        {
          id: 'create-custom',
          title: 'Come vengono generati i protocolli',
          response: 'I protocolli vengono generati automaticamente dall\'AI:\n\n🎯 **Processo automatico:**\n1. L\'AI analizza i dati comportamentali del pet\n2. Identifica aree di miglioramento\n3. Genera protocollo personalizzato\n4. Ricevi il protocollo ottimizzato\n5. L\'AI monitora e ottimizza i risultati\n\n🔧 **Personalizzazioni possibili:**\n• Durata del protocollo\n• Intensità degli esercizi\n• Orari preferiti\n• Note personali\n\n✨ **Intelligenza dell\'AI:** Il sistema impara dalle tue sessioni e ottimizza automaticamente il protocollo!'
        },
        {
          id: 'protocol-duration',
          title: 'Durata dei protocolli',
          response: 'Durata tipica dei protocolli:\n\n⚡ **Protocolli Base (7-14 giorni):**\n• Comandi di base\n• Controllo impulsi semplici\n• Abitudini igieniche\n\n🎯 **Protocolli Intermedi (14-21 giorni):**\n• Comportamenti complessi\n• Socializzazione avanzata\n• Gestione ansia lieve\n\n🏆 **Protocolli Avanzati (21-30 giorni):**\n• Problemi comportamentali severi\n• Training specializzato\n• Riabilitazione post-trauma\n\n💡 **Flessibilità:** Puoi sempre estendere o abbreviare secondo necessità!'
        },
        {
          id: 'modify-protocol',
          title: 'Modificare protocolli attivi',
          response: 'Modifiche durante il training:\n\n✏️ **Cosa puoi modificare:**\n• Orari delle sessioni\n• Intensità degli esercizi\n• Durata delle attività\n• Note personali\n\n🔄 **Come modificare:**\n1. Apri il protocollo attivo\n2. Clicca su "Personalizza"\n3. Modifica i parametri\n4. Salva le modifiche\n5. L\'AI si adatta automaticamente\n\n⚠️ **Limiti:**\n• Non puoi cambiare l\'obiettivo principale\n• Alcune modifiche potrebbero richiedere riavvio\n• L\'AI potrebbe suggerire alternative'
        },
        {
          id: 'evaluate-effectiveness',
          title: 'Valutare l\'efficacia',
          response: 'Come valutare il successo del training:\n\n📊 **Metriche automatiche:**\n• Progresso giornaliero (0-100%)\n• Consistenza nell\'esecuzione\n• Tempo di risposta del pet\n• Difficoltà degli esercizi superati\n\n✅ **Valutazioni manuali:**\n• Rating efficacia (1-5 stelle)\n• Note sui comportamenti osservati\n• Foto/video dei progressi\n• Feedback sui materiali usati\n\n🎯 **Risultati finali:**\n• Report completo di fine protocollo\n• Raccomandazioni per il futuro\n• Protocolli di mantenimento suggeriti'
        }
      ]
    },
    {
      id: 'interface',
      title: 'Interfaccia e Usabilità',
      description: 'Nuove funzionalità dell\'interfaccia utente',
      children: [
        {
          id: 'color-system',
          title: 'Sistema di colori nella pagina analisi',
          response: 'Abbiamo introdotto un sistema di colori intuitivo per la pagina di analisi:\n\n🎨 **Codifica Colori:**\n• 🟦 **INDIGO** → Analisi Testuale e titolo "🧠 Analisi Avanzata con IA"\n• 🌸 **ROSA** → Analisi Foto e titolo "📸 Analisi Foto Avanzata con IA"\n• 🟣 **VIOLA** → Analisi Video e titolo "🎬 Analisi Video Avanzata con IA"\n• 🟠 **ARANCIONE** → Analisi Audio e titolo "🎙️ Analisi Audio Avanzata con IA"\n• 🪸 **CORAL** → Upload Multimediale e "📊 Analisi Multimediale Avanzata con IA"\n\n✨ **Vantaggi:**\n• Navigazione più intuitiva\n• Identificazione rapida delle funzioni\n• Esperienza utente migliorata\n• Accessibilità aumentata per tutte le età'
        },
        {
          id: 'button-improvements',
          title: 'Miglioramenti ai pulsanti',
          response: 'I pulsanti delle card di analisi sono stati completamente rinnovati:\n\n🔘 **Nuove Caratteristiche:**\n• Pulsanti più grandi e visibili (32x32)\n• Colori coordinati con i titoli delle sezioni\n• Effetti hover migliorati (scale 1.02)\n• Ombre e gradienti per maggiore profondità\n\n🎯 **Coordinazione Colori:**\n• Pulsante e titolo sempre dello stesso colore\n• Contrasto ottimizzato per leggibilità\n• Stati attivi/disattivi chiaramente distinti\n• Feedback visivo immediato\n\n💡 **Benefici:** Più facile trovare e usare le funzioni, esperienza più fluida!'
        },
        {
          id: 'accessibility-improvements',
          title: 'Miglioramenti di accessibilità',
          response: 'Abbiamo potenziato l\'accessibilità della piattaforma:\n\n♿ **Accessibilità Visiva:**\n• Contrasti colore ottimizzati WCAG 2.1\n• Dimensioni pulsanti aumentate per touch\n• Feedback visivo migliorato per ogni azione\n• Icone più grandi e chiare\n\n🎯 **Navigazione Semplificata:**\n• Codifica colori per identificazione rapida\n• Flusso logico tra le funzioni\n• Riduzione dei click necessari\n• Auto-analisi per workflow più veloce\n\n🧠 **Cognitiva:**\n• Raggruppamento logico delle funzioni\n• Consistenza visiva in tutta l\'app\n• Terminologia semplice e chiara'
        },
        {
          id: 'responsive-design',
          title: 'Design responsive migliorato',
          response: 'L\'interfaccia si adatta perfettamente a tutti i dispositivi:\n\n📱 **Mobile Ottimizzato:**\n• Pulsanti touch-friendly (44px minimi)\n• Layout stack su schermi piccoli\n• Gesture intuitive per interazione\n• Performance ottimizzata\n\n💻 **Desktop Enhanced:**\n• Hover effects per feedback immediato\n• Scorciatoie da tastiera\n• Drag & drop migliorato\n• Multi-tasking supportato\n\n📊 **Tablet Perfect:**\n• Combinazione di touch e precisione\n• Layout ibrido ottimizzato\n• Orientamento automatico\n• Gesture avanzate'
        }
      ]
    },
    {
      id: 'music-therapy',
      title: '🎵 Music Therapy AI',
      description: 'Musicoterapia personalizzata',
      children: [
        {
          id: 'music-generation',
          title: 'Generazione musica AI',
          response: '🎼 **MUSICOTERAPIA AI AVANZATA:**\n\n🎯 **GENERAZIONE INTELLIGENTE:**\n• AI analizza mood e comportamento pet\n• Frequenze specifiche per specie\n• Adattamento real-time durante sessione\n• Algoritmi proprietari per efficacia\n\n🎨 **TIPI SESSIONI:**\n• Rilassamento antistress\n• Stimolazione cognitiva\n• Recupero post-trauma\n• Socializzazione\n• Sonno profondo\n\n⚙️ **PERSONALIZZAZIONE:**\n• Strumenti musicali preferiti\n• Durata e intensità\n• Orari ottimali\n• Monitoring risposta comportamentale'
        }
      ]
    },
    {
      id: 'community',
      title: '👥 Community',
      description: 'Social network per pet owners',
      children: [
        {
          id: 'community-features',
          title: 'Funzionalità community',
          response: '🌍 **SOCIAL NETWORK PET:**\n\n💬 **CHAT E MESSAGGI:**\n• Canali pubblici tematici\n• Messaggi privati criptati\n• Condivisione foto/video\n• Sistema moderazione AI\n\n🤝 **PET MATCHING:**\n• Algoritmo compatibilità avanzato\n• Suggerimenti socializzazione\n• Organizzazione eventi locali\n• Geolocalizzazione opzionale\n\n📚 **KNOWLEDGE SHARING:**\n• Condivisione protocolli training\n• Reviews veterinari\n• Tips comportamentali\n• Success stories'
        }
      ]
    },
    {
      id: 'premium',
      title: '💎 Piano Premium',
      description: 'Funzionalità avanzate',
      children: [
        {
          id: 'premium-benefits',
          title: 'Vantaggi Premium',
          response: '⭐ **PIANO PREMIUM €9.99/mese:**\n\n🔥 **UNLOCKS COMPLETO:**\n• Pet illimitati (vs 1 gratuito)\n• Analisi AI illimitate (vs 10/mese)\n• Music Therapy personalizzata\n• Machine Learning predittivo\n• Training protocols avanzati\n• Export PDF professionali\n• Support prioritario <2h\n• Beta features early access\n\n💡 **ROI IMMEDIATO:**\n• Multi-pet = convenienza istantanea\n• Analisi accurate = migliori decisioni\n• Support veloce = problemi risolti subito\n\n🔄 **FLESSIBILITÀ:**\n• Cancellazione istantanea\n• Nessun vincolo contrattuale\n• Upgrade/downgrade quando vuoi'
        }
      ]
    },
    {
      id: 'support',
      title: '🆘 Supporto Tecnico',
      description: 'Assistenza e risoluzione problemi',
      children: [
        {
          id: 'contact-support',
          title: 'Contattare il supporto',
          response: 'Come ottenere assistenza:\n\n💬 **Chat Live (24/7):**\n• Risposta immediata\n• Assistenza in tempo reale\n• Disponibile sempre\n\n📧 **Email:**\n• petvoice2025@gmail.com\n• Risposta entro 24h\n• Per problemi complessi\n\n📱 **In-app:**\n• Supporto > Contatti Diretti\n• Screenshot automatici\n• Log errori inclusi\n\n🎫 **Sistema Ticket:** Per problemi che richiedono follow-up'
        },
        {
          id: 'app-not-working',
          title: 'L\'app non funziona',
          response: 'Risoluzione problemi comuni:\n\n🔄 **Prima prova:**\n1. Chiudi e riapri l\'app\n2. Verifica connessione internet\n3. Riavvia il dispositivo\n4. Aggiorna l\'app se disponibile\n\n📱 **Problemi specifici:**\n• **Crash frequenti:** Libera memoria\n• **Lenta:** Chiudi altre app\n• **Sync non funziona:** Verifica login\n• **Upload fallisce:** Controlla spazio cloud\n\n🆘 **Se persiste:**\n• Contatta supporto con dettagli\n• Includi modello dispositivo\n• Descrivi quando si verifica'
        },
        {
          id: 'report-bug',
          title: 'Segnalare un bug',
          response: 'Come segnalare bug efficacemente:\n\n🐛 **Informazioni necessarie:**\n• Modello dispositivo e OS\n• Versione dell\'app\n• Passaggi per riprodurre\n• Screenshot/video dell\'errore\n\n📝 **Dove segnalare:**\n1. Supporto > Contatti\n2. Includi subject: "BUG REPORT"\n3. Descrizione dettagliata\n4. Allega screenshot\n\n⚡ **Risposta rapida:**\n• Bug critici: entro 2 ore\n• Bug minori: entro 24 ore\n• Fix programmati: notifica automatica\n\n🎁 **Reward:** I migliori bug report ricevono crediti gratuiti!'
        },
        {
          id: 'feature-request',
          title: 'Richiedere nuove funzionalità',
          response: 'Suggerisci nuove funzionalità:\n\n💡 **Come richiedere:**\n1. Vai su Supporto > FAQ\n2. Tab "Richieste di Funzionalità"\n3. Clicca "Nuova funzionalità"\n4. Descrivi la tua idea\n5. Vota funzionalità esistenti\n\n🗳️ **Sistema di voto:**\n• Le funzionalità più votate hanno priorità\n• Community decide lo sviluppo\n• Trasparenza completa sui progressi\n\n🚀 **Roadmap pubblica:**\n• Funzionalità in sviluppo\n• Timeline di rilascio\n• Beta testing per utenti premium'
        },
        {
          id: 'recover-password',
          title: 'Recuperare la password',
          response: 'Reset password sicuro:\n\n🔐 **Processo di reset:**\n1. Clicca "Password dimenticata?" al login\n2. Inserisci la tua email\n3. Controlla la casella email (anche spam)\n4. Clicca il link di reset\n5. Crea nuova password sicura\n\n✅ **Requisiti password:**\n• Minimo 8 caratteri\n• Almeno 1 maiuscola\n• Almeno 1 numero\n• Almeno 1 carattere speciale\n\n🛡️ **Sicurezza:** Per protezione, tutte le altre sessioni verranno disconnesse'
        }
      ]
    }
  ];

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize chat with welcome message and main flow
  useEffect(() => {
    if (isOpen) {
      if (messages.length === 0) {
        const welcomeMessage: ChatMessage = {
          id: '1',
          text: '👋 Ciao! Sono l\'assistente AI di PetVoice. Come posso aiutarti oggi?',
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
      // Always show main flow when chat opens
      setCurrentFlow(mainFlow);
      setFlowPath([]);
    }
  }, [isOpen]);

  const getAIResponse = async (userMessage: string): Promise<string> => {
    try {
      // Call the AI assistance edge function
      const { data, error } = await supabase.functions.invoke('ai-assistance', {
        body: { message: userMessage }
      });

      if (error) throw error;
      return data.response || "Mi dispiace, non sono riuscito a processare la tua richiesta. Puoi riprovare?";
    } catch (error) {
      console.error('Error getting AI response:', error);
      return "Si è verificato un errore tecnico. Per assistenza immediata, puoi contattare il nostro supporto nella sezione FAQ.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Add typing indicator
      const typingMessage: ChatMessage = {
        id: 'typing',
        text: '',
        sender: 'ai',
        timestamp: new Date(),
        isTyping: true
      };
      setMessages(prev => [...prev, typingMessage]);

      // Get AI response
      const aiResponse = await getAIResponse(userMessage.text);

      // Remove typing indicator and add actual response
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => msg.id !== 'typing');
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: aiResponse,
          sender: 'ai',
          timestamp: new Date()
        };
        return [...filteredMessages, aiMessage];
      });

    } catch (error) {
      console.error('Error in chat:', error);
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => msg.id !== 'typing');
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: "Mi dispiace, si è verificato un errore. Riprova tra poco.",
          sender: 'ai',
          timestamp: new Date()
        };
        return [...filteredMessages, errorMessage];
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    // Gestione Pet
    "Come aggiungo un nuovo pet?",
    "Come modifico i dati del mio pet?",
    "Posso aggiungere più pet?",
    "Come carico la foto del mio pet?",
    "Come eliminare un pet dal profilo?",
    
    // Analisi AI
    "Come funziona l'analisi AI?",
    "Che tipi di file posso caricare per l'analisi?",
    "Quanto tempo richiede un'analisi?",
    "Come interpreto i risultati dell'analisi?",
    "Posso analizzare video, audio e foto?",
    "L'analisi è precisa?",
    
    // Diario Comportamentale
    "Come uso il diario comportamentale?",
    "Cosa devo scrivere nel diario?",
    "Come registro l'umore del mio pet?",
    "Posso aggiungere foto al diario?",
    "Come funzionano i tag comportamentali?",
    "Quanto spesso devo aggiornare il diario?",
    
    // Wellness e Salute
    "Cos'è il wellness score?",
    "Come viene calcolato il punteggio di benessere?",
    "Come registro i parametri vitali?",
    "Cosa significano le metriche di salute?",
    "Come funzionano gli alert di salute?",
    "Come interpreto i grafici del wellness?",
    
    // Training AI
    "Come funzionano i protocolli di training?",
    "Come creo un protocollo personalizzato?",
    "Quanto durano i protocolli di training?",
    "Posso modificare un protocollo durante l'uso?",
    "Come valuto l'efficacia del training?",
    "Ci sono protocolli per comportamenti specifici?",
    
    // Calendario e Appuntamenti
    "Come programmo un appuntamento veterinario?",
    "Come imposto i promemoria?",
    "Posso sincronizzare con altri calendari?",
    "Come gestisco eventi ricorrenti?",
    "Come modifico o cancello un appuntamento?",
    
    // Statistiche e Analytics
    "Come interpreto le statistiche?",
    "Cosa mostrano i grafici comportamentali?",
    "Come funzionano i trend di salute?",
    "Posso esportare i dati?",
    "Come confronto periodi diversi?",
    "Cosa significano le anomalie rilevate?",
    
    // Musico-terapia AI
    "Come funziona la musico-terapia AI?",
    "Che tipo di musica genera?",
    "Come scelgo il genere musicale?",
    "Posso salvare le composizioni?",
    "La musica è personalizzata per il mio pet?",
    
    // Community
    "Come funziona la community?",
    "Come posso chattare con altri proprietari?",
    "Posso condividere esperienze?",
    "Come funzionano i canali tematici?",
    "Posso eliminare i miei messaggi?",
    
    // Account e Abbonamenti
    "Come funzionano gli abbonamenti?",
    "Cosa include il piano premium?",
    "Come cancello l'abbonamento?",
    "Posso cambiare piano?",
    "Come aggiorno i dati di pagamento?",
    "Ci sono sconti disponibili?",
    
    // Supporto Tecnico
    "Come contatto il supporto?",
    "Cosa faccio se l'app non funziona?",
    "Come segnalo un bug?",
    "Come richiedo nuove funzionalità?",
    "Come recupero la password?",
    "L'app funziona offline?",
    
    // Privacy e Sicurezza
    "I miei dati sono sicuri?",
    "Come funziona la privacy?",
    "Posso eliminare il mio account?",
    "Chi può vedere i miei dati?",
    "Come funziona la crittografia?",
    
    // Funzionalità Avanzate
    "Come funzionano le notifiche intelligenti?",
    "Cosa sono i pattern comportamentali?",
    "Come funziona il riconoscimento anomalie?",
    "Posso integrare dispositivi wearable?",
    "Come funziona la sincronizzazione cloud?",
    
    // Primo Utilizzo
    "Come iniziare con PetVoice?",
    "Cosa fare dopo la registrazione?",
    "Che informazioni servono per il setup?",
    "Come ottimizzare l'uso dell'app?",
    "Ci sono tutorial disponibili?"
  ];

  const handleFlowOption = (option: FlowOption) => {
    if (option.children && option.children.length > 0) {
      // Navigate to sub-level
      setCurrentFlow(option.children);
      setFlowPath([...flowPath, option.title]);
      
      // Add navigation message
      const navMessage: ChatMessage = {
        id: Date.now().toString(),
        text: `Ecco le opzioni per ${option.title}:`,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, navMessage]);
    } else if (option.response) {
      // Show final response
      const responseMessage: ChatMessage = {
        id: Date.now().toString(),
        text: option.response,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, responseMessage]);
      
      // Reset to main flow after response
      setTimeout(() => {
        setCurrentFlow(mainFlow);
        setFlowPath([]);
      }, 500);
    }
  };

  const goBack = () => {
    if (flowPath.length > 0) {
      const newPath = [...flowPath];
      newPath.pop();
      setFlowPath(newPath);
      
      // Navigate back in the flow structure
      if (newPath.length === 0) {
        setCurrentFlow(mainFlow);
      } else {
        // Find the parent flow level
        let currentLevel = mainFlow;
        for (const pathItem of newPath) {
          const found = currentLevel.find(item => item.title === pathItem);
          if (found && found.children) {
            currentLevel = found.children;
          }
        }
        setCurrentFlow(currentLevel);
      }
    }
  };

  const resetToMain = () => {
    setCurrentFlow(mainFlow);
    setFlowPath([]);
    const resetMessage: ChatMessage = {
      id: Date.now().toString(),
      text: 'Siamo tornati al menu principale. Come posso aiutarti?',
      sender: 'ai',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, resetMessage]);
  };

  // Initialize chat when opened - consolidated logic
  useEffect(() => {
    if (isOpen) {
      // Always set the main flow when chat opens
      setCurrentFlow(mainFlow);
      setFlowPath([]);
      
      // Add welcome message if no messages exist
      if (messages.length === 0) {
        const welcomeMessage: ChatMessage = {
          id: Date.now().toString(),
          text: '👋 Ciao! Sono l\'assistente AI di PetVoice. Come posso aiutarti oggi?',
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${minimized ? 'w-80' : 'w-96'} max-h-[600px] transition-all duration-300`}>
      <Card className="shadow-2xl border-primary/20">
        <CardHeader className="p-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Bot className="h-5 w-5" />
              <span>Assistente AI</span>
              <Badge variant="secondary" className="text-xs bg-white/20 text-white">
                <Sparkles className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </CardTitle>
            <div className="flex items-center space-x-2">
              {onToggleMinimize && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleMinimize}
                  className="h-8 w-8 p-0 text-primary-foreground hover:bg-white/20"
                >
                  {minimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 text-primary-foreground hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!minimized && (
          <CardContent className="p-0">
            {/* Messages Area */}
            <ScrollArea className="h-80 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`p-3 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground ml-2'
                            : 'bg-muted mr-2'
                        }`}
                      >
                        {message.isTyping ? (
                          <div className="flex items-center space-x-1">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                            </div>
                            <span className="text-sm text-muted-foreground ml-2">Sto scrivendo...</span>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        )}
                      </div>
                      <div className={`flex items-center mt-1 text-xs text-muted-foreground ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}>
                        {message.sender === 'ai' ? (
                          <Bot className="h-3 w-3 mr-1" />
                        ) : (
                          <User className="h-3 w-3 mr-1" />
                        )}
                        <span>{formatDistanceToNow(message.timestamp, { addSuffix: true, locale: it })}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Flow Navigation */}
            <div className="p-4 border-t border-border">
              {/* Breadcrumb */}
              {flowPath.length > 0 && (
                <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                  <Button variant="ghost" size="sm" onClick={resetToMain} className="h-6 px-2">Menu</Button>
                  {flowPath.map((path, index) => (
                    <span key={index}>/ {path}</span>
                  ))}
                  {flowPath.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={goBack} className="h-6 px-2 ml-2">Indietro</Button>
                  )}
                </div>
              )}

              {/* Flow Options */}
              <div className="grid grid-cols-1 gap-2 mb-4 max-h-48 overflow-y-auto">
                {currentFlow.map((option) => (
                  <Button
                    key={option.id}
                    variant="outline"
                    onClick={() => handleFlowOption(option)}
                    className="text-left justify-start h-auto p-3 hover:bg-primary/5"
                  >
                    <div>
                      <div className="font-medium text-sm">{option.title}</div>
                      {option.description && (
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
              
              {/* Input Area */}
              <div className="flex space-x-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Scrivi un messaggio..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={isLoading || !inputText.trim()}
                  size="sm"
                  className="px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

// Chat Button Component
export const AILiveChatButton: React.FC = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);

  return (
    <>
      {!chatOpen && (
        <Button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground"
          size="lg"
        >
          <div className="relative">
            <MessageCircle className="h-6 w-6" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
          </div>
        </Button>
      )}
      
      <AILiveChat 
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        minimized={minimized}
        onToggleMinimize={() => setMinimized(!minimized)}
      />
    </>
  );
};

export default AILiveChat;