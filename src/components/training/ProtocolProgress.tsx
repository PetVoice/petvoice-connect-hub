import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useTranslatedToast } from '@/hooks/use-translated-toast';
import { useToastWithIcon } from '@/hooks/use-toast-with-icons';
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
  duration: number;
  type: 'physical' | 'mental' | 'behavioral' | 'social';
  instructions: string[];
  materials: string[];
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

const mockDailyExercises: DailyExercise[] = [
  {
    id: '1',
    day: 1,
    title: 'Introduzione alla Calma',
    description: 'Esercizio di base per introdurre stati di calma e rilassamento',
    duration: 15,
    type: 'behavioral',
    instructions: [
      'Prepara uno spazio tranquillo senza distrazioni',
      'Usa comandi vocali dolci e rilassanti',
      'Premia ogni momento di calma con snack di alta qualità',
      'Ripeti 3 volte durante la giornata per 5 minuti ciascuna'
    ],
    materials: ['Tappetino rilassante', 'Snack premium', 'Ambiente silenzioso'],
    completed: true,
    completedAt: '2024-01-15T10:30:00Z',
    feedback: 'Ottima risposta! Luna ha mostrato segni di rilassamento già dalla prima sessione.',
    effectiveness: 8
  },
  {
    id: '2',
    day: 2,
    title: 'Desensibilizzazione Graduale',
    description: 'Introduzione graduale agli stimoli che causano ansia',
    duration: 20,
    type: 'behavioral',
    instructions: [
      'Inizia con stimoli molto deboli (volume basso, distanza maggiore)',
      'Associa sempre lo stimolo a qualcosa di positivo',
      'Mantieni le sessioni brevi per evitare sovraccarico',
      'Aumenta l\'intensità solo se il pet rimane calmo'
    ],
    materials: ['Registrazioni audio', 'Snack di alto valore', 'Clicker (opzionale)'],
    completed: true,
    completedAt: '2024-01-16T14:15:00Z',
    feedback: 'Progressi evidenti! Luna è rimasta calma per tutto l\'esercizio.',
    effectiveness: 9
  },
  {
    id: '3',
    day: 3,
    title: 'Rinforzo Positivo Avanzato',
    description: 'Tecniche avanzate di rinforzo per consolidare i comportamenti calmi',
    duration: 25,
    type: 'behavioral',
    instructions: [
      'Usa il timing perfetto per il rinforzo (entro 3 secondi)',
      'Varia i tipi di rinforzo (cibo, gioco, coccole)',
      'Pratica il "capturing" dei comportamenti spontanei',
      'Documenta i miglioramenti con foto/video'
    ],
    materials: ['Varietà di snack', 'Giocattoli motivanti', 'Smartphone per documentare'],
    completed: false,
    videoUrl: 'https://example.com/training-video-3'
  },
  {
    id: '4',
    day: 4,
    title: 'Gestione delle Partenze',
    description: 'Protocollo specifico per ridurre l\'ansia da separazione',
    duration: 30,
    type: 'behavioral',
    instructions: [
      'Pratica partenze finte molto brevi (30 secondi)',
      'Non fare grandi cerimonie per partenze e ritorni',
      'Lascia puzzle alimentari per mantenere occupato il pet',
      'Aumenta gradualmente la durata delle assenze'
    ],
    materials: ['Kong riempibile', 'Puzzle alimentari', 'Videocamera per monitoraggio'],
    completed: false
  }
];

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'physical': return 'bg-green-500/20 text-green-700';
      case 'mental': return 'bg-blue-500/20 text-blue-700';
      case 'behavioral': return 'bg-purple-500/20 text-purple-700';
      case 'social': return 'bg-orange-500/20 text-orange-700';
      default: return 'bg-gray-500/20 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'physical': return '🏃‍♂️';
      case 'mental': return '🧠';
      case 'behavioral': return '🎯';
      case 'social': return '👥';
      default: return '📝';
    }
  };

  const handleCompleteExercise = (exerciseId: string) => {
    const exercise = mockDailyExercises.find(e => e.id === exerciseId);
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

  const todaysExercise = mockDailyExercises.find(e => e.day === currentDay);
  const completedExercises = mockDailyExercises.filter(e => e.completed);
  const upcomingExercises = mockDailyExercises.filter(e => !e.completed && e.day > currentDay);

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
                <Badge className={getTypeColor(todaysExercise.type)}>
                  {getTypeIcon(todaysExercise.type)} {todaysExercise.type}
                </Badge>
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {todaysExercise.duration}min
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-medium">Istruzioni:</h5>
              <ol className="list-decimal list-inside space-y-1">
                {todaysExercise.instructions.map((instruction, idx) => (
                  <li key={idx} className="text-sm">{instruction}</li>
                ))}
              </ol>
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
                  <Badge className={getTypeColor(exercise.type)}>
                    {getTypeIcon(exercise.type)} {exercise.type}
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