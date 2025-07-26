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
  Lock,
  Stethoscope,
  PawPrint,
  Calendar,
  Pill,
  Brain,
  Activity
} from 'lucide-react';

// Tipi di toast con le loro icone ed emoticon per PetVoice
const toastIcons = {
  success: { icon: CheckCircle, className: "text-success", emoji: "✅" },
  error: { icon: XCircle, className: "text-destructive", emoji: "❌" },
  warning: { icon: AlertCircle, className: "text-warning", emoji: "⚠️" },
  info: { icon: Info, className: "text-primary", emoji: "ℹ️" },
  delete: { icon: Trash2, className: "text-destructive", emoji: "🗑️" },
  user: { icon: UserPlus, className: "text-primary", emoji: "👤" },
  message: { icon: MessageCircle, className: "text-success", emoji: "💬" },
  settings: { icon: Settings, className: "text-muted-foreground", emoji: "⚙️" },
  upload: { icon: Upload, className: "text-primary", emoji: "📤" },
  download: { icon: Download, className: "text-primary", emoji: "📥" },
  rating: { icon: Star, className: "text-warning", emoji: "⭐" },
  like: { icon: Heart, className: "text-destructive", emoji: "❤️" },
  complete: { icon: Zap, className: "text-success", emoji: "⚡" },
  achievement: { icon: Trophy, className: "text-warning", emoji: "🏆" },
  exercise: { icon: Target, className: "text-primary", emoji: "🎯" },
  time: { icon: Clock, className: "text-muted-foreground", emoji: "⏰" },
  security: { icon: Shield, className: "text-success", emoji: "🛡️" },
  locked: { icon: Lock, className: "text-muted-foreground", emoji: "🔒" },
  // PetVoice specific
  pet: { icon: PawPrint, className: "text-primary", emoji: "🐾" },
  health: { icon: Stethoscope, className: "text-success", emoji: "🏥" },
  calendar: { icon: Calendar, className: "text-primary", emoji: "📅" },
  medicine: { icon: Pill, className: "text-warning", emoji: "💊" },
  analysis: { icon: Brain, className: "text-primary", emoji: "🔬" },
  vitals: { icon: Activity, className: "text-success", emoji: "📊" },
  celebration: { icon: Trophy, className: "text-warning", emoji: "🎉" },
  sync: { icon: Zap, className: "text-primary", emoji: "🔄" },
  bell: { icon: Clock, className: "text-warning", emoji: "🔔" },
  mail: { icon: MessageCircle, className: "text-primary", emoji: "📧" },
  save: { icon: CheckCircle, className: "text-success", emoji: "💾" },
  loading: { icon: Clock, className: "text-muted-foreground", emoji: "⏳" },
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
    duration = 4000
  }: ToastWithIconOptions) => {
    const iconConfig = toastIcons[type];
    
    // Determina automaticamente la variante se non specificata
    const toastVariant = variant || 
      (type === 'error' || type === 'delete' ? 'destructive' : 
       type === 'success' || type === 'complete' || type === 'achievement' || type === 'save' ? 'success' :
       type === 'warning' || type === 'medicine' || type === 'bell' ? 'warning' : 
       type === 'info' || type === 'pet' || type === 'health' || type === 'analysis' ? 'info' : 'default');

    toast({
      title: `${iconConfig.emoji} ${title}`,
      description,
      variant: toastVariant,
      duration
    });
  };

  // Metodi di convenienza per PetVoice
  const success = (title: string, description?: string) => 
    showToast({ title, description, type: 'success' });

  const error = (title: string, description?: string) => 
    showToast({ title, description, type: 'error' });

  const warning = (title: string, description?: string) => 
    showToast({ title, description, type: 'warning' });

  const info = (title: string, description?: string) => 
    showToast({ title, description, type: 'info' });

  // Toast specifici per PetVoice
  const petSuccess = (title: string, description?: string) => 
    showToast({ title, description, type: 'pet', variant: 'success' });

  const healthUpdate = (title: string, description?: string) => 
    showToast({ title, description, type: 'health', variant: 'info' });

  const analysisComplete = (title: string, description?: string) => 
    showToast({ title, description, type: 'analysis', variant: 'success' });

  const medicineReminder = (title: string, description?: string) => 
    showToast({ title, description, type: 'medicine', variant: 'warning' });

  const calendarEvent = (title: string, description?: string) => 
    showToast({ title, description, type: 'calendar', variant: 'info' });

  const celebration = (title: string, description?: string) => 
    showToast({ title, description, type: 'celebration', variant: 'success' });

  return { 
    showToast,
    success,
    error, 
    warning,
    info,
    petSuccess,
    healthUpdate,
    analysisComplete,
    medicineReminder,
    calendarEvent,
    celebration
  };
};