import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AITrainingHub } from '@/components/training/AITrainingHub';
import { useTrainingProtocols } from '@/hooks/useTrainingProtocols';
import { Brain, Target, TrendingUp, Clock, Award, Users } from 'lucide-react';

const TrainingPage: React.FC = () => {
  const { data: protocols, isLoading } = useTrainingProtocols();

  // Calculate real statistics
  const activeProtocols = protocols?.filter(p => p.status === 'active').length || 0;
  const completedProtocols = protocols?.filter(p => p.status === 'completed').length || 0;
  const publicProtocols = protocols?.filter(p => p.is_public).length || 0;
  const averageSuccessRate = protocols?.length > 0 
    ? Math.round(protocols.reduce((sum, p) => sum + p.success_rate, 0) / protocols.length) 
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
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