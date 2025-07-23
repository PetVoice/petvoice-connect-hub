import { useTranslation } from '@/hooks/useTranslation';

// Traduzioni hardcoded per i toast
const toastTranslations = {
  it: {
    // Messaggi generici
    "Successo": "Successo",
    "Errore": "Errore",
    "Avviso": "Avviso",
    "Confermato": "Confermato",
    
    // Messaggi specifici - Messaggistica
    "Messaggio inviato": "Messaggio inviato",
    "Messaggio inviato in {channelName}": "Messaggio inviato in {channelName}",
    "Impossibile inviare il messaggio: {error}": "Impossibile inviare il messaggio: {error}",
    "Impossibile inviare il messaggio": "Impossibile inviare il messaggio",
    
    // File e upload
    "File troppo grande": "File troppo grande",
    "L'immagine deve essere inferiore a 5MB": "L'immagine deve essere inferiore a 5MB",
    "Immagine caricata": "Immagine caricata",
    "Immagine condivisa in {channelName}": "Immagine condivisa in {channelName}",
    "Impossibile caricare l'immagine": "Impossibile caricare l'immagine",
    
    // Audio
    "Audio registrato": "Audio registrato",
    "Messaggio vocale inviato in {channelName}": "Messaggio vocale inviato in {channelName}",
    "Impossibile inviare il messaggio vocale": "Impossibile inviare il messaggio vocale",
    "Impossibile accedere al microfono": "Impossibile accedere al microfono",
    
    // Password e autenticazione
    "Le nuove password non corrispondono": "Le nuove password non corrispondono",
    "Password troppo debole: {errors}": "Password troppo debole: {errors}",
    "La nuova password deve essere diversa da quella attuale": "La nuova password deve essere diversa da quella attuale",
    "Password aggiornata con successo!": "Password aggiornata con successo!",
    
    // Profilo e impostazioni
    "Profilo aggiornato con successo": "Profilo aggiornato con successo",
    "Impossibile aggiornare il profilo": "Impossibile aggiornare il profilo",
    "Avatar aggiornato": "Avatar aggiornato",
    "Impossibile aggiornare l'avatar": "Impossibile aggiornare l'avatar",
    
    // Account
    "Email di verifica inviata": "Email di verifica inviata",
    "Controlla la tua casella email": "Controlla la tua casella email",
    "Impossibile inviare l'email di verifica": "Impossibile inviare l'email di verifica",
    "Account eliminato con successo": "Account eliminato con successo",
    "Impossibile eliminare l'account": "Impossibile eliminare l'account",
    
    // Analisi e AI
    "Analisi completata": "Analisi completata",
    "Analisi fallita": "Analisi fallita",
    "Richiesta inviata": "Richiesta inviata",
    "Richiesta fallita": "Richiesta fallita",
    
    // Community e chat
    "Connesso alla chat": "Connesso alla chat",
    "Disconnesso dalla chat": "Disconnesso dalla chat",
    "Impossibile connettersi": "Impossibile connettersi",
    
    // Azioni generiche
    "Operazione completata": "Operazione completata",
    "Operazione fallita": "Operazione fallita",
    "Salvato": "Salvato",
    "Impossibile salvare": "Impossibile salvare",
    "Eliminato": "Eliminato",
    "Impossibile eliminare": "Impossibile eliminare",
    "Copiato negli appunti": "Copiato negli appunti",
    "Impossibile copiare": "Impossibile copiare",
    'Digita "ELIMINA" per confermare': 'Digita "ELIMINA" per confermare',
    "Il nostro team ti contatterà entro 24 ore": "Il nostro team ti contatterà entro 24 ore",
    "Feedback inviato": "Feedback inviato",
    "Grazie per il tuo contributo! Ci aiuterà a migliorare l'accessibilità.": "Grazie per il tuo contributo! Ci aiuterà a migliorare l'accessibilità.",
    "Nome e tipo sono obbligatori": "Nome e tipo sono obbligatori",
    "Seleziona un'immagine valida": "Seleziona un'immagine valida",
    "Impossibile caricare le chat": "Impossibile caricare le chat",
    "Tutti i dati sono coerenti e aggiornati": "Tutti i dati sono coerenti e aggiornati",
    "Problemi di integrità rilevati: {count}": "Problemi di integrità rilevati: {count}",
    "Impossibile generare il report di integrità": "Impossibile generare il report di integrità"
  },
  en: {
    // Generic messages
    "Successo": "Success",
    "Errore": "Error",
    "Avviso": "Warning",
    "Confermato": "Confirmed",
    
    // Specific messages - Messaging
    "Messaggio inviato": "Message sent",
    "Messaggio inviato in {channelName}": "Message sent in {channelName}",
    "Impossibile inviare il messaggio: {error}": "Unable to send message: {error}",
    "Impossibile inviare il messaggio": "Unable to send message",
    
    // Files and upload
    "File troppo grande": "File too large",
    "L'immagine deve essere inferiore a 5MB": "Image must be under 5MB",
    "Immagine caricata": "Image uploaded",
    "Immagine condivisa in {channelName}": "Image shared in {channelName}",
    "Impossibile caricare l'immagine": "Unable to upload image",
    
    // Audio
    "Audio registrato": "Audio recorded",
    "Messaggio vocale inviato in {channelName}": "Voice message sent in {channelName}",
    "Impossibile inviare il messaggio vocale": "Unable to send voice message",
    "Impossibile accedere al microfono": "Unable to access microphone",
    
    // Password and authentication
    "Le nuove password non corrispondono": "New passwords don't match",
    "Password troppo debole: {errors}": "Password too weak: {errors}",
    "La nuova password deve essere diversa da quella attuale": "New password must be different from current one",
    "Password aggiornata con successo!": "Password updated successfully!",
    
    // Profile and settings
    "Profilo aggiornato con successo": "Profile updated successfully",
    "Impossibile aggiornare il profilo": "Unable to update profile",
    "Avatar aggiornato": "Avatar updated",
    "Impossibile aggiornare l'avatar": "Unable to update avatar",
    
    // Account
    "Email di verifica inviata": "Verification email sent",
    "Controlla la tua casella email": "Check your email inbox",
    "Impossibile inviare l'email di verifica": "Unable to send verification email",
    "Account eliminato con successo": "Account deleted successfully",
    "Impossibile eliminare l'account": "Unable to delete account",
    
    // Analysis and AI
    "Analisi completata": "Analysis completed",
    "Analisi fallita": "Analysis failed",
    "Richiesta inviata": "Request sent",
    "Richiesta fallita": "Request failed",
    
    // Community and chat
    "Connesso alla chat": "Connected to chat",
    "Disconnesso dalla chat": "Disconnected from chat",
    "Impossibile connettersi": "Unable to connect",
    
    // Generic actions
    "Operazione completata": "Operation completed",
    "Operazione fallita": "Operation failed",
    "Salvato": "Saved",
    "Impossibile salvare": "Unable to save",
    "Eliminato": "Deleted",
    "Impossibile eliminare": "Unable to delete",
    "Copied to clipboard": "Copied to clipboard",
    "Unable to copy": "Unable to copy",
    'Type "DELETE" to confirm': 'Type "DELETE" to confirm',
    "Our team will contact you within 24 hours": "Our team will contact you within 24 hours",
    "Feedback sent": "Feedback sent",
    "Thank you for your contribution! It will help us improve accessibility.": "Thank you for your contribution! It will help us improve accessibility.",
    "Name and type are required": "Name and type are required",
    "Select a valid image": "Select a valid image",
    "Unable to load chats": "Unable to load chats",
    "All data is consistent and up to date": "All data is consistent and up to date",
    "Integrity issues detected: {count}": "Integrity issues detected: {count}",
    "Unable to generate integrity report": "Unable to generate integrity report"
  },
  es: {
    // Generic messages
    "Successo": "Éxito",
    "Errore": "Error",
    "Avviso": "Advertencia",
    "Confermato": "Confirmado",
    
    // Specific messages - Messaging
    "Messaggio inviato": "Mensaje enviado",
    "Messaggio inviato in {channelName}": "Mensaje enviado en {channelName}",
    "Impossibile inviare il messaggio: {error}": "No se puede enviar el mensaje: {error}",
    "Impossibile inviare il messaggio": "No se puede enviar el mensaje",
    
    // Files and upload
    "File troppo grande": "Archivo demasiado grande",
    "L'immagine deve essere inferiore a 5MB": "La imagen debe ser menor a 5MB",
    "Immagine caricata": "Imagen cargada",
    "Immagine condivisa in {channelName}": "Imagen compartida en {channelName}",
    "Impossibile caricare l'immagine": "No se puede cargar la imagen",
    
    // Audio
    "Audio registrato": "Audio grabado",
    "Messaggio vocale inviato in {channelName}": "Mensaje de voz enviado en {channelName}",
    "Impossibile inviare il messaggio vocale": "No se puede enviar el mensaje de voz",
    "Impossibile accedere al microfono": "No se puede acceder al micrófono",
    
    // Password and authentication
    "Le nuove password non corrispondono": "Las nuevas contraseñas no coinciden",
    "Password troppo debole: {errors}": "Contraseña demasiado débil: {errors}",
    "La nuova password deve essere diversa da quella attuale": "La nueva contraseña debe ser diferente de la actual",
    "Password aggiornata con successo!": "¡Contraseña actualizada exitosamente!",
    
    // Profile and settings
    "Profilo aggiornato con successo": "Perfil actualizado exitosamente",
    "Impossibile aggiornare il profilo": "No se puede actualizar el perfil",
    "Avatar aggiornato": "Avatar actualizado",
    "Impossibile aggiornare l'avatar": "No se puede actualizar el avatar",
    
    // Account
    "Email di verifica inviata": "Email de verificación enviado",
    "Controlla la tua casella email": "Revisa tu bandeja de entrada",
    "Impossibile inviare l'email di verifica": "No se puede enviar el email de verificación",
    "Account eliminato con successo": "Cuenta eliminada exitosamente",
    "Impossibile eliminare l'account": "No se puede eliminar la cuenta",
    
    // Analysis and AI
    "Analisi completata": "Análisis completado",
    "Analisi fallita": "Análisis fallido",
    "Richiesta inviata": "Solicitud enviada",
    "Richiesta fallita": "Solicitud fallida",
    
    // Community and chat
    "Connesso alla chat": "Conectado al chat",
    "Disconnesso dalla chat": "Desconectado del chat",
    "Impossibile connettersi": "No se puede conectar",
    
    // Generic actions
    "Operazione completata": "Operación completada",
    "Operazione fallita": "Operación fallida",
    "Salvato": "Guardado",
    "Impossibile salvare": "No se puede guardar",
    "Eliminato": "Eliminado",
    "Impossibile eliminare": "No se puede eliminar",
    "Copiato negli appunti": "Copiado al portapapeles",
    "Impossibile copiare": "No se puede copiar",
    'Digita "ELIMINA" per confermare': 'Escribe "ELIMINAR" para confirmar'
  }
};

export const useToastTranslations = () => {
  const { language } = useTranslation();
  
  const translateToast = (text: string, variables?: Record<string, string>): string => {
    const lang = language as 'it' | 'en' | 'es';
    let translation = toastTranslations[lang]?.[text] || text;
    
    // Handle string interpolation for variables like {channelName}, {error}, etc.
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        translation = translation.replace(new RegExp(`{${key}}`, 'g'), value);
      });
    }
    
    return translation;
  };

  return {
    translateToast
  };
};