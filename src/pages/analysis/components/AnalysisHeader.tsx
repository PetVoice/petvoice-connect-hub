import React from 'react';
import { Brain, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AnalysisHeaderProps {
  petName: string;
  analysesCount: number;
  averageConfidence: number;
  lastEmotion?: string;
}

const AnalysisStats: React.FC<{
  analysesCount: number;
  averageConfidence: number;
  lastEmotion?: string;
}> = ({ analysesCount, averageConfidence, lastEmotion }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card>
      <CardContent className="p-4 text-center">
        <p className="text-2xl font-bold text-primary">{analysesCount}</p>
        <p className="text-sm text-muted-foreground">Analisi Totali</p>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-4 text-center">
        <p className="text-2xl font-bold text-green-600">
          {analysesCount > 0 ? Math.round(averageConfidence) : 0}%
        </p>
        <p className="text-sm text-muted-foreground">Confidenza Media</p>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-4 text-center">
        <p className="text-2xl font-bold text-blue-600 capitalize">
          {lastEmotion || 'N/A'}
        </p>
        <p className="text-sm text-muted-foreground">Ultima Emozione</p>
      </CardContent>
    </Card>
  </div>
);

export const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({
  petName,
  analysesCount,
  averageConfidence,
  lastEmotion
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            Analisi Emotiva
          </h1>
          <p className="text-muted-foreground mt-1">
            Analizza le emozioni di {petName} con l'intelligenza artificiale
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BarChart3 className="h-4 w-4" />
          <span>Dashboard Emotiva</span>
        </div>
      </div>
      
      <AnalysisStats
        analysesCount={analysesCount}
        averageConfidence={averageConfidence}
        lastEmotion={lastEmotion}
      />
    </div>
  );
};