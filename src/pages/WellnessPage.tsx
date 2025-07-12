import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  QrCode,
  PhoneCall,
  MessageSquare,
  Stethoscope,
  Siren,
  User,
  CreditCard,
  FileImage,
  ChevronRight,
  Trash2,
  Edit,
  Star,
  Target,
  Zap,
  Gauge
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { usePets } from '@/contexts/PetContext';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, subMonths, subDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

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
  vet_type: string;
  is_primary: boolean;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship?: string;
  contact_type: string;
  is_primary: boolean;
}

interface HealthAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description?: string;
  is_read: boolean;
  created_at: string;
}

const WellnessPage: React.FC = () => {
  const { user } = useAuth();
  const { selectedPet } = usePets();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Health data states
  const [healthScore, setHealthScore] = useState(0);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [healthAlerts, setHealthAlerts] = useState<HealthAlert[]>([]);
  
  // Dialog states
  const [showAddMetric, setShowAddMetric] = useState(false);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showAddVet, setShowAddVet] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);

  // Health score calculation
  const calculateHealthScore = (metrics: HealthMetric[]) => {
    if (metrics.length === 0) return 0;
    
    // Get latest metrics for each type
    const latestMetrics: Record<string, HealthMetric> = {};
    metrics.forEach(metric => {
      if (!latestMetrics[metric.metric_type] || 
          new Date(metric.recorded_at) > new Date(latestMetrics[metric.metric_type].recorded_at)) {
        latestMetrics[metric.metric_type] = metric;
      }
    });

    // Score calculation based on ideal ranges (simplified)
    let totalScore = 0;
    let metricCount = 0;

    Object.values(latestMetrics).forEach(metric => {
      let score = 50; // Base score
      
      switch (metric.metric_type) {
        case 'weight':
          // Assume stable weight is good (score between 70-90)
          score = 80;
          break;
        case 'appetite':
          score = Math.min(100, metric.value * 10); // 1-10 scale to 0-100
          break;
        case 'activity':
          score = Math.min(100, metric.value * 10);
          break;
        case 'behavior':
          score = Math.min(100, metric.value * 10);
          break;
        case 'sleep':
          score = Math.min(100, metric.value * 10);
          break;
        default:
          score = 75; // Default good score
      }
      
      totalScore += score;
      metricCount++;
    });

    return metricCount > 0 ? Math.round(totalScore / metricCount) : 0;
  };

  // Fetch all health data
  const fetchHealthData = async () => {
    if (!user || !selectedPet) return;

    try {
      setLoading(true);

      // Fetch health metrics
      const { data: metricsData } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .order('recorded_at', { ascending: false })
        .limit(100);

      if (metricsData) {
        setHealthMetrics(metricsData);
        setHealthScore(calculateHealthScore(metricsData));
      }

      // Fetch medical records with veterinarian data
      const { data: recordsData } = await supabase
        .from('medical_records')
        .select(`
          *,
          veterinarian:veterinarians(name, clinic_name)
        `)
        .eq('pet_id', selectedPet.id)
        .order('record_date', { ascending: false });

      if (recordsData) {
        setMedicalRecords(recordsData);
      }

      // Fetch medications
      const { data: medicationsData } = await supabase
        .from('medications')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .order('created_at', { ascending: false });

      if (medicationsData) {
        setMedications(medicationsData);
      }

      // Fetch veterinarians
      const { data: veterinariansData } = await supabase
        .from('veterinarians')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false });

      if (veterinariansData) {
        setVeterinarians(veterinariansData);
      }

      // Fetch emergency contacts
      const { data: contactsData } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false });

      if (contactsData) {
        setEmergencyContacts(contactsData);
      }

      // Fetch health alerts
      const { data: alertsData } = await supabase
        .from('health_alerts')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .eq('is_resolved', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (alertsData) {
        setHealthAlerts(alertsData);
      }

    } catch (error) {
      console.error('Error fetching health data:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i dati della salute",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, [user, selectedPet]);

  // Prepare chart data
  const prepareChartData = (metricType: string) => {
    const filtered = healthMetrics
      .filter(m => m.metric_type === metricType)
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
      .slice(-30); // Last 30 data points

    return filtered.map(m => ({
      date: format(new Date(m.recorded_at), 'dd/MM'),
      value: m.value,
      fullDate: format(new Date(m.recorded_at), 'dd/MM/yyyy')
    }));
  };

  const weightData = prepareChartData('weight');
  const activityData = prepareChartData('activity');
  const appetiteData = prepareChartData('appetite');
  const sleepData = prepareChartData('sleep');

  // Health score color
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getHealthScoreStatus = (score: number) => {
    if (score >= 80) return 'Eccellente';
    if (score >= 60) return 'Buono';
    if (score >= 40) return 'Discreto';
    return 'Preoccupante';
  };

  // Quick stats
  const getQuickStats = () => {
    const lastVetVisit = medicalRecords
      .filter(r => r.record_type === 'exam')
      .sort((a, b) => new Date(b.record_date).getTime() - new Date(a.record_date).getTime())[0];

    const nextAppointment = null; // Would come from calendar_events

    const activeMeds = medications.filter(m => m.is_active).length;

    return {
      lastVetVisit: lastVetVisit ? format(new Date(lastVetVisit.record_date), 'dd/MM/yyyy') : 'Mai',
      nextAppointment: nextAppointment ? 'Data appuntamento' : 'Nessuno',
      activeMedications: activeMeds,
      totalRecords: medicalRecords.length
    };
  };

  const quickStats = getQuickStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Caricamento dati salute...</p>
        </div>
      </div>
    );
  }

  if (!selectedPet) {
    return (
      <div className="text-center py-12">
        <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Nessun Pet Selezionato</h2>
        <p className="text-muted-foreground">Seleziona un pet per visualizzare i dati di salute.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Salute e Benessere</h1>
          <p className="text-muted-foreground">
            Monitora la salute di {selectedPet.name} con strumenti professionali
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <QrCode className="h-4 w-4 mr-2" />
            QR Emergenza
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Esporta Dati
          </Button>
        </div>
      </div>

      {/* Health Alerts */}
      {healthAlerts.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Alert di salute attivi ({healthAlerts.length})</p>
              {healthAlerts.slice(0, 3).map(alert => (
                <div key={alert.id} className="text-sm">
                  <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'} className="mr-2">
                    {alert.severity}
                  </Badge>
                  {alert.title}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="profile">Profilo Medico</TabsTrigger>
          <TabsTrigger value="records">Documenti</TabsTrigger>
          <TabsTrigger value="tracking">Monitoraggio</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="emergency">Emergenze</TabsTrigger>
        </TabsList>

        {/* DASHBOARD TAB */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Health Score Card */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-success/10 via-warning/10 to-destructive/10"></div>
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Health Score</CardTitle>
                  <CardDescription>Valutazione complessiva dello stato di salute</CardDescription>
                </div>
                <div className="text-right">
                  <div className={`text-4xl font-bold ${getHealthScoreColor(healthScore)}`}>
                    {healthScore}/100
                  </div>
                  <Badge variant="secondary" className={getHealthScoreColor(healthScore)}>
                    <Gauge className="h-3 w-3 mr-1" />
                    {getHealthScoreStatus(healthScore)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <Progress value={healthScore} className="h-3 mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <p className="font-medium">Ultimo Controllo</p>
                  <p className="text-muted-foreground">{quickStats.lastVetVisit}</p>
                </div>
                <div className="text-center">
                  <p className="font-medium">Prossimo Appuntamento</p>
                  <p className="text-muted-foreground">{quickStats.nextAppointment}</p>
                </div>
                <div className="text-center">
                  <p className="font-medium">Farmaci Attivi</p>
                  <p className="text-muted-foreground">{quickStats.activeMedications}</p>
                </div>
                <div className="text-center">
                  <p className="font-medium">Documenti Medici</p>
                  <p className="text-muted-foreground">{quickStats.totalRecords}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Trends Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Peso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip labelFormatter={(label) => `Data: ${label}`} />
                    <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Attività
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="hsl(var(--success))" fill="hsl(var(--success) / 0.3)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Appetito
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={appetiteData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="hsl(var(--warning))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Sonno
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={sleepData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="hsl(var(--accent))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => setShowAddMetric(true)}
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm">Aggiungi Metrica</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => setShowAddRecord(true)}
            >
              <FileText className="h-6 w-6" />
              <span className="text-sm">Nuovo Documento</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => setShowAddMedication(true)}
            >
              <Pill className="h-6 w-6" />
              <span className="text-sm">Aggiungi Farmaco</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col gap-2"
            >
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Prenota Visita</span>
            </Button>
          </div>
        </TabsContent>

        {/* MEDICAL PROFILE TAB */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Veterinarians */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Veterinari
                  </CardTitle>
                  <Button size="sm" onClick={() => setShowAddVet(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {veterinarians.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Nessun veterinario registrato</p>
                ) : (
                  veterinarians.map(vet => (
                    <div key={vet.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{vet.name}</h4>
                        <div className="flex gap-1">
                          {vet.is_primary && (
                            <Badge variant="default">Primario</Badge>
                          )}
                          <Badge variant="secondary">{vet.vet_type}</Badge>
                        </div>
                      </div>
                      {vet.clinic_name && (
                        <p className="text-sm text-muted-foreground">{vet.clinic_name}</p>
                      )}
                      <div className="flex gap-4 text-sm">
                        {vet.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {vet.phone}
                          </div>
                        )}
                        {vet.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {vet.email}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Insurance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Assicurazione
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Nessuna polizza assicurativa registrata</p>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi Assicurazione
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pet Medical ID */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Identificazione Medica
              </CardTitle>
              <CardDescription>
                Genera tag di identificazione medica e QR code per emergenze
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Microchip</Label>
                  <Input placeholder="Numero microchip" />
                </div>
                <div className="space-y-2">
                  <Label>Registro</Label>
                  <Input placeholder="Database di registrazione" />
                </div>
                <div className="space-y-2">
                  <Label>Data Impianto</Label>
                  <Input type="date" />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline">
                  <QrCode className="h-4 w-4 mr-2" />
                  Genera QR Code
                </Button>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Crea Tag Medico
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MEDICAL RECORDS TAB */}
        <TabsContent value="records" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Documenti Medici</CardTitle>
                  <CardDescription>
                    Gestisci cartelle cliniche, referti e documenti sanitari
                  </CardDescription>
                </div>
                <Button onClick={() => setShowAddRecord(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuovo Documento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medicalRecords.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Nessun documento medico caricato</p>
                    <Button variant="outline" onClick={() => setShowAddRecord(true)}>
                      <Upload className="h-4 w-4 mr-2" />
                      Carica Primo Documento
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {medicalRecords.map(record => (
                      <div key={record.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{record.title}</h4>
                              <Badge variant="secondary">{record.record_type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(record.record_date), 'dd MMMM yyyy', { locale: it })}
                            </p>
                            {record.description && (
                              <p className="text-sm">{record.description}</p>
                            )}
                            {record.veterinarian && (
                              <p className="text-xs text-muted-foreground">
                                Dr. {record.veterinarian.name}
                                {record.veterinarian.clinic_name && ` - ${record.veterinarian.clinic_name}`}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {record.document_url && (
                              <Button size="sm" variant="outline">
                                <FileImage className="h-4 w-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <Share className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* HEALTH TRACKING TAB */}
        <TabsContent value="tracking" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Medications */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5" />
                    Farmaci Attivi
                  </CardTitle>
                  <Button size="sm" onClick={() => setShowAddMedication(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medications.filter(m => m.is_active).length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">Nessun farmaco attivo</p>
                  ) : (
                    medications.filter(m => m.is_active).map(med => (
                      <div key={med.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{med.name}</h4>
                          <Badge variant="default">Attivo</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {med.dosage} - {med.frequency}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Dal {format(new Date(med.start_date), 'dd/MM/yyyy')}
                          {med.end_date && ` al ${format(new Date(med.end_date), 'dd/MM/yyyy')}`}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Latest Metrics */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Ultime Metriche
                  </CardTitle>
                  <Button size="sm" onClick={() => setShowAddMetric(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {healthMetrics.slice(0, 5).map(metric => (
                    <div key={metric.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium capitalize">{metric.metric_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(metric.recorded_at), 'dd/MM HH:mm')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{metric.value} {metric.unit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Correlazioni Salute-Umore</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Analisi delle correlazioni disponibile con più dati
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pattern Stagionali</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Riconoscimento pattern in corso...
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Efficacia Farmaci</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Tracking efficacia terapie
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* EMERGENCY TAB */}
        <TabsContent value="emergency" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Emergency Contacts */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contatti di Emergenza
                  </CardTitle>
                  <Button size="sm" onClick={() => setShowAddContact(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {emergencyContacts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Nessun contatto di emergenza</p>
                ) : (
                  emergencyContacts.map(contact => (
                    <div key={contact.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{contact.name}</h4>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <PhoneCall className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {contact.relationship} • {contact.contact_type}
                      </p>
                      <p className="text-sm font-mono">{contact.phone}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Quick Emergency Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Siren className="h-5 w-5" />
                  Azioni di Emergenza
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="destructive" className="w-full justify-start">
                  <PhoneCall className="h-4 w-4 mr-2" />
                  Chiama Veterinario di Emergenza
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  Trova Clinica Più Vicina
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Centro Antiveleni
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Guida Primo Soccorso
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Protocol */}
          <Card>
            <CardHeader>
              <CardTitle>Protocollo di Emergenza</CardTitle>
              <CardDescription>
                Linee guida step-by-step per situazioni di emergenza
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-destructive pl-4">
                  <h4 className="font-medium text-destructive">1. Valuta la Situazione</h4>
                  <p className="text-sm text-muted-foreground">
                    Mantieni la calma e valuta se il pet è cosciente e respira normalmente
                  </p>
                </div>
                <div className="border-l-4 border-warning pl-4">
                  <h4 className="font-medium text-warning">2. Contatta il Veterinario</h4>
                  <p className="text-sm text-muted-foreground">
                    Chiama immediatamente il veterinario o la clinica di emergenza
                  </p>
                </div>
                <div className="border-l-4 border-success pl-4">
                  <h4 className="font-medium text-success">3. Primo Soccorso</h4>
                  <p className="text-sm text-muted-foreground">
                    Applica le tecniche di primo soccorso appropriate se necessario
                  </p>
                </div>
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-medium text-primary">4. Trasporto Sicuro</h4>
                  <p className="text-sm text-muted-foreground">
                    Trasporta il pet in modo sicuro seguendo le indicazioni del veterinario
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Metric Dialog */}
      <Dialog open={showAddMetric} onOpenChange={setShowAddMetric}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Metrica di Salute</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo Metrica</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo metrica" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight">Peso</SelectItem>
                  <SelectItem value="temperature">Temperatura</SelectItem>
                  <SelectItem value="appetite">Appetito (1-10)</SelectItem>
                  <SelectItem value="activity">Attività (1-10)</SelectItem>
                  <SelectItem value="sleep">Sonno (1-10)</SelectItem>
                  <SelectItem value="behavior">Comportamento (1-10)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valore</Label>
                <Input type="number" step="0.1" placeholder="Es. 15.5" />
              </div>
              <div className="space-y-2">
                <Label>Unità</Label>
                <Input placeholder="Es. kg, °C" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Note (opzionale)</Label>
              <Textarea placeholder="Aggiungi note o osservazioni..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddMetric(false)}>
                Annulla
              </Button>
              <Button>Salva Metrica</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Medical Record Dialog */}
      <Dialog open={showAddRecord} onOpenChange={setShowAddRecord}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nuovo Documento Medico</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Titolo</Label>
                <Input placeholder="Es. Visita di controllo" />
              </div>
              <div className="space-y-2">
                <Label>Tipo Documento</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vaccination">Vaccinazione</SelectItem>
                    <SelectItem value="exam">Visita</SelectItem>
                    <SelectItem value="treatment">Trattamento</SelectItem>
                    <SelectItem value="lab_work">Analisi</SelectItem>
                    <SelectItem value="surgery">Chirurgia</SelectItem>
                    <SelectItem value="emergency">Emergenza</SelectItem>
                    <SelectItem value="other">Altro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Costo (opzionale)</Label>
                <Input type="number" step="0.01" placeholder="€ 0.00" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrizione</Label>
              <Textarea placeholder="Descrivi il documento o la visita..." />
            </div>
            <div className="space-y-2">
              <Label>Carica Documento</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Trascina qui i file o clicca per selezionare
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, immagini, documenti (max 10MB)
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddRecord(false)}>
                Annulla
              </Button>
              <Button>Salva Documento</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Medication Dialog */}
      <Dialog open={showAddMedication} onOpenChange={setShowAddMedication}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Farmaco</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Farmaco</Label>
              <Input placeholder="Es. Antibiotico XYZ" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dosaggio</Label>
                <Input placeholder="Es. 10mg" />
              </div>
              <div className="space-y-2">
                <Label>Frequenza</Label>
                <Input placeholder="Es. 2 volte al giorno" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Inizio</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Data Fine (opzionale)</Label>
                <Input type="date" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea placeholder="Istruzioni speciali, effetti collaterali, etc..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddMedication(false)}>
                Annulla
              </Button>
              <Button>Salva Farmaco</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Veterinarian Dialog */}
      <Dialog open={showAddVet} onOpenChange={setShowAddVet}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Veterinario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input placeholder="Dr. Mario Rossi" />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primario</SelectItem>
                    <SelectItem value="specialist">Specialista</SelectItem>
                    <SelectItem value="emergency">Emergenza</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Clinica</Label>
              <Input placeholder="Nome della clinica" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefono</Label>
                <Input placeholder="+39 123 456 7890" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="vet@clinica.it" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Indirizzo</Label>
              <Textarea placeholder="Via Roma 123, Milano" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddVet(false)}>
                Annulla
              </Button>
              <Button>Salva Veterinario</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Emergency Contact Dialog */}
      <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Contatto di Emergenza</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input placeholder="Mario Rossi" />
              </div>
              <div className="space-y-2">
                <Label>Tipo Contatto</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family">Famiglia</SelectItem>
                    <SelectItem value="friend">Amico</SelectItem>
                    <SelectItem value="vet">Veterinario</SelectItem>
                    <SelectItem value="emergency_vet">Vet. Emergenza</SelectItem>
                    <SelectItem value="poison_control">Centro Antiveleni</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefono</Label>
                <Input placeholder="+39 123 456 7890" />
              </div>
              <div className="space-y-2">
                <Label>Relazione</Label>
                <Input placeholder="Es. Fratello, Amico" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email (opzionale)</Label>
              <Input type="email" placeholder="contatto@email.it" />
            </div>
            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea placeholder="Informazioni aggiuntive..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddContact(false)}>
                Annulla
              </Button>
              <Button>Salva Contatto</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WellnessPage;