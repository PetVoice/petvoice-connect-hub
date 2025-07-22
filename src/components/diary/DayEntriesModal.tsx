import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar, Plus, Trash2, Edit3, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { DiaryEntry, DayEntriesModalState, MOOD_LABELS } from '@/types/diary';

interface DayEntriesModalProps {
  modalState: DayEntriesModalState;
  onClose: () => void;
  onNewEntry: (date: Date) => void;
  onEditEntry: (entry: DiaryEntry) => void;
  onDeleteEntry: (entryId: string) => void;
  onDeleteMultiple: (entryIds: string[]) => void;
}

export const DayEntriesModal: React.FC<DayEntriesModalProps> = ({
  modalState,
  onClose,
  onNewEntry,
  onEditEntry,
  onDeleteEntry,
  onDeleteMultiple
}) => {
  const { open, date, entries } = modalState;
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'single' | 'multiple'>('single');
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  const handleSelectEntry = (entryId: string, checked: boolean) => {
    setSelectedEntries(prev => 
      checked 
        ? [...prev, entryId]
        : prev.filter(id => id !== entryId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedEntries(checked ? entries.map(entry => entry.id) : []);
  };

  const handleDeleteSingle = (entryId: string) => {
    setEntryToDelete(entryId);
    setDeleteMode('single');
    setShowDeleteConfirm(true);
  };

  const handleDeleteMultiple = () => {
    setDeleteMode('multiple');
    setShowDeleteConfirm(true);
  };

  const executeDelete = () => {
    if (deleteMode === 'single' && entryToDelete) {
      onDeleteEntry(entryToDelete);
      setSelectedEntries(prev => prev.filter(id => id !== entryToDelete));
    } else if (deleteMode === 'multiple') {
      onDeleteMultiple(selectedEntries);
      setSelectedEntries([]);
    }
    setShowDeleteConfirm(false);
    setEntryToDelete(null);
  };

  const isAllSelected = entries.length > 0 && selectedEntries.length === entries.length;
  const isSomeSelected = selectedEntries.length > 0 && selectedEntries.length < entries.length;

  const getMoodColor = (moodScore: number | null) => {
    if (!moodScore) return 'bg-gray-300';
    if (moodScore <= 3) return 'bg-red-500';
    if (moodScore <= 5) return 'bg-yellow-500';
    if (moodScore <= 7) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <>
      <Dialog open={open} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Voci del {format(date, 'dd MMMM yyyy', { locale: it })}
            </DialogTitle>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                {entries.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      className="data-[state=checked]:bg-primary"
                      {...(isSomeSelected && { 'data-indeterminate': true })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {selectedEntries.length > 0 
                        ? `${selectedEntries.length} selezionat${selectedEntries.length === 1 ? 'a' : 'e'}`
                        : `${entries.length} ${entries.length === 1 ? 'voce trovata' : 'voci trovate'}`
                      }
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {selectedEntries.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteMultiple}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Elimina {selectedEntries.length === 1 ? 'Voce' : `${selectedEntries.length} Voci`}
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
                className={`shadow-sm hover:shadow-md transition-all cursor-pointer ${
                  selectedEntries.includes(entry.id) ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => {
                  onClose();
                  onEditEntry(entry);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedEntries.includes(entry.id)}
                      onCheckedChange={(checked) => handleSelectEntry(entry.id, checked as boolean)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 data-[state=checked]:bg-primary"
                    />
                    
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
                        {entry.weather_condition && entry.weather_condition !== 'nessuna' && (
                          <span>Meteo: {entry.weather_condition}</span>
                        )}
                        {entry.temperature && (
                          <span>Temp: {entry.temperature}°C</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose();
                          onEditEntry(entry);
                        }}
                        className="h-8"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                            className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
                            <AlertDialogDescription>
                              Sei sicuro di voler eliminare la voce "{entry.title || 'Senza titolo'}"? 
                              Questa azione non può essere annullata.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annulla</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSingle(entry.id);
                              }}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Elimina
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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

      {/* Confirmation Dialog for Multiple Delete */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteMode === 'single' 
                ? `Sei sicuro di voler eliminare questa voce? Questa azione non può essere annullata.`
                : `Sei sicuro di voler eliminare ${selectedEntries.length} ${selectedEntries.length === 1 ? 'voce' : 'voci'}? Questa azione non può essere annullata.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)}>
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};