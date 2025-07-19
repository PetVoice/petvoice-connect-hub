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
import {
  Calendar,
  Clock,
  CheckCircle,
  Target,
  ArrowLeft,
  Play,
  Pause,
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
  const [exerciseRating, setExerciseRating] = useState(5);
  const [exerciseNotes, setExerciseNotes] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [dayRating, setDayRating] = useState([5]);

  const protocol = protocols?.find(p => p.id === protocolId);

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
      const currentEx = todayExercises[currentExercise];
      
      // Aggiorna l'esercizio corrente come completato
      const updatedExercises = [...todayExercises];
      updatedExercises[currentExercise].completed = true;
      updatedExercises[currentExercise].rating = exerciseRating;
      updatedExercises[currentExercise].notes = exerciseNotes;

      toast({
        title: 'Esercizio completato!',
        description: `Hai completato "${currentEx.title}" con successo.`,
      });

      // Calcola il progresso basato sugli esercizi completati
      const completedCount = updatedExercises.filter(ex => ex.completed).length;
      const totalExercisesToday = todayExercises.length;
      
      // Calcola il progresso totale del protocollo
      const exercisesPerDay = totalExercisesToday;
      const totalExercises = protocol.duration_days * exercisesPerDay;
      const completedExercisesTotal = ((protocol.current_day - 1) * exercisesPerDay) + completedCount;
      const newProgressPercentage = Math.round((completedExercisesTotal / totalExercises) * 100);

      // Se è l'ultimo esercizio della giornata, avanza al giorno successivo
      if (completedCount === totalExercisesToday) {
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
        await updateProtocol.mutateAsync({
          id: protocol.id,
          updates: {
            progress_percentage: Math.min(newProgressPercentage, 100),
            last_activity_at: new Date().toISOString(),
          }
        });

        // Passa al prossimo esercizio
        setCurrentExercise(prev => prev + 1);
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

  const currentEx = todayExercises[currentExercise];
  const completedExercises = todayExercises.filter(ex => ex.completed).length;
  const totalExercises = todayExercises.length;
  const dayProgress = (completedExercises / totalExercises) * 100;

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
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
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
              <CheckCircle className="h-5 w-5 text-purple-500" />
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
                      <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
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
                      Completa Esercizio
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
                        ? 'bg-purple-50 border-purple-200'
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
                          <Play className="h-5 w-5 text-purple-500" />
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
                        <ChevronRight className="h-4 w-4 text-purple-500" />
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
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Camera className="h-4 w-4 mr-2" />
                  Aggiungi Foto
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Mic className="h-4 w-4 mr-2" />
                  Nota Vocale
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Vedi Progresso
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TrainingDashboard;