import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Brain, TrendingUp, Calendar, CheckCircle, X } from 'lucide-react';
import { RiskScoreGauge } from './RiskScoreGauge';
import { PredictionChart } from './PredictionChart';
import { InterventionCard } from './InterventionCard';
import { EarlyWarningAlert } from './EarlyWarningAlert';
import { ROICalculator } from './ROICalculator';
import { usePredictiveAnalytics } from '@/hooks/usePredictiveAnalytics';

interface PredictiveAnalyticsSectionProps {
  petId?: string;
}

export const PredictiveAnalyticsSection: React.FC<PredictiveAnalyticsSectionProps> = ({ 
  petId 
}) => {
  const {
    behaviorPredictions,
    riskAssessments,
    earlyWarnings,
    interventions,
    loading,
    error,
    acknowledgeWarning,
    scheduleIntervention,
    dismissIntervention,
    getLatestRiskAssessment,
    getActivePredictions,
    getCriticalWarnings,
    refreshData
  } = usePredictiveAnalytics(petId);

  const latestRisk = getLatestRiskAssessment(petId);
  const activePredictions = getActivePredictions(petId);
  const criticalWarnings = getCriticalWarnings(petId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Analisi Predittive</h2>
          <p className="text-muted-foreground">
            Previsioni comportamentali e raccomandazioni AI per il benessere del tuo pet
          </p>
        </div>
        <Button onClick={refreshData} variant="outline" size="sm">
          <TrendingUp className="h-4 w-4 mr-2" />
          Aggiorna Dati
        </Button>
      </div>

      {/* Critical Warnings */}
      {criticalWarnings.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-destructive flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Avvisi Critici ({criticalWarnings.length})
          </h3>
          {criticalWarnings.map((warning) => (
            <EarlyWarningAlert
              key={warning.id}
              warning={warning}
              onAcknowledge={() => acknowledgeWarning(warning.id)}
            />
          ))}
        </div>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="predictions">Previsioni</TabsTrigger>
          <TabsTrigger value="interventions">Interventi</TabsTrigger>
          <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Risk Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Punteggio di Rischio
                </CardTitle>
                <CardDescription>
                  Valutazione generale del rischio per la salute
                </CardDescription>
              </CardHeader>
              <CardContent>
                {latestRisk ? (
                  <RiskScoreGauge score={latestRisk.overall_risk_score} />
                ) : (
                  <div className="text-center p-4 text-muted-foreground">
                    Nessun dato di rischio disponibile
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Predictions Count */}
            <Card>
              <CardHeader>
                <CardTitle>Previsioni Attive</CardTitle>
                <CardDescription>
                  Previsioni comportamentali per i prossimi giorni
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {activePredictions.length}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {activePredictions.length > 0 
                    ? "Previsioni disponibili per i prossimi giorni"
                    : "Nessuna previsione attiva"
                  }
                </p>
              </CardContent>
            </Card>

            {/* Pending Interventions */}
            <Card>
              <CardHeader>
                <CardTitle>Interventi Raccomandati</CardTitle>
                <CardDescription>
                  Azioni suggerite dal sistema AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">
                  {interventions.filter(i => i.status === 'pending').length}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  In attesa di programmazione
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Attività Recente</CardTitle>
              <CardDescription>
                Panoramica delle analisi e raccomandazioni più recenti
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {behaviorPredictions.slice(0, 3).map((prediction) => (
                  <div key={prediction.id} className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-lg">
                    <Brain className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">Nuova previsione comportamentale</p>
                      <p className="text-sm text-muted-foreground">
                        Finestra temporale: {prediction.prediction_window.replace('_', ' ')}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {prediction.prediction_date}
                    </Badge>
                  </div>
                ))}
                
                {interventions.slice(0, 2).map((intervention) => (
                  <div key={intervention.id} className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-lg">
                    <Calendar className="h-5 w-5 text-amber-600" />
                    <div className="flex-1">
                      <p className="font-medium">Raccomandazione di intervento</p>
                      <p className="text-sm text-muted-foreground">
                        {intervention.intervention_type}
                      </p>
                    </div>
                    <Badge 
                      variant={intervention.priority_level === 'high' ? 'destructive' : 'secondary'}
                    >
                      {intervention.priority_level}
                    </Badge>
                  </div>
                ))}

                {behaviorPredictions.length === 0 && interventions.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Nessuna attività recente. Il sistema sta analizzando i dati del tuo pet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          {activePredictions.length > 0 ? (
            <div className="space-y-6">
              {activePredictions.map((prediction) => (
                <PredictionChart
                  key={prediction.id}
                  prediction={prediction}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nessuna Previsione Attiva</h3>
                  <p className="text-muted-foreground mb-4">
                    Il sistema sta ancora raccogliendo dati sufficienti per generare previsioni accurate.
                  </p>
                  <Button onClick={refreshData} variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Verifica Aggiornamenti
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="interventions" className="space-y-6">
          {interventions.length > 0 ? (
            <div className="grid gap-4">
              {interventions.map((intervention) => (
                <InterventionCard
                  key={intervention.id}
                  intervention={intervention}
                  onSchedule={() => scheduleIntervention(intervention.id)}
                  onDismiss={() => dismissIntervention(intervention.id)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nessun Intervento Necessario</h3>
                  <p className="text-muted-foreground">
                    Il tuo pet sta bene! Non ci sono interventi raccomandati al momento.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="roi" className="space-y-6">
          <ROICalculator petId={petId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};