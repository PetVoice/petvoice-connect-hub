import { useToast } from '@/hooks/use-toast';
import { useToastTranslations } from '@/utils/toastTranslations';

interface TranslatedToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  variables?: Record<string, string>;
  emoji?: string; // Optional custom emoji
}

export const useTranslatedToast = () => {
  const { toast } = useToast();
  const { translateToast } = useToastTranslations();

  // Get appropriate emoji based on variant and content
  const getEmoji = (variant?: string, title?: string, customEmoji?: string) => {
    if (customEmoji) return customEmoji;
    
    switch (variant) {
      case 'destructive': return '❌';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default:
        // Smart emoji selection based on title content
        if (title?.toLowerCase().includes('success') || title?.toLowerCase().includes('completo') || title?.toLowerCase().includes('salvato')) return '✅';
        if (title?.toLowerCase().includes('error') || title?.toLowerCase().includes('errore')) return '❌';
        if (title?.toLowerCase().includes('warning') || title?.toLowerCase().includes('attenzione')) return '⚠️';
        if (title?.toLowerCase().includes('protocol') || title?.toLowerCase().includes('training')) return '🎯';
        if (title?.toLowerCase().includes('music') || title?.toLowerCase().includes('audio')) return '🎵';
        if (title?.toLowerCase().includes('analys') || title?.toLowerCase().includes('analiz')) return '🔍';
        if (title?.toLowerCase().includes('chat') || title?.toLowerCase().includes('message')) return '💬';
        if (title?.toLowerCase().includes('upload') || title?.toLowerCase().includes('file')) return '📁';
        if (title?.toLowerCase().includes('pet') || title?.toLowerCase().includes('animale')) return '🐾';
        if (title?.toLowerCase().includes('calendar') || title?.toLowerCase().includes('evento')) return '📅';
        if (title?.toLowerCase().includes('diary') || title?.toLowerCase().includes('diario')) return '📔';
        return '🔔'; // Default notification emoji
    }
  };

  const showToast = ({ title, description, variant, variables, emoji }: TranslatedToastOptions) => {
    const translatedTitle = translateToast(title, variables);
    const selectedEmoji = getEmoji(variant, translatedTitle, emoji);
    
    toast({
      title: `${selectedEmoji} ${translatedTitle}`,
      description: description ? translateToast(description, variables) : undefined,
      variant,
    });
  };

  return { showToast };
};