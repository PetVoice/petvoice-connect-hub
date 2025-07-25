import React, { createContext, useContext, useState, useEffect } from 'react';

interface DialogState {
  id: string;
  isOpen: boolean;
  data?: any;
}

interface DialogStateContextType {
  openDialogs: DialogState[];
  openDialog: (id: string, data?: any) => void;
  closeDialog: (id: string) => void;
  isDialogOpen: (id: string) => boolean;
  getDialogData: (id: string) => any;
}

const DialogStateContext = createContext<DialogStateContextType | undefined>(undefined);

const STORAGE_KEY = 'petvoice-dialog-state';

export const DialogStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [openDialogs, setOpenDialogs] = useState<DialogState[]>([]);

  // Carica lo stato dai sessionStorage al mount
  useEffect(() => {
    console.log('DialogStateProvider: Caricamento stato iniziale...');
    const savedState = sessionStorage.getItem(STORAGE_KEY);
    console.log('DialogStateProvider: Stato salvato trovato:', savedState);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        console.log('DialogStateProvider: Stato parsato:', parsed);
        setOpenDialogs(parsed);
      } catch (error) {
        console.error('Errore nel caricamento dello stato delle dialog:', error);
      }
    }
  }, []);

  // Salva lo stato nei sessionStorage quando cambia
  useEffect(() => {
    console.log('DialogStateProvider: Cambiamento stato dialog:', openDialogs);
    if (openDialogs.length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(openDialogs));
      console.log('DialogStateProvider: Stato salvato in sessionStorage');
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
      console.log('DialogStateProvider: Stato rimosso da sessionStorage');
    }
  }, [openDialogs]);

  const openDialog = (id: string, data?: any) => {
    console.log('DialogStateProvider: Apertura dialog:', id, data);
    setOpenDialogs(prev => {
      const existing = prev.find(dialog => dialog.id === id);
      if (existing) {
        return prev.map(dialog => 
          dialog.id === id 
            ? { ...dialog, isOpen: true, data } 
            : dialog
        );
      }
      const newState = [...prev, { id, isOpen: true, data }];
      console.log('DialogStateProvider: Nuovo stato dopo apertura:', newState);
      return newState;
    });
  };

  const closeDialog = (id: string) => {
    setOpenDialogs(prev => prev.filter(dialog => dialog.id !== id));
  };

  const isDialogOpen = (id: string): boolean => {
    return openDialogs.some(dialog => dialog.id === id && dialog.isOpen);
  };

  const getDialogData = (id: string): any => {
    return openDialogs.find(dialog => dialog.id === id)?.data;
  };

  return (
    <DialogStateContext.Provider 
      value={{ 
        openDialogs, 
        openDialog, 
        closeDialog, 
        isDialogOpen, 
        getDialogData 
      }}
    >
      {children}
    </DialogStateContext.Provider>
  );
};

export const useDialogState = () => {
  const context = useContext(DialogStateContext);
  if (context === undefined) {
    throw new Error('useDialogState must be used within a DialogStateProvider');
  }
  return context;
};