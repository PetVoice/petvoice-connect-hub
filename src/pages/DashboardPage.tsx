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
  PieChart as PieChartIcon,
  Save,
  X
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { usePets } from '@/contexts/PetContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format, isToday, subDays } from 'date-fns';
import WellnessTrendChart from '@/components/dashboard/WellnessTrendChart';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { FirstAidGuide } from '@/components/FirstAidGuide';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [behaviorStats, setBehaviorStats] = useState<{[key: string]: {count: number, lastSeen: string}}>({});
  const [medicationStats, setMedicationStats] = useState<{[key: string]: {dosage: string, frequency: string, lastTaken: string}}>({});
  
  // Dialogs state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {}
  });

  // Vital signs modal state
  const [vitalModal, setVitalModal] = useState<{
    open: boolean;
    mode: 'add' | 'edit';
    vitalType: string;
    currentValue: { value: number; unit: string; date: string } | null;
  }>({
    open: false,
    mode: 'add',
    vitalType: '',
    currentValue: null
  });

  const [vitalForm, setVitalForm] = useState({
    value: '',
    unit: ''
  });

  const { toast } = useToast();
  
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

        // Calculate comprehensive wellness score based on multiple factors
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

          // 1. Emotion Analysis Score (40% weight)
          const recentAnalysesForScore = analyses.slice(0, 10);
          const emotionScore = recentAnalysesForScore.reduce((sum, analysis) => {
            const emotionValue = emotionScores[analysis.primary_emotion] || 50;
            const confidenceBonus = (analysis.primary_confidence - 50) / 100 * 20;
            return sum + emotionValue + confidenceBonus;
          }, 0) / recentAnalysesForScore.length;

          // 2. Diary Mood Score (25% weight)
          let diaryScore = 50; // default neutral
          if (diaryEntries && diaryEntries.length > 0) {
            const recentDiaryEntries = diaryEntries
              .filter(entry => entry.mood_score !== null)
              .slice(0, 10);
            if (recentDiaryEntries.length > 0) {
              diaryScore = recentDiaryEntries.reduce((sum, entry) => sum + (entry.mood_score * 20), 0) / recentDiaryEntries.length;
            }
          }

          // 3. Vital Parameters Score (20% weight)
          let vitalScore = 50; // default neutral
          if (Object.keys(vitalStats).length > 0) {
            const vitalScores = Object.entries(vitalStats).map(([vital, data]) => {
              // Score based on vital type and value range
              const vitalValue = data.value;
              switch(vital) {
                case 'temperatura':
                  return (vitalValue >= 37.5 && vitalValue <= 39.5) ? 85 : 40;
                case 'peso':
                  return 75; // Weight stability bonus
                case 'frequenza_cardiaca':
                  return (vitalValue >= 60 && vitalValue <= 120) ? 85 : 50;
                case 'energia':
                case 'appetito':
                  return vitalValue * 20; // Scale from 1-5 to 20-100
                default:
                  return 60;
              }
            });
            vitalScore = vitalScores.length > 0 ? vitalScores.reduce((sum, score) => sum + score, 0) / vitalScores.length : 50;
          }

          // 4. Behavior Score (10% weight)
          let behaviorScore = 65; // default good
          if (Object.keys(behaviorStats).length > 0) {
            const behaviorScores = Object.entries(behaviorStats).map(([behavior, data]) => {
              const behaviorValues: Record<string, number> = {
                'felice': 90, 'giocoso': 85, 'calmo': 80, 'energico': 75, 'socievole': 80,
                'ansioso': 40, 'aggressivo': 25, 'timido': 50
              };
              return behaviorValues[behavior] || 60;
            });
            behaviorScore = behaviorScores.reduce((sum, score) => sum + score, 0) / behaviorScores.length;
          }

          // 5. Medical Care Bonus (5% weight)
          let medicalBonus = 0;
          const recentVisits = medicalRecords.filter(record => {
            const visitDate = new Date(record.created_at);
            const sixMonthsAgo = subDays(new Date(), 180);
            return visitDate >= sixMonthsAgo;
          });
          if (recentVisits.length > 0) medicalBonus = 10; // Recent vet visit bonus

          // Calculate weighted average
          wellnessScore = Math.round(
            (emotionScore * 0.4) + 
            (diaryScore * 0.25) + 
            (vitalScore * 0.2) + 
            (behaviorScore * 0.1) + 
            (50 * 0.05) + // base score for medical factor
            medicalBonus
          );

          wellnessScore = Math.max(0, Math.min(100, wellnessScore));
          
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

        // Calculate behavior statistics from diary entries
        const behaviors: {[key: string]: {count: number, lastSeen: string}} = {};
        if (diaryEntries && diaryEntries.length > 0) {
          diaryEntries.forEach(entry => {
            if (entry.behavioral_tags && Array.isArray(entry.behavioral_tags)) {
              entry.behavioral_tags.forEach((tag: string) => {
                if (tag && tag.trim()) {
                  const behaviorKey = tag.toLowerCase().trim();
                  if (!behaviors[behaviorKey]) {
                    behaviors[behaviorKey] = { count: 0, lastSeen: '' };
                  }
                  behaviors[behaviorKey].count++;
                  const entryDate = format(new Date(entry.entry_date), 'dd/MM');
                  if (!behaviors[behaviorKey].lastSeen || entryDate > behaviors[behaviorKey].lastSeen) {
                    behaviors[behaviorKey].lastSeen = entryDate;
                  }
                }
              });
            }
          });
        }
        setBehaviorStats(behaviors);

      } catch (error) {
        console.error('Error loading pet stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPetStats();
  }, [selectedPet, user]);

  // Helper functions for CRUD operations
  const handleAddItem = (type: string) => {
    switch(type) {
      case 'vitals':
        setVitalModal({
          open: true,
          mode: 'add',
          vitalType: '',
          currentValue: null
        });
        setVitalForm({
          value: '',
          unit: ''
        });
        break;
      case 'behaviors':
        navigate('/diary');
        break;
      case 'medications':
        navigate('/diary');
        break;
      case 'visits':
        navigate('/calendar');
        break;
      case 'insurance':
        navigate('/settings');
        break;
      case 'veterinarian':
        navigate('/settings');
        break;
      case 'emergency_contacts':
        navigate('/settings');
        break;
    }
  };

  const handleEditItem = (type: string, itemId?: string) => {
    switch(type) {
      case 'vitals':
        if (itemId && vitalStats[itemId]) {
          const vital = vitalStats[itemId];
          setVitalModal({
            open: true,
            mode: 'edit',
            vitalType: itemId,
            currentValue: vital
          });
          setVitalForm({
            value: vital.value.toString(),
            unit: vital.unit
          });
        }
        break;
      case 'behaviors':
        navigate('/diary');
        break;
      case 'medications':
        navigate('/diary');
        break;
      case 'visits':
        navigate('/calendar');
        break;
      case 'insurance':
        navigate('/settings');
        break;
      case 'veterinarian':
        navigate('/settings');
        break;
      case 'emergency_contacts':
        navigate('/settings');
        break;
    }
  };

  const handleDeleteItem = async (type: string, itemId: string, itemName: string) => {
    setConfirmDialog({
      open: true,
      title: `Elimina ${itemName}`,
      description: `Sei sicuro di voler eliminare "${itemName}"? Questa azione non può essere annullata.`,
      onConfirm: async () => {
        try {
          if (type === 'vitals') {
            // Rimuovi dai vitalStats locali
            const newVitalStats = { ...vitalStats };
            delete newVitalStats[itemId];
            setVitalStats(newVitalStats);
            
            toast({
              title: "Parametro vitale eliminato",
              description: `${itemName} è stato eliminato con successo.`,
            });
          } else {
            toast({
              title: "Elemento eliminato",
              description: `${itemName} è stato eliminato con successo.`,
              variant: "destructive"
            });
          }
          setConfirmDialog(prev => ({ ...prev, open: false }));
        } catch (error) {
          toast({
            title: "Errore",
            description: "Si è verificato un errore durante l'eliminazione.",
            variant: "destructive"
          });
        }
      }
    });
  };

  // Handle vital signs form submission
  const handleVitalSubmit = async () => {
    if (!selectedPet || !vitalForm.value || !vitalModal.vitalType) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi richiesti.",
        variant: "destructive"
      });
      return;
    }

    try {
      const newVitalStats = { ...vitalStats };
      newVitalStats[vitalModal.vitalType] = {
        value: parseFloat(vitalForm.value),
        unit: vitalForm.unit,
        date: format(new Date(), 'dd/MM')
      };
      
      setVitalStats(newVitalStats);
      setVitalModal({ open: false, mode: 'add', vitalType: '', currentValue: null });
      
      toast({
        title: vitalModal.mode === 'add' ? "Parametro vitale aggiunto" : "Parametro vitale modificato",
        description: `${vitalModal.vitalType.replace('_', ' ')} è stato ${vitalModal.mode === 'add' ? 'aggiunto' : 'modificato'} con successo.`,
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio.",
        variant: "destructive"
      });
    }
  };

  // Check if vital parameter is within normal range
  const isVitalInNormalRange = (vitalType: string, value: number, petType?: string): { isNormal: boolean; message: string } => {
    const isDog = petType?.toLowerCase().includes('cane');
    const isCat = petType?.toLowerCase().includes('gatto');
    
    switch(vitalType) {
      case 'temperatura':
        if (isDog && (value >= 38.0 && value <= 39.2)) return { isNormal: true, message: "Normale" };
        if (isCat && (value >= 38.1 && value <= 39.2)) return { isNormal: true, message: "Normale" };
        if (value < 37.0) return { isNormal: false, message: "Troppo bassa - Ipotermia" };
        if (value > 40.0) return { isNormal: false, message: "Troppo alta - Ipertermia/Febbre" };
        return { isNormal: false, message: "Fuori dal range normale" };
        
      case 'frequenza_cardiaca':
        if (isDog) {
          // Assumiamo cane grande se non specificato
          if (value >= 60 && value <= 140) return { isNormal: true, message: "Normale" };
        }
        if (isCat && (value >= 140 && value <= 220)) return { isNormal: true, message: "Normale" };
        if (value < 50) return { isNormal: false, message: "Troppo bassa - Bradicardia" };
        if (value > 250) return { isNormal: false, message: "Troppo alta - Tachicardia" };
        return { isNormal: false, message: "Fuori dal range normale" };
        
      case 'respirazione':
        if (isDog && (value >= 10 && value <= 30)) return { isNormal: true, message: "Normale" };
        if (isCat && (value >= 20 && value <= 30)) return { isNormal: true, message: "Normale" };
        if (value < 8) return { isNormal: false, message: "Troppo bassa - Bradipnea" };
        if (value > 40) return { isNormal: false, message: "Troppo alta - Tachipnea" };
        return { isNormal: false, message: "Fuori dal range normale" };
        
      default:
        return { isNormal: true, message: "Range non definito" };
    }
  };

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
                  {selectedPet.type?.toLowerCase() === 'cane' ? 'Cane' : selectedPet.type} {selectedPet.breed} • {selectedPet.birth_date ? new Date().getFullYear() - new Date(selectedPet.birth_date).getFullYear() : '?'} anni
                </p>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      {/* Health Score Progress Bar */}
      {selectedPet && (
        <Card className="bg-gradient-subtle border-0 shadow-elegant hover:shadow-glow transition-all duration-300 mb-6">
          <CardContent className="space-y-4 p-6">
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
          </CardContent>
        </Card>
      )}

      {/* Quick Action Cards - Individual cards between health score and chart */}
      {selectedPet && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              className="bg-gradient-subtle border-0 shadow-elegant hover:shadow-glow transition-all duration-300 cursor-pointer hover:scale-[1.01] hover:border-primary/20"
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

      {/* Emozioni Rilevate e Parametri Vitali - Side by side */}
      {selectedPet && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Emozioni Rilevate Card */}
          <Card className="bg-gradient-subtle border-0 shadow-elegant hover:shadow-glow transition-all duration-300">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                  <PieChartIcon className="h-6 w-6 text-white" />
                </div>
                Emozioni Rilevate
              </CardTitle>
              <CardDescription className="text-lg">Cronologia dettagliata di tutte le emozioni del tuo pet</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(emotionStats).length > 0 ? (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
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
                          <div className="relative p-3 text-center">
                            <div className="text-xl mb-1">{icon}</div>
                            <div className="font-semibold text-gray-700 capitalize mb-1 text-sm">{emotion}</div>
                            <div className={`text-2xl font-bold bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent`}>
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
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/10 flex items-center justify-center">
                    <PieChartIcon className="h-10 w-10 text-pink-500/60" />
                  </div>
                  <p className="text-lg text-muted-foreground mb-6">Nessuna analisi disponibile</p>
                  <Button 
                    onClick={() => navigate('/analysis')}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Microscope className="h-5 w-5 mr-2" />
                    Inizia Analisi
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

           {/* Parametri Vitali Card */}
          <Card className="bg-gradient-subtle border-0 shadow-elegant hover:shadow-glow transition-all duration-300">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  Parametri Vitali
                </div>
                <Button
                  onClick={() => handleAddItem('vitals')}
                  size="sm"
                  variant="ghost"
                  className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription className="text-lg">Monitoraggio della salute del tuo pet</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(vitalStats).length > 0 ? (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
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
                         className="group relative overflow-hidden rounded-xl border border-white/30 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                       >
                         <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
                         <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                           <Button
                             onClick={(e) => {
                               e.stopPropagation();
                               handleEditItem('vitals', vital);
                             }}
                             size="sm"
                             variant="ghost"
                             className="h-6 w-6 p-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                           >
                             <Edit className="h-3 w-3" />
                           </Button>
                           <Button
                             onClick={(e) => {
                               e.stopPropagation();
                               handleDeleteItem('vitals', vital, `${vital.replace('_', ' ')}: ${data.value}${data.unit}`);
                             }}
                             size="sm"
                             variant="ghost"
                             className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                           >
                             <Trash2 className="h-3 w-3" />
                           </Button>
                         </div>
                          <div className="relative p-3 text-center">
                            <div className="text-xl mb-1">{icon}</div>
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
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/10 flex items-center justify-center">
                    <Activity className="h-10 w-10 text-blue-500/60" />
                  </div>
                  <p className="text-lg text-muted-foreground mb-6">Nessun parametro vitale registrato</p>
                  <Button 
                    onClick={() => navigate('/diary')}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Activity className="h-5 w-5 mr-2" />
                    Registra Parametri
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Comportamenti Osservati e Farmaci Attivi - Side by side */}
      {selectedPet && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
           {/* Comportamenti Osservati Card */}
          <Card className="bg-gradient-subtle border-0 shadow-elegant hover:shadow-glow transition-all duration-300">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  Comportamenti Osservati
                </div>
                <Button
                  onClick={() => handleAddItem('behaviors')}
                  size="sm"
                  variant="ghost"
                  className="text-purple-500 hover:text-purple-600 hover:bg-purple-50"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription className="text-lg">Cronologia degli atteggiamenti e comportamenti del tuo pet</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(behaviorStats).length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(behaviorStats)
                    .sort(([,a], [,b]) => b.count - a.count)
                    .map(([behavior, data]) => {
                      const behaviorColors = {
                        'felice': 'from-green-400 to-emerald-500',
                        'giocoso': 'from-yellow-400 to-orange-500',
                        'calmo': 'from-blue-400 to-cyan-500',
                        'energico': 'from-orange-400 to-red-500',
                        'ansioso': 'from-red-400 to-pink-500',
                        'aggressivo': 'from-red-500 to-red-600',
                        'socievole': 'from-pink-400 to-purple-500',
                        'timido': 'from-gray-400 to-slate-500',
                        'curioso': 'from-indigo-400 to-purple-500',
                        'rilassato': 'from-teal-400 to-cyan-500'
                      };
                      const behaviorIcons = {
                        'felice': '😊',
                        'giocoso': '🎾',
                        'calmo': '😌',
                        'energico': '⚡',
                        'ansioso': '😰',
                        'aggressivo': '😠',
                        'socievole': '🤝',
                        'timido': '🙈',
                        'curioso': '🧐',
                        'rilassato': '😎'
                      };
                      const gradientClass = behaviorColors[behavior as keyof typeof behaviorColors] || 'from-purple-400 to-violet-500';
                      const icon = behaviorIcons[behavior as keyof typeof behaviorIcons] || '🐾';
                      
                       return (
                         <div 
                           key={behavior} 
                           className="group relative overflow-hidden rounded-xl border border-white/20 bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                         >
                           <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
                           <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                             <Button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 handleEditItem('behaviors', behavior);
                               }}
                               size="sm"
                               variant="ghost"
                               className="h-6 w-6 p-0 text-purple-500 hover:text-purple-600 hover:bg-purple-50"
                             >
                               <Edit className="h-3 w-3" />
                             </Button>
                             <Button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 handleDeleteItem('behaviors', behavior, `${behavior.replace('_', ' ')} (${data.count})`);
                               }}
                               size="sm"
                               variant="ghost"
                               className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                             >
                               <Trash2 className="h-3 w-3" />
                             </Button>
                           </div>
                           <div className="relative p-4 text-center">
                             <div className="text-2xl mb-2">{icon}</div>
                             <div className="font-semibold text-gray-700 capitalize mb-1 text-sm">
                               {behavior.replace('_', ' ')}
                             </div>
                             <div className={`text-2xl font-bold bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent`}>
                               {data.count}
                             </div>
                             <div className="text-xs text-gray-500 mt-1">
                               {data.lastSeen}
                             </div>
                           </div>
                         </div>
                       );
                    })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500/20 to-violet-500/10 flex items-center justify-center">
                    <Brain className="h-10 w-10 text-purple-500/60" />
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
              )}
            </CardContent>
          </Card>

           {/* Farmaci Attivi Card */}
          <Card className="bg-gradient-subtle border-0 shadow-elegant hover:shadow-glow transition-all duration-300">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                    <Pill className="h-6 w-6 text-white" />
                  </div>
                  Farmaci Attivi
                </div>
                <Button
                  onClick={() => handleAddItem('medications')}
                  size="sm"
                  variant="ghost"
                  className="text-green-500 hover:text-green-600 hover:bg-green-50"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription className="text-lg">Gestione farmaci e terapie in corso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/10 flex items-center justify-center">
                  <Pill className="h-10 w-10 text-green-500/60" />
                </div>
                <p className="text-lg text-muted-foreground mb-6">Nessun farmaco registrato</p>
                <Button 
                  onClick={() => navigate('/diary')} 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Pill className="h-5 w-5 mr-2" />
                  Registra Farmaci
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Visite Recenti e Assicurazione - Side by side */}
      {selectedPet && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
           {/* Visite Recenti Card */}
          <Card className="bg-gradient-subtle border-0 shadow-elegant hover:shadow-glow transition-all duration-300">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  Visite Recenti
                </div>
                <Button
                  onClick={() => handleAddItem('visits')}
                  size="sm"
                  variant="ghost"
                  className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription className="text-lg">Storico delle visite veterinarie e controlli</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/10 flex items-center justify-center">
                  <FileText className="h-10 w-10 text-blue-500/60" />
                </div>
                <p className="text-lg text-muted-foreground mb-6">Nessuna visita registrata</p>
                <Button 
                  onClick={() => navigate('/diary')} 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Registra Visite
                </Button>
              </div>
            </CardContent>
          </Card>

           {/* Assicurazione Card */}
          <Card className="bg-gradient-subtle border-0 shadow-elegant hover:shadow-glow transition-all duration-300">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  Assicurazione
                </div>
                <Button
                  onClick={() => handleAddItem('insurance')}
                  size="sm"
                  variant="ghost"
                  className="text-teal-500 hover:text-teal-600 hover:bg-teal-50"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription className="text-lg">Gestione polizze e coperture assicurative</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/10 flex items-center justify-center">
                  <CreditCard className="h-10 w-10 text-teal-500/60" />
                </div>
                <p className="text-lg text-muted-foreground mb-6">Nessuna polizza registrata</p>
                <Button 
                  onClick={() => navigate('/diary')} 
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Aggiungi Polizza
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Veterinario e Contatti Emergenza - Side by side */}
      {selectedPet && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
           {/* Veterinario Card - Left */}
          <Card className="bg-gradient-subtle border-0 shadow-elegant hover:shadow-glow transition-all duration-300">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <Stethoscope className="h-6 w-6 text-white" />
                  </div>
                  Veterinario
                </div>
                <Button
                  onClick={() => handleAddItem('veterinarian')}
                  size="sm"
                  variant="ghost"
                  className="text-purple-500 hover:text-purple-600 hover:bg-purple-50"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription className="text-lg">Informazioni del veterinario di fiducia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/10 flex items-center justify-center">
                  <Stethoscope className="h-10 w-10 text-purple-500/60" />
                </div>
                <p className="text-lg text-muted-foreground mb-6">Nessun veterinario registrato</p>
                <Button 
                  onClick={() => navigate('/diary')} 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Stethoscope className="h-5 w-5 mr-2" />
                  Aggiungi Veterinario
                </Button>
              </div>
            </CardContent>
          </Card>

           {/* Contatti Emergenza Card - Right */}
          <Card className="bg-gradient-subtle border-0 shadow-elegant hover:shadow-glow transition-all duration-300">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  Contatti Emergenza
                </div>
                <Button
                  onClick={() => handleAddItem('emergency_contacts')}
                  size="sm"
                  variant="ghost"
                  className="text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription className="text-lg">Numeri di emergenza e pronto soccorso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/10 flex items-center justify-center">
                  <Phone className="h-10 w-10 text-orange-500/60" />
                </div>
                <p className="text-lg text-muted-foreground mb-6">Nessun contatto di emergenza</p>
                <Button 
                  onClick={() => navigate('/diary')} 
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Aggiungi Contatti
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Wellness Cards - Tutte le card rimanenti in griglia */}
      {selectedPet && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">

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

      {/* Vital Signs Modal */}
      <Dialog open={vitalModal.open} onOpenChange={(open) => setVitalModal(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {vitalModal.mode === 'add' ? 'Aggiungi Parametro Vitale' : 'Modifica Parametro Vitale'}
            </DialogTitle>
            <DialogDescription>
              Inserisci i dati del parametro vitale per il tuo pet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="vitalType">Tipo di Parametro Vitale</Label>
              <Select 
                value={vitalModal.vitalType} 
                onValueChange={(value) => {
                  setVitalModal(prev => ({ ...prev, vitalType: value }));
                  // Set automatic unit based on vital type
                  const defaultUnits = {
                    'temperatura': '°C',
                    'frequenza_cardiaca': 'bpm',
                    'respirazione': 'atti/min'
                  };
                  setVitalForm(prev => ({ 
                    ...prev, 
                    unit: defaultUnits[value as keyof typeof defaultUnits] || '' 
                  }));
                }}
                disabled={vitalModal.mode === 'edit'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona parametro vitale" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="temperatura">🌡️ Temperatura Corporea</SelectItem>
                  <SelectItem value="frequenza_cardiaca">❤️ Frequenza Cardiaca</SelectItem>
                  <SelectItem value="respirazione">🫁 Respirazione</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="value">Valore</Label>
              <div className="space-y-2">
                <Input
                  id="value"
                  type="number"
                  step="0.1"
                  value={vitalForm.value}
                  onChange={(e) => setVitalForm(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="Inserisci valore"
                />
                {vitalForm.value && vitalModal.vitalType && (() => {
                  const numValue = parseFloat(vitalForm.value);
                  if (!isNaN(numValue)) {
                    const rangeCheck = isVitalInNormalRange(vitalModal.vitalType, numValue, selectedPet?.type);
                    if (!rangeCheck.isNormal) {
                      return (
                        <Alert className="border-red-200 bg-red-50">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-red-700">
                            <strong>Attenzione:</strong> {rangeCheck.message}
                          </AlertDescription>
                        </Alert>
                      );
                    }
                  }
                })()}
              </div>
            </div>
            <div>
              <Label htmlFor="unit">Unità di Misura</Label>
              <Input
                id="unit"
                value={vitalForm.unit}
                readOnly
                className="bg-muted"
                placeholder="Unità automatica"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleVitalSubmit} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {vitalModal.mode === 'add' ? 'Aggiungi' : 'Salva'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setVitalModal(prev => ({ ...prev, open: false }))}
              >
                <X className="h-4 w-4 mr-2" />
                Annulla
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        variant="destructive"
      />
    </div>
  );
};

export default DashboardPage;