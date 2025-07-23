import { useTranslation } from '@/hooks/useTranslation';

export const useProtocolTranslations = () => {
  const { t } = useTranslation();

  const translateProtocolTitle = (title: string): string => {
    console.log('Translating title:', title);
    const translated = t(`protocols.titles.${title}`, '');
    console.log('Title translated to:', translated);
    return translated || title;
  };

  const translateProtocolDescription = (description: string): string => {
    console.log('Translating description:', description);
    const translationKey = `protocols.descriptions.${description}`;
    console.log('Translation key:', translationKey);
    const translated = t(translationKey, '');
    console.log('Description translated to:', translated);
    return translated || description;
  };

  return {
    translateProtocolTitle,
    translateProtocolDescription
  };
};