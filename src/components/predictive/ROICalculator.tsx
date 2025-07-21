import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, TrendingUp, TrendingDown } from 'lucide-react';

interface ROICalculatorProps {
  petId?: string;
}

export const ROICalculator: React.FC<ROICalculatorProps> = ({ petId }) => {
  const [selectedApproach, setSelectedApproach] = useState<string>('');
  const [customCost, setCustomCost] = useState<string>('');
  const [timeHorizon, setTimeHorizon] = useState<string>('30');
  const [calculatedROI, setCalculatedROI] = useState<number | null>(null);

  // Mock data per la demo - in futuro verrà dalle care_approach_predictions
  const mockApproaches = [
    {
      id: '1',
      approach_name: 'Training Comportamentale',
      estimated_cost: 150,
      roi_score: 75.5,
      confidence_level: 0.85,
      time_horizon_days: 30,
      predicted_benefits: {
        'anxiety_reduction': '60%',
        'behavior_improvement': '70%'
      }
    },
    {
      id: '2', 
      approach_name: 'Terapia Nutrizionale',
      estimated_cost: 80,
      roi_score: 60.2,
      confidence_level: 0.70,
      time_horizon_days: 60,
      predicted_benefits: {
        'energy_increase': '50%',
        'weight_management': '80%'
      }
    }
  ];

  const predefinedApproaches = [
    { name: 'Training Comportamentale', baseCost: 150 },
    { name: 'Terapia Farmacologica', baseCost: 80 },
    { name: 'Dieta Specializzata', baseCost: 60 },
    { name: 'Fisioterapia', baseCost: 200 },
    { name: 'Consulenza Veterinaria', baseCost: 100 }
  ];

  const handleCalculate = () => {
    if (!selectedApproach) return;

    const cost = customCost ? parseFloat(customCost) : 
      predefinedApproaches.find(a => a.name === selectedApproach)?.baseCost || 0;
    
    // Calcolo ROI semplificato per demo
    const baseROI = Math.random() * 100 - 20; // ROI tra -20% e +80%
    setCalculatedROI(Math.round(baseROI * 10) / 10);
  };

  const getROIColor = (roiScore: number) => {
    if (roiScore > 20) return 'text-emerald-600 bg-emerald-50';
    if (roiScore > 0) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getROIIcon = (roiScore: number) => {
    return roiScore > 0 ? TrendingUp : TrendingDown;
  };

  return (
    <div className="space-y-6">
      {/* Calculator Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calcolatore ROI - Ritorno sull'Investimento
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Approach Selection */}
            <div className="space-y-2">
              <Label htmlFor="approach">Approccio Terapeutico</Label>
              <Select value={selectedApproach} onValueChange={setSelectedApproach}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un approccio" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedApproaches.map(approach => (
                    <SelectItem key={approach.name} value={approach.name}>
                      {approach.name} (€{approach.baseCost})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Cost */}
            <div className="space-y-2">
              <Label htmlFor="cost">Costo Personalizzato (€)</Label>
              <Input
                id="cost"
                type="number"
                placeholder="Lascia vuoto per costo standard"
                value={customCost}
                onChange={(e) => setCustomCost(e.target.value)}
              />
            </div>

            {/* Time Horizon */}
            <div className="space-y-2">
              <Label htmlFor="timeHorizon">Orizzonte Temporale (giorni)</Label>
              <Select value={timeHorizon} onValueChange={setTimeHorizon}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">1 Settimana</SelectItem>
                  <SelectItem value="30">1 Mese</SelectItem>
                  <SelectItem value="90">3 Mesi</SelectItem>
                  <SelectItem value="180">6 Mesi</SelectItem>
                  <SelectItem value="365">1 Anno</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Calculate Button */}
            <div className="flex items-end">
              <Button 
                onClick={handleCalculate}
                disabled={!selectedApproach}
                className="w-full"
              >
                Calcola ROI
              </Button>
            </div>
          </div>

          {/* Calculated Result */}
          {calculatedROI !== null && (
            <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">ROI Stimato:</span>
                <Badge className={getROIColor(calculatedROI)}>
                  {calculatedROI > 0 ? '+' : ''}{calculatedROI}%
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Predictions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Analisi ROI Predittive</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockApproaches.map(approach => {
            const ROIIcon = getROIIcon(approach.roi_score);
            
            return (
              <Card key={approach.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{approach.approach_name}</CardTitle>
                    <Badge className={getROIColor(approach.roi_score)}>
                      <ROIIcon className="h-3 w-3 mr-1" />
                      {approach.roi_score > 0 ? '+' : ''}{approach.roi_score}%
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Cost and Timeline */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Costo</p>
                      <p className="font-medium">€{approach.estimated_cost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Durata</p>
                      <p className="font-medium">{approach.time_horizon_days} giorni</p>
                    </div>
                  </div>

                  {/* Confidence */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Confidenza</span>
                      <span>{Math.round(approach.confidence_level * 100)}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${approach.confidence_level * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Benefits */}
                  {approach.predicted_benefits && Object.keys(approach.predicted_benefits).length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Benefici Previsti</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(approach.predicted_benefits).map(([key, value]) => (
                          <Badge key={key} variant="secondary" className="text-xs">
                            {key}: {String(value)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
