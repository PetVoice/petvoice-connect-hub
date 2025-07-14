import React, { useState, useEffect, useCallback } from 'react';
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
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { it } from 'date-fns/locale';

// Types
interface ReferralProfile {
  id: string;
  referral_code: string;
  total_referrals: number;
  successful_conversions: number;
  total_credits_earned: number;
  current_tier: string;
  consecutive_months: number;
  is_leaderboard_visible: boolean;
}

interface ReferralData {
  id: string;
  referred_email: string;
  status: string;
  channel: string;
  credits_awarded: number;
  created_at: string;
  conversion_date?: string;
}

interface CreditTransaction {
  id: string;
  credit_type: string;
  amount: number;
  description: string;
  status: string;
  created_at: string;
  expires_at?: string;
}

interface Badge {
  id: string;
  badge_type: string;
  badge_name: string;
  badge_description: string;
  icon_name: string;
  earned_at: string;
}

interface Challenge {
  id: string;
  challenge_name: string;
  description: string;
  start_date: string;
  end_date: string;
  target_referrals: number;
  reward_credits: number;
  user_progress?: number;
  is_completed?: boolean;
}

interface SharingTemplate {
  id: string;
  platform: string;
  template_name: string;
  content: string;
  variables: any;
}

const TIER_CONFIG = {
  Bronze: { minReferrals: 0, color: 'bg-amber-600', next: 'Silver', nextTarget: 5 },
  Silver: { minReferrals: 5, color: 'bg-gray-400', next: 'Gold', nextTarget: 20 },
  Gold: { minReferrals: 20, color: 'bg-yellow-500', next: 'Platinum', nextTarget: 50 },
  Platinum: { minReferrals: 50, color: 'bg-purple-500', next: 'Diamond', nextTarget: 100 },
  Diamond: { minReferrals: 100, color: 'bg-blue-600', next: null, nextTarget: null }
};

const BADGE_ICONS = {
  first_referral: Trophy,
  streak_5: Zap,
  tier_gold: Crown,
  month_champion: Star,
  social_sharer: Share2,
  early_adopter: Sparkles
};

export default function AffiliationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State
  const [loading, setLoading] = useState(true);
  const [referralProfile, setReferralProfile] = useState<ReferralProfile | null>(null);
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [credits, setCredits] = useState<CreditTransaction[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [templates, setTemplates] = useState<SharingTemplate[]>([]);
  const [analytics, setAnalytics] = useState<any>({});
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  
  // UI State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<SharingTemplate | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  // Load data
  const loadReferralData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load or create referral profile
      let { data: profile } = await supabase
        .from('user_referrals')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        // Create new referral profile
        const referralCode = await generateReferralCode(user.email || '');
        const { data: newProfile } = await supabase
          .from('user_referrals')
          .insert({
            user_id: user.id,
            referral_code: referralCode
          })
          .select()
          .single();
        profile = newProfile;
      }

      setReferralProfile(profile);

      // Load referrals
      const { data: referralData } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      setReferrals(referralData || []);

      // Load credits
      const { data: creditData } = await supabase
        .from('referral_credits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setCredits(creditData || []);

      // Load badges
      const { data: badgeData } = await supabase
        .from('referral_badges')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      setBadges(badgeData || []);

      // Load challenges
      const { data: challengeData } = await supabase
        .from('referral_challenges')
        .select('*')
        .eq('is_active', true)
        .order('end_date', { ascending: true });

      setChallenges(challengeData || []);

      // Load sharing templates
      const { data: templateData } = await supabase
        .from('sharing_templates')
        .select('*')
        .eq('is_active', true);

      setTemplates(templateData || []);

    } catch (error) {
      console.error('Error loading referral data:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i dati di affiliazione",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

  const getCurrentTierInfo = () => {
    if (!referralProfile) return null;
    const tier = TIER_CONFIG[referralProfile.current_tier as keyof typeof TIER_CONFIG];
    const progress = tier.nextTarget ? 
      Math.min(100, (referralProfile.successful_conversions / tier.nextTarget) * 100) : 100;
    return { ...tier, progress };
  };

  const getActiveCredits = () => {
    return credits
      .filter(credit => credit.status === 'active')
      .reduce((sum, credit) => sum + credit.amount, 0);
  };

  useEffect(() => {
    loadReferralData();
  }, [loadReferralData]);

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
          </p>
        </div>
        <Button onClick={loadReferralData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Aggiorna
        </Button>
      </div>

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
              Disponibili per il prossimo rinnovo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversioni</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referralProfile.successful_conversions}</div>
            <p className="text-xs text-muted-foreground">
              Su {referralProfile.total_referrals} referral totali
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
              <Badge className={tierInfo?.color}>{referralProfile.current_tier}</Badge>
            </div>
            {tierInfo?.nextTarget && (
              <div className="mt-2">
                <Progress value={tierInfo.progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {tierInfo.nextTarget - referralProfile.successful_conversions} per {tierInfo.next}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Badges</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{badges.length}</div>
            <div className="flex gap-1 mt-2">
              {badges.slice(0, 3).map((badge) => {
                const IconComponent = BADGE_ICONS[badge.badge_type as keyof typeof BADGE_ICONS] || Star;
                return (
                  <IconComponent key={badge.id} className="h-4 w-4 text-yellow-500" />
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="sharing">Condivisione</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="challenges">Sfide</TabsTrigger>
          <TabsTrigger value="credits">Crediti</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="settings">Impostazioni</TabsTrigger>
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
                  Condividi questo codice per guadagnare crediti
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
                  Performance Mensile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Referral inviati</span>
                    <span className="font-bold">{referrals.filter(r => 
                      new Date(r.created_at) >= startOfMonth(new Date())
                    ).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conversioni</span>
                    <span className="font-bold text-green-600">
                      {referrals.filter(r => 
                        r.status === 'converted' && 
                        new Date(r.created_at) >= startOfMonth(new Date())
                      ).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Crediti guadagnati</span>
                    <span className="font-bold text-blue-600">
                      €{credits.filter(c => 
                        new Date(c.created_at) >= startOfMonth(new Date())
                      ).reduce((sum, c) => sum + c.amount, 0).toFixed(2)}
                    </span>
                  </div>
                </div>
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
                      <div>
                        <p className="font-medium">{referral.referred_email}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(referral.created_at), 'dd MMM yyyy', { locale: it })} · {referral.channel}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          referral.status === 'converted' ? 'default' : 
                          referral.status === 'registered' ? 'secondary' : 'outline'
                        }>
                          {referral.status === 'converted' ? 'Convertito' :
                           referral.status === 'registered' ? 'Registrato' : 'In attesa'}
                        </Badge>
                        {referral.credits_awarded > 0 && (
                          <Badge variant="secondary">
                            +€{referral.credits_awarded}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sharing Tab */}
        <TabsContent value="sharing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Condivisione</CardTitle>
                <CardDescription>
                  Usa i nostri template ottimizzati per i social media
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium capitalize">{template.platform}</h4>
                      <Button 
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(template);
                          shareToSocial(template.platform, template);
                        }}
                      >
                        Condividi
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.content.substring(0, 100)}...
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Messaggio Personalizzato</CardTitle>
                <CardDescription>
                  Crea il tuo messaggio personalizzato
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Scrivi qui il tuo messaggio personalizzato..."
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={() => copyToClipboard(
                      `${customMessage}\n\nUsa il mio codice: ${referralProfile.referral_code}\n${generateReferralLink(referralProfile.referral_code)}`
                    )}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copia
                  </Button>
                  <Button size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    Condividi
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Multi-Channel Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Canali di Distribuzione</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                  { name: 'Email', icon: Mail, color: 'text-blue-600' },
                  { name: 'WhatsApp', icon: MessageSquare, color: 'text-green-600' },
                  { name: 'Facebook', icon: Facebook, color: 'text-blue-700' },
                  { name: 'Instagram', icon: Instagram, color: 'text-pink-600' },
                  { name: 'Twitter', icon: Twitter, color: 'text-blue-400' },
                  { name: 'SMS', icon: Smartphone, color: 'text-gray-600' },
                  { name: 'QR Code', icon: QrCode, color: 'text-purple-600' },
                  { name: 'Link Diretto', icon: Link, color: 'text-indigo-600' }
                ].map((channel) => (
                  <Button
                    key={channel.name}
                    variant="outline"
                    className="h-20 flex-col"
                    onClick={() => {
                      if (channel.name === 'QR Code') {
                        setQrDialogOpen(true);
                      } else {
                        const template = templates.find(t => t.platform === channel.name.toLowerCase());
                        if (template) {
                          shareToSocial(channel.name.toLowerCase(), template);
                        }
                      }
                    }}
                  >
                    <channel.icon className={`h-6 w-6 ${channel.color}`} />
                    <span className="text-xs mt-1">{channel.name}</span>
                  </Button>
                ))}
              </div>
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
                  {referralProfile.total_referrals > 0 
                    ? Math.round((referralProfile.successful_conversions / referralProfile.total_referrals) * 100)
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
                  {referrals.length > 0 ? (() => {
                    const channelCounts = referrals.reduce((acc, curr) => {
                      acc[curr.channel] = (acc[curr.channel] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>);
                    const topChannel = Object.entries(channelCounts).sort(([,a], [,b]) => b - a)[0];
                    return topChannel ? topChannel[0] : 'N/A';
                  })() : 'N/A'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Streak Attuale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{referralProfile.consecutive_months}</div>
                <p className="text-xs text-muted-foreground">mesi consecutivi</p>
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Link Condivisi</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full">
                      <div className="w-full h-2 bg-blue-500 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium">{referralProfile.total_referrals}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Click Ricevuti</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full">
                      <div className="w-3/4 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium">{Math.round(referralProfile.total_referrals * 0.75)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Registrazioni</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full">
                      <div className="w-1/2 h-2 bg-yellow-500 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium">{Math.round(referralProfile.total_referrals * 0.5)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Conversioni Premium</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full">
                      <div 
                        className="h-2 bg-purple-500 rounded-full"
                        style={{ 
                          width: `${referralProfile.total_referrals > 0 
                            ? (referralProfile.successful_conversions / referralProfile.total_referrals) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{referralProfile.successful_conversions}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-6">
          <div className="grid gap-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      {challenge.challenge_name}
                    </CardTitle>
                    <Badge variant="secondary">
                      €{challenge.reward_credits} reward
                    </Badge>
                  </div>
                  <CardDescription>{challenge.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{challenge.user_progress || 0} / {challenge.target_referrals}</span>
                    </div>
                    <Progress 
                      value={((challenge.user_progress || 0) / challenge.target_referrals) * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Scade: {format(new Date(challenge.end_date), 'dd MMM yyyy')}</span>
                      <span>
                        {challenge.is_completed ? (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completata
                          </Badge>
                        ) : (
                          `${challenge.target_referrals - (challenge.user_progress || 0)} ancora`
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {challenges.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nessuna sfida attiva al momento</p>
                </CardContent>
              </Card>
            )}
          </div>
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
                    <div key={credit.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{credit.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(credit.created_at), 'dd MMM yyyy HH:mm')} · {credit.credit_type}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${credit.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {credit.amount > 0 ? '+' : ''}€{credit.amount.toFixed(2)}
                        </p>
                        <Badge variant={
                          credit.status === 'active' ? 'default' :
                          credit.status === 'redeemed' ? 'secondary' : 'outline'
                        }>
                          {credit.status === 'active' ? 'Attivo' :
                           credit.status === 'redeemed' ? 'Utilizzato' : 'Scaduto'}
                        </Badge>
                      </div>
                    </div>
                  ))}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <div className="text-lg font-bold">Auto-Apply</div>
                  <div className="text-xs text-muted-foreground">Al prossimo rinnovo</div>
                </Button>
                
                <Button variant="outline" className="h-20 flex-col">
                  <div className="text-lg font-bold">Cash Out</div>
                  <div className="text-xs text-muted-foreground">Min. €50 via PayPal</div>
                </Button>
              </div>
              
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  I crediti scadono dopo 24 mesi dall'assegnazione. I crediti in scadenza saranno utilizzati automaticamente.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => {
              const IconComponent = BADGE_ICONS[badge.badge_type as keyof typeof BADGE_ICONS] || Star;
              return (
                <Card key={badge.id} className="text-center">
                  <CardContent className="pt-6">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-4">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold">{badge.badge_name}</h3>
                    <p className="text-sm text-muted-foreground">{badge.badge_description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Ottenuto il {format(new Date(badge.earned_at), 'dd MMM yyyy')}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {badges.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Nessun Badge Ancora</h3>
                <p className="text-muted-foreground">
                  Inizia a invitare amici per sbloccare i tuoi primi badge!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Impostazioni Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="leaderboard">Mostra nella Leaderboard</Label>
                  <p className="text-sm text-muted-foreground">
                    Permetti di essere visibile nella classifica pubblica
                  </p>
                </div>
                <Switch 
                  id="leaderboard"
                  checked={referralProfile.is_leaderboard_visible}
                  onCheckedChange={async (checked) => {
                    await supabase
                      .from('user_referrals')
                      .update({ is_leaderboard_visible: checked })
                      .eq('user_id', user!.id);
                    setReferralProfile(prev => prev ? { ...prev, is_leaderboard_visible: checked } : null);
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gestione Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" onClick={() => copyToClipboard(referralProfile.referral_code, 'code')}>
                <Copy className="h-4 w-4 mr-2" />
                Copia Codice Referral
              </Button>
              
              <Button variant="outline" onClick={loadReferralData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Aggiorna Statistiche
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supporto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Headphones className="h-4 w-4 mr-2" />
                Contatta il Supporto
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Scarica Report Dettagliato
              </Button>
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