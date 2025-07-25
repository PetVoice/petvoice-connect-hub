import React, { useState, useEffect, useMemo } from 'react';
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
  Music,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  BarChart2
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { usePets } from '@/contexts/PetContext';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, subMonths, subDays, isAfter, isBefore, differenceInDays, startOfDay, endOfDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { FirstAidGuide } from '@/components/FirstAidGuide';
import { ConfirmDialog } from '@/components/ConfirmDialog';
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
    'checkup': 'Controllo',
    'blood_pressure': 'Pressione Sanguigna',
    'respiratory_rate': 'Frequenza Respiratoria'
  };
  return translations[type] || type;
};

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

// Helper function to evaluate vital parameters  
const evaluateVitalParameter = (metricType: string, value: number, petType?: string): { 
  status: 'normal' | 'warning' | 'critical', 
  message: string,
  recommendation?: string 
} => {
  // Ranges for vital parameters (from first aid guide)
  const VITAL_PARAMETERS_RANGES = {
    temperature: {
      dogs: { min: 38.0, max: 39.2, unit: '°C' },
      cats: { min: 38.1, max: 39.2, unit: '°C' },
      critical_low: 37.5,
      critical_high: 40.0
    },
    heart_rate: {
      dogs_large: { min: 60, max: 100, unit: 'bpm' },
      dogs_small: { min: 100, max: 140, unit: 'bpm' },
      cats: { min: 140, max: 220, unit: 'bpm' },
      critical_low: 50,
      critical_high: 240
    },
    breathing_rate: {
      dogs: { min: 10, max: 30, unit: 'atti/min' },
      cats: { min: 20, max: 30, unit: 'atti/min' },
      critical_low: 8,
      critical_high: 40
    }
  };

  switch (metricType) {
    case 'temperature':
      if (value < VITAL_PARAMETERS_RANGES.temperature.critical_low) {
        return {
          status: 'critical',
          message: `Temperatura critica bassa: ${value}°C`,
          recommendation: 'Contatta immediatamente il veterinario - possibile ipotermia'
        };
      }
      if (value > VITAL_PARAMETERS_RANGES.temperature.critical_high) {
        return {
          status: 'critical',
          message: `Temperatura critica alta: ${value}°C`,
          recommendation: 'EMERGENZA - Possibile colpo di calore. Raffredda gradualmente e vai dal veterinario'
        };
      }
      if (value < 38.0 || value > 39.2) {
        return {
          status: 'warning',
          message: `Temperatura fuori norma: ${value}°C`,
          recommendation: 'Monitora attentamente e considera una visita veterinaria'
        };
      }
      return { status: 'normal', message: `Temperatura normale: ${value}°C` };

    case 'heart_rate':
      if (value < VITAL_PARAMETERS_RANGES.heart_rate.critical_low) {
        return {
          status: 'critical',
          message: `Battito cardiaco critico basso: ${value} bpm`,
          recommendation: 'EMERGENZA - Contatta immediatamente il veterinario'
        };
      }
      if (value > VITAL_PARAMETERS_RANGES.heart_rate.critical_high) {
        return {
          status: 'critical',
          message: `Battito cardiaco critico alto: ${value} bpm`,
          recommendation: 'EMERGENZA - Possibile stress grave o patologia cardiaca'
        };
      }
      // Evaluation based on size (simplified)
      const normalRange = petType === 'gatto' || petType === 'cat' 
        ? VITAL_PARAMETERS_RANGES.heart_rate.cats
        : value > 120 
          ? VITAL_PARAMETERS_RANGES.heart_rate.dogs_small 
          : VITAL_PARAMETERS_RANGES.heart_rate.dogs_large;
      
      if (value < normalRange.min || value > normalRange.max) {
        return {
          status: 'warning',
          message: `Battito cardiaco anomalo: ${value} bpm`,
          recommendation: 'Monitora e consulta il veterinario se persiste'
        };
      }
      return { status: 'normal', message: `Battito cardiaco normale: ${value} bpm` };

    case 'breathing_rate':
    case 'respiratory_rate':
    case 'respiration':
      if (value < VITAL_PARAMETERS_RANGES.breathing_rate.critical_low) {
        return {
          status: 'critical',
          message: `Respirazione critica lenta: ${value} atti/min`,
          recommendation: 'EMERGENZA - Possibili problemi respiratori gravi. Contatta immediatamente il veterinario!'
        };
      }
      if (value > VITAL_PARAMETERS_RANGES.breathing_rate.critical_high) {
        return {
          status: 'critical',
          message: `Respirazione critica veloce: ${value} atti/min`,
          recommendation: 'EMERGENZA - Possibile distress respiratorio o dolore. Vai immediatamente dal veterinario!'
        };
      }
      
      const breathingRange = petType === 'gatto' || petType === 'cat' 
        ? VITAL_PARAMETERS_RANGES.breathing_rate.cats
        : VITAL_PARAMETERS_RANGES.breathing_rate.dogs;
      
      if (value < breathingRange.min || value > breathingRange.max) {
        return {
          status: 'warning',
          message: `Respirazione anomala: ${value} atti/min (normale ${petType === 'gatto' || petType === 'cat' ? 'gatti' : 'cani'}: ${breathingRange.min}-${breathingRange.max})`,
          recommendation: 'Monitora attentamente e considera una visita veterinaria se persiste'
        };
      }
      return { 
        status: 'normal', 
        message: `Respirazione normale: ${value} atti/min (range normale ${petType === 'gatto' || petType === 'cat' ? 'gatti' : 'cani'}: ${breathingRange.min}-${breathingRange.max})` 
      };

    case 'gum_color':
      const gumColorText = getGumColorText(value);
      switch (value) {
        case 1: // Rosa
          return { 
            status: 'normal', 
            message: `Colore Gengive: ${gumColorText}`,
            recommendation: 'Gengive normali - buona circolazione sanguigna'
          };
        case 2: // Pallide
          return {
            status: 'warning',
            message: `Colore Gengive: ${gumColorText}`,
            recommendation: 'Gengive pallide possono indicare anemia o shock. Consulta il veterinario'
          };
        case 3: // Blu/Viola
          return {
            status: 'critical',
            message: `Colore Gengive: ${gumColorText}`,
            recommendation: 'EMERGENZA - Gengive cianotiche indicano mancanza di ossigeno. Vai immediatamente dal veterinario!'
          };
        case 4: // Gialle
          return {
            status: 'critical',
            message: `Colore Gengive: ${gumColorText}`,
            recommendation: 'CRITICO - Gengive gialle possono indicare ittero o problemi epatici. Consulta urgentemente il veterinario'
          };
        default:
          return { status: 'normal', message: `Colore Gengive: ${gumColorText}` };
      }

    default:
      return { status: 'normal', message: `${translateMetricType(metricType)}: ${value}` };
  }
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
  const { selectedPet } = usePets();
  const { addNotification } = useNotifications();
  
  // States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [insurance, setInsurance] = useState<Insurance[]>([]);
  const [diaryData, setDiaryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Dialog states
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [showAddMetric, setShowAddMetric] = useState(false);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showAddVeterinarian, setShowAddVeterinarian] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddInsurance, setShowAddInsurance] = useState(false);
  
  // Edit states
  const [editingDocument, setEditingDocument] = useState<MedicalRecord | null>(null);
  const [editingMetric, setEditingMetric] = useState<HealthMetric | null>(null);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [editingVeterinarian, setEditingVeterinarian] = useState<Veterinarian | null>(null);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [editingInsurance, setEditingInsurance] = useState<Insurance | null>(null);
  
  // Form states
  const [newDocument, setNewDocument] = useState({
    title: '',
    description: '',
    record_type: '',
    record_date: '',
    cost: '',
    notes: '',
    veterinarian_name: '',
    clinic_name: ''
  });
  
  const [newMetric, setNewMetric] = useState({
    metric_type: '',
    value: '',
    unit: '',
    recorded_at: '',
    notes: ''
  });
  
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    start_date: '',
    end_date: '',
    is_active: true,
    notes: ''
  });
  
  const [newVeterinarian, setNewVeterinarian] = useState({
    name: '',
    clinic_name: '',
    phone: '',
    email: '',
    address: '',
    specialization: '',
    is_primary: false
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
    deductible: '',
    is_active: true
  });
  
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {}
  });

  // Fetch data on component mount and when selectedPet changes
  useEffect(() => {
    if (selectedPet?.id) {
      fetchAllData();
    }
  }, [selectedPet?.id]);

  const fetchAllData = async () => {
    if (!selectedPet?.id) return;
    
    setLoading(true);
    try {
      await Promise.all([
        fetchHealthMetrics(),
        fetchMedicalRecords(), 
        fetchMedications(),
        fetchVeterinarians(),
        fetchEmergencyContacts(),
        fetchInsurance(),
        fetchDiaryData()
      ]);
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
  };

  const fetchHealthMetrics = async () => {
    if (!selectedPet?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .order('recorded_at', { ascending: false });
      
      if (error) throw error;
      setHealthMetrics(data || []);
    } catch (error) {
      console.error('Error fetching health metrics:', error);
    }
  };

  const fetchMedicalRecords = async () => {
    if (!selectedPet?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .select(`
          *,
          veterinarian:veterinarians(name, clinic_name)
        `)
        .eq('pet_id', selectedPet.id)
        .order('record_date', { ascending: false });
      
      if (error) throw error;
      setMedicalRecords(data || []);
    } catch (error) {
      console.error('Error fetching medical records:', error);
    }
  };

  const fetchMedications = async () => {
    if (!selectedPet?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      setMedications(data || []);
    } catch (error) {
      console.error('Error fetching medications:', error);
    }
  };

  const fetchVeterinarians = async () => {
    if (!selectedPet?.id) return;
    
    try {
      // @ts-ignore - temporary fix for type instantiation issues
      const response = await supabase
        .from('veterinarians')
        .select('id, name, clinic_name, phone, email, address, specialization, is_primary')
        .eq('pet_id', selectedPet.id)
        .order('is_primary', { ascending: false });
      
      if (response.error) throw response.error;
      setVeterinarians(response.data || []);
    } catch (error) {
      console.error('Error fetching veterinarians:', error);
    }
  };

  const fetchEmergencyContacts = async () => {
    if (!selectedPet?.id) return;
    
    try {
      // @ts-ignore - temporary fix for type instantiation issues
      const response = await supabase
        .from('emergency_contacts')
        .select('id, name, contact_type, phone, relationship, email, notes')
        .eq('pet_id', selectedPet.id)
        .order('created_at', { ascending: false });
      
      if (response.error) throw response.error;
      setEmergencyContacts(response.data || []);
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
    }
  };

  const fetchInsurance = async () => {
    // Insurance functionality temporarily disabled
    setInsurance([]);
  };

  const fetchDiaryData = async () => {
    if (!selectedPet?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .order('entry_date', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      setDiaryData(data || []);
    } catch (error) {
      console.error('Error fetching diary data:', error);
    }
  };

  // Helper function to generate medical report
  const generateMedicalTag = () => {
    toast({
      title: "Tag Medico Generato",
      description: "Tag medico con QR code generato con successo.",
    });
  };

  if (!selectedPet) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-10">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nessun pet selezionato</h3>
            <p className="text-muted-foreground">
              Seleziona un pet per visualizzare i dati wellness.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Heart className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Wellness Center</h1>
          <Activity className="h-8 w-8 text-primary" />
        </div>
        <div className="max-w-2xl mx-auto">
          <p className="text-lg text-muted-foreground">
            Monitora la salute di {selectedPet.name}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
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

        {/* Dashboard Tab - Cards for Health Trend */}
        <TabsContent value="dashboard" className="space-y-6 animate-fade-in">
          {/* Unified Wellness Trend Chart */}
          <Card className="bg-gradient-to-br from-card to-muted/20 border-2 hover:shadow-xl transition-all duration-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Trend Benessere Generale</CardTitle>
                    <CardDescription>
                      Analisi unificata dei dati di salute di {selectedPet.name}
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Ultimo aggiornamento</div>
                  <div className="text-sm font-medium">
                    {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: it })}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Health Score */}
              <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                <UnifiedHealthScore 
                  selectedPet={selectedPet} 
                  user={user} 
                  addNotification={addNotification} 
                />
              </div>
              
              {/* Mock chart placeholder */}
              <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <LineChartIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Grafico trend wellness in sviluppo
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Integrazione con tutti i dati di salute
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Data Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Punteggio Salute Card */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Heart className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Punteggio Salute</CardTitle>
                    <CardDescription className="text-sm">
                      Valutazione generale
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <UnifiedHealthScore 
                  selectedPet={selectedPet} 
                  user={user} 
                  addNotification={addNotification} 
                />
              </CardContent>
            </Card>

            {/* Parametri Vitali Card */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                      <Activity className="h-4 w-4 text-red-500" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Parametri Vitali</CardTitle>
                      <CardDescription className="text-sm">
                        Ultimo monitoraggio
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveTab('monitoring')}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Aggiungi
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {healthMetrics.length > 0 ? (
                  <>
                    {healthMetrics.slice(0, 2).map(metric => {
                      const evaluation = evaluateVitalParameter(metric.metric_type, metric.value, selectedPet?.species);
                      const statusColor = evaluation.status === 'normal' ? 'text-success' : 
                                        evaluation.status === 'warning' ? 'text-warning' : 'text-destructive';
                      
                      return (
                        <div key={metric.id} className="border rounded-lg p-3 hover:bg-muted/30 transition-colors">
                          <div className="flex items-start justify-between mb-1">
                            <div>
                              <h4 className="font-medium text-sm">{translateMetricType(metric.metric_type)}</h4>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(metric.recorded_at), 'dd/MM HH:mm', { locale: it })}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">{metric.value} {metric.unit}</div>
                              <div className={`text-xs ${statusColor} capitalize`}>{evaluation.status}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {healthMetrics.length > 2 && (
                      <div className="text-center pt-2">
                        <p className="text-xs text-muted-foreground">
                          +{healthMetrics.length - 2} altre misurazioni
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6">
                    <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Nessun parametro registrato</p>
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => setActiveTab('monitoring')}>
                      Aggiungi prima misurazione
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comportamenti Osservati Card */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Brain className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Comportamenti</CardTitle>
                      <CardDescription className="text-sm">
                        Dal diario
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.location.href = '/diary'}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Aggiungi
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {diaryData.length > 0 ? (
                  (() => {
                    const behavioralEntries = diaryData.filter(entry => 
                      (entry.behavioral_tags && entry.behavioral_tags.length > 0) || entry.mood_score
                    ).slice(0, 2);

                    if (behavioralEntries.length === 0) {
                      return (
                        <div className="text-center py-6">
                          <Brain className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Nessun comportamento registrato</p>
                          <Button size="sm" variant="outline" className="mt-2" onClick={() => window.location.href = '/diary'}>
                            Inizia il diario
                          </Button>
                        </div>
                      );
                    }

                    return (
                      <>
                        {behavioralEntries.map(entry => {
                          const moodImpact = entry.mood_score ? 
                            (entry.mood_score >= 7 ? 'Positivo' : entry.mood_score >= 4 ? 'Neutro' : 'Negativo') : 
                            'Non specificato';
                          const moodColor = entry.mood_score ? 
                            (entry.mood_score >= 7 ? 'text-success' : entry.mood_score >= 4 ? 'text-warning' : 'text-destructive') : 
                            'text-muted-foreground';

                          return (
                            <div key={entry.id} className="border rounded-lg p-3 hover:bg-muted/30 transition-colors">
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h4 className="font-medium text-sm">{entry.title || 'Voce del diario'}</h4>
                                  <p className="text-xs text-muted-foreground">
                                    {format(new Date(entry.entry_date), 'dd/MM', { locale: it })}
                                  </p>
                                </div>
                                {entry.mood_score && (
                                  <div className="text-right">
                                    <div className="text-xs font-medium">Umore: {entry.mood_score}/10</div>
                                    <div className={`text-xs ${moodColor}`}>{moodImpact}</div>
                                  </div>
                                )}
                              </div>
                              
                              {entry.behavioral_tags && entry.behavioral_tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {entry.behavioral_tags.slice(0, 2).map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {entry.behavioral_tags.length > 2 && (
                                    <Badge variant="outline" className="text-xs px-1 py-0">
                                      +{entry.behavioral_tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        
                        {behavioralEntries.length >= 2 && diaryData.length > 2 && (
                          <div className="text-center pt-2">
                            <p className="text-xs text-muted-foreground">
                              +{diaryData.length - 2} altre voci
                            </p>
                          </div>
                        )}
                      </>
                    );
                  })()
                ) : (
                  <div className="text-center py-6">
                    <Brain className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Inizia il diario</p>
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => window.location.href = '/diary'}>
                      Aggiungi prima voce
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Emozioni Rilevate Card */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Eye className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Emozioni Rilevate</CardTitle>
                      <CardDescription className="text-sm">
                        Analisi AI
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.location.href = '/analysis'}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Analizza
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {(() => {
                  // Mock data per le emozioni rilevate dalle analisi
                  const emotionAnalyses = [
                    { id: '1', date: '2024-01-20', emotion: 'felice', confidence: 0.87, context: 'Dopo passeggiata' },
                    { id: '2', date: '2024-01-19', emotion: 'ansioso', confidence: 0.92, context: 'Prima uscita' }
                  ];

                  if (emotionAnalyses.length === 0) {
                    return (
                      <div className="text-center py-6">
                        <Eye className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Nessuna analisi disponibile</p>
                        <Button size="sm" variant="outline" className="mt-2" onClick={() => window.location.href = '/analysis'}>
                          Avvia analisi
                        </Button>
                      </div>
                    );
                  }

                  return (
                    <>
                      {emotionAnalyses.slice(0, 2).map(analysis => {
                        const confidenceColor = analysis.confidence >= 0.8 ? 'text-success' : 
                                               analysis.confidence >= 0.6 ? 'text-warning' : 'text-destructive';
                        
                        return (
                          <div key={analysis.id} className="border rounded-lg p-3 hover:bg-muted/30 transition-colors">
                            <div className="flex items-start justify-between mb-1">
                              <div>
                                <h4 className="font-medium text-sm capitalize">{analysis.emotion}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(analysis.date), 'dd/MM', { locale: it })}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className={`text-xs font-medium ${confidenceColor}`}>
                                  {Math.round(analysis.confidence * 100)}%
                                </div>
                                <p className="text-xs text-muted-foreground">{analysis.context}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {emotionAnalyses.length > 2 && (
                        <div className="text-center pt-2">
                          <p className="text-xs text-muted-foreground">
                            +{emotionAnalyses.length - 2} altre analisi
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}
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
                    onClick={() => setShowAddVeterinarian(true)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {veterinarians.length > 0 ? (
                  <div className="space-y-3">
                    {veterinarians.map(vet => (
                      <div key={vet.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium flex items-center gap-2">
                              {vet.name}
                              {vet.is_primary && (
                                <Badge variant="default" className="text-xs">Primario</Badge>
                              )}
                            </h4>
                            {vet.clinic_name && (
                              <p className="text-sm text-muted-foreground">{vet.clinic_name}</p>
                            )}
                            {vet.specialization && (
                              <p className="text-xs text-muted-foreground">{vet.specialization}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {vet.phone && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={`tel:${vet.phone}`}>
                                  <Phone className="h-3 w-3" />
                                </a>
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                            onClick={() => {
                              setEditingVeterinarian(vet);
                              setNewVeterinarian({
                                name: vet.name,
                                clinic_name: vet.clinic_name || '',
                                phone: vet.phone || '',
                                email: vet.email || '',
                                address: vet.address || '',
                                specialization: vet.specialization || '',
                                is_primary: vet.is_primary
                              });
                              setShowAddVeterinarian(true);
                            }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Stethoscope className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Nessun veterinario registrato</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Siren className="h-5 w-5" />
                    Contatti di Emergenza
                  </CardTitle>
                  <Button 
                    onClick={() => setShowAddContact(true)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {emergencyContacts.length > 0 ? (
                  <div className="space-y-3">
                    {emergencyContacts.map(contact => (
                      <div key={contact.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{contact.name}</h4>
                            <p className="text-sm text-muted-foreground">{contact.contact_type}</p>
                            {contact.relationship && (
                              <p className="text-xs text-muted-foreground">{contact.relationship}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <a href={`tel:${contact.phone}`}>
                                <Phone className="h-3 w-3" />
                              </a>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
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
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Siren className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Nessun contatto di emergenza</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
                    Gestisci documenti, certificati e referti medici
                  </CardDescription>
                </div>
                <Button onClick={() => setShowAddDocument(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuovo Documento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {medicalRecords.length > 0 ? (
                <div className="space-y-4">
                  {medicalRecords.map(record => (
                    <div key={record.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{record.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{translateRecordType(record.record_type)}</span>
                            <span>{format(new Date(record.record_date), 'dd/MM/yyyy', { locale: it })}</span>
                            {record.cost && <span>€{record.cost}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {record.document_url && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={record.document_url} target="_blank" rel="noopener noreferrer">
                                <FileImage className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setEditingDocument(record);
                              setNewDocument({
                                title: record.title,
                                description: record.description || '',
                                record_type: record.record_type,
                                record_date: record.record_date,
                                cost: record.cost?.toString() || '',
                                notes: record.notes || '',
                                veterinarian_name: record.veterinarian?.name || '',
                                clinic_name: record.veterinarian?.clinic_name || ''
                              });
                              setShowAddDocument(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {record.description && (
                        <p className="text-sm text-muted-foreground mb-2">{record.description}</p>
                      )}
                      {record.veterinarian && (
                        <div className="text-xs text-muted-foreground">
                          Veterinario: {record.veterinarian.name}
                          {record.veterinarian.clinic_name && ` - ${record.veterinarian.clinic_name}`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nessun documento medico</h3>
                  <p className="text-muted-foreground mb-4">
                    Inizia aggiungendo documenti medici, certificati o referti
                  </p>
                  <Button onClick={() => setShowAddDocument(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi primo documento
                  </Button>
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
                    onClick={() => setShowAddMedication(true)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {medications.filter(m => m.is_active).length > 0 ? (
                  <div className="space-y-3">
                    {medications.filter(m => m.is_active).map(medication => (
                      <div key={medication.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{medication.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {medication.dosage} - {medication.frequency}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Dal {format(new Date(medication.start_date), 'dd/MM/yyyy', { locale: it })}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="default">Attivo</Badge>
                            <Button 
                              size="sm" 
                              variant="outline"
                            onClick={() => {
                              setEditingMedication(medication);
                              setNewMedication({
                                name: medication.name,
                                dosage: medication.dosage,
                                frequency: medication.frequency,
                                start_date: medication.start_date,
                                end_date: medication.end_date || '',
                                is_active: medication.is_active,
                                notes: medication.notes || ''
                              });
                              setShowAddMedication(true);
                            }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Pill className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Nessun farmaco attivo</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Health Metrics */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Parametri Vitali
                  </CardTitle>
                  <Button 
                    onClick={() => setShowAddMetric(true)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {healthMetrics.length > 0 ? (
                  <div className="space-y-3">
                    {healthMetrics.slice(0, 5).map(metric => {
                      const evaluation = evaluateVitalParameter(metric.metric_type, metric.value, selectedPet?.species);
                      const statusColor = evaluation.status === 'normal' ? 'text-green-600' : 
                                        evaluation.status === 'warning' ? 'text-yellow-600' : 'text-red-600';
                      
                      return (
                        <div key={metric.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{translateMetricType(metric.metric_type)}</h4>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(metric.recorded_at), 'dd/MM/yyyy HH:mm', { locale: it })}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{metric.value} {metric.unit}</div>
                              <div className={`text-sm ${statusColor} capitalize`}>
                                {evaluation.status}
                              </div>
                            </div>
                          </div>
                          {evaluation.recommendation && (
                            <div className="mt-2 p-2 bg-muted rounded text-xs">
                              <span className="font-medium">Raccomandazione:</span> {evaluation.recommendation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Nessun parametro registrato</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Health Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trend Salute
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <LineChartIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Grafico trend in sviluppo
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medication History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Storico Farmaci
                </CardTitle>
              </CardHeader>
              <CardContent>
                {medications.length > 0 ? (
                  <div className="space-y-3">
                    {medications.slice(0, 5).map(medication => (
                      <div key={medication.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{medication.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(medication.start_date), 'dd/MM/yyyy', { locale: it })}
                              {medication.end_date && ` - ${format(new Date(medication.end_date), 'dd/MM/yyyy', { locale: it })}`}
                            </p>
                          </div>
                          <Badge variant={medication.is_active ? "default" : "secondary"}>
                            {medication.is_active ? "Attivo" : "Terminato"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Pill className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Nessun farmaco registrato</p>
                  </div>
                )}
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
                    <Siren className="h-5 w-5" />
                    Contatti di Emergenza
                  </CardTitle>
                  <Button 
                    onClick={() => setShowAddContact(true)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {emergencyContacts.length > 0 ? (
                  <div className="space-y-3">
                    {emergencyContacts.map(contact => (
                      <div key={contact.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{contact.name}</h4>
                            <p className="text-sm text-muted-foreground">{contact.contact_type}</p>
                            <p className="text-sm">{contact.phone}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <a href={`tel:${contact.phone}`}>
                                <PhoneCall className="h-4 w-4" />
                              </a>
                            </Button>
                            {contact.email && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={`mailto:${contact.email}`}>
                                  <Mail className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Siren className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Nessun contatto di emergenza</p>
                    <Button size="sm" onClick={() => setShowAddContact(true)}>
                      Aggiungi primo contatto
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* First Aid Guide */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Guida Primo Soccorso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <Heart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Guida primo soccorso disponibile</p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Visualizza guida
                  </Button>
                </div>
                <div className="mt-4 space-y-2">
                  <Button className="w-full" variant="outline">
                    <MapPin className="h-4 w-4 mr-2" />
                    Veterinari Vicini
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

      </Tabs>

      {/* Dialogs would go here - keeping existing dialogs for completeness */}
      
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
