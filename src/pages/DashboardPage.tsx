import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { useUnifiedToast } from '@/hooks/use-unified-toast';
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
import { MedicationModal } from '@/components/medication/MedicationModal';
import { DiaryEntryForm } from '@/components/diary/DiaryEntryForm';
import { EventForm } from '@/components/calendar/EventForm';
import { DiaryEntry } from '@/types/diary';
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
  const { toast } = useToast();
  const { showDeleteToast } = useUnifiedToast();
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
  const [medicalEvents, setMedicalEvents] = useState<any[]>([]);
  const [insurances, setInsurances] = useState<any[]>([]);
  const [diaryEntriesData, setDiaryEntriesData] = useState<any[]>([]);
  const [petAnalyses, setPetAnalyses] = useState<any[]>([]);
  const [showFirstAidGuide, setShowFirstAidGuide] = useState(false);
  const [emotionStats, setEmotionStats] = useState<{[key: string]: number}>({});
  const [vitalStats, setVitalStats] = useState<{[key: string]: {value: number | string, unit: string, date: string}}>({});
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
    currentValue: { value: number | string; unit: string; date: string } | null;
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

  // Diary modal state
  const [diaryModal, setDiaryModal] = useState<{
    open: boolean;
    mode: 'add' | 'edit';
    entry: DiaryEntry | null;
  }>({
    open: false,
    mode: 'add',
    entry: null
  });

  // Medication modal state
  const [medicationModal, setMedicationModal] = useState<{
    open: boolean;
    mode: 'add' | 'edit';
    medication: any | null;
  }>({
    open: false,
    mode: 'add',
    medication: null
  });

  // Event modal state
  const [eventModal, setEventModal] = useState<{
    open: boolean;
    mode: 'add' | 'edit';
    event: any | null;
    preselectedCategory?: string;
  }>({
    open: false,
    mode: 'add',
    event: null,
    preselectedCategory: undefined
  });

  // Medication evaluation modal state
  const [medicationEvaluationModal, setMedicationEvaluationModal] = useState<{
    open: boolean;
    medication: any | null;
  }>({
    open: false,
    medication: null
  });

  // Map behaviors to diary entries for easy access
  const [behaviorEntryMap, setBehaviorEntryMap] = useState<{[behavior: string]: DiaryEntry}>({});
  
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

        // Get medical events (for Recent Visits card)
        const { data: medicalEvents } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('pet_id', selectedPet.id)
          .eq('user_id', user.id)
          .eq('category', 'medical')
          .order('start_time', { ascending: false })
          .limit(5);

        // Get medications
        const { data: medicationsData } = await supabase
          .from('pet_medications')
          .select('*')
          .eq('pet_id', selectedPet.id)
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

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
               // Score based on vital type and value range using first aid guide ranges
               const vitalValue = typeof data.value === 'string' ? data.value : Number(data.value);
               const petType = selectedPet?.type;
               
               switch(vital) {
                 case 'temperatura':
                   const tempValue = Number(vitalValue);
                   if (petType?.toLowerCase().includes('cane')) {
                     return (tempValue >= 38.0 && tempValue <= 39.2) ? 90 : 30;
                   } else if (petType?.toLowerCase().includes('gatto')) {
                     return (tempValue >= 38.1 && tempValue <= 39.2) ? 90 : 30;
                   }
                   return (tempValue >= 38.0 && tempValue <= 39.2) ? 90 : 30;
                   
                 case 'frequenza_cardiaca':
                   const heartValue = Number(vitalValue);
                   if (petType?.toLowerCase().includes('cane')) {
                     return (heartValue >= 60 && heartValue <= 140) ? 90 : 35;
                   } else if (petType?.toLowerCase().includes('gatto')) {
                     return (heartValue >= 140 && heartValue <= 220) ? 90 : 35;
                   }
                   return (heartValue >= 60 && heartValue <= 140) ? 90 : 35;
                   
                 case 'respirazione':
                   const respValue = Number(vitalValue);
                   if (petType?.toLowerCase().includes('cane')) {
                     return (respValue >= 10 && respValue <= 30) ? 90 : 35;
                   } else if (petType?.toLowerCase().includes('gatto')) {
                     return (respValue >= 20 && respValue <= 30) ? 90 : 35;
                   }
                   return (respValue >= 10 && respValue <= 30) ? 90 : 35;
                   
                 case 'colore_gengive':
                   const gumColor = String(vitalValue).toLowerCase();
                   if (gumColor === 'rosa') return 95; // Excellent
                   if (gumColor === 'pallide') return 25; // Poor - possible shock/anemia
                   if (gumColor === 'blu/viola' || gumColor === 'blu' || gumColor === 'viola') return 10; // Critical - oxygen deficit
                   if (gumColor === 'gialle') return 20; // Poor - liver issues
                   return 50; // Unknown color
                   
                 default:
                   return 60; // Default score for unknown vitals
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

        // Save data to states
        setMedicalEvents(medicalEvents || []);
        setDiaryEntriesData(diaryEntries || []);
        setHealthMetrics(healthMetrics || []);

        // Calculate vital stats from health metrics and diary entries
        const vitals: {[key: string]: {value: number, unit: string, date: string}} = {};
        
        // From health metrics - take only the LATEST value for each metric type
        if (healthMetrics && healthMetrics.length > 0) {
          // Mapping from database metric types to Italian keys
          const metricTypeMapping = {
            'temperature': 'temperatura',
            'heart_rate': 'frequenza_cardiaca',
            'respiration': 'respirazione',
            'breathing_rate': 'respirazione',
            'respiratory_rate': 'respirazione',
            'gum_color': 'colore_gengive'
          };
          
          // Group by metric_type and take only the latest (first in DESC order)
          const latestMetrics = new Map();
          healthMetrics.forEach(metric => {
            if (!latestMetrics.has(metric.metric_type)) {
              latestMetrics.set(metric.metric_type, metric);
            }
          });
          
          // Convert to vitals object
          latestMetrics.forEach(metric => {
            const italianKey = metricTypeMapping[metric.metric_type as keyof typeof metricTypeMapping] || metric.metric_type;
            vitals[italianKey] = {
              value: metric.metric_type === 'gum_color' ? metric.value : Number(metric.value),
              unit: metric.unit || '',
              date: format(new Date(metric.recorded_at), 'dd/MM')
            };
          });
        }
        
        // From diary entries (temperature only - mood is NOT a vital parameter)
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
            // REMOVED: mood_score is NOT a vital parameter and should NOT appear in vital stats
          });
        }
        
        setVitalStats(vitals);

        // Calculate behavior statistics from diary entries
        const behaviors: {[key: string]: {count: number, lastSeen: string}} = {};
        const behaviorToEntryMap: {[behavior: string]: DiaryEntry} = {};
        
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
                  
                  // Keep track of the most recent entry for each behavior
                  if (!behaviorToEntryMap[behaviorKey] || 
                      new Date(entry.entry_date) > new Date(behaviorToEntryMap[behaviorKey].entry_date)) {
                    behaviorToEntryMap[behaviorKey] = entry;
                  }
                  
                  if (!behaviors[behaviorKey].lastSeen || entryDate > behaviors[behaviorKey].lastSeen) {
                    behaviors[behaviorKey].lastSeen = entryDate;
                  }
                }
              });
            }
          });
        }
        setBehaviorStats(behaviors);
        setBehaviorEntryMap(behaviorToEntryMap);

      } catch (error) {
        console.error('Error loading pet stats:', error);
      } finally {
        setLoading(false);
      }
    };

    // Load medications data - moved outside useEffect to be accessible
    const loadMeds = async () => {
      if (!selectedPet || !user) return;
      
      try {
        const { data, error } = await supabase
          .from('pet_medications')
          .select('*')
          .eq('pet_id', selectedPet.id)
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Check for expired medications that need evaluation
        const now = new Date();
        const expiredMedications = (data || []).filter(medication => 
          medication.end_date && 
          new Date(medication.end_date) < now && 
          !medication.has_been_evaluated
        );

        // Show evaluation modal for the first expired medication
        if (expiredMedications.length > 0) {
          setMedicationEvaluationModal({
            open: true,
            medication: expiredMedications[0]
          });
        }

        setMedications(data || []);
      } catch (error) {
        console.error('Error loading medications:', error);
      }
    };

    loadPetStats();
    loadMeds();
  }, [selectedPet, user]);

  // Load medications function accessible by other functions
  const loadMedications = async () => {
    if (!selectedPet || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('pet_medications')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedications(data || []);
    } catch (error) {
      console.error('Error loading medications:', error);
    }
  };

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
        setDiaryModal({
          open: true,
          mode: 'add',
          entry: null
        });
        // Aggiungo un piccolo suggerimento per l'utente
        setTimeout(() => {
          toast({
            title: "💡 Suggerimento",
            description: "Ricordati di selezionare dei tag comportamentali per vederli nella dashboard!",
          });
        }, 1000);
        break;
      case 'medications':
        setMedicationModal({
          open: true,
          mode: 'add',
          medication: null
        });
        break;
      case 'visits':
        setEventModal({
          open: true,
          mode: 'add',
          event: null,
          preselectedCategory: 'medical'
        });
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
        // Apri il modal di modifica della voce del diario corrispondente
        if (itemId && behaviorEntryMap[itemId]) {
          setDiaryModal({
            open: true,
            mode: 'edit',
            entry: behaviorEntryMap[itemId]
          });
        } else {
          toast({
            title: "❌ Errore",
            description: "Impossibile trovare la voce del diario corrispondente.",
            className: "border-red-200 bg-red-50 text-red-800",
          });
        }
        break;
      case 'medications':
        if (itemId) {
          const medication = medications.find(m => m.id === itemId);
          if (medication) {
            setMedicationModal({
              open: true,
              mode: 'edit',
              medication: medication
            });
          }
        }
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
      title: "Conferma Eliminazione",
      description: `Sei sicuro di voler eliminare "${itemName}"? Questa azione non può essere annullata.`,
      onConfirm: async () => {
        try {
          if (type === 'vitals') {
            // Map Italian vital types to database metric types  
            const vitalTypeMapping = {
              'temperatura': 'temperature',
              'frequenza_cardiaca': 'heart_rate',
              'respirazione': 'breathing_rate',
              'colore_gengive': 'gum_color'
            };

            const dbMetricType = vitalTypeMapping[itemId as keyof typeof vitalTypeMapping];
            
            if (dbMetricType && selectedPet && user) {
              // Delete from database
              const { error } = await supabase
                .from('health_metrics')
                .delete()
                .eq('pet_id', selectedPet.id)
                .eq('user_id', user.id)
                .eq('metric_type', dbMetricType)
                .order('recorded_at', { ascending: false })
                .limit(1);

              if (error) {
                console.error('Error deleting from database:', error);
              }
            }

            // Remove from local state
            const newVitalStats = { ...vitalStats };
            delete newVitalStats[itemId];
            setVitalStats(newVitalStats);
            
            toast({
              title: "Parametro vitale eliminato",
              description: `${itemName} è stato eliminato con successo.`,
            });
          } else if (type === 'behaviors') {
            // Elimina la voce del diario corrispondente
            if (behaviorEntryMap[itemId]) {
              const entryToDelete = behaviorEntryMap[itemId];
              const { error } = await supabase
                .from('diary_entries')
                .delete()
                .eq('id', entryToDelete.id);

              if (error) {
                console.error('Error deleting diary entry:', error);
                toast({
                  title: "❌ Errore",
                  description: "Si è verificato un errore durante l'eliminazione della voce del diario.",
                  className: "border-red-200 bg-red-50 text-red-800",
                });
                return;
              }

              // Remove from local state
              const newBehaviorStats = { ...behaviorStats };
              delete newBehaviorStats[itemId];
              setBehaviorStats(newBehaviorStats);
              
              const newBehaviorEntryMap = { ...behaviorEntryMap };
              delete newBehaviorEntryMap[itemId];
              setBehaviorEntryMap(newBehaviorEntryMap);
              
              toast({
                title: "🗑️ Comportamento eliminato",
                description: `La voce del diario contenente "${itemName}" è stata eliminata con successo.`,
                className: "border-red-200 bg-red-50 text-red-800",
              });
            } else {
              toast({
                title: "❌ Errore",
                description: "Impossibile trovare la voce del diario corrispondente.",
                className: "border-red-200 bg-red-50 text-red-800",
              });
            }
          } else if (type === 'medications') {
            // Elimina il farmaco dal database
            const { error } = await supabase
              .from('pet_medications')
              .delete()
              .eq('id', itemId);

            if (error) {
              console.error('Error deleting medication:', error);
              toast({
                title: "Errore",
                description: "Si è verificato un errore durante l'eliminazione del farmaco.",
                variant: "destructive"
              });
              return;
            }

            // Ricarica i farmaci per aggiornare la UI
            if (selectedPet && user) {
              const { data } = await supabase
                .from('pet_medications')
                .select('*')
                .eq('pet_id', selectedPet.id)
                .eq('user_id', user.id)
                .eq('is_active', true);
              
              setMedications(data || []);
            }
            
            showDeleteToast({
              title: "Farmaco eliminato",
              description: `${itemName} è stato eliminato con successo.`
            });
          } else {
            const title = type === 'medications' ? "Farmaco eliminato" : "Elemento eliminato";
            toast({
              title: title, 
              description: `${itemName} è stato eliminato con successo.`,
              variant: "destructive"
            });
          }
          setConfirmDialog(prev => ({ ...prev, open: false }));
        } catch (error) {
          console.error('Error deleting item:', error);
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
      // Map Italian vital types to database metric types
      const vitalTypeMapping = {
        'temperatura': 'temperature',
        'frequenza_cardiaca': 'heart_rate',
        'respirazione': 'respiration',  // Fixed: use 'respiration' not 'breathing_rate'
        'colore_gengive': 'gum_color'
      };

      const dbMetricType = vitalTypeMapping[vitalModal.vitalType as keyof typeof vitalTypeMapping];
      
      if (!dbMetricType) {
        throw new Error('Tipo di parametro vitale non riconosciuto');
      }

      let valueToSave: number;
      
      // Handle different value types
      if (vitalModal.vitalType === 'colore_gengive') {
        // Map color values to numbers for database
        const colorMapping = {
          'rosa': 1,
          'pallide': 2, 
          'blu/viola': 3,
          'gialle': 4
        };
        valueToSave = colorMapping[vitalForm.value as keyof typeof colorMapping] || 1;
      } else {
        valueToSave = parseFloat(vitalForm.value);
      }

      if (vitalModal.mode === 'edit') {
        // Update existing record
        const { error } = await supabase
          .from('health_metrics')
          .update({
            value: valueToSave,
            unit: vitalForm.unit,
            recorded_at: new Date().toISOString()
          })
          .eq('pet_id', selectedPet.id)
          .eq('user_id', user.id)
          .eq('metric_type', dbMetricType)
          .order('recorded_at', { ascending: false })
          .limit(1);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('health_metrics')
          .insert({
            user_id: user.id,
            pet_id: selectedPet.id,
            metric_type: dbMetricType,
            value: valueToSave,
            unit: vitalForm.unit,
            recorded_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      // Reload the dashboard data to reflect changes
      const loadPetStats = async () => {
        if (!selectedPet || !user) return;

        setLoading(true);
        try {
          // Reload all the data (simplified version focusing on health metrics)
          const { data: healthMetrics } = await supabase
            .from('health_metrics')
            .select('*')
            .eq('pet_id', selectedPet.id)
            .eq('user_id', user.id)
            .order('recorded_at', { ascending: false });

          // Update vitalStats from fresh database data
          const vitals: {[key: string]: {value: number | string, unit: string, date: string}} = {};
          
          if (healthMetrics && healthMetrics.length > 0) {
            // Group by metric_type and get the latest for each
            const latestMetrics: {[key: string]: any} = {};
            healthMetrics.forEach(metric => {
              if (!latestMetrics[metric.metric_type] || 
                  new Date(metric.recorded_at) > new Date(latestMetrics[metric.metric_type].recorded_at)) {
                latestMetrics[metric.metric_type] = metric;
              }
            });

            // Map back to Italian keys and handle special cases
            Object.entries(latestMetrics).forEach(([metricType, metric]) => {
              const italianKeyMapping = {
                'temperature': 'temperatura',
                'heart_rate': 'frequenza_cardiaca',
                'respiration': 'respirazione',  // Fixed: use 'respiration' not 'breathing_rate'
                'gum_color': 'colore_gengive'
              };

              const italianKey = italianKeyMapping[metricType as keyof typeof italianKeyMapping];
              if (italianKey) {
                let displayValue: number | string = metric.value;
                
                // Handle gum color mapping back to Italian
                if (metricType === 'gum_color') {
                  const colorValueMapping = {
                    1: 'rosa',
                    2: 'pallide',
                    3: 'blu/viola', 
                    4: 'gialle'
                  };
                  displayValue = colorValueMapping[metric.value as keyof typeof colorValueMapping] || 'rosa';
                }

                vitals[italianKey] = {
                  value: displayValue,
                  unit: metric.unit || '',
                  date: format(new Date(metric.recorded_at), 'dd/MM')
                };
              }
            });
          }
          
          setVitalStats(vitals);
        } catch (error) {
          console.error('Error reloading pet stats:', error);
        } finally {
          setLoading(false);
        }
      };

      await loadPetStats();
      setVitalModal({ open: false, mode: 'add', vitalType: '', currentValue: null });
      
      toast({
        title: vitalModal.mode === 'add' ? "Parametro vitale aggiunto" : "Parametro vitale modificato",
        description: `${vitalModal.vitalType.replace('_', ' ')} è stato ${vitalModal.mode === 'add' ? 'aggiunto' : 'modificato'} con successo.`,
      });
    } catch (error) {
      console.error('Error saving vital:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio.",
        variant: "destructive"
      });
    }
  };

  // Delete vital sign
  const deleteVitalSign = async (type: string) => {
    try {
      console.log('Deleting vital sign:', type);
      
      if (type === 'temperatura') {
        // Temperature is stored in diary_entries
        const { data, error } = await supabase
          .from('diary_entries')
          .delete()
          .eq('pet_id', selectedPet.id)
          .eq('user_id', user.id)
          .not('temperature', 'is', null);
        
        console.log('Delete temperature result:', { data, error });
        if (error) throw error;
      } else {
        // Other vitals are stored in health_metrics
        const metricTypeMap: Record<string, string> = {
          'battiti_cardiaci': 'heart_rate',
          'frequenza_cardiaca': 'heart_rate',
          'respirazione': 'respiration',  // Fixed: use 'respiration' not 'respiratory_rate'
          'colore_gengive': 'gum_color'
        };
        
        const dbType = metricTypeMap[type];
        console.log('Mapping vital type:', type, 'to DB type:', dbType);
        
        if (!dbType) {
          console.error('Unknown vital type:', type);
          return;
        }
        
        const { data, error } = await supabase
          .from('health_metrics')
          .delete()
          .eq('pet_id', selectedPet.id)
          .eq('user_id', user.id)
          .eq('metric_type', dbType);
        
        console.log('Delete health_metrics result:', { data, error });
        if (error) throw error;
      }
      
      // Remove from local state
      setVitalStats(prev => {
        const newStats = { ...prev };
        delete newStats[type];
        return newStats;
      });
      
      toast({
        title: "Parametro eliminato",
        description: "Valore eliminato con successo",
      });
      
    } catch (error) {
      console.error('Error deleting vital sign:', error);
      toast({
        title: "Errore",
        description: "Errore durante l'eliminazione",
        variant: "destructive"
      });
    }
  };

  // Check if vital parameter is within normal range
  const isVitalInNormalRange = (vitalType: string, value: number | string, petType?: string): { isNormal: boolean; message: string } => {
    const isDog = petType?.toLowerCase().includes('cane');
    const isCat = petType?.toLowerCase().includes('gatto');
    
    // Debug log to check what we're receiving
    console.log('Checking vital:', vitalType, 'value:', value, 'type:', typeof value, 'petType:', petType);
    
    switch(vitalType) {
      case 'temperatura':
        const tempValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isDog && (tempValue >= 38.0 && tempValue <= 39.2)) return { isNormal: true, message: "Normale" };
        if (isCat && (tempValue >= 38.1 && tempValue <= 39.2)) return { isNormal: true, message: "Normale" };
        if (tempValue < 37.0) return { isNormal: false, message: "Troppo bassa - Ipotermia" };
        if (tempValue > 40.0) return { isNormal: false, message: "Troppo alta - Ipertermia/Febbre" };
        return { isNormal: false, message: "Fuori dal range normale" };
        
      case 'frequenza_cardiaca':
        const heartValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isDog) {
          if (heartValue >= 60 && heartValue <= 140) return { isNormal: true, message: "Normale" };
        }
        if (isCat && (heartValue >= 140 && heartValue <= 220)) return { isNormal: true, message: "Normale" };
        if (heartValue < 50) return { isNormal: false, message: "Troppo bassa - Bradicardia" };
        if (heartValue > 250) return { isNormal: false, message: "Troppo alta - Tachicardia" };
        return { isNormal: false, message: "Fuori dal range normale" };
        
       case 'respirazione':
         const respValue = typeof value === 'string' ? parseFloat(value) : value;
         // Make sure we have a valid number
         if (isNaN(respValue)) return { isNormal: false, message: "Valore non valido" };
         
         if (isDog && (respValue >= 10 && respValue <= 30)) return { isNormal: true, message: "Normale" };
         if (isCat && (respValue >= 20 && respValue <= 30)) return { isNormal: true, message: "Normale" };
         if (respValue < 8) return { isNormal: false, message: "Troppo bassa - Bradipnea" };
         if (respValue > 40) return { isNormal: false, message: "Troppo alta - Tachipnea" };
         
         // If no pet type specified, use general range
         if (!isDog && !isCat) {
           if (respValue >= 10 && respValue <= 30) return { isNormal: true, message: "Normale" };
         }
         
         return { isNormal: false, message: "Fuori dal range normale" };
        
      case 'colore_gengive':
        // Handle both string and numeric values
        let gumColor = '';
        if (typeof value === 'number') {
          const numericMapping: Record<number, string> = {
            1: 'rosa',
            2: 'pallide', 
            3: 'blu/viola',
            4: 'gialle'
          };
          gumColor = numericMapping[value] || '';
        } else {
          gumColor = typeof value === 'string' ? value.toLowerCase() : '';
        }
        
        if (gumColor === 'rosa') return { isNormal: true, message: "Normale" };
        if (gumColor === 'pallide') return { isNormal: false, message: "Possibile shock o anemia" };
        if (gumColor === 'blu' || gumColor === 'viola' || gumColor === 'blu/viola') return { isNormal: false, message: "Mancanza di ossigeno - EMERGENZA" };
        if (gumColor === 'gialle') return { isNormal: false, message: "Possibili problemi al fegato" };
        return { isNormal: false, message: "Colore non riconosciuto" };
        
      default:
        return { isNormal: true, message: "Range non definito" };
    }
  };

  // Handle diary form submission
  const handleDiarySave = async (formData: any) => {
    try {
      if (!selectedPet || !user) return;

      const entryData = {
        ...formData,
        pet_id: selectedPet.id,
        user_id: user.id,
      };

      if (diaryModal.mode === 'edit' && diaryModal.entry) {
        // Update existing entry
        const { error } = await supabase
          .from('diary_entries')
          .update(entryData)
          .eq('id', diaryModal.entry.id);

        if (error) throw error;

        toast({
          title: "✅ Comportamenti aggiornati",
          description: "La voce del diario è stata modificata con successo.",
          className: "border-green-200 bg-green-50 text-green-800",
        });
      } else {
        // Create new entry
        const { error } = await supabase
          .from('diary_entries')
          .insert(entryData);

        if (error) throw error;

        toast({
          title: "🐾 Comportamenti registrati",
          description: "La voce del diario è stata creata con successo.",
          className: "border-green-200 bg-green-50 text-green-800",
        });
      }

      // Ricarica manualmente i dati del comportamento
      if (selectedPet && user) {
        const { data: diaryEntries } = await supabase
          .from('diary_entries')
          .select('*')
          .eq('pet_id', selectedPet.id)
          .eq('user_id', user.id)
          .order('entry_date', { ascending: false });

        // Ricalcola le statistiche dei comportamenti
        const behaviors: {[key: string]: {count: number, lastSeen: string}} = {};
        const behaviorToEntryMap: {[behavior: string]: DiaryEntry} = {};
        
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
                  
                  if (!behaviorToEntryMap[behaviorKey] || 
                      new Date(entry.entry_date) > new Date(behaviorToEntryMap[behaviorKey].entry_date)) {
                    behaviorToEntryMap[behaviorKey] = entry;
                  }
                  
                  if (!behaviors[behaviorKey].lastSeen || entryDate > behaviors[behaviorKey].lastSeen) {
                    behaviors[behaviorKey].lastSeen = entryDate;
                  }
                }
              });
            }
          });
        }
        setBehaviorStats(behaviors);
        setBehaviorEntryMap(behaviorToEntryMap);
      }
      setDiaryModal({ open: false, mode: 'add', entry: null });

    } catch (error) {
      console.error('Error saving diary entry:', error);
      toast({
        title: "❌ Errore",
        description: "Si è verificato un errore durante il salvataggio della voce del diario.",
        className: "border-red-200 bg-red-50 text-red-800",
      });
    }
  };

  // Handle medication evaluation response
  const handleMedicationEvaluation = async (wasEffective: boolean) => {
    if (!medicationEvaluationModal.medication || !selectedPet || !user) return;

    try {
      // Mark medication as evaluated
      const { error: updateError } = await supabase
        .from('pet_medications')
        .update({ 
          has_been_evaluated: true,
          effectiveness_rating: wasEffective ? 'effective' : 'ineffective'
        })
        .eq('id', medicationEvaluationModal.medication.id);

      if (updateError) throw updateError;

      // Calculate impact based on medication type and effectiveness
      const medicationName = medicationEvaluationModal.medication.medication_name;
      const medicationType = medicationName.split(' - ')[0]?.toLowerCase() || '';
      
      // Define medication impact based on type
      const medicationImpacts = {
        'antibiotico': wasEffective ? 12 : -8,
        'antinfiammatorio': wasEffective ? 8 : -5,
        'antidolorifico': wasEffective ? 10 : -7,
        'antiparassitario': wasEffective ? 15 : -10,
        'ansiolitico': wasEffective ? 15 : -12,
        'cardiaco': wasEffective ? 20 : -15,
        'digestivo': wasEffective ? 8 : -6,
        'insulina': wasEffective ? 18 : -15,
        'ormone': wasEffective ? 12 : -10,
        'antistaminico': wasEffective ? 6 : -4,
        'corticosteroide': wasEffective ? 10 : -8,
        'integratore': wasEffective ? 5 : -2,
        'chemioterapico': wasEffective ? 25 : -20,
        'altro': wasEffective ? 8 : -5
      };

      const impact = medicationImpacts[medicationType] || (wasEffective ? 8 : -5);
      
      // Update wellness score based on medication type and effectiveness
      const currentWellness = petStats.wellnessScore;
      const newWellnessScore = Math.max(0, Math.min(100, currentWellness + impact));
      
      // Calculate mood trend impact (medications affect recent mood positively/negatively)
      const trendImpact = wasEffective ? Math.abs(impact) : -Math.abs(impact);
      const newMoodTrend = Math.max(-50, Math.min(50, petStats.moodTrend + trendImpact));

      if (wasEffective) {
        toast({
          title: "✅ Valutazione registrata",
          description: `Ottimo! Il farmaco ${medicationType} ha funzionato. Il benessere del tuo pet è migliorato.`,
          className: "border-green-200 bg-green-50 text-green-800",
        });
      } else {
        toast({
          title: "❌ Valutazione registrata", 
          description: `Il farmaco ${medicationType} non ha funzionato come sperato. Considera di consultare il veterinario.`,
          className: "border-red-200 bg-red-50 text-red-800",
        });
      }

      // Update pet stats with calculated values
      setPetStats(prev => ({
        ...prev,
        wellnessScore: newWellnessScore,
        moodTrend: newMoodTrend,
        healthStatus: newWellnessScore >= 80 ? 'Eccellente' : 
                     newWellnessScore >= 60 ? 'Buono' :
                     newWellnessScore >= 40 ? 'Discreto' : 'Preoccupante'
      }));

      // Close modal and reload medications
      setMedicationEvaluationModal({ open: false, medication: null });
      loadMedications();

    } catch (error) {
      console.error('Error evaluating medication:', error);
      toast({
        title: "❌ Errore",
        description: "Si è verificato un errore durante la registrazione della valutazione.",
        className: "border-red-200 bg-red-50 text-red-800",
      });
    }
  };

  // Handle event save
  const handleEventSave = async (eventData: any) => {
    try {
      setLoading(true);
      
      if (eventModal.mode === 'edit' && eventModal.event) {
        // Update existing event
        const { error } = await supabase
          .from('calendar_events')
          .update(eventData)
          .eq('id', eventModal.event.id);

        if (error) throw error;

        toast({
          title: "✅ Evento aggiornato",
          description: "L'evento è stato aggiornato con successo.",
        });
      } else {
        // Create new event
        const { data, error } = await supabase
          .from('calendar_events')
          .insert([eventData])
          .select();

        if (error) throw error;

        toast({
          title: "✅ Evento creato",
          description: "L'evento è stato aggiunto al calendario con successo.",
        });
      }

      setEventModal({ open: false, mode: 'add', event: null, preselectedCategory: undefined });
      
      // Reload medical events if it was a medical event
      if (eventData.category === 'medical') {
        const { data: medicalEvents } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('pet_id', selectedPet?.id)
          .eq('user_id', user?.id)
          .eq('category', 'medical')
          .order('start_time', { ascending: false })
          .limit(5);
        
        setMedicalEvents(medicalEvents || []);
      }

    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "❌ Errore",
        description: "Errore nel salvare l'evento. Riprova.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle medical event edit
  const handleEditMedicalEvent = (event: any) => {
    setEventModal({
      open: true,
      mode: 'edit',
      event: event,
      preselectedCategory: 'medical'
    });
  };

  // Handle medical event delete
  const handleDeleteMedicalEvent = (eventId: string) => {
    setConfirmDialog({
      open: true,
      title: "Elimina Visita",
      description: "Sei sicuro di voler eliminare questa visita? Questa azione non può essere annullata.",
      onConfirm: async () => {
        try {
          setLoading(true);
          
          const { error } = await supabase
            .from('calendar_events')
            .delete()
            .eq('id', eventId);

          if (error) throw error;

          // Reload medical events
          const { data: medicalEvents } = await supabase
            .from('calendar_events')
            .select('*')
            .eq('pet_id', selectedPet?.id)
            .eq('user_id', user?.id)
            .eq('category', 'medical')
            .order('start_time', { ascending: false })
            .limit(5);
          
          setMedicalEvents(medicalEvents || []);

          toast({
            title: "🗑️ Visita eliminata",
            description: "La visita è stata eliminata con successo.",
            variant: "destructive"
          });

          setConfirmDialog({ open: false, title: "", description: "", onConfirm: () => {} });
        } catch (error) {
          console.error('Error deleting medical event:', error);
          toast({
            title: "❌ Errore",
            description: "Errore nell'eliminazione della visita. Riprova.",
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Handle diary modal close
  const handleDiaryClose = () => {
    setDiaryModal({ open: false, mode: 'add', entry: null });
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
                <div className={`text-2xl font-bold ${
                  petStats.wellnessScore >= 70 ? 'text-green-500' :
                  petStats.wellnessScore >= 30 ? 'text-orange-500' : 'text-red-500'
                }`}>
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
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
                <div 
                  className="h-full transition-all rounded-full"
                  style={{
                    width: `${petStats.wellnessScore > 0 ? petStats.wellnessScore : 0}%`,
                    backgroundColor: petStats.wellnessScore >= 70 ? '#10b981' :
                                   petStats.wellnessScore >= 30 ? '#f59e0b' : '#ef4444'
                  }}
                />
              </div>
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
                <div className="space-y-3">
                  {Object.entries(vitalStats).map(([vital, data]) => {
                    const vitalColors = {
                      'temperatura': 'from-red-400 to-orange-500',
                      'frequenza_cardiaca': 'from-red-500 to-red-600',
                      'respirazione': 'from-blue-400 to-cyan-500',
                      'colore_gengive': 'from-pink-400 to-rose-500'
                    };
                    const vitalIcons = {
                      'temperatura': '🌡️',
                      'frequenza_cardiaca': '❤️',
                      'respirazione': '🫁',
                      'colore_gengive': '👄'
                    };
                    const vitalLabels = {
                      'temperatura': 'Temperatura',
                      'frequenza_cardiaca': 'Frequenza Cardiaca', 
                      'respirazione': 'Respirazione',
                      'colore_gengive': 'Colore Gengive'
                    };
                    
                    // Translate gum color values to Italian
                    const translateGumColor = (color: string | number) => {
                      // Handle numeric values (legacy data)
                      const numericTranslations: Record<string, string> = {
                        '1': 'Rosa',
                        '2': 'Pallide', 
                        '3': 'Blu/Viola',
                        '4': 'Gialle'
                      };
                      
                      // Handle string values
                      const stringTranslations: Record<string, string> = {
                        'rosa': 'Rosa',
                        'pallide': 'Pallide',
                        'blu/viola': 'Blu/Viola',
                        'gialle': 'Gialle'
                      };
                      
                      const colorStr = color.toString();
                      return numericTranslations[colorStr] || 
                             stringTranslations[colorStr.toLowerCase()] || 
                             `Colore non riconosciuto (${colorStr})`;
                    };
                    
                    // Check if vital is in normal range
                    const rangeCheck = isVitalInNormalRange(vital, data.value, selectedPet?.type);
                    
                    // Use red gradient if value is abnormal, green gradient if normal
                    const gradientClass = !rangeCheck.isNormal 
                      ? 'from-red-500 to-red-600' 
                      : 'from-green-400 to-emerald-500';
                    
                    // Use red background for the card if value is abnormal, green if normal
                    const cardBackgroundClass = !rangeCheck.isNormal 
                      ? 'bg-red-50 border-red-200 hover:bg-red-100' 
                      : 'bg-green-50 border-green-200 hover:bg-green-100';
                    
                    const icon = vitalIcons[vital as keyof typeof vitalIcons] || '📋';
                    const label = vitalLabels[vital as keyof typeof vitalLabels] || vital.replace('_', ' ');
                    
                    return (
                      <div 
                        key={vital} 
                        className={`group relative overflow-hidden rounded-xl border backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${cardBackgroundClass}`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
                        
                        {/* Main content */}
                        <div className="relative p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{icon}</div>
                              <div>
                                <div className="font-semibold text-gray-700 text-sm">
                                  {label}
                                </div>
                                <div className={`text-lg font-bold bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent flex items-center gap-1`}>
                                  {vital === 'colore_gengive' 
                                    ? translateGumColor(data.value.toString())
                                    : data.value
                                  }
                                  {data.unit && <span className="text-sm text-gray-500">{data.unit}</span>}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {data.date}
                                </div>
                              </div>
                            </div>
                            
                            {/* Action buttons */}
                            <div className="flex gap-1">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditItem('vitals', vital);
                                }}
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const displayValue = vital === 'colore_gengive' 
                                    ? translateGumColor(data.value.toString())
                                    : `${data.value}${data.unit}`;
                                  handleDeleteItem('vitals', vital, `${label}: ${displayValue}`);
                                }}
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Range indicator */}
                          <div className="mt-2 px-2 py-1 rounded-md">
                            {rangeCheck.isNormal ? (
                              <div className="flex items-center gap-1 bg-green-100 border border-green-200 px-2 py-1 rounded-md">
                                <div className="h-3 w-3 rounded-full bg-green-600"></div>
                                <span className="text-xs text-green-700">Valori nella norma - Il pet sta bene</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 bg-red-100 border border-red-200 px-2 py-1 rounded-md">
                                <AlertTriangle className="h-3 w-3 text-red-600" />
                                <span className="text-xs text-red-700">{rangeCheck.message}</span>
                              </div>
                            )}
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
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3 pr-4">
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
                          className="group relative overflow-hidden rounded-xl border backdrop-blur-sm transition-all duration-300 hover:shadow-lg bg-purple-50 border-purple-200 hover:bg-purple-100"
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
                          
                          {/* Main content */}
                          <div className="relative p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="text-2xl">{icon}</div>
                                <div>
                                  <div className="font-semibold text-gray-700 text-sm capitalize">
                                    {behavior.replace('_', ' ')}
                                  </div>
                                  <div className={`text-lg font-bold bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent flex items-center gap-1`}>
                                    {data.count}
                                    <span className="text-sm text-gray-500">osservazioni</span>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {data.lastSeen}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Action buttons */}
                              <div className="flex gap-1">
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditItem('behaviors', behavior);
                                  }}
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-purple-500 hover:text-purple-600 hover:bg-purple-50"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteItem('behaviors', behavior, `${behavior.replace('_', ' ')} (${data.count})`);
                                  }}
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500/20 to-violet-500/10 flex items-center justify-center">
                    <Brain className="h-10 w-10 text-purple-500/60" />
                  </div>
                  <p className="text-lg text-muted-foreground mb-6">Nessun comportamento registrato</p>
                  <Button 
                    onClick={() => setDiaryModal({ open: true, mode: 'add', entry: null })}
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
                  Farmaci
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
              {medications.length > 0 ? (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3 pr-4">
                     {medications.map((medication) => {
                     const isExpired = medication.end_date && new Date(medication.end_date) < new Date();
                     
                     return (
                       <div key={medication.id} className="group">
                         <div className={`bg-white/60 border ${isExpired ? 'border-red-200/50 hover:border-red-300' : 'border-green-200/50 hover:border-green-300'} hover:bg-white/80 transition-all duration-200 rounded-xl p-4`}>
                           <div className="flex items-center justify-between">
                             <div className="flex-1">
                               <div className="flex items-center gap-3 mb-2">
                                 <div className="flex items-center gap-2">
                                   <div className={`h-3 w-3 rounded-full ${isExpired ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                   <h4 className={`font-semibold text-lg ${isExpired ? 'text-red-800' : 'text-green-800'}`}>
                                     {medication.medication_name}
                                   </h4>
                                 </div>
                                 <Badge variant="outline" className={`text-xs ${isExpired ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                                   {isExpired ? 'Inattivo' : 'Attivo'}
                                 </Badge>
                               </div>
                               
                               <div className="grid grid-cols-2 gap-4 mb-2">
                                 <div>
                                   <div className="text-sm text-muted-foreground">Dosaggio</div>
                                   <div className={`font-medium ${isExpired ? 'text-red-700' : 'text-green-700'}`}>{medication.dosage}</div>
                                 </div>
                                 <div>
                                   <div className="text-sm text-muted-foreground">Frequenza</div>
                                   <div className={`font-medium ${isExpired ? 'text-red-700' : 'text-green-700'}`}>{medication.frequency}</div>
                                 </div>
                               </div>
                               
                               <div>
                                 <div className="text-sm text-muted-foreground">
                                   Dal {format(new Date(medication.start_date), 'dd/MM/yyyy')}
                                   {medication.end_date && ` - Al ${format(new Date(medication.end_date), 'dd/MM/yyyy')}`}
                                 </div>
                               </div>
                             </div>
                             
                             {/* Action buttons */}
                             <div className="flex gap-1">
                               <Button
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleEditItem('medications', medication.id);
                                 }}
                                 size="sm"
                                 variant="ghost"
                                 className={`h-8 w-8 p-0 ${isExpired ? 'text-red-500 hover:text-red-600 hover:bg-red-50' : 'text-green-500 hover:text-green-600 hover:bg-green-50'}`}
                               >
                                 <Edit className="h-4 w-4" />
                               </Button>
                               <Button
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleDeleteItem('medications', medication.id, medication.medication_name);
                                 }}
                                 size="sm"
                                 variant="ghost"
                                 className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                               >
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                             </div>
                           </div>
                         </div>
                       </div>
                      );
                   })}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/10 flex items-center justify-center">
                    <Pill className="h-10 w-10 text-green-500/60" />
                  </div>
                  <p className="text-lg text-muted-foreground mb-6">Nessun farmaco registrato</p>
                  <Button 
                    onClick={() => handleAddItem('medications')}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Pill className="h-5 w-5 mr-2" />
                    Registra Farmaci
                  </Button>
                </div>
              )}
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
              {medicalEvents.length > 0 ? (
                <div className="space-y-4">
                   {medicalEvents.map((visit) => (
                     <div key={visit.id} className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border/50 hover:bg-accent/50 transition-colors">
                       <div className="flex items-center gap-3 flex-1">
                         <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                           <FileText className="h-4 w-4 text-blue-500" />
                         </div>
                         <div className="flex-1">
                           <h4 className="font-medium text-sm">{visit.title}</h4>
                           <p className="text-xs text-muted-foreground">
                             {format(new Date(visit.start_time), 'dd/MM/yyyy')}
                             {visit.location && ` • ${visit.location}`}
                           </p>
                         </div>
                       </div>
                       <div className="flex items-center gap-2">
                         <div className="text-xs text-muted-foreground mr-2">
                           {visit.status === 'completed' && '✓ Completata'}
                           {visit.status === 'scheduled' && '📅 Programmata'}
                           {visit.status === 'cancelled' && '❌ Annullata'}
                         </div>
                         <Button
                           size="sm"
                           variant="ghost"
                           onClick={() => handleEditMedicalEvent(visit)}
                           className="h-8 w-8 p-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                         >
                           <Edit className="h-4 w-4" />
                         </Button>
                         <Button
                           size="sm"
                           variant="ghost"
                           onClick={() => handleDeleteMedicalEvent(visit.id)}
                           className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </div>
                     </div>
                   ))}
                  <Button 
                    onClick={() => handleAddItem('visits')}
                    variant="outline"
                    className="w-full mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi Visita
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/10 flex items-center justify-center">
                    <FileText className="h-10 w-10 text-blue-500/60" />
                  </div>
                  <p className="text-lg text-muted-foreground mb-6">Nessuna visita registrata</p>
                  <Button 
                    onClick={() => handleAddItem('visits')}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Registra Visite
                  </Button>
                </div>
              )}
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
                    'respirazione': 'atti/min',
                    'colore_gengive': ''
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
                  <SelectItem value="colore_gengive">👄 Colore Gengive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="value">
                {vitalModal.vitalType === 'colore_gengive' ? 'Colore' : 'Valore'}
              </Label>
              <div className="space-y-2">
                {vitalModal.vitalType === 'colore_gengive' ? (
                  <Select
                    value={vitalForm.value}
                    onValueChange={(value) => setVitalForm(prev => ({ ...prev, value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona colore gengive" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rosa">🟢 Rosa (Normale)</SelectItem>
                      <SelectItem value="pallide">⚪ Pallide</SelectItem>
                      <SelectItem value="blu/viola">🔵 Blu/Viola</SelectItem>
                      <SelectItem value="gialle">🟡 Gialle</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="value"
                    type="number"
                    step="0.1"
                    value={vitalForm.value}
                    onChange={(e) => setVitalForm(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="Inserisci valore"
      />

                )}
                {vitalForm.value && vitalModal.vitalType && (() => {
                  const checkValue = vitalModal.vitalType === 'colore_gengive' ? vitalForm.value : parseFloat(vitalForm.value);
                  if ((typeof checkValue === 'number' && !isNaN(checkValue)) || typeof checkValue === 'string') {
                    const rangeCheck = isVitalInNormalRange(vitalModal.vitalType, checkValue, selectedPet?.type);
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
                placeholder={vitalModal.vitalType === 'colore_gengive' ? 'Nessuna unità' : 'Unità automatica'}
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

      {/* Diary Entry Form Modal */}
      <DiaryEntryForm
        isOpen={diaryModal.open}
        onClose={handleDiaryClose}
        entry={diaryModal.entry}
        onSave={handleDiarySave}
        petId={selectedPet?.id || ''}
        userId={user?.id || ''}
      />

      {/* Medication Modal */}
      <MedicationModal
        isOpen={medicationModal.open}
        onClose={() => setMedicationModal(prev => ({ ...prev, open: false }))}
        medication={medicationModal.medication}
        petId={selectedPet?.id || ''}
        userId={user?.id || ''}
        onSave={() => {
          // Reload medications when saved
          if (selectedPet && user) {
            const loadMeds = async () => {
              const { data } = await supabase
                .from('pet_medications')
                .select('*')
                .eq('pet_id', selectedPet.id)
                .eq('user_id', user.id)
                .eq('is_active', true);
              
              setMedications(data || []);
            };
            loadMeds();
          }
        }}
      />

      {/* Medication Evaluation Modal - Non-closable */}
      <Dialog open={medicationEvaluationModal.open} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              Valutazione Farmaco
            </DialogTitle>
            <DialogDescription className="text-center">
              Il farmaco <strong>{medicationEvaluationModal.medication?.medication_name}</strong> è terminato.
              <br />
              Per continuare ad utilizzare la piattaforma, rispondi alla seguente domanda:
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center py-6">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <Pill className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Il farmaco ha funzionato?</h3>
              <p className="text-sm text-muted-foreground">
                La tua risposta ci aiuterà a monitorare meglio la salute del tuo pet
              </p>
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => handleMedicationEvaluation(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
              >
                ✓ Sì, ha funzionato
              </Button>
              <Button
                onClick={() => handleMedicationEvaluation(false)}
                variant="destructive"
                className="px-8 py-3"
              >
                ✗ No, non ha funzionato
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

      {/* Event Form Modal */}
      <EventForm
        isOpen={eventModal.open}
        onClose={() => setEventModal({ open: false, mode: 'add', event: null, preselectedCategory: undefined })}
        event={eventModal.event}
        onSave={handleEventSave}
        petId={selectedPet?.id || ''}
        userId={user?.id || ''}
        preselectedCategory={eventModal.preselectedCategory}
      />
    </div>
  );
};

export default DashboardPage;