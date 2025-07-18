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

// Range di riferimento dalla guida di primo soccorso per valutare i parametri vitali
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

// Helper function to translate metric types to Italian
const translateMetricType = (type: string): string => {
  const translations: Record<string, string> = {
    'temperature': 'Temperatura Corporea',
    'heart_rate': 'Frequenza Cardiaca', 
    'respiration': 'Respirazione',
    'breathing_rate': 'Respirazione',
    'respiratory_rate': 'Respirazione',
    'gum_color': 'Colore Gengive',
    'weight': 'Peso',
    'behavior': 'Comportamento',
    'appetite': 'Appetito',
    'sleep': 'Sonno',
    'activity': 'Attività'
  };
  return translations[type] || type;
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

// Funzione per valutare se un parametro vitale è critico
const evaluateVitalParameter = (metricType: string, value: number, petType?: string): { 
  status: 'normal' | 'warning' | 'critical', 
  message: string,
  recommendation?: string 
} => {
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
      // Valutazione basata sulla taglia (semplificata)
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
    case 'respiration':  // Aggiunto il tipo 'respiration'
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
      
      // Determina il range corretto basato sul tipo di animale
      const breathingRange = petType === 'gatto' || petType === 'cat' 
        ? VITAL_PARAMETERS_RANGES.breathing_rate.cats  // Gatti: 20-30 atti/min
        : VITAL_PARAMETERS_RANGES.breathing_rate.dogs;  // Cani: 10-30 atti/min
      
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

const HEALTH_TREND_RANGES = [
  { value: '1d', label: 'Giorno', days: 1 },
  { value: '7d', label: 'Settimana', days: 7 },
  { value: '1m', label: 'Mese', days: 30 },
  { value: '1y', label: 'Anno', days: 365 },
  { value: 'all', label: 'Tutte', days: null }
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
  const [healthTrendFilter, setHealthTrendFilter] = useState('1m');
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
            if (h.metric_type === 'gum_color' && (h.value === 3 || h.value === 4)) return true; // Blu/Viola o Gialle
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

    // Mood trends - combina dati da diario e analisi emotive
    const diaryMoodData = diaryData
      .filter(d => d.mood_score)
      .map(d => ({
        date: d.entry_date,
        mood: d.mood_score,
        source: 'diary',
        dateFormatted: format(new Date(d.entry_date), 'd MMM', { locale: it })
      }));

    // Converti analisi emotive in punteggi umore (1-10)
    const emotionToMoodScore = {
      'felice': 9,
      'giocoso': 8,
      'calmo': 7,
      'rilassato': 6,
      'neutro': 5,
      'annoiato': 4,
      'ansioso': 3,
      'triste': 2,
      'aggressivo': 1,
      'spaventato': 1
    };

    const analysisMoodData = analysisData.map(a => ({
      date: format(new Date(a.created_at), 'yyyy-MM-dd'),
      mood: emotionToMoodScore[a.primary_emotion as keyof typeof emotionToMoodScore] || 5,
      source: 'analysis',
      confidence: a.primary_confidence,
      dateFormatted: format(new Date(a.created_at), 'd MMM', { locale: it })
    }));

    // Combina e ordina tutti i dati di umore
    const allMoodData = [...diaryMoodData, ...analysisMoodData]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Raggruppa per data e calcola media se ci sono più valori nello stesso giorno
    const moodByDate = allMoodData.reduce((acc, item) => {
      if (!acc[item.date]) {
        acc[item.date] = { values: [], date: item.date, dateFormatted: item.dateFormatted };
      }
      acc[item.date].values.push(item.mood);
      return acc;
    }, {} as Record<string, { values: number[]; date: string; dateFormatted: string }>);

    const moodTrends = Object.values(moodByDate)
      .map(item => ({
        date: item.date,
        mood: Math.round(item.values.reduce((sum, val) => sum + val, 0) / item.values.length * 10) / 10,
        dateFormatted: item.dateFormatted
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
      // Usa la funzione di valutazione basata sulla guida primo soccorso
      criticalValues: healthData.filter(h => {
        const petType = selectedPets.length === 1 ? pets.find(p => p.id === selectedPets[0])?.type : undefined;
        const evaluation = evaluateVitalParameter(h.metric_type, h.value, petType);
        return evaluation.status === 'critical' || evaluation.status === 'warning';
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

    // Health trends calculation based on filter
    const getHealthTrendsData = (filterValue: string) => {
      let filteredHealthData = healthData;
      
      if (filterValue !== 'all') {
        const filterDays = HEALTH_TREND_RANGES.find(r => r.value === filterValue)?.days;
        if (filterDays) {
          const filterDate = subDays(new Date(), filterDays);
          filteredHealthData = healthData.filter(h => 
            new Date(h.recorded_at) >= filterDate
          );
        }
      }

      // Group by date and metric type
      const trendData = filteredHealthData.reduce((acc, metric) => {
        const date = format(new Date(metric.recorded_at), 'yyyy-MM-dd');
        if (!acc[date]) {
          acc[date] = {};
        }
        if (!acc[date][metric.metric_type]) {
          acc[date][metric.metric_type] = [];
        }
        acc[date][metric.metric_type].push(metric.value);
        return acc;
      }, {} as Record<string, Record<string, number[]>>);

      // Calculate averages and create chart data
      return Object.entries(trendData)
        .map(([date, metrics]) => {
          const dataPoint: any = {
            date,
            dateFormatted: format(new Date(date), 'd MMM', { locale: it })
          };
          
          // Calculate average for each metric type
          Object.entries(metrics).forEach(([metricType, values]) => {
            const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
            dataPoint[metricType] = Math.round(avg * 100) / 100;
          });
          
          return dataPoint;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    const healthTrends = getHealthTrendsData(healthTrendFilter);

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
      healthTrends,
      weatherMoodData,
      wellnessTrend,
      timeSpan: differenceInDays(dateRange.to, dateRange.from)
    };
  }, [analysisData, diaryData, healthData, wellnessData, dateRange, healthTrendFilter]);

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
    healthTrends: [],
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
                 <div className="space-y-4">
                   <div className="flex justify-center">
                     <ChartContainer config={{}} className="h-[400px] w-[400px]">
                       <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                           <Pie
                             data={displayAnalytics.emotionDistribution}
                             cx="50%"
                             cy="50%"
                             outerRadius={140}
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
                   
                   {/* Legend sotto il grafico */}
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                     {displayAnalytics.emotionDistribution.map((entry, index) => (
                       <div key={index} className="flex items-center gap-2">
                         <div 
                           className="w-3 h-3 rounded-full" 
                           style={{ backgroundColor: entry.fill }}
                         />
                         <span className="capitalize">
                           {entry.emotion}: {entry.percentage}%
                         </span>
                       </div>
                     ))}
                   </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Health Metrics Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Parametri Vitali
                </CardTitle>
                <CardDescription>
                  Riassunto delle metriche di salute monitorate con analisi critica
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">{displayAnalytics.healthMetricsSummary.totalMetrics}</div>
                    <div className="text-sm text-muted-foreground">Misurazioni Totali</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">{displayAnalytics.healthMetricsSummary.uniqueMetricTypes}</div>
                    <div className="text-sm text-muted-foreground">Tipi di Parametri</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">{displayAnalytics.healthMetricsSummary.lastWeekMetrics}</div>
                    <div className="text-sm text-muted-foreground">Ultima Settimana</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{displayAnalytics.healthMetricsSummary.criticalValues}</div>
                    <div className="text-sm text-muted-foreground">Valori Critici</div>
                  </div>
                </div>

                {/* Analisi Parametri Vitali basata su Guida Primo Soccorso */}
                {healthData.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Analisi Ultimi Parametri
                    </h4>
                    {(() => {
                      // Raggruppa le metriche per tipo e prendi l'ultima misurazione
                      const latestMetrics = healthData.reduce((acc, metric) => {
                        if (!acc[metric.metric_type] || new Date(metric.recorded_at) > new Date(acc[metric.metric_type].recorded_at)) {
                          acc[metric.metric_type] = metric;
                        }
                        return acc;
                      }, {} as Record<string, HealthData>);

                      const petType = selectedPets.length === 1 ? pets.find(p => p.id === selectedPets[0])?.type : undefined;

                      return Object.values(latestMetrics).map(metric => {
                        const evaluation = evaluateVitalParameter(metric.metric_type, metric.value, petType);
                        const statusColors = {
                          normal: 'bg-green-50 border-green-200 text-green-800',
                          warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
                          critical: 'bg-red-50 border-red-200 text-red-800'
                        };

                        return (
                          <div key={metric.id} className={`p-3 border rounded-lg ${statusColors[evaluation.status]}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">
                                {translateMetricType(metric.metric_type)}
                              </span>
                              <Badge variant={evaluation.status === 'critical' ? 'destructive' : evaluation.status === 'warning' ? 'secondary' : 'default'}>
                                {evaluation.status === 'critical' ? 'CRITICO' : evaluation.status === 'warning' ? 'ATTENZIONE' : 'NORMALE'}
                              </Badge>
                            </div>
                            <p className="text-sm mb-1">{evaluation.message}</p>
                            {evaluation.recommendation && (
                              <p className="text-sm font-medium">{evaluation.recommendation}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              Misurato il {format(new Date(metric.recorded_at), 'dd/MM/yyyy HH:mm', { locale: it })}
                            </p>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
                
                {displayAnalytics.healthMetricsSummary.totalMetrics === 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Nessun parametro vitale registrato. Inizia a monitorare peso, temperatura e battito cardiaco per vedere i trend di salute e ricevere avvisi se i valori sono critici secondo la guida di primo soccorso.
                    </AlertDescription>
                  </Alert>
                )}

              </CardContent>
            </Card>

            {/* Health Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Trend Salute
                </CardTitle>
                <CardDescription>
                  Andamento delle metriche di salute nel tempo
                </CardDescription>
                <div className="flex items-center gap-2 mt-3">
                  <Select value={healthTrendFilter} onValueChange={setHealthTrendFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HEALTH_TREND_RANGES.map(range => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {displayAnalytics.healthTrends.length > 0 ? (
                  <ChartContainer config={{
                    temperature: { label: "Temperatura (°C)", color: "hsl(var(--destructive))" },
                    heart_rate: { label: "Freq. Cardiaca (bpm)", color: "hsl(var(--primary))" },
                    weight: { label: "Peso (kg)", color: "hsl(var(--secondary))" },
                    respiration: { label: "Respirazione (atti/min)", color: "hsl(var(--accent))" },
                    gum_color: { label: "Colore Gengive", color: "hsl(var(--muted-foreground))" }
                  }} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={displayAnalytics.healthTrends}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="dateFormatted" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        {displayAnalytics.healthTrends.some(d => d.temperature) && (
                          <Line
                            type="monotone"
                            dataKey="temperature"
                            stroke="hsl(var(--destructive))"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            connectNulls={false}
                          />
                        )}
                        {displayAnalytics.healthTrends.some(d => d.heart_rate) && (
                          <Line
                            type="monotone"
                            dataKey="heart_rate"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            connectNulls={false}
                          />
                        )}
                        {displayAnalytics.healthTrends.some(d => d.weight) && (
                          <Line
                            type="monotone"
                            dataKey="weight"
                            stroke="hsl(var(--secondary))"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            connectNulls={false}
                          />
                        )}
                        {displayAnalytics.healthTrends.some(d => d.respiration) && (
                          <Line
                            type="monotone"
                            dataKey="respiration"
                            stroke="hsl(var(--accent))"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            connectNulls={false}
                          />
                        )}
                        {displayAnalytics.healthTrends.some(d => d.gum_color) && (
                          <Line
                            type="monotone"
                            dataKey="gum_color"
                            stroke="hsl(var(--muted-foreground))"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            connectNulls={false}
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-2" />
                    <p>Nessun dato di salute disponibile</p>
                    <p className="text-sm">Aggiungi metriche di salute per vedere i trend</p>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        {/* Behavior Tab */}
        <TabsContent value="behavior" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Behavioral Tags Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Comportamenti Osservati
                </CardTitle>
                <CardDescription>
                  Tag comportamentali più frequenti dalle osservazioni
                </CardDescription>
              </CardHeader>
              <CardContent>
                {diaryData.some(d => d.behavioral_tags?.length > 0) ? (
                  <div className="space-y-3">
                    {(() => {
                      const tagCounts = diaryData
                        .flatMap(d => d.behavioral_tags || [])
                        .reduce((acc, tag) => {
                          acc[tag] = (acc[tag] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>);
                      
                      const sortedTags = Object.entries(tagCounts)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 10);
                      
                      return sortedTags.map(([tag, count]) => (
                        <div key={tag} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <span className="capitalize font-medium">{tag}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Eye className="h-12 w-12 mx-auto mb-2" />
                    <p>Nessun comportamento registrato</p>
                    <p className="text-sm">Aggiungi tag comportamentali nelle voci del diario</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Emotion-Behavior Correlation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Pattern Emotivi
                </CardTitle>
                <CardDescription>
                  Correlazione tra emozioni e comportamenti
                </CardDescription>
              </CardHeader>
              <CardContent>
                {displayAnalytics.emotionDistribution.length > 0 ? (
                  <div className="space-y-3">
                    {displayAnalytics.emotionDistribution.slice(0, 5).map((emotion, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="capitalize font-medium">{emotion.emotion}</span>
                          <span className="text-sm text-muted-foreground">{emotion.percentage}%</span>
                        </div>
                        <Progress value={emotion.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="h-12 w-12 mx-auto mb-2" />
                    <p>Nessuna analisi emotiva disponibile</p>
                    <p className="text-sm">Carica audio/video per analizzare le emozioni</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Daily Activity Patterns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pattern di Attività Settimanali
              </CardTitle>
              <CardDescription>
                Analisi dell'attività del pet durante la settimana
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{
                analyses: { label: "Analisi", color: "hsl(var(--primary))" },
                avgConfidence: { label: "Confidenza Media", color: "hsl(var(--secondary))" }
              }} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displayAnalytics.activityPatterns}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="day" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar yAxisId="left" dataKey="analyses" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="avgConfidence" stroke="hsl(var(--secondary))" strokeWidth={2} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Wellness Trend Prediction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trend Benessere Futuro
                </CardTitle>
                <CardDescription>
                  Previsione del benessere basata sui dati storici
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {displayAnalytics.wellnessTrend > 0 ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : displayAnalytics.wellnessTrend < 0 ? (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      ) : (
                        <div className="h-5 w-5 bg-yellow-500 rounded-full" />
                      )}
                      <span className="font-medium">
                        {displayAnalytics.wellnessTrend > 0 ? 'Miglioramento' : 
                         displayAnalytics.wellnessTrend < 0 ? 'Peggioramento' : 'Stabile'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {displayAnalytics.wellnessTrend > 0 ? 
                        'Il benessere del tuo pet sta migliorando. Continua con le attuali cure.' :
                        displayAnalytics.wellnessTrend < 0 ?
                        'Il benessere mostra segni di declino. Considera una visita veterinaria.' :
                        'Il benessere è stabile. Mantieni la routine attuale.'}
                    </p>
                  </div>
                  
                  {displayAnalytics.averageWellnessScore > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Score Attuale</span>
                        <span>{displayAnalytics.averageWellnessScore}%</span>
                      </div>
                      <Progress value={displayAnalytics.averageWellnessScore} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span>Previsione 30gg</span>
                        <span>{Math.max(0, Math.min(100, displayAnalytics.averageWellnessScore + displayAnalytics.wellnessTrend * 2))}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Health Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Raccomandazioni AI
                </CardTitle>
                <CardDescription>
                  Suggerimenti basati sui pattern rilevati
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(() => {
                    const recommendations = [];
                    
                    if (displayAnalytics.healthMetricsSummary.criticalValues > 0) {
                      recommendations.push({
                        type: 'warning',
                        text: 'Rilevati parametri vitali anomali. Consulta un veterinario.'
                      });
                    }
                    
                    if (displayAnalytics.activeDays < displayAnalytics.timeSpan * 0.3) {
                      recommendations.push({
                        type: 'info',
                        text: 'Aumenta la frequenza di monitoraggio per analisi più accurate.'
                      });
                    }
                    
                    if (displayAnalytics.emotionDistribution.some(e => e.emotion === 'ansioso' && e.percentage > 30)) {
                      recommendations.push({
                        type: 'warning',
                        text: 'Livelli di ansia elevati. Considera attività rilassanti.'
                      });
                    }
                    
                    if (displayAnalytics.wellnessTrend > 5) {
                      recommendations.push({
                        type: 'success',
                        text: 'Ottimo miglioramento! Continua con le attuali strategie.'
                      });
                    }
                    
                    if (recommendations.length === 0) {
                      recommendations.push({
                        type: 'info',
                        text: 'Continua a monitorare regolarmente per ricevere consigli personalizzati.'
                      });
                    }
                    
                    return recommendations.slice(0, 4).map((rec, index) => (
                      <div key={index} className={`p-3 rounded-lg border-l-4 ${
                        rec.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                        rec.type === 'success' ? 'bg-green-50 border-green-400' :
                        'bg-blue-50 border-blue-400'
                      }`}>
                        <p className="text-sm">{rec.text}</p>
                      </div>
                    ));
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seasonal Predictions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Previsioni Stagionali
              </CardTitle>
              <CardDescription>
                Analisi dei pattern stagionali del comportamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {['Primavera', 'Estate', 'Autunno', 'Inverno'].map((season, index) => {
                  const activity = ['Alta', 'Molto Alta', 'Media', 'Bassa'][index];
                  const mood = ['Positivo', 'Molto Positivo', 'Stabile', 'Variabile'][index];
                  
                  return (
                    <div key={season} className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">{season}</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Attività:</span>
                          <span className="font-medium">{activity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Umore:</span>
                          <span className="font-medium">{mood}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Summary Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Riassunto Generale
                </CardTitle>
                <CardDescription>
                  Report completo del periodo selezionato
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Periodo Analizzato:</span>
                    <span>{format(dateRange.from, 'dd/MM/yyyy')} - {format(dateRange.to, 'dd/MM/yyyy')}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Giorni Totali:</span>
                    <span>{displayAnalytics.timeSpan}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Giorni con Attività:</span>
                    <span>{displayAnalytics.activeDays}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Analisi Completate:</span>
                    <span>{displayAnalytics.totalAnalyses}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Score Benessere Medio:</span>
                    <span className="font-bold">{displayAnalytics.averageWellnessScore}%</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-medium">Emozione Predominante:</span>
                    <span className="capitalize font-medium">
                      {displayAnalytics.emotionDistribution[0]?.emotion || 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Health Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Report Salute
                </CardTitle>
                <CardDescription>
                  Riassunto dei parametri di salute
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Parametri Monitorati:</span>
                    <span>{displayAnalytics.healthMetricsSummary.totalMetrics}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Tipi di Metriche:</span>
                    <span>{displayAnalytics.healthMetricsSummary.uniqueMetricTypes}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Misurazioni Recenti:</span>
                    <span>{displayAnalytics.healthMetricsSummary.lastWeekMetrics}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-medium">Valori Critici:</span>
                    <span className={displayAnalytics.healthMetricsSummary.criticalValues > 0 ? 'text-red-600 font-bold' : 'text-green-600'}>
                      {displayAnalytics.healthMetricsSummary.criticalValues}
                    </span>
                  </div>
                </div>
                
                {displayAnalytics.healthMetricsSummary.criticalValues > 0 && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      Rilevati {displayAnalytics.healthMetricsSummary.criticalValues} valori critici. Si consiglia una visita veterinaria.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analisi Dettagliata
              </CardTitle>
              <CardDescription>
                Statistiche approfondite per il periodo selezionato
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Emotion Breakdown */}
                <div>
                  <h4 className="font-medium mb-3">Distribuzione Emozioni</h4>
                  <div className="space-y-2">
                    {displayAnalytics.emotionDistribution.slice(0, 5).map((emotion, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="capitalize">{emotion.emotion}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full"
                              style={{ 
                                width: `${emotion.percentage}%`, 
                                backgroundColor: emotion.fill 
                              }}
                            />
                          </div>
                          <span className="font-medium">{emotion.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity Summary */}
                <div>
                  <h4 className="font-medium mb-3">Attività Settimanale</h4>
                  <div className="space-y-2">
                    {displayAnalytics.activityPatterns.map((day, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{day.day}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${(day.analyses / Math.max(...displayAnalytics.activityPatterns.map(p => p.analyses), 1)) * 100}%` }}
                            />
                          </div>
                          <span className="font-medium">{day.analyses}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Insights */}
                <div>
                  <h4 className="font-medium mb-3">Insights Chiave</h4>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 bg-muted/50 rounded">
                      <strong>Giorno più attivo:</strong> {
                        displayAnalytics.activityPatterns.reduce((max, day) => 
                          day.analyses > max.analyses ? day : max, displayAnalytics.activityPatterns[0] || { day: 'N/A', analyses: 0 }
                        ).day
                      }
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <strong>Consistenza:</strong> {Math.round((displayAnalytics.activeDays / displayAnalytics.timeSpan) * 100)}% giorni attivi
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <strong>Trend generale:</strong> {
                        displayAnalytics.wellnessTrend > 0 ? 'In miglioramento' :
                        displayAnalytics.wellnessTrend < 0 ? 'In peggioramento' : 'Stabile'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}