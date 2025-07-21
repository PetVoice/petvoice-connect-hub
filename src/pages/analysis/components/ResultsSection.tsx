import React from 'react';
import { Brain, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AnalysisResults from '@/components/analysis/AnalysisResults';
import { AnalysisData } from '../hooks/useAnalysisData';

interface ResultsSectionProps {
  analyses: AnalysisData[];
  petName: string;
  onUploadClick: () => void;
}

const NoAnalysisState: React.FC<{ onUploadClick: () => void }> = ({ onUploadClick }) => (
  <Card className="text-center p-8">
    <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
    <h3 className="text-lg font-semibold mb-2">Nessuna Analisi Disponibile</h3>
    <p className="text-muted-foreground mb-4">
      Carica il primo file audio o video per iniziare
    </p>
    <Button onClick={onUploadClick} className="gradient-coral text-white">
      <Upload className="h-4 w-4 mr-2" />
      Inizia Prima Analisi
    </Button>
  </Card>
);

export const ResultsSection: React.FC<ResultsSectionProps> = ({
  analyses,
  petName,
  onUploadClick
}) => {
  if (analyses.length === 0) {
    return <NoAnalysisState onUploadClick={onUploadClick} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Risultati Recenti</h2>
        {analyses.length > 3 && (
          <Button variant="outline" size="sm">
            Vedi Tutti
          </Button>
        )}
      </div>
      
      <AnalysisResults 
        analyses={analyses.slice(0, 3)} 
        petName={petName}
      />
    </div>
  );
};