import React, { useState, useEffect } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  Music
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { usePets } from '@/contexts/PetContext';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, subMonths, subDays, isAfter, isBefore, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { FirstAidGuide } from '@/components/FirstAidGuide';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import jsPDF from 'jspdf';
import { useNotifications } from '@/hooks/useNotifications';


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

// Helper function to translate metric types to Italian
const translateMetricType = (type: string): string => {
  const translations: Record<string, string> = {
    'temperature': 'Temperatura Corporea',
    'heart_rate': 'Frequenza Cardiaca', 
    'respiration': 'Respirazione',
    'gum_color': 'Colore Gengive',
    'weight': 'Peso',
    'checkup': 'Controllo',
    'blood_pressure': 'Pressione Sanguigna',
    'respiratory_rate': 'Frequenza Respiratoria'
  };
  return translations[type] || type;
};

// Helper function to convert gum color numeric values to text
const getGumColorText = (value: number): string => {
  const colorMap: Record<number, string> = {
    1: 'Rosa',
    2: 'Pallide', 
    3: 'Blu/Viola',
    4: 'Gialle'
  };
  return colorMap[value] || 'Sconosciuto';
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
    'other': 'Altro',
    // Italian values (in case they're already stored in Italian)
    'visita': 'Visita',
    'esame': 'Esame',
    'vaccino': 'Vaccino',
    'operazione': 'Operazione',
    'documento': 'Documento',
    'trattamento': 'Trattamento',
    'analisi': 'Analisi',
    'emergenza': 'Emergenza',
    'farmaco': 'Farmaco',
    'altro': 'Altro'
  };
  return translations[type] || type;
};

// Health Score Components
const HealthScoreDisplay = ({ healthMetrics, medicalRecords, medications, selectedPet, user, addNotification }: {
  healthMetrics: HealthMetric[];
  medicalRecords: MedicalRecord[];
  medications: Medication[];
  selectedPet: any;
  user: any;
  addNotification: (notification: any) => void;
}) => {
  const [healthScore, setHealthScore] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);
  
  const calculateHealthScore = async () => {
    if (!user || !selectedPet) return null;

    let totalScore = 0;
    
    // 🔵 PARAMETRI VITALI (25 punti max)
    let vitalScore = 0;
    
    // Peso: controlla se nella norma per la razza
    if (selectedPet.weight) {
      // Assumiamo peso normale per ora (dovrebbe essere basato su razza/taglia)
      vitalScore += 5; // peso nella norma
    }
    
    // Temperatura: controlla dai health_metrics
    const tempMetrics = healthMetrics.filter(m => m.metric_type === 'temperature');
    if (tempMetrics.length > 0) {
      const lastTemp = tempMetrics[0];
      if (lastTemp.value >= 38 && lastTemp.value <= 39) {
        vitalScore += 5; // temperatura normale
      }
    }
    
    // Battito cardiaco: controlla dai health_metrics
    const heartMetrics = healthMetrics.filter(m => m.metric_type === 'heart_rate');
    if (heartMetrics.length > 0) {
      const lastHeart = heartMetrics[0];
      if (lastHeart.value >= 60 && lastHeart.value <= 120) {
        vitalScore += 5; // battito normale
      }
    }
    
    // Colore gengive: controlla dai health_metrics
    const gumColorMetrics = healthMetrics.filter(m => m.metric_type === 'gum_color');
    if (gumColorMetrics.length > 0) {
      const lastGumColor = gumColorMetrics[0];
      if (lastGumColor.value === 1) { // Rosa - normale
        vitalScore += 5;
      } else if (lastGumColor.value === 2) { // Pallide - warning
        vitalScore -= 3;
      } else if (lastGumColor.value === 3 || lastGumColor.value === 4) { // Blu/Viola o Gialle - critico
        vitalScore -= 10;
      }
    }
    
    // Respirazione: controlla dai health_metrics
    const respirationMetrics = healthMetrics.filter(m => m.metric_type === 'respiration');
    if (respirationMetrics.length > 0) {
      const lastRespiration = respirationMetrics[0];
      if (lastRespiration.value >= 15 && lastRespiration.value <= 30) {
        vitalScore += 5; // respirazione normale
      }
    }
    
    totalScore += Math.min(25, vitalScore);
    
    // 🟢 ATTIVITÀ E COMPORTAMENTO (20 punti max)
    let behaviorScore = 0;
    
    // Attività fisica: basata su entry del diario recenti
    try {
      const { data: recentDiary } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .gte('entry_date', subDays(new Date(), 14).toISOString().split('T')[0])
        .order('entry_date', { ascending: false });
      
      if (recentDiary && recentDiary.length > 0) {
        const avgMood = recentDiary.reduce((sum, entry) => sum + (entry.mood_score || 5), 0) / recentDiary.length;
        if (avgMood >= 7) behaviorScore += 10; // comportamento ottimo
        else if (avgMood >= 5) behaviorScore += 5; // comportamento normale
      }
    } catch (error) {
      console.error('Error fetching diary entries:', error);
    }
    
    totalScore += Math.min(20, behaviorScore);
    
    // 🟡 CURE MEDICHE (25 punti max)
    let medicalScore = 0;
    
    // Vaccini: controlla medical_records per vaccini recenti
    const vaccinations = medicalRecords.filter(r => 
      r.record_type === 'vaccino' || r.record_type === 'vaccination'
    );
    const recentVaccinations = vaccinations.filter(v => {
      const vaccDate = new Date(v.record_date);
      const oneYearAgo = subDays(new Date(), 365);
      return vaccDate >= oneYearAgo;
    });
    
    if (recentVaccinations.length > 0) {
      medicalScore += 10; // vaccini aggiornati
    }
    
    // Farmaci: controlla medications attive
    const activeMeds = medications.filter(m => m.is_active);
    if (activeMeds.length > 0) {
      medicalScore += 10; // terapie seguite
    }
    
    // Visite veterinarie
    const recentVisits = medicalRecords.filter(r => {
      const visitDate = new Date(r.record_date);
      const sixMonthsAgo = subDays(new Date(), 180);
      const oneYearAgo = subDays(new Date(), 365);
      
      if (visitDate >= sixMonthsAgo) return 'recent';
      if (visitDate >= oneYearAgo) return 'medium';
      return 'old';
    });
    
    const recentVisitsCount = recentVisits.filter(r => {
      const visitDate = new Date(r.record_date);
      const sixMonthsAgo = subDays(new Date(), 180);
      return visitDate >= sixMonthsAgo;
    }).length;
    
    const mediumVisitsCount = recentVisits.filter(r => {
      const visitDate = new Date(r.record_date);
      const sixMonthsAgo = subDays(new Date(), 180);
      const oneYearAgo = subDays(new Date(), 365);
      return visitDate < sixMonthsAgo && visitDate >= oneYearAgo;
    }).length;
    
    if (recentVisitsCount > 0) medicalScore += 5; // visite recenti
    else if (mediumVisitsCount > 0) medicalScore += 3; // visite nell'ultimo anno
    
    totalScore += Math.min(25, medicalScore);
    
    // 🟠 INTERVENTI E CONTROLLI (15 punti max)
    let interventionScore = 0;
    
    // Esami recenti
    const recentExams = medicalRecords.filter(r => {
      const examDate = new Date(r.record_date);
      const sixMonthsAgo = subDays(new Date(), 180);
      return examDate >= sixMonthsAgo && (r.record_type === 'esame' || r.record_type === 'exam');
    });
    
    if (recentExams.length > 0) interventionScore += 5;
    
    // Operazioni necessarie
    const surgeries = medicalRecords.filter(r => 
      r.record_type === 'operazione' || r.record_type === 'surgery'
    );
    if (surgeries.length > 0) interventionScore += 5;
    
    // Trattamenti seguiti (basato su farmaci completati)
    const completedMeds = medications.filter(m => !m.is_active && m.end_date);
    if (completedMeds.length > 0) interventionScore += 5;
    
    totalScore += Math.min(15, interventionScore);
    
    // 🔴 ANALISI EMOTIVE APP (15 punti max)
    let emotionScore = 0;
    
    try {
      const { data: analyses } = await supabase
        .from('pet_analyses')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (analyses && analyses.length > 0) {
        const oneWeekAgo = subDays(new Date(), 7);
        const oneMonthAgo = subDays(new Date(), 30);
        
        const recentAnalyses = analyses.filter(a => new Date(a.created_at) >= oneWeekAgo);
        const monthlyAnalyses = analyses.filter(a => new Date(a.created_at) >= oneMonthAgo);
        
        if (recentAnalyses.length > 0) {
          emotionScore += 15; // analisi ultima settimana
        } else if (monthlyAnalyses.length > 0) {
          emotionScore += 10; // analisi ultimo mese
        } else if (analyses.length > 0) {
          emotionScore += 5; // analisi più vecchie
        }
      }
    } catch (error) {
      console.error('Error fetching analyses:', error);
    }
    
    totalScore += Math.min(15, emotionScore);
    
    // Assicurati che il punteggio sia tra 0 e 100
    const finalScore = Math.min(100, Math.max(0, Math.round(totalScore)));
    
    // Invia notifica se il punteggio è basso (solo una volta per evitare spam)
    if (finalScore < 50 && finalScore > 0) {
      const lastAlertKey = `wellness-alert-${selectedPet.id}`;
      const lastAlert = localStorage.getItem(lastAlertKey);
      const now = new Date().getTime();
      
      if (!lastAlert || (now - parseInt(lastAlert)) > (24 * 60 * 60 * 1000)) {
        addNotification({
          title: 'Punteggio wellness basso',
          message: `Il punteggio di benessere di ${selectedPet.name} è di ${finalScore}/100. Considera di contattare il veterinario.`,
          type: 'warning',
          read: false,
          action_url: '/wellness'
        });
        localStorage.setItem(lastAlertKey, now.toString());
      }
    }
    
    return finalScore;
  };
  
  React.useEffect(() => {
    const fetchHealthScore = async () => {
      setLoading(true);
      const score = await calculateHealthScore();
      setHealthScore(score);
      setLoading(false);
    };
    
    fetchHealthScore();
  }, [healthMetrics, medicalRecords, medications, selectedPet]);
  
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
    if (score < 30) return "Inizia ad aggiungere più dati sulla salute";
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

const HealthScoreCircle = ({ healthMetrics, medicalRecords, medications, selectedPet, user, addNotification }: {
  healthMetrics: HealthMetric[];
  medicalRecords: MedicalRecord[];
  medications: Medication[];
  selectedPet: any;
  user: any;
  addNotification: (notification: any) => void;
}) => {
  const [healthScore, setHealthScore] = React.useState<number | null>(null);
  
  const calculateHealthScore = async () => {
    if (!user || !selectedPet) return null;

    let totalScore = 0;
    
    // 🔵 PARAMETRI VITALI (25 punti max)
    let vitalScore = 0;
    
    // Peso: controlla se nella norma per la razza
    if (selectedPet.weight) {
      // Assumiamo peso normale per ora (dovrebbe essere basato su razza/taglia)
      vitalScore += 5; // peso nella norma
    }
    
    // Temperatura: controlla dai health_metrics
    const tempMetrics = healthMetrics.filter(m => m.metric_type === 'temperature');
    if (tempMetrics.length > 0) {
      const lastTemp = tempMetrics[0];
      if (lastTemp.value >= 38 && lastTemp.value <= 39) {
        vitalScore += 5; // temperatura normale
      }
    }
    
    // Battito cardiaco: controlla dai health_metrics
    const heartMetrics = healthMetrics.filter(m => m.metric_type === 'heart_rate');
    if (heartMetrics.length > 0) {
      const lastHeart = heartMetrics[0];
      if (lastHeart.value >= 60 && lastHeart.value <= 120) {
        vitalScore += 5; // battito normale
      }
    }
    
    // Colore gengive: controlla dai health_metrics
    const gumColorMetrics = healthMetrics.filter(m => m.metric_type === 'gum_color');
    if (gumColorMetrics.length > 0) {
      const lastGumColor = gumColorMetrics[0];
      if (lastGumColor.value === 1) { // Rosa - normale
        vitalScore += 5;
      } else if (lastGumColor.value === 2) { // Pallide - warning
        vitalScore -= 3;
      } else if (lastGumColor.value === 3 || lastGumColor.value === 4) { // Blu/Viola o Gialle - critico
        vitalScore -= 10;
      }
    }
    
    // Respirazione: controlla dai health_metrics
    const respirationMetrics = healthMetrics.filter(m => m.metric_type === 'respiration');
    if (respirationMetrics.length > 0) {
      const lastRespiration = respirationMetrics[0];
      if (lastRespiration.value >= 15 && lastRespiration.value <= 30) {
        vitalScore += 5; // respirazione normale
      }
    }
    
    totalScore += Math.min(25, vitalScore);
    
    // 🟢 ATTIVITÀ E COMPORTAMENTO (20 punti max)
    let behaviorScore = 0;
    
    // Attività fisica: basata su entry del diario recenti
    try {
      const { data: recentDiary } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .gte('entry_date', subDays(new Date(), 14).toISOString().split('T')[0])
        .order('entry_date', { ascending: false });
      
      if (recentDiary && recentDiary.length > 0) {
        const avgMood = recentDiary.reduce((sum, entry) => sum + (entry.mood_score || 5), 0) / recentDiary.length;
        if (avgMood >= 7) behaviorScore += 10; // comportamento ottimo
        else if (avgMood >= 5) behaviorScore += 5; // comportamento normale
      }
    } catch (error) {
      console.error('Error fetching diary entries:', error);
    }
    
    totalScore += Math.min(20, behaviorScore);
    
    // 🟡 CURE MEDICHE (25 punti max)
    let medicalScore = 0;
    
    // Vaccini: controlla medical_records per vaccini recenti
    const vaccinations = medicalRecords.filter(r => 
      r.record_type === 'vaccino' || r.record_type === 'vaccination'
    );
    const recentVaccinations = vaccinations.filter(v => {
      const vaccDate = new Date(v.record_date);
      const oneYearAgo = subDays(new Date(), 365);
      return vaccDate >= oneYearAgo;
    });
    
    if (recentVaccinations.length > 0) {
      medicalScore += 10; // vaccini aggiornati
    }
    
    // Farmaci: controlla medications attive
    const activeMeds = medications.filter(m => m.is_active);
    if (activeMeds.length > 0) {
      medicalScore += 10; // terapie seguite
    }
    
    // Visite veterinarie
    const recentVisits = medicalRecords.filter(r => {
      const visitDate = new Date(r.record_date);
      const sixMonthsAgo = subDays(new Date(), 180);
      const oneYearAgo = subDays(new Date(), 365);
      
      if (visitDate >= sixMonthsAgo) return 'recent';
      if (visitDate >= oneYearAgo) return 'medium';
      return 'old';
    });
    
    const recentVisitsCount = recentVisits.filter(r => {
      const visitDate = new Date(r.record_date);
      const sixMonthsAgo = subDays(new Date(), 180);
      return visitDate >= sixMonthsAgo;
    }).length;
    
    const mediumVisitsCount = recentVisits.filter(r => {
      const visitDate = new Date(r.record_date);
      const sixMonthsAgo = subDays(new Date(), 180);
      const oneYearAgo = subDays(new Date(), 365);
      return visitDate < sixMonthsAgo && visitDate >= oneYearAgo;
    }).length;
    
    if (recentVisitsCount > 0) medicalScore += 5; // visite recenti
    else if (mediumVisitsCount > 0) medicalScore += 3; // visite nell'ultimo anno
    
    totalScore += Math.min(25, medicalScore);
    
    // 🟠 INTERVENTI E CONTROLLI (15 punti max)
    let interventionScore = 0;
    
    // Esami recenti
    const recentExams = medicalRecords.filter(r => {
      const examDate = new Date(r.record_date);
      const sixMonthsAgo = subDays(new Date(), 180);
      return examDate >= sixMonthsAgo && (r.record_type === 'esame' || r.record_type === 'exam');
    });
    
    if (recentExams.length > 0) interventionScore += 5;
    
    // Operazioni necessarie
    const surgeries = medicalRecords.filter(r => 
      r.record_type === 'operazione' || r.record_type === 'surgery'
    );
    if (surgeries.length > 0) interventionScore += 5;
    
    // Trattamenti seguiti (basato su farmaci completati)
    const completedMeds = medications.filter(m => !m.is_active && m.end_date);
    if (completedMeds.length > 0) interventionScore += 5;
    
    totalScore += Math.min(15, interventionScore);
    
    // 🔴 ANALISI EMOTIVE APP (15 punti max)
    let emotionScore = 0;
    
    try {
      const { data: analyses } = await supabase
        .from('pet_analyses')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (analyses && analyses.length > 0) {
        const oneWeekAgo = subDays(new Date(), 7);
        const oneMonthAgo = subDays(new Date(), 30);
        
        const recentAnalyses = analyses.filter(a => new Date(a.created_at) >= oneWeekAgo);
        const monthlyAnalyses = analyses.filter(a => new Date(a.created_at) >= oneMonthAgo);
        
        if (recentAnalyses.length > 0) {
          emotionScore += 15; // analisi ultima settimana
        } else if (monthlyAnalyses.length > 0) {
          emotionScore += 10; // analisi ultimo mese
        } else if (analyses.length > 0) {
          emotionScore += 5; // analisi più vecchie
        }
      }
    } catch (error) {
      console.error('Error fetching analyses:', error);
    }
    
    totalScore += Math.min(15, emotionScore);
    
    // Assicurati che il punteggio sia tra 0 e 100
    const finalScore = Math.min(100, Math.max(0, Math.round(totalScore)));
    
    return finalScore;
  };
  
  React.useEffect(() => {
    const fetchHealthScore = async () => {
      const score = await calculateHealthScore();
      setHealthScore(score);
    };
    
    fetchHealthScore();
  }, [healthMetrics, medicalRecords, medications, selectedPet]);
  
  const displayScore = healthScore || 0;
  
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/20"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - displayScore / 100)}`}
            className="text-primary transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold">{displayScore}</span>
        </div>
      </div>
    </div>
  );
};

const WellnessPage = () => {
  const { user } = useAuth();
  const { selectedPet } = usePets();
  const { addNotification } = useNotifications();
  const [searchParams] = useSearchParams();
  
  // States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  // Dialog states
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [showAddVet, setShowAddVet] = useState(false);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showAddMetric, setShowAddMetric] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddInsurance, setShowAddInsurance] = useState(false);
  const [showFirstAidGuide, setShowFirstAidGuide] = useState(false);
  
  // Listener per aprire la guida primo soccorso da altre pagine
  useEffect(() => {
    const handleOpenFirstAidGuide = () => {
      setShowFirstAidGuide(true);
    };
    
    // Controlla se deve aprire la guida dal localStorage
    const shouldOpenGuide = localStorage.getItem('openFirstAidGuide');
    if (shouldOpenGuide === 'true') {
      setShowFirstAidGuide(true);
      localStorage.removeItem('openFirstAidGuide');
    }
    
    window.addEventListener('open-first-aid-guide', handleOpenFirstAidGuide);
    
    return () => {
      window.removeEventListener('open-first-aid-guide', handleOpenFirstAidGuide);
    };
  }, []);
  
  // Confirm dialog states
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
  
  // Form states
  const [newDocument, setNewDocument] = useState({
    title: '',
    description: '',
    record_type: '',
    record_date: '',
    notes: ''
  });
  
  const [newVet, setNewVet] = useState({
    name: '',
    clinic_name: '',
    phone: '',
    email: '',
    address: '',
    specialization: '',
    is_primary: false
  });
  
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    start_date: '',
    end_date: '',
    notes: ''
  });
  
  const [newMetric, setNewMetric] = useState({
    metric_type: '',
    value: '',
    unit: '',
    notes: ''
  });
  
  const [newContact, setNewContact] = useState({
    name: '',
    contact_type: '',
    phone: '',
    relationship: '',
    email: '',
    notes: ''
  });
  
  const [newInsurance, setNewInsurance] = useState({
    provider_name: '',
    policy_number: '',
    policy_type: '',
    start_date: '',
    end_date: '',
    premium_amount: '',
    deductible: ''
  });
  
  const [medicalId, setMedicalId] = useState({
    microchip: '',
    bloodType: '',
    allergies: '',
    medicalConditions: '',
    emergencyNotes: '',
    vetContact: ''
  });
  
  // Editing states
  const [editingDocument, setEditingDocument] = useState<MedicalRecord | null>(null);
  const [editingVet, setEditingVet] = useState<Veterinarian | null>(null);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [editingMetric, setEditingMetric] = useState<HealthMetric | null>(null);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [editingInsurance, setEditingInsurance] = useState<Insurance | null>(null);

  // Helper functions
  const getMedicationStatus = (medication: Medication) => {
    if (!medication.is_active) return 'inactive';
    if (medication.end_date && new Date(medication.end_date) < new Date()) return 'expired';
    return 'active';
  };

  const getInsuranceStatus = (insurance: Insurance) => {
    if (!insurance.is_active) return 'inactive';
    if (insurance.end_date) {
      const endDate = new Date(insurance.end_date);
      const today = new Date();
      const daysUntilExpiry = differenceInDays(endDate, today);
      
      if (daysUntilExpiry < 0) return 'expired';
      if (daysUntilExpiry <= 30) return 'expiring';
    }
    return 'active';
  };

  // Generate realistic chart data based on actual database data
  const generateHealthTrendData = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthMetrics = healthMetrics.filter(metric => {
        const metricDate = new Date(metric.recorded_at);
        return metricDate >= startOfMonth(date) && metricDate <= endOfMonth(date);
      });
      
      months.push({
        month: format(date, 'MMM', { locale: it }),
        score: monthMetrics.length > 0 
          ? Math.round(monthMetrics.reduce((sum, m) => sum + (m.value * 10), 0) / monthMetrics.length)
          : null, // No fake data
        visits: monthMetrics.filter(m => m.metric_type === 'checkup').length
      });
    }
    return months;
  };

  const generateVisitDistribution = () => {
    const visitTypes = medicalRecords.reduce((acc, record) => {
      acc[record.record_type] = (acc[record.record_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(visitTypes).map(([name, value]) => ({ name, value }));
  };

  // Fetch health data
  const fetchHealthData = async () => {
    if (!user || !selectedPet) return;
    
    setIsLoading(true);
    try {
      // Fetch all data in parallel
      const [metricsRes, recordsRes, medicationsRes, vetsRes, contactsRes, insuranceRes] = await Promise.all([
        supabase.from('health_metrics').select('*').eq('user_id', user.id).eq('pet_id', selectedPet.id).order('recorded_at', { ascending: false }),
        supabase.from('medical_records').select('*').eq('user_id', user.id).eq('pet_id', selectedPet.id).order('record_date', { ascending: false }),
        supabase.from('medications').select('*').eq('user_id', user.id).eq('pet_id', selectedPet.id).order('created_at', { ascending: false }),
        supabase.from('veterinarians').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('emergency_contacts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('pet_insurance').select('*').eq('user_id', user.id).eq('pet_id', selectedPet.id).order('created_at', { ascending: false })
      ]);
      
      if (metricsRes.data) setHealthMetrics(metricsRes.data);
      if (recordsRes.data) setMedicalRecords(recordsRes.data);
      if (medicationsRes.data) setMedications(medicationsRes.data);
      if (vetsRes.data) setVeterinarians(vetsRes.data);
      if (contactsRes.data) setEmergencyContacts(contactsRes.data);
      if (insuranceRes.data) setInsurances(insuranceRes.data);
      
    } catch (error) {
      console.error('Error fetching health data:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i dati sulla salute",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Gestisci i parametri URL per aprire direttamente il tab music-therapy
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Load Medical ID from localStorage when pet changes
  useEffect(() => {
    if (selectedPet) {
      const savedMedicalId = localStorage.getItem(`medicalId_${selectedPet.id}`);
      if (savedMedicalId) {
        try {
          const data = JSON.parse(savedMedicalId);
          setMedicalId({
            microchip: data.microchip || '',
            bloodType: data.bloodType || '',
            allergies: data.allergies || '',
            medicalConditions: data.medicalConditions || '',
            emergencyNotes: data.emergencyNotes || '',
            vetContact: data.vetContact || ''
          });
        } catch (error) {
          console.error('Error loading medical ID:', error);
        }
      } else {
        // Reset medical ID if no saved data
        setMedicalId({
          microchip: '',
          bloodType: '',
          allergies: '',
          medicalConditions: '',
          emergencyNotes: '',
          vetContact: ''
        });
      }
    }
  }, [selectedPet]);

  useEffect(() => {
    fetchHealthData();
  }, [user, selectedPet]);

  // Document upload function
  const handleUploadDocument = async (file: File) => {
    if (!user || !selectedPet) {
      toast({
        title: "Errore",
        description: "Devi essere autenticato e avere un pet selezionato",
        variant: "destructive"
      });
      return;
    }

    if (!file) {
      toast({
        title: "Errore", 
        description: "Nessun file selezionato",
        variant: "destructive"
      });
      return;
    }

    // Validate required fields
    if (!newDocument.title.trim()) {
      toast({
        title: "Errore",
        description: "Il titolo del documento è obbligatorio",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${selectedPet.id}/medical-documents/${Date.now()}.${fileExt}`;
      
      console.log('🚀 Starting file upload...', { fileName, fileSize: file.size, user: user.id, pet: selectedPet.id });
      
      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pet-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Storage upload error:', uploadError);
        throw new Error(`Errore caricamento file: ${uploadError.message}`);
      }

      console.log('✅ File uploaded successfully:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pet-media')
        .getPublicUrl(fileName);

      console.log('🔗 Public URL generated:', publicUrl);

      // Save uploaded file URL for preview and later use when saving
      setUploadedFileUrl(publicUrl);

      toast({
        title: "🎉 Successo!",
        description: "Documento caricato con successo"
      });

      // Keep dialog open after file upload - user will close it manually by clicking "Salva"
      // Don't create database record yet - wait for user to click "Salva"
      
    } catch (error: any) {
      console.error('❌ Error uploading document:', error);
      toast({
        title: "Errore di caricamento",
        description: error.message || "Impossibile caricare il documento. Verifica la connessione e riprova.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Save document without file upload
  const handleSaveDocumentOnly = async () => {
    if (!user || !selectedPet) {
      toast({
        title: "Errore",
        description: "Devi essere autenticato e avere un pet selezionato",
        variant: "destructive"
      });
      return;
    }

    if (!newDocument.title.trim()) {
      toast({
        title: "Errore",
        description: "Il titolo del documento è obbligatorio",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);

      const recordData = {
        user_id: user.id,
        pet_id: selectedPet.id,
        title: newDocument.title.trim(),
        description: newDocument.description?.trim() || null,
        record_type: newDocument.record_type || 'esame',
        record_date: newDocument.record_date || new Date().toISOString().split('T')[0],
        document_url: uploadedFileUrl || null, // Include uploaded file URL if present
        notes: newDocument.notes?.trim() || null
      };

      if (editingDocument) {
        // When editing, preserve existing document_url if no new file was uploaded
        const updateData = {
          ...recordData,
          document_url: uploadedFileUrl || editingDocument.document_url || null
        };
        
        const { error } = await supabase
          .from('medical_records')
          .update(updateData)
          .eq('id', editingDocument.id);
        
        if (error) throw error;
        
        toast({
          title: "Successo",
          description: "Documento aggiornato con successo"
        });
      } else {
        const { error } = await supabase
          .from('medical_records')
          .insert(recordData);
        
        if (error) throw error;
        
        toast({
          title: "Successo",
          description: "Documento salvato con successo"
        });
      }

      setNewDocument({ title: '', description: '', record_type: '', record_date: '', notes: '' });
      setShowAddDocument(false);
      setEditingDocument(null);
      setUploadedFileUrl(null); // Clear uploaded file URL
      fetchHealthData();
    } catch (error: any) {
      console.error('Error saving document:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile salvare il documento",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Save Medical ID
  const handleSaveMedicalId = async () => {
    if (!selectedPet || !medicalId.microchip) {
      toast({
        title: "Errore",
        description: "Inserisci almeno il numero del microchip",
        variant: "destructive"
      });
      return;
    }

    try {
      // Save to localStorage for persistence
      const medicalIdData = {
        ...medicalId,
        petId: selectedPet.id,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(`medicalId_${selectedPet.id}`, JSON.stringify(medicalIdData));
      
      toast({
        title: "Successo",
        description: "Informazioni mediche salvate con successo"
      });
    } catch (error) {
      console.error('Error saving medical ID:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare le informazioni",
        variant: "destructive"
      });
    }
  };

  // Generate Medical Tag PDF
  const generateMedicalTag = () => {
    if (!selectedPet || !medicalId.microchip) {
      toast({
        title: "Errore",
        description: "Salva prima le informazioni mediche",
        variant: "destructive"
      });
      return;
    }

    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('TAG MEDICO DI EMERGENZA', 105, 20, { align: 'center' });
      
      // Pet info
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`${selectedPet.name}`, 20, 40);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Specie: ${selectedPet.type} | Razza: ${selectedPet.breed || 'Non specificata'}`, 20, 50);
      
      // Microchip
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('MICROCHIP:', 20, 70);
      doc.setFont('helvetica', 'normal');
      doc.text(medicalId.microchip, 70, 70);
      
      // Blood type
      if (medicalId.bloodType) {
        doc.setFont('helvetica', 'bold');
        doc.text('GRUPPO SANGUIGNO:', 20, 85);
        doc.setFont('helvetica', 'normal');
        doc.text(medicalId.bloodType, 90, 85);
      }
      
      // Allergies
      if (medicalId.allergies) {
        doc.setFont('helvetica', 'bold');
        doc.text('ALLERGIE:', 20, 100);
        doc.setFont('helvetica', 'normal');
        const allergiesLines = doc.splitTextToSize(medicalId.allergies, 160);
        doc.text(allergiesLines, 20, 110);
      }
      
      // Medical conditions
      if (medicalId.medicalConditions) {
        doc.setFont('helvetica', 'bold');
        doc.text('CONDIZIONI MEDICHE:', 20, 140);
        doc.setFont('helvetica', 'normal');
        const conditionsLines = doc.splitTextToSize(medicalId.medicalConditions, 160);
        doc.text(conditionsLines, 20, 150);
      }
      
      // Emergency notes
      if (medicalId.emergencyNotes) {
        doc.setFont('helvetica', 'bold');
        doc.text('NOTE DI EMERGENZA:', 20, 180);
        doc.setFont('helvetica', 'normal');
        const notesLines = doc.splitTextToSize(medicalId.emergencyNotes, 160);
        doc.text(notesLines, 20, 190);
      }
      
      // Vet contact
      if (medicalId.vetContact) {
        doc.setFont('helvetica', 'bold');
        doc.text('VETERINARIO DI RIFERIMENTO:', 20, 220);
        doc.setFont('helvetica', 'normal');
        doc.text(medicalId.vetContact, 20, 230);
      }
      
      // Emergency contacts
      if (emergencyContacts.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.text('CONTATTI DI EMERGENZA:', 20, 250);
        doc.setFont('helvetica', 'normal');
        emergencyContacts.slice(0, 2).forEach((contact, index) => {
          doc.text(`${contact.name}: ${contact.phone}`, 20, 260 + (index * 10));
        });
      }
      
      // Footer
      doc.setFontSize(10);
      doc.text(`Generato il ${format(new Date(), 'dd/MM/yyyy')}`, 20, 280);
      
      // Save PDF
      doc.save(`tag-medico-${selectedPet.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      
      toast({
        title: "Successo",
        description: "Tag medico generato e scaricato"
      });
    } catch (error) {
      console.error('Error generating medical tag:', error);
      toast({
        title: "Errore",
        description: "Impossibile generare il tag medico",
        variant: "destructive"
      });
    }
  };

  // Add functions for other CRUD operations...
  const handleAddMedication = async () => {
    if (!user || !selectedPet || !newMedication.name) {
      toast({
        title: "Errore",
        description: "Nome del farmaco è obbligatorio",
        variant: "destructive"
      });
      return;
    }

    try {
      const medicationData = {
        user_id: user.id,
        pet_id: selectedPet.id,
        name: newMedication.name,
        dosage: newMedication.dosage,
        frequency: newMedication.frequency,
        start_date: newMedication.start_date || new Date().toISOString().split('T')[0],
        end_date: newMedication.end_date || null,
        notes: newMedication.notes || null,
        is_active: true
      };

      if (editingMedication) {
        const { error } = await supabase
          .from('medications')
          .update(medicationData)
          .eq('id', editingMedication.id);
        
        if (error) throw error;
        
        toast({
          title: "Successo",
          description: "Farmaco aggiornato con successo"
        });
      } else {
        const { error } = await supabase
          .from('medications')
          .insert(medicationData);
        
        if (error) throw error;
        
        toast({
          title: "Successo",
          description: "Farmaco aggiunto con successo"
        });
      }

      setNewMedication({ name: '', dosage: '', frequency: '', start_date: '', end_date: '', notes: '' });
      setEditingMedication(null);
      setShowAddMedication(false);
      fetchHealthData();
    } catch (error) {
      console.error('Error saving medication:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare il farmaco",
        variant: "destructive"
      });
    }
  };

  const handleAddMetric = async () => {
    if (!user || !selectedPet || !newMetric.metric_type || !newMetric.value) {
      toast({
        title: "Errore",
        description: "Tipo metrica e valore sono obbligatori",
        variant: "destructive"
      });
      return;
    }

    // Validate numeric value (except for gum_color)
    if (newMetric.metric_type !== 'gum_color' && isNaN(parseFloat(newMetric.value))) {
      toast({
        title: "Errore",
        description: "Il valore deve essere un numero valido",
        variant: "destructive"
      });
      return;
    }

    try {
      // Mappa i colori delle gengive a valori numerici per il database
      const getGumColorValue = (color: string) => {
        const colorMap = {
          'Rosa': 1,
          'Pallide': 2,
          'Blu/Viola': 3,
          'Gialle': 4
        };
        return colorMap[color] || 1;
      };

      const metricData = {
        user_id: user.id,
        pet_id: selectedPet.id,
        metric_type: newMetric.metric_type.toLowerCase().trim(),
        value: newMetric.metric_type === 'gum_color' ? getGumColorValue(newMetric.value) : parseFloat(newMetric.value),
        unit: newMetric.unit?.trim() || null,
        notes: newMetric.notes?.trim() || null,
        // Per le modifiche, mantieni la data originale; per nuove metriche, usa la data corrente
        recorded_at: editingMetric ? editingMetric.recorded_at : new Date().toISOString()
      };

      if (editingMetric) {
        const { error } = await supabase
          .from('health_metrics')
          .update(metricData)
          .eq('id', editingMetric.id);
        
        if (error) throw error;
        
        toast({
          title: "Successo",
          description: "Metrica aggiornata con successo"
        });
      } else {
        const { error } = await supabase
          .from('health_metrics')
          .insert(metricData);
        
        if (error) throw error;
        
        toast({
          title: "Successo",
          description: "Metrica aggiunta con successo"
        });
      }

      setNewMetric({ metric_type: '', value: '', unit: '', notes: '' });
      setEditingMetric(null);
      setShowAddMetric(false);
      fetchHealthData();
    } catch (error) {
      console.error('Error saving metric:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare la metrica",
        variant: "destructive"
      });
    }
  };

  const handleAddVet = async () => {
    if (!user || !newVet.name) {
      toast({
        title: "Errore",
        description: "Il nome del veterinario è obbligatorio",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('veterinarians')
        .insert({
          user_id: user.id,
          name: newVet.name,
          clinic_name: newVet.clinic_name || null,
          phone: newVet.phone || null,
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

      setNewVet({ name: '', clinic_name: '', phone: '', email: '', address: '', specialization: '', is_primary: false });
      setShowAddVet(false);
      fetchHealthData();
    } catch (error) {
      console.error('Error adding vet:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiungere il veterinario",
        variant: "destructive"
      });
    }
  };

  const handleDeleteVet = (vetId: string, vetName: string) => {
    setConfirmDialog({
      open: true,
      title: "Elimina Veterinario",
      description: `Sei sicuro di voler eliminare il veterinario "${vetName}"? Questa azione non può essere annullata.`,
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('veterinarians')
            .delete()
            .eq('id', vetId);

          if (error) throw error;

          toast({
            title: "Successo",
            description: "Veterinario eliminato con successo"
          });
          fetchHealthData();
        } catch (error) {
          console.error('Error deleting vet:', error);
          toast({
            title: "Errore",
            description: "Impossibile eliminare il veterinario",
            variant: "destructive"
          });
        }
      }
    });
  };

  const handleDeleteRecord = (recordId: string, recordTitle: string) => {
    setConfirmDialog({
      open: true,
      title: "Elimina Documento",
      description: `Sei sicuro di voler eliminare il documento "${recordTitle}"? Questa azione non può essere annullata.`,
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('medical_records')
            .delete()
            .eq('id', recordId);

          if (error) throw error;

          toast({
            title: "Successo",
            description: "Documento eliminato con successo"
          });
          fetchHealthData();
        } catch (error) {
          console.error('Error deleting record:', error);
          toast({
            title: "Errore",
            description: "Impossibile eliminare il documento",
            variant: "destructive"
          });
        }
      }
    });
  };

  const handleDeleteMedication = (medicationId: string, medicationName: string) => {
    setConfirmDialog({
      open: true,
      title: "Elimina Farmaco",
      description: `Sei sicuro di voler eliminare il farmaco "${medicationName}"? Questa azione non può essere annullata.`,
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('medications')
            .delete()
            .eq('id', medicationId);

          if (error) throw error;

          toast({
            title: "Successo",
            description: "Farmaco eliminato con successo"
          });
          fetchHealthData();
        } catch (error) {
          console.error('Error deleting medication:', error);
          toast({
            title: "Errore",
            description: "Impossibile eliminare il farmaco",
            variant: "destructive"
          });
        }
      }
    });
  };

  const handleDeleteMetric = (metricId: string, metricType: string) => {
    setConfirmDialog({
      open: true,
      title: "Elimina Metrica",
      description: `Sei sicuro di voler eliminare questa metrica di "${metricType}"? Questa azione non può essere annullata.`,
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('health_metrics')
            .delete()
            .eq('id', metricId);

          if (error) throw error;

          toast({
            title: "Successo",
            description: "Metrica eliminata con successo"
          });
          fetchHealthData();
        } catch (error) {
          console.error('Error deleting metric:', error);
          toast({
            title: "Errore",
            description: "Impossibile eliminare la metrica",
            variant: "destructive"
          });
        }
      }
    });
  };

  const handleDeleteContact = (contactId: string, contactName: string) => {
    setConfirmDialog({
      open: true,
      title: "Elimina Contatto di Emergenza",
      description: `Sei sicuro di voler eliminare il contatto "${contactName}"? Questa azione non può essere annullata.`,
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('emergency_contacts')
            .delete()
            .eq('id', contactId);

          if (error) throw error;

          toast({
            title: "Successo",
            description: "Contatto eliminato con successo"
          });
          fetchHealthData();
        } catch (error) {
          console.error('Error deleting contact:', error);
          toast({
            title: "Errore",
            description: "Impossibile eliminare il contatto",
            variant: "destructive"
          });
        }
      }
    });
  };

  const handleDeleteInsurance = (insuranceId: string, providerName: string) => {
    setConfirmDialog({
      open: true,
      title: "Elimina Assicurazione",
      description: `Sei sicuro di voler eliminare l'assicurazione "${providerName}"? Questa azione non può essere annullata.`,
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('pet_insurance')
            .delete()
            .eq('id', insuranceId);

          if (error) throw error;

          toast({
            title: "Successo",
            description: "Assicurazione eliminata con successo"
          });
          fetchHealthData();
        } catch (error) {
          console.error('Error deleting insurance:', error);
          toast({
            title: "Errore",
            description: "Impossibile eliminare l'assicurazione",
            variant: "destructive"
          });
        }
      }
    });
  };

  const handleAddContact = async () => {
    if (!user || !newContact.name || !newContact.phone) {
      toast({
        title: "Errore",
        description: "Nome e telefono sono obbligatori",
        variant: "destructive"
      });
      return;
    }

    try {
      const contactData = {
        user_id: user.id,
        name: newContact.name,
        contact_type: newContact.contact_type || 'family',
        phone: newContact.phone,
        relationship: newContact.relationship || null,
        email: newContact.email || null,
        notes: newContact.notes || null
      };

      if (editingContact) {
        const { error } = await supabase
          .from('emergency_contacts')
          .update(contactData)
          .eq('id', editingContact.id);
        
        if (error) throw error;
        
        toast({
          title: "Successo",
          description: "Contatto aggiornato con successo"
        });
      } else {
        const { error } = await supabase
          .from('emergency_contacts')
          .insert(contactData);
        
        if (error) throw error;
        
        toast({
          title: "Successo",
          description: "Contatto aggiunto con successo"
        });
      }

      setNewContact({ name: '', contact_type: '', phone: '', relationship: '', email: '', notes: '' });
      setEditingContact(null);
      setShowAddContact(false);
      fetchHealthData();
    } catch (error) {
      console.error('Error saving contact:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare il contatto",
        variant: "destructive"
      });
    }
  };

  const handleAddInsurance = async () => {
    if (!user || !selectedPet || !newInsurance.provider_name || !newInsurance.policy_number) {
      toast({
        title: "Errore",
        description: "Provider e numero polizza sono obbligatori",
        variant: "destructive"
      });
      return;
    }

    try {
      const insuranceData = {
        user_id: user.id,
        pet_id: selectedPet.id,
        provider_name: newInsurance.provider_name,
        policy_number: newInsurance.policy_number,
        policy_type: newInsurance.policy_type || null,
        start_date: newInsurance.start_date || new Date().toISOString().split('T')[0],
        end_date: newInsurance.end_date || null,
        premium_amount: newInsurance.premium_amount ? parseFloat(newInsurance.premium_amount) : null,
        deductible: newInsurance.deductible ? parseFloat(newInsurance.deductible) : null,
        is_active: true
      };

      if (editingInsurance) {
        const { error } = await supabase
          .from('pet_insurance')
          .update(insuranceData)
          .eq('id', editingInsurance.id);
        
        if (error) throw error;
        
        toast({
          title: "Successo",
          description: "Assicurazione aggiornata con successo"
        });
      } else {
        const { error } = await supabase
          .from('pet_insurance')
          .insert(insuranceData);
        
        if (error) throw error;
        
        toast({
          title: "Successo",
          description: "Assicurazione aggiunta con successo"
        });
      }

      setNewInsurance({ provider_name: '', policy_number: '', policy_type: '', start_date: '', end_date: '', premium_amount: '', deductible: '' });
      setEditingInsurance(null);
      setShowAddInsurance(false);
      fetchHealthData();
    } catch (error) {
      console.error('Error saving insurance:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare l'assicurazione",
        variant: "destructive"
      });
    }
  };

  // Calculate health metrics for dashboard
  const getLastCheckup = () => {
    const checkups = medicalRecords.filter(r => r.record_type === 'visita' || r.record_type === 'controllo');
    return checkups.length > 0 ? format(new Date(checkups[0].record_date), 'dd/MM/yyyy') : 'Mai';
  };

  const getNextAppointment = () => {
    const upcomingRecords = medicalRecords.filter(r => new Date(r.record_date) > new Date());
    return upcomingRecords.length > 0 ? format(new Date(upcomingRecords[0].record_date), 'dd/MM/yyyy') : 'Nessuno';
  };

  const getActiveMedicationsCount = () => {
    return medications.filter(m => getMedicationStatus(m) === 'active').length;
  };

  const getDocumentsCount = () => {
    return medicalRecords.length;
  };

  const getHealthScore = async () => {
    // This function is now deprecated - use HealthScoreDisplay and HealthScoreCircle components
    return null;
  };

  if (!selectedPet) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Seleziona un Pet</h3>
            <p className="text-muted-foreground">
              Seleziona un pet dal menu a tendina per visualizzare le informazioni sulla salute e benessere.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary" />
            Salute e Benessere
          </h1>
          <p className="text-muted-foreground">
            Monitora la salute di {selectedPet.name}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard">
            <Activity className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profilo Medico
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" />
            Documenti
          </TabsTrigger>
          <TabsTrigger value="monitoring">
            <Stethoscope className="h-4 w-4 mr-2" />
            Monitoraggio
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="emergency">
            <Siren className="h-4 w-4 mr-2" />
            Emergenze
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Health Score Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Health Score
              </CardTitle>
              <CardDescription>
                Punteggio generale sulla salute di {selectedPet.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                <HealthScoreDisplay 
                  healthMetrics={healthMetrics}
                  medicalRecords={medicalRecords}
                  medications={medications}
                  selectedPet={selectedPet}
                  user={user}
                  addNotification={addNotification}
                />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Ultimo Controllo</p>
                      <p className="font-medium">{getLastCheckup()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Prossimo Appuntamento</p>
                      <p className="font-medium">{getNextAppointment()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Farmaci Attivi</p>
                      <p className="font-medium">{getActiveMedicationsCount()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Documenti Medici</p>
                      <p className="font-medium">{getDocumentsCount()}</p>
                    </div>
                  </div>
                </div>
                
              <HealthScoreCircle 
                healthMetrics={healthMetrics}
                medicalRecords={medicalRecords}
                medications={medications}
                selectedPet={selectedPet}
                user={user}
                addNotification={addNotification}
              />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Nuovo Documento</p>
                    <p className="text-sm text-muted-foreground">Carica un nuovo documento medico</p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => setShowAddDocument(true)}
                    disabled={isUploading}
                    variant="outline"
                  >
                    {isUploading ? 'Caricamento...' : 'Aggiungi'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Pill className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Nuovo Farmaco</p>
                    <p className="text-sm text-muted-foreground">Aggiungi un farmaco attivo</p>
                  </div>
                   <Button 
                    size="sm" 
                    onClick={() => {
                      setEditingMedication(null);
                      setNewMedication({
                        name: '',
                        dosage: '',
                        frequency: '',
                        start_date: '',
                        end_date: '',
                        notes: ''
                      });
                      setShowAddMedication(true);
                    }}
                    variant="outline"
                  >
                    Aggiungi
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Nuova Metrica</p>
                    <p className="text-sm text-muted-foreground">Registra un valore di salute</p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setEditingMetric(null);
                      setNewMetric({
                        metric_type: '',
                        value: '',
                        unit: '',
                        notes: ''
                      });
                      setShowAddMetric(true);
                    }}
                    variant="outline"
                  >
                    Aggiungi
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Medical Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Veterinarians */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Veterinari
                  </CardTitle>
                  <Button 
                    size="sm" 
                    onClick={() => setShowAddVet(true)}
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Aggiungi
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {veterinarians.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Nessun veterinario aggiunto</p>
                ) : (
                  <div className="space-y-3">
                    {veterinarians.map(vet => (
                      <div key={vet.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{vet.name}</p>
                            {vet.is_primary && (
                              <Badge variant="secondary">Primario</Badge>
                            )}
                          </div>
                          {vet.clinic_name && (
                            <p className="text-sm text-muted-foreground">{vet.clinic_name}</p>
                          )}
                          {vet.phone && (
                            <p className="text-sm text-muted-foreground">{vet.phone}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => {
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
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeleteVet(vet.id, vet.name)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Insurance */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Assicurazione
                  </CardTitle>
                  <Button 
                    size="sm" 
                    onClick={() => setShowAddInsurance(true)}
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Aggiungi
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {insurances.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Nessuna assicurazione aggiunta</p>
                ) : (
                  <div className="space-y-3">
                    {insurances.map(insurance => {
                      const status = getInsuranceStatus(insurance);
                      return (
                        <div key={insurance.id} className="p-3 rounded-lg border">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{insurance.provider_name}</p>
                                <Badge variant={
                                  status === 'active' ? 'default' : 
                                  status === 'expiring' ? 'destructive' : 'secondary'
                                }>
                                  {status === 'active' ? 'Attiva' : 
                                   status === 'expiring' ? 'In scadenza' : 'Disattiva'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">Polizza: {insurance.policy_number}</p>
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  setEditingInsurance(insurance);
                                  setNewInsurance({
                                    provider_name: insurance.provider_name,
                                    policy_number: insurance.policy_number,
                                    policy_type: insurance.policy_type || '',
                                    start_date: insurance.start_date,
                                    end_date: insurance.end_date || '',
                                    premium_amount: insurance.premium_amount?.toString() || '',
                                    deductible: insurance.deductible?.toString() || ''
                                  });
                                  setShowAddInsurance(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleDeleteInsurance(insurance.id, insurance.provider_name)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          {insurance.premium_amount && (
                            <p className="text-sm">Premio: €{insurance.premium_amount}/anno</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Medical ID */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Identificazione Medica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="microchip">Numero Microchip *</Label>
                    <Input
                      id="microchip"
                      value={medicalId.microchip}
                      onChange={(e) => setMedicalId(prev => ({ ...prev, microchip: e.target.value }))}
                      placeholder="es. 123456789012345"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bloodType">Gruppo Sanguigno</Label>
                    <Input
                      id="bloodType"
                      value={medicalId.bloodType}
                      onChange={(e) => setMedicalId(prev => ({ ...prev, bloodType: e.target.value }))}
                      placeholder="es. A+, O-, ecc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="allergies">Allergie</Label>
                    <Textarea
                      id="allergies"
                      value={medicalId.allergies}
                      onChange={(e) => setMedicalId(prev => ({ ...prev, allergies: e.target.value }))}
                      placeholder="Liste allergie note"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="medicalConditions">Condizioni Mediche</Label>
                    <Textarea
                      id="medicalConditions"
                      value={medicalId.medicalConditions}
                      onChange={(e) => setMedicalId(prev => ({ ...prev, medicalConditions: e.target.value }))}
                      placeholder="Condizioni mediche croniche"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyNotes">Note di Emergenza</Label>
                    <Textarea
                      id="emergencyNotes"
                      value={medicalId.emergencyNotes}
                      onChange={(e) => setMedicalId(prev => ({ ...prev, emergencyNotes: e.target.value }))}
                      placeholder="Informazioni importanti per emergenze"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vetContact">Veterinario di Riferimento</Label>
                    <Input
                      id="vetContact"
                      value={medicalId.vetContact}
                      onChange={(e) => setMedicalId(prev => ({ ...prev, vetContact: e.target.value }))}
                      placeholder="Nome e telefono del veterinario"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button 
                  onClick={handleSaveMedicalId}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Salva Informazioni
                </Button>
                <Button 
                  variant="outline" 
                  onClick={generateMedicalTag}
                >
                  Crea Tag Medico
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documenti Medici
                  </CardTitle>
                  <CardDescription>
                    Cartelle cliniche, referti e documenti medici
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setShowAddDocument(true)}
                  disabled={isUploading}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isUploading ? 'Caricamento...' : 'Nuovo Documento'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {medicalRecords.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Nessun documento</h3>
                  <p className="text-muted-foreground mb-4">
                    Inizia caricando il primo documento medico per {selectedPet.name}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {medicalRecords.map(record => (
                    <div key={record.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{record.title}</p>
                          <Badge variant="outline">{translateRecordType(record.record_type)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(record.record_date), 'dd MMMM yyyy', { locale: it })}
                        </p>
                        {record.description && (
                          <p className="text-sm text-muted-foreground mt-1">{record.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Attachment button - only show if document_url exists */}
                        {record.document_url && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => window.open(record.document_url, '_blank', 'noopener,noreferrer')}
                            title="Visualizza allegato"
                          >
                            <Paperclip className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {
                            setEditingDocument(record);
                            setNewDocument({
                              title: record.title,
                              description: record.description || '',
                              record_type: record.record_type,
                              record_date: record.record_date,
                              notes: record.notes || ''
                            });
                            // Set uploaded file URL if document has attachment
                            setUploadedFileUrl(record.document_url || null);
                            setShowAddDocument(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDeleteRecord(record.id, record.title)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Active Medications */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5" />
                    Farmaci Attivi
                  </CardTitle>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setEditingMedication(null);
                      setNewMedication({
                        name: '',
                        dosage: '',
                        frequency: '',
                        start_date: '',
                        end_date: '',
                        notes: ''
                      });
                      setShowAddMedication(true);
                    }}
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Aggiungi
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medications.filter(m => getMedicationStatus(m) === 'active').length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">Nessun farmaco attivo</p>
                  ) : (
                    medications.filter(m => getMedicationStatus(m) === 'active').map(med => {
                      const medStatus = getMedicationStatus(med);
                      return (
                        <div key={med.id} className="p-3 rounded-lg border">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{med.name}</p>
                                <Badge variant={medStatus === 'active' ? 'default' : 'secondary'}>
                                  {medStatus === 'active' ? 'Attivo' : 'Disattivo'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {med.dosage} - {med.frequency}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Dal {format(new Date(med.start_date), 'dd/MM/yyyy')}
                                {med.end_date && ` al ${format(new Date(med.end_date), 'dd/MM/yyyy')}`}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  setEditingMedication(med);
                                  setNewMedication({
                                    name: med.name,
                                    dosage: med.dosage,
                                    frequency: med.frequency,
                                    start_date: med.start_date,
                                    end_date: med.end_date || '',
                                    notes: med.notes || ''
                                  });
                                  setShowAddMedication(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleDeleteMedication(med.id, med.name)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          {med.notes && (
                            <Alert>
                              <AlertDescription className="text-sm">
                                {med.notes}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Latest Metrics */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Ultime Metriche
                  </CardTitle>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setEditingMetric(null);
                      setNewMetric({
                        metric_type: '',
                        value: '',
                        unit: '',
                        notes: ''
                      });
                      setShowAddMetric(true);
                    }}
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Aggiungi
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {healthMetrics.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Nessuna metrica registrata</p>
                ) : (
                  <div className="space-y-3">
                     {healthMetrics.slice(0, 5).map(metric => (
                       <div key={metric.id} className="flex items-center justify-between p-3 rounded-lg border">
                         <div className="flex-1">
                           <div className="flex items-center gap-2">
                             <p className="font-medium">{translateMetricType(metric.metric_type)}</p>
                           </div>
                            <p className="text-sm text-muted-foreground">
                              {metric.metric_type === 'gum_color' 
                                ? getGumColorText(metric.value) 
                                : `${metric.value} ${metric.unit}`}
                            </p>
                           <p className="text-sm text-muted-foreground">
                             {format(new Date(metric.recorded_at), 'dd/MM/yyyy HH:mm')}
                           </p>
                         </div>
                         <div className="flex gap-1">
                           <Button 
                             size="sm" 
                             variant="ghost"
                             onClick={() => {
                               setEditingMetric(metric);
                                setNewMetric({
                                  metric_type: metric.metric_type,
                                  value: metric.metric_type === 'gum_color' 
                                    ? getGumColorText(metric.value) 
                                    : metric.value.toString(),
                                  unit: metric.unit || '',
                                  notes: metric.notes || ''
                                });
                               setShowAddMetric(true);
                             }}
                           >
                             <Edit className="h-4 w-4" />
                           </Button>
                           <Button 
                             size="sm" 
                             variant="ghost"
                             onClick={() => handleDeleteMetric(metric.id, translateMetricType(metric.metric_type))}
                           >
                             <Trash2 className="h-4 w-4 text-destructive" />
                           </Button>
                         </div>
                       </div>
                     ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Health Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trend Salute Generale
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const trendData = generateHealthTrendData();
                  const hasData = trendData.some(d => d.score !== null);
                  
                  if (!hasData) {
                    return (
                      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        <div className="text-center">
                          <div className="text-lg font-medium mb-2">Nessun dato disponibile</div>
                          <p className="text-sm">Aggiungi metriche sanitarie per vedere il trend della salute</p>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Visit Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Distribuzione Visite
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const visitData = generateVisitDistribution();
                  
                  if (visitData.length === 0) {
                    return (
                      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        <div className="text-center">
                          <div className="text-lg font-medium mb-2">Nessuna visita registrata</div>
                          <p className="text-sm">Aggiungi visite mediche per vedere la distribuzione</p>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={visitData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {visitData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  );
                })()}
              </CardContent>
            </Card>
          </div>

          {/* Analytics Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Correlazioni Salute-Umore</CardTitle>
              </CardHeader>
              <CardContent>
                {healthMetrics.length > 0 ? (
                  <>
                    <div className="text-2xl font-bold">
                      {Math.round((healthMetrics.filter(m => m.value > 7).length / healthMetrics.length) * 100)}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Correlazione tra visite regolari e metriche sanitarie positive
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-lg text-muted-foreground">Non disponibile</div>
                    <p className="text-sm text-muted-foreground">
                      Aggiungi metriche sanitarie per vedere le correlazioni
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Pattern Stagionali</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const seasonalData = medicalRecords.reduce((acc, record) => {
                    const month = new Date(record.record_date).getMonth();
                    const season = month >= 2 && month <= 4 ? 'Primavera' :
                                 month >= 5 && month <= 7 ? 'Estate' :
                                 month >= 8 && month <= 10 ? 'Autunno' : 'Inverno';
                    acc[season] = (acc[season] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);
                  
                  const mostActiveSeason = Object.entries(seasonalData)
                    .sort(([,a], [,b]) => b - a)[0];
                  
                  return mostActiveSeason ? (
                    <>
                      <div className="text-2xl font-bold">{mostActiveSeason[0]}</div>
                      <p className="text-sm text-muted-foreground">
                        Periodo con maggior numero di controlli ({mostActiveSeason[1]} visite)
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-lg text-muted-foreground">Non disponibile</div>
                      <p className="text-sm text-muted-foreground">
                        Aggiungi più visite per vedere i pattern stagionali
                      </p>
                    </>
                  );
                })()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Efficacia Farmaci</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const totalMedications = medications.length;
                  const completedMedications = medications.filter(m => 
                    !m.is_active && m.end_date
                  ).length;
                  
                  if (totalMedications === 0) {
                    return (
                      <>
                        <div className="text-lg text-muted-foreground">Non disponibile</div>
                        <p className="text-sm text-muted-foreground">
                          Aggiungi farmaci per vedere l'efficacia delle terapie
                        </p>
                      </>
                    );
                  }
                  
                  const successRate = Math.round((completedMedications / totalMedications) * 100);
                  
                  return (
                    <>
                      <div className="text-2xl font-bold">{successRate}%</div>
                      <p className="text-sm text-muted-foreground">
                        Tasso di completamento delle terapie farmacologiche ({completedMedications}/{totalMedications})
                      </p>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Emergency Tab */}
        <TabsContent value="emergency" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Emergency Contacts */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <PhoneCall className="h-5 w-5" />
                    Contatti di Emergenza
                  </CardTitle>
                  <Button 
                    size="sm" 
                    onClick={() => setShowAddContact(true)}
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Aggiungi
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {emergencyContacts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Nessun contatto di emergenza</p>
                ) : (
                  <div className="space-y-3">
                    {emergencyContacts.map(contact => (
                      <div key={contact.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{contact.name}</p>
                            <Badge variant="outline">{contact.contact_type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{contact.phone}</p>
                          {contact.relationship && (
                            <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => window.open(`tel:${contact.phone}`, '_self')}
                          >
                            <PhoneCall className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => {
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
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeleteContact(contact.id, contact.name)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Emergency Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Siren className="h-5 w-5" />
                  Azioni di Emergenza
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="destructive" 
                    className="w-full justify-start"
                    onClick={() => {
                      const primaryVet = veterinarians.find(v => v.is_primary);
                      if (primaryVet?.phone) {
                        window.open(`tel:${primaryVet.phone}`, '_self');
                      } else {
                        toast({
                          title: "Nessun veterinario",
                          description: "Aggiungi un veterinario primario per chiamate di emergenza",
                          variant: "destructive"
                        });
                      }
                    }}
                  >
                    <PhoneCall className="h-4 w-4 mr-2" />
                    Chiama Veterinario
                  </Button>
                  
                   <Button 
                     variant="outline" 
                     className="w-full justify-start"
                     onClick={() => setShowFirstAidGuide(true)}
                     data-testid="first-aid-guide-button"
                   >
                     <Heart className="h-4 w-4 mr-2" />
                     Guida Primo Soccorso Veterinario
                   </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      const message = `EMERGENZA VETERINARIA
${selectedPet.name} - ${selectedPet.type}
Microchip: ${medicalId.microchip}
Posizione: [Inserire posizione]
Descrizione emergenza: [Inserire descrizione]

Contatti:
${emergencyContacts.map(c => `${c.name}: ${c.phone}`).join('\n')}`;
                      
                      navigator.clipboard.writeText(message);
                      toast({
                        title: "Copiato",
                        description: "Messaggio di emergenza copiato negli appunti"
                      });
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Messaggio di Emergenza
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      window.open('https://maps.google.com/?q=veterinario+emergenza+near+me', '_blank');
                    }}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Veterinari Vicini
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

      </Tabs>

      {/* Add Document Dialog */}
      <Dialog open={showAddDocument} onOpenChange={setShowAddDocument}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDocument ? 'Modifica Documento' : 'Nuovo Documento Medico'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Titolo *</Label>
                <Input
                  id="title"
                  value={newDocument.title}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="es. Visita di controllo"
                />
              </div>
              <div>
                <Label htmlFor="record_type">Tipo Documento</Label>
                <Select value={newDocument.record_type} onValueChange={(value) => setNewDocument(prev => ({ ...prev, record_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona tipo" />
                  </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visita">Visita</SelectItem>
                  <SelectItem value="esame">Esame</SelectItem>
                  <SelectItem value="vaccino">Vaccino</SelectItem>
                  <SelectItem value="operazione">Operazione</SelectItem>
                  <SelectItem value="documento">Documento</SelectItem>
                  <SelectItem value="analisi">Analisi</SelectItem>
                  <SelectItem value="trattamento">Trattamento</SelectItem>
                  <SelectItem value="emergenza">Emergenza</SelectItem>
                  <SelectItem value="altro">Altro</SelectItem>
                </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="record_date">Data</Label>
              <Input
                id="record_date"
                type="date"
                value={newDocument.record_date}
                onChange={(e) => setNewDocument(prev => ({ ...prev, record_date: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="description">Descrizione</Label>
              <Textarea
                id="description"
                value={newDocument.description}
                onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrizione del documento"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Note</Label>
              <Textarea
                id="notes"
                value={newDocument.notes}
                onChange={(e) => setNewDocument(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Note aggiuntive"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="file">Carica File (opzionale)</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                <div className="space-y-2">
                  <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                  <div>
                    <label htmlFor="file" className="cursor-pointer">
                      <span className="text-primary font-medium hover:text-primary/80">Clicca per selezionare</span>
                      <span className="text-muted-foreground"> o trascina qui il file</span>
                    </label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleUploadDocument(file);
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    PDF, JPG, PNG, DOC, DOCX fino a 10MB
                  </p>
                </div>
              </div>
              {isUploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Caricamento file in corso...
                </div>
              )}
              
              {/* File Preview */}
              {uploadedFileUrl && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        File caricato con successo
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(uploadedFileUrl, '_blank', 'noopener,noreferrer')}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Visualizza
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 pt-4 border-t">
              <Button 
                onClick={() => {
                  setShowAddDocument(false);
                  setEditingDocument(null);
                  setNewDocument({ title: '', description: '', record_type: '', record_date: '', notes: '' });
                  setUploadedFileUrl(null); // Clear uploaded file URL
                }} 
                variant="outline"
                disabled={isUploading}
                className="flex-1"
              >
                Annulla
              </Button>
              <Button 
                onClick={handleSaveDocumentOnly}
                disabled={isUploading || !newDocument.title.trim()}
                className="flex-1"
              >
                {isUploading ? 'Salvando...' : editingDocument ? 'Aggiorna' : 'Salva'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* First Aid Guide Dialog */}
      <FirstAidGuide 
        open={showFirstAidGuide} 
        onOpenChange={setShowFirstAidGuide} 
      />

      {/* Add Medication Dialog */}
      <Dialog open={showAddMedication} onOpenChange={setShowAddMedication}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMedication ? 'Modifica Farmaco' : 'Nuovo Farmaco'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="med_name">Nome Farmaco *</Label>
              <Input
                id="med_name"
                value={newMedication.name}
                onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                placeholder="es. Antibiotico"
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
              <Input
                id="frequency"
                value={newMedication.frequency}
                onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))}
                placeholder="es. 2 volte al giorno"
              />
            </div>
            <div>
              <Label htmlFor="start_date">Data Inizio</Label>
              <Input
                id="start_date"
                type="date"
                value={newMedication.start_date}
                onChange={(e) => setNewMedication(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="end_date">Data Fine (opzionale)</Label>
              <Input
                id="end_date"
                type="date"
                value={newMedication.end_date}
                onChange={(e) => setNewMedication(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="med_notes">Note</Label>
              <Textarea
                id="med_notes"
                value={newMedication.notes}
                onChange={(e) => setNewMedication(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Note aggiuntive"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={() => {
                setShowAddMedication(false);
                setEditingMedication(null);
                setNewMedication({ name: '', dosage: '', frequency: '', start_date: '', end_date: '', notes: '' });
              }} 
              variant="outline"
            >
              Annulla
            </Button>
            <Button onClick={handleAddMedication}>
              {editingMedication ? 'Aggiorna' : 'Salva'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Metric Dialog */}
      <Dialog open={showAddMetric} onOpenChange={setShowAddMetric}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMetric ? 'Modifica Metrica' : 'Nuova Metrica Salute'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="metric_type">Tipo Metrica *</Label>
              <Select 
                value={newMetric.metric_type} 
                onValueChange={(value) => {
                  // Auto-imposta l'unità di misura in base al tipo
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
                    value: value === 'gum_color' ? '' : prev.value // Reset valore per colore gengive
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
            <div>
              <Label htmlFor="value">Valore *</Label>
              {newMetric.metric_type === 'gum_color' ? (
                <Select 
                  value={newMetric.value} 
                  onValueChange={(value) => setNewMetric(prev => ({ ...prev, value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona colore" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rosa">Rosa</SelectItem>
                    <SelectItem value="Pallide">Pallide</SelectItem>
                    <SelectItem value="Blu/Viola">Blu/Viola</SelectItem>
                    <SelectItem value="Gialle">Gialle</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="value"
                  type="number"
                  step="0.1"
                  value={newMetric.value}
                  onChange={(e) => setNewMetric(prev => ({ ...prev, value: e.target.value }))}
                  placeholder={
                    newMetric.metric_type === 'temperature' ? 'es. 38.5' :
                    newMetric.metric_type === 'heart_rate' ? 'es. 80' :
                    newMetric.metric_type === 'respiration' ? 'es. 20' : 'Inserisci valore'
                  }
                />
              )}
            </div>
            {newMetric.metric_type !== 'gum_color' && (
              <div>
                <Label htmlFor="unit">Unità di Misura</Label>
                <Input
                  id="unit"
                  value={newMetric.unit}
                  disabled
                  placeholder="Automatica"
                />
              </div>
            )}
            <div>
              <Label htmlFor="metric_notes">Note</Label>
              <Textarea
                id="metric_notes"
                value={newMetric.notes}
                onChange={(e) => setNewMetric(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Note aggiuntive"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={() => {
                setShowAddMetric(false);
                setEditingMetric(null);
                setNewMetric({ metric_type: '', value: '', unit: '', notes: '' });
              }} 
              variant="outline"
            >
              Annulla
            </Button>
            <Button onClick={handleAddMetric}>
              {editingMetric ? 'Aggiorna' : 'Salva'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Emergency Contact Dialog */}
      <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingContact ? 'Modifica Contatto' : 'Nuovo Contatto di Emergenza'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="contact_name">Nome *</Label>
              <Input
                id="contact_name"
                value={newContact.name}
                onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                placeholder="es. Mario Rossi"
              />
            </div>
            <div>
              <Label htmlFor="contact_phone">Telefono *</Label>
              <Input
                id="contact_phone"
                type="tel"
                value={newContact.phone}
                onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="es. +39 123 456 7890"
              />
            </div>
            <div>
              <Label htmlFor="contact_type">Tipo Contatto</Label>
              <Select value={newContact.contact_type} onValueChange={(value) => setNewContact(prev => ({ ...prev, contact_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="family">Famiglia</SelectItem>
                  <SelectItem value="friend">Amico</SelectItem>
                  <SelectItem value="vet">Veterinario</SelectItem>
                  <SelectItem value="other">Altro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="relationship">Relazione</Label>
              <Input
                id="relationship"
                value={newContact.relationship}
                onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                placeholder="es. Fratello, Vicino"
              />
            </div>
            <div>
              <Label htmlFor="contact_email">Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={newContact.email}
                onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                placeholder="es. mario@email.com"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={() => {
                setShowAddContact(false);
                setEditingContact(null);
                setNewContact({ name: '', contact_type: '', phone: '', relationship: '', email: '', notes: '' });
              }} 
              variant="outline"
            >
              Annulla
            </Button>
            <Button onClick={handleAddContact}>
              {editingContact ? 'Aggiorna' : 'Salva'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Insurance Dialog */}
      <Dialog open={showAddInsurance} onOpenChange={setShowAddInsurance}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingInsurance ? 'Modifica Assicurazione' : 'Nuova Assicurazione'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="provider_name">Provider *</Label>
              <Input
                id="provider_name"
                value={newInsurance.provider_name}
                onChange={(e) => setNewInsurance(prev => ({ ...prev, provider_name: e.target.value }))}
                placeholder="es. Assicurazioni Generali"
              />
            </div>
            <div>
              <Label htmlFor="policy_number">Numero Polizza *</Label>
              <Input
                id="policy_number"
                value={newInsurance.policy_number}
                onChange={(e) => setNewInsurance(prev => ({ ...prev, policy_number: e.target.value }))}
                placeholder="es. POL123456789"
              />
            </div>
            <div>
              <Label htmlFor="policy_type">Tipo Polizza</Label>
              <Select value={newInsurance.policy_type} onValueChange={(value) => setNewInsurance(prev => ({ ...prev, policy_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Base</SelectItem>
                  <SelectItem value="comprehensive">Completa</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="insurance_start_date">Data Inizio</Label>
              <Input
                id="insurance_start_date"
                type="date"
                value={newInsurance.start_date}
                onChange={(e) => setNewInsurance(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="insurance_end_date">Data Fine</Label>
              <Input
                id="insurance_end_date"
                type="date"
                value={newInsurance.end_date}
                onChange={(e) => setNewInsurance(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="premium_amount">Premio Annuale (€)</Label>
              <Input
                id="premium_amount"
                type="number"
                step="0.01"
                value={newInsurance.premium_amount}
                onChange={(e) => setNewInsurance(prev => ({ ...prev, premium_amount: e.target.value }))}
                placeholder="es. 250.00"
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
                placeholder="es. 100.00"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={() => {
                setShowAddInsurance(false);
                setEditingInsurance(null);
                setNewInsurance({ provider_name: '', policy_number: '', policy_type: '', start_date: '', end_date: '', premium_amount: '', deductible: '' });
              }} 
              variant="outline"
            >
              Annulla
            </Button>
            <Button onClick={handleAddInsurance}>
              {editingInsurance ? 'Aggiorna' : 'Salva'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Veterinarian Dialog */}
      <Dialog open={showAddVet} onOpenChange={setShowAddVet}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingVet ? 'Modifica Veterinario' : 'Nuovo Veterinario'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="vet_name">Nome *</Label>
              <Input
                id="vet_name"
                value={newVet.name}
                onChange={(e) => setNewVet(prev => ({ ...prev, name: e.target.value }))}
                placeholder="es. Dr. Mario Rossi"
              />
            </div>
            <div>
              <Label htmlFor="clinic_name">Nome Clinica</Label>
              <Input
                id="clinic_name"
                value={newVet.clinic_name}
                onChange={(e) => setNewVet(prev => ({ ...prev, clinic_name: e.target.value }))}
                placeholder="es. Clinica Veterinaria Roma"
              />
            </div>
            <div>
              <Label htmlFor="vet_phone">Telefono</Label>
              <Input
                id="vet_phone"
                type="tel"
                value={newVet.phone}
                onChange={(e) => setNewVet(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="es. +39 123 456 7890"
              />
            </div>
            <div>
              <Label htmlFor="vet_email">Email</Label>
              <Input
                id="vet_email"
                type="email"
                value={newVet.email}
                onChange={(e) => setNewVet(prev => ({ ...prev, email: e.target.value }))}
                placeholder="es. vet@clinica.com"
              />
            </div>
            <div>
              <Label htmlFor="vet_address">Indirizzo</Label>
              <Input
                id="vet_address"
                value={newVet.address}
                onChange={(e) => setNewVet(prev => ({ ...prev, address: e.target.value }))}
                placeholder="es. Via Roma 123, Milano"
              />
            </div>
            <div>
              <Label htmlFor="specialization">Specializzazione</Label>
              <Input
                id="specialization"
                value={newVet.specialization}
                onChange={(e) => setNewVet(prev => ({ ...prev, specialization: e.target.value }))}
                placeholder="es. Cardiologia, Neurologia"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_primary"
                checked={newVet.is_primary}
                onCheckedChange={(checked) => setNewVet(prev => ({ ...prev, is_primary: !!checked }))}
              />
              <Label htmlFor="is_primary">Veterinario primario (per emergenze)</Label>
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={() => {
                setShowAddVet(false);
                setEditingVet(null);
                setNewVet({ name: '', clinic_name: '', phone: '', email: '', address: '', specialization: '', is_primary: false });
              }} 
              variant="outline"
            >
              Annulla
            </Button>
            <Button onClick={handleAddVet}>
              {editingVet ? 'Aggiorna' : 'Salva'}
            </Button>
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

export default WellnessPage;