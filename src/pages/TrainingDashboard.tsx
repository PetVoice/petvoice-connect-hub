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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { useTranslatedToast } from '@/hooks/use-translated-toast';
import { useToastWithIcon } from '@/hooks/use-toast-with-icons';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProtocolTranslations } from '@/utils/protocolTranslations';

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

// Rimossa funzione getExercisesForProtocol hardcoded - ora usiamo esercizi dal database

const TrainingDashboard: React.FC = () => {
  const { protocolId } = useParams<{ protocolId: string }>();
  const navigate = useNavigate();
  const { showToast: showTranslatedToast } = useTranslatedToast();
  const { showToast } = useToastWithIcon();
  const { translateProtocolTitle } = useProtocolTranslations();
  const queryClient = useQueryClient();
  const { data: protocols } = useTrainingProtocols();
  const updateProtocol = useUpdateProtocol();
  
  const [currentExercise, setCurrentExercise] = useState(0);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [protocolRating, setProtocolRating] = useState(5);
  const [protocolNotes, setProtocolNotes] = useState('');
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [protocol, setProtocol] = useState<TrainingProtocol | null>(null);
  
  // STATO SEMPLICE PER IL PROGRESSO GIORNALIERO
  const [dailyCompletedExercises, setDailyCompletedExercises] = useState(0);

  // Recupera il protocollo specifico dal database
  useEffect(() => {
    const fetchProtocol = async () => {
      if (!protocolId) return;
      
      const { data, error } = await supabase
        .from('ai_training_protocols')
        .select(`
          *,
          exercises:ai_training_exercises(*),
          metrics:ai_training_metrics(*),
          schedule:ai_training_schedules(*)
        `)
        .eq('id', protocolId)
        .single();
        
      if (error) {
        console.error('Error fetching protocol:', error);
        showToast({
          title: 'Errore',
          description: 'Non è stato possibile caricare il protocollo',
          type: 'error'
        });
        navigate('/training');
        return;
      }
      
      setProtocol({
        ...data,
        difficulty: data.difficulty as 'facile' | 'medio' | 'difficile',
        exercises: Array.isArray(data.exercises) ? data.exercises.map((ex: any) => ({
          ...ex,
          exercise_type: ex.exercise_type as 'physical' | 'mental' | 'behavioral' | 'social'
        })) : [],
        metrics: data.metrics?.[0] || null,
        schedule: data.schedule?.[0] || null,
      } as unknown as TrainingProtocol);
    };
    
    fetchProtocol();
  }, [protocolId, navigate, showTranslatedToast]);

  // Calcola l'esercizio corrente basato sul progresso del protocollo quando il protocollo viene caricato
  useEffect(() => {
    if (protocol && protocol.progress_percentage !== undefined && !hasInitialized) {
      const exercisesPerDay = 3; // Ogni protocollo ha 3 esercizi
      const totalExercises = protocol.duration_days * exercisesPerDay;
      const totalCompletedExercises = Math.floor((parseInt(protocol.progress_percentage || '0') / 100) * totalExercises);
      
      // Calcola quanti esercizi sono stati completati nei giorni precedenti
      const exercisesCompletedInPreviousDays = (protocol.current_day - 1) * exercisesPerDay;
      
      // Calcola gli esercizi completati oggi
      const exercisesCompletedToday = Math.max(0, totalCompletedExercises - exercisesCompletedInPreviousDays);
      
      // L'esercizio corrente è il primo non completato oggi
      const calculatedCurrentExercise = Math.min(exercisesCompletedToday, exercisesPerDay - 1);
      
      console.log('🔄 INIZIALIZZAZIONE PROGRESSO (SOLO UNA VOLTA):', {
        protocol_id: protocol.id,
        progress_percentage: protocol.progress_percentage,
        duration_days: protocol.duration_days,
        current_day: protocol.current_day,
        totalExercises,
        totalCompletedExercises,
        exercisesCompletedInPreviousDays,
        exercisesCompletedToday,
        calculatedCurrentExercise,
        hasInitialized
      });
      
      setCurrentExercise(calculatedCurrentExercise);
      setDailyCompletedExercises(exercisesCompletedToday);
      setHasInitialized(true);
      
      console.log('✅ INIZIALIZZAZIONE COMPLETATA - currentExercise:', calculatedCurrentExercise);
    }
  }, [protocol?.id, hasInitialized]); // RIMOSSO protocol?.progress_percentage dalle dipendenze!

  // Ottieni SOLO gli esercizi del giorno corrente (3 al giorno)
  const todayExercises: Exercise[] = protocol?.exercises ? 
    protocol.exercises
      .filter(ex => ex.day_number === protocol.current_day)
      .map(ex => ({
        id: ex.id,
        title: ex.title,
        description: ex.description || '',
        duration: ex.duration_minutes || 15,
        instructions: ex.instructions || [],
        materials: ex.materials || [],
        completed: ex.completed || false,
        rating: ex.effectiveness_score,
        notes: ex.feedback
      })) : [];

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
    // Redirect automaticamente ai protocolli completati invece di mostrare errore
    navigate('/training?tab=completed');
    return null;
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
        showToast({
          title: 'Errore',
          description: 'Nessun esercizio disponibile per oggi.',
          type: 'error'
        });
        return;
      }

      if (currentExercise >= todayExercises.length || currentExercise < 0) {
        showToast({
          title: 'Errore',
          description: 'Esercizio non valido.',
          type: 'error'
        });
        return;
      }

      const currentEx = todayExercises[currentExercise];
      
      if (!currentEx) {
        showToast({
          title: 'Errore',
          description: 'Esercizio non trovato.',
          type: 'error'
        });
        return;
      }
      
      // Calcola il progresso del protocollo
      const completedCount = currentExercise + 1; // Esercizio appena completato
      const exercisesPerDay = todayExercises.length; // 3 esercizi per giorno
      const totalExercises = exercisesPerDay * protocol.duration_days;
      
      // Calcola totale esercizi completati nel protocollo
      const exercisesCompletedInPreviousDays = (protocol.current_day - 1) * exercisesPerDay;
      const totalCompletedExercises = exercisesCompletedInPreviousDays + completedCount;
      
      // Calcola percentuale (arrotondata verso il basso per evitare valori >= 100)
      const newProgressPercentage = Math.floor((totalCompletedExercises / totalExercises) * 100);

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
      const newDailyCompleted = dailyCompletedExercises + 1;
      setDailyCompletedExercises(newDailyCompleted);

      // Aggiorna il progresso del protocollo nel database
      await updateProtocol.mutateAsync({
        id: protocol.id,
        updates: {
          progress_percentage: Math.min(newProgressPercentage, 100).toString(),
          last_activity_at: new Date().toISOString(),
        }
      });

      // SE È L'ULTIMO ESERCIZIO DEL GIORNO (esercizio 3), PASSA AUTOMATICAMENTE AL GIORNO SUCCESSIVO
      if (completedCount === exercisesPerDay) {
        const isLastDay = protocol.current_day >= protocol.duration_days;
        
        if (isLastDay) {
          // PROTOCOLLO TERMINATO - Mostra dialog di valutazione
          showToast({
            title: `Esercizio ${currentExercise + 1} completato!`,
            description: "Hai completato tutto il protocollo! Valuta la tua esperienza.",
            type: 'achievement'
          });
          
          setTimeout(() => {
            setShowRatingDialog(true);
          }, 2000);
        } else {
          // PASSA AL GIORNO SUCCESSIVO AUTOMATICAMENTE
          
          // 1. Toast per esercizio completato
          showToast({
            title: `Esercizio ${currentExercise + 1} completato!`,
            description: `Giorno ${protocol.current_day} completato! Passaggio automatico al giorno ${protocol.current_day + 1}...`,
            type: 'complete'
          });
          
          // 2. Aggiorna il database: current_day + 1
          setTimeout(async () => {
            const newCurrentDay = protocol.current_day + 1;
            
            // CALCOLA ANCHE IL PROGRESSO AGGIORNATO
            const exercisesPerDay = 3; // Fisso a 3 esercizi per giorno
            const totalExercises = exercisesPerDay * protocol.duration_days;
            const exercisesCompletedInPreviousDays = protocol.current_day * exercisesPerDay; // Tutti i giorni precedenti + oggi completato
            const newProgressPercentage = Math.floor((exercisesCompletedInPreviousDays / totalExercises) * 100);
            
            console.log('🔄 AGGIORNAMENTO PROGRESSO PASSAGGIO GIORNO:', {
              currentDay: protocol.current_day,
              newCurrentDay,
              exercisesPerDay,
              totalExercises,
              exercisesCompletedInPreviousDays,
              newProgressPercentage
            });
            
            await updateProtocol.mutateAsync({
              id: protocol.id,
              updates: {
                current_day: newCurrentDay,
                progress_percentage: Math.min(newProgressPercentage, 100).toString(),
                last_activity_at: new Date().toISOString(),
              }
            });
            
            // 3. AGGIORNA LO STATO LOCALE DEL PROTOCOLLO
            setProtocol(prev => prev ? {
              ...prev,
              current_day: newCurrentDay,
              progress_percentage: Math.min(newProgressPercentage, 100).toString()
            } : null);
            
            // 4. INVALIDA CACHE PER AGGIORNARE PAGINA TRAINING
            queryClient.invalidateQueries({ queryKey: ['active-protocols'] });
            queryClient.invalidateQueries({ queryKey: ['training-protocols'] });
            
            // 5. Reset statistiche del giorno DOPO l'update del database
            setDailyCompletedExercises(0);
            setCurrentExercise(0);
            
            // 6. Toast di congratulazioni per il nuovo giorno
            showToast({
              title: "Nuovo giorno iniziato!",
              description: `Benvenuto al giorno ${newCurrentDay}! Progresso: ${Math.min(newProgressPercentage, 100)}%`,
              type: 'complete'
            });
          }, 2000);
        }
      } else {
        // NON è l'ultimo esercizio del giorno - solo toast normale e passa al prossimo
        showToast({
          title: `Esercizio ${currentExercise + 1} completato!`,
          description: `Ottimo lavoro! Continua con l'esercizio ${currentExercise + 2}.`,
          type: 'exercise'
        });

        // Passa al prossimo esercizio
        setCurrentExercise(prev => prev + 1);
      }

    } catch (error) {
      console.error('Error completing exercise:', error);
      showToast({
        title: 'Errore',
        description: 'Non è stato possibile completare l\'esercizio. Riprova.',
        type: 'error'
      });
    }
  };

  // Funzione per interrompere il protocollo
  const handleInterruptProtocol = async () => {
    if (!protocol) {
      showToast({
        title: 'Errore',
        description: 'Protocollo non trovato.',
        type: 'error'
      });
      return;
    }

    try {
      await updateProtocol.mutateAsync({
        id: protocol.id,
        updates: {
          status: 'available',  // Torna disponibile per essere riavviato
          current_day: 1,       // Reset al giorno 1
          progress_percentage: "0",  // Reset progresso
          last_activity_at: new Date().toISOString(),
        }
      });

      showTranslatedToast({
        title: 'protocol.stopped.title',
        description: 'protocol.stopped.description',
        variant: 'default',
        variables: { protocolName: translateProtocolTitle(protocol.title) }
      });

      // Torna alla dashboard principale
      setTimeout(() => {
        navigate('/training');
      }, 1500);
    } catch (error) {
      console.error('Error pausing protocol:', error);
      showToast({
        title: 'Errore',
        description: 'Non è stato possibile interrompere il protocollo.',
        type: 'error'
      });
    }
  };

  // Funzione per gestire la valutazione del protocollo
  const handleSubmitRating = async () => {
    setIsSubmittingRating(true);
    try {
      // Inserisci o aggiorna la valutazione nel database (UPSERT)
      const { error } = await supabase
        .from('protocol_ratings')
        .upsert({
          protocol_id: protocol.id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          rating: protocolRating,
          comment: protocolNotes.trim() || null
        }, {
          onConflict: 'protocol_id,user_id'
        });

      if (error) {
        console.error('Errore inserimento valutazione:', error);
        showToast({
          title: 'Errore',
          description: 'Non è stato possibile salvare la valutazione. Riprova.',
          type: 'error'
        });
        return;
      }

      // Completa il protocollo
      await updateProtocol.mutateAsync({
        id: protocol.id,
        updates: {
          status: 'completed',
          progress_percentage: "100",
          last_activity_at: new Date().toISOString(),
        }
      });

      // Toast di successo
      showToast({
        title: "PROTOCOLLO COMPLETATO!",
        description: `Complimenti! Hai completato con successo tutto il protocollo "${protocol?.title || 'questo protocollo'}" e la tua valutazione è stata salvata!`,
        type: 'achievement'
      });

      // Chiudi dialog e reindirizza
      setShowRatingDialog(false);
      setTimeout(() => {
        navigate('/training?tab=completed');
      }, 1500);

    } catch (error) {
      console.error('Errore completamento protocollo:', error);
      showToast({
        title: 'Errore',
        description: 'Non è stato possibile completare il protocollo. Riprova.',
        type: 'error'
      });
    } finally {
      setIsSubmittingRating(false);
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
                <div className="text-lg font-bold">{parseInt(protocol.progress_percentage || '0')}%</div>
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
                <div className="text-lg font-bold">{Math.round(parseInt(protocol.success_rate?.toString() || '0'))}%</div>
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
      <div className="w-full">
        {/* Current Exercise - Now Full Width */}
        <div className="w-full">
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


              {/* Completion Button */}
              <Separator />
              
              {/* Pulsanti Azione */}
              <div className="flex gap-3 w-full">
                <Button
                  onClick={async () => {
                    // SEMPLIFICAZIONE: Solo completamento esercizi, il cambio giorno è automatico
                    handleCompleteExercise();
                  }}
                  disabled={currentExercise !== dailyCompletedExercises}
                  className={`flex-1 ${
                    currentExercise === dailyCompletedExercises 
                      ? 'bg-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 text-primary-foreground font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50'
                      : 'opacity-50 cursor-not-allowed'
                  } disabled:opacity-50`}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Esercizio {currentExercise + 1} Completato
                </Button>

                {/* Pulsante Interrompi Protocollo */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive"
                      size="sm" 
                      className="flex-shrink-0 py-3 px-4"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Interrompi
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Conferma interruzione</AlertDialogTitle>
                      <AlertDialogDescription>
                         Sei sicuro di voler interrompere definitivamente il protocollo "{protocol?.title || 'Caricamento...'}"? 
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

      {/* Dialog di Valutazione Protocollo */}
      <Dialog open={showRatingDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              🏆 Protocollo Completato!
            </DialogTitle>
            <DialogDescription>
              Complimenti! Hai completato tutto il protocollo "{protocol.title}". 
              La tua valutazione ci aiuterà a migliorare i nostri protocolli.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Sistema di valutazione con stelle */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                Quanto è stato efficace questo protocollo? (1-10)
              </label>
              <div className="flex items-center justify-center gap-2 mb-2">
                 {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => {
                   let colorClass = '';
                   if (rating <= 3) {
                     colorClass = rating <= protocolRating 
                       ? 'bg-red-500 border-red-500 text-white' 
                       : 'border-red-300 text-red-400 hover:border-red-400';
                   } else if (rating <= 5) {
                     colorClass = rating <= protocolRating 
                       ? 'bg-orange-500 border-orange-500 text-white' 
                       : 'border-orange-300 text-orange-400 hover:border-orange-400';
                   } else if (rating <= 7) {
                     colorClass = rating <= protocolRating 
                       ? 'bg-yellow-500 border-yellow-500 text-white' 
                       : 'border-yellow-300 text-yellow-400 hover:border-yellow-400';
                   } else if (rating <= 9) {
                     colorClass = rating <= protocolRating 
                       ? 'bg-blue-500 border-blue-500 text-white' 
                       : 'border-blue-300 text-blue-400 hover:border-blue-400';
                   } else {
                     colorClass = rating <= protocolRating 
                       ? 'bg-green-500 border-green-500 text-white' 
                       : 'border-green-300 text-green-400 hover:border-green-400';
                   }
                   
                   return (
                     <button
                       key={rating}
                       onClick={() => setProtocolRating(rating)}
                       className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all ${colorClass}`}
                     >
                       {rating}
                     </button>
                   );
                 })}
              </div>
               <div className="text-center">
                 <span className={`text-2xl font-bold ${
                   protocolRating <= 3 ? 'text-red-500' :
                   protocolRating <= 5 ? 'text-orange-500' :
                   protocolRating <= 7 ? 'text-yellow-500' :
                   protocolRating <= 9 ? 'text-blue-500' :
                   'text-green-500'
                 }`}>
                   {protocolRating}/10
                 </span>
                 <p className={`text-xs mt-1 font-medium ${
                   protocolRating <= 3 ? 'text-red-500' :
                   protocolRating <= 5 ? 'text-orange-500' :
                   protocolRating <= 7 ? 'text-yellow-500' :
                   protocolRating <= 9 ? 'text-blue-500' :
                   'text-green-500'
                 }`}>
                   {protocolRating <= 3 && "Non ha funzionato"}
                   {protocolRating > 3 && protocolRating <= 5 && "Parzialmente efficace"}
                   {protocolRating > 5 && protocolRating <= 7 && "Abbastanza efficace"}
                   {protocolRating > 7 && protocolRating <= 9 && "Molto efficace"}
                   {protocolRating === 10 && "Perfettamente efficace!"}
                 </p>
               </div>
            </div>
            
            {/* Campo per commenti opzionali */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Commenti aggiuntivi (opzionale)
              </label>
              <Textarea
                placeholder="Racconta la tua esperienza: cosa ha funzionato meglio? Cosa potresti migliorare?"
                value={protocolNotes}
                onChange={(e) => setProtocolNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>
          
           <DialogFooter className="flex justify-center gap-2">
            <Button
              onClick={handleSubmitRating}
              disabled={isSubmittingRating}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              {isSubmittingRating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Invio...
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2" />
                  Invia valutazione
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </div>
  );
};

export default TrainingDashboard;