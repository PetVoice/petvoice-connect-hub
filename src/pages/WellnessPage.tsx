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
  // Simplified evaluation logic
  switch (metricType) {
    case 'temperature':
      if (value < 37.5 || value > 40.0) {
        return {
          status: 'critical',
          message: `Temperatura critica: ${value}°C`,
          recommendation: 'Contatta immediatamente il veterinario'
        };
      }
      if (value < 38.0 || value > 39.2) {
        return {
          status: 'warning',
          message: `Temperatura fuori norma: ${value}°C`,
          recommendation: 'Monitora attentamente'
        };
      }
      return { status: 'normal', message: `Temperatura normale: ${value}°C` };

    case 'heart_rate':
      if (value < 50 || value > 240) {
        return {
          status: 'critical',
          message: `Battito cardiaco critico: ${value} bpm`,
          recommendation: 'EMERGENZA - Contatta immediatamente il veterinario'
        };
      }
      if (value < 60 || value > 140) {
        return {
          status: 'warning',
          message: `Battito cardiaco anomalo: ${value} bpm`,
          recommendation: 'Monitora e consulta il veterinario se persiste'
        };
      }
      return { status: 'normal', message: `Battito cardiaco normale: ${value} bpm` };

    default:
      return { status: 'normal', message: `${translateMetricType(metricType)}: ${value}` };
  }
};

// Helper function to convert gum color numeric values to text
const getGumColorText = (value: number | string): string => {
  if (typeof value === 'string') return value;
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
  const [emotionCounts, setEmotionCounts] = useState<EmotionCount>({});
  
  // Form states
  const [showAddMetric, setShowAddMetric] = useState(false);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showAddVet, setShowAddVet] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddInsurance, setShowAddInsurance] = useState(false);
  
  // Form data states
  const [newMetric, setNewMetric] = useState({ metric_type: '', value: '', unit: '', notes: '' });
  const [newDocument, setNewDocument] = useState({ title: '', description: '', record_type: '', record_date: '', cost: '', notes: '' });
  const [newMedication, setNewMedication] = useState({ name: '', dosage: '', frequency: '', start_date: '', end_date: '', notes: '' });
  const [newVet, setNewVet] = useState({ name: '', clinic_name: '', phone: '', email: '', address: '', specialization: '', is_primary: false });
  const [newContact, setNewContact] = useState({ name: '', contact_type: '', phone: '', relationship: '', email: '', notes: '' });
  const [newInsurance, setNewInsurance] = useState({ provider_name: '', policy_number: '', policy_type: '', start_date: '', end_date: '', premium_amount: '', deductible: '' });
  
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', onConfirm: () => {} });
  const [loading, setLoading] = useState(true);
  
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

  // Fetch all health data
  const fetchHealthData = async () => {
    if (!user || !selectedPet) return;
    
    setLoading(true);
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
      
      // Fetch medications
      const { data: meds } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id)
        .eq('pet_id', selectedPet.id)
        .order('created_at', { ascending: false });
      
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
      
      // Calculate emotion counts from primary_emotion field
      const { data: analyses } = await supabase
        .from('pet_analyses')
        .select('primary_emotion')
        .eq('user_id', user.id)
        .eq('pet_id', selectedPet.id)
        .order('created_at', { ascending: false });
      
      // Calculate emotion counts
      const emotions: EmotionCount = {};
      analyses?.forEach(analysis => {
        if (analysis.primary_emotion) {
          emotions[analysis.primary_emotion] = (emotions[analysis.primary_emotion] || 0) + 1;
        }
      });
      
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, [user, selectedPet]);

  // Handle adding new metric
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

      setNewMetric({ metric_type: '', value: '', unit: '', notes: '' });
      setShowAddMetric(false);
      fetchHealthData();
    } catch (error) {
      console.error('Error adding metric:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiungere la metrica",
        variant: "destructive"
      });
    }
  };

  // Handle adding new emergency contact
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

      setNewContact({ name: '', contact_type: '', phone: '', relationship: '', email: '', notes: '' });
      setShowAddContact(false);
      fetchHealthData();
    } catch (error) {
      console.error('Error adding emergency contact:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiungere il contatto emergenza",
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
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Assicurazione aggiunta con successo"
      });

      setNewInsurance({ provider_name: '', policy_number: '', policy_type: '', start_date: '', end_date: '', premium_amount: '', deductible: '' });
      setShowAddInsurance(false);
      fetchHealthData();
    } catch (error) {
      console.error('Error adding insurance:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiungere l'assicurazione",
        variant: "destructive"
      });
    }
  };

  // Handle adding new veterinarian
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

      setNewVet({ name: '', clinic_name: '', phone: '', email: '', address: '', specialization: '', is_primary: false });
      setShowAddVet(false);
      fetchHealthData();
    } catch (error) {
      console.error('Error adding veterinarian:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiungere il veterinario",
        variant: "destructive"
      });
    }
  };

  // Handle adding new medical record
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
      const { error } = await supabase
        .from('medical_records')
        .insert({
          user_id: user.id,
          pet_id: selectedPet.id,
          title: newDocument.title,
          description: newDocument.description || null,
          record_type: newDocument.record_type,
          record_date: newDocument.record_date,
          cost: newDocument.cost ? parseFloat(newDocument.cost) : null,
          notes: newDocument.notes || null
        });

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Visita aggiunta con successo"
      });

      setNewDocument({ title: '', description: '', record_type: '', record_date: '', cost: '', notes: '' });
      setShowAddDocument(false);
      fetchHealthData();
    } catch (error) {
      console.error('Error adding medical record:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiungere la visita",
        variant: "destructive"
      });
    }
  };

  // Handle adding new medication
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
      const { error } = await supabase
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
        });

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Farmaco aggiunto con successo"
      });

      setNewMedication({ name: '', dosage: '', frequency: '', start_date: '', end_date: '', notes: '' });
      setShowAddMedication(false);
      fetchHealthData();
    } catch (error) {
      console.error('Error adding medication:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiungere il farmaco",
        variant: "destructive"
      });
    }
  };

  // Handle phone call
  const handlePhoneCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
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

      fetchHealthData();
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

  // Navigate to diary for new behavior entry
  const handleAddBehavior = () => {
    window.location.href = `/diary?pet=${selectedPet?.id}&action=new`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg text-muted-foreground">Caricamento dati sulla salute...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedPet) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">Nessun Pet Selezionato</h2>
          <p className="text-muted-foreground mb-4">
            Aggiungi un pet per iniziare a monitorare la sua salute
          </p>
          <Button onClick={() => window.location.href = '/pets'}>
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">
            <Activity className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart2 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Unified Wellness Trend Chart */}
          <Card className="bg-gradient-to-br from-card to-muted/20 border-2 hover:shadow-xl transition-all duration-500">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                Trend Generale Benessere
              </CardTitle>
              <CardDescription>
                Andamento complessivo del benessere di {selectedPet?.name || 'il tuo pet'} nel tempo
              </CardDescription>
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
                    data={[
                      { date: "Gen", wellness: 65 },
                      { date: "Feb", wellness: 72 },
                      { date: "Mar", wellness: 68 },
                      { date: "Apr", wellness: 75 },
                      { date: "Mag", wellness: 82 },
                      { date: "Giu", wellness: 78 },
                    ]}
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
                    healthMetrics.slice(0, 3).map((metric) => {
                      const evaluation = evaluateVitalParameter(metric.metric_type, parseFloat(metric.value.toString()), selectedPet?.type);
                      return (
                        <div key={metric.id} className="flex items-center justify-between">
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
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 w-6 p-0 text-red-500"
                            onClick={() => handleDelete('metrica', metric.id, translateMetricType(metric.metric_type))}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })
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
                  {medications.filter(med => med.is_active).length > 0 ? (
                    <div className="space-y-2">
                      {medications.filter(med => med.is_active).slice(0, 3).map((medication) => (
                        <div key={medication.id} className="border-l-2 border-green-500/30 pl-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{medication.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {medication.frequency}
                              </Badge>
                            </div>
                             <div className="flex gap-1">
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
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <Pill className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nessun farmaco attivo</p>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>

            {/* Secondary Health Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
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
                  {medicalRecords.length > 0 ? (
                    <div className="space-y-2">
                      {medicalRecords.slice(0, 3).map((record) => (
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
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="h-8">
                          <BookOpen className="h-4 w-4 mr-1" />
                          Apri Guida
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            Guida Primo Soccorso
                          </DialogTitle>
                        </DialogHeader>
                        <FirstAidGuide open={true} onOpenChange={() => {}} />
                      </DialogContent>
                    </Dialog>
                  </div>
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
                      {insurances.filter(ins => ins.is_active).slice(0, 2).map((insurance) => (
                        <div key={insurance.id} className="border-l-2 border-teal-500/30 pl-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{insurance.provider_name}</span>
                              <Badge variant="outline" className="text-xs">
                                Attiva
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
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nessuna assicurazione attiva</p>
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
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <FileImage className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nessun documento caricato</p>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>

            {/* Additional Health Influence Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              

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
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {Object.entries(emotionCounts)
                        .sort(([,a], [,b]) => b - a)
                        .map(([emotion, count], index) => (
                          <div key={emotion} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: EMOTION_COLORS[emotion] || '#6b7280' }}
                              />
                              <span className="text-sm capitalize">{emotion}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-muted rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full"
                                  style={{ 
                                    width: `${(count / Math.max(...Object.values(emotionCounts))) * 100}%`,
                                    backgroundColor: EMOTION_COLORS[emotion] || '#6b7280'
                                  }}
                                />
                              </div>
                              <span className="text-sm font-medium w-8 text-right">{count}</span>
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

            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Trend Parametri Vitali</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ChartContainer
                    config={{
                      temperature: { label: "Temperatura", color: "hsl(var(--primary))" },
                      heart_rate: { label: "Battito", color: "hsl(var(--secondary))" }
                    }}
                  >
                    <LineChart data={[]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="temperature" stroke="hsl(var(--primary))" />
                      <Line type="monotone" dataKey="heart_rate" stroke="hsl(var(--secondary))" />
                    </LineChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuzione Emozioni</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ChartContainer
                    config={{
                      emotions: { label: "Emozioni", color: "hsl(var(--primary))" }
                    }}
                  >
                    <PieChart>
                      <Pie
                        data={Object.entries(emotionCounts).map(([emotion, count]) => ({
                          name: emotion,
                          value: count,
                          fill: EMOTION_COLORS[emotion] || '#6b7280'
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Medication Dialog */}
      <Dialog open={showAddMedication} onOpenChange={setShowAddMedication}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuovo Farmaco</DialogTitle>
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
          </div>
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={() => {
                setShowAddVet(false);
                setNewVet({ name: '', clinic_name: '', phone: '', email: '', address: '', specialization: '', is_primary: false });
              }} 
              variant="outline"
            >
              Annulla
            </Button>
            <Button onClick={handleAddVet}>
              Salva
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Medical Record Dialog */}
      <Dialog open={showAddDocument} onOpenChange={setShowAddDocument}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuova Visita</DialogTitle>
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
                  <SelectItem value="vaccinazione">Vaccinazione</SelectItem>
                  <SelectItem value="controllo">Controllo</SelectItem>
                  <SelectItem value="emergenza">Emergenza</SelectItem>
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
          </div>
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={() => {
                setShowAddDocument(false);
                setNewDocument({ title: '', description: '', record_type: '', record_date: '', cost: '', notes: '' });
              }} 
              variant="outline"
            >
              Annulla
            </Button>
            <Button onClick={handleAddDocument}>
              Salva
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Emergency Contact Dialog */}
      <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuovo Contatto Emergenza</DialogTitle>
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
              onClick={() => {
                setShowAddContact(false);
                setNewContact({ name: '', contact_type: '', phone: '', relationship: '', email: '', notes: '' });
              }} 
              variant="outline"
            >
              Annulla
            </Button>
            <Button onClick={handleAddContact}>
              Salva
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Veterinarian Dialog */}
      <Dialog open={showAddVet} onOpenChange={setShowAddVet}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuovo Veterinario</DialogTitle>
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
              onClick={() => {
                setShowAddMedication(false);
                setNewMedication({ name: '', dosage: '', frequency: '', start_date: '', end_date: '', notes: '' });
              }} 
              variant="outline"
            >
              Annulla
            </Button>
            <Button onClick={handleAddMedication}>
              Salva
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Metric Dialog */}
      <Dialog open={showAddMetric} onOpenChange={setShowAddMetric}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuova Metrica Salute</DialogTitle>
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
                    unit: units[value] || ''
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
              <Input
                id="value"
                type="number"
                step="0.1"
                value={newMetric.value}
                onChange={(e) => setNewMetric(prev => ({ ...prev, value: e.target.value }))}
                placeholder="Inserisci valore"
              />
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
              onClick={() => {
                setShowAddMetric(false);
                setNewMetric({ metric_type: '', value: '', unit: '', notes: '' });
              }} 
              variant="outline"
            >
              Annulla
            </Button>
            <Button onClick={handleAddMetric}>
              Salva
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Insurance Dialog */}
      <Dialog open={showAddInsurance} onOpenChange={setShowAddInsurance}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuova Assicurazione</DialogTitle>
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
          </div>
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={() => {
                setShowAddInsurance(false);
                setNewInsurance({ provider_name: '', policy_number: '', policy_type: '', start_date: '', end_date: '', premium_amount: '', deductible: '' });
              }} 
              variant="outline"
            >
              Annulla
            </Button>
            <Button onClick={handleAddInsurance}>
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

    </div>
  );
};

export default WellnessPage;