import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Eye } from 'lucide-react';

interface DiaryHeaderProps {
  petName: string;
  onNewEntry: () => void;
  onToggleLegend: () => void;
  showLegend: boolean;
}

export const DiaryHeader: React.FC<DiaryHeaderProps> = ({
  petName,
  onNewEntry,
  onToggleLegend,
  showLegend
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          Diario
        </h1>
        <p className="text-muted-foreground">
          Traccia le esperienze quotidiane e l'umore di {petName}
        </p>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleLegend}
        >
          <Eye className="h-4 w-4 mr-2" />
          Legenda
        </Button>
        
        <Button onClick={onNewEntry} variant="default">
          <Plus className="h-4 w-4 mr-2" />
          Nuova Voce
        </Button>
      </div>
    </div>
  );
};