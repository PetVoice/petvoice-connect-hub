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

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: 'default' | 'destructive';
}

// Modal conferma uscita gruppo
const LeaveGroupModal: React.FC<{
  isOpen: boolean;
  groupName: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, groupName, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  
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
            onClick={onCancel} 
            className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            Annulla
          </button>
          <button 
            onClick={onConfirm} 
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
  variant = 'default'
}) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className={variant === 'destructive' ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500' : 'petvoice-button'}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export { LeaveGroupModal };