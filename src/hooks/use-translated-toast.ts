import { useToast } from '@/hooks/use-toast';
import { useToastTranslations } from '@/utils/toastTranslations';

interface TranslatedToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
  variables?: Record<string, string>;
}

export const useTranslatedToast = () => {
  const { toast } = useToast();
  const { translateToast } = useToastTranslations();

  const showToast = ({ title, description, variant, variables }: TranslatedToastOptions) => {
    toast({
      title: translateToast(title, variables),
      description: description ? translateToast(description, variables) : undefined,
      variant,
    });
  };

  return { showToast };
};