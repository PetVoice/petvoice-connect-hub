import React from 'react';
import { toast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info, 
  Trash2, 
  UserPlus, 
  MessageCircle, 
  Settings, 
  Upload, 
  Download,
  Star,
  Heart,
  Zap,
  Trophy,
  Target,
  Clock,
  Shield,
  Lock
} from 'lucide-react';

// Tipi di toast con le loro icone
const toastIcons = {
  success: { icon: CheckCircle, className: "text-green-500" },
  error: { icon: XCircle, className: "text-red-500" },
  warning: { icon: AlertCircle, className: "text-yellow-500" },
  info: { icon: Info, className: "text-blue-500" },
  delete: { icon: Trash2, className: "text-red-500" },
  user: { icon: UserPlus, className: "text-blue-500" },
  message: { icon: MessageCircle, className: "text-green-500" },
  settings: { icon: Settings, className: "text-gray-500" },
  upload: { icon: Upload, className: "text-blue-500" },
  download: { icon: Download, className: "text-blue-500" },
  rating: { icon: Star, className: "text-yellow-500" },
  like: { icon: Heart, className: "text-red-500" },
  complete: { icon: Zap, className: "text-green-500" },
  achievement: { icon: Trophy, className: "text-gold-500" },
  exercise: { icon: Target, className: "text-primary" },
  time: { icon: Clock, className: "text-gray-500" },
  security: { icon: Shield, className: "text-green-500" },
  locked: { icon: Lock, className: "text-gray-500" },
};

type ToastType = keyof typeof toastIcons;

interface ToastWithIconOptions {
  title: string;
  description?: string;
  type?: ToastType;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export const useToastWithIcon = () => {
  const showToast = ({
    title,
    description,
    type = 'info',
    variant,
    duration
  }: ToastWithIconOptions) => {
    const iconConfig = toastIcons[type];
    const IconComponent = iconConfig.icon;
    
    // Determina automaticamente la variante se non specificata
    const toastVariant = variant || (type === 'error' || type === 'delete' ? 'destructive' : 'default');

    toast({
      title: (
        <div className="flex items-center gap-2">
          <IconComponent className={`h-5 w-5 ${iconConfig.className}`} />
          <span>{title}</span>
        </div>
      ) as any,
      description,
      variant: toastVariant,
      duration
    });
  };

  return { showToast };
};