import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useUnifiedToast } from '@/hooks/use-unified-toast';
import { supabase } from '@/integrations/supabase/client';

interface Medication {
  id?: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  notes?: string;
}

interface MedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  medication?: Medication | null;
  petId: string;
  userId: string;
  onSave: () => void;
}

export const MedicationModal: React.FC<MedicationModalProps> = ({
  isOpen,
  onClose,
  medication,
  petId,
  userId,
  onSave
}) => {
  const { showSuccessToast, showErrorToast } = useUnifiedToast();
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [formData, setFormData] = useState({
    medication_name: '',
    dosage: '',
    frequency: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (medication) {
        setFormData({
          medication_name: medication.medication_name,
          dosage: medication.dosage,
          frequency: medication.frequency,
          notes: medication.notes || ''
        });
        setStartDate(new Date(medication.start_date));
        setEndDate(medication.end_date ? new Date(medication.end_date) : undefined);
      } else {
        setFormData({
          medication_name: '',
          dosage: '',
          frequency: '',
          notes: ''
        });
        setStartDate(new Date());
        setEndDate(undefined);
      }
    }
  }, [isOpen, medication]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) return;

    setLoading(true);
    try {
      const medicationData = {
        ...formData,
        pet_id: petId,
        user_id: userId,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
        is_active: true
      };

      if (medication?.id) {
        const { error } = await supabase
          .from('pet_medications')
          .update(medicationData)
          .eq('id', medication.id);

        if (error) throw error;
        showSuccessToast({
          title: 'Farmaco aggiornato',
          description: 'Le informazioni del farmaco sono state aggiornate con successo'
        });
      } else {
        const { error } = await supabase
          .from('pet_medications')
          .insert(medicationData);

        if (error) throw error;
        showSuccessToast({
          title: 'Farmaco aggiunto',
          description: 'Il nuovo farmaco è stato aggiunto con successo'
        });
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving medication:', error);
      showErrorToast({
        title: 'Errore',
        description: 'Si è verificato un errore durante il salvataggio'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {medication ? 'Modifica Farmaco' : 'Aggiungi Farmaco'}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="medication_name">Nome Farmaco *</Label>
            <Input
              id="medication_name"
              value={formData.medication_name}
              onChange={(e) => setFormData(prev => ({ ...prev, medication_name: e.target.value }))}
              placeholder="Es. Antibiotico, Antinfiammatorio..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosaggio *</Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                placeholder="Es. 50mg, 1 compressa..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequenza *</Label>
              <Input
                id="frequency"
                value={formData.frequency}
                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                placeholder="Es. 2 volte al giorno, ogni 8h..."
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Inizio *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'dd/MM/yyyy') : "Seleziona data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data Fine (opzionale)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'dd/MM/yyyy') : "Nessuna scadenza"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="pointer-events-auto"
                    disabled={(date) => startDate ? date < startDate : false}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Note (opzionale)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Note aggiuntive sul farmaco, istruzioni particolari..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : medication ? 'Aggiorna' : 'Aggiungi'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};