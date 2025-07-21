import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp } from 'lucide-react';

interface PredictionData {
  time: string;
  predicted_value: number;
  confidence: number;
  behavior_type: string;
}

interface PredictionChartProps {
  predictions: PredictionData[];
  timeHorizon: '24h' | '48h';
  showConfidence?: boolean;
  className?: string;
}

export const PredictionChart: React.FC<PredictionChartProps> = ({ 
  predictions, 
  timeHorizon, 
  showConfidence = true,
  className = "" 
}) => {
  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-emerald-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const averageConfidence = predictions.length > 0 
    ? predictions.reduce((sum, pred) => sum + pred.confidence, 0) / predictions.length 
    : 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Previsioni Comportamentali
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeHorizon}
            </Badge>
            {showConfidence && (
              <Badge 
                variant="outline" 
                className={getConfidenceColor(averageConfidence)}
              >
                {Math.round(averageConfidence * 100)}% confidenza
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {predictions.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nessuna previsione disponibile</p>
              <p className="text-sm">I dati verranno aggiornati automaticamente</p>
            </div>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={predictions}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="time"
                  tickFormatter={formatTime}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  labelFormatter={formatTime}
                  formatter={(value: number, name: string) => [
                    name === 'predicted_value' ? `${value}%` : `${Math.round(value * 100)}%`,
                    name === 'predicted_value' ? 'Probabilità' : 'Confidenza'
                  ]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                
                {showConfidence && (
                  <Area
                    type="monotone"
                    dataKey="confidence"
                    stroke="hsl(var(--muted-foreground))"
                    fill="hsl(var(--muted))"
                    fillOpacity={0.3}
                  />
                )}
                
                <Line
                  type="monotone"
                  dataKey="predicted_value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Behavior Types Legend */}
        {predictions.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {[...new Set(predictions.map(p => p.behavior_type))].map(behaviorType => (
                <Badge key={behaviorType} variant="secondary" className="text-xs">
                  {behaviorType}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};