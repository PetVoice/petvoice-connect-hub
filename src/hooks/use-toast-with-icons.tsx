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

// Tipi di toast con le loro icone ed emoticon
const toastIcons = {
  success: { icon: CheckCircle, className: "text-green-500", emoji: "✅" },
  error: { icon: XCircle, className: "text-red-500", emoji: "❌" },
  warning: { icon: AlertCircle, className: "text-yellow-500", emoji: "⚠️" },
  info: { icon: Info, className: "text-blue-500", emoji: "ℹ️" },
  delete: { icon: Trash2, className: "text-red-500", emoji: "🗑️" },
  user: { icon: UserPlus, className: "text-blue-500", emoji: "👤" },
  message: { icon: MessageCircle, className: "text-green-500", emoji: "💬" },
  settings: { icon: Settings, className: "text-gray-500", emoji: "⚙️" },
  upload: { icon: Upload, className: "text-blue-500", emoji: "📤" },
  download: { icon: Download, className: "text-blue-500", emoji: "📥" },
  rating: { icon: Star, className: "text-yellow-500", emoji: "⭐" },
  like: { icon: Heart, className: "text-red-500", emoji: "❤️" },
  complete: { icon: Zap, className: "text-green-500", emoji: "⚡" },
  achievement: { icon: Trophy, className: "text-gold-500", emoji: "🏆" },
  exercise: { icon: Target, className: "text-primary", emoji: "🎯" },
  time: { icon: Clock, className: "text-gray-500", emoji: "⏰" },
  security: { icon: Shield, className: "text-green-500", emoji: "🛡️" },
  locked: { icon: Lock, className: "text-gray-500", emoji: "🔒" },
};

type ToastType = keyof typeof toastIcons;

interface ToastWithIconOptions {
  title: string;
  description?: string;
  type?: ToastType;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
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
    
    // Determina automaticamente la variante se non specificata
    const toastVariant = variant || 
      (type === 'error' || type === 'delete' ? 'destructive' : 
       type === 'success' || type === 'complete' || type === 'achievement' ? 'success' :
       type === 'warning' ? 'warning' : 
       type === 'info' ? 'info' : 'default');

    toast({
      title: `${iconConfig.emoji} ${title}`,
      description,
      variant: toastVariant,
      duration
    });
  };

  return { showToast };
};