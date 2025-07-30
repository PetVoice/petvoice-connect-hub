import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Brain, TrendingUp, Target, RotateCcw } from 'lucide-react';

interface LearningInsightsProps {
  petId: string;
}

interface ModelPerformance {
  [modelType: string]: {
    [metricName: string]: number;
  };
}

interface LearningData {
  model_performance: ModelPerformance;
  user_patterns: any[];
  recent_accuracy: number;
  feedback_count: number;
  learning_trends: {
    trend: 'improving' | 'declining' | 'stable' | 'insufficient_data';
    improvement_rate: number;
    recent_accuracy: number;
    older_accuracy: number;
  };
}

export const LearningInsights: React.FC<LearningInsightsProps> = ({ petId }) => {
  const [learningData, setLearningData] = useState<LearningData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetraining, setIsRetraining] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadLearningInsights();
  }, [petId]);

  const loadLearningInsights = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const response = await supabase.functions.invoke('continuous-learning', {
        body: {
          action: 'get_learning_insights',
          userId: user.id,
          petId
        }
      });

      if (response.error) throw response.error;
      setLearningData(response.data.insights);
    } catch (error) {
      console.error('Errore caricamento insights:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le informazioni di apprendimento.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const retrainModel = async (modelType: string) => {
    setIsRetraining(true);
    try {
      const response = await supabase.functions.invoke('continuous-learning', {
        body: {
          action: 'retrain_model',
          modelType
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "Modello aggiornato",
        description: `Il modello ${modelType} è stato riaddestrato con successo.`,
      });

      // Ricarica i dati
      await loadLearningInsights();
    } catch (error) {
      console.error('Errore retraining:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile riaddestrare il modello.",
        variant: "destructive"
      });
    } finally {
      setIsRetraining(false);
    }
  };

  const detectPatterns = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const response = await supabase.functions.invoke('continuous-learning', {
        body: {
          action: 'detect_patterns',
          userId: user.id,
          petId
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "Pattern rilevati",
        description: `Trovati ${response.data.patterns.length} nuovi pattern comportamentali.`,
      });

      await loadLearningInsights();
    } catch (error) {
      console.error('Errore rilevamento pattern:', error);
      toast({
        title: "Errore",
        description: "Impossibile rilevare nuovi pattern.",
        variant: "destructive"
      });
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600';
      case 'declining': return 'text-red-600';
      case 'stable': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '❓';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!learningData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-muted-foreground">Nessun dato di apprendimento disponibile</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Performance del Modello AI
          </CardTitle>
          <CardDescription>
            Accuratezza delle predizioni basata sui tuoi feedback
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.round(learningData.recent_accuracy * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Accuratezza Generale</div>
              <Progress value={learningData.recent_accuracy * 100} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">
                {learningData.feedback_count}
              </div>
              <div className="text-sm text-muted-foreground">Feedback Ricevuti</div>
            </div>

            <div className="text-center">
              <div className={`text-2xl font-bold ${getTrendColor(learningData.learning_trends.trend)}`}>
                {getTrendIcon(learningData.learning_trends.trend)}
              </div>
              <div className="text-sm text-muted-foreground">
                Trend: {learningData.learning_trends.trend}
              </div>
            </div>
          </div>

          {learningData.learning_trends.trend === 'improving' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                🎉 Ottimo! L'accuratezza è migliorata del {Math.round(learningData.learning_trends.improvement_rate * 100)}% 
                grazie ai tuoi feedback!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Model Performance by Type */}
      {learningData.model_performance && Object.keys(learningData.model_performance).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance per Tipo di Predizione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(learningData.model_performance).map(([modelType, metrics]) => (
                <div key={modelType} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium capitalize">{modelType.replace('_', ' ')}</div>
                    <div className="text-sm text-muted-foreground">
                      Accuratezza: {Math.round((metrics.accuracy || 0) * 100)}%
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => retrainModel(modelType)}
                    disabled={isRetraining}
                    className="flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Riaddestra
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Patterns */}
      {learningData.user_patterns && learningData.user_patterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Pattern Comportamentali Rilevati
            </CardTitle>
            <CardDescription>
              Pattern identificati automaticamente nei dati del tuo animale
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {learningData.user_patterns.map((pattern, index) => (
                <div key={pattern.id || index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{pattern.pattern_type.replace('_', ' ')}</Badge>
                    <Badge variant="secondary">
                      {Math.round(pattern.confidence_score * 100)}% sicurezza
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Validato {pattern.validation_count} volte
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Azioni di Apprendimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={detectPatterns} variant="outline">
              Rileva Nuovi Pattern
            </Button>
            <Button onClick={loadLearningInsights} variant="outline">
              Aggiorna Dati
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};