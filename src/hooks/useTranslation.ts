// Hook semplificato di fallback per sostituire il sistema multilingua 
// Adesso la piattaforma è solo in italiano
export const useTranslation = () => {
  const t = (key: string, fallback?: string, variables?: Record<string, string>): string => {
    let text = fallback || key;
    
    // Handle string interpolation for variables like {petName}, {channelName}, etc.
    if (variables) {
      return Object.entries(variables).reduce((str, [key, value]) => {
        return str.replace(new RegExp(`{${key}}`, 'g'), value);
      }, text);
    }
    
    return text;
  };

  return { t, language: 'it' };
};

// Helper function for time formatting  
export const useTimeTranslation = () => {
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now.getTime() - notificationTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return diffDays === 1 ? '1 giorno fa' : `${diffDays} giorni fa`;
    } else if (diffHours > 0) {
      return diffHours === 1 ? '1 ora fa' : `${diffHours} ore fa`;
    } else {
      return 'Ora';
    }
  };

  return { formatTimeAgo };
};