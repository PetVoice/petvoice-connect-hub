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

  // Flusso conversazionale gerarchico
  const mainFlow: FlowOption[] = [
    {
      id: 'pets',
      title: 'Gestione Pet',
      description: 'Tutto sui tuoi animali domestici',
      children: [
        {
          id: 'add-pet',
          title: 'Aggiungere un nuovo pet',
          response: 'Per aggiungere un nuovo pet:\n\n1. Vai su "I Miei Pet" nel menu\n2. Clicca su "Aggiungi Pet"\n3. Inserisci nome, tipo, razza e data di nascita\n4. Carica una foto (opzionale)\n5. Salva le informazioni\n\nIl tuo pet sarà subito disponibile per analisi e diario!'
        },
        {
          id: 'edit-pet',
          title: 'Modificare dati del pet',
          response: 'Per modificare i dati del tuo pet:\n\n1. Vai su "I Miei Pet"\n2. Clicca sulla card del pet da modificare\n3. Clicca su "Modifica" \n4. Aggiorna le informazioni necessarie\n5. Salva le modifiche\n\nPuoi modificare nome, peso, condizioni di salute e molto altro!'
        },
        {
          id: 'multiple-pets',
          title: 'Gestire più pet',
          response: 'Con PetVoice puoi gestire tutti i tuoi pet:\n\n• Aggiungi pet illimitati (piano premium)\n• Passa facilmente tra i pet dal menu\n• Ogni pet ha il suo diario e analisi separate\n• Visualizza statistiche comparative\n• Gestisci calendari separati per ogni pet'
        },
        {
          id: 'pet-photo',
          title: 'Caricare foto del pet',
          response: 'Per caricare o cambiare la foto del pet:\n\n1. Vai su "I Miei Pet"\n2. Clicca sul pet\n3. Clicca sull\'icona della fotocamera\n4. Seleziona una foto dalla galleria\n5. Ritaglia se necessario\n6. Salva\n\nFormati supportati: JPG, PNG, HEIC (max 10MB)'
        },
        {
          id: 'delete-pet',
          title: 'Eliminare un pet',
          response: 'Per eliminare un pet dal profilo:\n\n⚠️ ATTENZIONE: Questa azione eliminerà TUTTI i dati associati (diario, analisi, calendario)\n\n1. Vai su "I Miei Pet"\n2. Clicca sul pet da eliminare\n3. Clicca su "Impostazioni avanzate"\n4. Clicca su "Elimina pet"\n5. Conferma l\'eliminazione\n\nConsiglio: Esporta i dati prima di eliminare!'
        }
      ]
    },
    {
      id: 'analysis',
      title: 'Analisi AI',
      description: 'Analisi comportamentale avanzata',
      children: [
        {
          id: 'how-analysis-works',
          title: 'Come funziona l\'analisi AI',
          response: 'L\'analisi AI di PetVoice:\n\n🎯 **Cosa fa:**\n• Analizza video, audio e foto del tuo pet\n• Rileva emozioni e comportamenti\n• Fornisce insights personalizzati\n\n🔬 **Tecnologia:**\n• Machine Learning avanzato\n• Riconoscimento visivo e audio\n• Database di comportamenti animali\n\n📊 **Risultati:**\n• Punteggio di fiducia\n• Raccomandazioni specifiche\n• Trend comportamentali'
        },
        {
          id: 'file-types',
          title: 'Tipi di file supportati',
          response: 'Formati supportati per l\'analisi:\n\n🎥 **Video:**\n• MP4, MOV, AVI\n• Max 100MB\n• Durata: 10sec - 5min\n\n🎵 **Audio:**\n• MP3, WAV, M4A\n• Max 50MB\n• Durata: 3sec - 10min\n\n📸 **Immagini:**\n• JPG, PNG, HEIC\n• Max 10MB\n• Min 800x600px\n\nPer risultati migliori, usa file chiari e ben illuminati!'
        },
        {
          id: 'analysis-time',
          title: 'Tempo di elaborazione',
          response: 'Tempi di analisi tipici:\n\n⚡ **Immagini:** 10-30 secondi\n🎵 **Audio:** 30-60 secondi\n🎥 **Video:** 1-3 minuti\n\n⏱️ **Fattori che influenzano i tempi:**\n• Dimensione del file\n• Qualità del contenuto\n• Carico del server\n• Complessità dell\'analisi\n\n💡 **Suggerimento:** Riceverai una notifica quando l\'analisi è pronta!'
        },
        {
          id: 'interpret-results',
          title: 'Interpretare i risultati',
          response: 'Come leggere i risultati dell\'analisi:\n\n📊 **Punteggio di Fiducia:**\n• 90-100%: Molto affidabile\n• 70-89%: Buona affidabilità\n• 50-69%: Media affidabilità\n• <50%: Bassa affidabilità\n\n🎯 **Emozioni Rilevate:**\n• Felice, Triste, Ansioso, Calmo\n• Aggressivo, Giocoso, Spaventato\n\n💡 **Raccomandazioni:**\n• Azioni consigliate\n• Protocolli di training\n• Consultazioni veterinarie'
        },
        {
          id: 'multiple-files',
          title: 'Analizzare più file',
          response: 'Analisi di file multipli:\n\n✅ **Puoi caricare:**\n• Più file contemporaneamente\n• Diversi tipi di media\n• File dello stesso evento\n\n📈 **Vantaggi:**\n• Analisi più completa\n• Correlazioni tra diversi media\n• Maggiore precisione\n\n🔄 **Processo:**\n1. Seleziona tutti i file\n2. Aggiungi descrizione dell\'evento\n3. Avvia analisi combinata\n4. Ricevi risultato unificato'
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
      id: 'support',
      title: 'Supporto Tecnico',
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