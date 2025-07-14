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


  // Mostra alert informativo se non ci sono dati reali
  const hasNoData = !analytics;

  // Ensure displayAnalytics is always safe to use
  const safeAnalytics = displayAnalytics || {
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
            <div className="text-2xl font-bold">{safeAnalytics.totalAnalyses}</div>
            <p className="text-xs text-muted-foreground">
              negli ultimi {safeAnalytics.timeSpan} giorni
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
              {safeAnalytics.averageWellnessScore}%
              {safeAnalytics.wellnessTrend > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : safeAnalytics.wellnessTrend < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-600" />
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">
              {safeAnalytics.wellnessTrend > 0 ? '+' : ''}{Math.round(safeAnalytics.wellnessTrend)}% vs periodo precedente
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

        {/* Health Tab */}
        <TabsContent value="health" className="space-y-6">
          {/* 📊 PARAMETRI VITALI */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="h-5 w-5" />
                Parametri Vitali
              </CardTitle>
              <CardDescription>
                Monitoraggio peso, temperatura e battito cardiaco
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Peso */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium flex items-center gap-2">
                      <Scale className="h-4 w-4" />
                      Andamento Peso
                    </h4>
                     <Badge variant="outline">{displayAnalytics.weightTrends.length} misurazioni</Badge>
                  </div>
                  {displayAnalytics.weightTrends.length > 0 ? (
                    <ChartContainer config={{
                      weight: { label: "Peso (kg)", color: "hsl(var(--primary))" }
                    }} className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={displayAnalytics.weightTrends}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="dateFormatted" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line
                            type="monotone"
                            dataKey="weight"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={{ fill: "hsl(var(--primary))", r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center border rounded-lg bg-muted/50">
                      <div className="text-center">
                        <Scale className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Nessun dato inserito</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Aggiungi misurazioni del peso per vedere il grafico
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Temperatura */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium flex items-center gap-2">
                      <Thermometer className="h-4 w-4" />
                      Temperatura
                    </h4>
                     <Badge variant="outline">{displayAnalytics.temperatureTrends.length} misurazioni</Badge>
                  </div>
                  {displayAnalytics.temperatureTrends.length > 0 ? (
                    <ChartContainer config={{
                      temperature: { label: "Temperatura (°C)", color: "hsl(var(--destructive))" }
                    }} className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={displayAnalytics.temperatureTrends}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="dateFormatted" />
                          <YAxis domain={[37, 40]} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line
                            type="monotone"
                            dataKey="temperature"
                            stroke="hsl(var(--destructive))"
                            strokeWidth={2}
                            dot={{ fill: "hsl(var(--destructive))", r: 4 }}
                          />
                          <ReferenceLine y={38.5} stroke="hsl(var(--success))" strokeDasharray="5 5" />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center border rounded-lg bg-muted/50">
                      <div className="text-center">
                        <Thermometer className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Nessun dato inserito</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Aggiungi misurazioni temperatura per vedere il grafico
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Battito Cardiaco */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Battito Cardiaco
                    </h4>
                     <Badge variant="outline">{displayAnalytics.heartRateTrends.length} misurazioni</Badge>
                  </div>
                  {displayAnalytics.heartRateTrends.length > 0 ? (
                    <ChartContainer config={{
                      heartRate: { label: "BPM", color: "hsl(var(--warning))" }
                    }} className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={displayAnalytics.heartRateTrends}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="dateFormatted" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line
                            type="monotone"
                            dataKey="heartRate"
                            stroke="hsl(var(--warning))"
                            strokeWidth={2}
                            dot={{ fill: "hsl(var(--warning))", r: 4 }}
                          />
                          <ReferenceLine y={90} stroke="hsl(var(--success))" strokeDasharray="5 5" />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center border rounded-lg bg-muted/50">
                      <div className="text-center">
                        <Heart className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Nessun dato inserito</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Aggiungi misurazioni battito per vedere il grafico
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 💊 CURE E MEDICINA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Cure e Medicina
              </CardTitle>
              <CardDescription>
                Farmaci attivi, vaccini e visite veterinarie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Farmaci Attivi</h4>
                  <div className="text-center p-6 border rounded-lg bg-muted/50">
                    <div className="text-3xl font-bold text-primary mb-2">0</div>
                    <p className="text-sm text-muted-foreground">
                      Nessun farmaco registrato
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Aggiungi farmaci nella sezione Benessere
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Calendario Vaccini</h4>
                  <div className="text-center p-6 border rounded-lg bg-muted/50">
                    <div className="text-3xl font-bold text-primary mb-2">0</div>
                    <p className="text-sm text-muted-foreground">
                      Nessun vaccino registrato
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Aggiungi record vaccini per vedere le scadenze
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Visite Veterinarie</h4>
                  <div className="text-center p-6 border rounded-lg bg-muted/50">
                    <div className="text-3xl font-bold text-primary mb-2">0</div>
                    <p className="text-sm text-muted-foreground">
                      Nessuna visita registrata
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Documenta le visite per il monitoraggio
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Health Score Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Punteggio Salute
                </CardTitle>
                <CardDescription>
                  Indicatore generale dello stato di salute
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold text-primary">
                    {displayAnalytics.averageWellnessScore}%
                  </div>
                  <Progress value={displayAnalytics.averageWellnessScore} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    {displayAnalytics.averageWellnessScore >= 80 ? 'Ottimo' : 
                     displayAnalytics.averageWellnessScore >= 60 ? 'Buono' : 
                     displayAnalytics.averageWellnessScore >= 40 ? 'Discreto' : 'Da migliorare'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Health Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Metriche Salute
                </CardTitle>
                <CardDescription>
                  Riepilogo delle metriche di salute monitorate
                </CardDescription>
              </CardHeader>
               <CardContent>
                 <div className="space-y-3">
                     <div className="flex justify-between items-center">
                      <span className="text-sm">Peso monitorato</span>
                      <Badge variant={displayAnalytics.weightTrends.length > 0 ? "default" : "secondary"} className="w-8 justify-center">
                        {displayAnalytics.weightTrends.length > 0 ? 'Sì' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Temperatura monitorata</span>
                      <Badge variant={displayAnalytics.temperatureTrends.length > 0 ? "default" : "secondary"} className="w-8 justify-center">
                        {displayAnalytics.temperatureTrends.length > 0 ? 'Sì' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Battito cardiaco</span>
                      <Badge variant={displayAnalytics.heartRateTrends.length > 0 ? "default" : "secondary"} className="w-8 justify-center">
                        {displayAnalytics.heartRateTrends.length > 0 ? 'Sì' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Appetito monitorato</span>
                      <Badge variant={healthData.filter(h => h.metric_type === 'appetite').length > 0 ? "default" : "secondary"} className="w-8 justify-center">
                        {healthData.filter(h => h.metric_type === 'appetite').length > 0 ? 'Sì' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Sonno monitorato</span>
                      <Badge variant={healthData.filter(h => h.metric_type === 'sleep').length > 0 ? "default" : "secondary"} className="w-8 justify-center">
                        {healthData.filter(h => h.metric_type === 'sleep').length > 0 ? 'Sì' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Attività monitorata</span>
                      <Badge variant={healthData.filter(h => h.metric_type === 'activity').length > 0 ? "default" : "secondary"} className="w-8 justify-center">
                        {healthData.filter(h => h.metric_type === 'activity').length > 0 ? 'Sì' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Comportamento monitorato</span>
                      <Badge variant={healthData.filter(h => h.metric_type === 'behavior').length > 0 ? "default" : "secondary"} className="w-8 justify-center">
                        {healthData.filter(h => h.metric_type === 'behavior').length > 0 ? 'Sì' : 'No'}
                      </Badge>
                    </div>
                   <div className="flex justify-between items-center">
                     <span className="text-sm">Metriche totali</span>
                     <Badge variant="outline">
                       {displayAnalytics.healthMetricsSummary.totalMetrics}
                     </Badge>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-sm">Controlli regolari</span>
                     <Badge variant={displayAnalytics.activeDays > displayAnalytics.timeSpan * 0.5 ? "default" : "secondary"}>
                       {displayAnalytics.activeDays > displayAnalytics.timeSpan * 0.5 ? 'Sì' : 'Da migliorare'}
                     </Badge>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-sm">Trend generale</span>
                     <Badge variant={displayAnalytics.wellnessTrend >= 0 ? "default" : "destructive"}>
                       {displayAnalytics.wellnessTrend > 0 ? 'Miglioramento' : 
                        displayAnalytics.wellnessTrend < 0 ? 'Peggioramento' : 'Stabile'}
                     </Badge>
                   </div>
                   {displayAnalytics.healthMetricsSummary.criticalValues > 0 && (
                     <div className="flex justify-between items-center">
                       <span className="text-sm">Valori critici</span>
                       <Badge variant="destructive">
                         {displayAnalytics.healthMetricsSummary.criticalValues}
                       </Badge>
                     </div>
                   )}
                 </div>
               </CardContent>
            </Card>
          </div>

          {/* Temperature Trend Chart */}
          {displayAnalytics.temperatureTrends.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5" />
                  Trend Temperatura
                </CardTitle>
                <CardDescription>
                  Monitoraggio della temperatura corporea nel tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{
                  temperature: { label: "Temperatura (°C)", color: "hsl(var(--destructive))" }
                }} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={displayAnalytics.temperatureTrends}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="dateFormatted" />
                      <YAxis domain={[36, 41]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="temperature"
                        stroke="hsl(var(--destructive))"
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--destructive))", strokeWidth: 2, r: 4 }}
                      />
                      <ReferenceLine y={38.5} stroke="hsl(var(--success))" strokeDasharray="5 5" label="Normale" />
                      <ReferenceLine y={39.5} stroke="hsl(var(--warning))" strokeDasharray="5 5" label="Febbre" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* Heart Rate Trend Chart */}
          {displayAnalytics.heartRateTrends.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Trend Battito Cardiaco
                </CardTitle>
                <CardDescription>
                  Monitoraggio della frequenza cardiaca nel tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{
                  heartRate: { label: "Battiti/min", color: "hsl(var(--primary))" }
                }} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={displayAnalytics.heartRateTrends}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="dateFormatted" />
                      <YAxis domain={[40, 160]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="heartRate"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                      />
                      <ReferenceLine y={90} stroke="hsl(var(--success))" strokeDasharray="5 5" label="Normale" />
                      <ReferenceLine y={140} stroke="hsl(var(--warning))" strokeDasharray="5 5" label="Elevato" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* Weight Trend Chart */}
          {displayAnalytics.weightTrends.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Trend Peso
                </CardTitle>
                <CardDescription>
                  Evoluzione del peso nel tempo con range salutare
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{
                  weight: { label: "Peso (kg)", color: "hsl(var(--primary))" }
                }} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={displayAnalytics.weightTrends}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="dateFormatted" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* Health Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Raccomandazioni Salute
              </CardTitle>
              <CardDescription>
                Suggerimenti basati sui dati di monitoraggio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {displayAnalytics.averageWellnessScore < 60 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Il punteggio di benessere è sotto la media. Considera un controllo veterinario.
                    </AlertDescription>
                  </Alert>
                )}
                <ul className="text-sm space-y-2">
                  {displayAnalytics.weightTrends.length === 0 && (
                    <li>• Inizia a monitorare il peso regolarmente</li>
                  )}
                  {displayAnalytics.activeDays < displayAnalytics.timeSpan * 0.3 && (
                    <li>• Aumenta la frequenza dei controlli</li>
                  )}
                  <li>• Mantieni un diario delle attività del pet</li>
                  <li>• Monitora l'umore e il comportamento giornalmente</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Stethoscope className="h-4 w-4" />
            <AlertDescription>
              Le metriche di salute mostrate sono solo a scopo informativo. Consulta sempre il veterinario per decisioni mediche.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Behavior Tab */}
        <TabsContent value="behavior" className="space-y-6">
          {/* 🎯 COMPORTAMENTO E ANALISI */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Comportamento e Analisi
              </CardTitle>
              <CardDescription>
                Trend analisi emotive, appetito, sonno e attività
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Trend Analisi Emotive</h4>
                  {displayAnalytics.emotionDistribution.length > 0 ? (
                    <div className="space-y-2">
                      {displayAnalytics.emotionDistribution.slice(0, 3).map((emotion, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="capitalize">{emotion.emotion}</span>
                          <Badge variant="secondary">{emotion.percentage}%</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 border rounded-lg bg-muted/50">
                      <Brain className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Inizia a monitorare</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Carica file audio/video per analizzare le emozioni
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Parametri Comportamentali</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Appetito</span>
                      <Badge variant="outline">Non monitorato</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Sonno</span>
                      <Badge variant="outline">Non monitorato</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Attività Fisica</span>
                      <Badge variant="outline">Non monitorato</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Compila il diario regolarmente per monitorare questi parametri
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ⚡ EMERGENZE E TRATTAMENTI */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Emergenze e Trattamenti
              </CardTitle>
              <CardDescription>
                Cronologia emergenze, trattamenti e operazioni
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Cronologia Emergenze</h4>
                  <div className="text-center p-6 border rounded-lg bg-muted/50">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Nessuna emergenza registrata
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Le emergenze future verranno archiviate qui
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Trattamenti</h4>
                  <div className="text-center p-6 border rounded-lg bg-muted/50">
                    <Stethoscope className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Nessun trattamento in corso
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Documenta i trattamenti nella sezione Benessere
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Operazioni</h4>
                  <div className="text-center p-6 border rounded-lg bg-muted/50">
                    <Award className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Nessuna operazione registrata
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Le operazioni chirurgiche verranno documentate qui
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 🏆 OBIETTIVI SALUTE */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Obiettivi Salute
              </CardTitle>
              <CardDescription>
                Progress bar basati sui dati reali, promemoria e raccomandazioni
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Obiettivi Settimanali</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Analisi Emotive</span>
                          <span>0/3</span>
                        </div>
                        <Progress value={0} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Entries Diario</span>
                          <span>0/5</span>
                        </div>
                        <Progress value={0} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Monitoraggio Peso</span>
                          <span>0/1</span>
                        </div>
                        <Progress value={0} className="h-2" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Promemoria</h4>
                    <div className="space-y-2">
                      <div className="p-3 border rounded-lg bg-blue-50 border-blue-200">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">
                            Imposta obiettivi per il tuo pet
                          </span>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">
                          Definisci target di benessere personalizzati
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Raccomandazioni Personalizzate</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                      <Lightbulb className="h-5 w-5 text-green-600 mb-2" />
                      <p className="text-sm font-medium text-green-800">
                        Inizia con le analisi emotive
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Carica un video o audio del tuo pet per iniziare il monitoraggio comportamentale
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                      <Heart className="h-5 w-5 text-blue-600 mb-2" />
                      <p className="text-sm font-medium text-blue-800">
                        Compila il profilo medico
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Aggiungi informazioni sui farmaci, vaccini e visite veterinarie
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Analisi Comportamentale
              </CardTitle>
              <CardDescription>
                Pattern e correlazioni nei comportamenti del pet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <h4 className="font-medium mb-2">Giorni più attivi</h4>
                    <p className="text-2xl font-bold text-primary">
                      {displayAnalytics.activityPatterns.length > 0 ? 
                        displayAnalytics.activityPatterns.reduce((max, day) => 
                          day.analyses > max.analyses ? day : max
                        ).day : 'N/A'}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <h4 className="font-medium mb-2">Confidenza media</h4>
                    <p className="text-2xl font-bold text-primary">
                      {displayAnalytics.activityPatterns.length > 0 ? 
                        Math.round(displayAnalytics.activityPatterns.reduce((sum, day) => 
                          sum + day.avgConfidence, 0) / displayAnalytics.activityPatterns.length) : 0}%
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <h4 className="font-medium mb-2">Consistenza</h4>
                    <p className="text-2xl font-bold text-primary">
                      {displayAnalytics.activeDays > displayAnalytics.timeSpan * 0.7 ? 'Alta' : 
                       displayAnalytics.activeDays > displayAnalytics.timeSpan * 0.4 ? 'Media' : 'Bassa'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <Alert>
            <Eye className="h-4 w-4" />
            <AlertDescription>
              Le previsioni sono basate sui pattern storici e sono puramente indicative.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trend Predictions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Previsioni Trend
                </CardTitle>
                <CardDescription>
                  Analisi delle tendenze future basate sui dati storici
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Benessere Generale</span>
                       <div className="flex items-center gap-1">
                         {displayAnalytics.wellnessTrend > 0 ? (
                           <TrendingUp className="h-4 w-4 text-green-600" />
                         ) : displayAnalytics.wellnessTrend < 0 ? (
                           <TrendingDown className="h-4 w-4 text-red-600" />
                         ) : (
                           <span className="h-4 w-4" />
                         )}
                         <span className={
                           displayAnalytics.wellnessTrend > 0 ? 'text-green-600' : 
                           displayAnalytics.wellnessTrend < 0 ? 'text-red-600' : 
                           'text-muted-foreground'
                         }>
                           {displayAnalytics.wellnessTrend > 0 ? 'Miglioramento' : 
                            displayAnalytics.wellnessTrend < 0 ? 'Peggioramento' : 'Stabile'}
                         </span>
                       </div>
                     </div>
                     <Progress 
                       value={Math.min(100, Math.max(0, displayAnalytics.averageWellnessScore + displayAnalytics.wellnessTrend))} 
                       className="h-2"
                     />
                     <p className="text-xs text-muted-foreground mt-1">
                       Previsione prossima settimana: {Math.round(displayAnalytics.averageWellnessScore + displayAnalytics.wellnessTrend)}%
                     </p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Attività Comportamentale</span>
                      <Badge variant={analytics.activeDays > analytics.timeSpan * 0.7 ? "default" : "secondary"}>
                        {analytics.activeDays > analytics.timeSpan * 0.7 ? 'Alta' : 'Media'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Basata sui pattern attuali, prevediamo {Math.round(analytics.activeDays / analytics.timeSpan * 7)} giorni attivi la prossima settimana
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Valutazione Rischi
                </CardTitle>
                <CardDescription>
                  Identificazione di potenziali aree di attenzione
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">Rischio Benessere</span>
                      <Badge variant={
                        analytics.averageWellnessScore >= 70 ? "default" : 
                        analytics.averageWellnessScore >= 50 ? "secondary" : "destructive"
                      }>
                        {analytics.averageWellnessScore >= 70 ? 'Basso' : 
                         analytics.averageWellnessScore >= 50 ? 'Medio' : 'Alto'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {analytics.averageWellnessScore >= 70 ? 'Condizioni ottimali' : 
                       analytics.averageWellnessScore >= 50 ? 'Monitoraggio consigliato' : 'Attenzione richiesta'}
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">Consistenza Dati</span>
                      <Badge variant={analytics.activeDays > analytics.timeSpan * 0.5 ? "default" : "secondary"}>
                        {analytics.activeDays > analytics.timeSpan * 0.5 ? 'Buona' : 'Scarsa'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {analytics.activeDays > analytics.timeSpan * 0.5 ? 
                        'Dati sufficienti per analisi accurate' : 
                        'Aumenta la frequenza di monitoraggio'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Raccomandazioni Intelligenti
              </CardTitle>
              <CardDescription>
                Suggerimenti personalizzati basati sull'analisi predittiva
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Azioni Immediate</h4>
                  <ul className="text-sm space-y-2">
                    {displayAnalytics.wellnessTrend < -2 && (
                      <li className="flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3 text-orange-500" />
                        Consulta un veterinario per il trend negativo
                      </li>
                    )}
                    {displayAnalytics.activeDays < displayAnalytics.timeSpan * 0.3 && (
                      <li className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-blue-500" />
                        Aumenta la frequenza di monitoraggio
                      </li>
                    )}
                    {analytics.emotionDistribution.some(e => e.emotion === 'ansioso' && e.percentage > 30) && (
                      <li className="flex items-center gap-2">
                        <Heart className="h-3 w-3 text-red-500" />
                        Considera attività rilassanti
                      </li>
                    )}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Obiettivi a Lungo Termine</h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <Target className="h-3 w-3 text-green-500" />
                      Mantieni punteggio benessere &gt;75%
                    </li>
                    <li className="flex items-center gap-2">
                      <Award className="h-3 w-3 text-purple-500" />
                      Raggiungi 80% giorni attivi al mese
                    </li>
                    <li className="flex items-center gap-2">
                      <BarChart3 className="h-3 w-3 text-indigo-500" />
                      Stabilizza i pattern comportamentali
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <FileText className="h-12 w-12 mx-auto text-primary mb-2" />
                <CardTitle>Report Veterinario</CardTitle>
                <CardDescription>
                  Report completo per il veterinario con tutti i dati di salute e comportamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline"
                  className="w-full bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => {
                    // Generate comprehensive PDF report
                    import('jspdf').then(({ default: jsPDF }) => {
                      const doc = new jsPDF();
                      const pet = activePet?.name || 'Pet';
                      const dateRangeText = `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`;
                      
                      // Header
                      doc.setFontSize(20);
                      doc.text(`Report Veterinario - ${pet}`, 20, 20);
                      doc.setFontSize(12);
                      doc.text(`Periodo: ${dateRangeText}`, 20, 30);
                      doc.text(`Generato il: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 20, 40);
                      
                      // Overview Section
                      doc.setFontSize(16);
                      doc.text('PANORAMICA GENERALE', 20, 55);
                      doc.setFontSize(10);
                       doc.text(`Analisi Totali: ${displayAnalytics.totalAnalyses}`, 20, 65);
                       doc.text(`Score Benessere Medio: ${displayAnalytics.averageWellnessScore}%`, 20, 75);
                       doc.text(`Giorni Attivi: ${displayAnalytics.activeDays} su ${displayAnalytics.timeSpan} giorni (${Math.round((displayAnalytics.activeDays / displayAnalytics.timeSpan) * 100)}%)`, 20, 85);
                       doc.text(`Trend Benessere: ${displayAnalytics.wellnessTrend > 0 ? 'In miglioramento' : displayAnalytics.wellnessTrend < 0 ? 'In peggioramento' : 'Stabile'} (${displayAnalytics.wellnessTrend > 0 ? '+' : ''}${Math.round(displayAnalytics.wellnessTrend)}%)`, 20, 95);
                      
                      // Emotions Section
                      doc.setFontSize(16);
                      doc.text('ANALISI EMOTIVA', 20, 115);
                      doc.setFontSize(10);
                       doc.text(`Emozione Principale: ${displayAnalytics.emotionDistribution[0]?.emotion || 'N/A'} (${displayAnalytics.emotionDistribution[0]?.percentage || 0}%)`, 20, 125);
                       doc.text('Distribuzione completa:', 20, 135);
                       displayAnalytics.emotionDistribution.slice(0, 6).forEach((emotion, index) => {
                         doc.text(`• ${emotion.emotion}: ${emotion.percentage}% (${emotion.count} occorrenze)`, 25, 145 + (index * 8));
                       });
                       
                       // Health Section
                       doc.setFontSize(16);
                       doc.text('INDICATORI DI SALUTE', 20, 205);
                       doc.setFontSize(10);
                       doc.text(`Consistenza nel monitoraggio: ${displayAnalytics.activeDays > displayAnalytics.timeSpan * 0.7 ? 'Eccellente' : displayAnalytics.activeDays > displayAnalytics.timeSpan * 0.5 ? 'Buona' : 'Da migliorare'}`, 20, 215);
                       doc.text(`Livello di attività: ${displayAnalytics.activeDays > displayAnalytics.timeSpan * 0.7 ? 'Alto' : 'Medio'}`, 20, 225);
                       
                       // Recommendations
                       doc.setFontSize(16);
                       doc.text('RACCOMANDAZIONI', 20, 245);
                       doc.setFontSize(10);
                       let yPos = 255;
                       if (displayAnalytics.wellnessTrend < -2) {
                         doc.text('• Monitoraggio veterinario consigliato per trend negativo', 20, yPos);
                         yPos += 10;
                       }
                       if (displayAnalytics.activeDays < displayAnalytics.timeSpan * 0.3) {
                         doc.text('• Aumentare la frequenza di monitoraggio comportamentale', 20, yPos);
                         yPos += 10;
                       }
                       if (displayAnalytics.emotionDistribution.some(e => e.emotion === 'ansioso' && e.percentage > 30)) {
                         doc.text('• Considerare attività rilassanti per ridurre ansia', 20, yPos);
                         yPos += 10;
                       }
                      doc.text('• Continuare il monitoraggio regolare per mantenere il benessere', 20, yPos);
                      
                      // Save PDF
                      doc.save(`report-veterinario-${pet.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
                    });
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Genera PDF
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-primary mb-2" />
                <CardTitle>Dati Grezzi</CardTitle>
                <CardDescription>
                  Esporta tutti i dati in formato CSV per analisi personalizzate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => {
                    // Export CSV data
                    const csvContent = [
                      // Header
                      ['Tipo', 'Data', 'Valore', 'Dettagli', 'Pet'],
                      // Analysis data
                      ...analysisData.map(item => [
                        'Analisi',
                        format(new Date(item.created_at), 'dd/MM/yyyy HH:mm'),
                        item.primary_emotion,
                        `Confidenza: ${item.primary_confidence}%`,
                        activePet?.name || 'N/A'
                      ]),
                      // Diary data
                      ...diaryData.map(item => [
                        'Diario',
                        format(new Date(item.entry_date), 'dd/MM/yyyy'),
                        item.mood_score?.toString() || 'N/A',
                        item.behavioral_tags?.join(', ') || 'N/A',
                        activePet?.name || 'N/A'
                      ]),
                      // Health data
                      ...healthData.map(item => [
                        'Salute',
                        format(new Date(item.recorded_at), 'dd/MM/yyyy'),
                        `${item.value} ${item.unit || ''}`,
                        `${item.metric_type}: ${item.notes || 'N/A'}`,
                        activePet?.name || 'N/A'
                      ]),
                      // Wellness data
                      ...wellnessData.map(item => [
                        'Benessere',
                        format(new Date(item.score_date), 'dd/MM/yyyy'),
                        `${item.wellness_score}%`,
                        'Score di benessere giornaliero',
                        activePet?.name || 'N/A'
                      ])
                    ].map(row => row.join(',')).join('\n');

                    // Create and download CSV file
                    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    const url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', `dati-${activePet?.name?.toLowerCase().replace(/\s+/g, '-') || 'pet'}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Esporta CSV
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <Share2 className="h-12 w-12 mx-auto text-primary mb-2" />
                <CardTitle>Condividi</CardTitle>
                <CardDescription>
                  Condividi i progressi del tuo pet con amici e famiglia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={async () => {
                    try {
                      const shareData = {
                        title: `Progressi di ${activePet?.name}`,
                        text: `Il mio pet ${activePet?.name} ha un punteggio di benessere del ${analytics.averageWellnessScore}%! 🐾`,
                        url: window.location.href
                      };
                      
                      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                        await navigator.share(shareData);
                      } else {
                        // Fallback: copy to clipboard
                        const textToShare = `${shareData.title}\n\n${shareData.text}\n\nVedi di più: ${shareData.url}`;
                        await navigator.clipboard.writeText(textToShare);
                        
                        toast({
                          title: "Testo Copiato",
                          description: "I dettagli dell'analisi sono stati copiati negli appunti. Incollali dove vuoi condividerli!",
                        });
                      }
                    } catch (error) {
                      console.error('Errore durante la condivisione:', error);
                      
                      // Show error notification
                      const errorNotification = document.createElement('div');
                      errorNotification.textContent = '❌ Errore durante la condivisione';
                       errorNotification.style.cssText = `
                         position: fixed;
                         top: 20px;
                         right: 20px;
                         background: hsl(var(--destructive));
                         color: hsl(var(--destructive-foreground));
                         padding: 12px 16px;
                         border-radius: 8px;
                         font-size: 14px;
                         font-weight: 500;
                         z-index: 1000;
                         box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                       `;
                      document.body.appendChild(errorNotification);
                      setTimeout(() => errorNotification.remove(), 3000);
                    }
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Condividi
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}