import React from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

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
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Chiusura...' : 'Conferma'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};