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
    const translationKey = `protocols.titles.${title}`;
    const translated = t(translationKey, title);
    return translated === translationKey ? title : translated;
  };

  const translateProtocolDescription = (description: string): string => {
    // Trova il titolo corrispondente per questa descrizione
    const protocol = Object.entries(descriptionMapping).find(([title, key]) => {
      const protocolDesc = t(`aiTraining.protocols.${key}.description`, '');
      return protocolDesc === description;
    });

    if (protocol) {
      const [title, key] = protocol;
      return t(`aiTraining.protocols.${key}.description`, description);
    }

    // Fallback: usa il sistema precedente per le descrizioni lunghe
    const translationKey = `protocols.descriptions.${description}`;
    const translated = t(translationKey, description);
    return translated === translationKey ? description : translated;
  };

  return {
    translateProtocolTitle,
    translateProtocolDescription
  };
};