import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, BookOpen } from 'lucide-react';

interface CalendarHeaderProps {
  petName: string;
  onNewEvent: () => void;
  onToggleLegend: () => void;
  showLegend: boolean;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  petName,
  onNewEvent,
  onToggleLegend,
  showLegend
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calendar className="h-8 w-8 text-primary" />
          Calendario {petName}
        </h1>
        <p className="text-muted-foreground">
          Gestisci appuntamenti, visite e attività per {petName}
        </p>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleLegend}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Legenda
        </Button>
        
        <Button onClick={onNewEvent} variant="default">
          <Plus className="h-4 w-4 mr-2" />
          Nuovo Evento
        </Button>
      </div>
    </div>
  );
};