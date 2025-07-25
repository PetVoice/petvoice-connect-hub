import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  PawPrint, 
  Microscope, 
  Calendar, 
  BarChart3,
  Plus,
  TrendingUp,
  Activity,
  Brain,
  AlertTriangle,
  CreditCard,
  Download,
  Edit,
  Eye,
  FileText,
  MapPin,
  Paperclip,
  Phone,
  Pill,
  Siren,
  Stethoscope,
  Trash2,
  PieChart as PieChartIcon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePets } from '@/contexts/PetContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format, isToday, subDays } from 'date-fns';
import WellnessTrendChart from '@/components/dashboard/WellnessTrendChart';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { FirstAidGuide } from '@/components/FirstAidGuide';
// Translation system removed - Italian only

interface PetStats {
  totalAnalyses: number;
  recentAnalyses: number;
  wellnessScore: number;
  moodTrend: number;
  healthStatus: string;
  diaryEntries: number;
  calendarEvents: number;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { pets, selectedPet } = usePets();
  const navigate = useNavigate();
  const [petStats, setPetStats] = useState<PetStats>({
    totalAnalyses: 0,
    recentAnalyses: 0,
    wellnessScore: 0,
    moodTrend: 0,
    healthStatus: 'N/A',
    diaryEntries: 0,
    calendarEvents: 0
  });
  const [loading, setLoading] = useState(false);
  
  // Stati per le card wellness
  const [healthMetrics, setHealthMetrics] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [veterinarians, setVeterinarians] = useState<any[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);
  const [insurances, setInsurances] = useState<any[]>([]);
  const [diaryEntriesData, setDiaryEntriesData] = useState<any[]>([]);
  const [petAnalyses, setPetAnalyses] = useState<any[]>([]);
  const [showFirstAidGuide, setShowFirstAidGuide] = useState(false);
  const [emotionStats, setEmotionStats] = useState<{[key: string]: number}>({});
  const [vitalStats, setVitalStats] = useState<{[key: string]: {value: number, unit: string, date: string}}>({});
  
  // Translation system removed - Italian only

  const quickActions = [
    {
      title: 'Analisi',
      description: 'Analizza il comportamento del tuo pet',
      icon: Microscope,
      onClick: () => navigate('/analysis'),
      color: 'from-primary to-primary/80'
    },
    {
      title: 'Diario',
      description: 'Monitora la salute quotidiana',
      icon: PawPrint,
      onClick: () => navigate('/diary'),
      color: 'from-primary/80 to-primary/60'
    },
    {
      title: 'Calendario',
      description: 'Gestisci appuntamenti ed eventi',
      icon: Calendar,
      onClick: () => navigate('/calendar'),
      color: 'from-primary/60 to-primary/40'
    },
    {
      title: 'Primo Soccorso',
      description: 'Accesso rapido alle procedure di emergenza',
      icon: AlertTriangle,
      onClick: () => setShowFirstAidGuide(true),
      color: 'from-red-500 to-red-600'
    }
  ];

  // Load pet statistics when selectedPet changes
  useEffect(() => {
    const loadPetStats = async () => {
      if (!selectedPet || !user) {
        setPetStats({
          totalAnalyses: 0,
          recentAnalyses: 0,
          wellnessScore: 0,
          moodTrend: 0,
          healthStatus: 'N/A',
          diaryEntries: 0,
          calendarEvents: 0
        });
        return;
      }

      setLoading(true);
      try {
        const today = new Date();
        const lastWeek = subDays(today, 7);

        // Get pet analyses
        const { data: analyses } = await supabase
          .from('pet_analyses')
          .select('*')
          .eq('pet_id', selectedPet.id)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        // Get diary entries
        const { data: diaryEntries } = await supabase
          .from('diary_entries')
          .select('*')
          .eq('pet_id', selectedPet.id)
          .eq('user_id', user.id);

        // Get health metrics
        const { data: healthMetrics } = await supabase
          .from('health_metrics')
          .select('*')
          .eq('pet_id', selectedPet.id)
          .eq('user_id', user.id)
          .order('recorded_at', { ascending: false });

        // Get calendar events
        const { data: calendarEvents } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('pet_id', selectedPet.id)
          .eq('user_id', user.id);

        const totalAnalyses = analyses?.length || 0;
        const recentAnalyses = analyses?.filter(a => 
          new Date(a.created_at) >= lastWeek
        ).length || 0;

        // Calculate wellness score based on recent analyses
        let wellnessScore = 0;
        let healthStatus = 'N/A';

        if (analyses && analyses.length > 0) {
          const emotionScores: Record<string, number> = {
            'felice': 90,
            'calmo': 85,
            'giocoso': 88,
            'eccitato': 75,
            'ansioso': 40,
            'triste': 30,
            'aggressivo': 25
          };

          const recentAnalysesForScore = analyses.slice(0, 10);
          const avgScore = recentAnalysesForScore.reduce((sum, analysis) => {
            const emotionScore = emotionScores[analysis.primary_emotion] || 50;
            const confidenceBonus = (analysis.primary_confidence - 50) / 100 * 20;
            return sum + emotionScore + confidenceBonus;
          }, 0) / recentAnalysesForScore.length;

          wellnessScore = Math.round(Math.max(0, Math.min(100, avgScore)));
          
          if (wellnessScore >= 80) healthStatus = 'Eccellente';
          else if (wellnessScore >= 60) healthStatus = 'Buono';
          else if (wellnessScore >= 40) healthStatus = 'Discreto';
          else healthStatus = 'Preoccupante';
        }

        // Calculate mood trend (compare last 5 vs previous 5 analyses)
        let moodTrend = 0;
        if (analyses && analyses.length >= 5) {
          const recent = analyses.slice(0, 5);
          const previous = analyses.slice(5, 10);
          
          if (previous.length > 0) {
            const emotionScores: Record<string, number> = {
              'felice': 90, 'calmo': 85, 'giocoso': 88, 'eccitato': 75,
              'ansioso': 40, 'triste': 30, 'aggressivo': 25
            };
            
            const recentAvg = recent.reduce((sum, a) => 
              sum + (emotionScores[a.primary_emotion] || 50), 0) / recent.length;
            const previousAvg = previous.reduce((sum, a) => 
              sum + (emotionScores[a.primary_emotion] || 50), 0) / previous.length;
            
            moodTrend = Math.round(((recentAvg - previousAvg) / previousAvg) * 100);
          }
        }

        setPetStats({
          totalAnalyses,
          recentAnalyses,
          wellnessScore,
          moodTrend,
          healthStatus,
          diaryEntries: diaryEntries?.length || 0,
          calendarEvents: calendarEvents?.length || 0
        });

        // Calculate emotion statistics
        const emotionCounts: {[key: string]: number} = {};
        if (analyses && analyses.length > 0) {
          analyses.forEach(analysis => {
            if (analysis.primary_emotion) {
              const emotion = analysis.primary_emotion.toLowerCase();
              emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
            }
          });
        }
        setEmotionStats(emotionCounts);

        // Calculate vital stats from health metrics and diary entries
        const vitals: {[key: string]: {value: number, unit: string, date: string}} = {};
        
        // From health metrics
        if (healthMetrics && healthMetrics.length > 0) {
          const latestMetrics = healthMetrics.slice(0, 10);
          latestMetrics.forEach(metric => {
            vitals[metric.metric_type] = {
              value: Number(metric.value),
              unit: metric.unit || '',
              date: format(new Date(metric.recorded_at), 'dd/MM')
            };
          });
        }
        
        // From diary entries (temperature and mood)
        if (diaryEntries && diaryEntries.length > 0) {
          const recentEntries = diaryEntries.slice(0, 5);
          recentEntries.forEach(entry => {
            if (entry.temperature) {
              vitals['temperatura'] = {
                value: parseFloat(entry.temperature.toString()),
                unit: '°C',
                date: format(new Date(entry.entry_date), 'dd/MM')
              };
            }
            if (entry.mood_score) {
              vitals['umore'] = {
                value: entry.mood_score,
                unit: '/10',
                date: format(new Date(entry.entry_date), 'dd/MM')
              };
            }
          });
        }
        
        setVitalStats(vitals);

      } catch (error) {
        console.error('Error loading pet stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPetStats();
  }, [selectedPet, user]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Benvenuto su PetVoice
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Gestisci la salute e il benessere dei tuoi compagni animali con l'intelligenza artificiale
        </p>
      </div>

      {/* Selected Pet Info */}
      {selectedPet && (
        <Card className="bg-gradient-subtle border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <span className="text-2xl">
                  {selectedPet.type?.toLowerCase().includes('cane') ? '🐕' : 
                   selectedPet.type?.toLowerCase().includes('gatto') ? '🐱' : '🐾'}
                </span>
              </div>
              <div>
                <h2 className="text-2xl">{selectedPet.name}</h2>
                <p className="text-muted-foreground">
                  {selectedPet.type?.toLowerCase() === 'cane' ? 'Cane' : selectedPet.type} • {selectedPet.breed} • {selectedPet.birth_date ? new Date().getFullYear() - new Date(selectedPet.birth_date).getFullYear() : '?'} anni
                </p>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      {/* Health Score Progress Bar */}
      {selectedPet && (
        <div className="mb-6">
          <div className="space-y-4 p-6 bg-primary/10 border border-primary/20 rounded-lg shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-6 w-6 text-red-500" />
                <h3 className="text-xl font-semibold">Punteggio Salute</h3>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-500">
                  {petStats.wellnessScore > 0 ? `${petStats.wellnessScore}%` : '--'}
                </div>
                <p className="text-sm text-muted-foreground">
                  {petStats.healthStatus}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Critico</span>
                <span>Ottimo</span>
              </div>
              <Progress 
                value={petStats.wellnessScore > 0 ? petStats.wellnessScore : 0} 
                className="h-3"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Cards - Individual cards between health score and chart */}
      {selectedPet && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              className="bg-primary/10 border border-primary/20 shadow-soft hover:shadow-glow transition-all duration-200 cursor-pointer hover:scale-[1.02]"
              onClick={action.onClick}
            >
              <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                <action.icon className={`h-12 w-12 ${action.title === 'Primo Soccorso' ? 'text-red-500' : 'text-primary'}`} />
                <div>
                  <h3 className="font-semibold text-lg mb-1">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Wellness Trend Chart */}
      {selectedPet && user && (
        <div className="mb-16 w-full">
          <WellnessTrendChart petId={selectedPet.id} userId={user.id} />
        </div>
      )}

      {/* Emotion Analysis Card - Full width under the chart */}
      {selectedPet && (
        <div className="w-full mb-6">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 shadow-elegant hover:shadow-glow transition-all duration-300">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                  <PieChartIcon className="h-6 w-6 text-white" />
                </div>
                Analisi Emozioni Rilevate
              </CardTitle>
              <CardDescription className="text-lg">Cronologia dettagliata di tutte le emozioni del tuo pet</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(emotionStats).length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {Object.entries(emotionStats)
                    .sort(([,a], [,b]) => b - a)
                    .map(([emotion, count]) => {
                      const emotionColors = {
                        'felice': 'from-green-400 to-emerald-500',
                        'giocoso': 'from-yellow-400 to-orange-500', 
                        'calmo': 'from-blue-400 to-cyan-500',
                        'eccitato': 'from-purple-400 to-violet-500',
                        'ansioso': 'from-orange-400 to-red-500',
                        'triste': 'from-gray-400 to-slate-500',
                        'aggressivo': 'from-red-500 to-red-600'
                      };
                      const emotionIcons = {
                        'felice': '😊',
                        'giocoso': '🎾', 
                        'calmo': '😌',
                        'eccitato': '⚡',
                        'ansioso': '😰',
                        'triste': '😢',
                        'aggressivo': '😠'
                      };
                      const gradientClass = emotionColors[emotion as keyof typeof emotionColors] || 'from-primary to-primary/80';
                      const icon = emotionIcons[emotion as keyof typeof emotionIcons] || '🐾';
                      
                      return (
                        <div 
                          key={emotion} 
                          className="group relative overflow-hidden rounded-xl border border-white/20 bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
                          <div className="relative p-4 text-center">
                            <div className="text-2xl mb-2">{icon}</div>
                            <div className="font-semibold text-gray-700 capitalize mb-1">{emotion}</div>
                            <div className={`text-3xl font-bold bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent`}>
                              {count}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {count === 1 ? 'rilevamento' : 'rilevamenti'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
                    <PieChartIcon className="h-10 w-10 text-primary/60" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Nessuna analisi disponibile</h3>
                  <p className="text-gray-500 mb-4">Inizia ad analizzare il comportamento del tuo pet per vedere le statistiche emozionali</p>
                   <Button 
                     onClick={() => navigate('/analysis')}
                     className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                   >
                     <Microscope className="h-4 w-4 mr-2" />
                     Inizia Analisi
                   </Button>
                 </div>
               )}
             </CardContent>
           </Card>
         </div>
       )}

      {/* Vital Parameters Card - Full width under emotion analysis */}
      {selectedPet && (
        <div className="w-full mb-6">
          <Card className="bg-gradient-to-r from-blue-50/80 to-cyan-50/80 border border-blue-200/50 shadow-elegant hover:shadow-glow transition-all duration-300">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Parametri Vitali</CardTitle>
                    <CardDescription className="text-lg">Monitoraggio della salute del tuo pet</CardDescription>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => navigate('/diary')}
                  className="hover:bg-blue-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {Object.keys(vitalStats).length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {Object.entries(vitalStats).map(([vital, data]) => {
                    const vitalColors = {
                      'temperatura': 'from-red-400 to-orange-500',
                      'peso': 'from-purple-400 to-pink-500',
                      'frequenza_cardiaca': 'from-red-500 to-red-600',
                      'pressione': 'from-indigo-400 to-blue-500',
                      'umore': 'from-yellow-400 to-orange-400',
                      'energia': 'from-green-400 to-emerald-500',
                      'appetito': 'from-orange-400 to-red-400'
                    };
                    const vitalIcons = {
                      'temperatura': '🌡️',
                      'peso': '⚖️',
                      'frequenza_cardiaca': '❤️',
                      'pressione': '📊',
                      'umore': '😊',
                      'energia': '⚡',
                      'appetito': '🍽️'
                    };
                    const gradientClass = vitalColors[vital as keyof typeof vitalColors] || 'from-blue-400 to-cyan-500';
                    const icon = vitalIcons[vital as keyof typeof vitalIcons] || '📋';
                    
                    return (
                      <div 
                        key={vital} 
                        className="group relative overflow-hidden rounded-xl border border-white/30 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
                        <div className="relative p-4 text-center">
                          <div className="text-2xl mb-2">{icon}</div>
                          <div className="font-semibold text-gray-700 capitalize mb-1 text-sm">
                            {vital.replace('_', ' ')}
                          </div>
                          <div className={`text-2xl font-bold bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent flex items-center justify-center gap-1`}>
                            {data.value}
                            <span className="text-sm text-gray-500">{data.unit}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {data.date}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-400/20 to-cyan-400/10 flex items-center justify-center">
                    <Activity className="h-10 w-10 text-blue-500/60" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Nessun parametro vitale registrato</h3>
                  <p className="text-gray-500 mb-4">Inizia a monitorare i parametri vitali del tuo pet per tracciarne la salute</p>
                  <Button 
                    onClick={() => navigate('/diary')}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Registra Parametri
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Wellness Cards - Tutte le 10 card di wellness sotto il grafico */}
      {selectedPet && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">


      {/* Comportamenti Osservati Card - Full width */}
      {selectedPet && (
        <div className="w-full mb-6">
          <Card className="bg-gradient-to-r from-purple-500/10 to-violet-500/5 border border-purple-500/20 shadow-elegant hover:shadow-glow transition-all duration-300">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                Comportamenti Osservati
              </CardTitle>
              <CardDescription className="text-lg">Cronologia degli atteggiamenti e comportamenti del tuo pet</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Qui dovrebbero essere mostrati i comportamenti reali dai diary entries */}
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500/20 to-violet-500/10 flex items-center justify-center">
                  <Eye className="h-10 w-10 text-purple-500/60" />
                </div>
                <p className="text-lg text-muted-foreground mb-6">Nessun comportamento registrato</p>
                <Button 
                  onClick={() => navigate('/diary')} 
                  className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Brain className="h-5 w-5 mr-2" />
                  Registra Comportamenti
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Wellness Cards - Tutte le card rimanenti in griglia */}

          {/* Active Medications Card */}
          <Card className="bg-primary/10 border border-primary/20 shadow-soft hover:shadow-glow transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Pill className="h-5 w-5 text-green-500" />
                  Farmaci Attivi
                </CardTitle>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => navigate('/diary')}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 overflow-hidden">
              <div className="text-center py-4 text-muted-foreground">
                <Pill className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Gestisci farmaci e terapie</p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Visits Card */}
          <Card className="bg-primary/10 border border-primary/20 shadow-soft hover:shadow-glow transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Visite Recenti
                </CardTitle>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => navigate('/diary')}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 overflow-hidden">
              <div className="text-center py-4 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Registra visite veterinarie</p>
              </div>
            </CardContent>
          </Card>

          {/* Insurance Card */}
          <Card className="bg-primary/10 border border-primary/20 shadow-soft hover:shadow-glow transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-teal-500" />
                  Assicurazione
                </CardTitle>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => navigate('/diary')}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 overflow-hidden">
              <div className="text-center py-4 text-muted-foreground">
                <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Gestisci polizze assicurative</p>
              </div>
            </CardContent>
          </Card>


          {/* Emergency Contacts Card */}
          <Card className="bg-primary/10 border border-primary/20 shadow-soft hover:shadow-glow transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="h-5 w-5 text-orange-500" />
                  Contatti Emergenza
                </CardTitle>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => navigate('/diary')}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 overflow-hidden">
              <div className="text-center py-4 text-muted-foreground">
                <Phone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aggiungi contatti di emergenza</p>
              </div>
            </CardContent>
          </Card>

          {/* Veterinarian Card */}
          <Card className="bg-primary/10 border border-primary/20 shadow-soft hover:shadow-glow transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-purple-500" />
                  Veterinario
                </CardTitle>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => navigate('/diary')}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 overflow-hidden">
              <div className="text-center py-4 text-muted-foreground">
                <Stethoscope className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Registra veterinario di fiducia</p>
              </div>
            </CardContent>
          </Card>

        </div>
      )}


      {/* Getting Started */}
      {pets.length === 0 && (
        <Card className="border-dashed border-2 border-primary/20 bg-primary/10">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center mb-4">
              <PawPrint className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Nessun pet aggiunto</CardTitle>
            <CardDescription>
              Aggiungi il tuo primo pet per iniziare
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => {
                console.log('Navigating to pets page with add=true');
                navigate('/pets?add=true');
              }} 
              data-guide="pet-selector"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Pet
            </Button>
          </CardContent>
        </Card>
      )}

      {/* First Aid Guide Modal */}
      <FirstAidGuide 
        open={showFirstAidGuide} 
        onOpenChange={setShowFirstAidGuide} 
      />
    </div>
  );
};

export default DashboardPage;