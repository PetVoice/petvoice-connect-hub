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
  const baseExercises: Record<string, Exercise[]> = {
    ansia: [
      {
        id: '1',
        title: 'Desensibilizzazione ai Rumori di Partenza',
        description: 'Graduale esposizione ai suoni che precedono la tua partenza per ridurre l\'ansia anticipatoria',
        duration: 15,
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
        id: '2',
        title: 'Uscite Progressive',
        description: 'Incremento graduale del tempo di assenza per costruire tolleranza',
        duration: 20,
        instructions: [
          'Esci per 30 secondi e rientra',
          'Ignora il pet per 2 minuti al rientro',
          'Incrementa a 2 minuti di assenza',
          'Continua ignorando reazioni eccessive',
          'Premia solo quando è calmo'
        ],
        materials: ['Timer', 'Diffusore feromoni', 'Playlist rilassante'],
        completed: false
      },
      {
        id: '3',
        title: 'Creazione Area Sicura',
        description: 'Stabilire uno spazio comfort per quando il pet rimane solo',
        duration: 10,
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
    aggressivita: [
      {
        id: '1',
        title: 'Controllo Impulsi Base',
        description: 'Esercizi fondamentali per insegnare autocontrollo e ridurre reattività',
        duration: 12,
        instructions: [
          'Comando "seduto" con distrazioni presenti',
          'Mantieni posizione per 30 secondi',
          'Premia solo se rimane fermo',
          'Incrementa gradualmente le distrazioni',
          'Termina sempre con successo'
        ],
        materials: ['Pettorina anti-tiro', 'Clicker', 'Snack alta appetibilità'],
        completed: false
      },
      {
        id: '2',
        title: 'Distanza Sicura e Socializzazione',
        description: 'Lavoro a distanza controllata con stimoli scatenanti',
        duration: 18,
        instructions: [
          'Identifica la distanza soglia di reazione',
          'Posizionati a distanza sicura dallo stimolo',
          'Premia per attenzione verso di te',
          'Avvicinati di 1 metro solo se rimane calmo',
          'Allontanati se mostra segni di tensione'
        ],
        materials: ['Guinzaglio lungo 3m', 'Clicker', 'Premi alta gratificazione'],
        completed: false
      },
      {
        id: '3',
        title: 'Ridirezione Focus',
        description: 'Tecniche per spostare l\'attenzione da stimoli trigger',
        duration: 15,
        instructions: [
          'Pratica comando "guardami" senza distrazioni',
          'Introduce stimolo blando a distanza',
          'Usa comando "guardami" quando nota lo stimolo',
          'Premia immediatamente il contatto visivo',
          'Ripeti incrementando intensità gradualmente'
        ],
        materials: ['Snack odorosi', 'Clicker', 'Guinzaglio corto'],
        completed: false
      }
    ],
    iperattivita: [
      {
        id: '1',
        title: 'Esercizi di Calma Controllata',
        description: 'Insegnare stati di calma attraverso esercizi strutturati',
        duration: 10,
        instructions: [
          'Comando "seduto" per 15 secondi',
          'Comando "terra" mantenendo posizione',
          'Premia la calma, non l\'eccitazione',
          'Incrementa gradualmente i tempi',
          'Usa voce calma e movimenti lenti'
        ],
        materials: ['Tappetino relax', 'Timer', 'Snack calmi'],
        completed: false
      },
      {
        id: '2',
        title: 'Canalizzazione Energia',
        description: 'Attività strutturate per sfogare energia in modo positivo',
        duration: 20,
        instructions: [
          'Sessione gioco con regole (inizia/stop)',
          'Alterna 2 minuti gioco e 1 minuto pausa',
          'Usa comando "stop" per interrompere',
          'Premia l\'autocontrollo durante le pause',
          'Termina sempre con calma'
        ],
        materials: ['Corda da gioco', 'Puzzle feeder', 'Timer sessioni'],
        completed: false
      },
      {
        id: '3',
        title: 'Stimolazione Mentale Avanzata',
        description: 'Puzzle e giochi cognitivi per stancare mentalmente',
        duration: 15,
        instructions: [
          'Presenta puzzle di difficoltà adeguata',
          'Non aiutare troppo, lascia sperimentare',
          'Premia i tentativi, non solo il successo',
          'Ruota i giochi per mantenere interesse',
          'Termina prima che si frustri'
        ],
        materials: ['Puzzle feeder', 'Giocattoli Kong', 'Tappeto sniffing'],
        completed: false
      }
    ],
    paura: [
      {
        id: '1',
        title: 'Esposizione Graduale ai Suoni',
        description: 'Desensibilizzazione sistematica ai rumori che causano paura',
        duration: 25,
        instructions: [
          'Inizia con volume molto basso del suono trigger',
          'Mantieni il pet rilassato con attività positive',
          'Incrementa volume solo se rimane calmo',
          'Abbassa immediatamente se mostra stress',
          'Associa il suono a esperienze positive'
        ],
        materials: ['App suoni graduali', 'Snack speciali', 'Coperta sicurezza'],
        completed: false
      },
      {
        id: '2',
        title: 'Costruzione Fiducia',
        description: 'Esercizi per aumentare sicurezza di sé e ridurre ansia generale',
        duration: 12,
        instructions: [
          'Esercizi semplici che conosce bene',
          'Premia ogni piccolo successo abbondantemente',
          'Usa tono di voce incoraggiante',
          'Evita di forzare se mostra resistenza',
          'Termina sempre con esperienza positiva'
        ],
        materials: ['Snack preferiti', 'Giocattolo comfort', 'Voce calma'],
        completed: false
      },
      {
        id: '3',
        title: 'Tecnica Contro-Condizionamento',
        description: 'Associare stimoli paurosi con esperienze piacevoli',
        duration: 18,
        instructions: [
          'Presenta stimolo a distanza/intensità minima',
          'Inizia immediatamente attività piacevole',
          'Mantieni associazione positiva per tutto il tempo',
          'Termina prima che lo stimolo diventi troppo intenso',
          'Ripeti fino a creare associazione positiva'
        ],
        materials: ['Stimolo graduabile', 'Gioco preferito', 'Snack alta gratificazione'],
        completed: false
      }
    ],
    socializzazione: [
      {
        id: '1',
        title: 'Incontri Controllati',
        description: 'Socializzazione guidata con persone e animali nuovi',
        duration: 20,
        instructions: [
          'Scegli persona/animale calmo e amichevole',
          'Inizia con distanza di comfort',
          'Premia comportamenti sociali positivi',
          'Mantieni incontri brevi e positivi',
          'Termina prima di sovrastimolazione'
        ],
        materials: ['Guinzaglio corto', 'Snack premio', 'Persona collaborativa'],
        completed: false
      },
      {
        id: '2',
        title: 'Esposizione Ambientale',
        description: 'Abituazione graduale a nuovi ambienti e situazioni',
        duration: 15,
        instructions: [
          'Scegli ambiente nuovo ma non caotico',
          'Lascia esplorare al suo ritmo',
          'Premia curiosità e investigazione',
          'Non forzare interazione se riluttante',
          'Mantieni esperienze positive'
        ],
        materials: ['Guinzaglio lungo', 'Snack motivanti', 'Borsa premio'],
        completed: false
      },
      {
        id: '3',
        title: 'Gioco Sociale Strutturato',
        description: 'Attività di gruppo per migliorare competenze sociali',
        duration: 25,
        instructions: [
          'Organizza gioco con animale ben socializzato',
          'Supervisiona interazioni costantemente',
          'Interrompi se gioco diventa troppo intenso',
          'Premia gioco appropriato e pause naturali',
          'Termina con tutti i partecipanti calmi'
        ],
        materials: ['Giocattoli condivisi', 'Spazio sicuro', 'Snack per tutti'],
        completed: false
      }
    ],
    default: [
      {
        id: '1',
        title: 'Valutazione Comportamentale',
        description: 'Osservazione e registrazione del comportamento attuale',
        duration: 10,
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
        id: '2',
        title: 'Stabilimento Routine Base',
        description: 'Creazione di routine strutturata per stabilità',
        duration: 15,
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
        id: '3',
        title: 'Rinforzo Positivo Base',
        description: 'Fondamenti del training con rinforzo positivo',
        duration: 12,
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
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [protocolRating, setProtocolRating] = useState(5);
  const [protocolNotes, setProtocolNotes] = useState('');
  
  // STATO SEMPLICE PER IL PROGRESSO GIORNALIERO
  const [dailyCompletedExercises, setDailyCompletedExercises] = useState(0);

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

      // INCREMENTA IL PROGRESSO LOCALE GIORNALIERO
      setDailyCompletedExercises(prev => prev + 1);

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

      // Reset form se necessario
      
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
  
  // FOTTUTAMENTE SEMPLICE: Stato che parte da 0 e si incrementa sui click
  const totalExercisesToday = 3; // Sempre 3 esercizi per giorno
  const completedExercises = dailyCompletedExercises; // Questo DEVE funzionare!
  const dayProgress = (completedExercises / totalExercisesToday) * 100;

  console.log('🔥 STATO PULSANTI:', {
    dailyCompletedExercises,
    completedExercises, 
    totalExercisesToday,
    dayProgress,
    currentExercise
  });

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
                <div className="text-lg font-bold">{completedExercises}/{totalExercisesToday}</div>
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
              <span>{completedExercises} di {totalExercisesToday}</span>
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
                  {currentExercise + 1} di {totalExercisesToday}
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

              {/* Esercizi di Oggi */}
              <div>
                <h3 className="font-semibold mb-3">Esercizi di Oggi</h3>
                <div className="space-y-2">
                  {todayExercises.slice(0, 3).map((exercise, index) => (
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
                
                {/* Dettagli Esercizio Corrente */}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Book className="h-4 w-4" />
                    Dettagli: {currentEx.title}
                  </h4>
                  
                  <div className="space-y-4 text-sm">
                    {/* Descrizione */}
                    <div>
                      <h5 className="font-medium text-blue-800 mb-1">📝 Descrizione:</h5>
                      <p className="text-blue-700 leading-relaxed">{currentEx.description}</p>
                    </div>
                    
                    {/* Istruzioni Step-by-Step */}
                    <div>
                      <h5 className="font-medium text-blue-800 mb-2">🎯 Istruzioni passo-passo:</h5>
                      <ol className="list-decimal list-inside space-y-1 text-blue-700">
                        {currentEx.instructions.map((instruction, index) => (
                          <li key={index} className="leading-relaxed">{instruction}</li>
                        ))}
                      </ol>
                    </div>
                    
                    {/* Materiali necessari */}
                    <div>
                      <h5 className="font-medium text-blue-800 mb-2">🛠️ Materiali necessari:</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {currentEx.materials.map((material, index) => (
                          <div key={index} className="flex items-center gap-2 text-blue-700">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            {material}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Info aggiuntive */}
                    <div className="flex items-center gap-4 pt-2 border-t border-blue-200">
                      <div className="flex items-center gap-1 text-blue-600">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">Durata: {currentEx.duration} minuti</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600">
                        <Target className="h-4 w-4" />
                        <span className="font-medium">Livello: Principiante</span>
                      </div>
                    </div>
                    
                    {/* Consigli */}
                    <div className="bg-blue-100 p-3 rounded-md border border-blue-300">
                      <h5 className="font-medium text-blue-800 mb-1 flex items-center gap-1">
                        <Lightbulb className="h-4 w-4" />
                        💡 Consiglio:
                      </h5>
                      <p className="text-blue-700 text-xs leading-relaxed">
                        Mantieni sempre un atteggiamento positivo e paziente. Se il tuo pet non risponde immediatamente, 
                        ripeti l'esercizio più lentamente e ricompensalo per ogni piccolo progresso.
                      </p>
                    </div>
                  </div>
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

              {/* Completion Button */}
              <Separator />
              
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
                    {currentExercise === 2 
                      ? `Esercizio 3 Completato` 
                      : `Esercizio ${currentExercise + 1} Completato`}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
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