import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Heart, 
  Activity, 
  BarChart2,
  Thermometer,
  Stethoscope,
  Siren
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { usePets } from '@/contexts/PetContext';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';
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
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine
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

// Unified Health Chart Component
const UnifiedHealthChart = ({ healthMetrics, diaryEntries, analyses, selectedPet }: {
  healthMetrics: HealthMetric[];
  diaryEntries: any[];
  analyses: any;
  selectedPet: any;
}) => {
  const [selectedMetrics, setSelectedMetrics] = React.useState({
    wellness: true,
    mood: true,
    temperature: true,
    heartRate: true,
    respiration: true,
    gumColor: false
  });

  // Combina tutti i dati in un formato unificato
  const unifiedData = React.useMemo(() => {
    const dataMap = new Map();
    
    // Aggiungi dati wellness score (simulati per ora)
    if (selectedMetrics.wellness && analyses?.wellnessTrends) {
      analyses.wellnessTrends.forEach((item: any) => {
        const date = item.date;
        if (!dataMap.has(date)) dataMap.set(date, { date });
        dataMap.get(date).wellness = item.score;
      });
    }
    
    // Aggiungi dati mood dal diario
    if (selectedMetrics.mood && diaryEntries) {
      diaryEntries.forEach((entry) => {
        const date = format(new Date(entry.entry_date), 'dd/MM');
        if (!dataMap.has(date)) dataMap.set(date, { date });
        if (entry.mood_score) {
          dataMap.get(date).mood = entry.mood_score * 10; // Scala 1-10 -> 10-100
        }
      });
    }
    
    // Aggiungi parametri vitali
    if (healthMetrics) {
      healthMetrics.forEach((metric) => {
        const date = format(new Date(metric.recorded_at), 'dd/MM');
        if (!dataMap.has(date)) dataMap.set(date, { date });
        
        switch (metric.metric_type) {
          case 'temperature':
            if (selectedMetrics.temperature) {
              dataMap.get(date).temperature = (metric.value - 35) * 5; // Normalizza 35-42°C -> 0-35
            }
            break;
          case 'heart_rate':
            if (selectedMetrics.heartRate) {
              dataMap.get(date).heartRate = Math.min(metric.value / 2, 100); // Normalizza ~200bpm -> 100
            }
            break;
          case 'respiration':
          case 'respiratory_rate':
            if (selectedMetrics.respiration) {
              dataMap.get(date).respiration = metric.value * 2.5; // Normalizza ~40 -> 100
            }
            break;
          case 'gum_color':
            if (selectedMetrics.gumColor) {
              dataMap.get(date).gumColor = (5 - metric.value) * 25; // 1=rosa(100), 4=gialle(25)
            }
            break;
        }
      });
    }
    
    return Array.from(dataMap.values()).sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('-'));
      const dateB = new Date(b.date.split('/').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });
  }, [healthMetrics, diaryEntries, analyses, selectedMetrics]);

  return (
    <div className="space-y-4">
      {/* Filtri metriche */}
      <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg">
        <span className="text-sm font-medium mr-2">Mostra:</span>
        {Object.entries(selectedMetrics).map(([key, value]) => (
          <Badge
            key={key}
            variant={value ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedMetrics(prev => ({ ...prev, [key]: !prev[key] }))}
          >
            {key === 'wellness' && 'Benessere'}
            {key === 'mood' && 'Umore'}
            {key === 'temperature' && 'Temperatura'}
            {key === 'heartRate' && 'Battito'}
            {key === 'respiration' && 'Respirazione'}
            {key === 'gumColor' && 'Gengive'}
          </Badge>
        ))}
      </div>

      {/* Grafico unificato */}
      <div className="h-80">
        <ChartContainer config={{
          wellness: { label: "Benessere (%)", color: "hsl(var(--primary))" },
          mood: { label: "Umore (scala 0-100)", color: "hsl(var(--accent))" },
          temperature: { label: "Temperatura (normalizzata)", color: "hsl(var(--destructive))" },
          heartRate: { label: "Battito (normalizzato)", color: "hsl(var(--success))" },
          respiration: { label: "Respirazione (normalizzata)", color: "hsl(var(--secondary))" },
          gumColor: { label: "Gengive (qualità)", color: "hsl(var(--warning))" }
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={unifiedData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              
              {selectedMetrics.wellness && (
                <Line
                  type="monotone"
                  dataKey="wellness"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              )}
              {selectedMetrics.mood && (
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              )}
              {selectedMetrics.temperature && (
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              )}
              {selectedMetrics.heartRate && (
                <Line
                  type="monotone"
                  dataKey="heartRate"
                  stroke="hsl(var(--success))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              )}
              {selectedMetrics.respiration && (
                <Line
                  type="monotone"
                  dataKey="respiration"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              )}
              {selectedMetrics.gumColor && (
                <Line
                  type="monotone"
                  dataKey="gumColor"
                  stroke="hsl(var(--warning))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              )}
              
              {/* Linee di riferimento */}
              <ReferenceLine y={50} stroke="hsl(var(--warning))" strokeDasharray="5 5" opacity={0.7} />
              <ReferenceLine y={75} stroke="hsl(var(--success))" strokeDasharray="5 5" opacity={0.7} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
      
      {/* Legenda con valori attuali */}
      {unifiedData.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
          {selectedMetrics.wellness && unifiedData[unifiedData.length - 1].wellness && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Benessere</p>
              <p className="text-2xl font-bold text-primary">{unifiedData[unifiedData.length - 1].wellness}%</p>
            </div>
          )}
          {selectedMetrics.mood && unifiedData[unifiedData.length - 1].mood && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Umore</p>
              <p className="text-2xl font-bold text-accent">{Math.round(unifiedData[unifiedData.length - 1].mood / 10)}/10</p>
            </div>
          )}
        </div>
      )}
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
  const [filteredDiaryEntries, setFilteredDiaryEntries] = useState<any[]>([]);

  // Mock analytics data
  const displayAnalytics = {
    wellnessTrends: [
      { date: '01/01', score: 75 },
      { date: '02/01', score: 80 },
      { date: '03/01', score: 72 }
    ],
    moodTrends: []
  };

  // Fetch health metrics
  useEffect(() => {
    if (!user || !selectedPet) return;
    
    const fetchHealthMetrics = async () => {
      try {
        const { data } = await supabase
          .from('health_metrics')
          .select('*')
          .eq('pet_id', selectedPet.id)
          .eq('user_id', user.id)
          .order('recorded_at', { ascending: false });
        
        if (data) setHealthMetrics(data);
      } catch (error) {
        console.error('Error fetching health metrics:', error);
      }
    };

    fetchHealthMetrics();
  }, [user, selectedPet]);

  if (!selectedPet) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Seleziona un Pet</h3>
            <p className="text-muted-foreground">
              Scegli un pet per visualizzare i dati di benessere e salute
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Dashboard Wellness</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">
            <BarChart2 className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <Activity className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="emergency">
            <Siren className="h-4 w-4 mr-2" />
            Emergenze
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Health Score Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Punteggio Benessere
              </CardTitle>
              <CardDescription>
                Punteggio generale sulla salute e monitoraggio parametri vitali
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

          {/* Unified Health Dashboard Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5" />
                Dashboard Salute Completa
              </CardTitle>
              <CardDescription>
                Panoramica unificata di tutti i parametri di salute e benessere con sistema di allerta integrato
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UnifiedHealthChart 
                healthMetrics={healthMetrics}
                diaryEntries={filteredDiaryEntries}
                analyses={displayAnalytics}
                selectedPet={selectedPet}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Alert>
            <Activity className="h-4 w-4" />
            <AlertDescription>
              Sezione in sviluppo - qui verranno mostrate analisi dettagliate e report
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Emergency Tab */}
        <TabsContent value="emergency" className="space-y-6">
          <Alert>
            <Siren className="h-4 w-4" />
            <AlertDescription>
              Sezione emergenze - qui saranno mostrati contatti veterinari e guida primo soccorso
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WellnessPage;