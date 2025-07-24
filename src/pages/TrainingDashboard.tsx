import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Timer, 
  Book,
  Target,
  Star,
  Trophy,
  AlertCircle,
  StopCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data per ora - andrebbe sostituito con veri dati dal database
const mockProtocol = {
  id: 'mock-protocol',
  title: 'Protocollo Training Avanzato',
  description: 'Un protocollo completo per il training del tuo pet',
  exercises: [
    {
      id: 'ex1',
      title: 'Esercizio 1: Rilassamento',
      description: 'Primo esercizio di rilassamento per calmare il pet',
      duration: 15,
      instructions: ['Trova un ambiente tranquillo', 'Fai sedere il pet', 'Inizia le carezze dolci'],
      materials: ['Tappetino', 'Premio']
    },
    {
      id: 'ex2', 
      title: 'Esercizio 2: Concentrazione',
      description: 'Esercizio per migliorare la concentrazione',
      duration: 20,
      instructions: ['Usa il comando di attenzione', 'Mantieni il contatto visivo', 'Premia i comportamenti corretti'],
      materials: ['Premio', 'Clicker']
    },
    {
      id: 'ex3',
      title: 'Esercizio 3: Controllo impulsi',
      description: 'Training per il controllo degli impulsi',
      duration: 25,
      instructions: ['Inizia con il comando "aspetta"', 'Aumenta gradualmente la difficoltà', 'Premia la pazienza'],
      materials: ['Premio', 'Guinzaglio']
    }
  ]
};

const TrainingDashboard: React.FC = () => {
  const { protocolId } = useParams<{ protocolId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Stati semplificati
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');

  const protocol = mockProtocol;
  const allExercises = protocol.exercises;
  const currentExercise = allExercises[currentExerciseIndex];
  const totalExercises = allExercises.length;
  const progressPercentage = Math.floor((completedExercises.size / totalExercises) * 100);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerActive) {
      interval = setInterval(() => {
        setTimeElapsed(time => time + 1);
      }, 1000);
    } else if (!isTimerActive && timeElapsed !== 0) {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timeElapsed]);

  // Avvia timer automaticamente
  useEffect(() => {
    setIsTimerActive(true);
    setTimeElapsed(0);
  }, [currentExerciseIndex]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompleteExercise = () => {
    if (!currentExercise) return;

    if (completedExercises.has(currentExercise.id)) {
      return;
    }

    // Marca esercizio come completato
    const newCompleted = new Set(completedExercises);
    newCompleted.add(currentExercise.id);
    setCompletedExercises(newCompleted);

    // Se è l'ultimo esercizio, mostra dialog valutazione
    if (newCompleted.size === totalExercises) {
      setTimeout(() => {
        setShowRatingDialog(true);
      }, 2000);
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
    }
  };

  const handleNextExercise = () => {
    // Prima completa l'esercizio corrente se non è già completato
    if (!completedExercises.has(currentExercise.id)) {
      handleCompleteExercise();
    }
    
    // Se non è l'ultimo esercizio, vai al prossimo
    if (currentExerciseIndex < totalExercises - 1) {
      setTimeout(() => {
        setCurrentExerciseIndex(prev => prev + 1);
      }, 500);
    }
  };

  const handleInterruptProtocol = () => {
    toast({
      title: 'Protocollo interrotto',
      description: 'Il protocollo è stato interrotto.',
    });

    setTimeout(() => {
      navigate('/training');
    }, 1500);
  };

  const handleSubmitRating = () => {
    toast({
      title: 'Protocollo completato!',
      description: 'Congratulazioni! Hai completato tutto il protocollo.',
    });

    setTimeout(() => {
      navigate('/training');
    }, 2000);
  };

  if (!currentExercise) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Nessun esercizio disponibile</h2>
          <p className="text-muted-foreground mb-4">
            Non ci sono esercizi configurati per questo protocollo.
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
              <Target className="h-3 w-3 mr-1" />
              Esercizio {currentExerciseIndex + 1} di {totalExercises}
            </Badge>
          </div>
          <p className="text-muted-foreground">{protocol.description}</p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-lg font-bold">{completedExercises.size}/{totalExercises}</div>
                <p className="text-xs text-muted-foreground">Esercizi completati</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-lg font-bold">{progressPercentage}%</div>
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
                <div className="text-lg font-bold">90%</div>
                <p className="text-xs text-muted-foreground">Tasso successo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso Protocollo</span>
              <span>{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Esercizio Corrente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {completedExercises.has(currentExercise.id) ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <Clock className="h-6 w-6 text-primary" />
                  )}
                  <CardTitle className="text-xl">{currentExercise.title}</CardTitle>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {currentExercise.duration} min
                </div>
                <div className="flex items-center gap-1">
                  <Timer className="h-4 w-4" />
                  {formatTime(timeElapsed)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">{currentExercise.description}</p>

              {/* Dettagli Esercizio */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Book className="h-4 w-4" />
                  Dettagli: {currentExercise.title}
                </h4>
                
                <div className="space-y-4 text-sm">
                  {/* Descrizione */}
                  <div>
                    <h5 className="font-medium text-blue-800 mb-1">📝 Descrizione:</h5>
                    <p className="text-blue-700 leading-relaxed">{currentExercise.description}</p>
                  </div>
                  
                  {/* Istruzioni */}
                  <div>
                    <h5 className="font-medium text-blue-800 mb-2">🎯 Istruzioni passo-passo:</h5>
                    <ol className="list-decimal list-inside space-y-1 text-blue-700">
                      {currentExercise.instructions.map((instruction, index) => (
                        <li key={index} className="leading-relaxed">{instruction}</li>
                      ))}
                    </ol>
                  </div>
                  
                  {/* Materiali */}
                  <div>
                    <h5 className="font-medium text-blue-800 mb-2">🛠️ Materiali necessari:</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {currentExercise.materials.map((material, index) => (
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
                      <span className="font-medium">Durata: {currentExercise.duration} minuti</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-600">
                      <Target className="h-4 w-4" />
                      <span className="font-medium">Livello: Principiante</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pulsanti Azione */}
              <div className="flex gap-4">
                {/* Pulsante Indietro */}
                <Button
                  onClick={handlePreviousExercise}
                  disabled={currentExerciseIndex === 0}
                  variant="outline"
                  className="flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Indietro
                </Button>

                {/* Pulsante Avanti */}
                <Button
                  onClick={handleNextExercise}
                  disabled={currentExerciseIndex === totalExercises - 1}
                  variant="outline"
                  className="flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Avanti
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>

              {/* Pulsante Interrompi */}
              <Button
                onClick={handleInterruptProtocol}
                variant="destructive"
                className="w-full"
              >
                <StopCircle className="h-4 w-4 mr-2" />
                Interrompi Protocollo
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar con navigazione esercizi */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tutti gli Esercizi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {allExercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    index === currentExerciseIndex
                      ? 'bg-primary/10 border-primary/20'
                      : completedExercises.has(exercise.id)
                      ? 'bg-green-50 border-green-200'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setCurrentExerciseIndex(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {completedExercises.has(exercise.id) ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : index === currentExerciseIndex ? (
                        <Clock className="h-4 w-4 text-primary" />
                      ) : (
                        <div className="w-4 h-4 border border-muted-foreground rounded-full" />
                      )}
                      <div>
                        <div className="font-medium text-sm">{exercise.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {exercise.duration} min
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog Valutazione */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🎉 Protocollo Completato!</DialogTitle>
            <DialogDescription>
              Complimenti! Hai completato tutto il protocollo "{protocol.title}". 
              Come valuteresti la tua esperienza?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Valutazione (1-5 stelle)</label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 cursor-pointer ${
                      star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Note aggiuntive (opzionale)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Scrivi qui i tuoi commenti..."
                className="mt-2"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitRating}
                className="flex-1"
              >
                Completa Protocollo
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/training')}
                className="flex-1"
              >
                Salta Valutazione
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrainingDashboard;