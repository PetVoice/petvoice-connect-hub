import { useTranslation } from '@/hooks/useTranslation';

export const useProtocolTranslations = () => {
  const { t, language } = useTranslation();

  // Mapping delle descrizioni basato sui titoli dei protocolli
  const descriptionMapping: Record<string, string> = {
    "Socializzazione Progressiva": "socializzazioneProgressiva",
    "Controllo Aggressività Reattiva": "controlloAggressivitaReattiva", 
    "Gestione Ansia da Separazione": "gestioneAnsiaSeperazione",
    "Rieducazione Alimentare Comportamentale": "rieducazioneAlimentare",
    "Ottimizzazione Ciclo Sonno-Veglia": "ottimizzazioneSonno",
    "Superare Fobie e Paure Specifiche": "superareFobie",
    "Stop Comportamenti Distruttivi": "stopComportamentiDistruttivi",
    "Gestione Gelosia e Possessività": "gestioneGelosia",
    "Riattivazione Energia e Motivazione": "riattivazioneEnergia",
    "Gestione Iperattività e Deficit Attenzione": "gestioneIperattivita"
  };

  const translateProtocolTitle = (title: string): string => {
    // Trova la chiave semantica dal titolo
    const semanticKey = descriptionMapping[title];
    if (semanticKey) {
      const translationKey = `protocols.titles.${semanticKey}`;
      const translated = t(translationKey, title);
      return translated === translationKey ? title : translated;
    }
    return title;
  };

  const translateProtocolDescription = (description: string, title?: string): string => {
    console.log('translateProtocolDescription called with:', { description, title, language });
    
    // Se abbiamo il titolo, proviamo a trovare la mappatura
    if (title && descriptionMapping[title]) {
      const key = descriptionMapping[title];
      const translated = t(`aiTraining.protocols.${key}.description`, '');
      if (translated && translated !== '') {
        console.log('Translated description via title mapping:', { title, key, translated });
        return translated;
      }
    }

    // Altrimenti, proviamo a trovare il mapping dalla descrizione originale confrontando con le descrizioni italiane
    for (const [protocolTitle, key] of Object.entries(descriptionMapping)) {
      // Carica la descrizione italiana dalla traduzione IT
      const italianTranslations = { 
        "socializzazioneProgressiva": "Protocollo di 5 giorni per migliorare le competenze sociali dell'animale con altri animali e persone. Approccio graduale e positivo per animali timidi o poco socializzati, con focus su confidence building e interazioni controllate.",
        "controlloAggressivitaReattiva": "Protocollo avanzato per la gestione sicura dell'aggressività reattiva. Priorità assoluta sulla sicurezza, controllo impulsi e sviluppo comportamenti alternativi. Richiede supervisione professionale.",
        "gestioneAnsiaSeperazione": "Protocollo scientifico per ridurre l'ansia da separazione attraverso desensibilizzazione graduale. Sviluppa indipendenza e tranquillità durante le assenze del proprietario con approccio ultra-graduale.",
        "rieducazioneAlimentare": "Protocollo intermedio per risolvere disturbi comportamentali legati all'alimentazione. Affronta alimentazione compulsiva, rifiuto del cibo, food guarding e ansia alimentare attraverso un approccio graduale e non punitivo.",
        "ottimizzazioneSonno": "Protocollo specializzato per stabilire pattern di sonno salutari, ridurre insonnia e risvegli notturni. Attraverso routine pre-sonno, ottimizzazione ambientale e regolazione circadiana, aiuta gli animali a sviluppare abitudini di riposo naturali e ristoratori.",
        "superareFobie": "Programma avanzato di desensibilizzazione sistematica per superare fobie intense di rumori, oggetti e situazioni specifiche attraverso tecniche scientifiche graduali.",
        "stopComportamentiDistruttivi": "Protocollo intensivo per eliminare masticazione distruttiva, scavo eccessivo e distruzione di oggetti domestici.",
        "gestioneGelosia": "Protocollo specializzato per ridurre comportamenti possessivi e gelosia negli animali domestici. Include tecniche avanzate di desensibilizzazione, training di condivisione e gestione delle risorse.",
        "riattivazioneEnergia": "Protocollo graduale per combattere depressione, apatia e perdita di interesse negli animali. Approccio dolce e progressivo per risvegliare la motivazione attraverso stimoli sensoriali, attivazione fisica e ripristino dell'interesse sociale.",
        "gestioneIperattivita": "Protocollo completo per ridurre iperattività e migliorare concentrazione attraverso un approccio progressivo: dalla scarica di energia costruttiva al controllo degli impulsi, fino al rilassamento e autocontrollo."
      };
      
      if (italianTranslations[key] === description) {
        const translated = t(`aiTraining.protocols.${key}.description`, description);
        console.log('Translated description via description match:', { protocolTitle, key, translated });
        return translated;
      }
    }

    console.log('No translation found for description, returning original:', description);
    return description;
  };

  return {
    translateProtocolTitle,
    translateProtocolDescription
  };
};