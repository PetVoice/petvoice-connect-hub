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
              <div className="h-80">
                <ChartContainer
                  config={{
                    wellness: {
                      label: "Benessere",
                      color: "hsl(var(--primary))"
                    }
                  }}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
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
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    Parametri Vitali
                  </CardTitle>
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
                          </div>
                          <span className="text-sm font-medium">
                            {metric.metric_type === 'gum_color' ? getGumColorText(metric.value) : `${metric.value} ${metric.unit}`}
                          </span>
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
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    Comportamenti Osservati
                  </CardTitle>
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

              {/* Additional Health Factors Card */}
              <Card className="hover-scale bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-background border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-amber-500" />
                    Altri Fattori
                  </CardTitle>
                  <CardDescription>Dati che influenzano la salute</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {/* Active Medications */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Pill className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Farmaci attivi</span>
                      </div>
                      <span className="text-sm font-medium">
                        {medications.filter(m => m.is_active).length}
                      </span>
                    </div>
                    
                    {/* Recent Medical Records */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Visite recenti</span>
                      </div>
                      <span className="text-sm font-medium">
                        {medicalRecords.filter(r => 
                          isAfter(new Date(r.record_date), subDays(new Date(), 30))
                        ).length}
                      </span>
                    </div>
                    
                    {/* Diary Activity Level */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">Attività diario</span>
                      </div>
                      <span className="text-sm font-medium">
                        {diaryEntries.filter(e => 
                          isAfter(new Date(e.entry_date), subDays(new Date(), 7))
                        ).length}/7
                      </span>
                    </div>
                    
                    {/* Mood Trend */}
                    {moodTrend && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {moodTrend.trend === 'up' ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : moodTrend.trend === 'down' ? (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          ) : (
                            <Activity className="h-4 w-4 text-yellow-500" />
                          )}
                          <span className="text-sm">Trend umore</span>
                        </div>
                        <span className="text-sm font-medium">
                          {moodTrend.trend === 'up' ? '↗️' : moodTrend.trend === 'down' ? '↘️' : '➡️'}
                        </span>
                      </div>
                    )}

                    {/* Emergency Contacts */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">Contatti emergenza</span>
                      </div>
                      <span className="text-sm font-medium">
                        {emergencyContacts.length}
                      </span>
                    </div>
                  </div>
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
    </div>
  );
};

export default WellnessPage;