import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  MessageSquare, 
  Globe, 
  MapPin, 
  Heart, 
  GraduationCap,
  AlertTriangle,
  Send,
  Search,
  Filter,
  MoreVertical,
  Shield,
  UserCheck,
  Stethoscope,
  Dog,
  Cat,
  Volume2,
  VolumeX,
  Image,
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  FileText,
  Phone,
  Share2,
  Flag,
  Settings,
  Star,
  ThumbsUp,
  MessageCircle,
  BookmarkIcon,
  EyeOff,
  Ban,
  ChevronDown,
  Mic,
  MicOff,
  Languages,
  Zap,
  Crown,
  MapPinIcon,
  Siren,
  Plus,
  X,
  Bell,
  BellOff,
  Camera
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePets } from '@/contexts/PetContext';
import { toast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

// Types
interface Channel {
  id: string;
  name: string;
  description: string;
  channel_type: 'country' | 'pet_type' | 'breed' | 'general';
  country_code?: string;
  pet_type?: 'dog' | 'cat' | 'other';
  breed?: string;
  emoji?: string;
  is_active: boolean;
}

interface Message {
  id: string;
  content?: string;
  user_id: string;
  channel_id: string;
  message_type: 'text' | 'voice' | 'image';
  is_emergency: boolean;
  file_url?: string;
  voice_duration?: number;
  metadata: any;
  created_at: string;
  user_profile?: {
    display_name: string;
    avatar_url?: string;
  };
}

interface LocalAlert {
  id: string;
  title: string;
  description: string;
  alert_type: 'health' | 'emergency' | 'environment' | 'outbreak';
  severity: 'info' | 'warning' | 'emergency';
  country_code: string;
  affected_species?: string[];
  verification_status: 'pending' | 'verified' | 'false_report';
  reports_count: number;
  created_at: string;
  user_profile?: {
    display_name: string;
  };
}

// Complete country list from AddPetDialog
const COUNTRIES = [
  { code: 'AD', name: 'Andorra', flag: '🇦🇩' },
  { code: 'AE', name: 'Emirati Arabi Uniti', flag: '🇦🇪' },
  { code: 'AF', name: 'Afghanistan', flag: '🇦🇫' },
  { code: 'AG', name: 'Antigua e Barbuda', flag: '🇦🇬' },
  { code: 'AI', name: 'Anguilla', flag: '🇦🇮' },
  { code: 'AL', name: 'Albania', flag: '🇦🇱' },
  { code: 'AM', name: 'Armenia', flag: '🇦🇲' },
  { code: 'AO', name: 'Angola', flag: '🇦🇴' },
  { code: 'AQ', name: 'Antartide', flag: '🇦🇶' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'AS', name: 'Samoa Americane', flag: '🇦🇸' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'AW', name: 'Aruba', flag: '🇦🇼' },
  { code: 'AX', name: 'Isole Åland', flag: '🇦🇽' },
  { code: 'AZ', name: 'Azerbaigian', flag: '🇦🇿' },
  { code: 'BA', name: 'Bosnia ed Erzegovina', flag: '🇧🇦' },
  { code: 'BB', name: 'Barbados', flag: '🇧🇧' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'BE', name: 'Belgio', flag: '🇧🇪' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
  { code: 'BH', name: 'Bahrein', flag: '🇧🇭' },
  { code: 'BI', name: 'Burundi', flag: '🇧🇮' },
  { code: 'BJ', name: 'Benin', flag: '🇧🇯' },
  { code: 'BL', name: 'Saint-Barthélemy', flag: '🇧🇱' },
  { code: 'BM', name: 'Bermuda', flag: '🇧🇲' },
  { code: 'BN', name: 'Brunei', flag: '🇧🇳' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴' },
  { code: 'BR', name: 'Brasile', flag: '🇧🇷' },
  { code: 'BS', name: 'Bahamas', flag: '🇧🇸' },
  { code: 'BT', name: 'Bhutan', flag: '🇧🇹' },
  { code: 'BV', name: 'Isola Bouvet', flag: '🇧🇻' },
  { code: 'BW', name: 'Botswana', flag: '🇧🇼' },
  { code: 'BY', name: 'Bielorussia', flag: '🇧🇾' },
  { code: 'BZ', name: 'Belize', flag: '🇧🇿' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'CC', name: 'Isole Cocos', flag: '🇨🇨' },
  { code: 'CD', name: 'Repubblica Democratica del Congo', flag: '🇨🇩' },
  { code: 'CF', name: 'Repubblica Centrafricana', flag: '🇨🇫' },
  { code: 'CG', name: 'Repubblica del Congo', flag: '🇨🇬' },
  { code: 'CH', name: 'Svizzera', flag: '🇨🇭' },
  { code: 'CI', name: 'Costa d\'Avorio', flag: '🇨🇮' },
  { code: 'CK', name: 'Isole Cook', flag: '🇨🇰' },
  { code: 'CL', name: 'Cile', flag: '🇨🇱' },
  { code: 'CM', name: 'Camerun', flag: '🇨🇲' },
  { code: 'CN', name: 'Cina', flag: '🇨🇳' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'CU', name: 'Cuba', flag: '🇨🇺' },
  { code: 'CV', name: 'Capo Verde', flag: '🇨🇻' },
  { code: 'CW', name: 'Curaçao', flag: '🇨🇼' },
  { code: 'CX', name: 'Isola Christmas', flag: '🇨🇽' },
  { code: 'CY', name: 'Cipro', flag: '🇨🇾' },
  { code: 'CZ', name: 'Repubblica Ceca', flag: '🇨🇿' },
  { code: 'DE', name: 'Germania', flag: '🇩🇪' },
  { code: 'DJ', name: 'Gibuti', flag: '🇩🇯' },
  { code: 'DK', name: 'Danimarca', flag: '🇩🇰' },
  { code: 'DM', name: 'Dominica', flag: '🇩🇲' },
  { code: 'DO', name: 'Repubblica Dominicana', flag: '🇩🇴' },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪' },
  { code: 'EG', name: 'Egitto', flag: '🇪🇬' },
  { code: 'EH', name: 'Sahara Occidentale', flag: '🇪🇭' },
  { code: 'ER', name: 'Eritrea', flag: '🇪🇷' },
  { code: 'ES', name: 'Spagna', flag: '🇪🇸' },
  { code: 'ET', name: 'Etiopia', flag: '🇪🇹' },
  { code: 'FI', name: 'Finlandia', flag: '🇫🇮' },
  { code: 'FJ', name: 'Figi', flag: '🇫🇯' },
  { code: 'FK', name: 'Isole Falkland', flag: '🇫🇰' },
  { code: 'FM', name: 'Micronesia', flag: '🇫🇲' },
  { code: 'FO', name: 'Isole Fær Øer', flag: '🇫🇴' },
  { code: 'FR', name: 'Francia', flag: '🇫🇷' },
  { code: 'GA', name: 'Gabon', flag: '🇬🇦' },
  { code: 'GB', name: 'Regno Unito', flag: '🇬🇧' },
  { code: 'GD', name: 'Grenada', flag: '🇬🇩' },
  { code: 'GE', name: 'Georgia', flag: '🇬🇪' },
  { code: 'GF', name: 'Guyana Francese', flag: '🇬🇫' },
  { code: 'GG', name: 'Guernsey', flag: '🇬🇬' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'GI', name: 'Gibilterra', flag: '🇬🇮' },
  { code: 'GL', name: 'Groenlandia', flag: '🇬🇱' },
  { code: 'GM', name: 'Gambia', flag: '🇬🇲' },
  { code: 'GN', name: 'Guinea', flag: '🇬🇳' },
  { code: 'GP', name: 'Guadalupa', flag: '🇬🇵' },
  { code: 'GQ', name: 'Guinea Equatoriale', flag: '🇬🇶' },
  { code: 'GR', name: 'Grecia', flag: '🇬🇷' },
  { code: 'GS', name: 'Georgia del Sud e Sandwich Australi', flag: '🇬🇸' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹' },
  { code: 'GU', name: 'Guam', flag: '🇬🇺' },
  { code: 'GW', name: 'Guinea-Bissau', flag: '🇬🇼' },
  { code: 'GY', name: 'Guyana', flag: '🇬🇾' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
  { code: 'HM', name: 'Isole Heard e McDonald', flag: '🇭🇲' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳' },
  { code: 'HR', name: 'Croazia', flag: '🇭🇷' },
  { code: 'HT', name: 'Haiti', flag: '🇭🇹' },
  { code: 'HU', name: 'Ungheria', flag: '🇭🇺' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'IE', name: 'Irlanda', flag: '🇮🇪' },
  { code: 'IL', name: 'Israele', flag: '🇮🇱' },
  { code: 'IM', name: 'Isola di Man', flag: '🇮🇲' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'IO', name: 'Territorio britannico dell\'Oceano Indiano', flag: '🇮🇴' },
  { code: 'IQ', name: 'Iraq', flag: '🇮🇶' },
  { code: 'IR', name: 'Iran', flag: '🇮🇷' },
  { code: 'IS', name: 'Islanda', flag: '🇮🇸' },
  { code: 'IT', name: 'Italia', flag: '🇮🇹' },
  { code: 'JE', name: 'Jersey', flag: '🇯🇪' },
  { code: 'JM', name: 'Giamaica', flag: '🇯🇲' },
  { code: 'JO', name: 'Giordania', flag: '🇯🇴' },
  { code: 'JP', name: 'Giappone', flag: '🇯🇵' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'KG', name: 'Kirghizistan', flag: '🇰🇬' },
  { code: 'KH', name: 'Cambogia', flag: '🇰🇭' },
  { code: 'KI', name: 'Kiribati', flag: '🇰🇮' },
  { code: 'KM', name: 'Comore', flag: '🇰🇲' },
  { code: 'KN', name: 'Saint Kitts e Nevis', flag: '🇰🇳' },
  { code: 'KP', name: 'Corea del Nord', flag: '🇰🇵' },
  { code: 'KR', name: 'Corea del Sud', flag: '🇰🇷' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼' },
  { code: 'KY', name: 'Isole Cayman', flag: '🇰🇾' },
  { code: 'KZ', name: 'Kazakistan', flag: '🇰🇿' },
  { code: 'LA', name: 'Laos', flag: '🇱🇦' },
  { code: 'LB', name: 'Libano', flag: '🇱🇧' },
  { code: 'LC', name: 'Santa Lucia', flag: '🇱🇨' },
  { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: 'LR', name: 'Liberia', flag: '🇱🇷' },
  { code: 'LS', name: 'Lesotho', flag: '🇱🇸' },
  { code: 'LT', name: 'Lituania', flag: '🇱🇹' },
  { code: 'LU', name: 'Lussemburgo', flag: '🇱🇺' },
  { code: 'LV', name: 'Lettonia', flag: '🇱🇻' },
  { code: 'LY', name: 'Libia', flag: '🇱🇾' },
  { code: 'MA', name: 'Marocco', flag: '🇲🇦' },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨' },
  { code: 'MD', name: 'Moldavia', flag: '🇲🇩' },
  { code: 'ME', name: 'Montenegro', flag: '🇲🇪' },
  { code: 'MF', name: 'Saint-Martin', flag: '🇲🇫' },
  { code: 'MG', name: 'Madagascar', flag: '🇲🇬' },
  { code: 'MH', name: 'Isole Marshall', flag: '🇲🇭' },
  { code: 'MK', name: 'Macedonia del Nord', flag: '🇲🇰' },
  { code: 'ML', name: 'Mali', flag: '🇲🇱' },
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲' },
  { code: 'MN', name: 'Mongolia', flag: '🇲🇳' },
  { code: 'MO', name: 'Macao', flag: '🇲🇴' },
  { code: 'MP', name: 'Isole Marianne Settentrionali', flag: '🇲🇵' },
  { code: 'MQ', name: 'Martinica', flag: '🇲🇶' },
  { code: 'MR', name: 'Mauritania', flag: '🇲🇷' },
  { code: 'MS', name: 'Montserrat', flag: '🇲🇸' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹' },
  { code: 'MU', name: 'Mauritius', flag: '🇲🇺' },
  { code: 'MV', name: 'Maldive', flag: '🇲🇻' },
  { code: 'MW', name: 'Malawi', flag: '🇲🇼' },
  { code: 'MX', name: 'Messico', flag: '🇲🇽' },
  { code: 'MY', name: 'Malesia', flag: '🇲🇾' },
  { code: 'MZ', name: 'Mozambico', flag: '🇲🇿' },
  { code: 'NA', name: 'Namibia', flag: '🇳🇦' },
  { code: 'NC', name: 'Nuova Caledonia', flag: '🇳🇨' },
  { code: 'NE', name: 'Niger', flag: '🇳🇪' },
  { code: 'NF', name: 'Isola Norfolk', flag: '🇳🇫' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮' },
  { code: 'NL', name: 'Paesi Bassi', flag: '🇳🇱' },
  { code: 'NO', name: 'Norvegia', flag: '🇳🇴' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵' },
  { code: 'NR', name: 'Nauru', flag: '🇳🇷' },
  { code: 'NU', name: 'Niue', flag: '🇳🇺' },
  { code: 'NZ', name: 'Nuova Zelanda', flag: '🇳🇿' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲' },
  { code: 'PA', name: 'Panama', flag: '🇵🇦' },
  { code: 'PE', name: 'Perù', flag: '🇵🇪' },
  { code: 'PF', name: 'Polinesia Francese', flag: '🇵🇫' },
  { code: 'PG', name: 'Papua Nuova Guinea', flag: '🇵🇬' },
  { code: 'PH', name: 'Filippine', flag: '🇵🇭' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'PL', name: 'Polonia', flag: '🇵🇱' },
  { code: 'PM', name: 'Saint-Pierre e Miquelon', flag: '🇵🇲' },
  { code: 'PN', name: 'Isole Pitcairn', flag: '🇵🇳' },
  { code: 'PR', name: 'Porto Rico', flag: '🇵🇷' },
  { code: 'PS', name: 'Palestina', flag: '🇵🇸' },
  { code: 'PT', name: 'Portogallo', flag: '🇵🇹' },
  { code: 'PW', name: 'Palau', flag: '🇵🇼' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
  { code: 'RE', name: 'Riunione', flag: '🇷🇪' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'RW', name: 'Ruanda', flag: '🇷🇼' },
  { code: 'SA', name: 'Arabia Saudita', flag: '🇸🇦' },
  { code: 'SB', name: 'Isole Salomone', flag: '🇸🇧' },
  { code: 'SC', name: 'Seychelles', flag: '🇸🇨' },
  { code: 'SD', name: 'Sudan', flag: '🇸🇩' },
  { code: 'SE', name: 'Svezia', flag: '🇸🇪' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'SH', name: 'Sant\'Elena', flag: '🇸🇭' },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮' },
  { code: 'SJ', name: 'Svalbard e Jan Mayen', flag: '🇸🇯' },
  { code: 'SK', name: 'Slovacchia', flag: '🇸🇰' },
  { code: 'SL', name: 'Sierra Leone', flag: '🇸🇱' },
  { code: 'SM', name: 'San Marino', flag: '🇸🇲' },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳' },
  { code: 'SO', name: 'Somalia', flag: '🇸🇴' },
  { code: 'SR', name: 'Suriname', flag: '🇸🇷' },
  { code: 'SS', name: 'Sudan del Sud', flag: '🇸🇸' },
  { code: 'ST', name: 'São Tomé e Príncipe', flag: '🇸🇹' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻' },
  { code: 'SX', name: 'Sint Maarten', flag: '🇸🇽' },
  { code: 'SY', name: 'Siria', flag: '🇸🇾' },
  { code: 'SZ', name: 'eSwatini', flag: '🇸🇿' },
  { code: 'TC', name: 'Isole Turks e Caicos', flag: '🇹🇨' },
  { code: 'TD', name: 'Ciad', flag: '🇹🇩' },
  { code: 'TF', name: 'Terre australi e antartiche francesi', flag: '🇹🇫' },
  { code: 'TG', name: 'Togo', flag: '🇹🇬' },
  { code: 'TH', name: 'Tailandia', flag: '🇹🇭' },
  { code: 'TJ', name: 'Tagikistan', flag: '🇹🇯' },
  { code: 'TK', name: 'Tokelau', flag: '🇹🇰' },
  { code: 'TL', name: 'Timor Est', flag: '🇹🇱' },
  { code: 'TM', name: 'Turkmenistan', flag: '🇹🇲' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
  { code: 'TO', name: 'Tonga', flag: '🇹🇴' },
  { code: 'TR', name: 'Turchia', flag: '🇹🇷' },
  { code: 'TT', name: 'Trinidad e Tobago', flag: '🇹🇹' },
  { code: 'TV', name: 'Tuvalu', flag: '🇹🇻' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
  { code: 'UA', name: 'Ucraina', flag: '🇺🇦' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
  { code: 'UM', name: 'Isole minori esterne degli Stati Uniti', flag: '🇺🇲' },
  { code: 'US', name: 'Stati Uniti', flag: '🇺🇸' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
  { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿' },
  { code: 'VA', name: 'Vaticano', flag: '🇻🇦' },
  { code: 'VC', name: 'Saint Vincent e Grenadine', flag: '🇻🇨' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'VG', name: 'Isole Vergini Britanniche', flag: '🇻🇬' },
  { code: 'VI', name: 'Isole Vergini Americane', flag: '🇻🇮' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'VU', name: 'Vanuatu', flag: '🇻🇺' },
  { code: 'WF', name: 'Wallis e Futuna', flag: '🇼🇫' },
  { code: 'WS', name: 'Samoa', flag: '🇼🇸' },
  { code: 'YE', name: 'Yemen', flag: '🇾🇪' },
  { code: 'YT', name: 'Mayotte', flag: '🇾🇹' },
  { code: 'ZA', name: 'Sudafrica', flag: '🇿🇦' },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲' },
  { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼' }
];

// Complete breed lists from AddPetDialog
const DOG_BREEDS = [
  'Affenpinscher', 'Afghan Hound', 'Airedale Terrier', 'Alaskan Malamute', 'American Bulldog',
  'American Cocker Spaniel', 'American Pit Bull Terrier', 'American Staffordshire Terrier',
  'Basenji', 'Basset Hound', 'Beagle', 'Bearded Collie', 'Bernese Mountain Dog',
  'Bichon Frise', 'Bloodhound', 'Border Collie', 'Border Terrier', 'Boston Terrier',
  'Boxer', 'Brittany', 'Bulldog', 'Bulldog Francese', 'Bull Terrier', 'Cairn Terrier',
  'Cane Corso', 'Cavalier King Charles Spaniel', 'Chihuahua', 'Chinese Crested',
  'Chow Chow', 'Cocker Spaniel', 'Collie', 'Dachshund', 'Dalmatian', 'Doberman',
  'English Setter', 'English Springer Spaniel', 'Fox Terrier', 'French Bulldog',
  'German Shepherd', 'German Shorthaired Pointer', 'Golden Retriever', 'Great Dane',
  'Greyhound', 'Havanese', 'Irish Setter', 'Irish Wolfhound', 'Jack Russell Terrier',
  'Japanese Spitz', 'Labrador Retriever', 'Lagotto Romagnolo', 'Maltese', 'Mastiff',
  'Newfoundland', 'Pastore Tedesco', 'Pomeranian', 'Poodle', 'Pug', 'Rottweiler',
  'Saint Bernard', 'Samoyed', 'Schnauzer', 'Scottish Terrier', 'Shar Pei',
  'Shih Tzu', 'Siberian Husky', 'Staffordshire Bull Terrier', 'Weimaraner',
  'West Highland White Terrier', 'Whippet', 'Yorkshire Terrier'
];

const CAT_BREEDS = [
  'Abissino', 'American Curl', 'American Shorthair', 'Angora Turco', 'Balinese',
  'Bengala', 'Birmano', 'Bombay', 'British Longhair', 'British Shorthair',
  'Burmese', 'California Spangled', 'Certosino', 'Cornish Rex', 'Devon Rex',
  'Egyptian Mau', 'Europeo', 'Exotic Shorthair', 'Himalayan', 'Japanese Bobtail',
  'Korat', 'LaPerm', 'Maine Coon', 'Manx', 'Munchkin', 'Nebelung',
  'Norwegian Forest Cat', 'Ocicat', 'Oriental', 'Persiano', 'Peterbald',
  'Pixie-bob', 'Ragdoll', 'Russian Blue', 'Savannah', 'Scottish Fold',
  'Selkirk Rex', 'Siamese', 'Siberian', 'Singapura', 'Somali', 'Sphynx',
  'Tonkinese', 'Turkish Van'
];

const CommunityPage = () => {
  const { user } = useAuth();
  const { selectedPet } = usePets();
  
  // State management
  const [activeTab, setActiveTab] = useState<'community' | 'news'>('community');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [subscribedChannels, setSubscribedChannels] = useState<string[]>([]);
  const [activeChannel, setActiveChannel] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [localAlerts, setLocalAlerts] = useState<LocalAlert[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [selectedCountry, setSelectedCountry] = useState<string>('IT');
  const [selectedPetType, setSelectedPetType] = useState<string>('');
  const [selectedBreed, setSelectedBreed] = useState<string>('');
  
  // Settings
  const [showSettings, setShowSettings] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [translationEnabled, setTranslationEnabled] = useState(true);
  
  // Alert dialog
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertDescription, setAlertDescription] = useState('');
  const [alertType, setAlertType] = useState<'health' | 'emergency' | 'environment' | 'outbreak'>('health');
  const [alertSeverity, setAlertSeverity] = useState<'info' | 'warning' | 'emergency'>('info');
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load channels
  const loadChannels = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('community_channels')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      
      setChannels((data as Channel[]) || []);
      
      // Set default channel
      if (data && data.length > 0 && !activeChannel) {
        setActiveChannel(data[0].id);
      }
    } catch (error) {
      console.error('Error loading channels:', error);
    }
  }, [activeChannel]);

  // Load user subscriptions
  const loadUserSubscriptions = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_channel_subscriptions')
        .select('channel_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setSubscribedChannels(data?.map(sub => sub.channel_id) || []);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  }, [user]);

  // Load messages for active channel
  const loadMessages = useCallback(async () => {
    if (!activeChannel) return;
    
    try {
      const { data, error } = await supabase
        .from('community_messages')
        .select('*')
        .eq('channel_id', activeChannel)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
        .limit(50);
      
      if (error) throw error;
      
      setMessages((data as Message[]) || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [activeChannel]);

  // Load local alerts
  const loadLocalAlerts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('local_alerts')
        .select('*')
        .eq('country_code', selectedCountry)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      setLocalAlerts((data as LocalAlert[]) || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  }, [selectedCountry]);

  // Subscribe to channel
  const subscribeToChannel = useCallback(async (channelId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_channel_subscriptions')
        .upsert({
          user_id: user.id,
          channel_id: channelId,
          notifications_enabled: true
        }, {
          onConflict: 'user_id,channel_id'
        });
      
      if (error) throw error;
      
      setActiveChannel(channelId);
      await loadUserSubscriptions();
      
      toast({
        title: "Iscrizione completata",
        description: "Ora puoi chattare in questo canale!"
      });
    } catch (error) {
      console.error('Error subscribing to channel:', error);
      toast({
        title: "Errore",
        description: "Impossibile iscriversi al canale",
        variant: "destructive"
      });
    }
  }, [user, loadUserSubscriptions]);

  // Edit message
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('community_messages')
        .update({ 
          content: newContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      await loadMessages();
      toast({
        title: "Messaggio modificato",
        description: "Il messaggio è stato aggiornato"
      });
    } catch (error) {
      console.error('Error editing message:', error);
      toast({
        title: "Errore",
        description: "Impossibile modificare il messaggio",
        variant: "destructive"
      });
    }
  }, [user, loadMessages]);

  // Delete message (soft delete)
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('community_messages')
        .update({ 
          deleted_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      await loadMessages();
      toast({
        title: "Messaggio eliminato",
        description: "Il messaggio è stato rimosso"
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il messaggio",
        variant: "destructive"
      });
    }
  }, [user, loadMessages]);

  // Effects
  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  useEffect(() => {
    if (user) {
      loadUserSubscriptions();
    }
  }, [user, loadUserSubscriptions]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    loadLocalAlerts();
  }, [loadLocalAlerts]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user || !activeChannel) return;
    
    const channel = supabase
      .channel(`messages-${activeChannel}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'community_messages',
          filter: `channel_id=eq.${activeChannel}`
        },
        (payload) => {
          loadMessages();
          
          // Show notification if not own message
          if (payload.new.user_id !== user.id && notificationsEnabled) {
            toast({
              title: "Nuovo messaggio",
              description: "Hai ricevuto un nuovo messaggio nel canale"
            });
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeChannel, notificationsEnabled, loadMessages]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!messageText.trim() || !user || !activeChannel) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('community_messages')
        .insert({
          content: messageText,
          user_id: user.id,
          channel_id: activeChannel,
          message_type: 'text',
          is_emergency: false,
          metadata: {
            pet_id: selectedPet?.id,
            timestamp: new Date().toISOString()
          }
        });
      
      if (error) throw error;
      
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Errore",
        description: "Impossibile inviare il messaggio",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      
      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };
      
      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        await sendVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.current.start();
      setIsRecording(true);
      
      toast({
        title: "Registrazione avviata",
        description: "Clicca di nuovo per fermare e inviare"
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Errore",
        description: "Impossibile accedere al microfono",
        variant: "destructive"
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const sendVoiceMessage = async (audioBlob: Blob) => {
    if (!user || !activeChannel) return;
    
    try {
      // Upload audio file
      const fileName = `voice_${Date.now()}.wav`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pet-media')
        .upload(`voice-messages/${fileName}`, audioBlob);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pet-media')
        .getPublicUrl(uploadData.path);
      
      // Send message
      const { error } = await supabase
        .from('community_messages')
        .insert({
          content: 'Messaggio vocale',
          user_id: user.id,
          channel_id: activeChannel,
          message_type: 'voice',
          file_url: publicUrl,
          voice_duration: 0,
          is_emergency: false,
          metadata: { timestamp: new Date().toISOString() }
        });
      
      if (error) throw error;
      
      toast({
        title: "Messaggio vocale inviato",
        description: "Il tuo messaggio vocale è stato inviato"
      });
    } catch (error) {
      console.error('Error sending voice message:', error);
      toast({
        title: "Errore",
        description: "Impossibile inviare il messaggio vocale",
        variant: "destructive"
      });
    }
  };

  // Image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !activeChannel) return;
    
    try {
      setLoading(true);
      
      // Upload image
      const fileName = `image_${Date.now()}.${file.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pet-media')
        .upload(`chat-images/${fileName}`, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pet-media')
        .getPublicUrl(uploadData.path);
      
      // Send message
      const { error } = await supabase
        .from('community_messages')
        .insert({
          content: 'Immagine condivisa',
          user_id: user.id,
          channel_id: activeChannel,
          message_type: 'image',
          file_url: publicUrl,
          is_emergency: false,
          metadata: { 
            filename: file.name,
            timestamp: new Date().toISOString() 
          }
        });
      
      if (error) throw error;
      
      toast({
        title: "Immagine inviata",
        description: "La tua immagine è stata condivisa"
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare l'immagine",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Create alert
  const createAlert = async () => {
    if (!user || !alertTitle.trim() || !alertDescription.trim()) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('local_alerts')
        .insert({
          user_id: user.id,
          title: alertTitle,
          description: alertDescription,
          alert_type: alertType,
          severity: alertSeverity,
          country_code: selectedCountry,
          affected_species: selectedPetType ? [selectedPetType] : [],
          metadata: { timestamp: new Date().toISOString() }
        });
      
      if (error) throw error;
      
      setShowAlertDialog(false);
      setAlertTitle('');
      setAlertDescription('');
      loadLocalAlerts();
      
      toast({
        title: "Alert creato",
        description: "Il tuo alert è stato segnalato alla community"
      });
    } catch (error) {
      console.error('Error creating alert:', error);
      toast({
        title: "Errore",
        description: "Impossibile creare l'alert",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter channels - show only the country channel if selected, otherwise only subscribed channels
  const filteredChannels = channels.filter(channel => {
    // If a country is selected, show only that country's channel (regardless of subscription)
    if (selectedCountry) {
      return channel.channel_type === 'country' && channel.country_code === selectedCountry;
    }
    
    // Otherwise, show only subscribed channels (excluding general and emergency)
    return subscribedChannels.includes(channel.id) && 
           channel.name !== 'Generale' && 
           channel.name !== 'Emergenze';
  });

  // Get current channel info
  const currentChannel = channels.find(c => c.id === activeChannel);

  // Message Component
  const MessageComponent = ({ message }: { message: Message }) => {
    const isOwnMessage = message.user_id === user?.id;
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content || '');
    const [showDropdown, setShowDropdown] = useState(false);
    
    const handleSaveEdit = async () => {
      if (editContent.trim()) {
        await editMessage(message.id, editContent.trim());
        setIsEditing(false);
      }
    };

    const handleDeleteMessage = async () => {
      if (confirm('Sei sicuro di voler eliminare questo messaggio?')) {
        await deleteMessage(message.id);
      }
      setShowDropdown(false);
    };

    return (
      <div className={`group flex gap-3 p-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className={`flex-1 max-w-xs ${isOwnMessage ? 'text-right' : ''}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">
              {isOwnMessage ? 'Tu' : 'Utente'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(message.created_at), { 
                addSuffix: true, 
                locale: it 
              })}
            </span>
            {isOwnMessage && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
                {showDropdown && (
                  <div className="absolute right-0 top-8 z-10 bg-background border rounded-lg shadow-lg py-1 min-w-[120px]">
                    <button
                      className="w-full px-3 py-1 text-sm text-left hover:bg-muted flex items-center gap-2"
                      onClick={() => {
                        setIsEditing(true);
                        setShowDropdown(false);
                      }}
                    >
                      ✏️ Modifica
                    </button>
                    <button
                      className="w-full px-3 py-1 text-sm text-left hover:bg-muted flex items-center gap-2 text-destructive"
                      onClick={handleDeleteMessage}
                    >
                      🗑️ Elimina
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className={`rounded-lg p-3 ${
            isOwnMessage 
              ? 'bg-primary text-primary-foreground ml-auto' 
              : 'bg-muted'
          }`}>
            {message.message_type === 'voice' && (
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                <span className="text-sm">Messaggio vocale</span>
                {message.file_url && (
                  <audio controls className="max-w-full">
                    <source src={message.file_url} type="audio/wav" />
                  </audio>
                )}
              </div>
            )}
            
            {message.message_type === 'image' && message.file_url && (
              <img 
                src={message.file_url} 
                alt="Immagine condivisa" 
                className="max-w-full rounded-md"
              />
            )}
            
            {message.message_type === 'text' && message.content && (
              <>
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') setIsEditing(false);
                      }}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveEdit}>Salva</Button>
                      <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Annulla</Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Alert Component
  const LocalAlertComponent = ({ alert }: { alert: LocalAlert }) => {
    const getSeverityColor = (severity: string) => {
      switch (severity) {
        case 'emergency': return 'destructive';
        case 'warning': return 'secondary';
        default: return 'outline';
      }
    };
    
    const getAlertIcon = (type: string) => {
      switch (type) {
        case 'health': return <Stethoscope className="h-4 w-4" />;
        case 'emergency': return <Siren className="h-4 w-4" />;
        case 'environment': return <MapPinIcon className="h-4 w-4" />;
        case 'outbreak': return <AlertTriangle className="h-4 w-4" />;
        default: return <AlertCircle className="h-4 w-4" />;
      }
    };
    
    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getAlertIcon(alert.alert_type)}
              <CardTitle className="text-base">{alert.title}</CardTitle>
              <Badge variant={getSeverityColor(alert.severity)}>
                {alert.severity.toUpperCase()}
              </Badge>
            </div>
          </div>
          <CardDescription>
            {COUNTRIES.find(c => c.code === alert.country_code)?.name} • 
            <span className="ml-1">
              {formatDistanceToNow(new Date(alert.created_at), { 
                addSuffix: true, 
                locale: it 
              })}
            </span>
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            {alert.description}
          </p>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {alert.reports_count} segnalazioni
            </span>
            <span className="flex items-center gap-1">
              {alert.verification_status === 'verified' ? (
                <>
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Verificato
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3" />
                  In verifica
                </>
              )}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Card className="p-8 text-center">
          <CardHeader>
            <CardTitle>Accesso richiesto</CardTitle>
            <CardDescription>
              Devi essere registrato per accedere alla community
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Community PetVoice</h1>
            <p className="text-muted-foreground">
              Connettiti con proprietari e esperti di tutto il mondo
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Country Filter */}
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map(country => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Pet Type Filter */}
            <Select value={selectedPetType} onValueChange={setSelectedPetType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti</SelectItem>
                <SelectItem value="dog">🐕 Cani</SelectItem>
                <SelectItem value="cat">🐱 Gatti</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Breed Filter */}
            {selectedPetType && selectedPetType !== 'all' && (
              <Select value={selectedBreed} onValueChange={setSelectedBreed}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Razza" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte</SelectItem>
                  {(selectedPetType === 'dog' ? DOG_BREEDS : CAT_BREEDS).map(breed => (
                    <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {/* Settings */}
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Impostazioni Community</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications">Notifiche push</Label>
                    <Switch
                      id="notifications"
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound">Suoni notifiche</Label>
                    <Switch
                      id="sound"
                      checked={soundEnabled}
                      onCheckedChange={setSoundEnabled}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="translation">Traduzione automatica</Label>
                    <Switch
                      id="translation"
                      checked={translationEnabled}
                      onCheckedChange={setTranslationEnabled}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Channels */}
        <div className="w-64 border-r bg-muted/50 p-4 overflow-y-auto">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
              Canali Iscritti
            </div>
            {selectedCountry && !subscribedChannels.includes(filteredChannels[0]?.id) ? (
              <div className="text-center py-8 px-2">
                <MessageCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">
                  Premi "ACCEDI AL CANALE" per unirti al canale del paese selezionato.
                </p>
              </div>
            ) : filteredChannels.length === 0 ? (
              <div className="text-center py-8 px-2">
                <MessageCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">
                  Seleziona un paese dal menu per unirti a un canale.
                </p>
              </div>
            ) : (
              filteredChannels.map((channel) => (
                <Button
                  key={channel.id}
                  variant={activeChannel === channel.id ? "secondary" : "ghost"}
                  className="w-full justify-start text-left"
                  onClick={() => setActiveChannel(channel.id)}
                >
                  <span className="text-sm flex items-center gap-2">
                    {channel.name}
                  </span>
                </Button>
              ))
            )}
          </div>
        </div>
        
        {/* Main Chat/News Area */}
        <div className="flex-1 flex flex-col">
          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 m-4">
              <TabsTrigger value="community" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Community
              </TabsTrigger>
              <TabsTrigger value="news" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                News & Alert
              </TabsTrigger>
            </TabsList>
            
            {/* Community Tab */}
            <TabsContent value="community" className="flex-1 flex flex-col m-0">
              {/* Channel Header */}
              <div className="border-b p-4 bg-card">
                {!activeChannel ? (
                  <div className="text-center py-8">
                    <div className="mb-4">
                      <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                    </div>
                    <h2 className="font-semibold mb-2">Benvenuto nella Community!</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Seleziona un paese dal menu in alto per accedere al canale
                    </p>
                    {selectedCountry && (
                      <div className="bg-muted/50 rounded-lg p-4 max-w-md mx-auto">
                        <div className="flex items-center gap-2 mb-3">
                          {COUNTRIES.find(c => c.code === selectedCountry)?.flag}
                          <span className="font-medium">
                            Canale {COUNTRIES.find(c => c.code === selectedCountry)?.name}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Benvenuto nel canale {COUNTRIES.find(c => c.code === selectedCountry)?.name}!
                        </p>
                        <Button 
                          onClick={() => {
                            const countryChannel = channels.find(c => 
                              c.channel_type === 'country' && c.country_code === selectedCountry
                            );
                            if (countryChannel) subscribeToChannel(countryChannel.id);
                          }}
                          className="w-full"
                        >
                          🚪 ACCEDI AL CANALE
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold flex items-center gap-2">
                        {currentChannel?.emoji} {currentChannel?.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {currentChannel?.description || 'Chat attiva - Tutti gli utenti possono partecipare'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Languages className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Messages Area */}
              {activeChannel ? (
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Nessun messaggio ancora. Inizia la conversazione!
                        </p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <MessageComponent key={message.id} message={message} />
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex-1" />
              )}
              
              {/* Message Input */}
              {activeChannel && (
                <div className="border-t p-4 bg-card">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 bg-background border rounded-lg p-2">
                      <Input
                        placeholder={`💬 Scrivi in ${currentChannel?.name || 'questo canale'}...`}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        className="border-0 bg-transparent focus-visible:ring-0"
                        disabled={loading}
                      />
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={isRecording ? stopRecording : startRecording}
                          className={isRecording ? 'text-red-500' : ''}
                          title="🎤 Audio"
                          disabled={loading}
                        >
                          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          title="📷 Foto"
                          disabled={loading}
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="default"
                          size="sm"
                          onClick={sendMessage}
                          disabled={!messageText.trim() || loading}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            
            {/* News & Alerts Tab */}
            <TabsContent value="news" className="flex-1 flex flex-col m-0">
              {/* News Header */}
              <div className="border-b p-4 bg-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold">News & Alert Locali</h2>
                    <p className="text-sm text-muted-foreground">
                      Informazioni sanitarie per {COUNTRIES.find(c => c.code === selectedCountry)?.name}
                    </p>
                  </div>
                  
                  <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
                    <DialogTrigger asChild>
                      <Button variant="default">
                        <Plus className="h-4 w-4 mr-2" />
                        Segnala Alert
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Crea nuovo alert</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="alert-type">Tipo di alert</Label>
                          <Select value={alertType} onValueChange={(v: any) => setAlertType(v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="health">🏥 Salute</SelectItem>
                              <SelectItem value="emergency">🆘 Emergenza</SelectItem>
                              <SelectItem value="environment">🌍 Ambiente</SelectItem>
                              <SelectItem value="outbreak">⚠️ Epidemia</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="alert-severity">Gravità</Label>
                          <Select value={alertSeverity} onValueChange={(v: any) => setAlertSeverity(v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="info">ℹ️ Informazione</SelectItem>
                              <SelectItem value="warning">⚠️ Attenzione</SelectItem>
                              <SelectItem value="emergency">🚨 Emergenza</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="alert-title">Titolo</Label>
                          <Input
                            id="alert-title"
                            value={alertTitle}
                            onChange={(e) => setAlertTitle(e.target.value)}
                            placeholder="Titolo dell'alert"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="alert-description">Descrizione</Label>
                          <Textarea
                            id="alert-description"
                            value={alertDescription}
                            onChange={(e) => setAlertDescription(e.target.value)}
                            placeholder="Descrivi dettagliatamente la situazione"
                            rows={4}
                          />
                        </div>
                        
                        <Button 
                          onClick={createAlert} 
                          disabled={loading || !alertTitle.trim() || !alertDescription.trim()}
                          className="w-full"
                        >
                          Crea Alert
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              {/* Alerts List */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {localAlerts.map((alert) => (
                    <LocalAlertComponent key={alert.id} alert={alert} />
                  ))}
                  
                  {localAlerts.length === 0 && (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        Nessun alert per la tua zona
                      </h3>
                      <p className="text-muted-foreground">
                        Al momento non ci sono segnalazioni per {COUNTRIES.find(c => c.code === selectedCountry)?.name}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;