import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  ReferenceLine,
  Tooltip,
  Legend
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Heart,
  Calendar,
  Users,
  Download,
  FileText,
  AlertTriangle,
  Target,
  Filter,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
  Zap,
  Clock,
  Award,
  Scale,
  Stethoscope,
  Brain,
  Eye,
  Lightbulb,
  Share2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MapPin,
  Thermometer,
  Cloud,
  BarChart2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePets } from '@/contexts/PetContext';
import { useAuth } from '@/contexts/AuthContext';
import { format, subDays, subMonths, subYears, startOfDay, endOfDay, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';

interface AnalysisData {
  id: string;
  created_at: string;
  primary_emotion: string;
  primary_confidence: number;
  secondary_emotions: any;
  behavioral_insights: string;
  file_type: string;
  pet_id: string;
}

interface DiaryData {
  id: string;
  entry_date: string;
  mood_score: number;
  behavioral_tags: string[];
  temperature: number;
  weather_condition: string;
  pet_id: string;
}

interface HealthData {
  id: string;
  recorded_at: string;
  metric_type: string;
  value: number;
  unit: string;
  pet_id: string;
  notes?: string;
}

interface WellnessData {
  id: string;
  score_date: string;
  wellness_score: number;
  factors: any;
  pet_id: string;
}

interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: number;
  weight: number;
}

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

const TIME_RANGES = [
  { value: '7d', label: '7 giorni', days: 7 },
  { value: '1m', label: '1 mese', days: 30 },
  { value: '3m', label: '3 mesi', days: 90 },
  { value: '6m', label: '6 mesi', days: 180 },
  { value: '1y', label: '1 anno', days: 365 }
];

export default function StatsPage() {
  const { user } = useAuth();
  const { selectedPet: activePet, pets } = usePets();
  const { toast } = useToast();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<AnalysisData[]>([]);
  const [diaryData, setDiaryData] = useState<DiaryData[]>([]);
  const [healthData, setHealthData] = useState<HealthData[]>([]);
  const [wellnessData, setWellnessData] = useState<WellnessData[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1m');
  const [selectedPets, setSelectedPets] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subMonths(new Date(), 1),
    to: new Date()
  });

  // Initialize and update selected pets when active pet changes
  useEffect(() => {
    if (activePet) {
      setSelectedPets([activePet.id]);
    }
  }, [activePet]);

  // Fetch all data
  const fetchData = async () => {
    if (!user || selectedPets.length === 0) return;
    
    setLoading(true);
    try {
      const { from, to } = dateRange;
      const fromStr = format(startOfDay(from), 'yyyy-MM-dd HH:mm:ss');
      const toStr = format(endOfDay(to), 'yyyy-MM-dd HH:mm:ss');

      // Fetch analyses
      const { data: analyses } = await supabase
        .from('pet_analyses')
        .select('*')
        .in('pet_id', selectedPets)
        .gte('created_at', fromStr)
        .lte('created_at', toStr)
        .order('created_at', { ascending: true });

      // Fetch diary entries
      const { data: diaryEntries } = await supabase
        .from('diary_entries')
        .select('*')
        .in('pet_id', selectedPets)
        .gte('entry_date', format(from, 'yyyy-MM-dd'))
        .lte('entry_date', format(to, 'yyyy-MM-dd'))
        .order('entry_date', { ascending: true });

      // Fetch health metrics
      const { data: healthMetrics } = await supabase
        .from('health_metrics')
        .select('*')
        .in('pet_id', selectedPets)
        .gte('recorded_at', fromStr)
        .lte('recorded_at', toStr)
        .order('recorded_at', { ascending: true });

      // Fetch wellness scores
      const { data: wellnessScores } = await supabase
        .from('pet_wellness_scores')
        .select('*')
        .in('pet_id', selectedPets)
        .gte('score_date', format(from, 'yyyy-MM-dd'))
        .lte('score_date', format(to, 'yyyy-MM-dd'))
        .order('score_date', { ascending: true });

      setAnalysisData(analyses || []);
      setDiaryData(diaryEntries || []);
      setHealthData(healthMetrics || []);
      setWellnessData(wellnessScores || []);
    } catch (error) {
      console.error('Error fetching stats data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const refreshData = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Update date range based on time range selection
  const updateTimeRange = (range: string) => {
    setSelectedTimeRange(range);
    const selectedRange = TIME_RANGES.find(r => r.value === range);
    if (selectedRange) {
      setDateRange({
        from: subDays(new Date(), selectedRange.days),
        to: new Date()
      });
    }
  };

  // Fetch data when dependencies change (auto-refresh)
  useEffect(() => {
    if (selectedPets.length > 0) {
      fetchData();
    }
  }, [selectedPets, dateRange, user, selectedTimeRange]);

  // Refresh data when page becomes visible (when user returns from other pages)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && selectedPets.length > 0) {
        fetchData();
      }
    };

    const handleFocus = () => {
      if (selectedPets.length > 0) {
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [selectedPets]);

  // Computed analytics
  const analytics = useMemo(() => {
    if (!analysisData.length && !diaryData.length) return null;

    // Overview metrics
    const totalAnalyses = analysisData.length;
    
    // Calculate real health score based on multiple factors
    const calculateHealthScore = () => {
      if (healthData.length === 0 && diaryData.length === 0) return 0;
      
      let score = 0;
      let factors = 0;

      // Base score from wellness data
      if (wellnessData.length > 0) {
        score += wellnessData.reduce((sum, w) => sum + (w.wellness_score || 0), 0) / wellnessData.length;
        factors++;
      }

      // Health metrics contribution
      if (healthData.length > 0) {
        const recentHealthData = healthData.filter(h => 
          new Date(h.recorded_at) >= subDays(new Date(), 30)
        );
        
        if (recentHealthData.length > 0) {
          // Regular monitoring bonus
          score += Math.min(20, recentHealthData.length * 2);
          factors++;
          
          // Critical values penalty
          const criticalCount = recentHealthData.filter(h => {
            if (h.metric_type === 'temperature' && (h.value < 37.5 || h.value > 39.5)) return true;
            if (h.metric_type === 'heart_rate' && (h.value < 60 || h.value > 140)) return true;
            return false;
          }).length;
          
          score -= criticalCount * 10;
        }
      }

      // Diary mood contribution
      if (diaryData.length > 0) {
        const recentMoods = diaryData
          .filter(d => d.mood_score && new Date(d.entry_date) >= subDays(new Date(), 14))
          .map(d => d.mood_score);
        
        if (recentMoods.length > 0) {
          const avgMood = recentMoods.reduce((sum, m) => sum + m, 0) / recentMoods.length;
          score += (avgMood * 10); // Convert 1-10 scale to percentage contribution
          factors++;
        }
      }

      // Default score if no data
      if (factors === 0) return 0;
      
      return Math.max(0, Math.min(100, Math.round(score / factors)));
    };

    const averageWellnessScore = calculateHealthScore();
    const activeDays = new Set([
      ...analysisData.map(a => format(new Date(a.created_at), 'yyyy-MM-dd')),
      ...diaryData.map(d => d.entry_date)
    ]).size;

    // Emotion distribution
    const emotionCounts = analysisData.reduce((acc, analysis) => {
      acc[analysis.primary_emotion] = (acc[analysis.primary_emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const emotionDistribution = Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion,
      count,
      percentage: Math.round((count / totalAnalyses) * 100),
      fill: EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS] || '#6b7280'
    }));

    // Mood trends
    const moodTrends = diaryData
      .filter(d => d.mood_score)
      .map(d => ({
        date: d.entry_date,
        mood: d.mood_score,
        dateFormatted: format(new Date(d.entry_date), 'd MMM', { locale: it })
      }));

    // Wellness trends
    const wellnessTrends = wellnessData.map(w => ({
      date: w.score_date,
      score: w.wellness_score || 0,
      dateFormatted: format(new Date(w.score_date), 'd MMM', { locale: it })
    }));

    // Activity patterns - group by day of week
    const activityPatterns = Array.from({ length: 7 }, (_, i) => {
      const dayName = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'][i];
      const dayAnalyses = analysisData.filter(a => new Date(a.created_at).getDay() === i);
      return {
        day: dayName,
        analyses: dayAnalyses.length,
        avgConfidence: dayAnalyses.length > 0 
          ? Math.round(dayAnalyses.reduce((sum, a) => sum + a.primary_confidence, 0) / dayAnalyses.length * 100)
          : 0
      };
    });

    // Health metrics trends
    const weightTrends = healthData
      .filter(h => h.metric_type === 'weight')
      .map(h => ({
        date: format(new Date(h.recorded_at), 'yyyy-MM-dd'),
        weight: h.value,
        dateFormatted: format(new Date(h.recorded_at), 'd MMM', { locale: it })
      }));

    // Temperature trends
    const temperatureTrends = healthData
      .filter(h => h.metric_type === 'temperature')
      .map(h => ({
        date: format(new Date(h.recorded_at), 'yyyy-MM-dd'),
        temperature: h.value,
        dateFormatted: format(new Date(h.recorded_at), 'd MMM', { locale: it })
      }));

    // Heart rate trends
    const heartRateTrends = healthData
      .filter(h => h.metric_type === 'heart_rate')
      .map(h => ({
        date: format(new Date(h.recorded_at), 'yyyy-MM-dd'),
        heartRate: h.value,
        dateFormatted: format(new Date(h.recorded_at), 'd MMM', { locale: it })
      }));

    // Health metrics summary
    const healthMetricsSummary = {
      totalMetrics: healthData.length,
      uniqueMetricTypes: new Set(healthData.map(h => h.metric_type)).size,
      lastWeekMetrics: healthData.filter(h => 
        new Date(h.recorded_at) >= subDays(new Date(), 7)
      ).length,
      criticalValues: healthData.filter(h => {
        if (h.metric_type === 'temperature' && (h.value < 37.5 || h.value > 39.5)) return true;
        if (h.metric_type === 'heart_rate' && (h.value < 60 || h.value > 140)) return true;
        return false;
      }).length
    };

    // Behavioral correlations with weather
    const weatherCorrelations = diaryData
      .filter(d => d.weather_condition && d.mood_score)
      .reduce((acc, d) => {
        if (!acc[d.weather_condition]) {
          acc[d.weather_condition] = { total: 0, count: 0, moods: [] };
        }
        acc[d.weather_condition].total += d.mood_score;
        acc[d.weather_condition].count += 1;
        acc[d.weather_condition].moods.push(d.mood_score);
        return acc;
      }, {} as Record<string, { total: number; count: number; moods: number[] }>);

    const weatherMoodData = Object.entries(weatherCorrelations).map(([weather, data]) => ({
      weather,
      avgMood: Math.round(data.total / data.count * 10) / 10,
      count: data.count
    }));

    // Trend analysis
    const recentWellness = wellnessData.slice(-7);
    const previousWellness = wellnessData.slice(-14, -7);
    const wellnessTrend = recentWellness.length > 0 && previousWellness.length > 0
      ? ((recentWellness.reduce((sum, w) => sum + (w.wellness_score || 0), 0) / recentWellness.length) -
         (previousWellness.reduce((sum, w) => sum + (w.wellness_score || 0), 0) / previousWellness.length))
      : 0;

    return {
      totalAnalyses,
      averageWellnessScore,
      activeDays,
      emotionDistribution,
      moodTrends,
      wellnessTrends,
      activityPatterns,
      weightTrends,
      temperatureTrends,
      heartRateTrends,
      healthMetricsSummary,
      weatherMoodData,
      wellnessTrend,
      timeSpan: differenceInDays(dateRange.to, dateRange.from)
    };
  }, [analysisData, diaryData, healthData, wellnessData, dateRange]);

  // Create display analytics with fallback values - ULTRA SAFE VERSION
  const displayAnalytics = analytics || {
    totalAnalyses: 0,
    averageWellnessScore: 0,
    emotionDistribution: [],
    moodTrends: [],
    wellnessTrends: [],
    activityPatterns: [],
    weightTrends: [],
    temperatureTrends: [],
    heartRateTrends: [],
    weatherMoodData: [],
    activeDays: 0,
    timeSpan: 30,
    wellnessTrend: 0,
    healthMetricsSummary: {
      totalMetrics: 0,
      uniqueMetricTypes: 0,
      lastWeekMetrics: 0,
      criticalValues: 0
    }
  };

  // Mostra alert informativo se non ci sono dati reali
  const hasNoData = !analytics;

  if (!activePet) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Seleziona un Pet</h3>
            <p className="text-muted-foreground">
              Seleziona un pet dal menu a tendina per visualizzare le informazioni.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Alert informativo se non ci sono dati */}
      {hasNoData && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Statistiche in attesa di dati:</strong> Inizia ad analizzare le emozioni del tuo pet per vedere statistiche reali. 
            Per ora vengono mostrate le strutture con valori azzerati.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <BarChart2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Statistiche Avanzate</h1>
            <p className="text-muted-foreground">
              Analisi approfondita del benessere e comportamento dei tuoi pet
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range Selection */}
          <Select value={selectedTimeRange} onValueChange={updateTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map(range => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Export Button */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              // Generate comprehensive PDF report
              import('jspdf').then(({ default: jsPDF }) => {
                const doc = new jsPDF();
                const pet = activePet?.name || 'Pet';
                const dateRangeText = `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`;
                
                // Header
                doc.setFontSize(20);
                doc.text(`Report Statistiche - ${pet}`, 20, 20);
                doc.setFontSize(12);
                doc.text(`Periodo: ${dateRangeText}`, 20, 30);
                
                // Overview
                doc.setFontSize(16);
                doc.text('Panoramica', 20, 45);
                doc.setFontSize(10);
                doc.text(`Analisi Totali: ${displayAnalytics.totalAnalyses}`, 20, 55);
                doc.text(`Score Benessere: ${displayAnalytics.averageWellnessScore}%`, 20, 65);
                doc.text(`Giorni Attivi: ${displayAnalytics.activeDays}/${displayAnalytics.timeSpan}`, 20, 75);
                doc.text(`Emozione Principale: ${displayAnalytics.emotionDistribution[0]?.emotion || 'N/A'} (${displayAnalytics.emotionDistribution[0]?.percentage || 0}%)`, 20, 85);
                
                // Emotions
                doc.setFontSize(16);
                doc.text('Distribuzione Emozioni', 20, 105);
                doc.setFontSize(10);
                displayAnalytics.emotionDistribution.slice(0, 5).forEach((emotion, index) => {
                  doc.text(`${emotion.emotion}: ${emotion.percentage}%`, 20, 115 + (index * 10));
                });
                
                // Health summary
                doc.setFontSize(16);
                doc.text('Riassunto Salute', 20, 175);
                doc.setFontSize(10);
                doc.text(`Trend generale: ${displayAnalytics.wellnessTrend > 0 ? 'Miglioramento' : displayAnalytics.wellnessTrend < 0 ? 'Peggioramento' : 'Stabile'}`, 20, 185);
                
                // Save PDF
                doc.save(`statistiche-${pet.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
              });
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Esporta
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analisi Totali</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayAnalytics.totalAnalyses}</div>
            <p className="text-xs text-muted-foreground">
              negli ultimi {displayAnalytics.timeSpan} giorni
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Benessere</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {displayAnalytics.averageWellnessScore}%
              {displayAnalytics.wellnessTrend > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : displayAnalytics.wellnessTrend < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-600" />
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">
              {displayAnalytics.wellnessTrend > 0 ? '+' : ''}{Math.round(displayAnalytics.wellnessTrend)}% vs periodo precedente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giorni Attivi</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayAnalytics.activeDays}</div>
            <Progress 
              value={(displayAnalytics.activeDays / displayAnalytics.timeSpan) * 100} 
              className="h-2 mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((displayAnalytics.activeDays / displayAnalytics.timeSpan) * 100)}% del periodo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emozione Principale</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {displayAnalytics.emotionDistribution[0]?.emotion || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {displayAnalytics.emotionDistribution[0]?.percentage || 0}% delle analisi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="emotions">Emozioni</TabsTrigger>
          <TabsTrigger value="health">Salute</TabsTrigger>
          <TabsTrigger value="behavior">Comportamento</TabsTrigger>
          <TabsTrigger value="predictions">Previsioni</TabsTrigger>
          <TabsTrigger value="reports">Report</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Wellness Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trend Benessere
                </CardTitle>
                <CardDescription>
                  Evoluzione del punteggio di benessere nel tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{
                  score: { label: "Benessere", color: "hsl(var(--primary))" }
                }} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={displayAnalytics.wellnessTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="dateFormatted" />
                      <YAxis domain={[0, 100]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.2}
                      />
                      <ReferenceLine y={75} stroke="hsl(var(--success))" strokeDasharray="5 5" />
                      <ReferenceLine y={50} stroke="hsl(var(--warning))" strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Activity Patterns */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Pattern Attività
                </CardTitle>
                <CardDescription>
                  Distribuzione delle analisi per giorno della settimana
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{
                  analyses: { label: "Analisi", color: "hsl(var(--primary))" }
                }} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={displayAnalytics.activityPatterns}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="analyses" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Mood vs Weather Correlation */}
          {displayAnalytics.weatherMoodData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5" />
                  Correlazione Umore-Meteo
                </CardTitle>
                <CardDescription>
                  Come le condizioni meteorologiche influenzano l'umore del pet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{
                  avgMood: { label: "Umore Medio", color: "hsl(var(--primary))" }
                }} className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={displayAnalytics.weatherMoodData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="weather" />
                      <YAxis domain={[0, 10]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="avgMood" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Emotions Tab */}
        <TabsContent value="emotions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Emotion Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Distribuzione Emozioni
                </CardTitle>
                <CardDescription>
                  Percentuale delle diverse emozioni rilevate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <ChartContainer config={{}} className="h-[400px] w-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={displayAnalytics.emotionDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ emotion, percentage }) => `${emotion} ${percentage}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {displayAnalytics.emotionDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            {/* Mood Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5" />
                  Trend Umore
                </CardTitle>
                <CardDescription>
                  Variazione dell'umore nel tempo (scala 1-10)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{
                  mood: { label: "Umore", color: "hsl(var(--primary))" }
                }} className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={displayAnalytics.moodTrends}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="dateFormatted" />
                      <YAxis domain={[1, 10]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="mood"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                      />
                      <ReferenceLine y={7} stroke="hsl(var(--success))" strokeDasharray="5 5" />
                      <ReferenceLine y={4} stroke="hsl(var(--destructive))" strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Emotion Details */}
          <Card>
            <CardHeader>
              <CardTitle>Dettaglio Emozioni</CardTitle>
              <CardDescription>
                Analisi approfondita delle emozioni rilevate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayAnalytics.emotionDistribution.map((emotion, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium capitalize">{emotion.emotion}</span>
                      <Badge variant="secondary">{emotion.count}</Badge>
                    </div>
                    <Progress value={emotion.percentage} className="h-2 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {emotion.percentage}% del totale
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Tab - CONTINUA QUI con il resto delle tabs... */}
        <TabsContent value="health" className="space-y-6">
          {/* Health content placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Salute del Pet</CardTitle>
              <CardDescription>Monitoraggio parametri vitali e salute generale</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Contenuto salute da implementare...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Behavior Tab */}
        <TabsContent value="behavior" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Comportamento</CardTitle>
              <CardDescription>Analisi comportamentale del pet</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Contenuto comportamento da implementare...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Previsioni</CardTitle>
              <CardDescription>Previsioni basate sui dati storici</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Contenuto previsioni da implementare...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report</CardTitle>
              <CardDescription>Genera report personalizzati</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Contenuto report da implementare...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}