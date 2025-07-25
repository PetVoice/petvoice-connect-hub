import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Activity, 
  TrendingUp, 
  Calendar, 
  PawPrint, 
  Microscope, 
  BookOpen, 
  BarChart3,
  ArrowRight,
  Clock,
  Star,
  Plus,
  Cloud,
  Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, isToday, subDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { WeatherMoodPredictor } from '@/components/ai-features/WeatherMoodPredictor';
import { fetchHealthData, calculateUnifiedHealthScore } from '@/utils/healthScoreCalculator';
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
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths, differenceInDays } from 'date-fns';

interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string | null;
  avatar_url: string | null;
}

interface Analysis {
  id: string;
  pet_id: string;
  primary_emotion: string;
  primary_confidence: number;
  secondary_emotions: any; // JSON field from database
  behavioral_insights: string;
  recommendations: string[];
  triggers: string[];
  created_at: string;
  file_name: string;
}

interface PetStats {
  analysisToday: number;
  unifiedHealthScore: number;
  consecutiveDays: number;
  improvementPercentage: number;
  lastEmotion: string | null;
  totalAnalyses: number;
  recommendations: string[];
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [activePet, setActivePet] = useState<Pet | null>(null);
  const [userProfile, setUserProfile] = useState<{ display_name: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [petStats, setPetStats] = useState<PetStats>({
    analysisToday: 0,
    unifiedHealthScore: 0,
    consecutiveDays: 0,
    improvementPercentage: 0,
    lastEmotion: null,
    totalAnalyses: 0,
    recommendations: []
  });
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([]);
  const [weatherData, setWeatherData] = useState<any>(null);
  
  // State per wellness trend
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [healthMetrics, setHealthMetrics] = useState<any[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<any[]>([]);
  const [petAnalyses, setPetAnalyses] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  

  // Usa sistema unificato di scoring - non più necessario
  // const emotionScores: Record<string, number> = {
  //   'felice': 90,
  //   'calmo': 85,
  //   'giocoso': 88,
  //   'eccitato': 75,
  //   'ansioso': 40,
  //   'triste': 30,
  //   'aggressivo': 25
  // };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', user.id)
          .single();
        
        setUserProfile(profile);

        // Fetch user's pets
        const { data: petsData } = await supabase
          .from('pets')
          .select('id, name, type, breed, avatar_url')
          .eq('user_id', user.id)
          .eq('is_active', true);
        
        if (petsData) {
          setPets(petsData);
          
          // Controlla se c'è un pet selezionato nel localStorage
          const selectedPetId = localStorage.getItem('petvoice-selected-pet');
          const selectedPet = selectedPetId ? petsData.find(pet => pet.id === selectedPetId) : null;
          
          if (selectedPet) {
            setActivePet(selectedPet);
          } else if (petsData.length > 0) {
            setActivePet(petsData[0]);
            // Salva il primo pet come selezionato se non ce n'è uno
            localStorage.setItem('petvoice-selected-pet', petsData[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Ascolta i cambiamenti del pet selezionato dal localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const selectedPetId = localStorage.getItem('petvoice-selected-pet');
      if (selectedPetId && pets.length > 0) {
        const selectedPet = pets.find(pet => pet.id === selectedPetId);
        if (selectedPet && selectedPet.id !== activePet?.id) {
          setActivePet(selectedPet);
        }
      }
    };

    // Ascolta i cambiamenti del localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Controlla anche manualmente ogni secondo (per cambiamenti nella stessa tab)
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [pets, activePet]);

  // Carica i dati delle analisi quando cambia il pet attivo
  useEffect(() => {
    const fetchPetAnalyses = async () => {
      if (!activePet || !user) {
        // Reset stats se non c'è pet selezionato
        setPetStats({
          analysisToday: 0,
          unifiedHealthScore: 0,
          consecutiveDays: 0,
          improvementPercentage: 0,
          lastEmotion: null,
          totalAnalyses: 0,
          recommendations: []
        });
        setRecentAnalyses([]);
        return;
      }

      try {
        // Usa il sistema unificato per calcolare tutti i punteggi
        const healthData = await fetchHealthData(activePet.id, user.id);
        const unifiedScore = await calculateUnifiedHealthScore(activePet.id, user.id, healthData);
        
        // Calcola analisi di oggi
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const analysisToday = healthData.analyses.filter(analysis => 
          new Date(analysis.created_at) >= todayStart
        ).length;

        // Converti le analisi nel formato corretto per la dashboard
        const dashboardAnalyses: Analysis[] = healthData.analyses.map(a => ({
          id: a.id,
          pet_id: activePet.id,
          primary_emotion: a.primary_emotion,
          primary_confidence: a.primary_confidence,
          secondary_emotions: a.secondary_emotions || {},
          behavioral_insights: a.behavioral_insights || '',
          recommendations: [],
          triggers: [],
          created_at: a.created_at,
          file_name: `analysis_${a.id.slice(0, 8)}`
        }));
        
        // Imposta le ultime 5 analisi per la visualizzazione
        setRecentAnalyses(dashboardAnalyses.slice(0, 5));

        // Calcola giorni consecutivi con analisi
        let consecutiveDays = 0;
        const sortedDates = [...new Set(healthData.analyses.map(analysis => 
          new Date(analysis.created_at).toDateString()
        ))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        for (let i = 0; i < sortedDates.length; i++) {
          const dateToCheck = subDays(today, i);
          const dateString = dateToCheck.toDateString();
          
          if (sortedDates.includes(dateString)) {
            consecutiveDays++;
          } else {
            break;
          }
        }

        // Calcola miglioramento dai punteggi wellness (se disponibili)
        let improvementPercentage = 0;
        if (healthData.wellnessScores.length >= 2) {
          const recent = healthData.wellnessScores[0].wellness_score;
          const previous = healthData.wellnessScores[1].wellness_score;
          if (previous > 0) {
            improvementPercentage = Math.round(((recent - previous) / previous) * 100);
          }
        }

        setPetStats({
          analysisToday,
          unifiedHealthScore: unifiedScore.overallScore,
          consecutiveDays,
          improvementPercentage,
          lastEmotion: healthData.analyses.length > 0 ? healthData.analyses[0].primary_emotion : null,
          totalAnalyses: healthData.analyses.length,
          recommendations: unifiedScore.recommendations
        });
      } catch (error) {
        console.error('Error fetching unified pet health data:', error);
      }
    };

    fetchPetAnalyses();
  }, [activePet, user]);

  // Load data for wellness trend when activePet changes
  useEffect(() => {
    const fetchWellnessData = async () => {
      if (!activePet || !user) {
        setHealthMetrics([]);
        setDiaryEntries([]);
        setPetAnalyses([]);
        setMedications([]);
        return;
      }

      try {
        const [healthRes, diaryRes, analysesRes, medicationsRes] = await Promise.all([
          supabase
            .from('health_metrics')
            .select('*')
            .eq('pet_id', activePet.id)
            .eq('user_id', user.id)
            .order('recorded_at', { ascending: false }),
          supabase
            .from('diary_entries')
            .select('*')
            .eq('pet_id', activePet.id)
            .eq('user_id', user.id)
            .order('entry_date', { ascending: false }),
          supabase
            .from('pet_analyses')
            .select('*')
            .eq('pet_id', activePet.id)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('medications')
            .select('*')
            .eq('pet_id', activePet.id)
            .eq('user_id', user.id)
            .order('start_date', { ascending: false })
        ]);

        setHealthMetrics(healthRes.data || []);
        setDiaryEntries(diaryRes.data || []);
        setPetAnalyses(analysesRes.data || []);
        setMedications(medicationsRes.data || []);
      } catch (error) {
        console.error('Error fetching wellness data:', error);
      }
    };

    fetchWellnessData();
  }, [activePet, user]);

  // Helper function to evaluate vital parameters
  const evaluateVitalParameter = (metricType: string, value: number, petType?: string) => {
    switch (metricType) {
      case 'temperature':
        const minTemp = petType?.toLowerCase() === 'cat' ? 38.1 : 38.0;
        const maxTemp = 39.2;
        
        if (value < 37.0 || value > 40.5) {
          return {
            status: 'critical',
            message: `⚠️ TEMPERATURA CRITICA: ${value}°C`,
            recommendation: 'EMERGENZA VETERINARIA IMMEDIATA'
          };
        }
        if (value < minTemp || value > maxTemp) {
          return {
            status: 'warning',
            message: `⚠️ Temperatura anomala: ${value}°C`,
            recommendation: 'Monitora attentamente'
          };
        }
        return { status: 'normal', message: `✅ Temperatura normale: ${value}°C` };
      default:
        return { status: 'normal', message: `${metricType}: ${value}` };
    }
  };

  // Calculate wellness trend data from real health metrics and diary entries
  const wellnessTrendData = useMemo(() => {
    if (!petAnalyses || !healthMetrics || !diaryEntries || !medications) return [];
    
    const now = new Date();
    let periods: Array<{ start: Date; end: Date; label: string }> = [];

    // Define periods based on selected filter
    switch (selectedPeriod) {
      case 'day':
        // Last 7 days
        periods = Array.from({ length: 7 }, (_, i) => {
          const date = subDays(now, 6 - i);
          return {
            start: startOfDay(date),
            end: endOfDay(date),
            label: format(date, 'dd/MM')
          };
        });
        break;
      case 'week':
        // Last 4 weeks
        periods = Array.from({ length: 4 }, (_, i) => {
          const weekStart = subDays(now, (3 - i + 1) * 7);
          const weekEnd = subDays(now, (3 - i) * 7);
          return {
            start: startOfDay(weekStart),
            end: endOfDay(weekEnd),
            label: `${format(weekStart, 'dd/MM')}-${format(weekEnd, 'dd/MM')}`
          };
        });
        break;
      case 'month':
        // Last 6 months
        periods = Array.from({ length: 6 }, (_, i) => {
          const monthDate = subMonths(now, 5 - i);
          return {
            start: startOfMonth(monthDate),
            end: endOfMonth(monthDate),
            label: format(monthDate, 'MMM yy')
          };
        });
        break;
      case 'year':
        // Last 3 years
        periods = Array.from({ length: 3 }, (_, i) => {
          const yearStart = new Date(now.getFullYear() - (2 - i), 0, 1);
          const yearEnd = new Date(now.getFullYear() - (2 - i), 11, 31);
          return {
            start: yearStart,
            end: yearEnd,
            label: yearStart.getFullYear().toString()
          };
        });
        break;
      case 'all':
        // All time - group by month for readability
        const firstAnalysis = petAnalyses.length > 0 ? new Date(petAnalyses[petAnalyses.length - 1].created_at) : subMonths(now, 12);
        const monthsCount = Math.min(24, Math.max(6, differenceInDays(now, firstAnalysis) / 30));
        periods = Array.from({ length: Math.floor(monthsCount) }, (_, i) => {
          const monthDate = subMonths(now, monthsCount - 1 - i);
          return {
            start: startOfMonth(monthDate),
            end: endOfMonth(monthDate),
            label: format(monthDate, 'MMM yy')
          };
        });
        break;
      default:
        periods = [];
    }

    // Calculate score for each period
    return periods.map(period => {
      // Filter data for this period
      const periodHealthMetrics = healthMetrics.filter(metric => {
        const metricDate = new Date(metric.recorded_at);
        return metricDate >= period.start && metricDate <= period.end;
      });

      const periodDiaryEntries = diaryEntries.filter(entry => {
        const entryDate = new Date(entry.entry_date);
        return entryDate >= period.start && entryDate <= period.end;
      });

      const periodAnalyses = petAnalyses.filter(analysis => {
        const analysisDate = new Date(analysis.created_at);
        return analysisDate >= period.start && analysisDate <= period.end;
      });

      const periodMedications = medications.filter(med => {
        const startDate = new Date(med.start_date);
        const endDate = med.end_date ? new Date(med.end_date) : now;
        return startDate <= period.end && endDate >= period.start;
      });

      // Calculate unified score for this period
      let score = 50; // Base score

      // Health metrics contribution (30%)
      if (periodHealthMetrics.length > 0) {
        let healthScore = 50;
        
        periodHealthMetrics.forEach(metric => {
          const evaluation = evaluateVitalParameter(metric.metric_type, parseFloat(metric.value.toString()), activePet?.type);
          switch (evaluation.status) {
            case 'normal': healthScore += 10; break;
            case 'warning': healthScore -= 5; break;
            case 'critical': healthScore -= 15; break;
          }
        });
        
        score += (healthScore - 50) * 0.3;
      }

      // Emotional analyses contribution (25%)
      if (periodAnalyses.length > 0) {
        const emotionScores: Record<string, number> = {
          'felice': 90, 'calmo': 85, 'giocoso': 88, 'eccitato': 75,
          'ansioso': 40, 'triste': 30, 'aggressivo': 25
        };
        
        const avgEmotionScore = periodAnalyses.reduce((sum, analysis) => {
          const emotionScore = emotionScores[analysis.primary_emotion] || 50;
          const confidenceBonus = (analysis.primary_confidence - 50) / 100 * 20;
          return sum + emotionScore + confidenceBonus;
        }, 0) / periodAnalyses.length;
        
        score += (avgEmotionScore - 50) * 0.25;
      }

      // Diary entries contribution (25%)
      if (periodDiaryEntries.length > 0) {
        const avgMood = periodDiaryEntries.reduce((sum, entry) => sum + (entry.mood_level || 5), 0) / periodDiaryEntries.length;
        const avgEnergy = periodDiaryEntries.reduce((sum, entry) => sum + (entry.energy_level || 5), 0) / periodDiaryEntries.length;
        const avgAppetite = periodDiaryEntries.reduce((sum, entry) => sum + (entry.appetite_level || 5), 0) / periodDiaryEntries.length;
        
        const diaryScore = ((avgMood + avgEnergy + avgAppetite) / 3) * 10; // Convert to 0-100 scale
        score += (diaryScore - 50) * 0.25;
      }

      // Medication adherence contribution (20%)
      if (periodMedications.length > 0) {
        const activeMeds = periodMedications.filter(med => med.is_active).length;
        const medicationScore = Math.min(100, 50 + (activeMeds * 10)); // Bonus for active medications
        score += (medicationScore - 50) * 0.2;
      }

      // Normalize score
      score = Math.max(0, Math.min(100, score));
      
      return {
        date: period.label,
        wellness: Math.round(score)
      };
    });
  }, [healthMetrics, diaryEntries, petAnalyses, medications, selectedPeriod, activePet?.type]);

  // Funzione per ottenere l'emoji del tipo di pet
  const getPetEmoji = (type: string) => {
    const lowerType = type?.toLowerCase() || '';
    if (lowerType.includes('cane') || lowerType.includes('dog')) return '🐕';
    if (lowerType.includes('gatto') || lowerType.includes('cat')) return '🐱';
    if (lowerType.includes('coniglio') || lowerType.includes('rabbit')) return '🐰';
    if (lowerType.includes('uccello') || lowerType.includes('bird')) return '🐦';
    if (lowerType.includes('pesce') || lowerType.includes('fish')) return '🐠';
    if (lowerType.includes('criceto') || lowerType.includes('hamster')) return '🐹';
    return '🐾'; // Default
  };

  const getUserName = () => {
    if (userProfile?.display_name) {
      // Prendi solo il primo nome
      return userProfile.display_name.split(' ')[0];
    }
    if (user?.user_metadata?.display_name) {
      // Prendi solo il primo nome
      return user.user_metadata.display_name.split(' ')[0];
    }
    return 'Caro utente';
  };

  // Funzione per ottenere l'emoji dell'emozione
  const getEmotionEmoji = (emotion: string) => {
    const emotionEmojis: Record<string, string> = {
      'felice': '😊',
      'calmo': '😌',
      'ansioso': '😰',
      'eccitato': '🤩',
      'triste': '😢',
      'aggressivo': '😠',
      'giocoso': '😄'
    };
    return emotionEmojis[emotion] || '🤔';
  };

  const quickStats = [
    { 
      title: 'Analisi Oggi', 
      value: petStats.analysisToday.toString(), 
      icon: Microscope, 
      color: 'text-azure' 
    },
    { 
      title: 'Score Salute Unificato', 
      value: petStats.unifiedHealthScore > 0 ? `${petStats.unifiedHealthScore}/100` : '-', 
      icon: Heart, 
      color: 'text-success' 
    },
    { 
      title: 'Giorni Consecutivi', 
      value: petStats.consecutiveDays.toString(), 
      icon: Calendar, 
      color: 'text-primary' 
    },
    { 
      title: 'Miglioramento', 
      value: petStats.improvementPercentage !== 0 ? 
        `${petStats.improvementPercentage > 0 ? '+' : ''}${petStats.improvementPercentage}%` : '-', 
      icon: TrendingUp, 
      color: petStats.improvementPercentage > 0 ? 'text-success' : 
             petStats.improvementPercentage < 0 ? 'text-destructive' : 'text-muted-foreground' 
    },
  ];

  const quickActions = [
    { title: 'Nuova Analisi', description: 'Analizza le emozioni del tuo pet', icon: Microscope, path: '/analysis', color: 'bg-primary' },
    { title: 'Aggiungi Diario', description: 'Registra le attività di oggi', icon: BookOpen, path: '/diary', color: 'bg-primary' },
    { title: 'Controlla Benessere', description: 'Monitora la salute emotiva', icon: Heart, path: '/wellness', color: 'bg-primary' },
    { title: 'Vedi Statistiche', description: 'Analizza i progressi', icon: BarChart3, path: '/stats', color: 'bg-primary' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Caricamento...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Home className="h-8 w-8 text-primary" />
            Ciao {getUserName()}! 👋
          </h1>
          <p className="text-muted-foreground">
            {activePet ? `Ecco come sta ${activePet.name} oggi` : 'Aggiungi il tuo primo pet per iniziare'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('it-IT', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Active Pet Card o No Pet Message */}
      {activePet ? (
        <Card className="petvoice-card">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full gradient-coral flex items-center justify-center text-2xl">
                {activePet.avatar_url ? (
                  <img 
                    src={activePet.avatar_url} 
                    alt={activePet.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getPetEmoji(activePet.type)
                )}
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl">{activePet.name}</CardTitle>
                <CardDescription>{activePet.type} {activePet.breed && `• ${activePet.breed}`}</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/pets')}
              >
                <PawPrint className="h-4 w-4 mr-2" />
                Gestisci Pet
              </Button>
            </div>
          </CardHeader>
          <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Score Salute Unificato</span>
                  <span className={`text-lg font-bold ${petStats.unifiedHealthScore >= 75 ? 'text-success' : 
                    petStats.unifiedHealthScore >= 50 ? 'text-warning' : 'text-destructive'}`}>
                    {petStats.unifiedHealthScore > 0 ? `${petStats.unifiedHealthScore}/100` : '-'}
                  </span>
                </div>
                <Progress value={petStats.unifiedHealthScore} className="h-2" />
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={`${
                    petStats.unifiedHealthScore >= 75 ? 'bg-success/10 text-success' : 
                    petStats.unifiedHealthScore >= 50 ? 'bg-warning/10 text-warning' : 
                    petStats.unifiedHealthScore > 0 ? 'bg-destructive/10 text-destructive' : 'bg-muted/10 text-muted-foreground'
                  }`}>
                    <Heart className="h-3 w-3 mr-1" />
                    {petStats.unifiedHealthScore >= 75 ? 'Ottimo' : 
                     petStats.unifiedHealthScore >= 50 ? 'Buono' : 
                     petStats.unifiedHealthScore > 0 ? 'Preoccupante' : 'N/A'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {petStats.totalAnalyses > 0 ? 
                      `Basato su tutti i fattori di salute • Ultima: ${petStats.lastEmotion}` :
                      'Aggiungi dati di salute per vedere il punteggio completo'
                    }
                  </span>
                </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="petvoice-card border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 rounded-full gradient-coral flex items-center justify-center mb-4">
              <PawPrint className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-xl mb-2">Nessun Pet Registrato</CardTitle>
            <CardDescription className="mb-6 max-w-md">
              Aggiungi il tuo primo pet per iniziare ad analizzare le sue emozioni e monitorare il suo benessere.
            </CardDescription>
            <Button 
              onClick={() => navigate('/pets?add=true')}
              className="petvoice-button"
            >
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi il tuo primo Pet
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Trend Generale Benessere */}
      {activePet && (
        <Card className="bg-gradient-to-br from-card to-muted/20 border-2 hover:shadow-xl transition-all duration-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  Trend Generale Benessere
                </CardTitle>
                <CardDescription>
                  Andamento complessivo del benessere di {activePet?.name || 'il tuo pet'} nel tempo
                </CardDescription>
              </div>
              
              {/* Period Filter Badges */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: 'day', label: 'Giorno' },
                  { key: 'week', label: 'Settimana' }, 
                  { key: 'month', label: 'Mese' },
                  { key: 'year', label: 'Anno' },
                  { key: 'all', label: 'Tutto' }
                ].map((period) => (
                  <Badge
                    key={period.key}
                    variant={selectedPeriod === period.key ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                      selectedPeriod === period.key 
                        ? 'bg-primary text-primary-foreground shadow-md' 
                        : 'hover:bg-muted border-2'
                    }`}
                    onClick={() => setSelectedPeriod(period.key)}
                  >
                    {period.label}
                  </Badge>
                ))}
              </div>
            </div>
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
                  data={wellnessTrendData}
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
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index} className="petvoice-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-background ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="petvoice-card">
        <CardHeader>
          <CardTitle>Azioni Rapide</CardTitle>
          <CardDescription>
            {activePet ? `Cosa vuoi fare oggi con ${activePet.name}?` : 'Cosa vuoi fare oggi?'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 petvoice-button hover:shadow-glow"
                onClick={() => navigate(action.path)}
              >
                <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center`}>
                  <action.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-foreground">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>



      {/* Recent Activities */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="petvoice-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Attività Recenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentAnalyses.length > 0 ? (
              <div className="space-y-3">
                {recentAnalyses.map((analysis, index) => (
                  <div key={analysis.id} className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
                    <div className="text-2xl">
                      {getEmotionEmoji(analysis.primary_emotion)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        Analisi {analysis.primary_emotion} • {analysis.primary_confidence}% confidenza
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(analysis.created_at), 'dd/MM/yyyy HH:mm', { locale: it })} • {analysis.file_name}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {analysis.primary_emotion}
                    </Badge>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => navigate('/analysis?tab=results')}
                >
                  Vedi tutte le analisi
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  {activePet ? 'Nessuna analisi registrata ancora' : 'Aggiungi un pet per vedere le attività'}
                </p>
                {activePet && (
                  <Button 
                    size="sm" 
                    className="mt-3"
                    onClick={() => navigate('/analysis')}
                  >
                    Inizia Prima Analisi
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="petvoice-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Tendenze Settimanali
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentAnalyses.length > 0 ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  {/* Distribuzione emozioni ultima settimana */}
                  {(() => {
                    const weekAnalyses = recentAnalyses.filter(analysis => {
                      const analysisDate = new Date(analysis.created_at);
                      const weekAgo = subDays(new Date(), 7);
                      return analysisDate >= weekAgo;
                    });

                    if (weekAnalyses.length === 0) {
                      return (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground text-sm">Nessuna analisi questa settimana</p>
                        </div>
                      );
                    }

                    // Conta le emozioni
                    const emotionCounts: Record<string, number> = {};
                    weekAnalyses.forEach(analysis => {
                      emotionCounts[analysis.primary_emotion] = (emotionCounts[analysis.primary_emotion] || 0) + 1;
                    });

                    // Ordina per frequenza
                    const sortedEmotions = Object.entries(emotionCounts)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 3); // Top 3 emozioni

                    return (
                      <>
                        <h4 className="font-medium text-sm mb-3">Emozioni più frequenti (7 giorni)</h4>
                        {sortedEmotions.map(([emotion, count]) => (
                          <div key={emotion} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getEmotionEmoji(emotion)}</span>
                              <span className="text-sm font-medium capitalize">{emotion}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-secondary rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full" 
                                  style={{ width: `${(count / weekAnalyses.length) * 100}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground w-8 text-right">
                                {count}x
                              </span>
                            </div>
                          </div>
                        ))}
                        <div className="pt-2 border-t">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Totale analisi settimana:</span>
                            <span className="font-medium">{weekAnalyses.length}</span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Score medio benessere:</span>
                            <span className="font-medium">
                              {(() => {
                                const emotionScores: Record<string, number> = {
                                  'felice': 90, 'calmo': 85, 'giocoso': 88, 'eccitato': 75,
                                  'ansioso': 40, 'triste': 30, 'aggressivo': 25
                                };
                                return Math.round(weekAnalyses.reduce((sum, a) => 
                                  sum + (emotionScores[a.primary_emotion] || 50), 0
                                ) / weekAnalyses.length);
                              })()}%
                            </span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate('/analysis?tab=history')}
                >
                  Vedi cronologia completa
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  {activePet ? 'Inizia le analisi per vedere le tendenze' : 'Aggiungi un pet per vedere le statistiche'}
                </p>
                {activePet && (
                  <Button 
                    size="sm" 
                    className="mt-3"
                    onClick={() => navigate('/analysis')}
                  >
                    Inizia Prima Analisi
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;