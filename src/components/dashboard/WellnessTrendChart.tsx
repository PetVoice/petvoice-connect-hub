import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { fetchUnifiedHealthData, generateTrendData } from '@/utils/unifiedWellnessCalculator';

interface WellnessTrendChartProps {
  petId: string;
  userId: string;
  petType?: string;
}

const WellnessTrendChart: React.FC<WellnessTrendChartProps> = ({ petId, userId, petType }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('mese');
  const [unifiedData, setUnifiedData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      if (!petId || !userId) return;
      
      setIsLoading(true);
      try {
        const data = await fetchUnifiedHealthData(petId, userId);
        setUnifiedData(data);
      } catch (error) {
        console.error('Error loading unified health data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [petId, userId]);

  const wellnessTrendData = useMemo(() => {
    if (!unifiedData) return [];
    return generateTrendData(unifiedData, selectedPeriod, petType);
  }, [unifiedData, selectedPeriod, petType]);

  if (isLoading) {
    return (
      <Card className="w-full bg-gradient-subtle border-0 shadow-elegant">
        <CardHeader>
          <CardTitle>Trend Generale Benessere</CardTitle>
          <CardDescription>Caricamento...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-muted-foreground">Caricamento dati...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-gradient-subtle border-0 shadow-elegant hover:shadow-glow transition-all duration-300">
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
              <Line 
                type="monotone" 
                dataKey="wellness" 
                stroke="#10b981"
                strokeWidth={3}
                connectNulls={false}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  const wellness = payload?.wellness || 0;
                  const color = wellness >= 70 ? '#10b981' : wellness >= 30 ? '#f59e0b' : '#ef4444';
                  return <circle cx={cx} cy={cy} r={4} fill={color} stroke={color} strokeWidth={2} />;
                }}
              />
              <ReferenceLine y={75} stroke="#10b981" strokeDasharray="5 5" label="Ottimo" />
              <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="5 5" label="Medio" />
              <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="5 5" label="Critico" />
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default WellnessTrendChart;