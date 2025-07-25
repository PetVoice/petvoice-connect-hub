import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek, subWeeks, startOfYear, endOfYear, subYears } from 'date-fns';
import { it } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { usePets } from '@/contexts/PetContext';
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

interface AnalysisData {
  id: string;
  primary_emotion: string;
  primary_confidence: number;
  created_at: string;
}

interface DiaryEntry {
  id: string;
  mood_score: number;
  created_at: string;
}

interface WellnessTrendChartProps {
  petId: string;
  userId: string;
}

const WellnessTrendChart: React.FC<WellnessTrendChartProps> = ({ petId, userId }) => {
  const { user } = useAuth();
  const { pets } = usePets();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [petAnalyses, setPetAnalyses] = React.useState<AnalysisData[]>([]);
  const [diaryEntries, setDiaryEntries] = React.useState<DiaryEntry[]>([]);
  const [medications, setMedications] = React.useState<any[]>([]);
  const [healthMetrics, setHealthMetrics] = React.useState<any[]>([]);

  const selectedPet = pets.find(p => p.id === petId) || pets[0];

  // Fetch data when component mounts
  React.useEffect(() => {
    const fetchData = async () => {
      if (!petId || !userId) return;

      try {
        // Fetch analyses
        const { data: analysesData } = await supabase
          .from('pet_analyses')
          .select('id, primary_emotion, primary_confidence, created_at')
          .eq('pet_id', petId)
          .order('created_at', { ascending: false });

        // Fetch diary entries
        const { data: diaryData } = await supabase
          .from('diary_entries')
          .select('id, mood_score, created_at')
          .eq('pet_id', petId)
          .order('created_at', { ascending: false });

        setPetAnalyses(analysesData || []);
        setDiaryEntries(diaryData || []);
        setMedications([]); // Placeholder
        setHealthMetrics([]); // Placeholder
      } catch (error) {
        console.error('Error fetching trend data:', error);
      }
    };

    fetchData();
  }, [petId, userId]);

  // Calculate wellness trend data from real health metrics and diary entries
  const wellnessTrendData = useMemo(() => {
    if (!petAnalyses || !diaryEntries) return [];
    
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
            label: format(date, 'dd/MM', { locale: it })
          };
        });
        break;
      case 'week':
        // Last 4 weeks
        periods = Array.from({ length: 4 }, (_, i) => {
          const startDate = startOfWeek(subWeeks(now, 3 - i), { weekStartsOn: 1 });
          const endDate = endOfWeek(subWeeks(now, 3 - i), { weekStartsOn: 1 });
          return {
            start: startDate,
            end: endDate,
            label: `${format(startDate, 'dd/MM', { locale: it })}`
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
            label: format(monthDate, 'MMM', { locale: it })
          };
        });
        break;
      case 'year':
        // Last 3 years
        periods = Array.from({ length: 3 }, (_, i) => {
          const yearDate = subYears(now, 2 - i);
          return {
            start: startOfYear(yearDate),
            end: endOfYear(yearDate),
            label: format(yearDate, 'yyyy')
          };
        });
        break;
      case 'all':
        // Group by months since first data
        const firstAnalysis = petAnalyses[petAnalyses.length - 1];
        const firstDiary = diaryEntries[diaryEntries.length - 1];
        
        if (!firstAnalysis && !firstDiary) return [];
        
        const firstDate = new Date(Math.min(
          firstAnalysis ? new Date(firstAnalysis.created_at).getTime() : Infinity,
          firstDiary ? new Date(firstDiary.created_at).getTime() : Infinity
        ));
        
        const monthsDiff = Math.ceil((now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
        periods = Array.from({ length: Math.min(monthsDiff, 12) }, (_, i) => {
          const monthDate = subMonths(now, monthsDiff - 1 - i);
          return {
            start: startOfMonth(monthDate),
            end: endOfMonth(monthDate),
            label: format(monthDate, 'MMM yyyy', { locale: it })
          };
        });
        break;
    }

    // Emotion scores mapping
    const emotionScores: Record<string, number> = {
      'felice': 90, 'giocoso': 88, 'calmo': 85, 'eccitato': 75, 'curioso': 70,
      'neutro': 65, 'confuso': 50, 'ansioso': 40, 'stressato': 35, 'triste': 30,
      'aggressivo': 25, 'paura': 20
    };

    return periods.map(period => {
      // Get analyses for this period
      const periodAnalyses = petAnalyses.filter(analysis => {
        const date = new Date(analysis.created_at);
        return date >= period.start && date <= period.end;
      });

      // Get diary entries for this period
      const periodDiary = diaryEntries.filter(entry => {
        const date = new Date(entry.created_at);
        return date >= period.start && date <= period.end;
      });

      // Calculate emotion score
      let emotionScore = 65; // neutral default
      if (periodAnalyses.length > 0) {
        const weightedSum = periodAnalyses.reduce((sum, analysis) => {
          const score = emotionScores[analysis.primary_emotion?.toLowerCase()] || 65;
          return sum + (score * analysis.primary_confidence);
        }, 0);
        const totalConfidence = periodAnalyses.reduce((sum, analysis) => sum + analysis.primary_confidence, 0);
        if (totalConfidence > 0) {
          emotionScore = weightedSum / totalConfidence;
        }
      }

      // Calculate diary score
      let diaryScore = 65;
      if (periodDiary.length > 0) {
        diaryScore = periodDiary.reduce((sum, entry) => sum + (entry.mood_score || 5), 0) / periodDiary.length * 10;
      }

      // Calculate combined score
      let score = (emotionScore * 0.6) + (diaryScore * 0.4);
      
      // Activity bonus
      if (periodAnalyses.length > 0) score += 5;
      if (periodDiary.length > 0) score += 5;
      
      // Normalize score
      score = Math.max(0, Math.min(100, score));
      
      return {
        date: period.label,
        wellness: Math.round(score)
      };
    });
  }, [petAnalyses, diaryEntries, selectedPeriod]);

  return (
    <Card className="bg-gradient-to-br from-card to-muted/20 border-2 hover:shadow-xl transition-all duration-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Trend Generale Benessere
            </CardTitle>
            <CardDescription>
              Andamento complessivo del benessere di {selectedPet?.name || 'il tuo pet'} nel tempo
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
            <LineChart data={wellnessTrendData}>
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
  );
};

export default WellnessTrendChart;