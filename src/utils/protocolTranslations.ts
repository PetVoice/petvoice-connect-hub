import { useTranslation } from '@/hooks/useTranslation';

export const useProtocolTranslations = () => {
  const { t } = useTranslation();

  const translateProtocolTitle = (title: string): string => {
    const translationKey = `protocols.titles.${title}`;
    const translated = t(translationKey, title);
    // Se la traduzione è uguale alla chiave, significa che non è stata trovata
    return translated === translationKey ? title : translated;
  };

  const translateProtocolDescription = (description: string): string => {
    const translationKey = `protocols.descriptions.${description}`;
    const translated = t(translationKey, description);
    // Se la traduzione è uguale alla chiave, significa che non è stata trovata
    return translated === translationKey ? description : translated;
  };

  return {
    translateProtocolTitle,
    translateProtocolDescription
  };
};