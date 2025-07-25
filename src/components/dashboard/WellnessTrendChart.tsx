import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { it } from 'date-fns/locale';
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

interface WellnessTrendChartProps {
  petId: string;
  userId: string;
}

const WellnessTrendChart: React.FC<WellnessTrendChartProps> = ({ petId, userId }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('mese');
  const [petAnalyses, setPetAnalyses] = React.useState([]);
  const [diaryEntries, setDiaryEntries] = React.useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!petId || !userId) return;
      try {
        const { data: analysesData } = await supabase
          .from('pet_analyses')
          .select('id, primary_emotion, primary_confidence, created_at')
          .eq('pet_id', petId);
        
        const { data: diaryData } = await supabase
          .from('diary_entries')
          .select('id, mood_score, created_at')
          .eq('pet_id', petId);

        setPetAnalyses(analysesData || []);
        setDiaryEntries(diaryData || []);
      } catch (error) {
        console.error('Error fetching trend data:', error);
      }
    };
    fetchData();
  }, [petId, userId]);

  const wellnessTrendData = useMemo(() => {
    const now = new Date();
    let periods = [];

    switch (selectedPeriod) {
      case 'oggi':
        periods = Array.from({ length: 24 }, (_, i) => {
          const hour = i;
          return {
            start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour),
            end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour + 1),
            label: `${hour}:00`
          };
        });
        break;
      case 'settimana':
        periods = Array.from({ length: 7 }, (_, i) => {
          const dayDate = subDays(now, 6 - i);
          return {
            start: startOfDay(dayDate),
            end: endOfDay(dayDate),
            label: format(dayDate, 'E', { locale: it })
          };
        });
        break;
      case 'anno':
        periods = Array.from({ length: 12 }, (_, i) => {
          const monthDate = subMonths(now, 11 - i);
          return {
            start: startOfMonth(monthDate),
            end: endOfMonth(monthDate),
            label: format(monthDate, 'MMM', { locale: it })
          };
        });
        break;
      case 'tutto':
        periods = Array.from({ length: 12 }, (_, i) => {
          const monthDate = subMonths(now, 11 - i);
          return {
            start: startOfMonth(monthDate),
            end: endOfMonth(monthDate),
            label: format(monthDate, 'MMM yyyy', { locale: it })
          };
        });
        break;
      default: // 'mese'
        periods = Array.from({ length: 6 }, (_, i) => {
          const monthDate = subMonths(now, 5 - i);
          return {
            start: startOfMonth(monthDate),
            end: endOfMonth(monthDate),
            label: format(monthDate, 'MMM', { locale: it })
          };
        });
    }

    const emotionScores = {
      'felice': 90, 'calmo': 85, 'giocoso': 88, 'eccitato': 75,
      'ansioso': 40, 'triste': 30, 'aggressivo': 25
    };

    return periods.map(period => {
      const periodAnalyses = petAnalyses.filter(analysis => {
        const date = new Date(analysis.created_at);
        return date >= period.start && date <= period.end;
      });

      let score = 65;
      if (periodAnalyses.length > 0) {
        const weightedSum = periodAnalyses.reduce((sum, analysis) => {
          const emotionScore = emotionScores[analysis.primary_emotion?.toLowerCase()] || 65;
          return sum + (emotionScore * analysis.primary_confidence);
        }, 0);
        const totalConfidence = periodAnalyses.reduce((sum, analysis) => sum + analysis.primary_confidence, 0);
        score = totalConfidence > 0 ? weightedSum / totalConfidence : 65;
      }

      return { date: period.label, wellness: Math.round(score) };
    });
  }, [petAnalyses, diaryEntries]);

  return (
    <Card className="w-full bg-primary/10 border border-primary/20 shadow-soft">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Trend Generale Benessere
            </CardTitle>
            <CardDescription>
              Andamento complessivo del benessere nel tempo
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {['oggi', 'settimana', 'mese', 'anno', 'tutto'].map((period) => (
              <Badge 
                key={period} 
                variant={selectedPeriod === period ? "default" : "outline"} 
                className="cursor-pointer"
                onClick={() => setSelectedPeriod(period)}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-8">
        <div className="w-full" style={{ height: '320px' }}>
          <ChartContainer 
            config={{ wellness: { label: "Benessere", color: "hsl(var(--primary))" } }}
            className="h-full w-full max-h-80"
          >
            <LineChart data={wellnessTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="wellness" stroke="hsl(var(--primary))" strokeWidth={3} />
              <ReferenceLine y={75} stroke="hsl(var(--success))" strokeDasharray="5 5" label="Ottimo" />
              <ReferenceLine y={50} stroke="hsl(var(--warning))" strokeDasharray="5 5" label="Medio" />
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default WellnessTrendChart;