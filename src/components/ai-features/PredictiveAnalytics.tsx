import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Clock, 
  Activity,
  Heart,
  Brain,
  Shield,
  Zap,
  Calendar,
  BarChart3,
  ArrowUp,
  ArrowDown,
  ArrowRight
} from 'lucide-react';

interface BehaviorForecast {
  id: string;
  timeframe: '24h' | '48h' | '1w';
  prediction: string;
  confidence: number;
  probability: number;
  triggers: string[];
  recommendations: string[];
  severity: 'low' | 'medium' | 'high';
}

interface HealthRisk {
  id: string;
  riskType: string;
  riskLevel: number;
  timeToOnset: string;
  indicators: string[];
  preventionScore: number;
  recommendations: string[];
  evidenceLevel: 'low' | 'medium' | 'high';
}

interface InterventionTiming {
  id: string;
  intervention: string;
  optimalTime: string;
  effectiveness: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  duration: string;
  successProbability: number;
}

interface SeasonalAdjustment {
  id: string;
  season: string;
  adjustment: string;
  impact: number;
  timeline: string;
  recommendations: string[];
  historicalData: number;
}

const mockForecasts: BehaviorForecast[] = [
  {
    id: '1',
    timeframe: '24h',
    prediction: 'Aumento probabilità episodi di ansia',
    confidence: 87,
    probability: 73,
    triggers: ['Cambiamento tempo', 'Rumore intenso', 'Assenza prolungata'],
    recommendations: [
      'Aumentare sessioni di rilassamento',
      'Evitare stimoli intensi',
      'Preparare ambiente calm'
    ],
    severity: 'medium'
  },
  {
    id: '2',
    timeframe: '48h',
    prediction: 'Comportamento iperattivo nei prossimi 2 giorni',
    confidence: 92,
    probability: 81,
    triggers: ['Energia repressa', 'Tempo instabile', 'Cambiamento routine'],
    recommendations: [
      'Aumentare attività fisica',
      'Sessioni di training mentale',
      'Mantenere routine stabile'
    ],
    severity: 'high'
  },
  {
    id: '3',
    timeframe: '1w',
    prediction: 'Miglioramento generale del comportamento',
    confidence: 78,
    probability: 85,
    triggers: ['Consolidamento training', 'Stabilità ambientale', 'Routine positiva'],
    recommendations: [
      'Continuare protocollo attuale',
      'Introdurre nuove sfide gradualmente',
      'Monitorare progressi'
    ],
    severity: 'low'
  }
];

const mockHealthRisks: HealthRisk[] = [
  {
    id: '1',
    riskType: 'Stress Cronico',
    riskLevel: 68,
    timeToOnset: '2-3 settimane',
    indicators: ['Cortisolo elevato', 'Disturbi del sonno', 'Appetito ridotto'],
    preventionScore: 84,
    recommendations: [
      'Ridurre fattori stressanti',
      'Aumentare attività relaxing',
      'Monitoraggio veterinario'
    ],
    evidenceLevel: 'high'
  },
  {
    id: '2',
    riskType: 'Problemi Digestivi',
    riskLevel: 45,
    timeToOnset: '1-2 settimane',
    indicators: ['Cambiamento dieta', 'Stress feeding', 'Ridotta attività'],
    preventionScore: 92,
    recommendations: [
      'Graduale transizione dietetica',
      'Monitoraggio sintomi',
      'Probiotici naturali'
    ],
    evidenceLevel: 'medium'
  },
  {
    id: '3',
    riskType: 'Isolamento Sociale',
    riskLevel: 52,
    timeToOnset: '1 settimana',
    indicators: ['Ritiro da interazioni', 'Ridotta playfulness', 'Apatia'],
    preventionScore: 78,
    recommendations: [
      'Socializzazione graduale',
      'Attività di gruppo',
      'Rinforzo positivo sociale'
    ],
    evidenceLevel: 'medium'
  }
];

const mockInterventions: InterventionTiming[] = [
  {
    id: '1',
    intervention: 'Sessione di Desensibilizzazione',
    optimalTime: 'Mattino presto (7:00-9:00)',
    effectiveness: 89,
    urgency: 'medium',
    duration: '20-30 minuti',
    successProbability: 82
  },
  {
    id: '2',
    intervention: 'Training Comportamentale',
    optimalTime: 'Pomeriggio (15:00-17:00)',
    effectiveness: 94,
    urgency: 'high',
    duration: '45-60 minuti',
    successProbability: 91
  },
  {
    id: '3',
    intervention: 'Terapia di Rilassamento',
    optimalTime: 'Sera (19:00-21:00)',
    effectiveness: 76,
    urgency: 'low',
    duration: '15-25 minuti',
    successProbability: 85
  }
];

const mockSeasonalAdjustments: SeasonalAdjustment[] = [
  {
    id: '1',
    season: 'Inverno',
    adjustment: 'Aumentare illuminazione e attività indoor',
    impact: 67,
    timeline: 'Prossime 8 settimane',
    recommendations: [
      'Lampade terapeutiche',
      'Giochi mentali aumentati',
      'Integrazione Vitamina D'
    ],
    historicalData: 89
  },
  {
    id: '2',
    season: 'Primavera',
    adjustment: 'Gestire allergie stagionali e iperattivazione',
    impact: 73,
    timeline: 'Prossime 6 settimane',
    recommendations: [
      'Monitoraggio allergie',
      'Controllo esposizione pollini',
      'Aumentare attività outdoor gradualmente'
    ],
    historicalData: 92
  }
];

export const PredictiveAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('forecasts');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Predictive Analytics
          </CardTitle>
          <CardDescription>
            Analisi predittiva avanzata e ottimizzazione interventi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="forecasts">Forecasting</TabsTrigger>
              <TabsTrigger value="health">Health Risks</TabsTrigger>
              <TabsTrigger value="interventions">Timing</TabsTrigger>
              <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
            </TabsList>

            <TabsContent value="forecasts" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Forecasting Comportamentale 24-48h</h3>
                </div>
                {mockForecasts.map((forecast) => (
                  <Card key={forecast.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{forecast.prediction}</h4>
                            <Badge className={getSeverityColor(forecast.severity)}>
                              {forecast.severity}
                            </Badge>
                            <Badge variant="outline">{forecast.timeframe}</Badge>
                          </div>
                          <div className="flex items-center gap-4 mb-3 text-sm">
                            <span className="flex items-center gap-1">
                              <Brain className="h-4 w-4" />
                              {forecast.confidence}% confidenza
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              {forecast.probability}% probabilità
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-medium">Trigger identificati:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {forecast.triggers.map((trigger, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {trigger}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-sm font-medium">Raccomandazioni AI:</span>
                              <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                                {forecast.recommendations.map((rec, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <Zap className="h-3 w-3" />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{forecast.probability}%</div>
                          <div className="text-xs text-muted-foreground">Probabilità</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Confidenza predizione</span>
                          <span>{forecast.confidence}%</span>
                        </div>
                        <Progress value={forecast.confidence} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="health" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Health Risk Scoring</h3>
                </div>
                {mockHealthRisks.map((risk) => (
                  <Card key={risk.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{risk.riskType}</h4>
                            <Badge className={risk.riskLevel > 60 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                              {risk.evidenceLevel} evidence
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Onset previsto: {risk.timeToOnset}
                          </p>
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-medium">Indicatori:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {risk.indicators.map((indicator, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {indicator}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-sm font-medium">Prevenzione:</span>
                              <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                                {risk.recommendations.map((rec, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <Shield className="h-3 w-3" />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${risk.riskLevel > 60 ? 'text-red-600' : 'text-yellow-600'}`}>
                            {risk.riskLevel}%
                          </div>
                          <div className="text-xs text-muted-foreground">Rischio</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Livello rischio</span>
                            <span>{risk.riskLevel}%</span>
                          </div>
                          <Progress value={risk.riskLevel} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Prevenibilità</span>
                            <span>{risk.preventionScore}%</span>
                          </div>
                          <Progress value={risk.preventionScore} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="interventions" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Ottimizzazione Timing Interventi</h3>
                </div>
                {mockInterventions.map((intervention) => (
                  <Card key={intervention.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{intervention.intervention}</h4>
                            <Badge className={getUrgencyColor(intervention.urgency)}>
                              {intervention.urgency}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mb-3 text-sm">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {intervention.optimalTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {intervention.duration}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm font-medium">Efficacia:</span>
                              <div className="flex items-center gap-2 mt-1">
                                <Progress value={intervention.effectiveness} className="flex-1 h-2" />
                                <span className="text-sm font-bold">{intervention.effectiveness}%</span>
                              </div>
                            </div>
                            <div>
                              <span className="text-sm font-medium">Probabilità successo:</span>
                              <div className="flex items-center gap-2 mt-1">
                                <Progress value={intervention.successProbability} className="flex-1 h-2" />
                                <span className="text-sm font-bold">{intervention.successProbability}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button size="sm" variant="default">
                            Programma
                          </Button>
                          <Button size="sm" variant="outline">
                            Dettagli
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="seasonal" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Aggiustamenti Stagionali</h3>
                </div>
                {mockSeasonalAdjustments.map((adjustment) => (
                  <Card key={adjustment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{adjustment.season}</h4>
                            <Badge variant="outline">{adjustment.timeline}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {adjustment.adjustment}
                          </p>
                          <div>
                            <span className="text-sm font-medium">Raccomandazioni stagionali:</span>
                            <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                              {adjustment.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <ArrowRight className="h-3 w-3" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{adjustment.impact}%</div>
                          <div className="text-xs text-muted-foreground">Impatto</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <BarChart3 className="h-4 w-4" />
                          {adjustment.historicalData}% dati storici
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          {adjustment.impact}% impatto previsto
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Early Warning System */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Early Warning:</strong> Rilevato pattern comportamentale anomalo. 
          Probabilità 78% di episodio ansioso nelle prossime 24h. Intervento preventivo consigliato.
        </AlertDescription>
      </Alert>
    </div>
  );
};