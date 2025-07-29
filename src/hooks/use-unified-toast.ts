import { useToast } from '@/hooks/use-toast';
import { useToastTranslations } from '@/utils/toastTranslations';

interface UnifiedToastOptions {
  title: string;
  description?: string;
  variables?: Record<string, string>;
}

export const useUnifiedToast = () => {
  const { toast } = useToast();
  const { translateToast } = useToastTranslations();

  // Verde per successi, conferme, aggiunte
  const showSuccessToast = ({ title, description, variables }: UnifiedToastOptions) => {
    const translatedTitle = translateToast(title, variables);
    const translatedDescription = description ? translateToast(description, variables) : undefined;
    
    toast({
      title: `✅ ${translatedTitle}`,
      description: translatedDescription,
      variant: 'success',
    });
  };

  // Rosso per errori
  const showErrorToast = ({ title, description, variables }: UnifiedToastOptions) => {
    const translatedTitle = translateToast(title, variables);
    const translatedDescription = description ? translateToast(description, variables) : undefined;
    
    toast({
      title: `❌ ${translatedTitle}`,
      description: translatedDescription,
      variant: 'destructive',
    });
  };

  // Rosso per eliminazioni
  const showDeleteToast = ({ title, description, variables }: UnifiedToastOptions) => {
    const translatedTitle = translateToast(title, variables);
    const translatedDescription = description ? translateToast(description, variables) : undefined;
    
    toast({
      title: `🗑️ ${translatedTitle}`,
      description: translatedDescription,
      variant: 'destructive',
    });
  };

  // Blu per informazioni
  const showInfoToast = ({ title, description, variables }: UnifiedToastOptions) => {
    const translatedTitle = translateToast(title, variables);
    const translatedDescription = description ? translateToast(description, variables) : undefined;
    
    toast({
      title: `ℹ️ ${translatedTitle}`,
      description: translatedDescription,
      variant: 'info',
    });
  };

  // Giallo per avvertimenti
  const showWarningToast = ({ title, description, variables }: UnifiedToastOptions) => {
    const translatedTitle = translateToast(title, variables);
    const translatedDescription = description ? translateToast(description, variables) : undefined;
    
    toast({
      title: `⚠️ ${translatedTitle}`,
      description: translatedDescription,
      variant: 'warning',
    });
  };

  // Verde per pet (aggiunte/modifiche)
  const showPetToast = ({ title, description, variables }: UnifiedToastOptions) => {
    const translatedTitle = translateToast(title, variables);
    const translatedDescription = description ? translateToast(description, variables) : undefined;
    
    toast({
      title: `🐾 ${translatedTitle}`,
      description: translatedDescription,
      variant: 'success',
    });
  };

  // Verde per analisi completate
  const showAnalysisToast = ({ title, description, variables }: UnifiedToastOptions) => {
    const translatedTitle = translateToast(title, variables);
    const translatedDescription = description ? translateToast(description, variables) : undefined;
    
    toast({
      title: `🔍 ${translatedTitle}`,
      description: translatedDescription,
      variant: 'success',
    });
  };

  // Verde per eventi calendario aggiunti/modificati
  const showCalendarToast = ({ title, description, variables }: UnifiedToastOptions) => {
    const translatedTitle = translateToast(title, variables);
    const translatedDescription = description ? translateToast(description, variables) : undefined;
    
    toast({
      title: `📅 ${translatedTitle}`,
      description: translatedDescription,
      variant: 'success',
    });
  };

  // Verde per voci diario aggiunte/modificate
  const showDiaryToast = ({ title, description, variables }: UnifiedToastOptions) => {
    const translatedTitle = translateToast(title, variables);
    const translatedDescription = description ? translateToast(description, variables) : undefined;
    
    toast({
      title: `📔 ${translatedTitle}`,
      description: translatedDescription,
      variant: 'success',
    });
  };

  // Verde per musica
  const showMusicToast = ({ title, description, variables }: UnifiedToastOptions) => {
    const translatedTitle = translateToast(title, variables);
    const translatedDescription = description ? translateToast(description, variables) : undefined;
    
    toast({
      title: `🎵 ${translatedTitle}`,
      description: translatedDescription,
      variant: 'success',
    });
  };

  // Verde per chat
  const showChatToast = ({ title, description, variables }: UnifiedToastOptions) => {
    const translatedTitle = translateToast(title, variables);
    const translatedDescription = description ? translateToast(description, variables) : undefined;
    
    toast({
      title: `💬 ${translatedTitle}`,
      description: translatedDescription,
      variant: 'success',
    });
  };

  // Verde per upload completati
  const showUploadToast = ({ title, description, variables }: UnifiedToastOptions) => {
    const translatedTitle = translateToast(title, variables);
    const translatedDescription = description ? translateToast(description, variables) : undefined;
    
    toast({
      title: `📁 ${translatedTitle}`,
      description: translatedDescription,
      variant: 'success',
    });
  };

  // Legacy fallback methods for backward compatibility
  const showToast = ({ title, description, variables, variant, type }: UnifiedToastOptions & { variant?: 'default' | 'destructive'; type?: string }) => {
    // Handle legacy type parameter
    if (type) {
      switch (type) {
        case 'success':
        case 'complete':
        case 'message':
        case 'upload':
          showSuccessToast({ title, description, variables });
          break;
        case 'error':
          showErrorToast({ title, description, variables });
          break;
        case 'delete':
          showDeleteToast({ title, description, variables });
          break;
        case 'info':
          showInfoToast({ title, description, variables });
          break;
        case 'warning':
          showWarningToast({ title, description, variables });
          break;
        default:
          showSuccessToast({ title, description, variables });
      }
    } else if (variant === 'destructive') {
      showErrorToast({ title, description, variables });
    } else {
      showSuccessToast({ title, description, variables });
    }
  };

  const showTranslatedToast = showToast; // Alias for legacy support
  
  // Legacy toast object for settings components
  const toastObject = {
    success: (message: string) => showSuccessToast({ title: message }),
    error: (message: string) => showErrorToast({ title: message }),
  };

  return {
    showSuccessToast,
    showErrorToast,
    showDeleteToast,
    showInfoToast,
    showWarningToast,
    showPetToast,
    showAnalysisToast,
    showCalendarToast,
    showDiaryToast,
    showMusicToast,
    showChatToast,
    showUploadToast,
    // Legacy methods
    showToast,
    showTranslatedToast,
    toast: toastObject,
  };
};