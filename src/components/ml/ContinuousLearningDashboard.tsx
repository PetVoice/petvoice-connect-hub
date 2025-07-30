import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearningInsights } from './LearningInsights';
import { usePets } from '@/contexts/PetContext';
import { Brain, Zap, TrendingUp } from 'lucide-react';

export const ContinuousLearningDashboard: React.FC = () => {
  const { selectedPet } = usePets();

  if (!selectedPet) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-muted-foreground">Seleziona un animale per vedere i dati di apprendimento</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Sistema di Apprendimento Continuo
          </CardTitle>
          <CardDescription>
            L'IA migliora costantemente le predizioni basandosi sui tuoi feedback e sui pattern comportamentali di {selectedPet.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Zap className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-semibold">Feedback Automatico</h3>
                <p className="text-sm text-muted-foreground">
                  Raccoglie e analizza i tuoi feedback
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold">Pattern Recognition</h3>
                <p className="text-sm text-muted-foreground">
                  Identifica pattern comportamentali ricorrenti
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Brain className="h-8 w-8 text-purple-500" />
              <div>
                <h3 className="font-semibold">Predizioni Migliorate</h3>
                <p className="text-sm text-muted-foreground">
                  Modelli sempre più accurati nel tempo
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Insights */}
      <LearningInsights petId={selectedPet.id} />

      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle>Come Funziona l'Apprendimento Continuo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold mb-1">1. Raccolta Dati</h3>
              <p className="text-sm text-muted-foreground">
                Analizza comportamenti e feedback
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl mb-2">🔍</div>
              <h3 className="font-semibold mb-1">2. Pattern Detection</h3>
              <p className="text-sm text-muted-foreground">
                Identifica pattern ricorrenti
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl mb-2">🧠</div>
              <h3 className="font-semibold mb-1">3. Model Training</h3>
              <p className="text-sm text-muted-foreground">
                Riaddestra i modelli AI
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-semibold mb-1">4. Predizioni Migliori</h3>
              <p className="text-sm text-muted-foreground">
                Accuratezza sempre maggiore
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Suggerimento</h4>
            <p className="text-sm text-blue-800">
              Più feedback fornisci sulle analisi, migliore diventerà l'accuratezza delle predizioni per {selectedPet.name}. 
              Ogni feedback aiuta l'IA a comprendere meglio il comportamento unico del tuo animale.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};