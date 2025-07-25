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

const WellnessNewPage = () => {
  const { user } = useAuth();
  const { pets } = usePets();
  const { addNotification } = useNotifications();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Loading state
  const [loading, setLoading] = useState(false);
  
  // Data fetching function
  const handleManualRefresh = async () => {
    if (!user || !pets.length) return;
    
    setLoading(true);
    try {
      toast({
        title: "Ricarica Dati",
        description: "I dati sono stati ricaricati correttamente.",
      });
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Errore",
        description: "Errore durante il caricamento dei dati.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Benessere Nuovo</h1>
          <p className="text-muted-foreground">
            Monitora la salute e il benessere del tuo pet
          </p>
        </div>
        <Button onClick={handleManualRefresh} disabled={loading} className="bg-primary hover:bg-primary/90">
          {loading ? "Caricamento..." : "Ricarica Dati"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="metrics">Parametri Vitali</TabsTrigger>
          <TabsTrigger value="medical">Cartella Clinica</TabsTrigger>
          <TabsTrigger value="medications">Farmaci</TabsTrigger>
          <TabsTrigger value="contacts">Contatti</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Stato di Salute
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">95/100</div>
                  <p className="text-sm text-muted-foreground">Ottima salute</p>
                  <Progress value={95} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Ultimo Controllo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold">15 giorni fa</div>
                  <p className="text-sm text-muted-foreground">Prossimo: 20 Feb</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-purple-500" />
                  Farmaci Attivi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-sm text-muted-foreground">In corso</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Riepilogo Recente</CardTitle>
              <CardDescription>
                Gli ultimi eventi importanti per la salute del tuo pet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="font-medium">Temperatura corporea</p>
                      <p className="text-sm text-muted-foreground">38.5°C - Normale</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Oggi</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Stethoscope className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="font-medium">Visita di controllo</p>
                      <p className="text-sm text-muted-foreground">Dr. Rossi - Tutto normale</p>
                    </div>
                  </div>
                  <Badge variant="secondary">2 giorni fa</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Pill className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="font-medium">Vaccino antirabbico</p>
                      <p className="text-sm text-muted-foreground">Completato con successo</p>
                    </div>
                  </div>
                  <Badge variant="secondary">1 settimana fa</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Parametri Vitali</CardTitle>
              <CardDescription>
                Registra e monitora i parametri vitali del tuo pet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">Nessun parametro registrato</p>
                <p className="text-muted-foreground mb-4">
                  Inizia a registrare i parametri vitali del tuo pet
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Parametro
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cartella Clinica</CardTitle>
              <CardDescription>
                Gestisci la cartella clinica e i documenti medici
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">Nessun documento</p>
                <p className="text-muted-foreground mb-4">
                  Carica documenti medici, referti e visite
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Documento
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Farmaci e Trattamenti</CardTitle>
              <CardDescription>
                Tieni traccia di farmaci, dosi e programmi di somministrazione
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">Nessun farmaco attivo</p>
                <p className="text-muted-foreground mb-4">
                  Aggiungi i farmaci che il tuo pet sta assumendo
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Farmaco
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Veterinari</CardTitle>
                <CardDescription>
                  I tuoi veterinari di fiducia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">Nessun veterinario</p>
                  <p className="text-muted-foreground mb-4">
                    Aggiungi i contatti dei tuoi veterinari
                  </p>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contatti di Emergenza</CardTitle>
                <CardDescription>
                  Contatti per situazioni di emergenza
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">Nessun contatto</p>
                  <p className="text-muted-foreground mb-4">
                    Aggiungi contatti di emergenza
                  </p>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Insights e Analisi</CardTitle>
              <CardDescription>
                Analisi intelligenti basate sui dati del tuo pet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">Analisi non disponibili</p>
                <p className="text-muted-foreground mb-4">
                  Aggiungi più dati per generare insights personalizzati
                </p>
                <Button variant="outline">
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Visualizza Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WellnessNewPage;