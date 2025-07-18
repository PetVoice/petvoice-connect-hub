import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Brain, Target, TrendingUp, Zap, AlertCircle } from 'lucide-react';
import { InsightCard, type Insight } from './InsightCard';
import { generateInsights } from '@/utils/insightsGenerator';

interface InsightsEngineProps {
  analysisData: any[];
  diaryData: any[];
  healthData: any[];
  wellnessData: any[];
  petData: any;
  timeRange: string;
}

export function InsightsEngine({ 
  analysisData, 
  diaryData, 
  healthData, 
  wellnessData, 
  petData,
  timeRange 
}: InsightsEngineProps) {
  const insights = useMemo(() => {
    return generateInsights({
      analysisData,
      diaryData,
      healthData,
      wellnessData,
      petData,
      timeRange
    });
  }, [analysisData, diaryData, healthData, wellnessData, petData, timeRange]);

  const categorizedInsights = useMemo(() => {
    return {
      patterns: insights.filter(i => i.type === 'pattern'),
      predictions: insights.filter(i => i.type === 'prediction'),
      interventions: insights.filter(i => i.type === 'intervention'),
      correlations: insights.filter(i => i.type === 'correlation')
    };
  }, [insights]);

  const criticalInsights = insights.filter(i => i.severity === 'critical');
  const highConfidenceInsights = insights.filter(i => i.confidence >= 80);

  const handleActionClick = (insight: Insight) => {
    // Here you could implement action handling
    console.log('Action clicked for insight:', insight);
  };

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Insights Intelligenti
          </CardTitle>
          <CardDescription>
            Analisi avanzate e raccomandazioni basate sui dati del tuo pet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aggiungi più dati per generare insights intelligenti</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Insights Intelligenti Engine
          </CardTitle>
          <CardDescription>
            Analisi avanzate basate su AI per ottimizzare il benessere del tuo pet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{insights.length}</div>
              <div className="text-sm text-muted-foreground">Total Insights</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{criticalInsights.length}</div>
              <div className="text-sm text-muted-foreground">Critical</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{highConfidenceInsights.length}</div>
              <div className="text-sm text-muted-foreground">High Confidence</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {insights.filter(i => i.recommendation).length}
              </div>
              <div className="text-sm text-muted-foreground">Actionable</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {criticalInsights.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              Critical Insights
            </CardTitle>
            <CardDescription className="text-red-700">
              Require immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {criticalInsights.map(insight => (
                <InsightCard 
                  key={insight.id} 
                  insight={insight} 
                  onActionClick={handleActionClick}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights Tabs */}
      <Tabs defaultValue="patterns" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">Patterns</span>
            <Badge variant="secondary" className="text-xs">
              {categorizedInsights.patterns.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Predictions</span>
            <Badge variant="secondary" className="text-xs">
              {categorizedInsights.predictions.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="interventions" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Actions</span>
            <Badge variant="secondary" className="text-xs">
              {categorizedInsights.interventions.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="correlations" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Correlations</span>
            <Badge variant="secondary" className="text-xs">
              {categorizedInsights.correlations.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid gap-4">
            {categorizedInsights.patterns.map(insight => (
              <InsightCard 
                key={insight.id} 
                insight={insight} 
                onActionClick={handleActionClick}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid gap-4">
            {categorizedInsights.predictions.map(insight => (
              <InsightCard 
                key={insight.id} 
                insight={insight} 
                onActionClick={handleActionClick}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="interventions" className="space-y-4">
          <div className="grid gap-4">
            {categorizedInsights.interventions.map(insight => (
              <InsightCard 
                key={insight.id} 
                insight={insight} 
                onActionClick={handleActionClick}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="correlations" className="space-y-4">
          <div className="grid gap-4">
            {categorizedInsights.correlations.map(insight => (
              <InsightCard 
                key={insight.id} 
                insight={insight} 
                onActionClick={handleActionClick}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}