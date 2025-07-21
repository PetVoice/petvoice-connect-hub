import React, { useState } from 'react';
import { Upload, Brain, Clock, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadSection } from './UploadSection';
import { ResultsSection } from './ResultsSection';
import { HistorySection } from './HistorySection';
import { PredictionsSection } from './PredictionsSection';
import { useAnalysisActions } from '../hooks/useAnalysisActions';
import { AnalysisData } from '../hooks/useAnalysisData';

interface AnalysisTabsProps {
  analyses: AnalysisData[];
  filteredAnalyses: AnalysisData[];
  filters: any;
  onFiltersChange: (newFilters: any) => void;
  onClearFilters: () => void;
  loading: boolean;
  petId: string;
  onDataRefresh: () => void;
}

export const AnalysisTabs: React.FC<AnalysisTabsProps> = ({
  analyses,
  filteredAnalyses,
  filters,
  onFiltersChange,
  onClearFilters,
  loading,
  petId,
  onDataRefresh
}) => {
  const [activeTab, setActiveTab] = useState('upload');
  
  const {
    processing,
    handleFileUpload,
    handleRecordingComplete,
    handleStartRecording
  } = useAnalysisActions(petId, () => {
    onDataRefresh();
    setActiveTab('results');
  });

  const handleUploadClick = () => {
    setActiveTab('upload');
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="upload" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Nuova Analisi
        </TabsTrigger>
        <TabsTrigger value="results" className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          Risultati
        </TabsTrigger>
        <TabsTrigger value="history" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Cronologia
        </TabsTrigger>
        <TabsTrigger value="predictions" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Previsioni
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upload" className="space-y-8">
        <UploadSection
          onFileUpload={handleFileUpload}
          onRecordingComplete={handleRecordingComplete}
          onStartRecording={handleStartRecording}
          processing={processing}
          onDataRefresh={onDataRefresh}
        />
      </TabsContent>

      <TabsContent value="results" className="space-y-6">
        <ResultsSection
          analyses={analyses}
          petName="Pet" // This should come from pet context
          onUploadClick={handleUploadClick}
        />
      </TabsContent>

      <TabsContent value="history" className="space-y-6">
        <HistorySection
          analyses={analyses}
          filteredAnalyses={filteredAnalyses}
          filters={filters}
          onFiltersChange={onFiltersChange}
          onClearFilters={onClearFilters}
        />
      </TabsContent>

      <TabsContent value="predictions" className="space-y-6">
        <PredictionsSection
          analyses={analyses}
          diaryData={[]} // These should come from the data hook
          healthData={[]}
          wellnessData={[]}
        />
      </TabsContent>
    </Tabs>
  );
};