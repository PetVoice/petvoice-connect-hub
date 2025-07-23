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
  
  // Protocol messages
  'protocol.started.title': 'Protocollo avviato',
  'protocol.started.description': 'Il protocollo "{protocolName}" è stato avviato con successo',
  'protocol.restarted.title': 'Protocollo riavviato', 
  'protocol.restarted.description': 'Il protocollo "{protocolName}" è stato riavviato da capo',
  'protocol.stopped.title': 'Protocollo interrotto',
  'protocol.stopped.description': 'Il protocollo "{protocolName}" è stato interrotto con successo',
  'protocol.error.cannotStart': 'Impossibile avviare il protocollo'
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