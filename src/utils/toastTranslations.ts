// Toast messages solo in italiano - sistema multilingua rimosso
const toastMessages: Record<string, string> = {
  "Success": "Successo",
  "Error": "Errore", 
  "Warning": "Avviso",
  "Info": "Info",
  "Successo": "Successo",
  "Errore": "Errore",
  "Avviso": "Avviso",
  "Confermato": "Confermato",
  
  // Messaggi specifici
  "Messaggio inviato": "Messaggio inviato",
  "Messaggio inviato in {channelName}": "Messaggio inviato in {channelName}",
  "Impossibile inviare il messaggio": "Impossibile inviare il messaggio",
  "Protocol created successfully": "Protocollo creato con successo",
  "Exercise completed": "Esercizio completato",
  "Settings updated": "Impostazioni aggiornate",
  "Data saved": "Dati salvati",
  "Changes saved successfully": "Modifiche salvate con successo",
  "Profile updated": "Profilo aggiornato",
  "Pet added successfully": "Animale aggiunto con successo",
  "Analysis completed": "Analisi completata",
  "Diary entry saved": "Voce del diario salvata",
  "Event created": "Evento creato",
  "Something went wrong": "Qualcosa è andato storto",
  "Failed to save": "Salvataggio fallito",
  "Network error": "Errore di rete",
  "Operazione completata": "Operazione completata",
  "Operazione fallita": "Operazione fallita",
  "Salvato": "Salvato",
  "Impossibile salvare": "Impossibile salvare",
  "Eliminato": "Eliminato",
  "Impossibile eliminare": "Impossibile eliminare",
  "Copiato negli appunti": "Copiato negli appunti",
  "Impossibile copiare": "Impossibile copiare",
  
  // Pet messages
  'pets.petAdded.title': 'Pet aggiunto',
  'pets.petAdded.description': '{petName} è stato aggiunto con successo alla famiglia',
  'pets.petUpdated.title': 'Pet aggiornato',
  'pets.petUpdated.description': '{petName} è stato aggiornato con successo',
  'pets.petDeleted.title': 'Pet eliminato',
  'pets.petDeleted.description': '{petName} è stato rimosso dalla famiglia',
  
  // Protocol messages
  'protocol.started.title': 'Protocollo avviato',
  'protocol.started.description': 'Il protocollo "{protocolName}" è stato avviato con successo',
  'protocol.restarted.title': 'Protocollo riavviato', 
  'protocol.restarted.description': 'Il protocollo "{protocolName}" è stato riavviato da capo',
  'protocol.stopped.title': 'Protocollo interrotto',
  'protocol.stopped.description': 'Il protocollo "{protocolName}" è stato interrotto con successo',
  'protocol.error.cannotStart': 'Impossibile avviare il protocollo',
  
  // Calendar messages
  'calendar.eventCreated.title': 'Evento creato',
  'calendar.eventCreated.description': 'L\'evento è stato creato con successo',
  'calendar.eventUpdated.title': 'Evento aggiornato',
  'calendar.eventUpdated.description': 'L\'evento è stato aggiornato con successo',
  'calendar.eventDeleted.title': 'Evento eliminato',
  'calendar.eventDeleted.description': 'L\'evento è stato eliminato con successo',
  'calendar.eventsDeleted.title': 'Eventi eliminati',
  'calendar.eventsDeleted.description': '{count} eventi sono stati eliminati',
  'calendar.pdfExported.title': 'PDF esportato',
  'calendar.pdfExported.description': 'Calendario di {petName} esportato con successo',
  'calendar.error.cannotLoad': 'Impossibile caricare gli eventi',
  'calendar.error.cannotSave': 'Impossibile salvare l\'evento',
  'calendar.error.cannotDelete': 'Impossibile eliminare l\'evento',
  'calendar.error.cannotDeleteMultiple': 'Impossibile eliminare gli eventi',
  'calendar.error.cannotExport': 'Impossibile esportare il PDF',
  
  // Diary messages
  'diary.entryCreated.title': 'Nota del diario creata',
  'diary.entryCreated.description': 'La nota del diario è stata salvata con successo',
  'diary.entryUpdated.title': 'Nota del diario aggiornata',
  'diary.entryUpdated.description': 'La nota del diario è stata aggiornata con successo',
  'diary.entryDeleted.title': 'Nota del diario eliminata',
  'diary.entryDeleted.description': 'La nota del diario è stata eliminata con successo',
  'diary.entriesDeleted.title': 'Note eliminate',
  'diary.entriesDeleted.description': '{count} note del diario sono state eliminate',
  'diary.pdfExported.title': 'Diario esportato',
  'diary.pdfExported.description': 'Diario di {petName} esportato con successo',
  'diary.error.cannotLoad': 'Impossibile caricare le note del diario',
  'diary.error.cannotSave': 'Impossibile salvare la nota del diario',
  'diary.error.cannotDelete': 'Impossibile eliminare la nota del diario',
  'diary.error.cannotDeleteMultiple': 'Impossibile eliminare le note',
  'diary.error.cannotExport': 'Impossibile esportare il diario',
  
  // Common error messages
  'error.title': 'Errore',
  'success.title': 'Successo',
  'warning.title': 'Avviso',
  'info.title': 'Informazione'
};

export const useToastTranslations = () => {
  const translateToast = (text: string, variables?: Record<string, string>): string => {
    let translation = toastMessages[text] || text;
    
    // Handle string interpolation for variables like {protocolName}, {channelName}, etc.
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        translation = translation.replace(new RegExp(`{${key}}`, 'g'), value);
      });
    }
    
    return translation;
  };

  return { translateToast };
};