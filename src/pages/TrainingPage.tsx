import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AITrainingHub } from '@/components/training/AITrainingHub';
import { useTrainingProtocols, useActiveProtocols, useCompletedProtocols } from '@/hooks/useTrainingProtocols';
import { Brain, Target, TrendingUp, Clock, Award, Users } from 'lucide-react';

const TrainingPage: React.FC = () => {
  const { data: protocols, isLoading: protocolsLoading } = useTrainingProtocols(); // Pubblici
  const { data: activeProtocols, isLoading: activeLoading } = useActiveProtocols(); // Attivi dell'utente
  const { data: completedProtocols, isLoading: completedLoading } = useCompletedProtocols(); // Completati dell'utente

  // Calculate real statistics usando i hook separati
  const activeProtocolsCount = activeProtocols?.length || 0;
  const completedProtocolsCount = completedProtocols?.length || 0;
  const publicProtocolsCount = protocols?.length || 0;
  const averageSuccessRate = completedProtocols?.length > 0 
    ? Math.round(completedProtocols.reduce((sum, p) => sum + p.success_rate, 0) / completedProtocols.length) 
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Brain className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            AI Training Protocols
          </h1>
          <p className="text-muted-foreground mt-1">
            Protocolli di addestramento personalizzati con intelligenza artificiale
          </p>
        </div>
      </div>


      {/* AI Training Hub */}
      <AITrainingHub />
    </div>
  );
};

export default TrainingPage;