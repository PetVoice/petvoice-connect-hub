import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompleteExercise } from '@/hooks/useTrainingProtocols';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
  ChevronRight,
  Square
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useToastWithIcon } from '@/hooks/use-toast-with-icons';

const TrainingDashboard: React.FC = () => {
  const { protocolId } = useParams<{ protocolId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { showToast } = useToastWithIcon();
  
  // Hook per completare esercizi e salvare progressi
  const completeExercise = useCompleteExercise();

  // Stati semplificati
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [showInterruptDialog, setShowInterruptDialog] = useState(false);
  const [rating, setRating] = useState(0);

  // Query per ottenere i dati reali del protocollo
  const { data: protocolData, isLoading, error } = useQuery({
    queryKey: ['protocol-with-exercises', protocolId],
    queryFn: async () => {
      if (!protocolId) throw new Error('Protocol ID not found');
      
      // Prima ottieni il protocollo
      const { data: protocol, error: protocolError } = await supabase
        .from('ai_training_protocols')
        .select('*')
        .eq('id', protocolId)
        .single();

      if (protocolError) throw protocolError;

      // Poi ottieni tutti gli esercizi del protocollo
      const { data: exercises, error: exercisesError } = await supabase
        .from('ai_training_exercises')
        .select('*')
        .eq('protocol_id', protocolId)
        .order('day_number, id');

      if (exercisesError) throw exercisesError;

      return {
        ...protocol,
        exercises: exercises || []
      };
    },
    enabled: !!protocolId,
  });

  const protocol = protocolData;
  const allExercises = protocol?.exercises || [];
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

  // Carica gli esercizi completati dal database all'avvio
  useEffect(() => {
    if (allExercises.length > 0) {
      const completedIds = allExercises
        .filter(exercise => exercise.completed)
        .map(exercise => exercise.id);
      setCompletedExercises(new Set(completedIds));
      
      // Trova il primo esercizio non completato e imposta l'indice corrente
      const firstIncompleteIndex = allExercises.findIndex(exercise => !exercise.completed);
      
      // Se tutti gli esercizi sono completati, rimani sull'ultimo
      // Altrimenti vai al primo esercizio non completato
      if (firstIncompleteIndex === -1) {
        setCurrentExerciseIndex(allExercises.length - 1);
      } else {
        setCurrentExerciseIndex(firstIncompleteIndex);
      }
    }
  }, [allExercises]);

  if (isLoading) {
    return <div className="container mx-auto p-6"><div>Caricamento...</div></div>;
  }

  if (error || !protocol) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Protocollo non trovato</h2>
          <p className="text-muted-foreground mb-4">
            Il protocollo richiesto non è disponibile.
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

  const getDifficultyText = (difficulty: string) => {
    const difficultyMap: Record<string, string> = {
      facile: 'Facile',
      medio: 'Medio',
      intermedio: 'Intermedio',
      difficile: 'Difficile',
      avanzato: 'Avanzato'
    };
    return difficultyMap[difficulty.toLowerCase()] || difficulty;
  };

  const handleCompleteExercise = async () => {
    if (!currentExercise || !protocolId) return;

    if (completedExercises.has(currentExercise.id)) {
      return;
    }

    try {
      // SALVA NEL DATABASE usando il nostro hook
      await completeExercise.mutateAsync({
        exerciseId: currentExercise.id,
        protocolId: protocolId
      });

      // Aggiorna lo stato locale SOLO dopo il salvataggio nel database
      const newCompleted = new Set(completedExercises);
      newCompleted.add(currentExercise.id);
      setCompletedExercises(newCompleted);

      // Se è l'ultimo esercizio, mostra dialog valutazione
      if (newCompleted.size === totalExercises) {
        setTimeout(() => {
          setShowRatingDialog(true);
        }, 2000);
      }
    } catch (error) {
      console.error('Errore nel completare l\'esercizio:', error);
      // Il toast di errore è gestito dal hook useCompleteExercise
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
    
    // Se è l'ultimo esercizio, completa automaticamente il protocollo
    if (currentExerciseIndex === totalExercises - 1) {
      // Forza il completamento del protocollo
      handleCompleteExercise();
      return;
    }
    
    // Altrimenti vai al prossimo esercizio
    setTimeout(() => {
      setCurrentExerciseIndex(prev => prev + 1);
    }, 500);
  };

  const handleInterruptProtocol = () => {
    setShowInterruptDialog(true);
  };

  const handleSubmitRating = async () => {
    if (!rating) return;

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not found');

      // Salva la valutazione nel database
      const { error: ratingError } = await supabase
        .from('protocol_ratings')
        .insert({
          protocol_id: protocolId,
          user_id: user.user.id,
          rating: rating
        });

      if (ratingError) throw ratingError;

      // Aggiorna lo status del protocollo a completato
      const { error: protocolError } = await supabase
        .from('ai_training_protocols')
        .update({
          status: 'completed',
          progress_percentage: '100',
          updated_at: new Date().toISOString()
        })
        .eq('id', protocolId)
        .eq('user_id', user.user.id);

      if (protocolError) throw protocolError;

      showToast({
        title: 'Protocollo completato!',
        description: 'Grazie per la tua valutazione! Hai completato tutto il protocollo.',
        type: 'success'
      });

      setTimeout(() => {
        navigate('/training');
      }, 2000);
    } catch (error) {
      console.error('Errore nel salvare la valutazione:', error);
      showToast({
        title: 'Errore',
        description: 'Errore nel salvare la valutazione. Riprova.',
        type: 'error'
      });
    }
  };

  const confirmInterruptProtocol = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !protocolId) throw new Error('User or protocol not found');

      // Aggiorna lo status del protocollo a "paused" nel database
      const { error: protocolError } = await supabase
        .from('ai_training_protocols')
        .update({
          status: 'paused',
          last_activity_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', protocolId)
        .eq('user_id', user.id);

      if (protocolError) throw protocolError;

      showToast({
        title: 'Protocollo interrotto',
        description: 'Il protocollo è stato interrotto e rimosso dai protocolli attivi.',
        type: 'delete'
      });

      setShowInterruptDialog(false);
      navigate('/training');
    } catch (error) {
      console.error('Errore nell\'interrompere il protocollo:', error);
      showToast({
        title: 'Errore',
        description: 'Non è stato possibile interrompere il protocollo. Riprova.',
        type: 'error'
      });
    }
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
                <div className="text-lg font-bold">{protocol.success_rate}%</div>
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
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
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
                  {currentExercise.duration_minutes} min
                </div>
                <div className="flex items-center gap-1">
                  <Timer className="h-4 w-4" />
                  {formatTime(timeElapsed)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dettagli Esercizio */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Book className="h-4 w-4" />
                  Dettagli: {currentExercise.title}
                </h4>
                
                <div className="space-y-4 text-sm">
                  {/* Descrizione Dettagliata */}
                  <div>
                    <h5 className="font-medium text-blue-800 mb-1">📝 Descrizione:</h5>
                    <p className="text-blue-700 leading-relaxed">{currentExercise.description}</p>
                  </div>
                  
                  {/* Obiettivi */}
                  {currentExercise.objectives && currentExercise.objectives.length > 0 && (
                    <div>
                      <h5 className="font-medium text-blue-800 mb-2">🎯 Obiettivi:</h5>
                      <ul className="list-disc list-inside space-y-1 text-blue-700">
                        {currentExercise.objectives.map((objective, index) => (
                          <li key={index} className="leading-relaxed">{objective}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Istruzioni */}
                  {currentExercise.instructions && currentExercise.instructions.length > 0 && (
                    <div>
                      <h5 className="font-medium text-blue-800 mb-2">📋 Istruzioni passo-passo:</h5>
                      <ol className="list-decimal list-inside space-y-1 text-blue-700">
                        {currentExercise.instructions.map((instruction, index) => (
                          <li key={index} className="leading-relaxed">{instruction}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  
                  {/* Criteri di Successo */}
                  {currentExercise.success_criteria && currentExercise.success_criteria.length > 0 && (
                    <div>
                      <h5 className="font-medium text-blue-800 mb-2">✅ Criteri di Successo:</h5>
                      <ul className="list-disc list-inside space-y-1 text-green-700">
                        {currentExercise.success_criteria.map((criteria, index) => (
                          <li key={index} className="leading-relaxed">{criteria}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Consigli Pratici */}
                  {currentExercise.tips && currentExercise.tips.length > 0 && (
                    <div>
                      <h5 className="font-medium text-blue-800 mb-2">💡 Consigli Pratici:</h5>
                      <ul className="list-disc list-inside space-y-1 text-orange-700">
                        {currentExercise.tips.map((tip, index) => (
                          <li key={index} className="leading-relaxed">{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Materiali */}
                  {currentExercise.materials && currentExercise.materials.length > 0 && (
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
                  )}
                  
                  {/* Info aggiuntive */}
                  <div className="flex items-center gap-4 pt-2 border-t border-blue-200">
                    <div className="flex items-center gap-1 text-blue-600">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Durata: {currentExercise.duration_minutes} minuti</span>
                    </div>
                    {currentExercise.level && (
                      <div className="flex items-center gap-1 text-blue-600">
                        <Target className="h-4 w-4" />
                        <span className="font-medium">Livello: {getDifficultyText(currentExercise.level)}</span>
                      </div>
                    )}
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
                  variant="outline"
                  className="flex-1"
                >
                  {currentExerciseIndex === totalExercises - 1 ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completa protocollo
                    </>
                  ) : (
                    <>
                      Avanti
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>

              {/* Pulsante Interrompi - nascosto quando si è all'ultimo esercizio */}
              {currentExerciseIndex !== totalExercises - 1 && (
                <Button
                  onClick={handleInterruptProtocol}
                  variant="destructive"
                  size="sm"
                  className="w-full"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Interrompi
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar con navigazione esercizi - Layout migliorato */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tutti gli Esercizi</CardTitle>
              <p className="text-sm text-muted-foreground">{completedExercises.size}/{totalExercises} completati</p>
            </CardHeader>
            <CardContent>
              {/* Lista scrollabile solo verticale */}
              <ScrollArea className="h-96">
                <div className="grid grid-cols-1 gap-2 pr-4">
                {allExercises.map((exercise, index) => (
                  <div
                    key={exercise.id}
                    className={`p-3 rounded-lg border transition-all ${
                      completedExercises.has(exercise.id)
                        ? 'bg-green-50 border-green-200'
                        : index === currentExerciseIndex
                        ? 'bg-primary/10 border-primary/20'
                        : 'bg-muted/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {completedExercises.has(exercise.id) ? (
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : index === currentExerciseIndex ? (
                          <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 border border-muted-foreground rounded-full flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{exercise.title}</div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {exercise.duration_minutes} min
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {index + 1}
                        </Badge>
                        {index === currentExerciseIndex && (
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog Valutazione */}
      <Dialog open={showRatingDialog} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🎉 Protocollo Completato!</DialogTitle>
            <DialogDescription>
              Complimenti! Hai completato tutto il protocollo "{protocol.title}". 
              Valuta la tua esperienza per completare.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Valutazione obbligatoria (1-10)</label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                  const getScoreColor = (score: number) => {
                    if (score <= 3) return 'bg-red-500 hover:bg-red-600 text-white';
                    if (score <= 5) return 'bg-orange-500 hover:bg-orange-600 text-white';
                    if (score <= 7) return 'bg-yellow-500 hover:bg-yellow-600 text-white';
                    return 'bg-green-500 hover:bg-green-600 text-white';
                  };

                  return (
                    <Button
                      key={score}
                      variant={rating === score ? "default" : "outline"}
                      size="sm"
                      className={`${rating === score ? getScoreColor(score) : ''} transition-all`}
                      onClick={() => setRating(score)}
                    >
                      {score}
                    </Button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                1 = 0% di successo, 10 = 100% di successo
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitRating}
                disabled={!rating}
                className="flex-1 disabled:opacity-50"
              >
                Completa Protocollo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Conferma Interruzione */}
      <Dialog open={showInterruptDialog} onOpenChange={setShowInterruptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>⚠️ Conferma Interruzione</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler interrompere il protocollo? I progressi attuali verranno persi.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowInterruptDialog(false)}
              className="flex-1"
            >
              Annulla
            </Button>
            <Button
              variant="destructive"
              onClick={confirmInterruptProtocol}
              className="flex-1"
            >
              Interrompi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrainingDashboard;