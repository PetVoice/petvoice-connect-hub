import { useEffect } from 'react';
import { useDialogState } from '@/contexts/DialogStateContext';

/**
 * Hook per gestire dialog che persistono al refresh della pagina
 */
export const usePersistentDialog = (
  dialogId: string,
  initialOpen: boolean = false,
  initialData?: any
) => {
  const { openDialog, closeDialog, isDialogOpen, getDialogData } = useDialogState();

  // Stato della dialog basato sul contesto persistente
  const isOpen = isDialogOpen(dialogId);
  const dialogData = getDialogData(dialogId);

  console.log(`usePersistentDialog [${dialogId}]: isOpen=${isOpen}, initialOpen=${initialOpen}`);

  // Apri la dialog se è stata passata come aperta inizialmente
  useEffect(() => {
    console.log(`usePersistentDialog [${dialogId}]: Effect - initialOpen=${initialOpen}, isOpen=${isOpen}`);
    if (initialOpen && !isOpen) {
      console.log(`usePersistentDialog [${dialogId}]: Apertura dialog iniziale`);
      openDialog(dialogId, initialData);
    }
  }, [initialOpen, dialogId, initialData, isOpen, openDialog]);

  const handleOpen = (data?: any) => {
    openDialog(dialogId, data);
  };

  const handleClose = () => {
    closeDialog(dialogId);
  };

  const handleOpenChange = (open: boolean, data?: any) => {
    if (open) {
      handleOpen(data);
    } else {
      handleClose();
    }
  };

  return {
    isOpen,
    dialogData,
    open: handleOpen,
    close: handleClose,
    onOpenChange: handleOpenChange,
  };
};