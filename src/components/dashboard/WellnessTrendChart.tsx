import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Calendar, Heart, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { it } from 'date-fns/locale';

interface WellnessDataPoint {
  date: string;
  score: number;
  analyses_count: number;
  avg_emotion: number;
  medications_count: number;
  diary_entries: number;
  vitals_count: number;
  visits_count: number;
}

interface WellnessTrendChartProps {
  petId: string;
  userId: string;
}

const WellnessTrendChart: React.FC<WellnessTrendChartProps> = ({ petId, userId }) => {
  console.log('WellnessTrendChart rendered with:', { petId, userId });
  const [wellnessData, setWellnessData] = useState<WellnessDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Mappatura emozioni a punteggi
  const emotionScores: Record<string, number> = {
    'felice': 90,
    'calmo': 85,
    'giocoso': 88,
    'eccitato': 75,
    'curioso': 70,
    'neutro': 65,
    'confuso': 50,
    'ansioso': 40,
    'triste': 30,
    'aggressivo': 25,
    'stressato': 35,
    'paura': 20
  };

  useEffect(() => {
    fetchWellnessData();
  }, [petId, userId, timeRange]);

  const getDaysFromRange = () => {
    switch(timeRange) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      default: return 30;
    }
  };

  const fetchWellnessData = async () => {
    if (!petId || !userId) return;
    
    setLoading(true);
    
    try {
      const days = getDaysFromRange();
      const endDate = new Date();
      const startDate = subDays(endDate, days);

      // Crea array di date per il periodo
      const dates = [];
      for (let i = 0; i < days; i++) {
        dates.push(subDays(endDate, i));
      }

      const wellnessPoints: WellnessDataPoint[] = [];

      for (const date of dates) {
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);

        // 1. Analisi comportamentali
        const { data: analyses } = await supabase
          .from('pet_analyses')
          .select('primary_emotion, primary_confidence')
          .eq('pet_id', petId)
          .gte('created_at', dayStart.toISOString())
          .lte('created_at', dayEnd.toISOString());

        // 2. Entrate diario
        const { data: diaryEntries } = await supabase
          .from('diary_entries')
          .select('id')
          .eq('pet_id', petId)
          .gte('created_at', dayStart.toISOString())
          .lte('created_at', dayEnd.toISOString());

        // 3. Farmaci (usando tabelle esistenti)
        const { data: medications } = await supabase
          .from('pet_insurance')
          .select('id')
          .eq('user_id', userId)
          .gte('created_at', dayStart.toISOString())
          .lte('created_at', dayEnd.toISOString());

        // 4. Parametri vitali (simulazione da analisi comportamentali)
        const { data: vitals } = await supabase
          .from('pet_analyses')
          .select('id')
          .eq('pet_id', petId)
          .gte('created_at', dayStart.toISOString())
          .lte('created_at', dayEnd.toISOString());

        // 5. Visite veterinarie (simulazione da wellness scores)
        const { data: visits } = await supabase
          .from('pet_wellness_scores')
          .select('id')
          .eq('pet_id', petId)
          .gte('created_at', dayStart.toISOString())
          .lte('created_at', dayEnd.toISOString());

        // Calcola punteggio medio delle emozioni
        let avgEmotion = 65; // neutro come default
        if (analyses && analyses.length > 0) {
          const emotionSum = analyses.reduce((sum, analysis) => {
            const score = emotionScores[analysis.primary_emotion?.toLowerCase()] || 65;
            return sum + (score * analysis.primary_confidence);
          }, 0);
          const confidenceSum = analyses.reduce((sum, analysis) => sum + analysis.primary_confidence, 0);
          avgEmotion = confidenceSum > 0 ? emotionSum / confidenceSum : 65;
        }

        // Calcola punteggio benessere complessivo
        let score = avgEmotion;
        
        // Bonus per attività positive
        if (diaryEntries && diaryEntries.length > 0) score += 5;
        if (medications && medications.length > 0) score += 3; // I farmaci potrebbero indicare cure preventive
        if (vitals && vitals.length > 0) score += 7; // Monitoraggio attivo è positivo
        if (visits && visits.length > 0) score += 10; // Visite preventive sono molto positive

        // Mantieni il punteggio tra 0 e 100
        score = Math.min(100, Math.max(0, score));

        wellnessPoints.push({
          date: format(date, 'dd/MM', { locale: it }),
          score: Math.round(score),
          analyses_count: analyses?.length || 0,
          avg_emotion: Math.round(avgEmotion),
          medications_count: medications?.length || 0,
          diary_entries: diaryEntries?.length || 0,
          vitals_count: vitals?.length || 0,
          visits_count: visits?.length || 0
        });
      }

      // Ordina per data (dal più vecchio al più recente)
      wellnessPoints.reverse();
      setWellnessData(wellnessPoints);
    } catch (error) {
      console.error('Error fetching wellness data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'hsl(var(--success))';
    if (score >= 50) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 75) return { text: 'Ottimo', color: 'bg-success/10 text-success' };
    if (score >= 50) return { text: 'Buono', color: 'bg-warning/10 text-warning' };
    return { text: 'Attenzione', color: 'bg-destructive/10 text-destructive' };
  };

  const calculateTrend = () => {
    if (wellnessData.length < 2) return { direction: 'stable', percentage: 0 };
    
    const recent = wellnessData.slice(-7).reduce((sum, point) => sum + point.score, 0) / Math.min(7, wellnessData.length);
    const previous = wellnessData.slice(-14, -7);
    const previousAvg = previous.length > 0 ? previous.reduce((sum, point) => sum + point.score, 0) / previous.length : recent;
    
    const change = ((recent - previousAvg) / previousAvg) * 100;
    
    if (Math.abs(change) < 2) return { direction: 'stable', percentage: 0 };
    return { 
      direction: change > 0 ? 'up' : 'down', 
      percentage: Math.abs(Math.round(change)) 
    };
  };

  const currentScore = wellnessData.length > 0 ? wellnessData[wellnessData.length - 1].score : 0;
  const trend = calculateTrend();
  const status = getScoreStatus(currentScore);

  if (loading) {
    return (
      <Card className="petvoice-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Trend Benessere Generale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="petvoice-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Trend Benessere Generale
            </CardTitle>
            <CardDescription>
              Monitora l'andamento complessivo della salute e benessere
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={status.color}>
              {status.text}
            </Badge>
            <span className="text-2xl font-bold">{currentScore}/100</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as '7d' | '30d' | '90d')}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="7d">7 giorni</TabsTrigger>
            <TabsTrigger value="30d">30 giorni</TabsTrigger>
            <TabsTrigger value="90d">90 giorni</TabsTrigger>
          </TabsList>
          
          <TabsContent value={timeRange} className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={wellnessData}>
                  <defs>
                    <linearGradient id="wellnessGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                            <p className="font-medium">{label}</p>
                            <p className="text-sm">
                              <span className="font-medium text-primary">Benessere: </span>
                              {data.score}/100
                            </p>
                            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                              <p>• Analisi: {data.analyses_count}</p>
                              <p>• Diario: {data.diary_entries}</p>
                              <p>• Parametri vitali: {data.vitals_count}</p>
                              <p>• Farmaci: {data.medications_count}</p>
                              <p>• Visite: {data.visits_count}</p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#wellnessGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp 
                  className={`h-4 w-4 ${
                    trend.direction === 'up' ? 'text-success' : 
                    trend.direction === 'down' ? 'text-destructive' : 'text-muted-foreground'
                  }`} 
                />
                <span>
                  {trend.direction === 'up' && '+'}
                  {trend.direction === 'down' && '-'}
                  {trend.percentage}% rispetto alla settimana scorsa
                </span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span>Basato su tutti i fattori di salute</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WellnessTrendChart;