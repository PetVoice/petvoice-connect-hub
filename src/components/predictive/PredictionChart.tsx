import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain } from 'lucide-react';

interface PredictionChartProps {
  prediction: {
    id: string;
    prediction_date: string;
    prediction_window: string;
    predicted_behaviors: Record<string, number>;
    confidence_scores: Record<string, number>;
    contributing_factors: Record<string, any>;
  };
}

export const PredictionChart: React.FC<PredictionChartProps> = ({ prediction }) => {
  if (!prediction) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Nessuna previsione disponibile
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for chart
  const chartData = Object.entries(prediction.predicted_behaviors).map(([behavior, value]) => ({
    name: behavior.charAt(0).toUpperCase() + behavior.slice(1),
    probability: Math.round((value as number) * 100),
    confidence: Math.round(((prediction.confidence_scores[behavior] as number) || 0) * 100),
  })).sort((a, b) => b.probability - a.probability);

  const getBarColor = (probability: number) => {
    if (probability >= 70) return '#ef4444'; // red
    if (probability >= 40) return '#f59e0b'; // amber
    return '#10b981'; // emerald
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="h-5 w-5 mr-2" />
          Previsione Comportamentale
        </CardTitle>
        <CardDescription>
          Probabilità per {prediction.prediction_window.replace('_', ' ')} - 
          Data: {new Date(prediction.prediction_date).toLocaleDateString('it-IT')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `${value}%`,
                  name === 'probability' ? 'Probabilità' : 'Confidenza'
                ]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="probability" 
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {chartData.map((item) => (
            <div key={item.name} className="flex justify-between items-center p-2 bg-secondary/50 rounded">
              <span className="font-medium">{item.name}</span>
              <div className="text-right">
                <div className="font-bold">{item.probability}%</div>
                <div className="text-xs text-muted-foreground">
                  {item.confidence}% confidenza
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Fattori Contribuenti */}
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Fattori Contribuenti:</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(prediction.contributing_factors).map(([factor, value]) => (
              <Badge key={factor} variant="secondary" className="text-xs">
                {factor}: {String(value)}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};