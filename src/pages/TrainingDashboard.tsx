import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import {
  Calendar,
  Clock,
  CheckCircle,
  Target,
  ArrowLeft,
  Play,
  Pause,
  Square,
  Star,
  Award,
  Heart,
  TrendingUp,
  Book,
  Timer,
  Camera,
  Mic,
  AlertCircle,
  Trophy,
  Lightbulb,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { useTrainingProtocols, useUpdateProtocol, TrainingProtocol } from '@/hooks/useTrainingProtocols';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: number;
  instructions: string[];
  materials: string[];
  completed: boolean;
  rating?: number;
  notes?: string;
}

// Esercizi dinamici basati sulla categoria del protocollo
const getExercisesForProtocol = (protocol: TrainingProtocol): Exercise[] => {
  const currentDay = protocol.current_day;
  
  // Esercizi specifici per la categoria socializzazione con progressione giornaliera
  if (protocol.category === 'socializzazione') {
    const allSocializationExercises: Exercise[] = [
      // Settimana 1 (Giorni 1-7): Fondamenti
      {
        id: `soc-${currentDay}-1`,
        title: currentDay <= 7 ? 'Comando Base "Guarda"' : 
              currentDay <= 14 ? 'Incontri Controllati Vicini' :
              currentDay <= 21 ? 'Socializzazione Multi-Persona' :
              currentDay <= 28 ? 'Gestione Ambienti Affollati' :
              'Consolidamento Avanzato',
        description: currentDay <= 7 ? 'Stabilire il contatto visivo come base per tutti gli esercizi successivi' :
                    currentDay <= 14 ? 'Socializzazione con persone familiari a distanza ravvicinata' :
                    currentDay <= 21 ? 'Interazione contemporanea con più persone' :
                    currentDay <= 28 ? 'Mantenere calma in situazioni stimolanti' :
                    'Perfezionamento delle abilità sociali acquisite',
        duration: Math.min(10 + Math.floor(currentDay / 3), 25),
        instructions: currentDay <= 7 ? [
          'Seduto di fronte al pet a 1 metro',
          'Dì "guarda" e attendi il contatto visivo',
          'Premia immediatamente quando ti guarda',
          'Ripeti 10 volte con pause',
          'Incrementa gradualmente la distanza'
        ] : currentDay <= 14 ? [
          'Presenta una persona familiare a 3 metri',
          'Usa comando "guarda" quando nota la persona',
          'Premia per calma e attenzione verso di te',
          'Avvicinati di 1 metro se rimane tranquillo',
          'Termina con interazione positiva'
        ] : currentDay <= 21 ? [
          'Organizza incontro con 2-3 persone calme',
          'Mantieni pet al guinzaglio inizialmente',
          'Premia interazioni gentili e appropriate',
          'Gestisci pause se si sovraeccita',
          'Termina quando tutti sono calmi'
        ] : currentDay <= 28 ? [
          'Visita luogo pubblico moderatamente affollato',
          'Mantieni distanza di comfort dagli stimoli',
          'Premia per mantenere attenzione su di te',
          'Usa comandi di richiamo se si distrae',
          'Uscita positiva anche se breve'
        ] : [
          'Combinazione di tutti gli esercizi precedenti',
          'Test in ambiente imprevedibile',
          'Autonomia graduale (guinzaglio più lungo)',
          'Valutazione dei progressi complessivi',
          'Celebrazione dei risultati ottenuti'
        ],
        materials: currentDay <= 7 ? ['Clicker', 'Snack piccoli e frequenti'] :
                  currentDay <= 14 ? ['Guinzaglio 2m', 'Persona collaborativa', 'Snack'] :
                  currentDay <= 21 ? ['Guinzaglio', 'Gruppo persone familiari', 'Premi vari'] :
                  currentDay <= 28 ? ['Guinzaglio corto', 'Snack alta appetibilità', 'Bottiglia acqua'] :
                  ['Kit completo materiali', 'Registrazione video opzionale'],
        completed: false
      },
      {
        id: `soc-${currentDay}-2`,
        title: currentDay <= 7 ? 'Desensibilizzazione Suoni Sociali' :
              currentDay <= 14 ? 'Interazioni con Altri Animali' :
              currentDay <= 21 ? 'Gioco Sociale Guidato' :
              currentDay <= 28 ? 'Socializzazione in Movimento' :
              'Autonomia in Contesti Sociali',
        description: currentDay <= 7 ? 'Abituazione graduale ai suoni tipici delle interazioni sociali' :
                    currentDay <= 14 ? 'Primi approcci controllati con altri animali' :
                    currentDay <= 21 ? 'Attività di gruppo strutturate e supervisionate' :
                    currentDay <= 28 ? 'Socializzazione durante passeggiate e spostamenti' :
                    'Riduzione graduale della supervisione diretta',
        duration: Math.min(12 + Math.floor(currentDay / 2.5), 30),
        instructions: currentDay <= 7 ? [
          'Riproduci suoni di voci umane a basso volume',
          'Associa i suoni con attività piacevoli',
          'Incrementa gradualmente volume e varietà',
          'Include risate, applausi, conversazioni',
          'Premia per rimanere rilassato'
        ] : currentDay <= 14 ? [
          'Scegli animale calmo e ben socializzato',
          'Inizia con 10 metri di distanza',
          'Avvicinati solo se entrambi sono tranquilli',
          'Permetti brevi annusate se appropriato',
          'Termina prima di sovrastimolazione'
        ] : currentDay <= 21 ? [
          'Organizza gioco controllato con 1-2 animali',
          'Stabilisci regole chiare per l\'interazione',
          'Supervisiona costantemente le dinamiche',
          'Interrompi se il gioco diventa troppo intenso',
          'Premia comportamenti sociali appropriati'
        ] : currentDay <= 28 ? [
          'Passeggiata in area con moderata presenza sociale',
          'Gestisci incontri casuali con altri',
          'Mantieni movimento per evitare fissazioni',
          'Premia per attenzione e collaborazione',
          'Varia percorsi per diverse esperienze'
        ] : [
          'Situazioni sociali con supervisione minima',
          'Osserva da distanza per valutare autonomia',
          'Intervieni solo se strettamente necessario',
          'Documenta progressi e aree di miglioramento',
          'Pianifica mantenimento dei risultati'
        ],
        materials: currentDay <= 7 ? ['Speaker bluetooth', 'Playlist suoni sociali', 'Snack calmanti'] :
                  currentDay <= 14 ? ['Due guinzagli', 'Animale collaborativo', 'Spazio neutro'] :
                  currentDay <= 21 ? ['Giocattoli sicuri', 'Spazio recintato', 'Snack per tutti'] :
                  currentDay <= 28 ? ['Guinzaglio confortevole', 'Marsupio snack', 'Mappa percorsi'] :
                  ['Materiali essenziali', 'Modulo valutazione'],
        completed: false
      },
      {
        id: `soc-${currentDay}-3`,
        title: currentDay <= 7 ? 'Rilassamento in Presenza' :
              currentDay <= 14 ? 'Condivisione Spazio Sociale' :
              currentDay <= 21 ? 'Comunicazione Non Verbale' :
              currentDay <= 28 ? 'Adattabilità Sociale' :
              'Valutazione Finale e Mantenimento',
        description: currentDay <= 7 ? 'Imparare a rimanere calmi anche quando ci sono altre persone/animali' :
                    currentDay <= 14 ? 'Condividere spazi comuni senza stress o conflitti' :
                    currentDay <= 21 ? 'Interpretare e rispondere ai segnali sociali appropriati' :
                    currentDay <= 28 ? 'Flessibilità nel gestire situazioni sociali impreviste' :
                    'Test comprensivo di tutte le competenze sviluppate',
        duration: Math.min(15 + Math.floor(currentDay / 2), 35),
        instructions: currentDay <= 7 ? [
          'Posiziona il pet in area confortevole',
          'Introduci gradualmente presenza di altri',
          'Mantieni ambiente tranquillo e prevedibile',
          'Premia stati di rilassamento',
          'Estendi gradualmente i tempi'
        ] : currentDay <= 14 ? [
          'Situazioni di coesistenza pacifica',
          'Nessuna interazione forzata',
          'Premia per ignorare appropriato di stimoli',
          'Gestisci spazio personale rispettoso',
          'Costruisci tolleranza alla presenza'
        ] : currentDay <= 21 ? [
          'Osserva e interpreta segnali di stress/comfort',
          'Insegna segnali di disimpegno appropriati',
          'Premia per lettura corretta delle situazioni',
          'Pratica approach e retreat appropriati',
          'Sviluppa comunicazione chiara'
        ] : currentDay <= 28 ? [
          'Esponi a situazioni sociali variabili',
          'Cambia componenti: numero persone, rumore, spazio',
          'Valuta capacità di adattamento',
          'Premia flessibilità e problem solving',
          'Costruisci resilienza sociale'
        ] : [
          'Test completo in ambiente reale',
          'Valutazione su tutti gli obiettivi',
          'Documentazione video dei progressi',
          'Piano di mantenimento personalizzato',
          'Celebrazione dei risultati raggiunti'
        ],
        materials: currentDay <= 7 ? ['Coperta comfort', 'Ambiente controllato', 'Timer'] :
                  currentDay <= 14 ? ['Barriere visive opzionali', 'Spazi definiti', 'Snack'] :
                  currentDay <= 21 ? ['Materiale osservazione', 'Camera per registrazione', 'Note'] :
                  currentDay <= 28 ? ['Ambienti vari', 'Stimoli diversificati', 'Kit emergenza'] :
                  ['Checklist valutazione', 'Camera', 'Certificato completamento'],
        completed: false
      }
    ];
    
    return allSocializationExercises;
  }
  
  // Per le altre categorie, mantieni gli esercizi base ma con progressione
  const baseExercises: Record<string, Exercise[]> = {
    ansia: [
      {
        id: `ansia-${currentDay}-1`,
        title: 'Desensibilizzazione ai Rumori di Partenza',
        description: `Graduale esposizione ai suoni che precedono la tua partenza (Giorno ${currentDay})`,
        duration: Math.min(15 + currentDay, 30),
        instructions: [
          'Raccogli le chiavi senza uscire di casa',
          'Metti le scarpe e resta seduto per 5 minuti',
          'Prendi la borsa/giacca e cammina per casa',
          'Vai verso la porta senza aprirla',
          'Premia il pet per essere rimasto calmo'
        ],
        materials: ['Kong riempibile', 'Snack alta appetibilità', 'Telecamera monitoraggio'],
        completed: false
      },
      {
        id: `ansia-${currentDay}-2`,
        title: 'Uscite Progressive',
        description: `Incremento graduale del tempo di assenza (Giorno ${currentDay})`,
        duration: Math.min(20 + currentDay * 2, 45),
        instructions: [
          `Esci per ${Math.min(30 + currentDay * 10, 300)} secondi e rientra`,
          'Ignora il pet per 2 minuti al rientro',
          `Incrementa a ${Math.min(2 + currentDay, 15)} minuti di assenza`,
          'Continua ignorando reazioni eccessive',
          'Premia solo quando è calmo'
        ],
        materials: ['Timer', 'Diffusore feromoni', 'Playlist rilassante'],
        completed: false
      },
      {
        id: `ansia-${currentDay}-3`,
        title: 'Creazione Area Sicura',
        description: `Stabilire uno spazio comfort progressivamente autonomo (Giorno ${currentDay})`,
        duration: Math.min(10 + currentDay, 25),
        instructions: [
          'Scegli un\'area tranquilla della casa',
          'Posiziona la cuccia/coperta preferita',
          'Aggiungi giocattoli calmanti',
          'Pratica comando "posto" in quest\'area',
          'Ricompensa per aver usato lo spazio'
        ],
        materials: ['Coperta morbida', 'Giocattoli anti-stress', 'Snack lunga durata'],
        completed: false
      }
    ],
    // Le altre categorie mantengono la stessa struttura di progressione...
    default: [
      {
        id: `default-${currentDay}-1`,
        title: 'Valutazione Comportamentale',
        description: `Osservazione e registrazione del comportamento (Giorno ${currentDay})`,
        duration: 10 + currentDay,
        instructions: [
          'Osserva il pet in ambiente normale',
          'Registra comportamenti problematici',
          'Nota trigger e circostanze',
          'Valuta intensità delle reazioni',
          'Documenta per prossime sessioni'
        ],
        materials: ['Diario comportamentale', 'Timer', 'Fotocamera opzionale'],
        completed: false
      },
      {
        id: `default-${currentDay}-2`,
        title: 'Stabilimento Routine Base',
        description: `Creazione di routine strutturata (Giorno ${currentDay})`,
        duration: 15 + currentDay,
        instructions: [
          'Stabilisci orari fissi per pasti',
          'Crea routine per uscite e gioco',
          'Mantieni coerenza negli esercizi',
          'Documenta progressi giornalieri',
          'Adatta routine alle esigenze specifiche'
        ],
        materials: ['Schedule giornaliero', 'Timer', 'Registro progressi'],
        completed: false
      },
      {
        id: `default-${currentDay}-3`,
        title: 'Rinforzo Positivo Base',
        description: `Fondamenti del training con rinforzo positivo (Giorno ${currentDay})`,
        duration: 12 + currentDay,
        instructions: [
          'Identifica ricompense più gradite',
          'Timing perfetto: premia immediatamente',
          'Usa marker clear (clicker o parola)',
          'Mantieni sessioni brevi e positive',
          'Termina sempre con successo'
        ],
        materials: ['Clicker o marker vocale', 'Vari tipi di snack', 'Pazienza'],
        completed: false
      }
    ]
  };
  
  return baseExercises[protocol.category] || baseExercises.default;
};

const TrainingDashboard: React.FC = () => {
  const { protocolId } = useParams<{ protocolId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: protocols } = useTrainingProtocols();
  const updateProtocol = useUpdateProtocol();
  
  const [currentExercise, setCurrentExercise] = useState(0);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [exerciseRating, setExerciseRating] = useState(5);
  const [exerciseNotes, setExerciseNotes] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [dayRating, setDayRating] = useState([5]);

  const protocol = protocols?.find(p => p.id === protocolId);

  // Calcola l'esercizio corrente basato sul progresso del protocollo quando il protocollo viene caricato
  useEffect(() => {
    if (protocol && protocol.progress_percentage !== undefined) {
      const exercisesPerDay = 3; // Ogni protocollo ha 3 esercizi
      const totalExercises = protocol.duration_days * exercisesPerDay;
      const totalCompletedExercises = Math.floor((protocol.progress_percentage / 100) * totalExercises);
      
      // Calcola quanti esercizi sono stati completati nei giorni precedenti
      const exercisesCompletedInPreviousDays = (protocol.current_day - 1) * exercisesPerDay;
      
      // Calcola gli esercizi completati oggi
      const exercisesCompletedToday = Math.max(0, totalCompletedExercises - exercisesCompletedInPreviousDays);
      
      // L'esercizio corrente è il primo non completato oggi
      const calculatedCurrentExercise = Math.min(exercisesCompletedToday, exercisesPerDay - 1);
      
      console.log('🔄 INIZIALIZZAZIONE PROGRESSO CORRETTA:', {
        protocol_id: protocol.id,
        progress_percentage: protocol.progress_percentage,
        duration_days: protocol.duration_days,
        current_day: protocol.current_day,
        totalExercises,
        totalCompletedExercises,
        exercisesCompletedInPreviousDays,
        exercisesCompletedToday,
        calculatedCurrentExercise
      });
      
      setCurrentExercise(calculatedCurrentExercise);
      setHasInitialized(true);
      
      console.log('✅ IMPOSTATO currentExercise a:', calculatedCurrentExercise);
    }
  }, [protocol?.id, protocol?.progress_percentage]); // Rimuovo hasInitialized dalle dependency

  // Ottieni esercizi dinamici basati sul protocollo
  const todayExercises: Exercise[] = protocol ? getExercisesForProtocol(protocol) : [];

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Reset timer quando cambia esercizio
  useEffect(() => {
    setTimeElapsed(0);
    setIsTimerRunning(false);
  }, [currentExercise]);

  if (!protocol) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Protocollo non trovato</h2>
          <p className="text-muted-foreground mb-4">
            Il protocollo richiesto non esiste o non hai i permessi per visualizzarlo.
          </p>
          <Button onClick={() => navigate('/training')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna ai Protocolli
          </Button>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompleteExercise = async () => {
    try {
      // Verifica che esista un esercizio corrente
      if (!todayExercises || todayExercises.length === 0) {
        toast({
          title: 'Errore',
          description: 'Nessun esercizio disponibile per oggi.',
          variant: 'destructive',
        });
        return;
      }

      if (currentExercise >= todayExercises.length || currentExercise < 0) {
        toast({
          title: 'Errore',
          description: 'Esercizio non valido.',
          variant: 'destructive',
        });
        return;
      }

      const currentEx = todayExercises[currentExercise];
      
      if (!currentEx) {
        toast({
          title: 'Errore',
          description: 'Esercizio non trovato.',
          variant: 'destructive',
        });
        return;
      }
      
      // Gli esercizi sono generati dinamicamente, non è necessario aggiornarli nel database
      // Invece, registriamo il completamento nell'activity log e aggiorniamo il protocollo
      

      // Calcola il progresso del protocollo - CORREZIONE FORMULA
      const completedCount = currentExercise + 1; // Esercizio appena completato
      const exercisesPerDay = todayExercises.length; // 3 esercizi per giorno
      const totalExercises = exercisesPerDay * protocol.duration_days; // Es: 3 * 9 = 27
      
      // Calcola totale esercizi completati nel protocollo
      const exercisesCompletedInPreviousDays = (protocol.current_day - 1) * exercisesPerDay;
      const totalCompletedExercises = exercisesCompletedInPreviousDays + completedCount;
      const newProgressPercentage = Math.round((totalCompletedExercises / totalExercises) * 100);
      
      console.log('🧮 CALCOLO PROGRESSO:', {
        currentExercise,
        completedCount,
        exercisesPerDay,
        totalExercises,
        exercisesCompletedInPreviousDays,
        totalCompletedExercises,
        newProgressPercentage,
        currentDay: protocol.current_day
      });

      // Aggiorna il progresso del protocollo nel database
      await updateProtocol.mutateAsync({
        id: protocol.id,
        updates: {
          progress_percentage: Math.min(newProgressPercentage, 100),
          last_activity_at: new Date().toISOString(),
        }
      });

      // Se è l'ultimo esercizio della giornata, avanza al giorno successivo
      if (completedCount === todayExercises.length) {
        const isLastDay = protocol.current_day >= protocol.duration_days;
        
        await updateProtocol.mutateAsync({
          id: protocol.id,
          updates: {
            current_day: isLastDay ? protocol.current_day : protocol.current_day + 1,
            progress_percentage: Math.min(newProgressPercentage, 100),
            status: isLastDay ? 'completed' : protocol.status,
            last_activity_at: new Date().toISOString(),
          }
        });

        toast({
          title: isLastDay ? 'Protocollo completato!' : 'Giornata completata!',
          description: isLastDay 
            ? `Congratulazioni! Hai completato tutto il protocollo "${protocol.title}"!`
            : `Hai completato tutti gli esercizi del giorno ${protocol.current_day}. Ottimo lavoro!`,
        });

        // Se il protocollo è completato, torna alla dashboard
        if (isLastDay) {
          setTimeout(() => {
            navigate('/training');
          }, 2000);
        }
      } else {
        // Aggiorna solo il progresso senza cambiare giorno
        const isProtocolCompleted = newProgressPercentage >= 100;
        
        await updateProtocol.mutateAsync({
          id: protocol.id,
          updates: {
            progress_percentage: Math.min(newProgressPercentage, 100),
            status: isProtocolCompleted ? 'completed' : protocol.status,
            last_activity_at: new Date().toISOString(),
          }
        });

        // Se il protocollo è completato, mostra toast e torna alla dashboard
        if (isProtocolCompleted) {
          toast({
            title: 'Protocollo completato!',
            description: `Congratulazioni! Hai completato tutto il protocollo "${protocol.title}"!`,
          });
          
          setTimeout(() => {
            navigate('/training');
          }, 2000);
        } else {
          // Passa al prossimo esercizio
          setCurrentExercise(prev => prev + 1);
        }
      }

      // Reset form
      setExerciseRating(5);
      setExerciseNotes('');
      
    } catch (error) {
      console.error('Error completing exercise:', error);
      toast({
        title: 'Errore',
        description: 'Non è stato possibile completare l\'esercizio. Riprova.',
        variant: 'destructive',
      });
    }
  };

  // Funzione per interrompere il protocollo
  const handleInterruptProtocol = async () => {
    try {
      await updateProtocol.mutateAsync({
        id: protocol.id,
        updates: {
          status: 'paused',
          last_activity_at: new Date().toISOString(),
        }
      });

      toast({
        title: 'Protocollo interrotto',
        description: 'Il protocollo è stato interrotto definitivamente.',
      });

      // Torna alla dashboard principale
      setTimeout(() => {
        navigate('/training');
      }, 1500);
    } catch (error) {
      console.error('Error pausing protocol:', error);
      toast({
        title: 'Errore',
        description: 'Non è stato possibile interrompere il protocollo.',
        variant: 'destructive',
      });
    }
  };

  const currentEx = todayExercises[currentExercise];
  
  // Calcola il progresso in tempo reale considerando l'esercizio corrente e quelli precedenti completati
  const completedExercises = Math.min(currentExercise, todayExercises.length);
  const totalExercises = todayExercises.length;
  const dayProgress = (completedExercises / totalExercises) * 100;

  // Se non c'è un esercizio corrente valido, mostra messaggio di errore
  if (!currentEx || todayExercises.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Nessun esercizio disponibile</h2>
          <p className="text-muted-foreground mb-4">
            Non ci sono esercizi configurati per questo protocollo. Contatta il supporto per assistenza.
          </p>
          <Button onClick={() => navigate('/training')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna ai Protocolli
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/training')}
          className="p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{protocol.title}</h1>
            <Badge className="bg-gradient-to-r from-primary to-primary/80 text-white">
              <Calendar className="h-3 w-3 mr-1" />
              Giorno {protocol.current_day} di {protocol.duration_days}
            </Badge>
          </div>
          <p className="text-muted-foreground">{protocol.description}</p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-lg font-bold">{protocol.current_day}</div>
                <p className="text-xs text-muted-foreground">Giorno corrente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-lg font-bold">{protocol.progress_percentage}%</div>
                <p className="text-xs text-muted-foreground">Progresso totale</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-lg font-bold">{protocol.success_rate}%</div>
                <p className="text-xs text-muted-foreground">Tasso successo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <div>
                <div className="text-lg font-bold">{completedExercises}/{totalExercises}</div>
                <p className="text-xs text-muted-foreground">Esercizi oggi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Progresso di Oggi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Esercizi completati</span>
              <span>{completedExercises} di {totalExercises}</span>
            </div>
            <Progress value={dayProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Main Exercise Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Exercise */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  {currentEx.title}
                </CardTitle>
                <Badge variant="outline">
                  {currentExercise + 1} di {totalExercises}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {currentEx.duration} min
                </div>
                <div className="flex items-center gap-1">
                  <Timer className="h-4 w-4" />
                  {formatTime(timeElapsed)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">{currentEx.description}</p>

              {/* Timer Controls */}
              <div className="flex items-center justify-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-mono font-bold">
                  {formatTime(timeElapsed)}
                </div>
                <Button
                  variant={isTimerRunning ? "destructive" : "default"}
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="gap-2"
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Pausa
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Avvia
                    </>
                  )}
                </Button>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="font-semibold mb-3">Istruzioni Step-by-Step</h3>
                <div className="space-y-3">
                  {currentEx.instructions.map((instruction, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <p className="text-sm">{instruction}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Materials */}
              <div>
                <h3 className="font-semibold mb-3">Materiali Necessari</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentEx.materials.map((material, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {material}
                    </div>
                  ))}
                </div>
              </div>

              {/* Completion Form */}
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-semibold">Valutazione Esercizio</h3>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Quanto è stato efficace l'esercizio? ({exerciseRating}/10)
                  </label>
                  <Slider
                    value={[exerciseRating]}
                    onValueChange={(value) => setExerciseRating(value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1 - Poco efficace</span>
                    <span>10 - Molto efficace</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Note sull'esercizio (opzionale)
                  </label>
                  <Textarea
                    placeholder="Descrivi come è andato l'esercizio, comportamenti osservati, difficoltà incontrate..."
                    value={exerciseNotes}
                    onChange={(e) => setExerciseNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleCompleteExercise}
                  disabled={currentEx.completed}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  {currentEx.completed ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Esercizio Completato
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {(currentExercise === totalExercises - 1 && protocol.current_day === protocol.duration_days) 
                        ? 'Completa Protocollo' 
                        : 'Prossimo Esercizio'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Exercise List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Esercizi di Oggi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {todayExercises.map((exercise, index) => (
                  <div
                    key={exercise.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      index === currentExercise
                        ? 'bg-primary/10 border-primary/20'
                        : exercise.completed
                        ? 'bg-green-50 border-green-200'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setCurrentExercise(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {exercise.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : index === currentExercise ? (
                          <Play className="h-5 w-5 text-primary" />
                        ) : (
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <div className="font-medium text-sm">{exercise.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {exercise.duration} min
                          </div>
                        </div>
                      </div>
                      {index === currentExercise && (
                        <ChevronRight className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Insight del Giorno
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <Heart className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Ricorda di mantenere sempre un atteggiamento positivo e paziente. 
                  Il tuo pet percepisce le tue emozioni e risponderà meglio in un ambiente sereno.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Azioni Rapide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive"
                      size="sm" 
                      className="w-full justify-start"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Interrompi Protocollo
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Conferma interruzione</AlertDialogTitle>
                      <AlertDialogDescription>
                         Sei sicuro di voler interrompere definitivamente il protocollo "{protocol.title}"? 
                         Questa azione fermerà il protocollo e dovrai riavviarlo dall'inizio se vorrai riprenderlo.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annulla</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleInterruptProtocol}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Sì, interrompi
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TrainingDashboard;