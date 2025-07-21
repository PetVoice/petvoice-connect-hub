import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Target, Clock, CheckCircle } from 'lucide-react';

interface InterventionCardProps {
  intervention: {
    id: string;
    intervention_type: string;
    recommended_timing: string;
    priority_level: 'low' | 'medium' | 'high' | 'critical';
    success_probability: number;
    estimated_cost?: number;
    reasoning: string;
    expected_outcomes: Record<string, any>;
    status: 'pending' | 'scheduled' | 'completed' | 'dismissed';
  };
  onSchedule?: (interventionId: string) => void;
  onDismiss?: (interventionId: string) => void;
  className?: string;
}

export const InterventionCard: React.FC<InterventionCardProps> = ({
  intervention,
  onSchedule,
  onDismiss,
  className = ""
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-emerald-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-600 bg-emerald-50';
      case 'scheduled': return 'text-blue-600 bg-blue-50';
      case 'dismissed': return 'text-gray-500 bg-gray-50';
      default: return 'text-orange-600 bg-orange-50';
    }
  };

  const formatDateTime = (datetime: string) => {
    return new Date(datetime).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSuccessColor = (probability: number) => {
    if (probability >= 0.8) return 'text-emerald-600';
    if (probability >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className={`${className} ${intervention.priority_level === 'critical' ? 'border-red-500' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{intervention.intervention_type}</CardTitle>
          <div className="flex gap-2">
            <Badge className={getPriorityColor(intervention.priority_level)}>
              {intervention.priority_level}
            </Badge>
            <Badge variant="outline" className={getStatusColor(intervention.status)}>
              {intervention.status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Timing and Success */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Timing Ottimale</p>
              <p className="font-medium">{formatDateTime(intervention.recommended_timing)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Probabilità Successo</p>
              <p className={`font-medium ${getSuccessColor(intervention.success_probability)}`}>
                {Math.round(intervention.success_probability * 100)}%
              </p>
            </div>
          </div>
        </div>

        {/* Cost */}
        {intervention.estimated_cost && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Costo Stimato</p>
              <p className="font-medium">€{intervention.estimated_cost.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Reasoning */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Motivazione</h4>
          <p className="text-sm text-muted-foreground">{intervention.reasoning}</p>
        </div>

        {/* Expected Outcomes */}
        {intervention.expected_outcomes && Object.keys(intervention.expected_outcomes).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Risultati Attesi</h4>
            <div className="flex flex-wrap gap-1">
              {Object.entries(intervention.expected_outcomes).map(([key, value]) => (
                <Badge key={key} variant="secondary" className="text-xs">
                  {key}: {String(value)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {intervention.status === 'pending' && (
          <div className="flex gap-2 pt-4 border-t">
            {onSchedule && (
              <Button 
                onClick={() => onSchedule(intervention.id)}
                className="flex-1"
                size="sm"
              >
                <Clock className="h-4 w-4 mr-2" />
                Programma
              </Button>
            )}
            {onDismiss && (
              <Button 
                variant="outline" 
                onClick={() => onDismiss(intervention.id)}
                size="sm"
              >
                Ignora
              </Button>
            )}
          </div>
        )}

        {intervention.status === 'completed' && (
          <div className="flex items-center gap-2 text-emerald-600 text-sm pt-4 border-t">
            <CheckCircle className="h-4 w-4" />
            <span>Intervento Completato</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};