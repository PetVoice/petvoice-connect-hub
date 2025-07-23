import { useTranslation } from '@/hooks/useTranslation';

export const useProtocolTranslations = () => {
  const { t, language } = useTranslation();
  
  // Debug del sistema di traduzione
  console.log('🔍 useProtocolTranslations hook initialized:', { 
    language, 
    tFunction: typeof t,
    testTranslation: t('common.save', 'DEFAULT')
  });

  // Mapping delle descrizioni basato sui titoli dei protocolli
  const descriptionMapping: Record<string, string> = {
    "Socializzazione Progressiva": "socializzazioneProgressiva",
    "Controllo Aggressività Reattiva": "controlloAggressivitaReattiva", 
    "Gestione Ansia da Separazione": "gestioneAnsiaSeparazione",
    "Rieducazione Alimentare Comportamentale": "rieducazioneAlimentareComportamentale",
    "Ottimizzazione Ciclo Sonno-Veglia": "ottimizzazioneCicloSonnoVeglia",
    "Superare Fobie e Paure Specifiche": "superareFobiePaureSpecifiche",
    "Stop Comportamenti Distruttivi": "stopComportamentiDistruttivi",
    "Gestione Gelosia e Possessività": "gestioneGelosiaEPossessivita",
    "Riattivazione Energia e Motivazione": "riattivazioneEnergiaMotivazione",
    "Gestione Iperattività e Deficit Attenzione": "gestioneIperattivatEDeficitAttenzione"
  };

  const translateProtocolTitle = (title: string): string => {
    console.log('translateProtocolTitle called with:', { title, language });
    
    // Prima prova con la sezione aiTraining.protocols
    if (descriptionMapping[title]) {
      const key = descriptionMapping[title];
      const translationKey = `aiTraining.protocols.${key}.title`;
      const translated = t(translationKey, '');
      console.log('Title translation attempt:', { 
        title, 
        key, 
        translationKey, 
        translated, 
        hasTranslation: translated !== '',
        language 
      });
      
      if (translated && translated !== '') {
        console.log('✅ Successfully translated title via aiTraining mapping:', { title, key, translated });
        return translated;
      } else {
        console.log('❌ Failed to translate title via aiTraining mapping:', { title, key, translationKey });
      }
    }
    
    // Fallback alla sezione protocols.titles
    const fallbackKey = `protocols.titles.${title}`;
    const fallbackTranslated = t(fallbackKey, title);
    console.log('Title fallback translation:', { title, fallbackKey, fallbackTranslated, isDefault: fallbackTranslated === title });
    return fallbackTranslated === fallbackKey ? title : fallbackTranslated;
  };

  const translateProtocolDescription = (description: string, title?: string): string => {
    console.log('translateProtocolDescription called with:', { description, title, language });
    
    // Se abbiamo il titolo, proviamo a trovare la mappatura
    if (title && descriptionMapping[title]) {
      const key = descriptionMapping[title];
      const translationKey = `aiTraining.protocols.${key}.description`;
      const translated = t(translationKey, '');
      console.log('Description translation attempt via title:', { 
        title, 
        key, 
        translationKey, 
        translated, 
        hasTranslation: translated !== '',
        language 
      });
      
      if (translated && translated !== '') {
        console.log('✅ Successfully translated description via title mapping:', { title, key, translated });
        return translated;
      } else {
        console.log('❌ Failed to translate description via title mapping:', { title, key, translationKey });
      }
    }

    // Altrimenti, proviamo a trovare il mapping dalla descrizione originale confrontando con le descrizioni italiane
    for (const [protocolTitle, key] of Object.entries(descriptionMapping)) {
      // Carica la descrizione italiana dalla traduzione IT
      const italianTranslations = { 
        "socializzazioneProgressiva": "Protocollo di 5 giorni per migliorare le competenze sociali dell'animale con altri animali e persone. Approccio graduale e positivo per animali timidi o poco socializzati, con focus su confidence building e interazioni controllate.",
        "controlloAggressivitaReattiva": "Protocollo avanzato per la gestione sicura dell'aggressività reattiva. Priorità assoluta sulla sicurezza, controllo impulsi e sviluppo comportamenti alternativi. Richiede supervisione professionale.",
        "gestioneAnsiaSeparazione": "Protocollo scientifico per ridurre l'ansia da separazione attraverso desensibilizzazione graduale. Sviluppa indipendenza e tranquillità durante le assenze del proprietario con approccio ultra-graduale.",
        "rieducazioneAlimentareComportamentale": "Protocollo intermedio per risolvere disturbi comportamentali legati all'alimentazione. Affronta alimentazione compulsiva, rifiuto del cibo, food guarding e ansia alimentare attraverso un approccio graduale e non punitivo.",
        "ottimizzazioneCicloSonnoVeglia": "Protocollo specializzato per stabilire pattern di sonno salutari, ridurre insonnia e risvegli notturni. Attraverso routine pre-sonno, ottimizzazione ambientale e regolazione circadiana, aiuta gli animali a sviluppare abitudini di riposo naturali e ristoratori.",
        "superareFobiePaureSpecifiche": "Programma avanzato di desensibilizzazione sistematica per superare fobie intense di rumori, oggetti e situazioni specifiche attraverso tecniche scientifiche graduali.",
        "stopComportamentiDistruttivi": "Protocollo intensivo per eliminare masticazione distruttiva, scavo eccessivo e distruzione di oggetti domestici.",
        "gestioneGelosiaEPossessivita": "Protocollo specializzato per ridurre comportamenti possessivi e gelosia negli animali domestici. Include tecniche avanzate di desensibilizzazione, training di condivisione e gestione delle risorse.",
        "riattivazioneEnergiaMotivazione": "Protocollo graduale per combattere depressione, apatia e perdita di interesse negli animali. Approccio dolce e progressivo per risvegliare la motivazione attraverso stimoli sensoriali, attivazione fisica e ripristino dell'interesse sociale.",
        "gestioneIperattivatEDeficitAttenzione": "Protocollo completo per ridurre iperattività e migliorare concentrazione attraverso un approccio progressivo: dalla scarica di energia costruttiva al controllo degli impulsi, fino al rilassamento e autocontrollo."
      };
      
      if (italianTranslations[key] === description) {
        const translationKey = `aiTraining.protocols.${key}.description`;
        const translated = t(translationKey, description);
        console.log('✅ Successfully translated description via description match:', { protocolTitle, key, translationKey, translated });
        return translated;
      }
    }

    console.log('❌ No translation found for description, returning original:', description);
    return description;
  };

  return {
    translateProtocolTitle,
    translateProtocolDescription
  };
};