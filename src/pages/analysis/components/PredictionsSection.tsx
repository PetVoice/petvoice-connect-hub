import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Brain, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { usePredictions } from '../hooks/usePredictions';
import { AnalysisData } from '../hooks/useAnalysisData';
import { TREND_DESCRIPTIONS, EMOTION_COLORS } from '../utils/constants';

interface PredictionsSectionProps {
  analyses: AnalysisData[];
  diaryData: any[];
  healthData: any[];
  wellnessData: any[];
}

const WellnessTrendCard: React.FC<{ predictions: any }> = ({ predictions }) => {
  const trendInfo = TREND_DESCRIPTIONS[predictions.trend as keyof typeof TREND_DESCRIPTIONS];
  
  const TrendIcon = predictions.trend.includes('improvement') ? TrendingUp : 
                    predictions.trend.includes('decline') ? TrendingDown : 
                    BarChart3;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendIcon className={`h-5 w-5 ${trendInfo.color}`} />
          Trend del Benessere
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`p-4 rounded-lg ${trendInfo.bgColor}`}>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className={trendInfo.color}>
              {trendInfo.label}
            </Badge>
            <span className="text-sm font-medium">{predictions.confidence}% affidabilità</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {trendInfo.description}
          </p>
        </div>

        {predictions.components.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Componenti del trend:</h4>
            {predictions.components.map((component: any, index: number) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span>{component.source}</span>
                <div className="flex items-center gap-2">
                  <span className={component.trend > 0 ? 'text-green-600' : component.trend < 0 ? 'text-red-600' : 'text-gray-600'}>
                    {component.trend > 0 ? '+' : ''}{component.trend.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">({Math.round(component.weight * 100)}%)</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {predictions.prediction && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              Previsione {predictions.prediction.timeframe}
            </h4>
            <div className="flex items-center gap-2 mb-2">
              <Progress value={predictions.prediction.confidence} className="flex-1" />
              <span className="text-sm font-medium">{predictions.prediction.confidence}%</span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {predictions.prediction.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const RecommendationsCard: React.FC<{ predictions: any }> = ({ predictions }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          Raccomandazioni AI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {predictions.recommendations.length > 0 ? (
          <div className="space-y-3">
            {predictions.recommendations.map((rec: string, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{rec}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Effettua più analisi per ricevere raccomandazioni personalizzate.
          </p>
        )}

        {predictions.riskFactors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-orange-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Fattori di Attenzione
            </h4>
            {predictions.riskFactors.map((factor: string, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-orange-700 dark:text-orange-300">{factor}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const EmotionDistributionCard: React.FC<{ predictions: any }> = ({ predictions }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Distribuzione Emozioni
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.keys(predictions.emotionDistribution).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(predictions.emotionDistribution)
              .sort(([,a], [,b]) => (b as number) - (a as number))
              .map(([emotion, percentage]) => (
                <div key={emotion} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{emotion}</span>
                    <span className="text-sm text-muted-foreground">{percentage}%</span>
                  </div>
                  <Progress 
                    value={percentage as number} 
                    className="h-2"
                  />
                </div>
              ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Effettua più analisi per vedere la distribuzione delle emozioni.
          </p>
        )}

        {predictions.confidenceTrend !== 0 && (
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {predictions.confidenceTrend > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm font-medium">Trend Affidabilità</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {predictions.confidenceTrend > 0 ? 'In miglioramento' : 'In calo'} di {Math.abs(predictions.confidenceTrend).toFixed(1)}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const InsufficientDataCard: React.FC = () => (
  <Card className="col-span-full">
    <CardContent className="text-center p-8">
      <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
      <h3 className="text-lg font-semibold mb-2">Dati Insufficienti per le Previsioni</h3>
      <p className="text-muted-foreground">
        Effettua almeno 3 analisi per ottenere previsioni accurate e insight comportamentali.
      </p>
    </CardContent>
  </Card>
);

export const PredictionsSection: React.FC<PredictionsSectionProps> = ({
  analyses,
  diaryData,
  healthData,
  wellnessData
}) => {
  const predictions = usePredictions({ 
    analyses, 
    diaryData, 
    healthData, 
    wellnessData 
  });

  if (predictions.trend === 'insufficient_data') {
    return <InsufficientDataCard />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <WellnessTrendCard predictions={predictions} />
      <RecommendationsCard predictions={predictions} />
      <EmotionDistributionCard predictions={predictions} />
    </div>
  );
};