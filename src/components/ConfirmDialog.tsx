import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { usePersistentDialog } from '@/hooks/usePersistentDialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: 'default' | 'destructive';
  dialogId?: string; // ID univoco per persistenza
  persistOnRefresh?: boolean; // Se true, la dialog persiste al refresh
}

// Modal conferma uscita gruppo
const LeaveGroupModal: React.FC<{
  isOpen: boolean;
  groupName: string;
  onConfirm: () => void;
  onCancel: () => void;
  persistOnRefresh?: boolean;
}> = ({ isOpen, groupName, onConfirm, onCancel, persistOnRefresh = false }) => {
  const persistentDialog = usePersistentDialog(
    `leave-group-${groupName}`,
    persistOnRefresh ? isOpen : false,
    { groupName }
  );

  const modalOpen = persistOnRefresh ? persistentDialog.isOpen : isOpen;
  const handleClose = persistOnRefresh ? persistentDialog.close : onCancel;

  if (!modalOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-lg max-w-md w-full mx-4 border shadow-lg">
        <h3 className="text-lg font-semibold mb-2 text-destructive">Uscire dal gruppo?</h3>
        <p className="text-muted-foreground mb-2">
          Sei sicuro di voler uscire dal gruppo <strong>{groupName}</strong>?
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Non riceverai più messaggi da questo gruppo.
        </p>
        <div className="flex gap-3 justify-end">
          <button 
            onClick={handleClose} 
            className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            Annulla
          </button>
          <button 
            onClick={() => {
              onConfirm();
              handleClose();
            }} 
            className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
          >
            Esci dal gruppo
          </button>
        </div>
      </div>
    </div>
  );
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Conferma',
  cancelText = 'Annulla',
  onConfirm,
  variant = 'default',
  dialogId,
  persistOnRefresh = false
}) => {
  // Usa il dialog persistente se è abilitato e ha un ID
  const persistentDialog = usePersistentDialog(
    dialogId || `confirm-${title}`, 
    persistOnRefresh ? open : false,
    { title, description, confirmText, cancelText, variant }
  );

  // Usa lo stato persistente se abilitato, altrimenti usa lo stato normale
  const isOpen = persistOnRefresh && dialogId ? persistentDialog.isOpen : open;
  const handleOpenChange = persistOnRefresh && dialogId ? persistentDialog.onOpenChange : onOpenChange;

  console.log(`ConfirmDialog [${dialogId}]: persistOnRefresh=${persistOnRefresh}, isOpen=${isOpen}, open=${open}`);

  const handleConfirm = () => {
    onConfirm();
    handleOpenChange(false);
  };

  const handleCancel = () => {
    handleOpenChange(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className={variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'petvoice-button'}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export { LeaveGroupModal };