// Solo titoli e descrizioni in italiano - sistema multilingua rimosso
const protocolTitles: Record<string, string> = {
  "Socializzazione Progressiva": "Socializzazione Progressiva",
  "Controllo Aggressività Reattiva": "Controllo Aggressività Reattiva", 
  "Gestione Ansia da Separazione": "Gestione Ansia da Separazione",
  "Rieducazione Alimentare Comportamentale": "Rieducazione Alimentare Comportamentale",
  "Ottimizzazione Ciclo Sonno-Veglia": "Ottimizzazione Ciclo Sonno-Veglia",
  "Superare Fobie e Paure Specifiche": "Superare Fobie e Paure Specifiche",
  "Stop Comportamenti Distruttivi": "Stop Comportamenti Distruttivi",
  "Gestione Gelosia e Possessività": "Gestione Gelosia e Possessività",
  "Riattivazione Energia e Motivazione": "Riattivazione Energia e Motivazione",
  "Gestione Iperattività e Deficit Attenzione": "Gestione Iperattività e Deficit Attenzione"
};

const protocolDescriptions: Record<string, string> = {
  "Protocollo di 5 giorni per migliorare le competenze sociali dell'animale con altri animali e persone. Approccio graduale e positivo per animali timidi o poco socializzati, con focus su confidence building e interazioni controllate.": "Protocollo di 5 giorni per migliorare le competenze sociali dell'animale con altri animali e persone. Approccio graduale e positivo per animali timidi o poco socializzati, con focus su confidence building e interazioni controllate.",
  "Protocollo avanzato per la gestione sicura dell'aggressività reattiva. Priorità assoluta sulla sicurezza, controllo impulsi e sviluppo comportamenti alternativi. Richiede supervisione professionale.": "Protocollo avanzato per la gestione sicura dell'aggressività reattiva. Priorità assoluta sulla sicurezza, controllo impulsi e sviluppo comportamenti alternativi. Richiede supervisione professionale.",
  "Protocollo scientifico per ridurre l'ansia da separazione attraverso desensibilizzazione graduale. Sviluppa indipendenza e tranquillità durante le assenze del proprietario con approccio ultra-graduale.": "Protocollo scientifico per ridurre l'ansia da separazione attraverso desensibilizzazione graduale. Sviluppa indipendenza e tranquillità durante le assenze del proprietario con approccio ultra-graduale."
};

export const useProtocolTranslations = () => {
  const translateProtocolTitle = (title: string): string => {
    return protocolTitles[title] || title;
  };

  const translateProtocolDescription = (description: string): string => {
    return protocolDescriptions[description] || description;
  };

  return {
    translateProtocolTitle,
    translateProtocolDescription
  };
};