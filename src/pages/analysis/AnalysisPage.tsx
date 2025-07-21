import React from 'react';
import { usePets } from '@/contexts/PetContext';
import { useAnalysisData } from './hooks/useAnalysisData';
import { useAnalysisFilters } from './hooks/useAnalysisFilters';
import { AnalysisHeader } from './components/AnalysisHeader';
import { AnalysisTabs } from './components/AnalysisTabs';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NoPetSelected: React.FC = () => (
  <div className="container mx-auto p-6 max-w-2xl">
    <Card className="text-center p-8">
      <PawPrint className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
      <h2 className="text-xl font-semibold mb-2">Nessun Pet Selezionato</h2>
      <p className="text-muted-foreground mb-6">
        Seleziona un pet dal menu principale per iniziare l'analisi emotiva.
      </p>
      <Button variant="outline" onClick={() => window.history.back()}>
        Torna Indietro
      </Button>
    </Card>
  </div>
);

const ErrorState: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="container mx-auto p-6 max-w-2xl">
    <Card className="text-center p-8">
      <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4 opacity-50" />
      <h2 className="text-xl font-semibold mb-2 text-red-600">Errore di Caricamento</h2>
      <p className="text-muted-foreground mb-6">{error}</p>
      <Button onClick={onRetry} variant="outline">
        Riprova
      </Button>
    </Card>
  </div>
);

const LoadingSkeleton: React.FC = () => (
  <div className="container mx-auto p-6 max-w-7xl space-y-6">
    <div className="animate-pulse">
      <div className="h-20 bg-muted rounded-lg mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-muted rounded-lg" />
        ))}
      </div>
      <div className="h-96 bg-muted rounded-lg" />
    </div>
  </div>
);

export const AnalysisPage: React.FC = () => {
  const { selectedPet } = usePets();
  const { 
    analyses, 
    diaryData,
    healthData,
    wellnessData,
    loading, 
    error,
    refreshData 
  } = useAnalysisData(selectedPet?.id);
  
  const {
    filteredAnalyses,
    filters,
    updateFilters,
    clearFilters
  } = useAnalysisFilters(analyses);

  if (!selectedPet) {
    return <NoPetSelected />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refreshData} />;
  }

  if (loading && analyses.length === 0) {
    return <LoadingSkeleton />;
  }

  const averageConfidence = analyses.length > 0 
    ? analyses.reduce((sum, a) => sum + a.primary_confidence, 0) / analyses.length 
    : 0;

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <AnalysisHeader 
        petName={selectedPet.name}
        analysesCount={analyses.length}
        averageConfidence={averageConfidence}
        lastEmotion={analyses[0]?.primary_emotion}
      />
      
      <AnalysisTabs
        analyses={analyses}
        filteredAnalyses={filteredAnalyses}
        filters={filters}
        onFiltersChange={updateFilters}
        onClearFilters={clearFilters}
        loading={loading}
        petId={selectedPet.id}
        onDataRefresh={refreshData}
      />
    </div>
  );
};

export default AnalysisPage;