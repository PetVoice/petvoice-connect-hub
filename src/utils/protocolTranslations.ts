import { useTranslation } from '@/hooks/useTranslation';

export const useProtocolTranslations = () => {
  const { t } = useTranslation();

  const translateProtocolTitle = (title: string): string => {
    return t(`protocols.titles.${title}`, title);
  };

  const translateProtocolDescription = (description: string): string => {
    const translated = t(`protocols.descriptions.${description}`, '');
    return translated || description;
  };

  return {
    translateProtocolTitle,
    translateProtocolDescription
  };
};