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
  BookOpen,
  PawPrint,
  Home
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  
  // Data states
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  
  // Form states
  const [metricForm, setMetricForm] = useState({
    metric_type: '',
    value: '',
    unit: '',
    notes: ''
  });
  const [recordForm, setRecordForm] = useState({
    title: '',
    description: '',
    record_type: '',
    record_date: format(new Date(), 'yyyy-MM-dd'),
    cost: '',
    notes: '',
    veterinarian_name: '',
    clinic_name: ''
  });
  const [medicationForm, setMedicationForm] = useState({
    name: '',
    dosage: '',
    frequency: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
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
    contact_type: 'veterinarian',
    phone: '',
    relationship: '',
    email: '',
    notes: ''
  });
  const [insuranceForm, setInsuranceForm] = useState({
    provider_name: '',
    policy_number: '',
    policy_type: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: '',
    premium_amount: '',
    deductible: ''
  });
  
  // Modal states
  const [showMetricDialog, setShowMetricDialog] = useState(false);
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [showMedicationDialog, setShowMedicationDialog] = useState(false);
  const [showVetDialog, setShowVetDialog] = useState(false);
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [showInsuranceDialog, setShowInsuranceDialog] = useState(false);
  const [showDiaryDialog, setShowDiaryDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{type: string, id: string} | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<{start?: Date, end?: Date}>({});
  const [recordTypeFilter, setRecordTypeFilter] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Selected pet from context
  const selectedPet = pets.find(pet => pet.id === localStorage.getItem('petvoice-selected-pet')) || pets[0] || null;

  // Initial data loading
  useEffect(() => {
    if (user && selectedPet) {
      fetchAllData();
    }
  }, [user, selectedPet]);

  // Set active tab from URL params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const fetchAllData = async () => {
    if (!user || !selectedPet) return;
    
    setLoading(true);
    try {
      await Promise.all([
        fetchHealthMetrics(),
        fetchMedicalRecords(), 
        fetchMedications(),
        fetchVeterinarians(),
        fetchEmergencyContacts(),
        fetchInsurances(),
        fetchDiaryEntries()
      ]);
    } catch (error) {
      console.error('Error fetching wellness data:', error);
      toast({
        title: 'Errore nel caricamento',
        description: 'Si è verificato un errore nel caricamento dei dati.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHealthMetrics = async () => {
    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', user!.id)
      .eq('pet_id', selectedPet!.id)
      .order('recorded_at', { ascending: false });
    
    if (error) throw error;
    setHealthMetrics(data || []);
  };

  const fetchMedicalRecords = async () => {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('user_id', user!.id)
      .eq('pet_id', selectedPet!.id)
      .order('record_date', { ascending: false });
    
    if (error) throw error;
    setMedicalRecords(data || []);
  };

  const fetchMedications = async () => {
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', user!.id)
      .eq('pet_id', selectedPet!.id)
      .order('start_date', { ascending: false });
    
    if (error) throw error;
    setMedications(data || []);
  };

  const fetchVeterinarians = async () => {
    const { data, error } = await supabase
      .from('veterinarians')
      .select('*')
      .eq('user_id', user!.id)
      .order('name');
    
    if (error) throw error;
    setVeterinarians(data || []);
  };

  const fetchEmergencyContacts = async () => {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', user!.id)
      .order('name');
    
    if (error) throw error;
    setEmergencyContacts(data || []);
  };

  const fetchInsurances = async () => {
    const { data, error } = await supabase
      .from('insurance_policies')
      .select('*')
      .eq('user_id', user!.id)
      .eq('pet_id', selectedPet!.id)
      .order('start_date', { ascending: false });
    
    if (error) throw error;
    setInsurances(data || []);
  };

  const fetchDiaryEntries = async () => {
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', user!.id)
      .eq('pet_id', selectedPet!.id)
      .order('entry_date', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    setDiaryEntries(data || []);
  };

  // Health metric functions
  const handleAddMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPet) return;

    try {
      const metricData = {
        user_id: user.id,
        pet_id: selectedPet.id,
        metric_type: metricForm.metric_type,
        value: parseFloat(metricForm.value),
        unit: getMetricUnit(metricForm.metric_type) || metricForm.unit,
        recorded_at: new Date().toISOString(),
        notes: metricForm.notes || null
      };

      const { error } = await supabase
        .from('health_metrics')
        .insert(metricData);

      if (error) throw error;

      setMetricForm({ metric_type: '', value: '', unit: '', notes: '' });
      setShowMetricDialog(false);
      fetchHealthMetrics();
      
      toast({
        title: 'Metrica aggiunta',
        description: 'La metrica di salute è stata registrata con successo.'
      });
    } catch (error) {
      console.error('Error adding metric:', error);
      toast({
        title: 'Errore',
        description: 'Errore durante l\'aggiunta della metrica.',
        variant: 'destructive'
      });
    }
  };

  const handleEditMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const { error } = await supabase
        .from('health_metrics')
        .update({
          metric_type: metricForm.metric_type,
          value: parseFloat(metricForm.value),
          unit: getMetricUnit(metricForm.metric_type) || metricForm.unit,
          notes: metricForm.notes || null
        })
        .eq('id', editingItem.id);

      if (error) throw error;

      setMetricForm({ metric_type: '', value: '', unit: '', notes: '' });
      setEditingItem(null);
      setShowMetricDialog(false);
      fetchHealthMetrics();
      
      toast({
        title: 'Metrica aggiornata',
        description: 'La metrica di salute è stata aggiornata con successo.'
      });
    } catch (error) {
      console.error('Error updating metric:', error);
      toast({
        title: 'Errore',
        description: 'Errore durante l\'aggiornamento della metrica.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteMetric = async (id: string) => {
    try {
      const { error } = await supabase
        .from('health_metrics')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchHealthMetrics();
      toast({
        title: 'Metrica eliminata',
        description: 'La metrica di salute è stata eliminata con successo.'
      });
    } catch (error) {
      console.error('Error deleting metric:', error);
      toast({
        title: 'Errore',
        description: 'Errore durante l\'eliminazione della metrica.',
        variant: 'destructive'
      });
    }
  };

  // Medical record functions
  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPet) return;

    try {
      const recordData = {
        user_id: user.id,
        pet_id: selectedPet.id,
        title: recordForm.title,
        description: recordForm.description || null,
        record_type: recordForm.record_type,
        record_date: recordForm.record_date,
        cost: recordForm.cost ? parseFloat(recordForm.cost) : null,
        notes: recordForm.notes || null,
        veterinarian: recordForm.veterinarian_name ? {
          name: recordForm.veterinarian_name,
          clinic_name: recordForm.clinic_name || null
        } : null
      };

      const { error } = await supabase
        .from('medical_records')
        .insert(recordData);

      if (error) throw error;

      setRecordForm({
        title: '',
        description: '',
        record_type: '',
        record_date: format(new Date(), 'yyyy-MM-dd'),
        cost: '',
        notes: '',
        veterinarian_name: '',
        clinic_name: ''
      });
      setShowRecordDialog(false);
      fetchMedicalRecords();
      
      toast({
        title: 'Cartella aggiornata',
        description: 'Il record medico è stato aggiunto con successo.'
      });
    } catch (error) {
      console.error('Error adding record:', error);
      toast({
        title: 'Errore',
        description: 'Errore durante l\'aggiunta del record.',
        variant: 'destructive'
      });
    }
  };

  const handleEditRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const { error } = await supabase
        .from('medical_records')
        .update({
          title: recordForm.title,
          description: recordForm.description || null,
          record_type: recordForm.record_type,
          record_date: recordForm.record_date,
          cost: recordForm.cost ? parseFloat(recordForm.cost) : null,
          notes: recordForm.notes || null,
          veterinarian: recordForm.veterinarian_name ? {
            name: recordForm.veterinarian_name,
            clinic_name: recordForm.clinic_name || null
          } : null
        })
        .eq('id', editingItem.id);

      if (error) throw error;

      setRecordForm({
        title: '',
        description: '',
        record_type: '',
        record_date: format(new Date(), 'yyyy-MM-dd'),
        cost: '',
        notes: '',
        veterinarian_name: '',
        clinic_name: ''
      });
      setEditingItem(null);
      setShowRecordDialog(false);
      fetchMedicalRecords();
      
      toast({
        title: 'Record aggiornato',
        description: 'Il record medico è stato aggiornato con successo.'
      });
    } catch (error) {
      console.error('Error updating record:', error);
      toast({
        title: 'Errore',
        description: 'Errore durante l\'aggiornamento del record.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchMedicalRecords();
      toast({
        title: 'Record eliminato',
        description: 'Il record medico è stato eliminato con successo.'
      });
    } catch (error) {
      console.error('Error deleting record:', error);
      toast({
        title: 'Errore',
        description: 'Errore durante l\'eliminazione del record.',
        variant: 'destructive'
      });
    }
  };

  // Medication functions
  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
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
        is_active: !medicationForm.end_date || isAfter(new Date(medicationForm.end_date), new Date()),
        notes: medicationForm.notes || null
      };

      const { error } = await supabase
        .from('medications')
        .insert(medicationData);

      if (error) throw error;

      setMedicationForm({
        name: '',
        dosage: '',
        frequency: '',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: '',
        notes: ''
      });
      setShowMedicationDialog(false);
      fetchMedications();
      
      toast({
        title: 'Farmaco aggiunto',
        description: 'Il farmaco è stato aggiunto al piano terapeutico.'
      });
    } catch (error) {
      console.error('Error adding medication:', error);
      toast({
        title: 'Errore',
        description: 'Errore durante l\'aggiunta del farmaco.',
        variant: 'destructive'
      });
    }
  };

  const handleEditMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const { error } = await supabase
        .from('medications')
        .update({
          name: medicationForm.name,
          dosage: medicationForm.dosage,
          frequency: medicationForm.frequency,
          start_date: medicationForm.start_date,
          end_date: medicationForm.end_date || null,
          is_active: !medicationForm.end_date || isAfter(new Date(medicationForm.end_date), new Date()),
          notes: medicationForm.notes || null
        })
        .eq('id', editingItem.id);

      if (error) throw error;

      setMedicationForm({
        name: '',
        dosage: '',
        frequency: '',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: '',
        notes: ''
      });
      setEditingItem(null);
      setShowMedicationDialog(false);
      fetchMedications();
      
      toast({
        title: 'Farmaco aggiornato',
        description: 'Il farmaco è stato aggiornato con successo.'
      });
    } catch (error) {
      console.error('Error updating medication:', error);
      toast({
        title: 'Errore',
        description: 'Errore durante l\'aggiornamento del farmaco.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteMedication = async (id: string) => {
    try {
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchMedications();
      toast({
        title: 'Farmaco eliminato',
        description: 'Il farmaco è stato rimosso dal piano terapeutico.'
      });
    } catch (error) {
      console.error('Error deleting medication:', error);
      toast({
        title: 'Errore',
        description: 'Errore durante l\'eliminazione del farmaco.',
        variant: 'destructive'
      });
    }
  };

  // Veterinarian functions
  const handleAddVet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const vetData = {
        user_id: user.id,
        name: vetForm.name,
        clinic_name: vetForm.clinic_name || null,
        phone: vetForm.phone || null,
        email: vetForm.email || null,
        address: vetForm.address || null,
        specialization: vetForm.specialization || null,
        is_primary: vetForm.is_primary
      };

      const { error } = await supabase
        .from('veterinarians')
        .insert(vetData);

      if (error) throw error;

      setVetForm({
        name: '',
        clinic_name: '',
        phone: '',
        email: '',
        address: '',
        specialization: '',
        is_primary: false
      });
      setShowVetDialog(false);
      fetchVeterinarians();
      
      toast({
        title: 'Veterinario aggiunto',
        description: 'Il veterinario è stato aggiunto alla rubrica.'
      });
    } catch (error) {
      console.error('Error adding veterinarian:', error);
      toast({
        title: 'Errore',
        description: 'Errore durante l\'aggiunta del veterinario.',
        variant: 'destructive'
      });
    }
  };

  const handleEditVet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const { error } = await supabase
        .from('veterinarians')
        .update({
          name: vetForm.name,
          clinic_name: vetForm.clinic_name || null,
          phone: vetForm.phone || null,
          email: vetForm.email || null,
          address: vetForm.address || null,
          specialization: vetForm.specialization || null,
          is_primary: vetForm.is_primary
        })
        .eq('id', editingItem.id);

      if (error) throw error;

      setVetForm({
        name: '',
        clinic_name: '',
        phone: '',
        email: '',
        address: '',
        specialization: '',
        is_primary: false
      });
      setEditingItem(null);
      setShowVetDialog(false);
      fetchVeterinarians();
      
      toast({
        title: 'Veterinario aggiornato',
        description: 'I dati del veterinario sono stati aggiornati.'
      });
    } catch (error) {
      console.error('Error updating veterinarian:', error);
      toast({
        title: 'Errore',
        description: 'Errore durante l\'aggiornamento del veterinario.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteVet = async (id: string) => {
    try {
      const { error } = await supabase
        .from('veterinarians')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchVeterinarians();
      toast({
        title: 'Veterinario eliminato',
        description: 'Il veterinario è stato rimosso dalla rubrica.'
      });
    } catch (error) {
      console.error('Error deleting veterinarian:', error);
      toast({
        title: 'Errore',
        description: 'Errore durante l\'eliminazione del veterinario.',
        variant: 'destructive'
      });
    }
  };

  // Emergency contact functions
  const handleAddEmergency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const emergencyData = {
        user_id: user.id,
        name: emergencyForm.name,
        contact_type: emergencyForm.contact_type,
        phone: emergencyForm.phone,
        relationship: emergencyForm.relationship || null,
        email: emergencyForm.email || null,
        notes: emergencyForm.notes || null
      };

      const { error } = await supabase
        .from('emergency_contacts')
        .insert(emergencyData);

      if (error) throw error;

      setEmergencyForm({
        name: '',
        contact_type: 'veterinarian',
        phone: '',
        relationship: '',
        email: '',
        notes: ''
      });
      setShowEmergencyDialog(false);
      fetchEmergencyContacts();
      
      toast({
        title: 'Contatto aggiunto',
        description: 'Il contatto di emergenza è stato aggiunto.'
      });
    } catch (error) {
      console.error('Error adding emergency contact:', error);
      toast({
        title: 'Errore',
        description: 'Errore durante l\'aggiunta del contatto.',
        variant: 'destructive'
      });
    }
  };

  const handleEditEmergency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .update({
          name: emergencyForm.name,
          contact_type: emergencyForm.contact_type,
          phone: emergencyForm.phone,
          relationship: emergencyForm.relationship || null,
          email: emergencyForm.email || null,
          notes: emergencyForm.notes || null
        })
        .eq('id', editingItem.id);

      if (error) throw error;

      setEmergencyForm({
        name: '',
        contact_type: 'veterinarian',
        phone: '',
        relationship: '',
        email: '',
        notes: ''
      });
      setEditingItem(null);
      setShowEmergencyDialog(false);
      fetchEmergencyContacts();
      
      toast({
        title: 'Contatto aggiornato',
        description: 'Il contatto di emergenza è stato aggiornato.'
      });
    } catch (error) {
      console.error('Error updating emergency contact:', error);
      toast({
        title: 'Errore',
        description: 'Errore durante l\'aggiornamento del contatto.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteEmergency = async (id: string) => {
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchEmergencyContacts();
      toast({
        title: 'Contatto eliminato',
        description: 'Il contatto di emergenza è stato eliminato.'
      });
    } catch (error) {
      console.error('Error deleting emergency contact:', error);
      toast({
        title: 'Errore',
        description: 'Errore durante l\'eliminazione del contatto.',
        variant: 'destructive'
      });
    }
  };

  // Insurance functions
  const handleAddInsurance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPet) return;

    try {
      const insuranceData = {
        user_id: user.id,
        pet_id: selectedPet.id,
        provider_name: insuranceForm.provider_name,
        policy_number: insuranceForm.policy_number,
        policy_type: insuranceForm.policy_type || null,
        start_date: insuranceForm.start_date,
        end_date: insuranceForm.end_date || null,
        premium_amount: insuranceForm.premium_amount ? parseFloat(insuranceForm.premium_amount) : null,
        deductible_amount: insuranceForm.deductible ? parseFloat(insuranceForm.deductible) : null,
        is_active: !insuranceForm.end_date || isAfter(new Date(insuranceForm.end_date), new Date())
      };

      const { error } = await supabase
        .from('insurance_policies')
        .insert(insuranceData);

      if (error) throw error;

      setInsuranceForm({
        provider_name: '',
        policy_number: '',
        policy_type: '',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: '',
        premium_amount: '',
        deductible: ''
      });
      setShowInsuranceDialog(false);
      fetchInsurances();
      
      toast({
        title: 'Assicurazione aggiunta',
        description: 'La polizza assicurativa è stata registrata.'
      });
    } catch (error) {
      console.error('Error adding insurance:', error);
      toast({
        title: 'Errore',
        description: 'Errore durante l\'aggiunta dell\'assicurazione.',
        variant: 'destructive'
      });
    }
  };

  const handleEditInsurance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const { error } = await supabase
        .from('insurance_policies')
        .update({
          provider_name: insuranceForm.provider_name,
          policy_number: insuranceForm.policy_number,
          policy_type: insuranceForm.policy_type || null,
          start_date: insuranceForm.start_date,
          end_date: insuranceForm.end_date || null,
          premium_amount: insuranceForm.premium_amount ? parseFloat(insuranceForm.premium_amount) : null,
          deductible_amount: insuranceForm.deductible ? parseFloat(insuranceForm.deductible) : null,
          is_active: !insuranceForm.end_date || isAfter(new Date(insuranceForm.end_date), new Date())
        })
        .eq('id', editingItem.id);

      if (error) throw error;

      setInsuranceForm({
        provider_name: '',
        policy_number: '',
        policy_type: '',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: '',
        premium_amount: '',
        deductible: ''
      });
      setEditingItem(null);
      setShowInsuranceDialog(false);
      fetchInsurances();
      
      toast({
        title: 'Assicurazione aggiornata',
        description: 'La polizza assicurativa è stata aggiornata.'
      });
    } catch (error) {
      console.error('Error updating insurance:', error);
      toast({
        title: 'Errore',
        description: 'Errore durante l\'aggiornamento dell\'assicurazione.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteInsurance = async (id: string) => {
    try {
      const { error } = await supabase
        .from('insurance_policies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchInsurances();
      toast({
        title: 'Assicurazione eliminata',
        description: 'La polizza assicurativa è stata eliminata.'
      });
    } catch (error) {
      console.error('Error deleting insurance:', error);
      toast({
        title: 'Errore',
        description: 'Errore durante l\'eliminazione dell\'assicurazione.',
        variant: 'destructive'
      });
    }
  };

  // File upload handler
  const handleFileUpload = async (files: File[], category: string, recordId?: string) => {
    setUploading(true);
    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user!.id}/${selectedPet!.id}/${category}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('medical-documents')
          .upload(fileName, file);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('medical-documents')
          .getPublicUrl(fileName);
        
        // Update record with document URL if recordId provided
        if (recordId) {
          await supabase
            .from('medical_records')
            .update({ document_url: publicUrl })
            .eq('id', recordId);
        }
      }
      
      toast({
        title: 'File caricato',
        description: 'Il documento è stato caricato con successo.'
      });
      
      if (recordId) {
        fetchMedicalRecords();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Errore upload',
        description: 'Errore durante il caricamento del file.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  // Export PDF report
  const exportPDF = async () => {
    try {
      const pdf = new jsPDF();
      
      // Header
      pdf.setFontSize(20);
      pdf.text(`Report Salute - ${selectedPet?.name}`, 20, 30);
      
      pdf.setFontSize(12);
      pdf.text(`Generato il: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 20, 45);
      
      let yPosition = 60;
      
      // Health Metrics Summary
      if (healthMetrics.length > 0) {
        pdf.setFontSize(16);
        pdf.text('Metriche di Salute', 20, yPosition);
        yPosition += 20;
        
        healthMetrics.slice(0, 10).forEach((metric) => {
          pdf.setFontSize(10);
          pdf.text(
            `${translateMetricType(metric.metric_type)}: ${metric.value} ${metric.unit} - ${format(new Date(metric.recorded_at), 'dd/MM/yyyy')}`,
            20,
            yPosition
          );
          yPosition += 15;
        });
      }
      
      // Medical Records Summary
      if (medicalRecords.length > 0) {
        yPosition += 10;
        pdf.setFontSize(16);
        pdf.text('Record Medici', 20, yPosition);
        yPosition += 20;
        
        medicalRecords.slice(0, 5).forEach((record) => {
          pdf.setFontSize(10);
          pdf.text(
            `${record.title} - ${translateRecordType(record.record_type)} - ${format(new Date(record.record_date), 'dd/MM/yyyy')}`,
            20,
            yPosition
          );
          yPosition += 15;
        });
      }
      
      pdf.save(`wellness-report-${selectedPet?.name}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      
      toast({
        title: 'Report esportato',
        description: 'Il report è stato scaricato con successo.'
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: 'Errore export',
        description: 'Errore durante l\'esportazione del report.',
        variant: 'destructive'
      });
    }
  };

  // Filter functions
  const filteredHealthMetrics = useMemo(() => {
    return healthMetrics.filter(metric => {
      const matchesSearch = searchTerm === '' || 
        translateMetricType(metric.metric_type).toLowerCase().includes(searchTerm.toLowerCase()) ||
        metric.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const metricDate = new Date(metric.recorded_at);
      const matchesDateFilter = (!dateFilter.start || metricDate >= dateFilter.start) &&
                               (!dateFilter.end || metricDate <= dateFilter.end);
      
      return matchesSearch && matchesDateFilter;
    });
  }, [healthMetrics, searchTerm, dateFilter]);

  const filteredMedicalRecords = useMemo(() => {
    return medicalRecords.filter(record => {
      const matchesSearch = searchTerm === '' || 
        record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = recordTypeFilter === '' || record.record_type === recordTypeFilter;
      
      const recordDate = new Date(record.record_date);
      const matchesDateFilter = (!dateFilter.start || recordDate >= dateFilter.start) &&
                               (!dateFilter.end || recordDate <= dateFilter.end);
      
      return matchesSearch && matchesType && matchesDateFilter;
    });
  }, [medicalRecords, searchTerm, recordTypeFilter, dateFilter]);

  const filteredMedications = useMemo(() => {
    return medications.filter(medication => {
      const matchesSearch = searchTerm === '' || 
        medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medication.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [medications, searchTerm]);

  // Edit handlers
  const startEditMetric = (metric: HealthMetric) => {
    setEditingItem(metric);
    setMetricForm({
      metric_type: metric.metric_type,
      value: metric.value.toString(),
      unit: metric.unit,
      notes: metric.notes || ''
    });
    setShowMetricDialog(true);
  };

  const startEditRecord = (record: MedicalRecord) => {
    setEditingItem(record);
    setRecordForm({
      title: record.title,
      description: record.description || '',
      record_type: record.record_type,
      record_date: record.record_date,
      cost: record.cost?.toString() || '',
      notes: record.notes || '',
      veterinarian_name: record.veterinarian?.name || '',
      clinic_name: record.veterinarian?.clinic_name || ''
    });
    setShowRecordDialog(true);
  };

  const startEditMedication = (medication: Medication) => {
    setEditingItem(medication);
    setMedicationForm({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      start_date: medication.start_date,
      end_date: medication.end_date || '',
      notes: medication.notes || ''
    });
    setShowMedicationDialog(true);
  };

  const startEditVet = (vet: Veterinarian) => {
    setEditingItem(vet);
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

  const startEditEmergency = (contact: EmergencyContact) => {
    setEditingItem(contact);
    setEmergencyForm({
      name: contact.name,
      contact_type: contact.contact_type,
      phone: contact.phone,
      relationship: contact.relationship || '',
      email: contact.email || '',
      notes: contact.notes || ''
    });
    setShowEmergencyDialog(true);
  };

  const startEditInsurance = (insurance: Insurance) => {
    setEditingItem(insurance);
    setInsuranceForm({
      provider_name: insurance.provider_name,
      policy_number: insurance.policy_number,
      policy_type: insurance.policy_type || '',
      start_date: insurance.start_date,
      end_date: insurance.end_date || '',
      premium_amount: insurance.premium_amount?.toString() || '',
      deductible: insurance.deductible?.toString() || ''
    });
    setShowInsuranceDialog(true);
  };

  // Chart data preparation
  const healthTrendData = useMemo(() => {
    if (healthMetrics.length === 0) return [];
    
    const last30Days = subDays(new Date(), 30);
    const recentMetrics = healthMetrics.filter(metric => 
      new Date(metric.recorded_at) >= last30Days
    );
    
    // Group by date and metric type
    const groupedData = recentMetrics.reduce((acc, metric) => {
      const date = format(new Date(metric.recorded_at), 'dd/MM');
      if (!acc[date]) acc[date] = { date };
      acc[date][metric.metric_type] = metric.value;
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(groupedData).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [healthMetrics]);

  const emotionDistributionData = useMemo(() => {
    const analysesWithEmotions = diaryEntries.filter(entry => entry.mood_score);
    if (analysesWithEmotions.length === 0) return [];
    
    const emotionCounts: EmotionCount = {};
    analysesWithEmotions.forEach(entry => {
      // Simple mapping based on mood score
      let emotion = 'neutrale';
      if (entry.mood_score! >= 8) emotion = 'felice';
      else if (entry.mood_score! >= 6) emotion = 'calmo';
      else if (entry.mood_score! >= 4) emotion = 'ansioso';
      else emotion = 'triste';
      
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });
    
    return Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion,
      count,
      color: EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS] || '#6b7280'
    }));
  }, [diaryEntries]);

  // Reset forms when closing dialogs
  const resetMetricForm = () => {
    setMetricForm({ metric_type: '', value: '', unit: '', notes: '' });
    setEditingItem(null);
  };

  const resetRecordForm = () => {
    setRecordForm({
      title: '',
      description: '',
      record_type: '',
      record_date: format(new Date(), 'yyyy-MM-dd'),
      cost: '',
      notes: '',
      veterinarian_name: '',
      clinic_name: ''
    });
    setEditingItem(null);
  };

  const resetMedicationForm = () => {
    setMedicationForm({
      name: '',
      dosage: '',
      frequency: '',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: '',
      notes: ''
    });
    setEditingItem(null);
  };

  const resetVetForm = () => {
    setVetForm({
      name: '',
      clinic_name: '',
      phone: '',
      email: '',
      address: '',
      specialization: '',
      is_primary: false
    });
    setEditingItem(null);
  };

  const resetEmergencyForm = () => {
    setEmergencyForm({
      name: '',
      contact_type: 'veterinarian',
      phone: '',
      relationship: '',
      email: '',
      notes: ''
    });
    setEditingItem(null);
  };

  const resetInsuranceForm = () => {
    setInsuranceForm({
      provider_name: '',
      policy_number: '',
      policy_type: '',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: '',
      premium_amount: '',
      deductible: ''
    });
    setEditingItem(null);
  };

  // Show loading if no user or pets
  if (!user || pets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <PawPrint className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {!user ? 'Caricamento...' : 'Aggiungi un pet per iniziare'}
          </p>
        </div>
      </div>
    );
  }

  if (!selectedPet) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <PawPrint className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Seleziona un pet per visualizzare i dati di salute</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary" />
            Salute e Benessere
          </h1>
          <p className="text-muted-foreground">
            Monitora la salute di {selectedPet.name} in modo completo
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={exportPDF}
            className="hidden md:flex"
          >
            <Download className="h-4 w-4 mr-2" />
            Esporta Report
          </Button>
          <Button variant="outline" onClick={() => setActiveTab('emergency')}>
            <Siren className="h-4 w-4 mr-2" />
            Emergenza
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="dashboard">
            <Gauge className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="metrics">
            <Activity className="h-4 w-4 mr-2" />
            Parametri
          </TabsTrigger>
          <TabsTrigger value="records">
            <FileText className="h-4 w-4 mr-2" />
            Cartella
          </TabsTrigger>
          <TabsTrigger value="medications">
            <Pill className="h-4 w-4 mr-2" />
            Farmaci
          </TabsTrigger>
          <TabsTrigger value="contacts">
            <Phone className="h-4 w-4 mr-2" />
            Contatti
          </TabsTrigger>
          <TabsTrigger value="emergency">
            <Siren className="h-4 w-4 mr-2" />
            Primo Soccorso
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Unified Health Score Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Punteggio Salute Globale
                </CardTitle>
                <CardDescription>
                  Valutazione complessiva basata su tutti i dati disponibili
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UnifiedHealthScore 
                  selectedPet={selectedPet} 
                  user={user} 
                  addNotification={addNotification}
                />
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5" />
                  Statistiche Rapide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Parametri registrati</span>
                  <Badge variant="secondary">{healthMetrics.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Visite mediche</span>
                  <Badge variant="secondary">{medicalRecords.filter(r => r.record_type === 'visit').length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Farmaci attivi</span>
                  <Badge variant="secondary">{medications.filter(m => m.is_active).length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Ultimo controllo</span>
                  <span className="text-sm text-muted-foreground">
                    {medicalRecords.length > 0
                      ? format(new Date(medicalRecords[0].record_date), 'dd/MM/yyyy')
                      : 'Nessuno'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Attività Recenti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Recent health metrics */}
                  {healthMetrics.slice(0, 3).map((metric) => (
                    <div key={metric.id} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <div className="flex-1">
                        <p className="font-medium">{translateMetricType(metric.metric_type)}</p>
                        <p className="text-muted-foreground text-xs">
                          {metric.value} {metric.unit} • {format(new Date(metric.recorded_at), 'dd/MM HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Recent medical records */}
                  {medicalRecords.slice(0, 2).map((record) => (
                    <div key={record.id} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-secondary"></div>
                      <div className="flex-1">
                        <p className="font-medium">{record.title}</p>
                        <p className="text-muted-foreground text-xs">
                          {translateRecordType(record.record_type)} • {format(new Date(record.record_date), 'dd/MM/yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {healthMetrics.length === 0 && medicalRecords.length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-4">
                      Nessuna attività recente
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Health Trends Charts */}
          {healthTrendData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChartIcon className="h-5 w-5" />
                    Tendenze Parametri Vitali
                  </CardTitle>
                  <CardDescription>
                    Ultimi 30 giorni
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={healthTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        {/* Temperature line */}
                        {healthTrendData.some(d => d.temperature) && (
                          <Line 
                            type="monotone" 
                            dataKey="temperature" 
                            stroke="#ef4444" 
                            name="Temperatura (°C)"
                            connectNulls={false}
                          />
                        )}
                        {/* Heart rate line */}
                        {healthTrendData.some(d => d.heart_rate) && (
                          <Line 
                            type="monotone" 
                            dataKey="heart_rate" 
                            stroke="#3b82f6" 
                            name="Frequenza Cardiaca"
                            connectNulls={false}
                          />
                        )}
                        {/* Weight line */}
                        {healthTrendData.some(d => d.weight) && (
                          <Line 
                            type="monotone" 
                            dataKey="weight" 
                            stroke="#22c55e" 
                            name="Peso (kg)"
                            connectNulls={false}
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {emotionDistributionData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5" />
                      Distribuzione Stato d'Animo
                    </CardTitle>
                    <CardDescription>
                      Basato sui dati del diario
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{}} className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={emotionDistributionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ emotion, count }) => `${emotion}: ${count}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {emotionDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => setShowMetricDialog(true)}
            >
              <Activity className="h-6 w-6" />
              <span className="text-sm">Aggiungi Parametro</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => setShowRecordDialog(true)}
            >
              <FileText className="h-6 w-6" />
              <span className="text-sm">Nuovo Record</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => setShowMedicationDialog(true)}
            >
              <Pill className="h-6 w-6" />
              <span className="text-sm">Aggiungi Farmaco</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => setShowDiaryDialog(true)}
            >
              <BookOpen className="h-6 w-6" />
              <span className="text-sm">Diario Giornaliero</span>
            </Button>
          </div>
        </TabsContent>

        {/* Health Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Parametri Vitali</h3>
              <p className="text-muted-foreground">Monitora i parametri di salute di {selectedPet.name}</p>
            </div>
            <Button onClick={() => setShowMetricDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Parametro
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca parametri..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Input
                type="date"
                placeholder="Data inizio"
                value={dateFilter.start ? format(dateFilter.start, 'yyyy-MM-dd') : ''}
                onChange={(e) => setDateFilter(prev => ({ 
                  ...prev, 
                  start: e.target.value ? new Date(e.target.value) : undefined 
                }))}
              />
              <Input
                type="date"
                placeholder="Data fine"
                value={dateFilter.end ? format(dateFilter.end, 'yyyy-MM-dd') : ''}
                onChange={(e) => setDateFilter(prev => ({ 
                  ...prev, 
                  end: e.target.value ? new Date(e.target.value) : undefined 
                }))}
              />
            </div>
          </div>

          {/* Health Metrics List */}
          <div className="space-y-4">
            {filteredHealthMetrics.length > 0 ? (
              filteredHealthMetrics.map((metric) => {
                const evaluation = evaluateVitalParameter(metric.metric_type, metric.value, selectedPet.type);
                return (
                  <Card key={metric.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{translateMetricType(metric.metric_type)}</h4>
                            <Badge 
                              variant={evaluation.status === 'normal' ? 'default' : 
                                     evaluation.status === 'warning' ? 'secondary' : 'destructive'}
                            >
                              {evaluation.status === 'normal' ? 'Normale' : 
                               evaluation.status === 'warning' ? 'Attenzione' : 'Critico'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Valore</p>
                              <p className="font-medium">
                                {metric.metric_type === 'gum_color' 
                                  ? getGumColorText(metric.value)
                                  : `${metric.value} ${metric.unit}`
                                }
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Data registrazione</p>
                              <p className="font-medium">
                                {format(new Date(metric.recorded_at), 'dd/MM/yyyy HH:mm')}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Valutazione</p>
                              <p className={`font-medium ${
                                evaluation.status === 'normal' ? 'text-green-600' :
                                evaluation.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {evaluation.message}
                              </p>
                            </div>
                          </div>
                          {metric.notes && (
                            <div className="mt-2">
                              <p className="text-sm text-muted-foreground">Note</p>
                              <p className="text-sm">{metric.notes}</p>
                            </div>
                          )}
                          {evaluation.recommendation && (
                            <Alert className="mt-2">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                {evaluation.recommendation}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditMetric(metric)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm({ type: 'metric', id: metric.id })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nessun parametro registrato</h3>
                  <p className="text-muted-foreground mb-4">
                    Inizia a monitorare la salute di {selectedPet.name} aggiungendo i primi parametri vitali.
                  </p>
                  <Button onClick={() => setShowMetricDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi Primo Parametro
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Medical Records Tab */}
        <TabsContent value="records" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Cartella Clinica</h3>
              <p className="text-muted-foreground">Storia medica completa di {selectedPet.name}</p>
            </div>
            <Button onClick={() => setShowRecordDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Record
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca nei record..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={recordTypeFilter} onValueChange={setRecordTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo record" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tutti i tipi</SelectItem>
                <SelectItem value="visit">Visite</SelectItem>
                <SelectItem value="exam">Esami</SelectItem>
                <SelectItem value="vaccination">Vaccini</SelectItem>
                <SelectItem value="surgery">Operazioni</SelectItem>
                <SelectItem value="treatment">Trattamenti</SelectItem>
                <SelectItem value="emergency">Emergenze</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input
                type="date"
                placeholder="Data inizio"
                value={dateFilter.start ? format(dateFilter.start, 'yyyy-MM-dd') : ''}
                onChange={(e) => setDateFilter(prev => ({ 
                  ...prev, 
                  start: e.target.value ? new Date(e.target.value) : undefined 
                }))}
              />
              <Input
                type="date"
                placeholder="Data fine"
                value={dateFilter.end ? format(dateFilter.end, 'yyyy-MM-dd') : ''}
                onChange={(e) => setDateFilter(prev => ({ 
                  ...prev, 
                  end: e.target.value ? new Date(e.target.value) : undefined 
                }))}
              />
            </div>
          </div>

          {/* Medical Records List */}
          <div className="space-y-4">
            {filteredMedicalRecords.length > 0 ? (
              filteredMedicalRecords.map((record) => (
                <Card key={record.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{record.title}</h4>
                          <Badge variant="outline">
                            {translateRecordType(record.record_type)}
                          </Badge>
                          {record.cost && (
                            <Badge variant="secondary">
                              €{record.cost.toFixed(2)}
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Data</p>
                            <p className="font-medium">
                              {format(new Date(record.record_date), 'dd/MM/yyyy')}
                            </p>
                          </div>
                          {record.veterinarian && (
                            <div>
                              <p className="text-sm text-muted-foreground">Veterinario</p>
                              <p className="font-medium">{record.veterinarian.name}</p>
                              {record.veterinarian.clinic_name && (
                                <p className="text-sm text-muted-foreground">
                                  {record.veterinarian.clinic_name}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        {record.description && (
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground">Descrizione</p>
                            <p className="text-sm">{record.description}</p>
                          </div>
                        )}
                        {record.notes && (
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground">Note</p>
                            <p className="text-sm">{record.notes}</p>
                          </div>
                        )}
                        {record.document_url && (
                          <div className="mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <a 
                                href={record.document_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                              >
                                <FileImage className="h-4 w-4" />
                                Visualizza Documento
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!record.document_url && (
                          <MultiFileUploader
                            bucketName="medical-records"
                            maxFiles={1}
                            acceptedTypes={['.jpg', '.jpeg', '.png', '.pdf']}
                            onFilesChanged={(files) => {
                              if (files.length > 0) {
                                console.log('Medical record uploaded:', files[0]);
                              }
                            }}
                          />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditRecord(record)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm({ type: 'record', id: record.id })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nessun record medico</h3>
                  <p className="text-muted-foreground mb-4">
                    Inizia a tenere traccia della storia medica di {selectedPet.name}.
                  </p>
                  <Button onClick={() => setShowRecordDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi Primo Record
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Piano Terapeutico</h3>
              <p className="text-muted-foreground">Gestisci farmaci e trattamenti di {selectedPet.name}</p>
            </div>
            <Button onClick={() => setShowMedicationDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Farmaco
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca farmaci..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Active Medications */}
          <div>
            <h4 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Pill className="h-5 w-5 text-green-600" />
              Farmaci Attivi
            </h4>
            <div className="space-y-4">
              {filteredMedications.filter(med => med.is_active).length > 0 ? (
                filteredMedications.filter(med => med.is_active).map((medication) => (
                  <Card key={medication.id} className="border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{medication.name}</h4>
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Attivo
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Dosaggio</p>
                              <p className="font-medium">{medication.dosage}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Frequenza</p>
                              <p className="font-medium">{medication.frequency}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Periodo</p>
                              <p className="font-medium">
                                {format(new Date(medication.start_date), 'dd/MM/yyyy')} - 
                                {medication.end_date 
                                  ? format(new Date(medication.end_date), 'dd/MM/yyyy')
                                  : 'Indefinito'
                                }
                              </p>
                            </div>
                          </div>
                          {medication.notes && (
                            <div className="mt-2">
                              <p className="text-sm text-muted-foreground">Note</p>
                              <p className="text-sm">{medication.notes}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditMedication(medication)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm({ type: 'medication', id: medication.id })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <Pill className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Nessun farmaco attivo</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Inactive Medications */}
          {filteredMedications.filter(med => !med.is_active).length > 0 && (
            <div>
              <h4 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Pill className="h-5 w-5 text-gray-600" />
                Farmaci Sospesi
              </h4>
              <div className="space-y-4">
                {filteredMedications.filter(med => !med.is_active).map((medication) => (
                  <Card key={medication.id} className="border-gray-200 opacity-75">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{medication.name}</h4>
                            <Badge variant="secondary">
                              Sospeso
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Dosaggio</p>
                              <p className="font-medium">{medication.dosage}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Frequenza</p>
                              <p className="font-medium">{medication.frequency}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Periodo</p>
                              <p className="font-medium">
                                {format(new Date(medication.start_date), 'dd/MM/yyyy')} - 
                                {medication.end_date 
                                  ? format(new Date(medication.end_date), 'dd/MM/yyyy')
                                  : 'Indefinito'
                                }
                              </p>
                            </div>
                          </div>
                          {medication.notes && (
                            <div className="mt-2">
                              <p className="text-sm text-muted-foreground">Note</p>
                              <p className="text-sm">{medication.notes}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditMedication(medication)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm({ type: 'medication', id: medication.id })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {filteredMedications.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Pill className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nessun farmaco registrato</h3>
                <p className="text-muted-foreground mb-4">
                  Inizia a tenere traccia dei farmaci e trattamenti di {selectedPet.name}.
                </p>
                <Button onClick={() => setShowMedicationDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Primo Farmaco
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Veterinarians */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Veterinari
                </h3>
                <Button variant="outline" onClick={() => setShowVetDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi
                </Button>
              </div>
              
              <div className="space-y-3">
                {veterinarians.length > 0 ? (
                  veterinarians.map((vet) => (
                    <Card key={vet.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{vet.name}</h4>
                              {vet.is_primary && (
                                <Badge variant="default">
                                  Primario
                                </Badge>
                              )}
                            </div>
                            {vet.clinic_name && (
                              <p className="text-sm text-muted-foreground mb-2">{vet.clinic_name}</p>
                            )}
                            {vet.specialization && (
                              <p className="text-sm text-muted-foreground mb-2">
                                Specializzazione: {vet.specialization}
                              </p>
                            )}
                            <div className="space-y-1">
                              {vet.phone && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="h-3 w-3" />
                                  <a href={`tel:${vet.phone}`} className="text-primary hover:underline">
                                    {vet.phone}
                                  </a>
                                </div>
                              )}
                              {vet.email && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="h-3 w-3" />
                                  <a href={`mailto:${vet.email}`} className="text-primary hover:underline">
                                    {vet.email}
                                  </a>
                                </div>
                              )}
                              {vet.address && (
                                <div className="flex items-center gap-2 text-sm">
                                  <MapPin className="h-3 w-3" />
                                  <span className="text-muted-foreground">{vet.address}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditVet(vet)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirm({ type: 'vet', id: vet.id })}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                      <Stethoscope className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Nessun veterinario aggiunto</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Siren className="h-5 w-5" />
                  Contatti di Emergenza
                </h3>
                <Button variant="outline" onClick={() => setShowEmergencyDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi
                </Button>
              </div>
              
              <div className="space-y-3">
                {emergencyContacts.length > 0 ? (
                  emergencyContacts.map((contact) => (
                    <Card key={contact.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{contact.name}</h4>
                              <Badge variant="outline">
                                {contact.contact_type}
                              </Badge>
                            </div>
                            {contact.relationship && (
                              <p className="text-sm text-muted-foreground mb-2">{contact.relationship}</p>
                            )}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3 w-3" />
                                <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                                  {contact.phone}
                                </a>
                              </div>
                              {contact.email && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="h-3 w-3" />
                                  <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                                    {contact.email}
                                  </a>
                                </div>
                              )}
                            </div>
                            {contact.notes && (
                              <p className="text-sm text-muted-foreground mt-2">{contact.notes}</p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditEmergency(contact)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirm({ type: 'emergency', id: contact.id })}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                      <Siren className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Nessun contatto di emergenza</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>

          {/* Insurance Policies */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Assicurazioni
              </h3>
              <Button variant="outline" onClick={() => setShowInsuranceDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi Polizza
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {insurances.length > 0 ? (
                insurances.map((insurance) => (
                  <Card key={insurance.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{insurance.provider_name}</h4>
                            <Badge variant={insurance.is_active ? 'default' : 'secondary'}>
                              {insurance.is_active ? 'Attiva' : 'Scaduta'}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm text-muted-foreground">Numero Polizza</p>
                              <p className="font-medium">{insurance.policy_number}</p>
                            </div>
                            {insurance.policy_type && (
                              <div>
                                <p className="text-sm text-muted-foreground">Tipo</p>
                                <p className="font-medium">{insurance.policy_type}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-muted-foreground">Periodo</p>
                              <p className="font-medium">
                                {format(new Date(insurance.start_date), 'dd/MM/yyyy')} - 
                                {insurance.end_date 
                                  ? format(new Date(insurance.end_date), 'dd/MM/yyyy')
                                  : 'Indefinito'
                                }
                              </p>
                            </div>
                            {insurance.premium_amount && (
                              <div>
                                <p className="text-sm text-muted-foreground">Premio Annuale</p>
                                <p className="font-medium">€{insurance.premium_amount.toFixed(2)}</p>
                              </div>
                            )}
                            {insurance.deductible && (
                              <div>
                                <p className="text-sm text-muted-foreground">Franchigia</p>
                                <p className="font-medium">€{insurance.deductible.toFixed(2)}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditInsurance(insurance)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm({ type: 'insurance', id: insurance.id })}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-dashed lg:col-span-2">
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <Shield className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Nessuna assicurazione registrata</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Emergency Tab */}
        <TabsContent value="emergency" className="space-y-6">
          <FirstAidGuide open={true} onOpenChange={() => {}} />
        </TabsContent>
      </Tabs>

      {/* Add Health Metric Dialog */}
      <Dialog open={showMetricDialog} onOpenChange={(open) => {
        setShowMetricDialog(open);
        if (!open) resetMetricForm();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Modifica Parametro' : 'Aggiungi Parametro Vitale'}
            </DialogTitle>
            <DialogDescription>
              Registra un nuovo parametro di salute per {selectedPet?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editingItem ? handleEditMetric : handleAddMetric} className="space-y-4">
            <div>
              <Label htmlFor="metric_type">Tipo di Parametro</Label>
              <Select value={metricForm.metric_type} onValueChange={(value) => 
                setMetricForm(prev => ({ ...prev, metric_type: value, unit: getMetricUnit(value) }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo parametro" />
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
                <Select value={metricForm.value} onValueChange={(value) => 
                  setMetricForm(prev => ({ ...prev, value }))
                }>
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
                  onChange={(e) => setMetricForm(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="Inserisci valore"
                  required
                />
              )}
            </div>

            {!isDropdownMetric(metricForm.metric_type) && (
              <div>
                <Label htmlFor="unit">Unità di Misura</Label>
                <Input
                  id="unit"
                  value={metricForm.unit}
                  onChange={(e) => setMetricForm(prev => ({ ...prev, unit: e.target.value }))}
                  placeholder="Es: °C, bpm, kg"
                  readOnly={getMetricUnit(metricForm.metric_type) !== ''}
                />
              </div>
            )}

            <div>
              <Label htmlFor="notes">Note (opzionale)</Label>
              <Textarea
                id="notes"
                value={metricForm.notes}
                onChange={(e) => setMetricForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Note aggiuntive..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowMetricDialog(false)}>
                Annulla
              </Button>
              <Button type="submit" disabled={!metricForm.metric_type || !metricForm.value}>
                {editingItem ? 'Aggiorna' : 'Aggiungi'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Medical Record Dialog */}
      <Dialog open={showRecordDialog} onOpenChange={(open) => {
        setShowRecordDialog(open);
        if (!open) resetRecordForm();
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Modifica Record' : 'Nuovo Record Medico'}
            </DialogTitle>
            <DialogDescription>
              Aggiungi un record alla cartella clinica di {selectedPet?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editingItem ? handleEditRecord : handleAddRecord} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Titolo</Label>
                <Input
                  id="title"
                  value={recordForm.title}
                  onChange={(e) => setRecordForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Es: Controllo annuale"
                  required
                />
              </div>
              <div>
                <Label htmlFor="record_type">Tipo</Label>
                <Select value={recordForm.record_type} onValueChange={(value) => 
                  setRecordForm(prev => ({ ...prev, record_type: value }))
                }>
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
            </div>

            <div>
              <Label htmlFor="description">Descrizione</Label>
              <Textarea
                id="description"
                value={recordForm.description}
                onChange={(e) => setRecordForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrizione dettagliata..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="record_date">Data</Label>
                <Input
                  id="record_date"
                  type="date"
                  value={recordForm.record_date}
                  onChange={(e) => setRecordForm(prev => ({ ...prev, record_date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cost">Costo (€)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={recordForm.cost}
                  onChange={(e) => setRecordForm(prev => ({ ...prev, cost: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="veterinarian_name">Veterinario</Label>
                <Input
                  id="veterinarian_name"
                  value={recordForm.veterinarian_name}
                  onChange={(e) => setRecordForm(prev => ({ ...prev, veterinarian_name: e.target.value }))}
                  placeholder="Nome veterinario"
                />
              </div>
              <div>
                <Label htmlFor="clinic_name">Clinica</Label>
                <Input
                  id="clinic_name"
                  value={recordForm.clinic_name}
                  onChange={(e) => setRecordForm(prev => ({ ...prev, clinic_name: e.target.value }))}
                  placeholder="Nome clinica"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="record_notes">Note</Label>
              <Textarea
                id="record_notes"
                value={recordForm.notes}
                onChange={(e) => setRecordForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Note aggiuntive..."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowRecordDialog(false)}>
                Annulla
              </Button>
              <Button type="submit" disabled={!recordForm.title || !recordForm.record_type}>
                {editingItem ? 'Aggiorna' : 'Aggiungi'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Medication Dialog */}
      <Dialog open={showMedicationDialog} onOpenChange={(open) => {
        setShowMedicationDialog(open);
        if (!open) resetMedicationForm();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Modifica Farmaco' : 'Aggiungi Farmaco'}
            </DialogTitle>
            <DialogDescription>
              Aggiungi un farmaco al piano terapeutico di {selectedPet?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editingItem ? handleEditMedication : handleAddMedication} className="space-y-4">
            <div>
              <Label htmlFor="med_name">Nome Farmaco</Label>
              <Input
                id="med_name"
                value={medicationForm.name}
                onChange={(e) => setMedicationForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Es: Antibiotico XY"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dosage">Dosaggio</Label>
                <Input
                  id="dosage"
                  value={medicationForm.dosage}
                  onChange={(e) => setMedicationForm(prev => ({ ...prev, dosage: e.target.value }))}
                  placeholder="Es: 5mg"
                  required
                />
              </div>
              <div>
                <Label htmlFor="frequency">Frequenza</Label>
                <Input
                  id="frequency"
                  value={medicationForm.frequency}
                  onChange={(e) => setMedicationForm(prev => ({ ...prev, frequency: e.target.value }))}
                  placeholder="Es: 2 volte al giorno"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Data Inizio</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={medicationForm.start_date}
                  onChange={(e) => setMedicationForm(prev => ({ ...prev, start_date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_date">Data Fine (opzionale)</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={medicationForm.end_date}
                  onChange={(e) => setMedicationForm(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="med_notes">Note</Label>
              <Textarea
                id="med_notes"
                value={medicationForm.notes}
                onChange={(e) => setMedicationForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Istruzioni speciali..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowMedicationDialog(false)}>
                Annulla
              </Button>
              <Button type="submit" disabled={!medicationForm.name || !medicationForm.dosage || !medicationForm.frequency}>
                {editingItem ? 'Aggiorna' : 'Aggiungi'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Veterinarian Dialog */}
      <Dialog open={showVetDialog} onOpenChange={(open) => {
        setShowVetDialog(open);
        if (!open) resetVetForm();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Modifica Veterinario' : 'Aggiungi Veterinario'}
            </DialogTitle>
            <DialogDescription>
              Aggiungi un veterinario alla tua rubrica
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editingItem ? handleEditVet : handleAddVet} className="space-y-4">
            <div>
              <Label htmlFor="vet_name">Nome</Label>
              <Input
                id="vet_name"
                value={vetForm.name}
                onChange={(e) => setVetForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Dr. Nome Cognome"
                required
              />
            </div>

            <div>
              <Label htmlFor="clinic_name">Nome Clinica</Label>
              <Input
                id="clinic_name"
                value={vetForm.clinic_name}
                onChange={(e) => setVetForm(prev => ({ ...prev, clinic_name: e.target.value }))}
                placeholder="Clinica Veterinaria ABC"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vet_phone">Telefono</Label>
                <Input
                  id="vet_phone"
                  value={vetForm.phone}
                  onChange={(e) => setVetForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+39 123 456 7890"
                />
              </div>
              <div>
                <Label htmlFor="vet_email">Email</Label>
                <Input
                  id="vet_email"
                  type="email"
                  value={vetForm.email}
                  onChange={(e) => setVetForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="vet@clinica.it"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Indirizzo</Label>
              <Input
                id="address"
                value={vetForm.address}
                onChange={(e) => setVetForm(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Via Roma 123, 00100 Roma"
              />
            </div>

            <div>
              <Label htmlFor="specialization">Specializzazione</Label>
              <Input
                id="specialization"
                value={vetForm.specialization}
                onChange={(e) => setVetForm(prev => ({ ...prev, specialization: e.target.value }))}
                placeholder="Es: Cardiologia, Oncologia"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_primary"
                checked={vetForm.is_primary}
                onCheckedChange={(checked) => setVetForm(prev => ({ ...prev, is_primary: checked as boolean }))}
              />
              <Label htmlFor="is_primary">Veterinario principale</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowVetDialog(false)}>
                Annulla
              </Button>
              <Button type="submit" disabled={!vetForm.name}>
                {editingItem ? 'Aggiorna' : 'Aggiungi'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Emergency Contact Dialog */}
      <Dialog open={showEmergencyDialog} onOpenChange={(open) => {
        setShowEmergencyDialog(open);
        if (!open) resetEmergencyForm();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Modifica Contatto' : 'Aggiungi Contatto di Emergenza'}
            </DialogTitle>
            <DialogDescription>
              Aggiungi un contatto per le emergenze
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editingItem ? handleEditEmergency : handleAddEmergency} className="space-y-4">
            <div>
              <Label htmlFor="emergency_name">Nome</Label>
              <Input
                id="emergency_name"
                value={emergencyForm.name}
                onChange={(e) => setEmergencyForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome del contatto"
                required
              />
            </div>

            <div>
              <Label htmlFor="contact_type">Tipo Contatto</Label>
              <Select value={emergencyForm.contact_type} onValueChange={(value) => 
                setEmergencyForm(prev => ({ ...prev, contact_type: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="veterinarian">Veterinario</SelectItem>
                  <SelectItem value="clinic">Clinica</SelectItem>
                  <SelectItem value="family">Familiare</SelectItem>
                  <SelectItem value="friend">Amico</SelectItem>
                  <SelectItem value="pet_sitter">Pet Sitter</SelectItem>
                  <SelectItem value="other">Altro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="emergency_phone">Telefono</Label>
              <Input
                id="emergency_phone"
                value={emergencyForm.phone}
                onChange={(e) => setEmergencyForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+39 123 456 7890"
                required
              />
            </div>

            <div>
              <Label htmlFor="relationship">Relazione</Label>
              <Input
                id="relationship"
                value={emergencyForm.relationship}
                onChange={(e) => setEmergencyForm(prev => ({ ...prev, relationship: e.target.value }))}
                placeholder="Es: Sorella, Veterinario di fiducia"
              />
            </div>

            <div>
              <Label htmlFor="emergency_email">Email</Label>
              <Input
                id="emergency_email"
                type="email"
                value={emergencyForm.email}
                onChange={(e) => setEmergencyForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@example.com"
              />
            </div>

            <div>
              <Label htmlFor="emergency_notes">Note</Label>
              <Textarea
                id="emergency_notes"
                value={emergencyForm.notes}
                onChange={(e) => setEmergencyForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Note aggiuntive..."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowEmergencyDialog(false)}>
                Annulla
              </Button>
              <Button type="submit" disabled={!emergencyForm.name || !emergencyForm.phone}>
                {editingItem ? 'Aggiorna' : 'Aggiungi'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Insurance Dialog */}
      <Dialog open={showInsuranceDialog} onOpenChange={(open) => {
        setShowInsuranceDialog(open);
        if (!open) resetInsuranceForm();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Modifica Assicurazione' : 'Aggiungi Assicurazione'}
            </DialogTitle>
            <DialogDescription>
              Aggiungi una polizza assicurativa per {selectedPet?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editingItem ? handleEditInsurance : handleAddInsurance} className="space-y-4">
            <div>
              <Label htmlFor="provider_name">Compagnia Assicurativa</Label>
              <Input
                id="provider_name"
                value={insuranceForm.provider_name}
                onChange={(e) => setInsuranceForm(prev => ({ ...prev, provider_name: e.target.value }))}
                placeholder="Es: Allianz Pet"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="policy_number">Numero Polizza</Label>
                <Input
                  id="policy_number"
                  value={insuranceForm.policy_number}
                  onChange={(e) => setInsuranceForm(prev => ({ ...prev, policy_number: e.target.value }))}
                  placeholder="POL123456789"
                  required
                />
              </div>
              <div>
                <Label htmlFor="policy_type">Tipo Polizza</Label>
                <Input
                  id="policy_type"
                  value={insuranceForm.policy_type}
                  onChange={(e) => setInsuranceForm(prev => ({ ...prev, policy_type: e.target.value }))}
                  placeholder="Es: Completa, Base"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="insurance_start_date">Data Inizio</Label>
                <Input
                  id="insurance_start_date"
                  type="date"
                  value={insuranceForm.start_date}
                  onChange={(e) => setInsuranceForm(prev => ({ ...prev, start_date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="insurance_end_date">Data Scadenza</Label>
                <Input
                  id="insurance_end_date"
                  type="date"
                  value={insuranceForm.end_date}
                  onChange={(e) => setInsuranceForm(prev => ({ ...prev, end_date: e.target.value }))}
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
                  value={insuranceForm.premium_amount}
                  onChange={(e) => setInsuranceForm(prev => ({ ...prev, premium_amount: e.target.value }))}
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
                  onChange={(e) => setInsuranceForm(prev => ({ ...prev, deductible: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowInsuranceDialog(false)}>
                Annulla
              </Button>
              <Button type="submit" disabled={!insuranceForm.provider_name || !insuranceForm.policy_number}>
                {editingItem ? 'Aggiorna' : 'Aggiungi'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diary Entry Dialog */}
      <Dialog open={showDiaryDialog} onOpenChange={setShowDiaryDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Diario Giornaliero</DialogTitle>
            <DialogDescription>
              Aggiungi una voce al diario di {selectedPet?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedPet && (
            <DiaryEntryForm
              isOpen={showDiaryDialog}
              petId={selectedPet.id}
              userId={user?.id}
              onClose={() => setShowDiaryDialog(false)}
              onSave={(data) => {
                console.log('Diary entry saved:', data);
                setShowDiaryDialog(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
        onConfirm={async () => {
          if (!deleteConfirm) return;
          
          const { type, id } = deleteConfirm;
          try {
            switch (type) {
              case 'metric':
                await handleDeleteMetric(id);
                break;
              case 'record':
                await handleDeleteRecord(id);
                break;
              case 'medication':
                await handleDeleteMedication(id);
                break;
              case 'vet':
                await handleDeleteVet(id);
                break;
              case 'emergency':
                await handleDeleteEmergency(id);
                break;
              case 'insurance':
                await handleDeleteInsurance(id);
                break;
            }
          } finally {
            setDeleteConfirm(null);
          }
        }}
        title="Conferma Eliminazione"
        description="Sei sicuro di voler eliminare questo elemento? Questa azione non può essere annullata."
      />
    </div>
  );
};

export default Dashboard;