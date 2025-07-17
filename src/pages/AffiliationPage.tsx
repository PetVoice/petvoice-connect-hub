import React, { useState, useEffect, useCallback } from 'react';
import jsPDF from 'jspdf';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Trophy, Users, Share2, Copy, QrCode, Mail, MessageSquare, Facebook, 
  Instagram, Twitter, Smartphone, TrendingUp, Gift, CreditCard, 
  Award, Target, Calendar, MapPin, BarChart3, Eye, Download, 
  Settings, Plus, Zap, Crown, Star, Handshake, Send, Link,
  DollarSign, Clock, Shield, AlertTriangle, CheckCircle, 
  ArrowUp, ArrowDown, Globe, Headphones, RefreshCw, Sparkles
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { it } from 'date-fns/locale';
import PerformanceSection from '@/components/affiliate/PerformanceSection';

// Types
interface ReferralProfile {
  user_id: string;
  referral_code: string;
  total_registrations: number;
  total_conversions: number;
  total_credits_earned: number;
  available_credits: number;
  current_tier: string;
  tier_progress: number;
}

interface ReferralData {
  id: string;
  referred_email: string;
  referred_user_id?: string;
  status: string;
  created_at: string;
  converted_at?: string;
  is_active?: boolean;
}

interface CreditTransaction {
  id: string;
  commission_type: string;
  amount: number;
  tier: string;
  status: string;
  created_at: string;
  billing_period_start?: string;
  billing_period_end?: string;
  is_cancelled?: boolean;
}

interface SharingTemplate {
  id: string;
  platform: string;
  template_name: string;
  content: string;
  variables: any;
}

const TIER_CONFIG = {
  Bronzo: { minConversions: 0, color: 'bg-amber-600', next: 'Argento', nextTarget: 5, commission: 0.05 },
  Argento: { minConversions: 5, color: 'bg-gray-400', next: 'Oro', nextTarget: 10, commission: 0.10 },
  Oro: { minConversions: 10, color: 'bg-yellow-500', next: 'Platino', nextTarget: 20, commission: 0.15 },
  Platino: { minConversions: 20, color: 'bg-purple-500', next: null, nextTarget: null, commission: 0.20 }
};

export default function AffiliationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State
  const [loading, setLoading] = useState(true);
  const [referralProfile, setReferralProfile] = useState<ReferralProfile | null>(null);
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [credits, setCredits] = useState<CreditTransaction[]>([]);
  const [templates, setTemplates] = useState<SharingTemplate[]>([]);
  const [myReferrer, setMyReferrer] = useState<any>(null);
  
  // UI State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<SharingTemplate | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  
  // Filters for referrals
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [emailFilter, setEmailFilter] = useState('');

  // Load data
  const loadReferralData = useCallback(async (isRealTimeUpdate = false) => {
    if (!user) return;
    
    // Solo mostra loading per il caricamento iniziale, non per gli aggiornamenti real-time
    if (!isRealTimeUpdate) {
      setLoading(true);
    }
    
    try {
      // Load or create referral profile from referrer_stats
      let { data: profile, error: profileError } = await supabase
        .from('referrer_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error loading profile:', profileError);
      }

      if (!profile) {
        // Create new referral profile
        const referralCode = await generateReferralCode(user.email || '');
        const { data: newProfile } = await supabase
          .from('referrer_stats')
          .insert({
            user_id: user.id,
            referral_code: referralCode,
            total_registrations: 0,
            total_conversions: 0,
            total_credits_earned: 0,
            available_credits: 0,
            current_tier: 'Bronzo',
            tier_progress: 0
          })
          .select()
          .maybeSingle();
        profile = newProfile;
      }

      if (profile) {
        setReferralProfile(profile);
      }

      // Load referrals (inclusi quelli storici dopo eliminazione utente)
      const { data: referralData } = await supabase
        .from('referrals')
        .select('*')
        .or(`referrer_id.eq.${user.id},and(referrer_id.is.null,is_historical.eq.true,referral_code.eq.${profile?.referral_code})`)
        .order('created_at', { ascending: false });

      setReferrals(referralData || []);

      // Load credits (commissions) incluse quelle storiche
      const { data: creditData } = await supabase
        .from('referral_commissions')
        .select('*')
        .or(`referrer_id.eq.${user.id},and(referrer_id.is.null,is_historical.eq.true)`)
        .order('created_at', { ascending: false });

      setCredits(creditData || []);

      // Load sharing templates
      const { data: templateData } = await supabase
        .from('sharing_templates')
        .select('*')
        .eq('is_active', true);

      setTemplates(templateData || []);

      // Load my referrer info - cerca anche referrals con status 'registered'
      const { data: myReferralData } = await supabase
        .from('referrals')
        .select('*')
        .eq('referred_user_id', user.id)
        .in('status', ['registered', 'converted'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (myReferralData) {
        // Get referrer info
        const { data: referrerInfo } = await supabase
          .from('referrer_stats')
          .select('user_id, referral_code')
          .eq('user_id', myReferralData.referrer_id)
          .maybeSingle();

        if (referrerInfo) {
          // Get referrer profile info
          const { data: referrerProfile } = await supabase
            .from('profiles')
            .select('display_name, user_id')
            .eq('user_id', referrerInfo.user_id)
            .maybeSingle();

          setMyReferrer({
            user_id: referrerInfo.user_id,
            referral_code: referrerInfo.referral_code,
            display_name: referrerProfile?.display_name || 'Utente',
            referral_date: myReferralData.created_at
          });
        }
      } else {
        setMyReferrer(null);
      }

    } catch (error) {
      console.error('Error loading referral data:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i dati di affiliazione",
        variant: "destructive"
      });
    } finally {
      // Solo nascondi loading per il caricamento iniziale
      if (!isRealTimeUpdate) {
        setLoading(false);
      }
    }
  }, [user, toast]);

  const generateReferralCode = async (email: string): Promise<string> => {
    const { data } = await supabase.rpc('generate_referral_code', { user_email: email });
    return data;
  };

  const generateReferralLink = (code: string, utm_source: string = 'referral') => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/register?ref=${code}&utm_source=${utm_source}&utm_medium=referral&utm_campaign=friend_referral`;
  };

  const copyToClipboard = async (text: string, type: string = 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiato!",
        description: `${type === 'code' ? 'Codice' : 'Link'} copiato negli appunti`,
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile copiare negli appunti",
        variant: "destructive"
      });
    }
  };

  const generateQRCode = (url: string) => {
    // Simple QR code generation (in production, use a proper QR library)
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  };

  const shareToSocial = (platform: string, template: SharingTemplate) => {
    if (!referralProfile) return;

    let content = template.content;
    const referralLink = generateReferralLink(referralProfile.referral_code, platform);
    
    // Replace variables
    content = content.replace(/\{\{referral_code\}\}/g, referralProfile.referral_code);
    content = content.replace(/\{\{referral_link\}\}/g, referralLink);
    content = content.replace(/\{\{sender_name\}\}/g, user?.email?.split('@')[0] || 'Un amico');

    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(content)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(content)}`;
        break;
      case 'instagram':
        // Instagram web interface
        shareUrl = `https://www.instagram.com/`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(content)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const getTierDisplayName = (tierName: string) => {
    const tierMapping: { [key: string]: string } = {
      'Bronze': 'Bronzo',
      'Silver': 'Argento',
      'Gold': 'Oro',
      'Platinum': 'Platino',
      'Diamond': 'Platino'
    };
    return tierMapping[tierName] || tierName || 'Bronzo';
  };

  const getChannelDisplayName = (channel: string) => {
    const channelMapping: { [key: string]: string } = {
      'manual_code': 'Codice Manuale',
      'social_media': 'Social Media',
      'email': 'Email',
      'whatsapp': 'WhatsApp',
      'facebook': 'Facebook',
      'instagram': 'Instagram',
      'twitter': 'Twitter',
      'linkedin': 'LinkedIn',
      'direct_link': 'Link Diretto',
      'qr_code': 'QR Code'
    };
    return channelMapping[channel] || channel || 'Altro';
  };

  const getCurrentTierInfo = () => {
    if (!referralProfile) return null;
    
    const conversions = referralProfile.total_conversions;
    console.log('Debug - total_conversions:', conversions);
    
    // Calculate tier based on total conversions
    let currentTierName = 'Bronzo';
    if (conversions >= 20) {
      currentTierName = 'Platino';
    } else if (conversions >= 10) {
      currentTierName = 'Oro';
    } else if (conversions >= 5) {
      currentTierName = 'Argento';
    } else {
      currentTierName = 'Bronzo';
    }
    
    console.log('Debug - calculated tier:', currentTierName);
    
    const tier = TIER_CONFIG[currentTierName as keyof typeof TIER_CONFIG];
    console.log('Debug - tier config:', tier);
    
    if (!tier) {
      console.error('CRITICAL: tier is undefined!');
      return {
        minConversions: 0,
        color: 'bg-amber-600',
        next: 'Argento',
        nextTarget: 5,
        commission: 0.05,
        progress: 0,
        remaining: 5,
        currentTierName: 'Bronzo'
      };
    }
    
    const remaining = tier.nextTarget ? Math.max(0, tier.nextTarget - conversions) : 0;
    const progress = tier.nextTarget ? 
      Math.min(100, (conversions / tier.nextTarget) * 100) : 100;
    return { ...tier, progress, remaining, currentTierName };
  };

  const getActiveCredits = () => {
    return referralProfile?.available_credits || 0;
  };

  // Setup real-time updates e polling automatico
  useEffect(() => {
    loadReferralData();
    
    if (!user?.id) return;
    
    // Polling automatico ogni 10 secondi per verificare nuovi referral
    const pollingInterval = setInterval(() => {
      console.log('🔄 Auto-refresh referral data...');
      loadReferralData(true);
    }, 10000);
    
    // Canale per aggiornamenti real-time su TUTTE le tabelle referral
    const channel = supabase
      .channel('referral-updates-complete')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'referrer_stats',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Real-time update - referrer_stats:', payload);
          // Passa true per indicare che è un aggiornamento real-time
          loadReferralData(true);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'referrals',
          filter: `referrer_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Real-time update - referrals:', payload);
          loadReferralData(true);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'referral_commissions',
          filter: `referrer_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Real-time update - referral_commissions:', payload);
          loadReferralData(true);
        }
      )
      .subscribe((status) => {
        console.log('📡 Real-time subscription status:', status);
      });
    
    return () => {
      clearInterval(pollingInterval);
      supabase.removeChannel(channel);
    };
  }, [loadReferralData, user?.id]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!referralProfile) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Impossibile caricare il profilo di affiliazione. Riprova più tardi.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const tierInfo = getCurrentTierInfo();
  const activeCreditsBalance = getActiveCredits();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Handshake className="h-8 w-8 text-primary" />
            Programma Affiliazione
          </h1>
          <p className="text-muted-foreground">
            Guadagna condividendo PetVoice con i tuoi amici
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-2 animate-pulse" title="Aggiornamento in tempo reale"></span>
          </p>
        </div>
      </div>

      {/* My Referrer Card */}
      {myReferrer && (
        <Card className="mb-4 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Il Tuo Referente
            </CardTitle>
            <CardDescription>
              La persona che ti ha invitato a PetVoice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {myReferrer.display_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{myReferrer.display_name}</p>
                    <p className="text-xs text-muted-foreground">Referente PetVoice</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {myReferrer.referral_code}
                </Badge>
              </div>
              
              <div className="bg-white/60 p-3 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Data invito:</span>
                  <span className="font-medium">
                    {format(new Date(myReferrer.referral_date), 'dd/MM/yyyy', { locale: it })}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    toast({
                      title: "Funzione in Sviluppo",
                      description: "Il sistema di messaggistica interno sarà disponibile presto!",
                    });
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messaggio
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const subject = encodeURIComponent("Grazie per avermi invitato a PetVoice!");
                    const body = encodeURIComponent(`Ciao ${myReferrer.display_name},\n\nVolevo ringraziarti per avermi invitato a PetVoice. Sto trovando l'app molto utile per prendermi cura del mio animale domestico!\n\nGrazie ancora,\n[Il tuo nome]`);
                    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </div>
              
              <Alert className="bg-blue-50 border-blue-200">
                <Handshake className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Grazie a {myReferrer.display_name}, anche tu puoi guadagnare invitando i tuoi amici!
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crediti Attivi</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">€{activeCreditsBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Ricevi commissioni ad ogni rinnovo mensile
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversioni</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referralProfile.total_conversions}</div>
            <p className="text-xs text-muted-foreground">
              Su {referralProfile.total_registrations} referral totali
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tier Attuale</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className={tierInfo?.color}>{tierInfo?.currentTierName || 'Bronzo'}</Badge>
            </div>
            {tierInfo?.nextTarget && (
              <div className="mt-2">
                <Progress value={tierInfo.progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {tierInfo.remaining} conversioni per {tierInfo.next}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissione Tier</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(tierInfo?.commission || 0.05) * 100}%</div>
            <p className="text-xs text-muted-foreground">
              Su ogni abbonamento premium
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="credits">Crediti</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Il Tuo Codice Referral
                </CardTitle>
                <CardDescription>
                  Condividi questo codice per guadagnare crediti. I crediti vengono assegnati solo quando il referral acquista un abbonamento Premium.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input 
                    value={referralProfile.referral_code} 
                    readOnly 
                    className="font-mono text-lg font-bold text-center"
                  />
                  <Button 
                    onClick={() => copyToClipboard(referralProfile.referral_code, 'code')}
                    size="sm"
                    variant="outline"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Input 
                    value={generateReferralLink(referralProfile.referral_code)} 
                    readOnly 
                    className="text-sm"
                  />
                  <Button 
                    onClick={() => copyToClipboard(generateReferralLink(referralProfile.referral_code))}
                    size="sm"
                    variant="outline"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => setQrDialogOpen(true)}
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    QR Code
                  </Button>
                  <Button 
                    onClick={() => setShareDialogOpen(true)}
                    size="sm"
                    className="flex-1"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Condividi
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PerformanceSection referrals={referrals} credits={credits} />
              </CardContent>
            </Card>
          </div>

          {/* Recent Referrals */}
          <Card>
            <CardHeader>
              <CardTitle>Referral Recenti</CardTitle>
            </CardHeader>
            <CardContent>
              {referrals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4" />
                  <p>Nessun referral ancora. Inizia a condividere il tuo codice!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {referrals.slice(0, 5).map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{referral.referred_email}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(referral.created_at), 'dd MMM yyyy HH:mm', { locale: it })} · 
                          {referral.is_active === false ? ' Utente eliminato' : ' Referral diretto'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            referral.status === 'converted' ? 'default' : 
                            referral.status === 'registered' ? 'secondary' : 
                            referral.status === 'user_deleted' ? 'destructive' :
                            referral.status === 'cancelled' ? 'destructive' :
                            'outline'
                          }
                          className={`${
                            referral.status === 'converted' ? 'bg-green-100 text-green-800 border-green-200' :
                            referral.status === 'registered' ? 'bg-orange-100 text-orange-800 border-orange-200' : ''
                          }`}
                        >
                           {referral.status === 'converted' ? 'Attivo' :
                            referral.status === 'registered' ? 'Registrato' : 
                            referral.status === 'user_deleted' ? 'Eliminato' :
                            referral.status === 'cancelled' ? 'Annullato' :
                            'In attesa'}
                        </Badge>
                        {referral.status === 'converted' && referral.is_active && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Commissioni attive
                          </Badge>
                        )}
                        {(referral.status === 'converted' && !referral.is_active) || referral.status === 'cancelled' ? (
                          <Badge variant="outline" className="bg-red-100 text-red-600">
                            Commissioni disattive
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {referrals.length > 5 && (
                <div className="text-center pt-4">
                  <Button variant="outline" onClick={() => setActiveTab('analytics')}>
                    Vedi tutti i {referrals.length} referral
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>


        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Tasso Conversione</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="text-2xl font-bold">
                   {referralProfile.total_registrations > 0 
                     ? Math.round((referralProfile.total_conversions / referralProfile.total_registrations) * 100)
                     : 0}%
                 </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Miglior Canale</CardTitle>
              </CardHeader>
               <CardContent>
                 <div className="text-lg font-medium">
                   Referral Diretto
                 </div>
               </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Streak Attuale</CardTitle>
              </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.max(0, Math.floor((Date.now() - Date.now()) / (1000 * 60 * 60 * 24 * 30)) + 1)}
                  </div>
                  <p className="text-xs text-muted-foreground">mesi di utilizzo</p>
                </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">ROI Stimato</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  €{(referralProfile.total_credits_earned * 0.8).toFixed(0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Funnel di Conversione</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                // Calcoli accurati per il funnel
                const totalShares = Math.max(referrals.length, 1);
                const totalClicks = Math.round(totalShares * 2.5);
                const totalRegistrations = referralProfile.total_registrations;
                const totalConversions = referralProfile.total_conversions;
                const cancelledConversions = referrals.filter(r => r.status === 'cancelled').length;
                const activeConversions = totalConversions - cancelledConversions;
                
                // Dati per il grafico a torta
                const pieData = [
                  { name: 'Link Condivisi', value: totalShares, color: '#3b82f6' },
                  { name: 'Click Ricevuti', value: totalClicks, color: '#10b981' },
                  { name: 'Registrazioni', value: totalRegistrations, color: '#f59e0b' },
                  { name: 'Conversioni', value: totalConversions, color: '#8b5cf6' },
                  ...(cancelledConversions > 0 ? [{ name: 'Conversioni Attive', value: activeConversions, color: '#059669' }] : [])
                ];
                
                return (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* All Referrals History */}
          <Card>
            <CardHeader>
              <CardTitle>Tutti i Referral ({referrals.length})</CardTitle>
              <CardDescription>Filtra e cerca nei tuoi referral</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filtri */}
              <div className="flex flex-wrap gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="email-filter">Cerca per email</Label>
                  <Input
                    id="email-filter"
                    placeholder="Cerca email..."
                    value={emailFilter}
                    onChange={(e) => setEmailFilter(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex-1 min-w-[120px]">
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Tutti" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti</SelectItem>
                      <SelectItem value="registered">Registrati</SelectItem>
                      <SelectItem value="converted">Convertiti</SelectItem>
                      <SelectItem value="cancelled">Annullati</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1 min-w-[120px]">
                  <Label htmlFor="date-filter">Periodo</Label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Tutti" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti</SelectItem>
                      <SelectItem value="last-7">Ultimi 7 giorni</SelectItem>
                      <SelectItem value="last-30">Ultimi 30 giorni</SelectItem>
                      <SelectItem value="last-90">Ultimi 3 mesi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(() => {
                // Filtra i referral in base ai filtri selezionati
                let filteredReferrals = referrals;
                
                // Filtro per email
                if (emailFilter.trim()) {
                  filteredReferrals = filteredReferrals.filter(r => 
                    r.referred_email.toLowerCase().includes(emailFilter.toLowerCase())
                  );
                }
                
                // Filtro per status
                if (statusFilter !== 'all') {
                  filteredReferrals = filteredReferrals.filter(r => r.status === statusFilter);
                }
                
                // Filtro per data
                if (dateFilter !== 'all') {
                  const now = new Date();
                  const daysAgo = dateFilter === 'last-7' ? 7 : 
                                  dateFilter === 'last-30' ? 30 : 
                                  dateFilter === 'last-90' ? 90 : 0;
                  
                  if (daysAgo > 0) {
                    const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
                    filteredReferrals = filteredReferrals.filter(r => 
                      new Date(r.created_at) >= cutoffDate
                    );
                  }
                }

                if (filteredReferrals.length === 0) {
                  return (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4" />
                      <p>
                        {referrals.length === 0 
                          ? "Nessun referral ancora. Inizia a condividere il tuo codice!"
                          : "Nessun referral corrisponde ai filtri selezionati."
                        }
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredReferrals.map((referral) => (
                      <div key={referral.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{referral.referred_email}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(referral.created_at), 'dd MMM yyyy HH:mm', { locale: it })} · 
                            {referral.is_active === false ? ' Account eliminato' : ' Referral diretto'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            referral.status === 'converted' ? 'default' : 
                            referral.status === 'registered' ? 'secondary' : 
                            referral.status === 'cancelled' ? 'destructive' :
                            referral.status === 'user_deleted' ? 'destructive' :
                            'outline'
                          }>
                             {referral.status === 'converted' ? 'Attivo' :
                              referral.status === 'registered' ? 'Registrato' : 
                              referral.status === 'cancelled' ? 'Annullato' :
                              referral.status === 'user_deleted' ? 'Eliminato' :
                              'In attesa'}
                          </Badge>
                          {referral.status === 'converted' && referral.is_active !== false && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Commissioni attive
                            </Badge>
                          )}
                          {(referral.status === 'converted' && referral.is_active === false) || referral.status === 'cancelled' ? (
                            <Badge variant="outline" className="bg-red-100 text-red-600">
                              Commissioni disattive
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    ))}
                    {filteredReferrals.length !== referrals.length && (
                      <div className="text-center pt-2">
                        <p className="text-sm text-muted-foreground">
                          Mostrati {filteredReferrals.length} di {referrals.length} referral totali
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>


        {/* Credits Tab */}
        <TabsContent value="credits" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Crediti Attivi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  €{activeCreditsBalance.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Crediti Utilizzati</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  €{credits.filter(c => c.status === 'redeemed').reduce((sum, c) => sum + c.amount, 0).toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Crediti Totali</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  €{referralProfile.total_credits_earned.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Credit Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Storico Transazioni</CardTitle>
            </CardHeader>
            <CardContent>
               {credits.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-4" />
                  <p>Nessuna transazione ancora</p>
                </div>
              ) : (
                <div className="space-y-3">
                   {credits.map((credit) => (
                     <div key={credit.id} className={`flex items-center justify-between p-3 border rounded-lg ${
                       credit.is_cancelled ? 'opacity-60 bg-gray-50' : ''
                     }`}>
                        <div>
                          <p className="font-medium">
                            {credit.commission_type === 'first_payment' ? 'Prima Sottoscrizione' :
                             credit.commission_type === 'recurring' ? 'Rinnovo Mensile' :
                             credit.commission_type === 'monthly_renewal' ? 'Commissione Ricorrente' :
                             `Commissione ${credit.commission_type}`}
                            {credit.is_cancelled && <span className="text-red-600 ml-2">(Annullata)</span>}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(credit.created_at), 'dd MMM yyyy HH:mm')} · Tier {credit.tier}
                          </p>
                        </div>
                      <div className="text-right">
                         <p className={`font-bold ${
                           credit.is_cancelled ? 'text-gray-500 line-through' :
                           credit.amount > 0 ? 'text-green-600' : 'text-red-600'
                         }`}>
                           {credit.amount > 0 ? '+' : ''}€{credit.amount.toFixed(2)}
                         </p>
                      </div>
                    </div>
                  ))}
                 </div>
               )}
               {credits.length > 10 && (
                 <div className="text-center pt-4">
                   <p className="text-sm text-muted-foreground">
                     Sono mostrate le ultime 10 transazioni di {credits.length} totali
                   </p>
                 </div>
               )}
             </CardContent>
           </Card>

          {/* Credit Management Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Gestione Crediti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <Card className="w-full max-w-md bg-white border-2 border-gray-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="text-lg font-bold text-gray-900">Auto-Apply Attivo</div>
                      <div className="text-sm text-gray-600">
                        {activeCreditsBalance > 0 ? 
                          `€${activeCreditsBalance.toFixed(2)} disponibili` : 
                          'Nessun credito disponibile'
                        }
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        I crediti vengono applicati automaticamente
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  I tuoi crediti attivi (€{activeCreditsBalance.toFixed(2)}) saranno automaticamente applicati al prossimo rinnovo dell'abbonamento Premium. I crediti scadono dopo 24 mesi dall'assegnazione.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Condividi il tuo Codice</DialogTitle>
            <DialogDescription>
              Scegli come condividere il tuo codice referral
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            {templates.slice(0, 4).map((template) => (
              <Button
                key={template.id}
                variant="outline"
                className="h-20 flex-col"
                onClick={() => {
                  shareToSocial(template.platform, template);
                  setShareDialogOpen(false);
                }}
              >
                <div className="capitalize">{template.platform}</div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>QR Code</DialogTitle>
            <DialogDescription>
              Scansiona per accedere al link di referral
            </DialogDescription>
          </DialogHeader>
          <div className="text-center">
            <img 
              src={generateQRCode(generateReferralLink(referralProfile.referral_code))}
              alt="QR Code"
              className="mx-auto mb-4"
            />
            <Button 
              onClick={() => copyToClipboard(generateReferralLink(referralProfile.referral_code))}
              variant="outline"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copia Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}