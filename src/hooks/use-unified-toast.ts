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
  };
};