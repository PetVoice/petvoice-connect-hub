import { useTranslation } from '@/hooks/useTranslation';

export const useProtocolTranslations = () => {
  const { t, language } = useTranslation();

  // Mapping corretto dei titoli ai loro identificatori
  const protocolKeyMapping: Record<string, string> = {
    "Socializzazione Progressiva": "socializzazioneProgressiva",
    "Controllo Aggressività Reattiva": "controlloAggressivitaReattiva", 
    "Gestione Ansia da Separazione": "gestioneAnsiaSeparazione", // CORRETTA la battitura
    "Rieducazione Alimentare Comportamentale": "rieducazioneAlimentareComportamentale",
    "Ottimizzazione Ciclo Sonno-Veglia": "ottimizzazioneCicloSonnoVeglia",
    "Superare Fobie e Paure Specifiche": "superareFobiePaureSpecifiche",
    "Stop Comportamenti Distruttivi": "stopComportamentiDistruttivi",
    "Gestione Gelosia e Possessività": "gestioneGelosiaEPossessivita",
    "Riattivazione Energia e Motivazione": "riattivazioneEnergiaMotivazione",
    "Gestione Iperattività e Deficit Attenzione": "gestioneIperattivatEDeficitAttenzione"
  };

  // Traduci il titolo di un protocollo
  const translateProtocolTitle = (title: string): string => {
    // Prima prova la traduzione diretta nei protocols.titles
    const directTranslationKey = `protocols.titles.${title}`;
    const directTranslation = t(directTranslationKey);
    
    // Se la traduzione diretta esiste e non è uguale alla chiave, usala
    if (directTranslation !== directTranslationKey) {
      return directTranslation;
    }

    // Altrimenti prova tramite il mapping in aiTraining.protocols
    const protocolKey = protocolKeyMapping[title];
    if (protocolKey) {
      const mappedTranslationKey = `aiTraining.protocols.${protocolKey}.title`;
      const mappedTranslation = t(mappedTranslationKey);
      
      if (mappedTranslation !== mappedTranslationKey) {
        return mappedTranslation;
      }
    }

    // Fallback: ritorna il titolo originale
    return title;
  };

  // Traduci la descrizione di un protocollo
  const translateProtocolDescription = (description: string): string => {
    // Prima prova la traduzione diretta nei protocols.descriptions
    const directTranslationKey = `protocols.descriptions.${description}`;
    const directTranslation = t(directTranslationKey);
    
    // Se la traduzione diretta esiste e non è uguale alla chiave, usala
    if (directTranslation !== directTranslationKey) {
      return directTranslation;
    }

    // Altrimenti cerca quale protocollo ha questa descrizione nel mapping
    for (const [title, protocolKey] of Object.entries(protocolKeyMapping)) {
      const mappedTranslationKey = `aiTraining.protocols.${protocolKey}.description`;
      const mappedTranslation = t(mappedTranslationKey);
      
      // Se la descrizione corrisponde a quella di questo protocollo
      if (mappedTranslation === description && mappedTranslation !== mappedTranslationKey) {
        return mappedTranslation;
      }
    }

    // Fallback: ritorna la descrizione originale
    return description;
  };

  return {
    translateProtocolTitle,
    translateProtocolDescription
  };
};