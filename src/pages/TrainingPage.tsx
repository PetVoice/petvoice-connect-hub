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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-500" />
              Protocolli Attivi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {isLoading ? '...' : activeProtocols}
            </div>
            <p className="text-xs text-muted-foreground">in corso</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 hover:border-green-500/40 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4 text-green-500" />
              Completati
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {isLoading ? '...' : completedProtocols}
            </div>
            <p className="text-xs text-muted-foreground">con successo</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Tasso di Successo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {isLoading ? '...' : `${averageSuccessRate}%`}
            </div>
            <p className="text-xs text-muted-foreground">media personale</p>
          </CardContent>
        </Card>

        <Card className="border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-500" />
              Community
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {isLoading ? '...' : publicProtocols}
            </div>
            <p className="text-xs text-muted-foreground">protocolli condivisi</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Training Hub */}
      <AITrainingHub />
    </div>
  );
};

export default TrainingPage;