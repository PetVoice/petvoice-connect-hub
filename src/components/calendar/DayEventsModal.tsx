import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Calendar, Plus, Trash2, Edit3, Clock, MapPin, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { CalendarEvent, EVENT_CATEGORIES, DayEventsModalState } from '@/types/calendar';

interface DayEventsModalProps {
  modalState: DayEventsModalState;
  onClose: () => void;
  onNewEvent: (date: Date) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onDeleteMultiple: (eventIds: string[]) => void;
}

export const DayEventsModal: React.FC<DayEventsModalProps> = ({
  modalState,
  onClose,
  onNewEvent,
  onEditEvent,
  onDeleteEvent,
  onDeleteMultiple
}) => {
  const { open, date, events } = modalState;
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'single' | 'multiple'>('single');
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  const handleSelectEvent = (eventId: string, checked: boolean) => {
    setSelectedEvents(prev => 
      checked 
        ? [...prev, eventId]
        : prev.filter(id => id !== eventId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedEvents(checked ? events.map(event => event.id) : []);
  };

  const handleDeleteSingle = (eventId: string) => {
    setEventToDelete(eventId);
    setDeleteMode('single');
    setShowDeleteConfirm(true);
  };

  const handleDeleteMultiple = () => {
    setDeleteMode('multiple');
    setShowDeleteConfirm(true);
  };

  const executeDelete = () => {
    if (deleteMode === 'single' && eventToDelete) {
      onDeleteEvent(eventToDelete);
      setSelectedEvents(prev => prev.filter(id => id !== eventToDelete));
    } else if (deleteMode === 'multiple') {
      onDeleteMultiple(selectedEvents);
      setSelectedEvents([]);
    }
    setShowDeleteConfirm(false);
    setEventToDelete(null);
  };

  const isAllSelected = events.length > 0 && selectedEvents.length === events.length;
  const isSomeSelected = selectedEvents.length > 0 && selectedEvents.length < events.length;

  const getCategoryInfo = (category: string) => {
    return EVENT_CATEGORIES[category as keyof typeof EVENT_CATEGORIES] || EVENT_CATEGORIES.other;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Eventi del {format(date, 'dd MMMM yyyy', { locale: it })}
            </DialogTitle>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                {events.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      className="data-[state=checked]:bg-primary"
                      {...(isSomeSelected && { 'data-indeterminate': true })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {selectedEvents.length > 0 
                        ? `${selectedEvents.length} selezionat${selectedEvents.length === 1 ? 'o' : 'i'}`
                        : 'Seleziona tutti'
                      }
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {selectedEvents.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteMultiple}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Elimina {selectedEvents.length === 1 ? 'Evento' : `${selectedEvents.length} Eventi`}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => {
                    onNewEvent(date);
                    onClose();
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuovo Evento
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-4 mt-6">
            {events.map((event) => {
              const categoryInfo = getCategoryInfo(event.category);
              return (
                <Card 
                  key={event.id} 
                  className={`shadow-sm hover:shadow-md transition-all cursor-pointer ${
                    selectedEvents.includes(event.id) ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => {
                    onClose();
                    onEditEvent(event);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedEvents.includes(event.id)}
                        onCheckedChange={(checked) => handleSelectEvent(event.id, checked as boolean)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 data-[state=checked]:bg-primary"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{categoryInfo.icon}</span>
                          <h3 className="font-medium">
                            {event.title || 'Senza titolo'}
                          </h3>
                          <Badge variant="secondary" className={`text-xs ${categoryInfo.color}`}>
                            {categoryInfo.label}
                          </Badge>
                        </div>

                        {event.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {event.is_all_day 
                                ? 'Tutto il giorno'
                                : `${format(new Date(event.start_time), 'HH:mm')} - ${format(new Date(event.end_time), 'HH:mm')}`
                              }
                            </span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{event.location}</span>
                            </div>
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
                            onEditEvent(event);
                          }}
                          className="h-8"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSingle(event.id);
                          }}
                          className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {events.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nessun evento per questo giorno</h3>
                <p className="text-muted-foreground mb-4">
                  Inizia creando il primo evento per il {format(date, 'dd MMMM yyyy', { locale: it })}
                </p>
                <Button
                  variant="default"
                  onClick={() => {
                    onNewEvent(date);
                    onClose();
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crea Nuovo Evento
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Delete */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteMode === 'single' 
                ? `Sei sicuro di voler eliminare questo evento? Questa azione non può essere annullata.`
                : `Sei sicuro di voler eliminare ${selectedEvents.length} ${selectedEvents.length === 1 ? 'evento' : 'eventi'}? Questa azione non può essere annullata.`
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