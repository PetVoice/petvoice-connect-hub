import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useUnifiedToast } from '@/hooks/use-unified-toast';
import { allProtocols } from '@/data/trainingProtocolsData';
import { 
  CheckCircle, 
  Clock, 
  Play, 
  Pause, 
  Star,
  Calendar,
  Video,
  FileText,
  TrendingUp,
  Award,
  MessageSquare,
  Camera,
  Upload,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';

interface DailyExercise {
  id: string;
  day: number;
  title: string;
  description: string;
  duration: string;
  level: string;
  materials: string[];
  objectives: string[];
  successCriteria: string[];
  tips: string[];
  completed: boolean;
  completedAt?: string;
  feedback?: string;
  videoUrl?: string;
  effectiveness?: number;
}

interface ProtocolProgressProps {
  protocolId: string;
  protocolTitle: string;
  petName: string;
  petAvatar: string;
  currentDay: number;
  totalDays: number;
  overallProgress: number;
}


export const ProtocolProgress: React.FC<ProtocolProgressProps> = ({
  protocolId,
  protocolTitle,
  petName,
  petAvatar,
  currentDay,
  totalDays,
  overallProgress
}) => {
  const { showToast: showTranslatedToast } = useTranslatedToast();
  const { showToast } = useToastWithIcon();
  const [selectedExercise, setSelectedExercise] = useState<DailyExercise | null>(null);
  const [feedback, setFeedback] = useState('');
  const [effectiveness, setEffectiveness] = useState(5);

  // Trova il protocollo corretto dai dati reali
  const currentProtocol = useMemo(() => {
    const protocolsArray = Object.values(allProtocols);
    return protocolsArray.find(protocol => protocol.id === protocolId);
  }, [protocolId]);

  // Trasforma i dati del protocollo in formato DailyExercise
  const dailyExercises = useMemo(() => {
    if (!currentProtocol) return [];
    
    return currentProtocol.days.flatMap(dayData => 
      dayData.exercises.map((exercise, exerciseIndex) => ({
        id: `${dayData.day}-${exerciseIndex}`,
        day: dayData.day,
        title: exercise.name,
        description: exercise.description,
        duration: exercise.duration,
        level: exercise.level,
        materials: exercise.materials,
        objectives: exercise.objectives,
        successCriteria: exercise.successCriteria,
        tips: exercise.tips,
        completed: Math.random() > 0.7, // Simulazione stato completamento
        completedAt: Math.random() > 0.5 ? new Date().toISOString() : undefined,
        feedback: undefined,
        videoUrl: undefined,
        effectiveness: Math.random() > 0.5 ? Math.floor(Math.random() * 4) + 7 : undefined
      }))
    );
  }, [currentProtocol]);

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'facile': return 'bg-green-500/20 text-green-700';
      case 'intermedio': return 'bg-yellow-500/20 text-yellow-700';
      case 'avanzato': return 'bg-red-500/20 text-red-700';
      default: return 'bg-gray-500/20 text-gray-700';
    }
  };

  const handleCompleteExercise = (exerciseId: string) => {
    const exercise = dailyExercises.find(e => e.id === exerciseId);
    if (exercise) {
      exercise.completed = true;
      exercise.completedAt = new Date().toISOString();
      exercise.feedback = feedback;
      exercise.effectiveness = effectiveness;
      
      showToast({
        title: "Esercizio Completato!",
        description: `"${exercise.title}" è stato completato con successo.`,
        type: 'complete'
      });
      
      setSelectedExercise(null);
      setFeedback('');
      setEffectiveness(5);
    }
  };

  const handleUploadVideo = (exerciseId: string) => {
    showToast({
      title: "Video Caricato!",
      description: "Il video dell'esercizio è stato caricato per l'analisi AI.",
      type: 'upload'
    });
  };

  const todaysExercise = dailyExercises.find(e => e.day === currentDay);
  const completedExercises = dailyExercises.filter(e => e.completed);
  const upcomingExercises = dailyExercises.filter(e => !e.completed && e.day > currentDay);

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={petAvatar} alt={petName} />
              <AvatarFallback>{petName.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold">{protocolTitle}</h3>
              <p className="text-sm text-muted-foreground">{petName} • Giorno {currentDay} di {totalDays}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progresso Complessivo</span>
              <span className="text-sm font-bold">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">{completedExercises.length}</div>
                <div className="text-xs text-muted-foreground">Completati</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">{currentDay}</div>
                <div className="text-xs text-muted-foreground">Giorno Attuale</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">{totalDays - currentDay}</div>
                <div className="text-xs text-muted-foreground">Rimanenti</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Exercise */}
      {todaysExercise && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              Esercizio di Oggi (Giorno {currentDay})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{todaysExercise.title}</h4>
                <p className="text-sm text-muted-foreground">{todaysExercise.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getDifficultyColor(todaysExercise.level)}>
                  🎯 {todaysExercise.level}
                </Badge>
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {todaysExercise.duration}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-medium">Descrizione Dettagliata:</h5>
              <p className="text-sm text-muted-foreground">{todaysExercise.description}</p>
            </div>

            <div className="space-y-3">
              <h5 className="font-medium">Obiettivi:</h5>
              <ul className="list-disc list-inside space-y-1">
                {todaysExercise.objectives.map((objective, idx) => (
                  <li key={idx} className="text-sm">{objective}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h5 className="font-medium">Criteri di Successo:</h5>
              <ul className="list-disc list-inside space-y-1">
                {todaysExercise.successCriteria.map((criteria, idx) => (
                  <li key={idx} className="text-sm text-green-600">{criteria}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h5 className="font-medium">Consigli Pratici:</h5>
              <ul className="list-disc list-inside space-y-1">
                {todaysExercise.tips.map((tip, idx) => (
                  <li key={idx} className="text-sm text-blue-600">{tip}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h5 className="font-medium">Materiali Necessari:</h5>
              <div className="flex flex-wrap gap-2">
                {todaysExercise.materials.map((material, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {material}
                  </Badge>
                ))}
              </div>
            </div>

            {todaysExercise.videoUrl && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Video className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Video Tutorial Disponibile</span>
                </div>
                <Button size="sm" variant="outline">
                  <Play className="h-4 w-4 mr-2" />
                  Guarda Video
                </Button>
              </div>
            )}

            <Separator />

            <div className="flex gap-2">
              {!todaysExercise.completed ? (
                <>
                  <Button 
                    className="flex-1 bg-green-500 hover:bg-green-600"
                    onClick={() => setSelectedExercise(todaysExercise)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Completa Esercizio
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleUploadVideo(todaysExercise.id)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Carica Video
                  </Button>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Completato!</span>
                  {todaysExercise.effectiveness && (
                    <div className="flex items-center gap-1 ml-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">{todaysExercise.effectiveness}/10</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion Modal */}
      {selectedExercise && (
        <Card className="border-2 border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Completa: {selectedExercise.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-medium">Feedback sull'esercizio:</label>
              <Textarea
                placeholder="Descrivi come è andato l'esercizio, i progressi osservati, eventuali difficoltà..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Efficacia percepita (1-10):</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={effectiveness}
                  onChange={(e) => setEffectiveness(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-semibold w-8">{effectiveness}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setSelectedExercise(null)}
              >
                Annulla
              </Button>
              <Button 
                className="flex-1 bg-green-500 hover:bg-green-600"
                onClick={() => handleCompleteExercise(selectedExercise.id)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Completa
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Storico Progressi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completedExercises.map((exercise) => (
              <div key={exercise.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Giorno {exercise.day}: {exercise.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {exercise.completedAt && new Date(exercise.completedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {exercise.effectiveness && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">{exercise.effectiveness}/10</span>
                    </div>
                  )}
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Feedback
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Exercises Preview */}
      {upcomingExercises.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              Prossimi Esercizi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingExercises.slice(0, 3).map((exercise) => (
                <div key={exercise.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-medium">{exercise.day}</span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">{exercise.title}</div>
                      <div className="text-xs text-muted-foreground">{exercise.description}</div>
                    </div>
                  </div>
                  <Badge className={getDifficultyColor(exercise.level)}>
                    🎯 {exercise.level}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};