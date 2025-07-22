import { useLanguage } from '@/contexts/LanguageContext';
import { useMemo } from 'react';

// Import translation files
import it from '@/i18n/translations/it.json';
import en from '@/i18n/translations/en.json';
import es from '@/i18n/translations/es.json';

type TranslationObject = typeof it;
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

type TranslationKey = NestedKeyOf<TranslationObject> | string;

const translations = {
  it,
  en,
  es,
};

function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path;
}

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = useMemo(() => {
    return (key: TranslationKey, fallback?: string, variables?: Record<string, string>): string => {
      const translation = getNestedValue(translations[language], key);
      const text = translation || fallback || key;
      
      // Handle string interpolation for variables like {petName}, {channelName}, etc.
      if (variables) {
        return Object.entries(variables).reduce((str, [key, value]) => {
          return str.replace(new RegExp(`{${key}}`, 'g'), value);
        }, text);
      }
      
      return text;
    };
  }, [language]);

  return { t, language };
};

// Helper function for time formatting with proper pluralization
export const useTimeTranslation = () => {
  const { t } = useTranslation();

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now.getTime() - notificationTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return diffDays === 1 
        ? `1 ${t('header.timeAgo.dayAgo')}`
        : `${diffDays} ${t('header.timeAgo.daysAgo')}`;
    } else if (diffHours > 0) {
      return diffHours === 1 
        ? `1 ${t('header.timeAgo.hourAgo')}`
        : `${diffHours} ${t('header.timeAgo.hoursAgo')}`;
    } else {
      return t('header.timeAgo.now');
    }
  };

  return { formatTimeAgo };
};