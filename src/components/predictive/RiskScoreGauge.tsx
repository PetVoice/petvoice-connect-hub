import React from 'react';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RiskScoreGaugeProps {
  score: number;
  breakdown?: {
    behavioral: number;
    physical: number;
    environmental: number;
  };
  trends?: 'improving' | 'stable' | 'declining';
  className?: string;
}

export const RiskScoreGauge: React.FC<RiskScoreGaugeProps> = ({ 
  score, 
  breakdown, 
  trends,
  className = "" 
}) => {
  const getRiskLevel = (score: number) => {
    if (score <= 25) return { label: 'Basso', color: 'bg-emerald-500', textColor: 'text-emerald-700' };
    if (score <= 50) return { label: 'Moderato', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    if (score <= 75) return { label: 'Elevato', color: 'bg-orange-500', textColor: 'text-orange-700' };
    return { label: 'Critico', color: 'bg-red-500', textColor: 'text-red-700' };
  };

  const riskLevel = getRiskLevel(score);

  const getTrendIcon = () => {
    switch (trends) {
      case 'improving':
        return <TrendingDown className="h-4 w-4 text-emerald-600" />;
      case 'declining':
        return <TrendingUp className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Risk Score
          </span>
          {getTrendIcon()}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Score Display */}
        <div className="text-center space-y-2">
          <div className="text-4xl font-bold">{score}</div>
          <Badge variant="outline" className={riskLevel.textColor}>
            {riskLevel.label}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div 
              className={`h-full transition-all ${riskLevel.color}`}
              style={{ width: `${score}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>100</span>
          </div>
        </div>

        {/* Risk Breakdown */}
        {breakdown && (
          <div className="space-y-3 border-t pt-4">
            <h4 className="text-sm font-medium">Breakdown Fattori</h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Comportamentale</span>
                <div className="flex items-center gap-2">
                  <Progress value={breakdown.behavioral} className="w-16 h-2" />
                  <span className="text-xs w-8">{breakdown.behavioral}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Fisico</span>
                <div className="flex items-center gap-2">
                  <Progress value={breakdown.physical} className="w-16 h-2" />
                  <span className="text-xs w-8">{breakdown.physical}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ambientale</span>
                <div className="flex items-center gap-2">
                  <Progress value={breakdown.environmental} className="w-16 h-2" />
                  <span className="text-xs w-8">{breakdown.environmental}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};