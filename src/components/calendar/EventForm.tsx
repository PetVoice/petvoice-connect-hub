import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, MapPin, Users, DollarSign } from 'lucide-react';
import { CalendarEvent, EVENT_CATEGORIES, RECURRING_PATTERNS, EVENT_STATUS } from '@/types/calendar';
import { format } from 'date-fns';

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  event?: CalendarEvent | null;
  onSave: (data: any) => void;
  petId: string;
  userId: string;
  initialDate?: string;
}

export const EventForm: React.FC<EventFormProps> = ({
  isOpen,
  onClose,
  event,
  onSave,
  petId,
  userId,
  initialDate
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: 'other',
    start_time: '',
    end_time: '',
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
        category: event?.category || 'other',
        start_time: event?.start_time || (initialDate ? `${initialDate}T09:00` : format(new Date(), 'yyyy-MM-dd\'T\'HH:mm')),
        end_time: event?.end_time || '',
        is_all_day: event?.is_all_day || false,
        recurring_pattern: event?.recurring_pattern || 'none',
        attendees: event?.attendees || [],
        cost: event?.cost || null,
        status: event?.status || 'scheduled',
        notes: event?.notes || ''
      });
    }
  }, [event, initialDate, isOpen]);

  const handleSave = () => {
    const data = {
      ...formData,
      pet_id: petId,
      user_id: userId,
      end_time: formData.is_all_day ? null : formData.end_time || null,
      cost: formData.cost ? Number(formData.cost) : null
    };
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto shadow-elegant">
        <DialogHeader>
          <DialogTitle>
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
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EVENT_CATEGORIES).map(([key, category]) => (
                    <SelectItem key={key} value={key}>
                      {category.icon} {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <div>
                <Label htmlFor="start_time">
                  {formData.is_all_day ? 'Data' : 'Data e ora inizio'}
                </Label>
                <Input
                  id="start_time"
                  type={formData.is_all_day ? 'date' : 'datetime-local'}
                  value={formData.is_all_day ? formData.start_time.split('T')[0] : formData.start_time}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    start_time: formData.is_all_day ? `${e.target.value}T00:00` : e.target.value 
                  }))}
                />
              </div>

              {!formData.is_all_day && (
                <div>
                  <Label htmlFor="end_time">Data e ora fine</Label>
                  <Input
                    id="end_time"
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                  />
                </div>
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
              <Input
                id="location"
                placeholder="Dove si svolge..."
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
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
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button onClick={handleSave} className="gradient-cosmic text-white">
              <Save className="h-4 w-4 mr-2" />
              {event ? 'Aggiorna Evento' : 'Crea Evento'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};