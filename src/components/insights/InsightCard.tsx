import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ExternalLink, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Brain, Target } from 'lucide-react';

export interface Insight {
  id: string;
  type: 'pattern' | 'prediction' | 'intervention' | 'correlation';
  title: string;
  description: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  evidence: {
    dataPoints: number;
    timeFrame: string;
    sources: string[];
  };
  recommendation?: {
    action: string;
    successProbability: number;
    expectedOutcome: string;
    researchLink?: string;
  };
  trend?: 'up' | 'down' | 'stable';
  metrics?: {
    current: number;
    target: number;
    unit: string;
  };
}

interface InsightCardProps {
  insight: Insight;
  onActionClick?: (insight: Insight) => void;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'pattern': return <Brain className="h-4 w-4" />;
    case 'prediction': return <TrendingUp className="h-4 w-4" />;
    case 'intervention': return <Target className="h-4 w-4" />;
    case 'correlation': return <CheckCircle className="h-4 w-4" />;
    default: return <AlertTriangle className="h-4 w-4" />;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'pattern': return 'Pattern Recognition';
    case 'prediction': return 'Behavioral Prediction';
    case 'intervention': return 'Intervention Suggestion';
    case 'correlation': return 'Correlation Discovery';
    default: return 'Insight';
  }
};

export function InsightCard({ insight, onActionClick }: InsightCardProps) {
  const confidenceColor = insight.confidence >= 80 ? 'text-green-600' : 
                         insight.confidence >= 60 ? 'text-yellow-600' : 'text-red-600';

  const TrendIcon = insight.trend === 'up' ? TrendingUp : 
                   insight.trend === 'down' ? TrendingDown : 
                   null;

  return (
    <Card className={`relative transition-all duration-200 hover:shadow-lg ${
      insight.severity === 'critical' ? 'ring-2 ring-red-200' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getTypeIcon(insight.type)}
            <div>
              <CardTitle className="text-base">{insight.title}</CardTitle>
              <CardDescription className="text-sm">
                {getTypeLabel(insight.type)} • {insight.category}
              </CardDescription>
            </div>
          </div>
          <Badge className={getSeverityColor(insight.severity)}>
            {insight.severity.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {insight.description}
        </p>

        {/* Confidence Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Confidence Score</span>
            <span className={`font-medium ${confidenceColor}`}>
              {insight.confidence}%
            </span>
          </div>
          <Progress value={insight.confidence} className="h-2" />
        </div>

        {/* Metrics Display */}
        {insight.metrics && (
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current vs Target</span>
              {TrendIcon && <TrendIcon className="h-4 w-4 text-muted-foreground" />}
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="text-center">
                <div className="text-lg font-bold">{insight.metrics.current}</div>
                <div className="text-xs text-muted-foreground">Current</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-primary">{insight.metrics.target}</div>
                <div className="text-xs text-muted-foreground">Target {insight.metrics.unit}</div>
              </div>
            </div>
          </div>
        )}

        {/* Evidence */}
        <div className="text-xs space-y-1">
          <div className="font-medium text-muted-foreground">Evidence Base:</div>
          <div className="text-muted-foreground">
            {insight.evidence.dataPoints} data points over {insight.evidence.timeFrame}
          </div>
          <div className="text-muted-foreground">
            Sources: {insight.evidence.sources.join(', ')}
          </div>
        </div>

        {/* Recommendation */}
        {insight.recommendation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
            <div className="font-medium text-blue-900 text-sm">
              Recommended Action
            </div>
            <p className="text-sm text-blue-800">
              {insight.recommendation.action}
            </p>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-700">
                Success Probability: {insight.recommendation.successProbability}%
              </span>
              <Progress 
                value={insight.recommendation.successProbability} 
                className="w-16 h-1" 
              />
            </div>
            
            <p className="text-xs text-blue-700">
              Expected: {insight.recommendation.expectedOutcome}
            </p>
            
            <div className="flex gap-2 mt-3">
              <Button 
                size="sm" 
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => onActionClick?.(insight)}
              >
                Apply Action
              </Button>
              {insight.recommendation.researchLink && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="px-2"
                  asChild
                >
                  <a 
                    href={insight.recommendation.researchLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}