import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, MapPin, Users, DollarSign, FileText } from 'lucide-react';
import { CalendarEvent, EVENT_CATEGORIES, RECURRING_PATTERNS, EVENT_STATUS } from '@/types/calendar';
import { format } from 'date-fns';
import { useUnifiedToast } from '@/hooks/use-unified-toast';
import { UnifiedDatePicker } from '@/components/ui/unified-date-picker';
import { GooglePlacesInput } from '@/components/settings/GooglePlacesInput';

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  event?: CalendarEvent | null;
  onSave: (data: any) => void;
  petId: string;
  userId: string;
  initialDate?: string;
  preselectedCategory?: string;
}

export const EventForm: React.FC<EventFormProps> = ({
  isOpen,
  onClose,
  event,
  onSave,
  petId,
  userId,
  initialDate,
  preselectedCategory
}) => {
  const { showSuccessToast, showErrorToast } = useUnifiedToast();
  const [categoryError, setCategoryError] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: '', // Rimosso valore di default
    start_time: '', // Mantenuto per compatibilità
    end_time: '',   // Mantenuto per compatibilità
    is_all_day: false,
    recurring_pattern: 'none',
    attendees: [],
    cost: null,
    status: 'scheduled',
    notes: ''
  });

  // Reset form data when event, initialDate, or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: event?.title || '',
        description: event?.description || '',
        location: event?.location || '',
        category: event?.category || preselectedCategory || '', // Usa categoria preselezionata se disponibile
        start_time: '', // Gestito separatamente con startDate
        end_time: '',   // Gestito separatamente con endDate
        is_all_day: event?.is_all_day || false,
        recurring_pattern: event?.recurring_pattern || 'none',
        attendees: event?.attendees || [],
        cost: event?.cost || null,
        status: event?.status || 'scheduled',
        notes: event?.notes || ''
      });
      
      // Gestione delle date
      if (event?.start_time) {
        setStartDate(new Date(event.start_time));
      } else if (initialDate) {
        setStartDate(new Date(`${initialDate}T09:00`));
      } else {
        setStartDate(undefined);
      }
      
      if (event?.end_time) {
        setEndDate(new Date(event.end_time));
      } else {
        setEndDate(undefined);
      }
    }
  }, [event, initialDate, isOpen, preselectedCategory]);

  const handleSave = () => {
    // Validazione categoria obbligatoria
    if (!formData.category || formData.category.trim() === '') {
      setCategoryError('La categoria è obbligatoria');
      showErrorToast({
        title: "Campo obbligatorio",
        description: "Seleziona una categoria per l'evento"
      });
      return;
    }

    // Validazione data di inizio obbligatoria
    if (!startDate) {
      showErrorToast({
        title: "Campo obbligatorio",
        description: "Seleziona una data di inizio per l'evento"
      });
      return;
    }

    setCategoryError(''); // Reset errore

    const data = {
      ...formData,
      ...(event && event.id ? { id: event.id } : {}), // Aggiungi ID se si tratta di modifica
      pet_id: petId,
      user_id: userId,
      start_time: formData.is_all_day 
        ? format(startDate, 'yyyy-MM-dd\'T\'00:00:ss')
        : format(startDate, 'yyyy-MM-dd\'T\'HH:mm:ss'),
      end_time: formData.is_all_day ? null : (endDate ? format(endDate, 'yyyy-MM-dd\'T\'HH:mm:ss') : null),
      cost: formData.cost ? Number(formData.cost) : null
    };
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto shadow-elegant">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <FileText className="h-4 w-4 text-white" />
            </div>
            {event ? 'Modifica Evento' : 'Nuovo Evento'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titolo *</Label>
              <Input
                id="title"
                placeholder="Nome dell'evento..."
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descrizione</Label>
              <Textarea
                id="description"
                placeholder="Dettagli dell'evento..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="category" className="flex items-center gap-1">
                Categoria
                <span className="text-foreground">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, category: value }));
                  setCategoryError(''); // Reset errore quando l'utente seleziona
                }}
              >
                <SelectTrigger className={categoryError ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Seleziona una categoria..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EVENT_CATEGORIES).map(([key, category]) => (
                    <SelectItem key={key} value={key}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {categoryError && (
                <p className="text-red-500 text-sm mt-1">{categoryError}</p>
              )}
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Evento tutto il giorno</Label>
              <Switch
                checked={formData.is_all_day}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_all_day: checked }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UnifiedDatePicker
                label={formData.is_all_day ? 'Data' : 'Data inizio'}
                value={startDate}
                onChange={setStartDate}
                placeholder="Seleziona data inizio"
                required
              />

              {!formData.is_all_day && (
                <UnifiedDatePicker
                  label="Data fine (opzionale)"
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="Seleziona data fine"
                  disabled={(date) => startDate ? date < startDate : false}
                />
              )}
            </div>
          </div>

          {/* Location & Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">
                <MapPin className="h-4 w-4 inline mr-1" />
                Luogo
              </Label>
              <GooglePlacesInput
                value={formData.location}
                onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                placeholder="Inizia a digitare l'indirizzo della clinica..."
                onAddressSelect={(details) => {
                  // Salva l'indirizzo completo nel campo location
                  setFormData(prev => ({ ...prev, location: details.full_address }));
                }}
              />
            </div>

            <div>
              <Label htmlFor="cost">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Costo (€)
              </Label>
              <Input
                id="cost"
                type="number"
                placeholder="0.00"
                value={formData.cost || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  cost: e.target.value ? Number(e.target.value) : null 
                }))}
              />
            </div>
          </div>

          {/* Status & Recurring */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Stato</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EVENT_STATUS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="recurring">Ricorrenza</Label>
              <Select
                value={formData.recurring_pattern}
                onValueChange={(value) => setFormData(prev => ({ ...prev, recurring_pattern: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(RECURRING_PATTERNS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Note aggiuntive</Label>
            <Textarea
              id="notes"
              placeholder="Note private sull'evento..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>
          
          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button 
              onClick={handleSave} 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              <Save className="h-4 w-4 mr-2" />
              {event ? 'Aggiorna Evento' : 'Crea Evento'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};