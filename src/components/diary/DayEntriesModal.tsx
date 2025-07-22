import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Trash2, Edit3, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { DiaryEntry, DayEntriesModalState, MOOD_LABELS } from '@/types/diary';

interface DayEntriesModalProps {
  modalState: DayEntriesModalState;
  onClose: () => void;
  onNewEntry: (date: Date) => void;
  onEditEntry: (entry: DiaryEntry) => void;
  onDeleteAll?: (date: Date) => void;
}

export const DayEntriesModal: React.FC<DayEntriesModalProps> = ({
  modalState,
  onClose,
  onNewEntry,
  onEditEntry,
  onDeleteAll
}) => {
  const { open, date, entries } = modalState;

  const getMoodColor = (moodScore: number | null) => {
    if (!moodScore) return 'bg-gray-300';
    if (moodScore <= 3) return 'bg-red-500';
    if (moodScore <= 5) return 'bg-yellow-500';
    if (moodScore <= 7) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Voci del {format(date, 'dd MMMM yyyy', { locale: it })}
          </DialogTitle>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {entries.length} {entries.length === 1 ? 'voce trovata' : 'voci trovate'}
            </span>
            <div className="flex gap-2">
              {entries.length > 0 && onDeleteAll && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeleteAll(date)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Elimina Tutte
                </Button>
              )}
              <Button
                size="sm"
                variant="default"
                onClick={() => {
                  onNewEntry(date);
                  onClose();
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuova Voce
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          {entries.map((entry) => (
            <Card 
              key={entry.id} 
              className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                onClose();
                onEditEntry(entry);
              }}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">
                        {entry.title || 'Senza titolo'}
                      </h3>
                      <div
                        className={`w-3 h-3 rounded-full ${getMoodColor(entry.mood_score)}`}
                        title={`Umore: ${entry.mood_score ? MOOD_LABELS[entry.mood_score as keyof typeof MOOD_LABELS] : 'Non specificato'}`}
                      />
                    </div>
                    {entry.content && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {entry.content}
                      </p>
                    )}
                    
                    {entry.behavioral_tags && entry.behavioral_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {entry.behavioral_tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {entry.behavioral_tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{entry.behavioral_tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {entry.mood_score && (
                        <span>
                          Umore: {MOOD_LABELS[entry.mood_score as keyof typeof MOOD_LABELS]}
                        </span>
                      )}
                      {entry.weather_condition && (
                        <span>Meteo: {entry.weather_condition}</span>
                      )}
                      {entry.temperature && (
                        <span>Temp: {entry.temperature}°C</span>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                      onEditEntry(entry);
                    }}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {entries.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nessuna voce per questo giorno</h3>
              <p className="text-muted-foreground mb-4">
                Inizia creando la prima voce per il {format(date, 'dd MMMM yyyy', { locale: it })}
              </p>
              <Button
                variant="default"
                onClick={() => {
                  onNewEntry(date);
                  onClose();
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Crea Nuova Voce
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};