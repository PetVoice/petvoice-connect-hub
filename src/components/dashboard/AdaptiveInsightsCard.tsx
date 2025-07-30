import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdaptiveInsights } from '@/hooks/useAdaptiveIntelligence';
import { 
  Brain, 
  AlertTriangle, 
  Lightbulb, 
  TrendingUp, 
  X,
  RefreshCw,
  ChevronRight
} from 'lucide-react';

const AdaptiveInsightsCard: React.FC = () => {
  const { insights, dismiss, refresh } = useAdaptiveInsights('dashboard');

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'recommendation': return <Lightbulb className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'suggestion': return <TrendingUp className="h-4 w-4" />;
      case 'optimization': return <Brain className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  if (insights.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Insights Adattivi
            </CardTitle>
            <CardDescription>
              L'AI analizza il comportamento del tuo pet per suggerirti azioni personalizzate
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nessun insight disponibile al momento</p>
            <p className="text-sm">L'AI continua ad apprendere dal comportamento del tuo pet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            Insights Adattivi
            <Badge variant="outline" className="ml-2">
              {insights.length}
            </Badge>
          </CardTitle>
          <CardDescription>
            Suggerimenti intelligenti basati sul comportamento attuale
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={refresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="h-64 overflow-y-scroll space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {insights.map((insight) => (
          <div 
            key={insight.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-white/20"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30">
                {getInsightIcon(insight.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm truncate">{insight.title}</h4>
                  <Badge 
                    variant={getPriorityColor(insight.priority) as any}
                    className="text-xs"
                  >
                    {insight.priority}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {insight.description}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-muted-foreground">
                    Confidenza: {Math.round(insight.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto opacity-60 hover:opacity-100"
              onClick={() => dismiss(insight.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        
        {insights.length > 5 && (
          <div className="text-center pt-2">
            <Button variant="ghost" size="sm" className="text-xs">
              Vedi altri {insights.length - 5} insights
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdaptiveInsightsCard;