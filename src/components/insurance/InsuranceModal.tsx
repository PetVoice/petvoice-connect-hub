import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '@/components/ui/file-upload';
import { CalendarIcon, CreditCard, Save } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedToast } from '@/hooks/use-unified-toast';

interface InsurancePolicy {
  id?: string;
  policy_number: string;
  provider_name: string;
  policy_type: string;
  premium_amount?: number;
  deductible_amount?: number;
  coverage_limit?: number;
  start_date: string;
  end_date: string;
  is_active?: boolean;
  coverage_details?: any;
  notes?: string;
  contract_file_url?: string;
  contract_file_name?: string;
}

interface InsurancePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy?: InsurancePolicy | null;
  petId: string;
  userId: string;
  onSave: () => void;
}

export const InsurancePolicyModal: React.FC<InsurancePolicyModalProps> = ({
  isOpen,
  onClose,
  policy,
  petId,
  userId,
  onSave
}) => {
  const { showSuccessToast, showErrorToast } = useUnifiedToast();
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  
  const [formData, setFormData] = useState<InsurancePolicy>({
    policy_number: '',
    provider_name: '',
    policy_type: 'health',
    premium_amount: undefined,
    deductible_amount: undefined,
    coverage_limit: undefined,
    start_date: '',
    end_date: '',
    notes: '',
    contract_file_url: undefined,
    contract_file_name: undefined
  });

  useEffect(() => {
    if (policy) {
      setFormData({
        id: policy.id,
        policy_number: policy.policy_number,
        provider_name: policy.provider_name,
        policy_type: policy.policy_type,
        premium_amount: policy.premium_amount,
        deductible_amount: policy.deductible_amount,
        coverage_limit: policy.coverage_limit,
        start_date: policy.start_date,
        end_date: policy.end_date,
        notes: policy.notes || '',
        contract_file_url: policy.contract_file_url,
        contract_file_name: policy.contract_file_name
      });
      setStartDate(new Date(policy.start_date));
      setEndDate(new Date(policy.end_date));
    } else {
      // Reset form for new policy
      setFormData({
        policy_number: '',
        provider_name: '',
        policy_type: 'health',
        premium_amount: undefined,
        deductible_amount: undefined,
        coverage_limit: undefined,
        start_date: '',
        end_date: '',
        notes: '',
        contract_file_url: undefined,
        contract_file_name: undefined
      });
      setStartDate(undefined);
      setEndDate(undefined);
    }
  }, [policy, isOpen]);

  const handleSave = async () => {
    if (!formData.policy_number.trim() || !formData.provider_name.trim() || !startDate || !endDate) {
      showErrorToast({
        title: 'Errore',
        description: 'Compila tutti i campi obbligatori'
      });
      return;
    }

    setLoading(true);
    try {
      const policyData = {
        policy_number: formData.policy_number.trim(),
        provider_name: formData.provider_name.trim(),
        policy_type: formData.policy_type,
        premium_amount: formData.premium_amount || null,
        deductible_amount: formData.deductible_amount || null,
        coverage_limit: formData.coverage_limit || null,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        is_active: true,
        notes: formData.notes?.trim() || null,
        contract_file_url: formData.contract_file_url || null,
        contract_file_name: formData.contract_file_name || null,
        pet_id: petId,
        user_id: userId
      };

      if (policy?.id) {
        // Update existing policy
        const { error } = await supabase
          .from('insurance_policies')
          .update(policyData)
          .eq('id', policy.id);

        if (error) throw error;
        showSuccessToast({
          title: 'Successo',
          description: 'Polizza aggiornata con successo'
        });
      } else {
        // Create new policy
        const { error } = await supabase
          .from('insurance_policies')
          .insert([policyData]);

        if (error) throw error;
        showSuccessToast({
          title: 'Successo',
          description: 'Polizza aggiunta con successo'
        });
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving policy:', error);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-white" />
            </div>
            {policy ? 'Modifica Polizza Assicurativa' : 'Aggiungi Polizza Assicurativa'}
          </DialogTitle>
          <DialogDescription>
            Inserisci i dettagli della polizza assicurativa per il tuo pet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="policy_number">Numero Polizza *</Label>
              <Input
                id="policy_number"
                value={formData.policy_number}
                onChange={(e) => setFormData(prev => ({ ...prev, policy_number: e.target.value }))}
                placeholder="Es. POL-123456789"
              />
            </div>
            
            <div>
              <Label htmlFor="provider_name">Compagnia Assicurativa *</Label>
              <Input
                id="provider_name"
                value={formData.provider_name}
                onChange={(e) => setFormData(prev => ({ ...prev, provider_name: e.target.value }))}
                placeholder="Es. Allianz, Generali..."
              />
            </div>
          </div>

          {/* Policy Type */}
          <div>
            <Label htmlFor="policy_type">Tipo di Polizza</Label>
            <Select 
              value={formData.policy_type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, policy_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona il tipo di polizza" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="health">Sanitaria</SelectItem>
                <SelectItem value="liability">Responsabilità Civile</SelectItem>
                <SelectItem value="comprehensive">Completa</SelectItem>
                <SelectItem value="accident">Infortuni</SelectItem>
                <SelectItem value="other">Altro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Financial Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="premium_amount">Premio Annuale (€)</Label>
              <Input
                id="premium_amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.premium_amount || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  premium_amount: e.target.value ? parseFloat(e.target.value) : undefined 
                }))}
                placeholder="Es. 250.00"
              />
            </div>
            
            <div>
              <Label htmlFor="deductible_amount">Franchigia (€)</Label>
              <Input
                id="deductible_amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.deductible_amount || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  deductible_amount: e.target.value ? parseFloat(e.target.value) : undefined 
                }))}
                placeholder="Es. 100.00"
              />
            </div>
            
            <div>
              <Label htmlFor="coverage_limit">Massimale (€)</Label>
              <Input
                id="coverage_limit"
                type="number"
                min="0"
                step="0.01"
                value={formData.coverage_limit || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  coverage_limit: e.target.value ? parseFloat(e.target.value) : undefined 
                }))}
                placeholder="Es. 5000.00"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Inizio *</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
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
                    onSelect={(date) => {
                      setStartDate(date);
                      setStartDateOpen(false);
                    }}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Data Scadenza *</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'dd/MM/yyyy') : "Seleziona data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date);
                      setEndDateOpen(false);
                    }}
                    initialFocus
                    className="pointer-events-auto"
                    disabled={(date) => startDate ? date < startDate : false}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Contract Upload */}
          <div>
            <FileUpload
              onFileUploaded={(url, fileName) => {
                setFormData(prev => ({ 
                  ...prev, 
                  contract_file_url: url,
                  contract_file_name: fileName
                }));
              }}
              onFileRemoved={() => {
                setFormData(prev => ({ 
                  ...prev, 
                  contract_file_url: undefined,
                  contract_file_name: undefined
                }));
              }}
              existingFileUrl={formData.contract_file_url}
              existingFileName={formData.contract_file_name}
              bucketName="insurance-contracts"
              folderName="contracts"
              acceptedTypes=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              maxSizeInMB={10}
              label="Contratto Assicurativo"
              placeholder="Carica il contratto di assicurazione..."
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Note</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Note aggiuntive sulla polizza..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={loading}
          >
            Annulla
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Salvataggio...' : (policy ? 'Aggiorna Polizza' : 'Aggiungi Polizza')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};