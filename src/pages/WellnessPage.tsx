import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

import {
  Heart, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Calendar, 
  Phone, 
  Mail,
  MapPin,
  Shield,
  FileText,
  Upload,
  Plus,
  Search,
  AlertTriangle,
  Clock,
  Pill,
  Scale,
  Thermometer,
  Brain,
  Eye,
  Share,
  Download,
  PhoneCall,
  MessageSquare,
  Stethoscope,
  Siren,
  User,
  Paperclip,
  CreditCard,
  FileImage,
  ChevronRight,
  Trash2,
  Edit,
  Star,
  Target,
  Zap,
  Gauge,
  Music,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  BarChart2,
  BookOpen
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { usePets } from '@/contexts/PetContext';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, subMonths, subDays, isAfter, isBefore, differenceInDays, startOfDay, endOfDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { FirstAidGuide } from '@/components/FirstAidGuide';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DiaryEntryForm } from '@/components/diary/DiaryEntryForm';
import { MultiFileUploader } from '@/components/MultiFileUploader';
import jsPDF from 'jspdf';
import { useNotifications } from '@/hooks/useNotifications';
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent 
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip
} from 'recharts';
import { calculateUnifiedHealthScore } from '@/utils/healthScoreCalculator';

interface HealthMetric {
  id: string;
  metric_type: string;
  value: number;
  unit: string;
  recorded_at: string;
  notes?: string;
}

interface MedicalRecord {
  id: string;
  title: string;
  description?: string;
  record_type: string;
  record_date: string;
  document_url?: string;
  cost?: number;
  notes?: string;
  veterinarian?: {
    name: string;
    clinic_name?: string;
  };
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  notes?: string;
}

interface Veterinarian {
  id: string;
  name: string;
  clinic_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  specialization?: string;
  is_primary: boolean;
}

interface EmergencyContact {
  id: string;
  name: string;
  contact_type: string;
  phone: string;
  relationship?: string;
  email?: string;
  notes?: string;
  is_primary?: boolean;
}

interface Insurance {
  id: string;
  provider_name: string;
  policy_number: string;
  policy_type?: string;
  start_date: string;
  end_date?: string;
  premium_amount?: number;
  deductible?: number;
  is_active: boolean;
}

interface DiaryEntry {
  id: string;
  entry_date: string;
  behavioral_tags?: string[];
  mood_score?: number;
}

interface EmotionCount {
  [emotion: string]: number;
}

// Helper function to translate metric types to Italian
const translateMetricType = (type: string): string => {
  const translations: Record<string, string> = {
    'temperature': 'Temperatura Corporea',
    'heart_rate': 'Frequenza Cardiaca', 
    'respiration': 'Respirazione',
    'gum_color': 'Colore Gengive',
    'checkup': 'Controllo',
    'blood_pressure': 'Pressione Sanguigna',
    'respiratory_rate': 'Frequenza Respiratoria',
    'weight': 'Peso'
  };
  return translations[type] || type;
};

// Helper function to get unit for metric type
const getMetricUnit = (metricType: string): string => {
  const units: Record<string, string> = {
    'temperature': '°C',
    'heart_rate': 'bpm',
    'respiration': 'rpm',
    'weight': 'kg',
    'blood_pressure': 'mmHg',
    'respiratory_rate': 'rpm'
  };
  return units[metricType] || '';
};

// Helper function to check if metric requires dropdown
const isDropdownMetric = (metricType: string): boolean => {
  return metricType === 'gum_color';
};

// Gum color options
const GUM_COLOR_OPTIONS = [
  { value: '1', label: 'Rosa' },
  { value: '2', label: 'Pallide' },
  { value: '3', label: 'Blu/Viola' },
  { value: '4', label: 'Gialle' }
];

// Colors for emotion charts
const EMOTION_COLORS = {
  'felice': '#22c55e',
  'triste': '#3b82f6', 
  'ansioso': '#f59e0b',
  'calmo': '#06b6d4',
  'agitato': '#ef4444',
  'giocoso': '#8b5cf6',
  'spaventato': '#6b7280',
  'aggressivo': '#dc2626',
  'curioso': '#10b981',
  'affettuoso': '#ec4899'
};

// Helper function to evaluate vital parameters using First Aid Guide ranges
const evaluateVitalParameter = (metricType: string, value: number, petType?: string): { 
  status: 'normal' | 'warning' | 'critical', 
  message: string,
  recommendation?: string 
} => {
  switch (metricType) {
    case 'temperature':
      // First Aid Guide ranges: Dogs 38.0-39.2°C, Cats 38.1-39.2°C
      const minTemp = petType?.toLowerCase() === 'cat' ? 38.1 : 38.0;
      const maxTemp = 39.2;
      
      if (value < 37.0 || value > 40.5) {
        return {
          status: 'critical',
          message: `⚠️ TEMPERATURA CRITICA: ${value}°C`,
          recommendation: 'EMERGENZA VETERINARIA IMMEDIATA - Possibile ipotermia/ipertermia'
        };
      }
      if (value < minTemp || value > maxTemp) {
        return {
          status: 'warning',
          message: `⚠️ Temperatura anomala: ${value}°C`,
          recommendation: 'Monitora attentamente e contatta il veterinario se persiste'
        };
      }
      return { status: 'normal', message: `✅ Temperatura normale: ${value}°C` };

    case 'heart_rate':
      // First Aid Guide ranges: Large dogs 60-100, Small dogs 100-140, Cats 140-220
      let minHeart, maxHeart;
      if (petType?.toLowerCase() === 'cat') {
        minHeart = 140;
        maxHeart = 220;
      } else {
        // Default to small dog range if size unknown
        minHeart = 60;
        maxHeart = 140;
      }
      
      if (value < 40 || value > 250) {
        return {
          status: 'critical',
          message: `⚠️ BATTITO CRITICO: ${value} bpm`,
          recommendation: 'EMERGENZA VETERINARIA - Possibile aritmia grave'
        };
      }
      if (value < minHeart || value > maxHeart) {
        return {
          status: 'warning',
          message: `⚠️ Battito anomalo: ${value} bpm`,
          recommendation: 'Consulta il veterinario per valutazione cardiaca'
        };
      }
      return { status: 'normal', message: `✅ Battito normale: ${value} bpm` };

    case 'respiration':
      // First Aid Guide ranges: Dogs 10-30, Cats 20-30 atti/min
      const minResp = petType?.toLowerCase() === 'cat' ? 20 : 10;
      const maxResp = 30;
      
      if (value < 5 || value > 60) {
        return {
          status: 'critical',
          message: `⚠️ RESPIRAZIONE CRITICA: ${value} atti/min`,
          recommendation: 'EMERGENZA - Possibile distress respiratorio'
        };
      }
      if (value < minResp || value > maxResp) {
        return {
          status: 'warning',
          message: `⚠️ Respirazione anomala: ${value} atti/min`,
          recommendation: 'Monitora e consulta veterinario se persiste'
        };
      }
      return { status: 'normal', message: `✅ Respirazione normale: ${value} atti/min` };

    case 'gum_color':
      // First Aid Guide: Rosa=normal, others=warning/critical
      const colorValue = typeof value === 'number' ? value : parseInt(String(value));
      switch (colorValue) {
        case 1: // Rosa
          return { status: 'normal', message: '✅ Gengive rosa (normale)' };
        case 2: // Pallide
          return {
            status: 'critical',
            message: '⚠️ GENGIVE PALLIDE',
            recommendation: 'EMERGENZA - Possibile shock o anemia'
          };
        case 3: // Blu/Viola
          return {
            status: 'critical',
            message: '⚠️ GENGIVE BLU/VIOLA',
            recommendation: 'EMERGENZA OSSIGENO - Mancanza di ossigenazione'
          };
        case 4: // Gialle
          return {
            status: 'critical',
            message: '⚠️ GENGIVE GIALLE',
            recommendation: 'URGENTE - Possibili problemi epatici'
          };
        default:
          return { status: 'warning', message: 'Colore gengive non riconosciuto' };
      }

    default:
      return { status: 'normal', message: `${translateMetricType(metricType)}: ${value}` };
  }
};

// Helper function to convert gum color numeric values to text
const getGumColorText = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseInt(value) : value;
  const colorMap: Record<number, string> = {
    1: 'Rosa',
    2: 'Pallide', 
    3: 'Blu/Viola',
    4: 'Gialle'
  };
  return colorMap[numValue] || 'Sconosciuto';
};

// Helper function to translate record types to Italian
const translateRecordType = (type: string): string => {
  const translations: Record<string, string> = {
    'visit': 'Visita',
    'exam': 'Esame', 
    'vaccination': 'Vaccino',
    'surgery': 'Operazione',
    'document': 'Documento',
    'treatment': 'Trattamento',
    'lab_work': 'Analisi',
    'emergency': 'Emergenza',
    'medication': 'Farmaco',
    'other': 'Altro'
  };
  return translations[type] || type;
};

// Unified Health Score Component
const UnifiedHealthScore = ({ selectedPet, user, addNotification }: {
  selectedPet: any;
  user: any;
  addNotification: (notification: any) => void;
}) => {
  const [healthScore, setHealthScore] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);
  
  React.useEffect(() => {
    const fetchHealthScore = async () => {
      if (!user || !selectedPet) return;
      
      setLoading(true);
      try {
        const result = await calculateUnifiedHealthScore(selectedPet.id, user.id, {
          healthMetrics: [],
          medicalRecords: [],
          medications: [],
          analyses: [],
          diaryEntries: [],
          wellnessScores: []
        });
        setHealthScore(result.overallScore);
        
        // Add notification if score is low
        if (result.overallScore < 50) {
          addNotification({
            title: 'Punteggio wellness basso',
            message: `Il punteggio di benessere di ${selectedPet.name} è di ${result.overallScore}/100.`,
            type: 'warning',
            read: false,
            action_url: '/wellness'
          });
        }
      } catch (error) {
        console.error('Error calculating health score:', error);
        setHealthScore(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHealthScore();
  }, [selectedPet, user]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Punteggio Generale</span>
        <span className="text-lg text-muted-foreground">Caricamento...</span>
      </div>
    );
  }
  
  const getScoreMessage = (score: number | null) => {
    if (score === null || score === 0) return "Inizia ad aggiungere più dati sulla salute";
    if (score < 30) return "Necessita attenzione";
    if (score < 70) return "Dati insufficienti";
    return "Ottima salute";
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Punteggio Generale</span>
        {healthScore !== null && healthScore > 0 ? (
          <span className="text-2xl font-bold text-primary">{healthScore}/100</span>
        ) : (
          <span className="text-lg text-muted-foreground">Non disponibile</span>
        )}
      </div>
      {healthScore !== null && healthScore > 0 ? (
        <Progress value={healthScore} className="h-3" />
      ) : (
        <div className="h-3 bg-muted rounded-full">
          <div className="h-full bg-muted-foreground/20 rounded-full"></div>
        </div>
      )}
      <div className="text-sm text-center p-2 bg-muted/50 rounded-lg">
        <span className="font-medium">{getScoreMessage(healthScore)}</span>
      </div>
    </div>
  );
};

const WellnessPage = () => {
  const { user } = useAuth();
  const { pets } = usePets();
  const { addNotification } = useNotifications();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data states
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [petAnalyses, setPetAnalyses] = useState<any[]>([]);
  const [emotionCounts, setEmotionCounts] = useState<EmotionCount>({});
  
  // Form states
  const [showAddMetric, setShowAddMetric] = useState(false);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showAddVet, setShowAddVet] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddInsurance, setShowAddInsurance] = useState(false);
  const [showFirstAidGuide, setShowFirstAidGuide] = useState(false);
  const [showNearbyVets, setShowNearbyVets] = useState(false);
  const [nearbyVets, setNearbyVets] = useState<any[]>([]);
  const [loadingNearbyVets, setLoadingNearbyVets] = useState(false);
  
  // Edit states
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [editingVet, setEditingVet] = useState<Veterinarian | null>(null);
  const [editingMetric, setEditingMetric] = useState<HealthMetric | null>(null);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [showDiaryDialog, setShowDiaryDialog] = useState(false);
  
  // Form data states
  const [newMetric, setNewMetric] = useState({ metric_type: '', value: '', unit: '', notes: '' });
  const [newDocument, setNewDocument] = useState({ title: '', description: '', record_type: '', record_date: '', cost: '', notes: '', document_urls: [] as string[] });
  const [newMedication, setNewMedication] = useState({ name: '', dosage: '', frequency: '', start_date: '', end_date: '', notes: '' });
  const [newVet, setNewVet] = useState({ name: '', clinic_name: '', phone: '', email: '', address: '', specialization: '', is_primary: false });
  const [newContact, setNewContact] = useState({ name: '', contact_type: '', phone: '', relationship: '', email: '', notes: '' });
  const [newInsurance, setNewInsurance] = useState({ provider_name: '', policy_number: '', policy_type: '', start_date: '', end_date: '', premium_amount: '', deductible: '', document_urls: [] as string[] });
  
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', onConfirm: () => {} });
  const [selectedPeriod, setSelectedPeriod] = useState('month'); // Default to month
  
  // Get selected pet from URL or default to first pet
  const selectedPetId = searchParams.get('pet') || pets[0]?.id;
  const selectedPet = pets.find(p => p.id === selectedPetId) || pets[0];
  
  // Calculate derived data
  const behavioralTags = useMemo(() => {
    return diaryEntries
      .filter(entry => entry.behavioral_tags && entry.behavioral_tags.length > 0)
      .flatMap(entry => entry.behavioral_tags || []);
  }, [diaryEntries]);
  
  const behavioralTagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    behavioralTags.forEach(tag => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
    return counts;
  }, [behavioralTags]);
  
  const moodTrend = useMemo(() => {
    const recentEntries = diaryEntries
      .filter(entry => entry.mood_score && isAfter(new Date(entry.entry_date), subDays(new Date(), 14)))
      .sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime());
    
    if (recentEntries.length < 2) return null;
    
    const first = recentEntries[0].mood_score!;
    const last = recentEntries[recentEntries.length - 1].mood_score!;
    const diff = last - first;
    
    return {
      trend: diff > 1 ? 'up' : diff < -1 ? 'down' : 'stable',
      change: Math.abs(diff)
    };
  }, [diaryEntries]);

  // Calculate wellness trend data from real health metrics and diary entries
  const wellnessTrendData = useMemo(() => {
    if (!petAnalyses || !healthMetrics || !diaryEntries || !medications) return [];
    
    const now = new Date();
    let periods: Array<{ start: Date; end: Date; label: string }> = [];

    // Define periods based on selected filter
    switch (selectedPeriod) {
      case 'day':
        // Last 7 days
        periods = Array.from({ length: 7 }, (_, i) => {
          const date = subDays(now, 6 - i);
          return {
            start: startOfDay(date),
            end: endOfDay(date),
            label: format(date, 'dd/MM', { locale: it })
          };
        });
        break;
      
      case 'week':
        // Last 8 weeks
        periods = Array.from({ length: 8 }, (_, i) => {
          const weekStart = subDays(now, (7 - i) * 7);
          const weekEnd = subDays(weekStart, -6);
          return {
            start: startOfDay(weekStart),
            end: endOfDay(weekEnd),
            label: `${format(weekStart, 'dd', { locale: it })}-${format(weekEnd, 'dd MMM', { locale: it })}`
          };
        });
        break;
      
      case 'month':
        // Last 6 months (default)
        periods = Array.from({ length: 6 }, (_, i) => {
          const date = subMonths(now, 5 - i);
          return {
            start: startOfMonth(date),
            end: endOfMonth(date),
            label: format(date, 'MMM', { locale: it })
          };
        });
        break;
      
      case 'year':
        // Last 3 years
        periods = Array.from({ length: 3 }, (_, i) => {
          const year = now.getFullYear() - (2 - i);
          return {
            start: new Date(year, 0, 1),
            end: new Date(year, 11, 31),
            label: year.toString()
          };
        });
        break;
      
      case 'all':
        // All time - group by months, but show more data points
        const firstEntry = [...healthMetrics, ...diaryEntries]
          .map(item => new Date('recorded_at' in item ? item.recorded_at : item.entry_date))
          .sort((a, b) => a.getTime() - b.getTime())[0];
        
        if (firstEntry) {
          const monthsDiff = differenceInDays(now, firstEntry) / 30;
          const numPeriods = Math.min(Math.max(Math.ceil(monthsDiff), 6), 24); // Between 6 and 24 months
          
          periods = Array.from({ length: numPeriods }, (_, i) => {
            const date = subMonths(now, numPeriods - 1 - i);
            return {
              start: startOfMonth(date),
              end: endOfMonth(date),
              label: format(date, 'MMM yy', { locale: it })
            };
          });
        } else {
          // Fallback to 6 months if no data
          periods = Array.from({ length: 6 }, (_, i) => {
            const date = subMonths(now, 5 - i);
            return {
              start: startOfMonth(date),
              end: endOfMonth(date),
              label: format(date, 'MMM', { locale: it })
            };
          });
        }
        break;
    }

    // Calculate wellness score for each period
    return periods.map(period => {
      // Get metrics for this period
      const periodMetrics = healthMetrics.filter(metric => {
        const metricDate = new Date(metric.recorded_at);
        return isAfter(metricDate, period.start) && isBefore(metricDate, period.end);
      });
      
      // Get diary entries for this period
      const periodDiary = diaryEntries.filter(entry => {
        const entryDate = new Date(entry.entry_date);
        return isAfter(entryDate, period.start) && isBefore(entryDate, period.end);
      });
      
      // Get behavior analyses for this period
      const periodAnalyses = petAnalyses.filter(analysis => {
        const analysisDate = new Date(analysis.created_at);
        return isAfter(analysisDate, period.start) && isBefore(analysisDate, period.end);
      });
      
      // Get medications for this period (active or ending)
      const periodMedications = medications.filter(med => {
        const startDate = new Date(med.start_date);
        const endDate = med.end_date ? new Date(med.end_date) : new Date();
        return (isAfter(startDate, period.start) && isBefore(startDate, period.end)) ||
               (med.end_date && isAfter(endDate, period.start) && isBefore(endDate, period.end)) ||
               (isAfter(period.start, startDate) && isBefore(period.start, endDate));
      });
      
      // Calculate wellness score for this period
      let score = 50; // base score
      
      // Factor in mood scores from diary
      const moodScores = periodDiary.map(entry => entry.mood_score).filter(Boolean);
      if (moodScores.length > 0) {
        const avgMood = moodScores.reduce((a, b) => a + b, 0) / moodScores.length;
        score += (avgMood - 5) * 10; // scale from 1-10 to impact score
      }
      
      // Factor in behavior analyses
      if (periodAnalyses.length > 0) {
        const emotionScores = periodAnalyses.map(analysis => {
          const emotion = analysis.primary_emotion.toLowerCase();
          const confidence = analysis.primary_confidence || 0.5;
          
          // Positive emotions boost score
          if (['felice', 'giocoso', 'calmo', 'affettuoso', 'energico'].includes(emotion)) {
            return 15 * confidence; // Up to +15 points
          }
          // Negative emotions reduce score
          if (['ansioso', 'triste', 'aggressivo', 'spaventato', 'depresso'].includes(emotion)) {
            return -20 * confidence; // Up to -20 points
          }
          // Neutral emotions slight positive
          return 5 * confidence;
        });
        
        const avgEmotionScore = emotionScores.reduce((a, b) => a + b, 0) / emotionScores.length;
        score += avgEmotionScore;
      }
      
      // Factor in medications
      if (periodMedications.length > 0) {
        periodMedications.forEach(med => {
          const startDate = new Date(med.start_date);
          const endDate = med.end_date ? new Date(med.end_date) : null;
          
          // If medication started in this period - positive impact
          if (isAfter(startDate, period.start) && isBefore(startDate, period.end)) {
            score += 8; // Starting medication = positive
          }
          
          // If medication ended in this period - slight negative impact  
          if (endDate && isAfter(endDate, period.start) && isBefore(endDate, period.end)) {
            score -= 5; // Ending medication = slight concern
          }
          
          // If medication is active throughout period - positive maintenance
          if (isBefore(startDate, period.start) && (!endDate || isAfter(endDate, period.end))) {
            score += 3; // Ongoing treatment = stability
          }
        });
      }
      
      // Factor in vital signs with critical status evaluation
      const tempMetrics = periodMetrics.filter(m => m.metric_type === 'temperature');
      const heartMetrics = periodMetrics.filter(m => m.metric_type === 'heart_rate');
      const respMetrics = periodMetrics.filter(m => m.metric_type === 'respiration');
      const gumMetrics = periodMetrics.filter(m => m.metric_type === 'gum_color');
      
      if (tempMetrics.length > 0) {
        const avgTemp = tempMetrics.reduce((a, b) => a + parseFloat(b.value.toString()), 0) / tempMetrics.length;
        const tempEval = evaluateVitalParameter('temperature', avgTemp, selectedPet?.type);
        if (tempEval.status === 'critical') score -= 25;
        else if (tempEval.status === 'warning') score -= 10;
        else score += 5;
      }
      
      if (heartMetrics.length > 0) {
        const avgHeart = heartMetrics.reduce((a, b) => a + parseFloat(b.value.toString()), 0) / heartMetrics.length;
        const heartEval = evaluateVitalParameter('heart_rate', avgHeart, selectedPet?.type);
        if (heartEval.status === 'critical') score -= 25;
        else if (heartEval.status === 'warning') score -= 10;
        else score += 5;
      }
      
      if (respMetrics.length > 0) {
        const avgResp = respMetrics.reduce((a, b) => a + parseFloat(b.value.toString()), 0) / respMetrics.length;
        const respEval = evaluateVitalParameter('respiration', avgResp, selectedPet?.type);
        if (respEval.status === 'critical') score -= 25;
        else if (respEval.status === 'warning') score -= 10;
        else score += 5;
      }
      
      if (gumMetrics.length > 0) {
        // For gum color, take the most recent reading
        const latestGum = gumMetrics[gumMetrics.length - 1];
        const gumEval = evaluateVitalParameter('gum_color', parseFloat(latestGum.value.toString()), selectedPet?.type);
        if (gumEval.status === 'critical') score -= 30; // Gum color is very important indicator
        else if (gumEval.status === 'warning') score -= 15;
        else score += 5;
      }
      
      // Ensure score is between 0-100
      score = Math.max(0, Math.min(100, score));
      
      return {
        date: period.label,
        wellness: Math.round(score)
      };
    });
  }, [healthMetrics, diaryEntries, petAnalyses, medications, selectedPeriod, selectedPet?.type]);

  // Auto-detect unit when metric type changes
  const handleMetricTypeChange = (metricType: string) => {
    const unit = getMetricUnit(metricType);
    setNewMetric(prev => ({ 
      ...prev, 
      metric_type: metricType, 
      unit,
      value: '' // Reset value when changing type
    }));
  };

  // Fetch all health data
  const fetchHealthData = useCallback(async () => {
    if (!user?.id || !selectedPet?.id) return;
    
    console.log('Fetching health data for user:', user.id, 'pet:', selectedPet.id);
    try {
      // Fetch health metrics
      const { data: metrics } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', user.id)
        .eq('pet_id', selectedPet.id)
        .order('recorded_at', { ascending: false });
      
      // Fetch medical records
      const { data: records } = await supabase
        .from('medical_records')
        .select('*')
        .eq('user_id', user.id)
        .eq('pet_id', selectedPet.id)
        .order('record_date', { ascending: false });
      
      console.log('Fetched medical records:', records?.length || 0, records);
      
      // Fetch medications and check for expired ones
      const { data: meds } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id)
        .eq('pet_id', selectedPet.id)
        .order('created_at', { ascending: false });

      // Auto-deactivate expired medications
      if (meds) {
        const today = new Date();
        const expiredMeds = meds.filter(med => 
          med.is_active && 
          med.end_date && 
          new Date(med.end_date) < today
        );

        if (expiredMeds.length > 0) {
          await supabase
            .from('medications')
            .update({ is_active: false })
            .in('id', expiredMeds.map(med => med.id));
        }
      }
      
      // Fetch veterinarians
      const { data: vets } = await supabase
        .from('veterinarians')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false });
      
      // Fetch emergency contacts
      const { data: contacts } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      // Fetch insurance
      const { data: insurance } = await supabase
        .from('pet_insurance')
        .select('*')
        .eq('user_id', user.id)
        .eq('pet_id', selectedPet.id)
        .order('created_at', { ascending: false });
      
      // Fetch diary entries
      const { data: diary } = await supabase
        .from('diary_entries')
        .select('id, entry_date, behavioral_tags, mood_score')
        .eq('user_id', user.id)
        .eq('pet_id', selectedPet.id)
        .order('entry_date', { ascending: false });
      
      // Get all pet analyses for wellness calculation
      const { data: analyses } = await supabase
        .from('pet_analyses')
        .select('primary_emotion, primary_confidence, created_at')
        .eq('user_id', user.id)
        .eq('pet_id', selectedPet.id)
        .order('created_at', { ascending: false});
      
      // Calculate emotion counts
      const emotions: EmotionCount = {};
      analyses?.forEach(analysis => {
        if (analysis.primary_emotion) {
          emotions[analysis.primary_emotion] = (emotions[analysis.primary_emotion] || 0) + 1;
        }
      });
      
      setPetAnalyses(analyses || []);
      setHealthMetrics(metrics || []);
      setMedicalRecords(records || []);
      setMedications(meds || []);
      setVeterinarians(vets || []);
      setEmergencyContacts(contacts || []);
      setInsurances(insurance || []);
      setDiaryEntries(diary || []);
      setEmotionCounts(emotions);
      
    } catch (error) {
      console.error('Error fetching health data:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i dati sulla salute",
        variant: "destructive"
      });
    }
  }, [user?.id, selectedPet?.id]); // Rimuovo toast dalle dipendenze per evitare loop infinito

  useEffect(() => {
    fetchHealthData();
  }, [fetchHealthData]); // Ora usa fetchHealthData invece delle singole dipendenze

  // Handle adding/editing metric
  const handleAddMetric = async () => {
    if (!user || !selectedPet || !newMetric.metric_type || !newMetric.value) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingMetric && editingMetric.id && !editingMetric.id.startsWith('temp_')) {
        // Update existing metric
        const { error } = await supabase
          .from('health_metrics')
          .update({
            metric_type: newMetric.metric_type,
            value: parseFloat(newMetric.value),
            unit: newMetric.unit,
            notes: newMetric.notes || null,
            recorded_at: new Date().toISOString()
          })
          .eq('id', editingMetric.id);

        if (error) throw error;

        toast({
          title: "Successo",
          description: "Metrica aggiornata con successo"
        });
      } else {
        // Create new metric
        const { error } = await supabase
          .from('health_metrics')
          .insert({
            user_id: user.id,
            pet_id: selectedPet.id,
            metric_type: newMetric.metric_type,
            value: parseFloat(newMetric.value),
            unit: newMetric.unit,
            notes: newMetric.notes || null,
            recorded_at: new Date().toISOString()
          });

        if (error) throw error;

        toast({
          title: "Successo",
          description: "Metrica aggiunta con successo"
        });
      }

      setNewMetric({ metric_type: '', value: '', unit: '', notes: '' });
      setShowAddMetric(false);
      setEditingMetric(null);
      // Update local state instead of refetching
      if (editingMetric && editingMetric.id && !editingMetric.id.startsWith('temp_')) {
        setHealthMetrics(prev => prev.map(metric => 
          metric.id === editingMetric.id 
            ? { ...metric, metric_type: newMetric.metric_type, value: parseFloat(newMetric.value), unit: newMetric.unit, notes: newMetric.notes }
            : metric
        ));
      } else {
        // Add new metric to local state
        const newMetricData = {
          id: `temp_${Date.now()}`, // Temporary ID with prefix
          metric_type: newMetric.metric_type,
          value: parseFloat(newMetric.value),
          unit: newMetric.unit,
          notes: newMetric.notes || null,
          recorded_at: new Date().toISOString(),
          user_id: user.id,
          pet_id: selectedPet.id
        };
        setHealthMetrics(prev => [newMetricData, ...prev]);
      }
    } catch (error) {
      console.error('Error saving metric:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare la metrica",
        variant: "destructive"
      });
    }
  };

  // Handle adding/editing emergency contact
  const handleAddContact = async () => {
    if (!user || !newContact.name || !newContact.phone) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingContact && editingContact.id && !editingContact.id.startsWith('temp_')) {
        // Update existing contact
        const { error } = await supabase
          .from('emergency_contacts')
          .update({
            name: newContact.name,
            contact_type: newContact.contact_type || 'other',
            phone: newContact.phone,
            relationship: newContact.relationship || null,
            email: newContact.email || null,
            notes: newContact.notes || null
          })
          .eq('id', editingContact.id);

        if (error) throw error;

        toast({
          title: "Successo",
          description: "Contatto emergenza aggiornato con successo"
        });
      } else {
        // Create new contact
        const { error } = await supabase
          .from('emergency_contacts')
          .insert({
            user_id: user.id,
            name: newContact.name,
            contact_type: newContact.contact_type || 'other',
            phone: newContact.phone,
            relationship: newContact.relationship || null,
            email: newContact.email || null,
            notes: newContact.notes || null
          });

        if (error) throw error;

        toast({
          title: "Successo",
          description: "Contatto emergenza aggiunto con successo"
        });
      }

      setNewContact({ name: '', contact_type: '', phone: '', relationship: '', email: '', notes: '' });
      setShowAddContact(false);
      setEditingContact(null);
      // Update local state instead of refetching
      if (editingContact) {
        setEmergencyContacts(prev => prev.map(contact => 
          contact.id === editingContact.id 
            ? { 
                ...contact, 
                name: newContact.name,
                contact_type: newContact.contact_type || 'other',
                phone: newContact.phone,
                relationship: newContact.relationship || null,
                email: newContact.email || null,
                notes: newContact.notes || null
              }
            : contact
        ));
      } else {
        // Add new emergency contact to local state
        const newContactData = {
          id: `temp_${Date.now()}`, // Temporary ID with prefix
          user_id: user.id,
          name: newContact.name,
          contact_type: newContact.contact_type || 'other',
          phone: newContact.phone,
          relationship: newContact.relationship || null,
          email: newContact.email || null,
          notes: newContact.notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setEmergencyContacts(prev => [newContactData, ...prev]);
      }
    } catch (error) {
      console.error('Error saving emergency contact:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare il contatto emergenza",
        variant: "destructive"
      });
    }
  };

  // Handle adding new insurance
  const handleAddInsurance = async () => {
    if (!user || !newInsurance.provider_name || !newInsurance.policy_number) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('pet_insurance')
        .insert({
          user_id: user.id,
          pet_id: selectedPet.id,
          provider_name: newInsurance.provider_name,
          policy_number: newInsurance.policy_number,
          policy_type: newInsurance.policy_type || null,
          start_date: newInsurance.start_date,
          end_date: newInsurance.end_date || null,
          premium_amount: newInsurance.premium_amount ? parseFloat(newInsurance.premium_amount) : null,
          deductible: newInsurance.deductible ? parseFloat(newInsurance.deductible) : null,
          is_active: true,
          document_urls: newInsurance.document_urls
        });

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Assicurazione aggiunta con successo"
      });

      setNewInsurance({ provider_name: '', policy_number: '', policy_type: '', start_date: '', end_date: '', premium_amount: '', deductible: '', document_urls: [] });
      setShowAddInsurance(false);
      // Add new insurance to local state
      const newInsuranceData = {
          id: `temp_${Date.now()}`, // Temporary ID with prefix
        user_id: user.id,
        pet_id: selectedPet.id,
        provider_name: newInsurance.provider_name,
        policy_number: newInsurance.policy_number,
        policy_type: newInsurance.policy_type || null,
        start_date: newInsurance.start_date,
        end_date: newInsurance.end_date || null,
        premium_amount: newInsurance.premium_amount ? parseFloat(newInsurance.premium_amount) : null,
        deductible: newInsurance.deductible ? parseFloat(newInsurance.deductible) : null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setInsurances(prev => [newInsuranceData, ...prev]);
    } catch (error) {
      console.error('Error adding insurance:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiungere l'assicurazione",
        variant: "destructive"
      });
    }
  };

  // Handle adding/editing veterinarian
  const handleAddVet = async () => {
    if (!user || !newVet.name || !newVet.phone) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingVet && editingVet.id && !editingVet.id.startsWith('temp_')) {
        // Update existing veterinarian
        const { error } = await supabase
          .from('veterinarians')
          .update({
            name: newVet.name,
            clinic_name: newVet.clinic_name || null,
            phone: newVet.phone,
            email: newVet.email || null,
            address: newVet.address || null,
            specialization: newVet.specialization || null,
            is_primary: newVet.is_primary
          })
          .eq('id', editingVet.id);

        if (error) throw error;

        toast({
          title: "Successo",
          description: "Veterinario aggiornato con successo"
        });
      } else {
        // Create new veterinarian
        const { error } = await supabase
          .from('veterinarians')
          .insert({
            user_id: user.id,
            name: newVet.name,
            clinic_name: newVet.clinic_name || null,
            phone: newVet.phone,
            email: newVet.email || null,
            address: newVet.address || null,
            specialization: newVet.specialization || null,
            is_primary: newVet.is_primary
          });

        if (error) throw error;

        toast({
          title: "Successo",
          description: "Veterinario aggiunto con successo"
        });
      }

      setNewVet({ name: '', clinic_name: '', phone: '', email: '', address: '', specialization: '', is_primary: false });
      setShowAddVet(false);
      setEditingVet(null);
      // Update local state instead of refetching
      if (editingVet) {
        setVeterinarians(prev => prev.map(vet => 
          vet.id === editingVet.id 
            ? { 
                ...vet, 
                name: newVet.name,
                clinic_name: newVet.clinic_name || null,
                phone: newVet.phone,
                email: newVet.email || null,
                address: newVet.address || null,
                specialization: newVet.specialization || null,
                is_primary: newVet.is_primary
              }
            : vet
        ));
      } else {
        // Add new veterinarian to local state
        const newVetData = {
        id: `temp_${Date.now()}`, // Temporary ID with prefix
          user_id: user.id,
          name: newVet.name,
          clinic_name: newVet.clinic_name || null,
          phone: newVet.phone,
          email: newVet.email || null,
          address: newVet.address || null,
          specialization: newVet.specialization || null,
          is_primary: newVet.is_primary,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setVeterinarians(prev => [newVetData, ...prev]);
      }
    } catch (error) {
      console.error('Error saving veterinarian:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare il veterinario",
        variant: "destructive"
      });
    }
  };

  // Handle adding/editing medical record
  const handleAddDocument = async () => {
    if (!user || !selectedPet || !newDocument.title || !newDocument.record_type || !newDocument.record_date) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingRecord && editingRecord.id && !editingRecord.id.startsWith('temp_')) {
        // Update existing record
        const { error } = await supabase
          .from('medical_records')
          .update({
            title: newDocument.title,
            description: newDocument.description || null,
            record_type: newDocument.record_type,
            record_date: newDocument.record_date,
            cost: newDocument.cost ? parseFloat(newDocument.cost) : null,
            notes: newDocument.notes || null,
            document_url: newDocument.document_urls.length > 0 ? newDocument.document_urls[0] : 'placeholder'
          })
          .eq('id', editingRecord.id);

        if (error) throw error;

        toast({
          title: "Successo",
          description: "Visita aggiornata con successo"
        });
      } else {
        // Create new record and get the returned data
        const { data, error } = await supabase
          .from('medical_records')
          .insert({
            user_id: user.id,
            pet_id: selectedPet.id,
            title: newDocument.title,
            description: newDocument.description || null,
            record_type: newDocument.record_type,
            record_date: newDocument.record_date,
            cost: newDocument.cost ? parseFloat(newDocument.cost) : null,
            notes: newDocument.notes || null,
            document_url: newDocument.document_urls.length > 0 ? newDocument.document_urls[0] : 'placeholder'
          })
          .select()
          .single();

        if (error) throw error;

        // Add the new record to the state directly
        setMedicalRecords(prev => [data, ...prev]);

        toast({
          title: "Successo", 
          description: "Visita aggiunta con successo"
        });
        
        setShowAddDocument(false);
        setNewDocument({ title: '', description: '', record_type: '', record_date: '', cost: '', notes: '', document_urls: [] });
        setEditingRecord(null);
      }
    } catch (error) {
      console.error('Error saving medical record:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare la visita",
        variant: "destructive"
      });
    }
  };

  // Handle adding/editing medication
  const handleAddMedication = async () => {
    if (!user || !selectedPet || !newMedication.name || !newMedication.dosage || !newMedication.frequency || !newMedication.start_date) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingMedication && editingMedication.id && !editingMedication.id.startsWith('temp_')) {
        // Update existing medication (only if it has a real UUID)
        const { error } = await supabase
          .from('medications')
          .update({
            name: newMedication.name,
            dosage: newMedication.dosage,
            frequency: newMedication.frequency,
            start_date: newMedication.start_date,
            end_date: newMedication.end_date || null,
            notes: newMedication.notes || null
          })
          .eq('id', editingMedication.id);

        if (error) throw error;

        toast({
          title: "Successo",
          description: "Farmaco aggiornato con successo"
        });
        
        // Update local state
        setMedications(prev => prev.map(med => 
          med.id === editingMedication.id 
            ? { 
                ...med, 
                name: newMedication.name,
                dosage: newMedication.dosage,
                frequency: newMedication.frequency,
                start_date: newMedication.start_date,
                end_date: newMedication.end_date || null,
                notes: newMedication.notes || null
              }
            : med
        ));
      } else {
        // Create new medication
        const { data, error } = await supabase
          .from('medications')
          .insert({
            user_id: user.id,
            pet_id: selectedPet.id,
            name: newMedication.name,
            dosage: newMedication.dosage,
            frequency: newMedication.frequency,
            start_date: newMedication.start_date,
            end_date: newMedication.end_date || null,
            is_active: true,
            notes: newMedication.notes || null
          })
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Successo",
          description: "Farmaco aggiunto con successo"
        });
        
        // If we were editing a temporary item, remove it and add the real one
        if (editingMedication && editingMedication.id.startsWith('temp_')) {
          setMedications(prev => {
            const filtered = prev.filter(med => med.id !== editingMedication.id);
            return [data, ...filtered];
          });
        } else {
          // Add new medication to local state with real ID
          setMedications(prev => [data, ...prev]);
        }
      }

      setNewMedication({ name: '', dosage: '', frequency: '', start_date: '', end_date: '', notes: '' });
      setShowAddMedication(false);
      setEditingMedication(null);
    } catch (error) {
      console.error('Error saving medication:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare il farmaco",
        variant: "destructive"
      });
    }
  };

  // Handle phone call
  const handlePhoneCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  // Find nearby veterinarians
  const findNearbyVets = async () => {
    setLoadingNearbyVets(true);
    try {
      // Get user's location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const { latitude, longitude } = position.coords;

      // Call our edge function
      const { data, error } = await supabase.functions.invoke('find-nearby-vets', {
        body: { latitude, longitude, radius: 5000 } // 5km radius
      });

      if (error) throw error;

      setNearbyVets(data.veterinarians || []);
      setShowNearbyVets(true);

    } catch (error: any) {
      console.error('Error finding nearby vets:', error);
      let errorMessage = 'Impossibile trovare veterinari nelle vicinanze';
      
      if (error.code === 1) { // PERMISSION_DENIED
        errorMessage = 'Permesso di geolocalizzazione negato. Abilita la geolocalizzazione per trovare veterinari vicini.';
      } else if (error.code === 2) { // POSITION_UNAVAILABLE
        errorMessage = 'Posizione non disponibile. Controlla la connessione GPS.';
      } else if (error.code === 3) { // TIMEOUT
        errorMessage = 'Timeout nella rilevazione della posizione. Riprova.';
      }
      
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoadingNearbyVets(false);
    }
  };

  // Handle delete with confirmation
  const handleDelete = (type: string, id: string, name: string) => {
    setConfirmDialog({
      open: true,
      title: `Elimina ${type}`,
      description: `Sei sicuro di voler eliminare "${name}"? Questa azione non può essere annullata.`,
      onConfirm: () => performDelete(type, id)
    });
  };

  // Perform actual deletion
  const performDelete = async (type: string, id: string) => {
    try {
      // Se è un ID temporaneo, elimina solo dallo stato locale
      if (id.startsWith('temp_')) {
        // Update local state immediately for temporary items
        switch (type) {
          case 'metrica':
            setHealthMetrics(prev => prev.filter(metric => metric.id !== id));
            break;
          case 'farmaco':
            setMedications(prev => prev.filter(med => med.id !== id));
            break;
          case 'visita':
            setMedicalRecords(prev => prev.filter(record => record.id !== id));
            break;
          case 'contatto':
            setEmergencyContacts(prev => prev.filter(contact => contact.id !== id));
            break;
          case 'veterinario':
            setVeterinarians(prev => prev.filter(vet => vet.id !== id));
            break;
          case 'assicurazione':
            setInsurances(prev => prev.filter(insurance => insurance.id !== id));
            break;
        }
        
        toast({
          title: "Successo",
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} eliminato con successo`
        });
        
        setConfirmDialog({ open: false, title: '', description: '', onConfirm: () => {} });
        return;
      }

      let tableName: 'health_metrics' | 'medications' | 'medical_records' | 'emergency_contacts' | 'veterinarians' | 'pet_insurance' = 'health_metrics';
      
      switch (type) {
        case 'metrica':
          tableName = 'health_metrics';
          break;
        case 'farmaco':
          tableName = 'medications';
          break;
        case 'visita':
          tableName = 'medical_records';
          break;
        case 'contatto':
          tableName = 'emergency_contacts';
          break;
        case 'veterinario':
          tableName = 'veterinarians';
          break;
        case 'assicurazione':
          tableName = 'pet_insurance';
          break;
        default:
          throw new Error('Tipo non supportato');
      }

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} eliminato con successo`
      });

      // Update local state instead of refetching
      switch (type) {
        case 'metrica':
          setHealthMetrics(prev => prev.filter(metric => metric.id !== id));
          break;
        case 'farmaco':
          setMedications(prev => prev.filter(med => med.id !== id));
          break;
        case 'visita':
          setMedicalRecords(prev => prev.filter(record => record.id !== id));
          break;
        case 'contatto':
          setEmergencyContacts(prev => prev.filter(contact => contact.id !== id));
          break;
        case 'veterinario':
          setVeterinarians(prev => prev.filter(vet => vet.id !== id));
          break;
        case 'assicurazione':
          setInsurances(prev => prev.filter(insurance => insurance.id !== id));
          break;
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast({
        title: "Errore",
        description: `Impossibile eliminare ${type}`,
        variant: "destructive"
      });
    } finally {
      setConfirmDialog({ open: false, title: '', description: '', onConfirm: () => {} });
    }
  };

  // Open diary dialog for new behavior entry
  const handleAddBehavior = () => {
    // Simple function to open diary dialog
    setShowDiaryDialog(true);
  };

  // Handle adding new diary entry
  const handleAddDiaryEntry = async (data: any) => {
    if (!user || !selectedPet) {
      toast({
        title: "Errore",
        description: "Dati utente o pet mancanti",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('diary_entries')
        .insert(data);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Voce del diario aggiunta con successo"
      });

      setShowDiaryDialog(false);
      // Update local state instead of refetching
      const newDiaryEntryData = {
        id: `temp_${Date.now()}`, // Temporary ID with prefix
        user_id: user.id,
        pet_id: selectedPet.id,
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setDiaryEntries(prev => [newDiaryEntryData, ...prev]);
    } catch (error) {
      console.error('Error adding diary entry:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiungere la voce del diario",
        variant: "destructive"
      });
    }
  };

  // Handle edit contact
  const handleEditContact = (contact: EmergencyContact) => {
    // Non permettere di modificare elementi temporanei
    if (contact.id.startsWith('temp_')) {
      toast({
        title: "Modifica non disponibile",
        description: "Gli elementi non ancora salvati possono solo essere eliminati. Salva prima l'elemento per poterlo modificare.",
        variant: "destructive"
      });
      return;
    }
    
    setEditingContact(contact);
    setNewContact({
      name: contact.name,
      contact_type: contact.contact_type,
      phone: contact.phone,
      relationship: contact.relationship || '',
      email: contact.email || '',
      notes: contact.notes || ''
    });
    setShowAddContact(true);
  };

  // Handle edit veterinarian
  const handleEditVet = (vet: Veterinarian) => {
    // Non permettere di modificare elementi temporanei
    if (vet.id.startsWith('temp_')) {
      toast({
        title: "Modifica non disponibile",
        description: "Gli elementi non ancora salvati possono solo essere eliminati. Salva prima l'elemento per poterlo modificare.",
        variant: "destructive"
      });
      return;
    }
    
    setEditingVet(vet);
    setNewVet({
      name: vet.name,
      clinic_name: vet.clinic_name || '',
      phone: vet.phone || '',
      email: vet.email || '',
      address: vet.address || '',
      specialization: vet.specialization || '',
      is_primary: vet.is_primary
    });
    setShowAddVet(true);
  };

  // Handle edit metric
  const handleEditMetric = (metric: HealthMetric) => {
    // Non permettere di modificare elementi temporanei
    if (metric.id.startsWith('temp_')) {
      toast({
        title: "Modifica non disponibile",
        description: "Gli elementi non ancora salvati possono solo essere eliminati. Salva prima l'elemento per poterlo modificare.",
        variant: "destructive"
      });
      return;
    }
    
    setEditingMetric(metric);
    setNewMetric({
      metric_type: metric.metric_type,
      value: metric.value.toString(),
      unit: metric.unit,
      notes: metric.notes || ''
    });
    setShowAddMetric(true);
  };

  // Handle edit medical record
  const handleEditRecord = (record: MedicalRecord) => {
    // Non permettere di modificare elementi temporanei
    if (record.id.startsWith('temp_')) {
      toast({
        title: "Modifica non disponibile",
        description: "Gli elementi non ancora salvati possono solo essere eliminati. Salva prima l'elemento per poterlo modificare.",
        variant: "destructive"
      });
      return;
    }
    
    setEditingRecord(record);
    setNewDocument({
      title: record.title,
      description: record.description || '',
      record_type: record.record_type,
      record_date: record.record_date,
      cost: record.cost?.toString() || '',
      notes: record.notes || '',
      document_urls: record.document_url ? [record.document_url] : []
    });
    setShowAddDocument(true);
  };

  // Handle edit medication
  const handleEditMedication = (medication: Medication) => {
    // Non permettere di modificare elementi temporanei
    if (medication.id.startsWith('temp_')) {
      toast({
        title: "Modifica non disponibile",
        description: "Gli elementi non ancora salvati possono solo essere eliminati. Salva prima l'elemento per poterlo modificare.",
        variant: "destructive"
      });
      return;
    }
    
    setEditingMedication(medication);
    setNewMedication({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      start_date: medication.start_date,
      end_date: medication.end_date || '',
      notes: medication.notes || ''
    });
    setShowAddMedication(true);
  };


  if (!selectedPet) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">Nessun Pet Selezionato</h2>
          <p className="text-muted-foreground mb-4">
            Aggiungi un pet per iniziare a monitorare la sua salute
          </p>
          <Button type="button" onClick={() => window.location.href = '/pets'}>
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi Pet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Heart className="h-8 w-8 text-primary" />
              Wellness Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitora la salute di {selectedPet.name}
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="dashboard">
            <Activity className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Unified Wellness Trend Chart */}
          <Card className="bg-gradient-to-br from-card to-muted/20 border-2 hover:shadow-xl transition-all duration-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    Trend Generale Benessere
                  </CardTitle>
                  <CardDescription>
                    Andamento complessivo del benessere di {selectedPet?.name || 'il tuo pet'} nel tempo
                  </CardDescription>
                </div>
                
                {/* Period Filter Badges */}
                <div className="flex gap-2 flex-wrap">
                  {[
                    { key: 'day', label: 'Giorno' },
                    { key: 'week', label: 'Settimana' }, 
                    { key: 'month', label: 'Mese' },
                    { key: 'year', label: 'Anno' },
                    { key: 'all', label: 'Tutto' }
                  ].map((period) => (
                    <Badge
                      key={period.key}
                      variant={selectedPeriod === period.key ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                        selectedPeriod === period.key 
                          ? 'bg-primary text-primary-foreground shadow-md' 
                          : 'hover:bg-muted border-2'
                      }`}
                      onClick={() => setSelectedPeriod(period.key)}
                    >
                      {period.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80 relative overflow-hidden">
                <ChartContainer
                  config={{
                    wellness: {
                      label: "Benessere",
                      color: "hsl(var(--primary))"
                    }
                  }}
                  className="w-full h-full"
                >
                  <LineChart
                    data={wellnessTrendData}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="wellness" 
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ r: 5, fill: "hsl(var(--primary))" }}
                      activeDot={{ r: 7, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                    />
                    <ReferenceLine y={75} stroke="hsl(var(--success))" strokeDasharray="5 5" label="Ottimo" />
                    <ReferenceLine y={50} stroke="hsl(var(--warning))" strokeDasharray="5 5" label="Medio" />
                    <ReferenceLine y={25} stroke="hsl(var(--destructive))" strokeDasharray="5 5" label="Attenzione" />
                  </LineChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          {/* Main Dashboard - Spaced from chart */}
          <div className="space-y-8 mt-8">
            
            {/* Primary Health Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Health Score Card */}
              <Card className="hover-scale bg-gradient-to-br from-red-500/10 via-red-500/5 to-background border-red-500/20 hover:border-red-500/40 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Punteggio Salute
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <UnifiedHealthScore selectedPet={selectedPet} user={user} addNotification={addNotification} />
                </CardContent>
              </Card>

              {/* Detailed Emotions Analysis Card */}
              <Card className="hover-scale bg-gradient-to-br from-pink-500/10 via-pink-500/5 to-background border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-pink-500" />
                    Analisi Emozioni
                  </CardTitle>
                  <CardDescription>Distribuzione completa delle emozioni</CardDescription>
                </CardHeader>
                 <CardContent className="space-y-2">
                   {emotionCounts && Object.keys(emotionCounts).length > 0 ? (
                     <div className="space-y-2 max-h-32 overflow-y-auto overflow-x-hidden">
                       {Object.entries(emotionCounts)
                         .sort(([,a], [,b]) => b - a)
                         .map(([emotion, count], index) => (
                           <div key={emotion} className="flex items-center justify-between min-w-0">
                             <div className="flex items-center gap-2 flex-1 min-w-0">
                               <div 
                                 className="w-3 h-3 rounded-full flex-shrink-0"
                                 style={{ backgroundColor: EMOTION_COLORS[emotion] || '#6b7280' }}
                               />
                               <span className="text-sm capitalize truncate">{emotion}</span>
                             </div>
                             <div className="flex items-center gap-1 flex-shrink-0">
                               <span className="text-sm font-medium w-6 text-right">{count}</span>
                               <div className="w-8 bg-muted rounded-full h-2">
                                 <div 
                                   className="h-2 rounded-full"
                                   style={{ 
                                     width: `${(count / Math.max(...Object.values(emotionCounts))) * 100}%`,
                                     backgroundColor: EMOTION_COLORS[emotion] || '#6b7280'
                                   }}
                                 />
                               </div>
                             </div>
                           </div>
                         ))}
                     </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nessuna emozione da analizzare</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Vital Parameters Card */}
              <Card className="hover-scale bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-background border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-500" />
                      Parametri Vitali
                    </CardTitle>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setShowAddMetric(true)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                 <CardContent className="space-y-3">
                   {healthMetrics.length > 0 ? (
                     <div className="space-y-3">
                       {healthMetrics.slice(0, 3).map((metric) => {
                         const evaluation = evaluateVitalParameter(metric.metric_type, parseFloat(metric.value.toString()), selectedPet?.type);
                         return (
                           <div key={metric.id} className="space-y-2">
                             <div className="flex items-center justify-between">
                               <div className="flex items-center gap-2">
                                 <div className={`w-2 h-2 rounded-full ${
                                   evaluation.status === 'normal' ? 'bg-green-500' :
                                   evaluation.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                                 }`} />
                                 <span className="text-sm">{translateMetricType(metric.metric_type)}</span>
                                 <span className="text-sm font-medium">
                                   {metric.metric_type === 'gum_color' ? getGumColorText(metric.value) : `${metric.value} ${metric.unit}`}
                                 </span>
                               </div>
                               <div className="flex gap-1">
                                 <Button 
                                   size="sm" 
                                   variant="ghost" 
                                   className="h-6 w-6 p-0 text-blue-500"
                                   onClick={() => handleEditMetric(metric)}
                                 >
                                   <Edit className="h-3 w-3" />
                                 </Button>
                                 <Button 
                                   size="sm" 
                                   variant="ghost" 
                                   className="h-6 w-6 p-0 text-red-500"
                                   onClick={() => handleDelete('metrica', metric.id, translateMetricType(metric.metric_type))}
                                 >
                                   <Trash2 className="h-3 w-3" />
                                 </Button>
                               </div>
                             </div>
                             
                             {/* Alert per parametri anomali */}
                             {evaluation.status !== 'normal' && (
                               <Alert variant={evaluation.status === 'critical' ? 'destructive' : 'default'} className="py-2">
                                 <AlertTriangle className="h-4 w-4" />
                                 <AlertDescription className="text-xs">
                                   <div className="font-medium">{evaluation.message}</div>
                                   {evaluation.recommendation && (
                                     <div className="text-muted-foreground mt-1">{evaluation.recommendation}</div>
                                   )}
                                 </AlertDescription>
                               </Alert>
                             )}
                           </div>
                         );
                       })}
                     </div>
                   ) : (
                     <div className="text-center py-4 text-muted-foreground">
                       <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                       <p className="text-sm">Nessun parametro vitale registrato</p>
                     </div>
                   )}
                 </CardContent>
              </Card>

              {/* Behavioral Insights Card */}
              <Card className="hover-scale bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-background border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-500" />
                      Comportamenti Osservati
                    </CardTitle>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={handleAddBehavior}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {behavioralTags.length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(behavioralTagCounts).slice(0, 3).map(([tag, count]) => (
                        <div key={tag} className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                          <span className="text-sm font-medium">{count}x</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nessun comportamento osservato</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Active Medications Card */}
              <Card className="hover-scale bg-gradient-to-br from-green-500/10 via-green-500/5 to-background border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Pill className="h-5 w-5 text-green-500" />
                      Farmaci Attivi
                    </CardTitle>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setShowAddMedication(true)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {medications.filter(med => {
                    // Show active medications that haven't expired
                    if (!med.is_active) return false;
                    if (!med.end_date) return true; // No end date means it's ongoing
                    return new Date(med.end_date) >= new Date(); // Not expired
                  }).length > 0 ? (
                    <div className="space-y-2">
                      {medications.filter(med => {
                        if (!med.is_active) return false;
                        if (!med.end_date) return true;
                        return new Date(med.end_date) >= new Date();
                      }).slice(0, 3).map((medication) => {
                        const isExpiring = medication.end_date && 
                          new Date(medication.end_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Expires in 7 days
                        return (
                        <div key={medication.id} className="border-l-2 border-green-500/30 pl-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{medication.name}</span>
                            </div>
                             <div className="flex gap-1">
                               <Button 
                                 size="sm" 
                                 variant="ghost" 
                                 className="h-6 w-6 p-0 text-blue-500"
                                 onClick={() => handleEditMedication(medication)}
                               >
                                 <Edit className="h-3 w-3" />
                               </Button>
                               <Button 
                                 size="sm" 
                                 variant="ghost" 
                                 className="h-6 w-6 p-0 text-red-500"
                                 onClick={() => handleDelete('farmaco', medication.id, medication.name)}
                               >
                                 <Trash2 className="h-3 w-3" />
                               </Button>
                             </div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {medication.dosage}
                          </div>
                          {medication.end_date && (
                            <div className="text-xs text-muted-foreground">
                              Fino al: {format(new Date(medication.end_date), 'dd/MM/yyyy')}
                            </div>
                          )}
                         </div>
                         );
                       })}
                     </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <Pill className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nessun farmaco attivo</p>
                    </div>
                  )}
                 </CardContent>
               </Card>

              {/* Recent Visits Card */}
              <Card className="hover-scale bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-background border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      Visite Recenti
                    </CardTitle>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setShowAddDocument(true)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {medicalRecords && medicalRecords.filter(record => !record.document_url).length > 0 ? (
                    <div className="space-y-2">
                      {medicalRecords.filter(record => !record.document_url).slice(0, 3).map((record) => (
                        <div key={record.id} className="border-l-2 border-blue-500/30 pl-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{record.title}</span>
                              <Badge variant="outline" className="text-xs">
                                {translateRecordType(record.record_type)}
                              </Badge>
                            </div>
                             <div className="flex gap-1">
                               <Button 
                                 size="sm" 
                                 variant="ghost" 
                                 className="h-6 w-6 p-0 text-blue-500"
                                 onClick={() => handleEditRecord(record)}
                               >
                                 <Edit className="h-3 w-3" />
                               </Button>
                               <Button 
                                 size="sm" 
                                 variant="ghost" 
                                 className="h-6 w-6 p-0 text-red-500"
                                 onClick={() => handleDelete('visita', record.id, record.title)}
                               >
                                 <Trash2 className="h-3 w-3" />
                               </Button>
                             </div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {format(new Date(record.record_date), 'dd/MM/yyyy')}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nessuna visita registrata</p>
                    </div>
                  )}
                 </CardContent>
               </Card>

              {/* Medical Documents Card */}
              <Card className="hover-scale bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-background border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileImage className="h-5 w-5 text-indigo-500" />
                      Documenti Medici
                    </CardTitle>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setShowAddDocument(true)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {medicalRecords.filter(record => record.document_url).length > 0 ? (
                    <div className="space-y-2">
                      {medicalRecords.filter(record => record.document_url).slice(0, 3).map((record) => (
                        <div key={record.id} className="border-l-2 border-indigo-500/30 pl-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{record.title}</span>
                              <Badge variant="outline" className="text-xs">
                                {translateRecordType(record.record_type)}
                              </Badge>
                            </div>
                             <div className="flex gap-1">
                               <Button 
                                 size="sm" 
                                 variant="ghost" 
                                 className="h-6 w-6 p-0"
                                 onClick={() => window.open(record.document_url, '_blank')}
                                 title="Scarica"
                               >
                                 <Download className="h-3 w-3" />
                               </Button>
                               <Button 
                                 size="sm" 
                                 variant="ghost" 
                                 className="h-6 w-6 p-0 text-red-500"
                                 onClick={() => handleDelete('visita', record.id, record.title)}
                               >
                                 <Trash2 className="h-3 w-3" />
                               </Button>
                             </div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {format(new Date(record.record_date), 'dd/MM/yyyy')}
                             </div>
                           </div>
                        ))
                      }
                     </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <FileImage className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nessun documento caricato</p>
                    </div>
                  )}
                 </CardContent>
               </Card>

              {/* Insurance Card */}
              <Card className="hover-scale bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-background border-teal-500/20 hover:border-teal-500/40 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-teal-500" />
                      Assicurazione
                    </CardTitle>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setShowAddInsurance(true)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {insurances.filter(ins => ins.is_active).length > 0 ? (
                    <div className="space-y-2">
                       {insurances.filter(ins => ins.is_active).slice(0, 2).map((insurance) => {
                         const isExpired = insurance.end_date && new Date(insurance.end_date) < new Date();
                         return (
                           <div key={insurance.id} className="border-l-2 border-teal-500/30 pl-3">
                             <div className="flex items-center justify-between">
                               <div className="flex items-center gap-2">
                                 <span className="text-sm font-medium">{insurance.provider_name}</span>
                                  <Badge variant={isExpired ? "destructive" : "outline"} className="text-xs">
                                    {isExpired ? "Scaduta" : "Attiva"}
                                  </Badge>
                               </div>
                             <div className="flex gap-1">
                               <Button 
                                 size="sm" 
                                 variant="ghost" 
                                 className="h-6 w-6 p-0 text-red-500"
                                 onClick={() => handleDelete('assicurazione', insurance.id, insurance.provider_name)}
                               >
                                 <Trash2 className="h-3 w-3" />
                               </Button>
                             </div>
                          </div>
                           <div className="text-xs text-muted-foreground mt-1">
                             Polizza: {insurance.policy_number}
                           </div>
                           {insurance.premium_amount && (
                             <div className="text-xs text-muted-foreground">
                               Premio: €{insurance.premium_amount}
                             </div>
                           )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nessuna assicurazione attiva</p>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>

            {/* Secondary Health Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
               {/* Emergency Contacts Card */}
              <Card className="hover-scale bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-background border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Phone className="h-5 w-5 text-orange-500" />
                      Contatti Emergenza
                    </CardTitle>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setShowAddContact(true)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {emergencyContacts.length > 0 ? (
                    <div className="space-y-2">
                      {emergencyContacts.slice(0, 3).map((contact) => (
                        <div key={contact.id} className="border-l-2 border-orange-500/30 pl-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{contact.name}</span>
                              {contact.is_primary && (
                                <Badge variant="outline" className="text-xs">
                                  Primario
                                </Badge>
                              )}
                            </div>
                             <div className="flex gap-1">
                               <Button 
                                 size="sm" 
                                 variant="ghost" 
                                 className="h-6 w-6 p-0 text-green-600 hover:text-green-700" 
                                 onClick={() => handlePhoneCall(contact.phone)}
                                 title="Chiama"
                               >
                                 <Phone className="h-3 w-3" />
                               </Button>
                               <Button 
                                 size="sm" 
                                 variant="ghost" 
                                 className="h-6 w-6 p-0"
                                 onClick={() => handleEditContact(contact)}
                                 title="Modifica"
                               >
                                 <Edit className="h-3 w-3" />
                               </Button>
                               <Button 
                                 size="sm" 
                                 variant="ghost" 
                                 className="h-6 w-6 p-0 text-red-500"
                                 onClick={() => handleDelete('contatto', contact.id, contact.name)}
                               >
                                 <Trash2 className="h-3 w-3" />
                               </Button>
                             </div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {contact.phone}
                          </div>
                          {contact.relationship && (
                            <div className="text-xs text-muted-foreground">
                              {contact.relationship}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <Phone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nessun contatto di emergenza</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Veterinarian Card */}
              <Card className="hover-scale bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-background border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-purple-500" />
                      Veterinario
                    </CardTitle>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setShowAddVet(true)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {veterinarians.filter(vet => vet.is_primary).length > 0 ? (
                    <div className="space-y-2">
                      {veterinarians.filter(vet => vet.is_primary).map((vet) => (
                        <div key={vet.id} className="border-l-2 border-purple-500/30 pl-3">
                           <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                               <span className="text-sm font-medium">{vet.name}</span>
                               <Badge variant="outline" className="text-xs">
                                 Primario
                               </Badge>
                             </div>
                             <div className="flex gap-1">
                               <Button 
                                 size="sm" 
                                 variant="ghost" 
                                 className="h-6 w-6 p-0 text-green-600 hover:text-green-700" 
                                 onClick={() => handlePhoneCall(vet.phone)}
                                 title="Chiama"
                               >
                                 <Phone className="h-3 w-3" />
                               </Button>
                               <Button 
                                 size="sm" 
                                 variant="ghost" 
                                 className="h-6 w-6 p-0"
                                 onClick={() => handleEditVet(vet)}
                                 title="Modifica"
                               >
                                 <Edit className="h-3 w-3" />
                               </Button>
                               <Button 
                                 size="sm" 
                                 variant="ghost" 
                                 className="h-6 w-6 p-0 text-red-500"
                                 onClick={() => handleDelete('veterinario', vet.id, vet.name)}
                               >
                                 <Trash2 className="h-3 w-3" />
                               </Button>
                             </div>
                           </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {vet.phone}
                          </div>
                          {vet.clinic_name && (
                            <div className="text-xs text-muted-foreground">
                              {vet.clinic_name}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                   ) : (
                     <div className="text-center py-4 text-muted-foreground">
                       <Stethoscope className="h-8 w-8 mx-auto mb-2 opacity-50" />
                       <p className="text-sm">Nessun veterinario registrato</p>
                     </div>
                   )}
                   
                   {/* Bottone per cercare veterinari vicini */}
                   <div className="pt-2 border-t">
                     <Button 
                       size="sm" 
                       variant="outline" 
                       className="w-full h-8"
                       onClick={findNearbyVets}
                       disabled={loadingNearbyVets}
                     >
                       {loadingNearbyVets ? (
                         <>
                           <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full mr-2" />
                           Ricerca...
                         </>
                       ) : (
                         <>
                           <MapPin className="h-3 w-3 mr-2" />
                           Trova veterinari vicini
                         </>
                       )}
                     </Button>
                   </div>
                </CardContent>
              </Card>

              {/* First Aid Guide Card */}
              <Card className="hover-scale bg-gradient-to-br from-red-500/10 via-red-500/5 to-background border-red-500/20 hover:border-red-500/40 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Primo Soccorso
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center py-4">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                    <p className="text-sm text-muted-foreground mb-3">
                      Guida rapida per emergenze
                    </p>
                    <Button type="button" size="sm" variant="outline" className="h-8" onClick={() => setShowFirstAidGuide(true)}>
                      <BookOpen className="h-4 w-4 mr-1" />
                      Apri Guida
                    </Button>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Additional Health Influence Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              


            </div>
          </div>
        </TabsContent>

      </Tabs>

      {/* Add Medication Dialog */}
      <Dialog open={showAddMedication} onOpenChange={setShowAddMedication}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMedication ? 'Modifica Farmaco' : 'Nuovo Farmaco'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="medication_name">Nome Farmaco *</Label>
              <Input
                id="medication_name"
                value={newMedication.name}
                onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome del farmaco"
              />
            </div>
            <div>
              <Label htmlFor="dosage">Dosaggio *</Label>
              <Input
                id="dosage"
                value={newMedication.dosage}
                onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                placeholder="es. 10mg"
              />
            </div>
            <div>
              <Label htmlFor="frequency">Frequenza *</Label>
              <Select 
                value={newMedication.frequency} 
                onValueChange={(value) => setNewMedication(prev => ({ ...prev, frequency: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona frequenza" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="una_volta_al_giorno">Una volta al giorno</SelectItem>
                  <SelectItem value="due_volte_al_giorno">Due volte al giorno</SelectItem>
                  <SelectItem value="tre_volte_al_giorno">Tre volte al giorno</SelectItem>
                  <SelectItem value="al_bisogno">Al bisogno</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Data Inizio *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={newMedication.start_date}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="end_date">Data Fine</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={newMedication.end_date}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="medication_notes">Note</Label>
              <Textarea
                id="medication_notes"
                value={newMedication.notes}
                onChange={(e) => setNewMedication(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Note aggiuntive"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button 
              type="button"
              onClick={() => {
                setShowAddMedication(false);
                setEditingMedication(null);
                setNewMedication({ name: '', dosage: '', frequency: '', start_date: '', end_date: '', notes: '' });
              }} 
              variant="outline"
            >
              Annulla
            </Button>
            <Button type="button" onClick={handleAddMedication}>
              {editingMedication ? 'Aggiorna' : 'Salva'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Medical Record Dialog */}
      <Dialog open={showAddDocument} onOpenChange={setShowAddDocument}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecord ? 'Modifica Visita' : 'Nuova Visita'}</DialogTitle>
            <DialogDescription>
              Aggiungi i dettagli della visita veterinaria e carica i relativi documenti
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="record_title">Titolo *</Label>
              <Input
                id="record_title"
                value={newDocument.title}
                onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Titolo della visita"
              />
            </div>
            <div>
              <Label htmlFor="record_type">Tipo Visita *</Label>
              <Select 
                value={newDocument.record_type} 
                onValueChange={(value) => setNewDocument(prev => ({ ...prev, record_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visita">Visita Generale</SelectItem>
                  <SelectItem value="vaccino">Vaccinazione</SelectItem>
                  <SelectItem value="esame">Controllo/Esame</SelectItem>
                  <SelectItem value="emergenza">Emergenza</SelectItem>
                  <SelectItem value="analisi">Analisi</SelectItem>
                  <SelectItem value="trattamento">Trattamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="record_date">Data *</Label>
              <Input
                id="record_date"
                type="date"
                value={newDocument.record_date}
                onChange={(e) => setNewDocument(prev => ({ ...prev, record_date: e.target.value }))}
              />
             </div>

              {/* File Upload Section */}
              <div className="space-y-2">
                <Label>Documenti Medici</Label>
                <MultiFileUploader
                  bucketName="medical"
                  maxFiles={10}
                  maxSizePerFile={15}
                  acceptedTypes={['image/*', 'application/pdf', '.doc', '.docx', '.txt']}
                  onFilesChanged={(files) => {
                    // Solo aggiorna quando ci sono file effettivamente caricati
                    const uploadedUrls = files.filter(f => f.uploaded).map(f => f.url);
                    setNewDocument(prev => ({ 
                      ...prev, 
                      document_urls: uploadedUrls
                    }));
                  }}
               />
             </div>
           </div>
           <div className="flex gap-2 pt-4">
             <Button 
               type="button"
               onClick={() => {
                 setShowAddDocument(false);
                 setNewDocument({ title: '', description: '', record_type: '', record_date: '', cost: '', notes: '', document_urls: [] });
               }} 
               variant="outline"
             >
               Annulla
             </Button>
            <Button type="button" onClick={handleAddDocument}>
              Salva
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Emergency Contact Dialog */}
      <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingContact ? 'Modifica Contatto Emergenza' : 'Nuovo Contatto Emergenza'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="contact_name">Nome *</Label>
              <Input
                id="contact_name"
                value={newContact.name}
                onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome del contatto"
              />
            </div>
            <div>
              <Label htmlFor="contact_phone">Telefono *</Label>
              <Input
                id="contact_phone"
                value={newContact.phone}
                onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Numero di telefono"
              />
            </div>
            <div>
              <Label htmlFor="contact_relationship">Relazione</Label>
              <Input
                id="contact_relationship"
                value={newContact.relationship}
                onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                placeholder="es. Amico, Familiare"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button 
              type="button"
              onClick={() => {
                setShowAddContact(false);
                setEditingContact(null);
                setNewContact({ name: '', contact_type: '', phone: '', relationship: '', email: '', notes: '' });
              }} 
              variant="outline"
            >
              Annulla
            </Button>
            <Button type="button" onClick={handleAddContact}>
              Salva
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Veterinarian Dialog */}
      <Dialog open={showAddVet} onOpenChange={setShowAddVet}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingVet ? 'Modifica Veterinario' : 'Nuovo Veterinario'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="vet_name">Nome *</Label>
              <Input
                id="vet_name"
                value={newVet.name}
                onChange={(e) => setNewVet(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome del veterinario"
              />
            </div>
            <div>
              <Label htmlFor="vet_phone">Telefono *</Label>
              <Input
                id="vet_phone"
                value={newVet.phone}
                onChange={(e) => setNewVet(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Numero di telefono"
              />
            </div>
            <div>
              <Label htmlFor="vet_clinic">Clinica</Label>
              <Input
                id="vet_clinic"
                value={newVet.clinic_name}
                onChange={(e) => setNewVet(prev => ({ ...prev, clinic_name: e.target.value }))}
                placeholder="Nome della clinica"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button 
              type="button"
              onClick={() => {
                setShowAddVet(false);
                setEditingVet(null);
                setNewVet({ name: '', clinic_name: '', phone: '', email: '', address: '', specialization: '', is_primary: false });
              }} 
              variant="outline"
            >
              Annulla
            </Button>
            <Button type="button" onClick={handleAddVet}>
              Salva
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Metric Dialog */}
      <Dialog open={showAddMetric} onOpenChange={setShowAddMetric}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMetric ? 'Modifica Metrica' : 'Nuova Metrica Salute'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="metric_type">Tipo Metrica *</Label>
              <Select 
                value={newMetric.metric_type} 
                onValueChange={(value) => {
                  const units = {
                    'temperature': '°C',
                    'heart_rate': 'bpm',
                    'respiration': 'resp/min',
                    'gum_color': '',
                    'weight': 'kg'
                  };
                  setNewMetric(prev => ({ 
                    ...prev, 
                    metric_type: value,
                    unit: units[value] || '',
                    value: '' // Reset value when changing type
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="temperature">Temperatura Corporea</SelectItem>
                  <SelectItem value="heart_rate">Frequenza Cardiaca</SelectItem>
                  <SelectItem value="respiration">Respirazione</SelectItem>
                  <SelectItem value="gum_color">Colore Gengive</SelectItem>
                  <SelectItem value="weight">Peso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Show unit field for display only when not gum_color */}
            {newMetric.metric_type && newMetric.metric_type !== 'gum_color' && (
              <div>
                <Label htmlFor="unit">Unità di Misura</Label>
                <Input
                  id="unit"
                  value={newMetric.unit}
                  readOnly
                  placeholder="Auto-rilevata"
                  className="bg-muted"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="value">
                {newMetric.metric_type === 'gum_color' ? 'Colore *' : 'Valore *'}
              </Label>
              {newMetric.metric_type === 'gum_color' ? (
                <Select 
                  value={newMetric.value} 
                  onValueChange={(value) => setNewMetric(prev => ({ ...prev, value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona colore" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Rosa</SelectItem>
                    <SelectItem value="2">Pallide</SelectItem>
                    <SelectItem value="3">Blu/Viola</SelectItem>
                    <SelectItem value="4">Gialle</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="value"
                  type="number"
                  step="0.1"
                  value={newMetric.value}
                  onChange={(e) => setNewMetric(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="Inserisci valore"
                />
              )}
            </div>
            <div>
              <Label htmlFor="notes">Note</Label>
              <Textarea
                id="notes"
                value={newMetric.notes}
                onChange={(e) => setNewMetric(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Note aggiuntive"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button 
              type="button"
              onClick={() => {
                setShowAddMetric(false);
                setEditingMetric(null);
                setNewMetric({ metric_type: '', value: '', unit: '', notes: '' });
              }} 
              variant="outline"
            >
              Annulla
            </Button>
            <Button type="button" onClick={handleAddMetric}>
              Salva
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Insurance Dialog */}
      <Dialog open={showAddInsurance} onOpenChange={setShowAddInsurance}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuova Assicurazione</DialogTitle>
            <DialogDescription>
              Inserisci i dettagli della polizza assicurativa e carica i documenti relativi
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="provider_name">Compagnia Assicurativa *</Label>
              <Input
                id="provider_name"
                value={newInsurance.provider_name}
                onChange={(e) => setNewInsurance(prev => ({ ...prev, provider_name: e.target.value }))}
                placeholder="Nome della compagnia"
              />
            </div>
            <div>
              <Label htmlFor="policy_number">Numero Polizza *</Label>
              <Input
                id="policy_number"
                value={newInsurance.policy_number}
                onChange={(e) => setNewInsurance(prev => ({ ...prev, policy_number: e.target.value }))}
                placeholder="Numero di polizza"
              />
            </div>
            <div>
              <Label htmlFor="policy_type">Tipo Polizza</Label>
              <Select 
                value={newInsurance.policy_type} 
                onValueChange={(value) => setNewInsurance(prev => ({ ...prev, policy_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="base">Base</SelectItem>
                  <SelectItem value="completa">Completa</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Data Inizio *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={newInsurance.start_date}
                  onChange={(e) => setNewInsurance(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="end_date">Data Scadenza</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={newInsurance.end_date}
                  onChange={(e) => setNewInsurance(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="premium_amount">Premio Annuale (€)</Label>
                <Input
                  id="premium_amount"
                  type="number"
                  step="0.01"
                  value={newInsurance.premium_amount}
                  onChange={(e) => setNewInsurance(prev => ({ ...prev, premium_amount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="deductible">Franchigia (€)</Label>
                <Input
                  id="deductible"
                  type="number"
                  step="0.01"
                  value={newInsurance.deductible}
                  onChange={(e) => setNewInsurance(prev => ({ ...prev, deductible: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
             </div>

              {/* File Upload Section */}
              <div className="space-y-2">
                <Label>Documenti Assicurazione</Label>
                <MultiFileUploader
                  bucketName="insurance"
                  maxFiles={5}
                  maxSizePerFile={10}
                  acceptedTypes={['image/*', 'application/pdf', '.doc', '.docx']}
                  onFilesChanged={(files) => {
                    // Solo aggiorna quando ci sono file effettivamente caricati
                    const uploadedUrls = files.filter(f => f.uploaded).map(f => f.url);
                    setNewInsurance(prev => ({ 
                      ...prev, 
                      document_urls: uploadedUrls
                    }));
                  }}
               />
             </div>
           </div>
           <div className="flex gap-2 pt-4">
             <Button 
               type="button"
               onClick={() => {
                 setShowAddInsurance(false);
                 setNewInsurance({ provider_name: '', policy_number: '', policy_type: '', start_date: '', end_date: '', premium_amount: '', deductible: '', document_urls: [] });
               }} 
               variant="outline"
             >
               Annulla
             </Button>
             <Button type="button" onClick={handleAddInsurance}>
               Salva
             </Button>
           </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog for deletions */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        variant="destructive"
         confirmText="Elimina"
       />

       {/* Diary Entry Dialog - Fixed Reference Error */}
       <DiaryEntryForm
         isOpen={showDiaryDialog}
         onClose={() => setShowDiaryDialog(false)}
         onSave={handleAddDiaryEntry}
         petId={selectedPet?.id || ''}
         userId={user?.id || ''}
       />

        {/* Nearby Veterinarians Dialog */}
        <Dialog open={showNearbyVets} onOpenChange={setShowNearbyVets}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-purple-500" />
                Veterinari nelle vicinanze
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {nearbyVets.length > 0 ? (
                nearbyVets.map((vet) => (
                  <div key={vet.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{vet.name}</h3>
                        <p className="text-sm text-muted-foreground">{vet.address}</p>
                        
                        <div className="flex items-center gap-4 mt-2">
                          {vet.distance && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium">{vet.distance} km</span>
                            </div>
                          )}
                          
                          {vet.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4 text-green-500" />
                              <span className="text-sm">{vet.phone}</span>
                            </div>
                          )}
                          
                          {vet.openingHours && (
                            <Badge variant="outline" className="text-xs">
                              {vet.openingHours}
                            </Badge>
                          )}
                          
                          <Badge variant="secondary" className="text-xs">
                            {vet.source || 'OpenStreetMap'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {vet.phone && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.location.href = `tel:${vet.phone}`}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Chiama
                        </Button>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vet.name + ' ' + vet.address)}`, '_blank')}
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        Indicazioni
                      </Button>
                      
                      {vet.website && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(vet.website, '_blank')}
                        >
                          <User className="h-3 w-3 mr-1" />
                          Sito Web
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nessun veterinario trovato nelle vicinanze</p>
                  <p className="text-sm mt-2">Prova ad aumentare la distanza di ricerca</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* First Aid Guide Dialog */}
        <FirstAidGuide 
          open={showFirstAidGuide} 
          onOpenChange={setShowFirstAidGuide} 
        />

     </div>
  );
};

export default WellnessPage;