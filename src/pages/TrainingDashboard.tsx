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
import { useTrainingProtocols, useUpdateProtocol } from '@/hooks/useTrainingProtocols';
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

  // Mock exercises per il giorno corrente
  const todayExercises: Exercise[] = [
    {
      id: '1',
      title: 'Esercizio di Rilassamento',
      description: 'Aiuta il tuo pet a rilassarsi attraverso tecniche di respirazione guidata',
      duration: 10,
      instructions: [
        'Trova un ambiente tranquillo e silenzioso',
        'Fai sedere il tuo pet in posizione comoda',
        'Parla con voce calma e rassicurante',
        'Accarezza delicatamente per 5 minuti',
        'Osserva i segni di rilassamento'
      ],
      materials: ['Tappetino morbido', 'Ambiente silenzioso'],
      completed: false
    },
    {
      id: '2',
      title: 'Training di Socializzazione',
      description: 'Graduale esposizione a stimoli sociali controllati',
      duration: 15,
      instructions: [
        'Inizia con suoni a basso volume',
        'Premia ogni comportamento positivo',
        'Incrementa gradualmente l\'intensità',
        'Mantieni sempre un atteggiamento positivo',
        'Interrompi se noti segni di stress'
      ],
      materials: ['Snack premio', 'Audio di suoni sociali'],
      completed: false
    },
    {
      id: '3',
      title: 'Rinforzo Positivo',
      description: 'Consolida i comportamenti desiderati attraverso il rinforzo',
      duration: 8,
      instructions: [
        'Aspetta il comportamento naturale',
        'Premia immediatamente',
        'Usa comando vocale chiaro',
        'Ripeti 5-7 volte',
        'Termina sempre con un premio'
      ],
      materials: ['Snack high-value', 'Clicker (opzionale)'],
      completed: false
    }
  ];

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
    const updatedExercises = [...todayExercises];
    updatedExercises[currentExercise].completed = true;
    updatedExercises[currentExercise].rating = exerciseRating;
    updatedExercises[currentExercise].notes = exerciseNotes;

    toast({
      title: 'Esercizio completato!',
      description: `Hai completato "${updatedExercises[currentExercise].title}" con successo.`,
    });

    // Se è l'ultimo esercizio della giornata
    if (currentExercise === todayExercises.length - 1) {
      const completedExercises = updatedExercises.filter(ex => ex.completed).length;
      const progressPercentage = Math.round((protocol.current_day / protocol.duration_days) * 100);
      
      try {
        await updateProtocol.mutateAsync({
          id: protocol.id,
          updates: {
            current_day: protocol.current_day + 1,
            progress_percentage: Math.min(progressPercentage + (100 / protocol.duration_days), 100),
            last_activity_at: new Date().toISOString(),
          }
        });

        toast({
          title: 'Giornata completata!',
          description: `Hai completato tutti gli esercizi del giorno ${protocol.current_day}. Ottimo lavoro!`,
        });
      } catch (error) {
        console.error('Error updating protocol:', error);
      }
    } else {
      setCurrentExercise(prev => prev + 1);
    }

    // Reset form
    setExerciseRating(5);
    setExerciseNotes('');
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