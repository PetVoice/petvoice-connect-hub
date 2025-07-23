import { useTranslation } from '@/hooks/useTranslation';

export const useProtocolTranslations = () => {
  const { t } = useTranslation();

  const translateProtocolTitle = (title: string): string => {
    return t(`protocols.titles.${title}`, title);
  };

  const translateProtocolDescription = (description: string): string => {
    return t(`protocols.descriptions.${description}`, description);
  };

  return {
    translateProtocolTitle,
    translateProtocolDescription
  };
};