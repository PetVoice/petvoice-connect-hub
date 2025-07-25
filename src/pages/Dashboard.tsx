import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
import { DiaryEntry } from '@/types/diary';

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
        // Fetch all data needed for health score calculation
        const [
          healthMetricsRes,
          medicalRecordsRes,
          medicationsRes,
          diaryEntriesRes,
          analysesRes
        ] = await Promise.all([
          supabase
            .from('health_metrics')
            .select('*')
            .eq('user_id', user.id)
            .eq('pet_id', selectedPet.id),
          supabase
            .from('medical_records')
            .select('*')
            .eq('user_id', user.id)
            .eq('pet_id', selectedPet.id),
          supabase
            .from('medications')
            .select('*')
            .eq('user_id', user.id)
            .eq('pet_id', selectedPet.id),
          supabase
            .from('diary_entries')
            .select('*')
            .eq('user_id', user.id)
            .eq('pet_id', selectedPet.id),
          supabase
            .from('pet_analyses')
            .select('*')
            .eq('user_id', user.id)
            .eq('pet_id', selectedPet.id)
        ]);

        const result = await calculateUnifiedHealthScore(selectedPet.id, user.id, {
          healthMetrics: healthMetricsRes.data || [],
          medicalRecords: medicalRecordsRes.data || [],
          medications: medicationsRes.data || [],
          analyses: analysesRes.data || [],
          diaryEntries: diaryEntriesRes.data || [],
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

const Dashboard = () => {
  const { user } = useAuth();
  const { pets } = usePets();
  const { addNotification } = useNotifications();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data states
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [insurance, setInsurance] = useState<Insurance[]>([]);
  const [loading, setLoading] = useState(false);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [wellnessData, setWellnessData] = useState<any[]>([]);

  // UI states
  const [showMetricDialog, setShowMetricDialog] = useState(false);
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [showMedicationDialog, setShowMedicationDialog] = useState(false);
  const [showVetDialog, setShowVetDialog] = useState(false);
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [showInsuranceDialog, setShowInsuranceDialog] = useState(false);
  const [showDiaryDialog, setShowDiaryDialog] = useState(false);
  const [showFirstAidGuide, setShowFirstAidGuide] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState('');
  
  // Form states for editing
  const [editingMetric, setEditingMetric] = useState<HealthMetric | null>(null);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [editingVet, setEditingVet] = useState<Veterinarian | null>(null);
  const [editingEmergency, setEditingEmergency] = useState<EmergencyContact | null>(null);
  const [editingInsurance, setEditingInsurance] = useState<Insurance | null>(null);

  // Form data states
  const [metricForm, setMetricForm] = useState({
    metric_type: '',
    value: '',
    unit: '',
    recorded_at: '',
    notes: ''
  });

  const [recordForm, setRecordForm] = useState({
    title: '',
    description: '',
    record_type: '',
    record_date: '',
    cost: '',
    notes: '',
    veterinarian_name: '',
    clinic_name: ''
  });

  const [medicationForm, setMedicationForm] = useState({
    name: '',
    dosage: '',
    frequency: '',
    start_date: '',
    end_date: '',
    notes: ''
  });

  const [vetForm, setVetForm] = useState({
    name: '',
    clinic_name: '',
    phone: '',
    email: '',
    address: '',
    specialization: '',
    is_primary: false
  });

  const [emergencyForm, setEmergencyForm] = useState({
    name: '',
    contact_type: 'family',
    phone: '',
    relationship: '',
    email: '',
    notes: '',
    is_primary: false
  });

  const [insuranceForm, setInsuranceForm] = useState({
    provider_name: '',
    policy_number: '',
    policy_type: '',
    start_date: '',
    end_date: '',
    premium_amount: '',
    deductible: '',
    is_active: true
  });

  // Filter states
  const [metricFilter, setMetricFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30');
  const [showNearbyVets, setShowNearbyVets] = useState(false);
  const [nearbyVets, setNearbyVets] = useState<any[]>([]);

  const selectedPet = pets.find(p => p.id === searchParams.get('petId')) || pets[0];

  // Reset form function
  const resetForms = () => {
    setMetricForm({
      metric_type: '',
      value: '',
      unit: '',
      recorded_at: '',
      notes: ''
    });
    setRecordForm({
      title: '',
      description: '',
      record_type: '',
      record_date: '',
      cost: '',
      notes: '',
      veterinarian_name: '',
      clinic_name: ''
    });
    setMedicationForm({
      name: '',
      dosage: '',
      frequency: '',
      start_date: '',
      end_date: '',
      notes: ''
    });
    setVetForm({
      name: '',
      clinic_name: '',
      phone: '',
      email: '',
      address: '',
      specialization: '',
      is_primary: false
    });
    setEmergencyForm({
      name: '',
      contact_type: 'family',
      phone: '',
      relationship: '',
      email: '',
      notes: '',
      is_primary: false
    });
    setInsuranceForm({
      provider_name: '',
      policy_number: '',
      policy_type: '',
      start_date: '',
      end_date: '',
      premium_amount: '',
      deductible: '',
      is_active: true
    });
    setEditingMetric(null);
    setEditingRecord(null);
    setEditingMedication(null);
    setEditingVet(null);
    setEditingEmergency(null);
    setEditingInsurance(null);
  };

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    if (!user || !selectedPet) return;

    setLoading(true);
    try {
      const [
        metricsRes,
        recordsRes,
        medicationsRes,
        vetsRes,
        emergencyRes,
        insuranceRes,
        diaryRes,
        wellnessRes
      ] = await Promise.all([
        supabase.from('health_metrics').select('*').eq('user_id', user.id).eq('pet_id', selectedPet.id).order('recorded_at', { ascending: false }),
        supabase.from('medical_records').select('*').eq('user_id', user.id).eq('pet_id', selectedPet.id).order('record_date', { ascending: false }),
        supabase.from('medications').select('*').eq('user_id', user.id).eq('pet_id', selectedPet.id).order('created_at', { ascending: false }),
        supabase.from('veterinarians').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('emergency_contacts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('insurance_policies').select('*').eq('user_id', user.id).eq('pet_id', selectedPet.id).order('created_at', { ascending: false }),
        supabase.from('diary_entries').select('*').eq('user_id', user.id).eq('pet_id', selectedPet.id).order('entry_date', { ascending: false }),
        supabase.from('pet_wellness_scores').select('*').eq('user_id', user.id).eq('pet_id', selectedPet.id).order('recorded_at', { ascending: false })
      ]);

      setHealthMetrics(metricsRes.data || []);
      setMedicalRecords(recordsRes.data || []);
      setMedications(medicationsRes.data || []);
      setVeterinarians(vetsRes.data || []);
      setEmergencyContacts(emergencyRes.data || []);
      setInsurance(insuranceRes.data || []);
      setDiaryEntries(diaryRes.data || []);
      setWellnessData(wellnessRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento dei dati.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, selectedPet]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Health metric functions
  const handleAddMetric = async () => {
    if (!user || !selectedPet) return;

    try {
      const metricData = {
        user_id: user.id,
        pet_id: selectedPet.id,
        metric_type: metricForm.metric_type,
        value: parseFloat(metricForm.value),
        unit: metricForm.unit || getMetricUnit(metricForm.metric_type),
        recorded_at: metricForm.recorded_at,
        notes: metricForm.notes
      };

      const { error } = await supabase.from('health_metrics').insert([metricData]);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Parametro vitale aggiunto con successo."
      });

      setShowMetricDialog(false);
      resetForms();
      fetchAllData();
    } catch (error) {
      console.error('Error adding metric:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiunta del parametro vitale.",
        variant: "destructive"
      });
    }
  };

  const handleEditMetric = async () => {
    if (!editingMetric) return;

    try {
      const { error } = await supabase
        .from('health_metrics')
        .update({
          metric_type: metricForm.metric_type,
          value: parseFloat(metricForm.value),
          unit: metricForm.unit || getMetricUnit(metricForm.metric_type),
          recorded_at: metricForm.recorded_at,
          notes: metricForm.notes
        })
        .eq('id', editingMetric.id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Parametro vitale aggiornato con successo."
      });

      setShowMetricDialog(false);
      resetForms();
      fetchAllData();
    } catch (error) {
      console.error('Error updating metric:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento del parametro vitale.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMetric = async (id: string) => {
    try {
      const { error } = await supabase.from('health_metrics').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: "Successo",
        description: "Parametro vitale eliminato con successo."
      });
      fetchAllData();
    } catch (error) {
      console.error('Error deleting metric:', error);
      toast({
        title: "Errore",
        description: "Errore nell'eliminazione del parametro vitale.",
        variant: "destructive"
      });
    }
  };

  // Medical record functions
  const handleAddRecord = async () => {
    if (!user || !selectedPet) return;

    try {
      const recordData = {
        user_id: user.id,
        pet_id: selectedPet.id,
        title: recordForm.title,
        description: recordForm.description,
        record_type: recordForm.record_type,
        record_date: recordForm.record_date,
        cost: recordForm.cost ? parseFloat(recordForm.cost) : null,
        notes: recordForm.notes,
        veterinarian: recordForm.veterinarian_name ? {
          name: recordForm.veterinarian_name,
          clinic_name: recordForm.clinic_name
        } : null
      };

      const { error } = await supabase.from('medical_records').insert([recordData]);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Cartella clinica aggiunta con successo."
      });

      setShowRecordDialog(false);
      resetForms();
      fetchAllData();
    } catch (error) {
      console.error('Error adding record:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiunta della cartella clinica.",
        variant: "destructive"
      });
    }
  };

  const handleEditRecord = async () => {
    if (!editingRecord) return;

    try {
      const { error } = await supabase
        .from('medical_records')
        .update({
          title: recordForm.title,
          description: recordForm.description,
          record_type: recordForm.record_type,
          record_date: recordForm.record_date,
          cost: recordForm.cost ? parseFloat(recordForm.cost) : null,
          notes: recordForm.notes,
          veterinarian: recordForm.veterinarian_name ? {
            name: recordForm.veterinarian_name,
            clinic_name: recordForm.clinic_name
          } : null
        })
        .eq('id', editingRecord.id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Cartella clinica aggiornata con successo."
      });

      setShowRecordDialog(false);
      resetForms();
      fetchAllData();
    } catch (error) {
      console.error('Error updating record:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento della cartella clinica.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      const { error } = await supabase.from('medical_records').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: "Successo",
        description: "Cartella clinica eliminata con successo."
      });
      fetchAllData();
    } catch (error) {
      console.error('Error deleting record:', error);
      toast({
        title: "Errore",
        description: "Errore nell'eliminazione della cartella clinica.",
        variant: "destructive"
      });
    }
  };

  // Medication functions
  const handleAddMedication = async () => {
    if (!user || !selectedPet) return;

    try {
      const medicationData = {
        user_id: user.id,
        pet_id: selectedPet.id,
        name: medicationForm.name,
        dosage: medicationForm.dosage,
        frequency: medicationForm.frequency,
        start_date: medicationForm.start_date,
        end_date: medicationForm.end_date || null,
        is_active: !medicationForm.end_date || new Date(medicationForm.end_date) > new Date(),
        notes: medicationForm.notes
      };

      const { error } = await supabase.from('medications').insert([medicationData]);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Farmaco aggiunto con successo."
      });

      setShowMedicationDialog(false);
      resetForms();
      fetchAllData();
    } catch (error) {
      console.error('Error adding medication:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiunta del farmaco.",
        variant: "destructive"
      });
    }
  };

  const handleEditMedication = async () => {
    if (!editingMedication) return;

    try {
      const { error } = await supabase
        .from('medications')
        .update({
          name: medicationForm.name,
          dosage: medicationForm.dosage,
          frequency: medicationForm.frequency,
          start_date: medicationForm.start_date,
          end_date: medicationForm.end_date || null,
          is_active: !medicationForm.end_date || new Date(medicationForm.end_date) > new Date(),
          notes: medicationForm.notes
        })
        .eq('id', editingMedication.id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Farmaco aggiornato con successo."
      });

      setShowMedicationDialog(false);
      resetForms();
      fetchAllData();
    } catch (error) {
      console.error('Error updating medication:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento del farmaco.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMedication = async (id: string) => {
    try {
      const { error } = await supabase.from('medications').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: "Successo",
        description: "Farmaco eliminato con successo."
      });
      fetchAllData();
    } catch (error) {
      console.error('Error deleting medication:', error);
      toast({
        title: "Errore",
        description: "Errore nell'eliminazione del farmaco.",
        variant: "destructive"
      });
    }
  };

  // Veterinarian functions
  const handleAddVet = async () => {
    if (!user) return;

    try {
      const vetData = {
        user_id: user.id,
        name: vetForm.name,
        clinic_name: vetForm.clinic_name,
        phone: vetForm.phone,
        email: vetForm.email,
        address: vetForm.address,
        specialization: vetForm.specialization,
        is_primary: vetForm.is_primary
      };

      const { error } = await supabase.from('veterinarians').insert([vetData]);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Veterinario aggiunto con successo."
      });

      setShowVetDialog(false);
      resetForms();
      fetchAllData();
    } catch (error) {
      console.error('Error adding vet:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiunta del veterinario.",
        variant: "destructive"
      });
    }
  };

  const handleEditVet = async () => {
    if (!editingVet) return;

    try {
      const { error } = await supabase
        .from('veterinarians')
        .update({
          name: vetForm.name,
          clinic_name: vetForm.clinic_name,
          phone: vetForm.phone,
          email: vetForm.email,
          address: vetForm.address,
          specialization: vetForm.specialization,
          is_primary: vetForm.is_primary
        })
        .eq('id', editingVet.id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Veterinario aggiornato con successo."
      });

      setShowVetDialog(false);
      resetForms();
      fetchAllData();
    } catch (error) {
      console.error('Error updating vet:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento del veterinario.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteVet = async (id: string) => {
    try {
      const { error } = await supabase.from('veterinarians').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: "Successo",
        description: "Veterinario eliminato con successo."
      });
      fetchAllData();
    } catch (error) {
      console.error('Error deleting vet:', error);
      toast({
        title: "Errore",
        description: "Errore nell'eliminazione del veterinario.",
        variant: "destructive"
      });
    }
  };

  // Emergency contact functions
  const handleAddEmergency = async () => {
    if (!user) return;

    try {
      const emergencyData = {
        user_id: user.id,
        name: emergencyForm.name,
        contact_type: emergencyForm.contact_type,
        phone: emergencyForm.phone,
        relationship: emergencyForm.relationship,
        email: emergencyForm.email,
        notes: emergencyForm.notes,
        is_primary: emergencyForm.is_primary
      };

      const { error } = await supabase.from('emergency_contacts').insert([emergencyData]);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Contatto di emergenza aggiunto con successo."
      });

      setShowEmergencyDialog(false);
      resetForms();
      fetchAllData();
    } catch (error) {
      console.error('Error adding emergency contact:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiunta del contatto di emergenza.",
        variant: "destructive"
      });
    }
  };

  const handleEditEmergency = async () => {
    if (!editingEmergency) return;

    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .update({
          name: emergencyForm.name,
          contact_type: emergencyForm.contact_type,
          phone: emergencyForm.phone,
          relationship: emergencyForm.relationship,
          email: emergencyForm.email,
          notes: emergencyForm.notes,
          is_primary: emergencyForm.is_primary
        })
        .eq('id', editingEmergency.id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Contatto di emergenza aggiornato con successo."
      });

      setShowEmergencyDialog(false);
      resetForms();
      fetchAllData();
    } catch (error) {
      console.error('Error updating emergency contact:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento del contatto di emergenza.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEmergency = async (id: string) => {
    try {
      const { error } = await supabase.from('emergency_contacts').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: "Successo",
        description: "Contatto di emergenza eliminato con successo."
      });
      fetchAllData();
    } catch (error) {
      console.error('Error deleting emergency contact:', error);
      toast({
        title: "Errore",
        description: "Errore nell'eliminazione del contatto di emergenza.",
        variant: "destructive"
      });
    }
  };

  // Insurance functions
  const handleAddInsurance = async () => {
    if (!user || !selectedPet) return;

    try {
      const insuranceData = {
        user_id: user.id,
        pet_id: selectedPet.id,
        provider_name: insuranceForm.provider_name,
        policy_number: insuranceForm.policy_number,
        policy_type: insuranceForm.policy_type,
        start_date: insuranceForm.start_date,
        end_date: insuranceForm.end_date || null,
        premium_amount: insuranceForm.premium_amount ? parseFloat(insuranceForm.premium_amount) : null,
        deductible: insuranceForm.deductible ? parseFloat(insuranceForm.deductible) : null,
        is_active: insuranceForm.is_active
      };

      const { error } = await supabase.from('insurance_policies').insert([insuranceData]);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Assicurazione aggiunta con successo."
      });

      setShowInsuranceDialog(false);
      resetForms();
      fetchAllData();
    } catch (error) {
      console.error('Error adding insurance:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiunta dell'assicurazione.",
        variant: "destructive"
      });
    }
  };

  const handleEditInsurance = async () => {
    if (!editingInsurance) return;

    try {
      const { error } = await supabase
        .from('insurance_policies')
        .update({
          provider_name: insuranceForm.provider_name,
          policy_number: insuranceForm.policy_number,
          policy_type: insuranceForm.policy_type,
          start_date: insuranceForm.start_date,
          end_date: insuranceForm.end_date || null,
          premium_amount: insuranceForm.premium_amount ? parseFloat(insuranceForm.premium_amount) : null,
          deductible: insuranceForm.deductible ? parseFloat(insuranceForm.deductible) : null,
          is_active: insuranceForm.is_active
        })
        .eq('id', editingInsurance.id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Assicurazione aggiornata con successo."
      });

      setShowInsuranceDialog(false);
      resetForms();
      fetchAllData();
    } catch (error) {
      console.error('Error updating insurance:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento dell'assicurazione.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteInsurance = async (id: string) => {
    try {
      const { error } = await supabase.from('insurance_policies').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: "Successo",
        description: "Assicurazione eliminata con successo."
      });
      fetchAllData();
    } catch (error) {
      console.error('Error deleting insurance:', error);
      toast({
        title: "Errore",
        description: "Errore nell'eliminazione dell'assicurazione.",
        variant: "destructive"
      });
    }
  };

  // Find nearby vets
  const handleFindNearbyVets = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Errore",
        description: "Geolocalizzazione non supportata dal browser.",
        variant: "destructive"
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { data, error } = await supabase.functions.invoke('find-nearby-vets', {
            body: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              radius: 20000 // 20km radius
            }
          });

          if (error) throw error;

          setNearbyVets(data?.results || []);
          setShowNearbyVets(true);
        } catch (error) {
          console.error('Error finding nearby vets:', error);
          toast({
            title: "Errore",
            description: "Errore nella ricerca di veterinari nelle vicinanze.",
            variant: "destructive"
          });
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({
          title: "Errore",
          description: "Impossibile ottenere la posizione.",
          variant: "destructive"
        });
      }
    );
  };

  // Handle edit button clicks
  const handleEditMetricClick = (metric: HealthMetric) => {
    setEditingMetric(metric);
    setMetricForm({
      metric_type: metric.metric_type,
      value: metric.value.toString(),
      unit: metric.unit || '',
      recorded_at: format(new Date(metric.recorded_at), 'yyyy-MM-dd'),
      notes: metric.notes || ''
    });
    setShowMetricDialog(true);
  };

  const handleEditRecordClick = (record: MedicalRecord) => {
    setEditingRecord(record);
    setRecordForm({
      title: record.title,
      description: record.description || '',
      record_type: record.record_type,
      record_date: format(new Date(record.record_date), 'yyyy-MM-dd'),
      cost: record.cost?.toString() || '',
      notes: record.notes || '',
      veterinarian_name: record.veterinarian?.name || '',
      clinic_name: record.veterinarian?.clinic_name || ''
    });
    setShowRecordDialog(true);
  };

  const handleEditMedicationClick = (medication: Medication) => {
    setEditingMedication(medication);
    setMedicationForm({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      start_date: format(new Date(medication.start_date), 'yyyy-MM-dd'),
      end_date: medication.end_date ? format(new Date(medication.end_date), 'yyyy-MM-dd') : '',
      notes: medication.notes || ''
    });
    setShowMedicationDialog(true);
  };

  const handleEditVetClick = (vet: Veterinarian) => {
    setEditingVet(vet);
    setVetForm({
      name: vet.name,
      clinic_name: vet.clinic_name || '',
      phone: vet.phone || '',
      email: vet.email || '',
      address: vet.address || '',
      specialization: vet.specialization || '',
      is_primary: vet.is_primary
    });
    setShowVetDialog(true);
  };

  const handleEditEmergencyClick = (emergency: EmergencyContact) => {
    setEditingEmergency(emergency);
    setEmergencyForm({
      name: emergency.name,
      contact_type: emergency.contact_type,
      phone: emergency.phone,
      relationship: emergency.relationship || '',
      email: emergency.email || '',
      notes: emergency.notes || '',
      is_primary: emergency.is_primary || false
    });
    setShowEmergencyDialog(true);
  };

  const handleEditInsuranceClick = (insurance: Insurance) => {
    setEditingInsurance(insurance);
    setInsuranceForm({
      provider_name: insurance.provider_name,
      policy_number: insurance.policy_number,
      policy_type: insurance.policy_type || '',
      start_date: format(new Date(insurance.start_date), 'yyyy-MM-dd'),
      end_date: insurance.end_date ? format(new Date(insurance.end_date), 'yyyy-MM-dd') : '',
      premium_amount: insurance.premium_amount?.toString() || '',
      deductible: insurance.deductible?.toString() || '',
      is_active: insurance.is_active
    });
    setShowInsuranceDialog(true);
  };

  // Confirm delete function
  const confirmDelete = (action: () => void, message: string) => {
    setConfirmAction(() => action);
    setConfirmMessage(message);
    setShowConfirmDialog(true);
  };

  // Export data function
  const handleExportData = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(`Report Salute - ${selectedPet?.name}`, 20, 20);
    
    // Add pet info
    doc.setFontSize(12);
    if (selectedPet) {
      doc.text(`Tipo: ${selectedPet.type}`, 20, 40);
      doc.text(`Razza: ${selectedPet.breed || 'Non specificata'}`, 20, 50);
      doc.text(`Età: ${selectedPet.birth_date ? `${Math.floor((new Date().getTime() - new Date(selectedPet.birth_date).getTime()) / (1000 * 60 * 60 * 24 * 365))} anni` : 'Non specificata'}`, 20, 60);
    }
    
    // Add metrics summary
    let yPosition = 80;
    doc.setFontSize(14);
    doc.text('Parametri Vitali', 20, yPosition);
    yPosition += 10;
    
    healthMetrics.slice(0, 10).forEach((metric, index) => {
      doc.setFontSize(10);
      const evaluation = evaluateVitalParameter(metric.metric_type, metric.value, selectedPet?.type);
      doc.text(`${translateMetricType(metric.metric_type)}: ${metric.value} ${metric.unit} - ${evaluation.message}`, 20, yPosition + (index * 10));
    });
    
    doc.save(`${selectedPet?.name || 'Pet'}_health_report.pdf`);
    
    toast({
      title: "Successo",
      description: "Report esportato con successo."
    });
  };

  // Processed data for charts
  const filteredMetrics = useMemo(() => {
    if (!healthMetrics.length) return [];

    const now = new Date();
    const daysBack = parseInt(dateRange);
    const startDate = subDays(now, daysBack);

    return healthMetrics
      .filter(metric => {
        const metricDate = new Date(metric.recorded_at);
        const matchesDate = isAfter(metricDate, startDate);
        const matchesType = metricFilter === 'all' || metric.metric_type === metricFilter;
        return matchesDate && matchesType;
      })
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
  }, [healthMetrics, dateRange, metricFilter]);

  const vitalsChartData = useMemo(() => {
    const grouped = filteredMetrics.reduce((acc, metric) => {
      const date = format(new Date(metric.recorded_at), 'dd/MM');
      if (!acc[date]) {
        acc[date] = { date };
      }
      acc[date][metric.metric_type] = metric.value;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped);
  }, [filteredMetrics]);

  const emotionData = useMemo(() => {
    const emotionCounts: EmotionCount = {};
    
    diaryEntries.forEach(entry => {
      if (entry.behavioral_tags && Array.isArray(entry.behavioral_tags)) {
        entry.behavioral_tags.forEach(tag => {
          emotionCounts[tag] = (emotionCounts[tag] || 0) + 1;
        });
      }
    });

    return Object.entries(emotionCounts).map(([emotion, count]) => ({
      name: emotion,
      value: count,
      fill: EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS] || '#8884d8'
    }));
  }, [diaryEntries]);

  const wellnessTrendData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      return {
        date: format(date, 'dd/MM'),
        wellness: 0,
        dataCount: 0
      };
    });

    // Add wellness scores
    wellnessData.forEach(score => {
      const scoreDate = format(new Date(score.recorded_at), 'dd/MM');
      const dayData = last30Days.find(d => d.date === scoreDate);
      if (dayData) {
        dayData.wellness = score.overall_score;
        dayData.dataCount++;
      }
    });

    // Calculate trend based on available data
    last30Days.forEach(day => {
      if (day.dataCount === 0) {
        // Simple interpolation based on surrounding days with data
        const prevDay = last30Days[last30Days.indexOf(day) - 1];
        const nextDay = last30Days[last30Days.indexOf(day) + 1];
        
        if (prevDay?.wellness && nextDay?.wellness) {
          day.wellness = Math.round((prevDay.wellness + nextDay.wellness) / 2);
        } else if (prevDay?.wellness) {
          day.wellness = prevDay.wellness;
        } else {
          day.wellness = 75; // Default baseline
        }
      }
    });

    return last30Days;
  }, [wellnessData]);

  // Aggregate stats
  const recentMetrics = healthMetrics.filter(m => 
    isAfter(new Date(m.recorded_at), subDays(new Date(), 7))
  );

  const activeMedications = medications.filter(m => m.is_active);
  const recentVisits = medicalRecords.filter(r => 
    isAfter(new Date(r.record_date), subDays(new Date(), 30))
  );

  const primaryVet = veterinarians.find(v => v.is_primary);
  const primaryEmergency = emergencyContacts.find(e => e.is_primary);
  const activeInsurance = insurance.find(i => i.is_active);

  if (!selectedPet) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground mb-4">
            Seleziona un animale per visualizzare la dashboard della salute
          </p>
          <Button onClick={() => navigate('/pets')}>
            Gestisci Animali
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Salute e Benessere</h1>
          <p className="text-muted-foreground">
            Monitoraggio completo della salute di {selectedPet.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFirstAidGuide(true)}>
            <Siren className="w-4 h-4 mr-2" />
            Pronto Soccorso
          </Button>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="w-4 h-4 mr-2" />
            Esporta Dati
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="vitals">Parametri Vitali</TabsTrigger>
          <TabsTrigger value="medical">Cartella Clinica</TabsTrigger>
          <TabsTrigger value="medications">Farmaci</TabsTrigger>
          <TabsTrigger value="contacts">Contatti</TabsTrigger>
          <TabsTrigger value="insurance">Assicurazione</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Unified Health Score */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Benessere Generale</CardTitle>
                <Heart className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <UnifiedHealthScore 
                  selectedPet={selectedPet} 
                  user={user} 
                  addNotification={addNotification}
                />
              </CardContent>
            </Card>

            {/* Recent Metrics */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Parametri Recenti</CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recentMetrics.length}</div>
                <p className="text-xs text-muted-foreground">
                  Ultimi 7 giorni
                </p>
              </CardContent>
            </Card>

            {/* Active Medications */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Farmaci Attivi</CardTitle>
                <Pill className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeMedications.length}</div>
                <p className="text-xs text-muted-foreground">
                  In corso
                </p>
              </CardContent>
            </Card>

            {/* Recent Visits */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Visite Recenti</CardTitle>
                <Stethoscope className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recentVisits.length}</div>
                <p className="text-xs text-muted-foreground">
                  Ultimo mese
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Wellness Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Andamento Benessere (30 giorni)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    wellness: {
                      label: "Benessere",
                      color: "hsl(var(--primary))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={wellnessTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="wellness"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.2}
                      />
                      <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="2 2" />
                      <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="2 2" />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Emotions Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Distribuzione Emozioni
                </CardTitle>
              </CardHeader>
              <CardContent>
                {emotionData.length > 0 ? (
                  <ChartContainer
                    config={Object.fromEntries(
                      Object.entries(EMOTION_COLORS).map(([emotion, color]) => [
                        emotion,
                        { label: emotion, color }
                      ])
                    )}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={emotionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {emotionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Nessun dato sulle emozioni disponibile
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Latest Vitals */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ultimi Parametri Vitali</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {healthMetrics.slice(0, 3).map((metric) => {
                  const evaluation = evaluateVitalParameter(metric.metric_type, metric.value, selectedPet.type);
                  return (
                    <div key={metric.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{translateMetricType(metric.metric_type)}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(metric.recorded_at), 'dd/MM/yyyy', { locale: it })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{metric.value} {metric.unit}</p>
                        <Badge variant={
                          evaluation.status === 'critical' ? 'destructive' :
                          evaluation.status === 'warning' ? 'secondary' : 'default'
                        }>
                          {evaluation.status === 'critical' ? 'Critico' :
                           evaluation.status === 'warning' ? 'Attenzione' : 'Normale'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
                {healthMetrics.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nessun parametro registrato</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Medical Records */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cartella Clinica Recente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {medicalRecords.slice(0, 3).map((record) => (
                  <div key={record.id} className="space-y-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{record.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {translateRecordType(record.record_type)}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {format(new Date(record.record_date), 'dd/MM', { locale: it })}
                      </Badge>
                    </div>
                  </div>
                ))}
                {medicalRecords.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nessuna cartella registrata</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Azioni Rapide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowMetricDialog(true)}
                >
                  <Thermometer className="w-4 h-4 mr-2" />
                  Aggiungi Parametro Vitale
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowRecordDialog(true)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Aggiungi Visita
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowMedicationDialog(true)}
                >
                  <Pill className="w-4 h-4 mr-2" />
                  Aggiungi Farmaco
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowDiaryDialog(true)}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Aggiungi Diario
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Primary Veterinarian */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  Veterinario Principale
                </CardTitle>
              </CardHeader>
              <CardContent>
                {primaryVet ? (
                  <div className="space-y-2">
                    <p className="font-medium">{primaryVet.name}</p>
                    {primaryVet.clinic_name && (
                      <p className="text-sm text-muted-foreground">{primaryVet.clinic_name}</p>
                    )}
                    {primaryVet.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">{primaryVet.phone}</span>
                      </div>
                    )}
                    {primaryVet.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{primaryVet.email}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Nessun veterinario principale impostato
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowVetDialog(true)}
                    >
                      Aggiungi Veterinario
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contatto di Emergenza
                </CardTitle>
              </CardHeader>
              <CardContent>
                {primaryEmergency ? (
                  <div className="space-y-2">
                    <p className="font-medium">{primaryEmergency.name}</p>
                    {primaryEmergency.relationship && (
                      <p className="text-sm text-muted-foreground">{primaryEmergency.relationship}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{primaryEmergency.phone}</span>
                    </div>
                    {primaryEmergency.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{primaryEmergency.email}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Nessun contatto di emergenza impostato
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowEmergencyDialog(true)}
                    >
                      Aggiungi Contatto
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Insurance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Assicurazione
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeInsurance ? (
                  <div className="space-y-2">
                    <p className="font-medium">{activeInsurance.provider_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Polizza: {activeInsurance.policy_number}
                    </p>
                    {activeInsurance.policy_type && (
                      <p className="text-sm">{activeInsurance.policy_type}</p>
                    )}
                    {activeInsurance.premium_amount && (
                      <p className="text-sm">
                        Premio: €{activeInsurance.premium_amount}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Nessuna assicurazione attiva
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowInsuranceDialog(true)}
                    >
                      Aggiungi Assicurazione
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-6">
          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Label htmlFor="metric-filter">Tipo:</Label>
              <Select value={metricFilter} onValueChange={setMetricFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i parametri</SelectItem>
                  <SelectItem value="temperature">Temperatura</SelectItem>
                  <SelectItem value="heart_rate">Frequenza Cardiaca</SelectItem>
                  <SelectItem value="respiration">Respirazione</SelectItem>
                  <SelectItem value="weight">Peso</SelectItem>
                  <SelectItem value="gum_color">Colore Gengive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="date-range">Periodo:</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 giorni</SelectItem>
                  <SelectItem value="30">30 giorni</SelectItem>
                  <SelectItem value="90">90 giorni</SelectItem>
                  <SelectItem value="365">1 anno</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setShowMetricDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Parametro
            </Button>
          </div>

          {/* Vitals Chart */}
          {vitalsChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Andamento Parametri Vitali</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    temperature: {
                      label: "Temperatura (°C)",
                      color: "#ef4444",
                    },
                    heart_rate: {
                      label: "Battito (bpm)",
                      color: "#3b82f6",
                    },
                    respiration: {
                      label: "Respirazione (rpm)",
                      color: "#22c55e",
                    },
                    weight: {
                      label: "Peso (kg)",
                      color: "#f59e0b",
                    },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={vitalsChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      {metricFilter === 'all' || metricFilter === 'temperature' ? (
                        <Line
                          type="monotone"
                          dataKey="temperature"
                          stroke="#ef4444"
                          strokeWidth={2}
                          dot={{ fill: '#ef4444' }}
                        />
                      ) : null}
                      {metricFilter === 'all' || metricFilter === 'heart_rate' ? (
                        <Line
                          type="monotone"
                          dataKey="heart_rate"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6' }}
                        />
                      ) : null}
                      {metricFilter === 'all' || metricFilter === 'respiration' ? (
                        <Line
                          type="monotone"
                          dataKey="respiration"
                          stroke="#22c55e"
                          strokeWidth={2}
                          dot={{ fill: '#22c55e' }}
                        />
                      ) : null}
                      {metricFilter === 'all' || metricFilter === 'weight' ? (
                        <Line
                          type="monotone"
                          dataKey="weight"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          dot={{ fill: '#f59e0b' }}
                        />
                      ) : null}
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* Metrics List */}
          <Card>
            <CardHeader>
              <CardTitle>Parametri Vitali Registrati</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredMetrics.map((metric) => {
                  const evaluation = evaluateVitalParameter(metric.metric_type, metric.value, selectedPet?.type);
                  return (
                    <div key={metric.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">{translateMetricType(metric.metric_type)}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(metric.recorded_at), 'dd/MM/yyyy HH:mm', { locale: it })}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold">
                              {metric.metric_type === 'gum_color' ? getGumColorText(metric.value) : `${metric.value} ${metric.unit}`}
                            </span>
                            <Badge variant={
                              evaluation.status === 'critical' ? 'destructive' :
                              evaluation.status === 'warning' ? 'secondary' : 'default'
                            }>
                              {evaluation.status === 'critical' ? 'Critico' :
                               evaluation.status === 'warning' ? 'Attenzione' : 'Normale'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {evaluation.message}
                          </p>
                          {evaluation.recommendation && (
                            <Alert className="mt-2">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                {evaluation.recommendation}
                              </AlertDescription>
                            </Alert>
                          )}
                          {metric.notes && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Note: {metric.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditMetricClick(metric)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => confirmDelete(() => handleDeleteMetric(metric.id), 'Sei sicuro di voler eliminare questo parametro vitale?')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {filteredMetrics.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Nessun parametro vitale registrato per il periodo selezionato.</p>
                    <Button className="mt-4" onClick={() => setShowMetricDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Aggiungi il primo parametro
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Cartella Clinica</h2>
            <Button onClick={() => setShowRecordDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Record
            </Button>
          </div>

          <div className="space-y-4">
            {medicalRecords.map((record) => (
              <Card key={record.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{record.title}</CardTitle>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="outline">
                          {translateRecordType(record.record_type)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(record.record_date), 'dd/MM/yyyy', { locale: it })}
                        </span>
                        {record.cost && (
                          <span className="text-sm font-medium">€{record.cost}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditRecordClick(record)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => confirmDelete(() => handleDeleteRecord(record.id), 'Sei sicuro di voler eliminare questo record medico?')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {record.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {record.description}
                    </p>
                  )}
                  {record.veterinarian && (
                    <div className="flex items-center gap-2 mb-2">
                      <Stethoscope className="w-4 h-4" />
                      <span className="text-sm">
                        {record.veterinarian.name}
                        {record.veterinarian.clinic_name && ` - ${record.veterinarian.clinic_name}`}
                      </span>
                    </div>
                  )}
                  {record.notes && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm">{record.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {medicalRecords.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nessun record medico registrato.</p>
                <Button className="mt-4" onClick={() => setShowRecordDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Aggiungi il primo record
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="medications" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Farmaci</h2>
            <Button onClick={() => setShowMedicationDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Farmaco
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Active Medications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-green-600">Farmaci Attivi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeMedications.map((medication) => (
                    <div key={medication.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{medication.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {medication.dosage} - {medication.frequency}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Dal {format(new Date(medication.start_date), 'dd/MM/yyyy', { locale: it })}
                            {medication.end_date && ` al ${format(new Date(medication.end_date), 'dd/MM/yyyy', { locale: it })}`}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditMedicationClick(medication)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => confirmDelete(() => handleDeleteMedication(medication.id), 'Sei sicuro di voler eliminare questo farmaco?')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {medication.notes && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Note: {medication.notes}
                        </p>
                      )}
                    </div>
                  ))}
                  {activeMedications.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nessun farmaco attivo</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Inactive Medications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-muted-foreground">Farmaci Terminati</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {medications.filter(m => !m.is_active).map((medication) => (
                    <div key={medication.id} className="p-3 border rounded-lg opacity-60">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{medication.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {medication.dosage} - {medication.frequency}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Dal {format(new Date(medication.start_date), 'dd/MM/yyyy', { locale: it })}
                            {medication.end_date && ` al ${format(new Date(medication.end_date), 'dd/MM/yyyy', { locale: it })}`}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditMedicationClick(medication)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => confirmDelete(() => handleDeleteMedication(medication.id), 'Sei sicuro di voler eliminare questo farmaco?')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {medication.notes && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Note: {medication.notes}
                        </p>
                      )}
                    </div>
                  ))}
                  {medications.filter(m => !m.is_active).length === 0 && (
                    <p className="text-sm text-muted-foreground">Nessun farmaco terminato</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Veterinarians */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5" />
                    Veterinari
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleFindNearbyVets}>
                      <MapPin className="w-4 h-4 mr-2" />
                      Trova Vicini
                    </Button>
                    <Button size="sm" onClick={() => setShowVetDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Aggiungi
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {veterinarians.map((vet) => (
                    <div key={vet.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{vet.name}</p>
                            {vet.is_primary && (
                              <Badge variant="default">Principale</Badge>
                            )}
                          </div>
                          {vet.clinic_name && (
                            <p className="text-sm text-muted-foreground">{vet.clinic_name}</p>
                          )}
                          {vet.specialization && (
                            <p className="text-sm text-muted-foreground">{vet.specialization}</p>
                          )}
                          <div className="flex flex-col gap-1 mt-2">
                            {vet.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-3 h-3" />
                                <span className="text-sm">{vet.phone}</span>
                              </div>
                            )}
                            {vet.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="w-3 h-3" />
                                <span className="text-sm">{vet.email}</span>
                              </div>
                            )}
                            {vet.address && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3 h-3" />
                                <span className="text-sm">{vet.address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditVetClick(vet)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => confirmDelete(() => handleDeleteVet(vet.id), 'Sei sicuro di voler eliminare questo veterinario?')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {veterinarians.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nessun veterinario registrato</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Contatti di Emergenza
                  </CardTitle>
                  <Button size="sm" onClick={() => setShowEmergencyDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Aggiungi
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {emergencyContacts.map((contact) => (
                    <div key={contact.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{contact.name}</p>
                            {contact.is_primary && (
                              <Badge variant="default">Principale</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground capitalize">
                            {contact.contact_type}
                            {contact.relationship && ` - ${contact.relationship}`}
                          </p>
                          <div className="flex flex-col gap-1 mt-2">
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3" />
                              <span className="text-sm">{contact.phone}</span>
                            </div>
                            {contact.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="w-3 h-3" />
                                <span className="text-sm">{contact.email}</span>
                              </div>
                            )}
                          </div>
                          {contact.notes && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Note: {contact.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditEmergencyClick(contact)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => confirmDelete(() => handleDeleteEmergency(contact.id), 'Sei sicuro di voler eliminare questo contatto di emergenza?')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {emergencyContacts.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nessun contatto di emergenza registrato</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insurance" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Assicurazioni</h2>
            <Button onClick={() => setShowInsuranceDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Assicurazione
            </Button>
          </div>

          <div className="space-y-4">
            {insurance.map((policy) => (
              <Card key={policy.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{policy.provider_name}</CardTitle>
                        <Badge variant={policy.is_active ? "default" : "secondary"}>
                          {policy.is_active ? "Attiva" : "Scaduta"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Polizza: {policy.policy_number}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditInsuranceClick(policy)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => confirmDelete(() => handleDeleteInsurance(policy.id), 'Sei sicuro di voler eliminare questa assicurazione?')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      {policy.policy_type && (
                        <div className="mb-2">
                          <span className="text-sm font-medium">Tipo: </span>
                          <span className="text-sm">{policy.policy_type}</span>
                        </div>
                      )}
                      <div className="mb-2">
                        <span className="text-sm font-medium">Inizio: </span>
                        <span className="text-sm">
                          {format(new Date(policy.start_date), 'dd/MM/yyyy', { locale: it })}
                        </span>
                      </div>
                      {policy.end_date && (
                        <div className="mb-2">
                          <span className="text-sm font-medium">Fine: </span>
                          <span className="text-sm">
                            {format(new Date(policy.end_date), 'dd/MM/yyyy', { locale: it })}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      {policy.premium_amount && (
                        <div className="mb-2">
                          <span className="text-sm font-medium">Premio: </span>
                          <span className="text-sm">€{policy.premium_amount}</span>
                        </div>
                      )}
                      {policy.deductible && (
                        <div className="mb-2">
                          <span className="text-sm font-medium">Franchigia: </span>
                          <span className="text-sm">€{policy.deductible}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {insurance.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nessuna assicurazione registrata.</p>
                <Button className="mt-4" onClick={() => setShowInsuranceDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Aggiungi la prima assicurazione
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Health Metric Dialog */}
      <Dialog open={showMetricDialog} onOpenChange={setShowMetricDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMetric ? 'Modifica Parametro Vitale' : 'Aggiungi Parametro Vitale'}
            </DialogTitle>
            <DialogDescription>
              Registra i parametri vitali del tuo animale per monitorarne la salute.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="metric_type">Tipo di Parametro</Label>
              <Select value={metricForm.metric_type} onValueChange={(value) => setMetricForm({...metricForm, metric_type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="temperature">Temperatura Corporea</SelectItem>
                  <SelectItem value="heart_rate">Frequenza Cardiaca</SelectItem>
                  <SelectItem value="respiration">Respirazione</SelectItem>
                  <SelectItem value="weight">Peso</SelectItem>
                  <SelectItem value="gum_color">Colore Gengive</SelectItem>
                  <SelectItem value="blood_pressure">Pressione Sanguigna</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="value">Valore</Label>
              {isDropdownMetric(metricForm.metric_type) ? (
                <Select value={metricForm.value} onValueChange={(value) => setMetricForm({...metricForm, value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona colore" />
                  </SelectTrigger>
                  <SelectContent>
                    {GUM_COLOR_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="value"
                  type="number"
                  step="0.1"
                  value={metricForm.value}
                  onChange={(e) => setMetricForm({...metricForm, value: e.target.value})}
                  placeholder="Inserisci valore"
                />
              )}
            </div>
            {!isDropdownMetric(metricForm.metric_type) && (
              <div>
                <Label htmlFor="unit">Unità di Misura</Label>
                <Input
                  id="unit"
                  value={metricForm.unit || getMetricUnit(metricForm.metric_type)}
                  onChange={(e) => setMetricForm({...metricForm, unit: e.target.value})}
                  placeholder="es. °C, bpm, kg"
                />
              </div>
            )}
            <div>
              <Label htmlFor="recorded_at">Data e Ora</Label>
              <Input
                id="recorded_at"
                type="datetime-local"
                value={metricForm.recorded_at}
                onChange={(e) => setMetricForm({...metricForm, recorded_at: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="notes">Note (opzionale)</Label>
              <Textarea
                id="notes"
                value={metricForm.notes}
                onChange={(e) => setMetricForm({...metricForm, notes: e.target.value})}
                placeholder="Note aggiuntive..."
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={editingMetric ? handleEditMetric : handleAddMetric}
                disabled={!metricForm.metric_type || !metricForm.value || !metricForm.recorded_at}
              >
                {editingMetric ? 'Aggiorna' : 'Aggiungi'}
              </Button>
              <Button variant="outline" onClick={() => {
                setShowMetricDialog(false);
                resetForms();
              }}>
                Annulla
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Medical Record Dialog */}
      <Dialog open={showRecordDialog} onOpenChange={setShowRecordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? 'Modifica Record Medico' : 'Aggiungi Record Medico'}
            </DialogTitle>
            <DialogDescription>
              Registra visite, esami e trattamenti veterinari.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titolo</Label>
              <Input
                id="title"
                value={recordForm.title}
                onChange={(e) => setRecordForm({...recordForm, title: e.target.value})}
                placeholder="es. Visita di controllo"
              />
            </div>
            <div>
              <Label htmlFor="record_type">Tipo</Label>
              <Select value={recordForm.record_type} onValueChange={(value) => setRecordForm({...recordForm, record_type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visit">Visita</SelectItem>
                  <SelectItem value="exam">Esame</SelectItem>
                  <SelectItem value="vaccination">Vaccino</SelectItem>
                  <SelectItem value="surgery">Operazione</SelectItem>
                  <SelectItem value="treatment">Trattamento</SelectItem>
                  <SelectItem value="lab_work">Analisi</SelectItem>
                  <SelectItem value="emergency">Emergenza</SelectItem>
                  <SelectItem value="other">Altro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="record_date">Data</Label>
              <Input
                id="record_date"
                type="date"
                value={recordForm.record_date}
                onChange={(e) => setRecordForm({...recordForm, record_date: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="description">Descrizione</Label>
              <Textarea
                id="description"
                value={recordForm.description}
                onChange={(e) => setRecordForm({...recordForm, description: e.target.value})}
                placeholder="Descrizione del trattamento o visita..."
              />
            </div>
            <div>
              <Label htmlFor="veterinarian_name">Veterinario</Label>
              <Input
                id="veterinarian_name"
                value={recordForm.veterinarian_name}
                onChange={(e) => setRecordForm({...recordForm, veterinarian_name: e.target.value})}
                placeholder="Nome del veterinario"
              />
            </div>
            <div>
              <Label htmlFor="clinic_name">Clinica</Label>
              <Input
                id="clinic_name"
                value={recordForm.clinic_name}
                onChange={(e) => setRecordForm({...recordForm, clinic_name: e.target.value})}
                placeholder="Nome della clinica"
              />
            </div>
            <div>
              <Label htmlFor="cost">Costo (€)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={recordForm.cost}
                onChange={(e) => setRecordForm({...recordForm, cost: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="notes">Note</Label>
              <Textarea
                id="notes"
                value={recordForm.notes}
                onChange={(e) => setRecordForm({...recordForm, notes: e.target.value})}
                placeholder="Note aggiuntive..."
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={editingRecord ? handleEditRecord : handleAddRecord}
                disabled={!recordForm.title || !recordForm.record_type || !recordForm.record_date}
              >
                {editingRecord ? 'Aggiorna' : 'Aggiungi'}
              </Button>
              <Button variant="outline" onClick={() => {
                setShowRecordDialog(false);
                resetForms();
              }}>
                Annulla
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Medication Dialog */}
      <Dialog open={showMedicationDialog} onOpenChange={setShowMedicationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMedication ? 'Modifica Farmaco' : 'Aggiungi Farmaco'}
            </DialogTitle>
            <DialogDescription>
              Tieni traccia dei farmaci e trattamenti del tuo animale.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome Farmaco</Label>
              <Input
                id="name"
                value={medicationForm.name}
                onChange={(e) => setMedicationForm({...medicationForm, name: e.target.value})}
                placeholder="es. Antibiotico XYZ"
              />
            </div>
            <div>
              <Label htmlFor="dosage">Dosaggio</Label>
              <Input
                id="dosage"
                value={medicationForm.dosage}
                onChange={(e) => setMedicationForm({...medicationForm, dosage: e.target.value})}
                placeholder="es. 10mg"
              />
            </div>
            <div>
              <Label htmlFor="frequency">Frequenza</Label>
              <Input
                id="frequency"
                value={medicationForm.frequency}
                onChange={(e) => setMedicationForm({...medicationForm, frequency: e.target.value})}
                placeholder="es. 2 volte al giorno"
              />
            </div>
            <div>
              <Label htmlFor="start_date">Data Inizio</Label>
              <Input
                id="start_date"
                type="date"
                value={medicationForm.start_date}
                onChange={(e) => setMedicationForm({...medicationForm, start_date: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="end_date">Data Fine (opzionale)</Label>
              <Input
                id="end_date"
                type="date"
                value={medicationForm.end_date}
                onChange={(e) => setMedicationForm({...medicationForm, end_date: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="notes">Note</Label>
              <Textarea
                id="notes"
                value={medicationForm.notes}
                onChange={(e) => setMedicationForm({...medicationForm, notes: e.target.value})}
                placeholder="Istruzioni speciali, effetti collaterali..."
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={editingMedication ? handleEditMedication : handleAddMedication}
                disabled={!medicationForm.name || !medicationForm.dosage || !medicationForm.frequency || !medicationForm.start_date}
              >
                {editingMedication ? 'Aggiorna' : 'Aggiungi'}
              </Button>
              <Button variant="outline" onClick={() => {
                setShowMedicationDialog(false);
                resetForms();
              }}>
                Annulla
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Veterinarian Dialog */}
      <Dialog open={showVetDialog} onOpenChange={setShowVetDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingVet ? 'Modifica Veterinario' : 'Aggiungi Veterinario'}
            </DialogTitle>
            <DialogDescription>
              Aggiungi i contatti dei veterinari di fiducia.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={vetForm.name}
                onChange={(e) => setVetForm({...vetForm, name: e.target.value})}
                placeholder="Dr. Mario Rossi"
              />
            </div>
            <div>
              <Label htmlFor="clinic_name">Nome Clinica</Label>
              <Input
                id="clinic_name"
                value={vetForm.clinic_name}
                onChange={(e) => setVetForm({...vetForm, clinic_name: e.target.value})}
                placeholder="Clinica Veterinaria ABC"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefono</Label>
              <Input
                id="phone"
                value={vetForm.phone}
                onChange={(e) => setVetForm({...vetForm, phone: e.target.value})}
                placeholder="+39 123 456 7890"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={vetForm.email}
                onChange={(e) => setVetForm({...vetForm, email: e.target.value})}
                placeholder="vet@clinica.it"
              />
            </div>
            <div>
              <Label htmlFor="address">Indirizzo</Label>
              <Input
                id="address"
                value={vetForm.address}
                onChange={(e) => setVetForm({...vetForm, address: e.target.value})}
                placeholder="Via Roma 123, Milano"
              />
            </div>
            <div>
              <Label htmlFor="specialization">Specializzazione</Label>
              <Input
                id="specialization"
                value={vetForm.specialization}
                onChange={(e) => setVetForm({...vetForm, specialization: e.target.value})}
                placeholder="es. Cardiologia, Chirurgia"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_primary"
                checked={vetForm.is_primary}
                onCheckedChange={(checked) => setVetForm({...vetForm, is_primary: checked as boolean})}
              />
              <Label htmlFor="is_primary">Veterinario principale</Label>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={editingVet ? handleEditVet : handleAddVet}
                disabled={!vetForm.name}
              >
                {editingVet ? 'Aggiorna' : 'Aggiungi'}
              </Button>
              <Button variant="outline" onClick={() => {
                setShowVetDialog(false);
                resetForms();
              }}>
                Annulla
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Emergency Contact Dialog */}
      <Dialog open={showEmergencyDialog} onOpenChange={setShowEmergencyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEmergency ? 'Modifica Contatto di Emergenza' : 'Aggiungi Contatto di Emergenza'}
            </DialogTitle>
            <DialogDescription>
              Aggiungi contatti da chiamare in caso di emergenza.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={emergencyForm.name}
                onChange={(e) => setEmergencyForm({...emergencyForm, name: e.target.value})}
                placeholder="Mario Rossi"
              />
            </div>
            <div>
              <Label htmlFor="contact_type">Tipo Contatto</Label>
              <Select value={emergencyForm.contact_type} onValueChange={(value) => setEmergencyForm({...emergencyForm, contact_type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="family">Famiglia</SelectItem>
                  <SelectItem value="friend">Amico</SelectItem>
                  <SelectItem value="neighbor">Vicino</SelectItem>
                  <SelectItem value="veterinary">Veterinario</SelectItem>
                  <SelectItem value="other">Altro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="phone">Telefono</Label>
              <Input
                id="phone"
                value={emergencyForm.phone}
                onChange={(e) => setEmergencyForm({...emergencyForm, phone: e.target.value})}
                placeholder="+39 123 456 7890"
              />
            </div>
            <div>
              <Label htmlFor="relationship">Relazione</Label>
              <Input
                id="relationship"
                value={emergencyForm.relationship}
                onChange={(e) => setEmergencyForm({...emergencyForm, relationship: e.target.value})}
                placeholder="es. Fratello, Migliore amico"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={emergencyForm.email}
                onChange={(e) => setEmergencyForm({...emergencyForm, email: e.target.value})}
                placeholder="mario@email.com"
              />
            </div>
            <div>
              <Label htmlFor="notes">Note</Label>
              <Textarea
                id="notes"
                value={emergencyForm.notes}
                onChange={(e) => setEmergencyForm({...emergencyForm, notes: e.target.value})}
                placeholder="Informazioni aggiuntive..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_primary"
                checked={emergencyForm.is_primary}
                onCheckedChange={(checked) => setEmergencyForm({...emergencyForm, is_primary: checked as boolean})}
              />
              <Label htmlFor="is_primary">Contatto principale</Label>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={editingEmergency ? handleEditEmergency : handleAddEmergency}
                disabled={!emergencyForm.name || !emergencyForm.phone}
              >
                {editingEmergency ? 'Aggiorna' : 'Aggiungi'}
              </Button>
              <Button variant="outline" onClick={() => {
                setShowEmergencyDialog(false);
                resetForms();
              }}>
                Annulla
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Insurance Dialog */}
      <Dialog open={showInsuranceDialog} onOpenChange={setShowInsuranceDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingInsurance ? 'Modifica Assicurazione' : 'Aggiungi Assicurazione'}
            </DialogTitle>
            <DialogDescription>
              Gestisci le polizze assicurative del tuo animale.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="provider_name">Compagnia Assicurativa</Label>
              <Input
                id="provider_name"
                value={insuranceForm.provider_name}
                onChange={(e) => setInsuranceForm({...insuranceForm, provider_name: e.target.value})}
                placeholder="es. Assicurazioni ABC"
              />
            </div>
            <div>
              <Label htmlFor="policy_number">Numero Polizza</Label>
              <Input
                id="policy_number"
                value={insuranceForm.policy_number}
                onChange={(e) => setInsuranceForm({...insuranceForm, policy_number: e.target.value})}
                placeholder="POL123456789"
              />
            </div>
            <div>
              <Label htmlFor="policy_type">Tipo Polizza</Label>
              <Input
                id="policy_type"
                value={insuranceForm.policy_type}
                onChange={(e) => setInsuranceForm({...insuranceForm, policy_type: e.target.value})}
                placeholder="es. Completa, Base, Malattie"
              />
            </div>
            <div>
              <Label htmlFor="start_date">Data Inizio</Label>
              <Input
                id="start_date"
                type="date"
                value={insuranceForm.start_date}
                onChange={(e) => setInsuranceForm({...insuranceForm, start_date: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="end_date">Data Fine</Label>
              <Input
                id="end_date"
                type="date"
                value={insuranceForm.end_date}
                onChange={(e) => setInsuranceForm({...insuranceForm, end_date: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="premium_amount">Premio Annuale (€)</Label>
              <Input
                id="premium_amount"
                type="number"
                step="0.01"
                value={insuranceForm.premium_amount}
                onChange={(e) => setInsuranceForm({...insuranceForm, premium_amount: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="deductible">Franchigia (€)</Label>
              <Input
                id="deductible"
                type="number"
                step="0.01"
                value={insuranceForm.deductible}
                onChange={(e) => setInsuranceForm({...insuranceForm, deductible: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={insuranceForm.is_active}
                onCheckedChange={(checked) => setInsuranceForm({...insuranceForm, is_active: checked as boolean})}
              />
              <Label htmlFor="is_active">Polizza attiva</Label>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={editingInsurance ? handleEditInsurance : handleAddInsurance}
                disabled={!insuranceForm.provider_name || !insuranceForm.policy_number || !insuranceForm.start_date}
              >
                {editingInsurance ? 'Aggiorna' : 'Aggiungi'}
              </Button>
              <Button variant="outline" onClick={() => {
                setShowInsuranceDialog(false);
                resetForms();
              }}>
                Annulla
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diary Dialog */}
      <Dialog open={showDiaryDialog} onOpenChange={setShowDiaryDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Aggiungi Voce Diario</DialogTitle>
            <DialogDescription>
              Registra comportamenti, emozioni e note quotidiane sul tuo animale.
            </DialogDescription>
          </DialogHeader>
          <DiaryEntryForm
            isOpen={showDiaryDialog}
            onClose={() => {
              setShowDiaryDialog(false);
              fetchAllData();
            }}
            onSave={(data) => {
              setShowDiaryDialog(false);
              fetchAllData();
            }}
            petId={selectedPet?.id || ''}
            userId={user?.id || ''}
          />
        </DialogContent>
      </Dialog>

      {/* First Aid Guide */}
      <FirstAidGuide 
        open={showFirstAidGuide}
        onOpenChange={setShowFirstAidGuide}
      />

      {/* Nearby Vets Dialog */}
      <Dialog open={showNearbyVets} onOpenChange={setShowNearbyVets}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Veterinari nelle Vicinanze</DialogTitle>
            <DialogDescription>
              Veterinari trovati nella tua zona
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {nearbyVets.map((vet, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h3 className="font-medium">{vet.name}</h3>
                <p className="text-sm text-muted-foreground">{vet.vicinity}</p>
                {vet.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{vet.rating}</span>
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setVetForm({
                        ...vetForm,
                        name: vet.name,
                        address: vet.vicinity
                      });
                      setShowNearbyVets(false);
                      setShowVetDialog(true);
                    }}
                  >
                    Aggiungi ai Contatti
                  </Button>
                </div>
              </div>
            ))}
            {nearbyVets.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nessun veterinario trovato nelle vicinanze
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={() => {
          confirmAction();
          setShowConfirmDialog(false);
        }}
        title="Conferma Eliminazione"
        description={confirmMessage}
      />
    </div>
  );
};

export default Dashboard;
