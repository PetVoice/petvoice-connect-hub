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

interface SupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  status: string;
}

interface TicketCloseConfirmModalProps {
  isOpen: boolean;
  ticket: SupportTicket | null;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export const TicketCloseConfirmModal: React.FC<TicketCloseConfirmModalProps> = ({
  isOpen,
  ticket,
  onClose,
  onConfirm,
  loading
}) => {
  if (!ticket) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Chiudi Ticket</AlertDialogTitle>
          <AlertDialogDescription>
            Sei sicuro di voler chiudere il ticket <strong>#{ticket.ticket_number}</strong> - "{ticket.subject}"?
            <br />
            <br />
            Una volta chiuso, il ticket non potrà più ricevere nuove risposte e sarà considerato risolto.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            Annulla
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {loading ? 'Chiusura...' : 'Conferma'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};