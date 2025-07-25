import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePets } from '@/contexts/PetContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { 
  Heart, 
  Activity, 
  Pill, 
  Phone, 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp, 
  Stethoscope, 
  AlertTriangle, 
  CreditCard, 
  FileImage,
  Brain,
  Eye,
  BookOpen,
  Download,
  PieChart as PieChartIcon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { FirstAidGuide } from '@/components/FirstAidGuide';
import { DiaryEntryForm } from '@/components/diary/DiaryEntryForm';

interface Medication {
  id: string;
  user_id: string;
  pet_id: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface HealthMetric {
  id: string;
  user_id: string;
  pet_id: string;
  metric_type: string;
  value: string | number;
  unit: string;
  recorded_at: string;
  notes?: string;
}

interface MedicalRecord {
  id: string;
  user_id: string;
  pet_id: string;
  title: string;
  record_type: string;
  record_date: string;
  description?: string;
  document_url?: string;
  created_at: string;
  updated_at: string;
}

interface Veterinarian {
  id: string;
  user_id: string;
  name: string;
  clinic_name?: string;
  phone: string;
  email?: string;
  specialization?: string;
  address?: string;
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

const EMOTION_COLORS: Record<string, string> = {
  'felice': '#10b981',
  'eccitato': '#f59e0b',
  'calmo': '#3b82f6',
  'ansioso': '#ef4444',
  'stanco': '#6b7280',
  'giocherellone': '#8b5cf6',
  'aggressivo': '#dc2626',
  'spaventato': '#f97316',
  'curioso': '#06b6d4',
  'triste': '#64748b'
};

const WellnessPage = () => {
  const { user } = useAuth();
  const { selectedPet } = usePets();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  
  // Dialog states
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showFirstAidGuide, setShowFirstAidGuide] = useState(false);
  const [showDiaryDialog, setShowDiaryDialog] = useState(false);
  
  // Form states
  const [newMedication, setNewMedication] = useState({ name: '', dosage: '', frequency: '', start_date: '', end_date: '', notes: '' });
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  
  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Calculate behavioral insights
  const behavioralTags = useMemo(() => {
    return diaryEntries.flatMap(entry => entry.behavioral_tags || []);
  }, [diaryEntries]);

  const behavioralTagCounts = useMemo(() => {
    return behavioralTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [behavioralTags]);

  // Calculate emotion counts
  const emotionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    diaryEntries.forEach(entry => {
      if (entry.behavioral_tags) {
        entry.behavioral_tags.forEach(tag => {
          if (EMOTION_COLORS[tag.toLowerCase()]) {
            counts[tag] = (counts[tag] || 0) + 1;
          }
        });
      }
    });
    return counts;
  }, [diaryEntries]);

  // Load data
  useEffect(() => {
    if (user && selectedPet) {
      loadMedications();
      loadHealthMetrics();
      loadMedicalRecords();
      loadVeterinarians();
      loadEmergencyContacts();
      loadDiaryEntries();
    }
  }, [user, selectedPet]);

  const loadMedications = async () => {
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user?.id)
        .eq('pet_id', selectedPet?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedications(data || []);
    } catch (error) {
      console.error('Error loading medications:', error);
    }
  };

  const loadHealthMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', user?.id)
        .eq('pet_id', selectedPet?.id)
        .order('recorded_at', { ascending: false });

      if (error) throw error;
      setHealthMetrics(data || []);
    } catch (error) {
      console.error('Error loading health metrics:', error);
    }
  };

  const loadMedicalRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('user_id', user?.id)
        .eq('pet_id', selectedPet?.id)
        .order('record_date', { ascending: false });

      if (error) throw error;
      setMedicalRecords(data || []);
    } catch (error) {
      console.error('Error loading medical records:', error);
    }
  };

  const loadVeterinarians = async () => {
    try {
      const { data, error } = await supabase
        .from('veterinarians')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVeterinarians(data || []);
    } catch (error) {
      console.error('Error loading veterinarians:', error);
    }
  };

  const loadEmergencyContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmergencyContacts(data || []);
    } catch (error) {
      console.error('Error loading emergency contacts:', error);
    }
  };

  const loadDiaryEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', user?.id)
        .eq('pet_id', selectedPet?.id)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      setDiaryEntries(data || []);
    } catch (error) {
      console.error('Error loading diary entries:', error);
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
        // Update existing medication
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
        
        // Add new medication to local state
        setMedications(prev => [data, ...prev]);
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

  // Handle delete with confirmation
  const handleDelete = (type: string, id: string, name: string) => {
    setConfirmDialog({
      open: true,
      title: `Elimina ${type}`,
      message: `Sei sicuro di voler eliminare "${name}"? Questa azione non può essere annullata.`,
      onConfirm: () => confirmDelete(type, id)
    });
  };

  const confirmDelete = async (type: string, id: string) => {
    try {
      let error;

      switch (type) {
        case 'farmaco':
          ({ error } = await supabase.from('medications').delete().eq('id', id));
          if (!error) setMedications(prev => prev.filter(item => item.id !== id));
          break;
        case 'metrica':
          ({ error } = await supabase.from('health_metrics').delete().eq('id', id));
          if (!error) setHealthMetrics(prev => prev.filter(item => item.id !== id));
          break;
        case 'visita':
        case 'documento':
          ({ error } = await supabase.from('medical_records').delete().eq('id', id));
          if (!error) setMedicalRecords(prev => prev.filter(item => item.id !== id));
          break;
        case 'veterinario':
          ({ error } = await supabase.from('veterinarians').delete().eq('id', id));
          if (!error) setVeterinarians(prev => prev.filter(item => item.id !== id));
          break;
        case 'contatto':
          ({ error } = await supabase.from('emergency_contacts').delete().eq('id', id));
          if (!error) setEmergencyContacts(prev => prev.filter(item => item.id !== id));
          break;
        default:
          throw new Error('Tipo non riconosciuto');
      }

      if (error) throw error;

      toast({
        title: "Successo",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} eliminato con successo`
      });
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      toast({
        title: "Errore",
        description: `Impossibile eliminare ${type}`,
        variant: "destructive"
      });
    }
  };

  const handleEditMedication = (medication: Medication) => {
    setNewMedication({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      start_date: medication.start_date,
      end_date: medication.end_date || '',
      notes: medication.notes || ''
    });
    setEditingMedication(medication);
    setShowAddMedication(true);
  };

  // Open diary dialog for new behavior entry
  const handleAddBehavior = () => {
    setShowDiaryDialog(true);
  };

  const handleAddDiaryEntry = async (data: any) => {
    try {
      const { data: savedEntry, error } = await supabase
        .from('diary_entries')
        .insert({
          user_id: user?.id,
          pet_id: selectedPet?.id,
          entry_date: data.date,
          behavioral_tags: data.behavioralTags,
          mood_score: data.moodScore,
          notes: data.notes,
          weather_condition: data.weatherCondition,
          location: data.location,
          activity_level: data.activityLevel,
          appetite_level: data.appetiteLevel,
          sleep_quality: data.sleepQuality,
          social_interaction: data.socialInteraction,
          training_notes: data.trainingNotes
        })
        .select()
        .single();

      if (error) throw error;

      setDiaryEntries(prev => [savedEntry, ...prev]);
      setShowDiaryDialog(false);

      toast({
        title: "Successo",
        description: "Comportamento osservato aggiunto con successo"
      });
    } catch (error) {
      console.error('Error saving diary entry:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare il comportamento osservato",
        variant: "destructive"
      });
    }
  };

  if (!selectedPet) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Nessun pet selezionato</h2>
          <p className="text-muted-foreground">Seleziona un pet per visualizzare le informazioni wellness</p>
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
          <div className="space-y-8 mt-8">
            
            {/* Primary Health Cards - Row 1 */}
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
                  <div className="text-center py-4">
                    <div className="text-3xl font-bold text-red-500 mb-2">85</div>
                    <div className="text-sm text-muted-foreground">Buona salute</div>
                    <Progress value={85} className="mt-3" />
                  </div>
                </CardContent>
              </Card>

              {/* Trend Chart Card */}
              <Card className="hover-scale bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-background border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                    Trend Parametri
                  </CardTitle>
                  <CardDescription>Andamento parametri vitali</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  {healthMetrics.length > 0 ? (
                    <div className="h-20">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={healthMetrics.slice(0, 7).reverse()}>
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#10b981" 
                            strokeWidth={2}
                            dot={false}
                          />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-background border rounded-lg px-2 py-1 shadow-lg">
                                    <p className="text-xs">{`${payload[0].value} ${healthMetrics[0]?.unit || ''}`}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nessun dato per il trend</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Detailed Emotions Analysis Card */}
              <Card className="hover-scale bg-gradient-to-br from-pink-500/10 via-pink-500/5 to-background border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-pink-500" />
                    Analisi Emozioni
                  </CardTitle>
                  <CardDescription>Distribuzione emozioni rilevate</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {emotionCounts && Object.keys(emotionCounts).length > 0 ? (
                    <div className="space-y-3">
                      <div className="h-16">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={Object.entries(emotionCounts).map(([emotion, count]) => ({
                                name: emotion,
                                value: count,
                                color: EMOTION_COLORS[emotion] || '#6b7280'
                              }))}
                              cx="50%"
                              cy="50%"
                              innerRadius={15}
                              outerRadius={25}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {Object.entries(emotionCounts).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={Object.values(emotionCounts)[index] ? EMOTION_COLORS[Object.keys(emotionCounts)[index]] || '#6b7280' : '#6b7280'} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-1 max-h-16 overflow-y-auto">
                        {Object.entries(emotionCounts)
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 3)
                          .map(([emotion, count]) => (
                            <div key={emotion} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: EMOTION_COLORS[emotion] || '#6b7280' }}
                                />
                                <span className="text-xs capitalize">{emotion}</span>
                              </div>
                              <span className="text-xs font-medium">{count}</span>
                            </div>
                          ))}
                      </div>
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
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {healthMetrics.length > 0 ? (
                    healthMetrics.slice(0, 3).map((metric) => (
                      <div key={metric.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-sm">{metric.metric_type}</span>
                          <span className="text-sm font-medium">
                            {metric.value} {metric.unit}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 w-6 p-0 text-blue-500"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 w-6 p-0 text-red-500"
                            onClick={() => handleDelete('metrica', metric.id, metric.metric_type)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
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

            </div>

            {/* Second Row: Farmaci attivi, visite recenti, documenti medici, assicurazione */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
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
                    if (!med.is_active) return false;
                    if (!med.end_date) return true;
                    return new Date(med.end_date) >= new Date();
                  }).length > 0 ? (
                    <div className="space-y-2">
                      {medications.filter(med => {
                        if (!med.is_active) return false;
                        if (!med.end_date) return true;
                        return new Date(med.end_date) >= new Date();
                      }).slice(0, 3).map((medication) => (
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
                            </div>
                             <div className="flex gap-1">
                               <Button 
                                 size="sm" 
                                 variant="ghost" 
                                 className="h-6 w-6 p-0 text-blue-500"
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
                                 onClick={() => handleDelete('documento', record.id, record.title)}
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
                      <p className="text-sm">Nessun documento medico</p>
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
                                   {isExpired ? "Disattiva" : "Attiva"}
                                 </Badge>
                               </div>
                             <div className="flex gap-1">
                               <Button 
                                 size="sm" 
                                 variant="ghost" 
                                 className="h-6 w-6 p-0 text-red-500"
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

            {/* Third Row: Contatti emergenza, veterinario, primo soccorso */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

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
                    <Button size="sm" variant="outline" className="h-8" onClick={() => setShowFirstAidGuide(true)}>
                      <BookOpen className="h-4 w-4 mr-1" />
                      Apri Guida
                    </Button>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Components */}
      
      {/* Add Medication Dialog */}
      <Dialog open={showAddMedication} onOpenChange={setShowAddMedication}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMedication ? 'Modifica Farmaco' : 'Aggiungi Farmaco'}</DialogTitle>
            <DialogDescription>
              {editingMedication ? 'Modifica i dettagli del farmaco' : 'Inserisci i dettagli del nuovo farmaco'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nome *</Label>
              <Input
                id="name"
                value={newMedication.name}
                onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
                placeholder="Nome del farmaco"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dosage" className="text-right">Dosaggio *</Label>
              <Input
                id="dosage"
                value={newMedication.dosage}
                onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                className="col-span-3"
                placeholder="es. 50mg"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="frequency" className="text-right">Frequenza *</Label>
              <Input
                id="frequency"
                value={newMedication.frequency}
                onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))}
                className="col-span-3"
                placeholder="es. 2 volte al giorno"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start_date" className="text-right">Data Inizio *</Label>
              <Input
                id="start_date"
                type="date"
                value={newMedication.start_date}
                onChange={(e) => setNewMedication(prev => ({ ...prev, start_date: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end_date" className="text-right">Data Fine</Label>
              <Input
                id="end_date"
                type="date"
                value={newMedication.end_date}
                onChange={(e) => setNewMedication(prev => ({ ...prev, end_date: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">Note</Label>
              <Textarea
                id="notes"
                value={newMedication.notes}
                onChange={(e) => setNewMedication(prev => ({ ...prev, notes: e.target.value }))}
                className="col-span-3"
                placeholder="Note aggiuntive..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
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

      {/* Confirmation Dialog */}
      <ConfirmDialog 
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        onConfirm={() => {
          confirmDialog.onConfirm();
          setConfirmDialog(prev => ({ ...prev, open: false }));
        }}
        title={confirmDialog.title}
        description={confirmDialog.message}
        confirmText="Elimina"
        variant="destructive"
      />

      {/* First Aid Guide */}
      <FirstAidGuide 
        open={showFirstAidGuide}
        onOpenChange={setShowFirstAidGuide}
      />

      {/* Diary Entry Dialog */}
      <DiaryEntryForm
        isOpen={showDiaryDialog}
        onClose={() => setShowDiaryDialog(false)}
        onSave={handleAddDiaryEntry}
        petId={selectedPet?.id || ''}
        userId={user?.id || ''}
      />
    </div>
  );
};

export default WellnessPage;