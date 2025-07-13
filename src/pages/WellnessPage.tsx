import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Heart, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Calendar, 
  Phone, 
  Mail,
  MapPin,
  Shield,
  FileText,
  Upload,
  Plus,
  Search,
  AlertTriangle,
  Clock,
  Pill,
  Scale,
  Thermometer,
  Brain,
  Eye,
  Share,
  Download,
  QrCode,
  PhoneCall,
  MessageSquare,
  Stethoscope,
  Siren,
  User,
  CreditCard,
  FileImage,
  ChevronRight,
  Trash2,
  Edit,
  Star,
  Target,
  Zap,
  Gauge
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { usePets } from '@/contexts/PetContext';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, subMonths, subDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { FirstAidGuide } from '@/components/FirstAidGuide';

interface HealthMetric {
  id: string;
  metric_type: string;
  value: number;
  unit: string;
  recorded_at: string;
  notes?: string;
}

interface MedicalRecord {
  id: string;
  title: string;
  description?: string;
  record_type: string;
  record_date: string;
  document_url?: string;
  cost?: number;
  notes?: string;
  veterinarian?: {
    name: string;
    clinic_name?: string;
  };
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  notes?: string;
}

interface Veterinarian {
  id: string;
  name: string;
  clinic_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  vet_type: string;
  is_primary: boolean;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship?: string;
  contact_type: string;
  is_primary: boolean;
}

interface HealthAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description?: string;
  is_read: boolean;
  created_at: string;
}

interface PetInsurance {
  id: string;
  provider_name: string;
  policy_number: string;
  policy_type?: string;
  start_date: string;
  end_date?: string;
  premium_amount?: number;
  deductible?: number;
  coverage_details?: any;
  contact_info?: any;
  is_active: boolean;
}

const WellnessPage: React.FC = () => {
  const { user } = useAuth();
  const { selectedPet } = usePets();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Health data states
  const [healthScore, setHealthScore] = useState(0);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [healthAlerts, setHealthAlerts] = useState<HealthAlert[]>([]);
  const [petInsurance, setPetInsurance] = useState<PetInsurance[]>([]);
  
  // Dialog states
  const [showAddMetric, setShowAddMetric] = useState(false);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showAddVet, setShowAddVet] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddInsurance, setShowAddInsurance] = useState(false);
  
  // Edit dialog states
  const [editingMetric, setEditingMetric] = useState<HealthMetric | null>(null);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [editingVet, setEditingVet] = useState<Veterinarian | null>(null);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);

  // Form states
  const [newMetric, setNewMetric] = useState({
    metric_type: '',
    value: '',
    unit: '',
    notes: ''
  });
  const [newRecord, setNewRecord] = useState({
    title: '',
    record_type: '',
    record_date: '',
    description: '',
    cost: ''
  });
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    start_date: '',
    end_date: '',
    notes: ''
  });
  const [newVet, setNewVet] = useState({
    name: '',
    vet_type: '',
    clinic_name: '',
    phone: '',
    email: '',
    address: ''
  });
  const [newContact, setNewContact] = useState({
    name: '',
    contact_type: '',
    phone: '',
    relationship: '',
    email: '',
    notes: ''
  });
  const [newInsurance, setNewInsurance] = useState({
    provider_name: '',
    policy_number: '',
    policy_type: '',
    start_date: '',
    end_date: '',
    premium_amount: '',
    deductible: ''
  });

  // Medical ID state
  const [medicalId, setMedicalId] = useState({
    microchip: '',
    allergies: '',
    conditions: '',
    medications: '',
    emergency_contact: ''
  });

  // First aid guide state
  const [showFirstAidGuide, setShowFirstAidGuide] = useState(false);

  // Health score calculation
  const calculateHealthScore = (metrics: HealthMetric[]) => {
    if (metrics.length === 0) return 0;
    
    // Get latest metrics for each type
    const latestMetrics: Record<string, HealthMetric> = {};
    metrics.forEach(metric => {
      if (!latestMetrics[metric.metric_type] || 
          new Date(metric.recorded_at) > new Date(latestMetrics[metric.metric_type].recorded_at)) {
        latestMetrics[metric.metric_type] = metric;
      }
    });

    // Score calculation based on ideal ranges (simplified)
    let totalScore = 0;
    let metricCount = 0;

    Object.values(latestMetrics).forEach(metric => {
      let score = 50; // Base score
      
      switch (metric.metric_type) {
        case 'weight':
          // Assume stable weight is good (score between 70-90)
          score = 80;
          break;
        case 'appetite':
          score = Math.min(100, metric.value * 10); // 1-10 scale to 0-100
          break;
        case 'activity':
          score = Math.min(100, metric.value * 10);
          break;
        case 'behavior':
          score = Math.min(100, metric.value * 10);
          break;
        case 'sleep':
          score = Math.min(100, metric.value * 10);
          break;
        default:
          score = 75; // Default good score
      }
      
      totalScore += score;
      metricCount++;
    });

    return metricCount > 0 ? Math.round(totalScore / metricCount) : 0;
  };

  // Fetch all health data
  const fetchHealthData = async () => {
    if (!user || !selectedPet) return;

    try {
      setLoading(true);

      // Fetch health metrics
      const { data: metricsData } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .order('recorded_at', { ascending: false })
        .limit(100);

      if (metricsData) {
        setHealthMetrics(metricsData);
        setHealthScore(calculateHealthScore(metricsData));
      }

      // Fetch medical records with veterinarian data
      const { data: recordsData } = await supabase
        .from('medical_records')
        .select(`
          *,
          veterinarian:veterinarians(name, clinic_name)
        `)
        .eq('pet_id', selectedPet.id)
        .order('record_date', { ascending: false });

      if (recordsData) {
        setMedicalRecords(recordsData);
      }

      // Fetch medications
      const { data: medicationsData } = await supabase
        .from('medications')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .order('created_at', { ascending: false });

      if (medicationsData) {
        setMedications(medicationsData);
      }

      // Fetch veterinarians
      const { data: veterinariansData } = await supabase
        .from('veterinarians')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false });

      if (veterinariansData) {
        setVeterinarians(veterinariansData);
      }

      // Fetch emergency contacts
      const { data: contactsData } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false });

      if (contactsData) {
        setEmergencyContacts(contactsData);
      }

      // Fetch health alerts
      const { data: alertsData } = await supabase
        .from('health_alerts')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .eq('is_resolved', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (alertsData) {
        setHealthAlerts(alertsData);
      }

      // Fetch pet insurance
      const { data: insuranceData } = await supabase
        .from('pet_insurance')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .order('created_at', { ascending: false });

      if (insuranceData) {
        setPetInsurance(insuranceData);
      }

      // Load medical ID data from pet
      if (selectedPet) {
        const microchipMatch = selectedPet.description?.match(/Microchip: ([^\n]*)/);
        const medicationsMatch = selectedPet.description?.match(/Farmaci: ([^\n]*)/);
        const emergencyMatch = selectedPet.description?.match(/Contatto emergenza: ([^\n]*)/);
        
        setMedicalId({
          microchip: microchipMatch?.[1] || '',
          allergies: selectedPet.allergies || '',
          conditions: selectedPet.health_conditions || '',
          medications: medicationsMatch?.[1] || '',
          emergency_contact: emergencyMatch?.[1] || ''
        });
      }

    } catch (error) {
      console.error('Error fetching health data:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i dati della salute",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, [user, selectedPet]);

  // Add Health Metric
  const handleAddMetric = async () => {
    if (!user || !selectedPet || !newMetric.metric_type || !newMetric.value) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('health_metrics')
        .insert({
          user_id: user.id,
          pet_id: selectedPet.id,
          metric_type: newMetric.metric_type,
          value: parseFloat(newMetric.value),
          unit: newMetric.unit,
          recorded_at: new Date().toISOString(),
          notes: newMetric.notes || null
        });

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Metrica di salute aggiunta con successo"
      });

      setNewMetric({ metric_type: '', value: '', unit: '', notes: '' });
      setShowAddMetric(false);
      fetchHealthData();
    } catch (error) {
      console.error('Error adding metric:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiungere la metrica",
        variant: "destructive"
      });
    }
  };

  // Update Health Metric
  const handleUpdateMetric = async () => {
    if (!editingMetric || !newMetric.metric_type || !newMetric.value) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('health_metrics')
        .update({
          metric_type: newMetric.metric_type,
          value: parseFloat(newMetric.value),
          unit: newMetric.unit,
          notes: newMetric.notes || null
        })
        .eq('id', editingMetric.id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Metrica aggiornata con successo"
      });

      setEditingMetric(null);
      setNewMetric({ metric_type: '', value: '', unit: '', notes: '' });
      setShowAddMetric(false);
      fetchHealthData();
    } catch (error) {
      console.error('Error updating metric:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare la metrica",
        variant: "destructive"
      });
    }
  };

  // Add Medical Record
  const handleAddRecord = async () => {
    if (!user || !selectedPet || !newRecord.title || !newRecord.record_type || !newRecord.record_date) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('medical_records')
        .insert({
          user_id: user.id,
          pet_id: selectedPet.id,
          title: newRecord.title,
          record_type: newRecord.record_type,
          record_date: newRecord.record_date,
          description: newRecord.description || null,
          cost: newRecord.cost ? parseFloat(newRecord.cost) : null
        });

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Documento medico aggiunto con successo"
      });

      setNewRecord({ title: '', record_type: '', record_date: '', description: '', cost: '' });
      setShowAddRecord(false);
      fetchHealthData();
    } catch (error) {
      console.error('Error adding record:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiungere il documento",
        variant: "destructive"
      });
    }
  };

  // Update Medical Record
  const handleUpdateRecord = async () => {
    if (!editingRecord || !newRecord.title || !newRecord.record_type || !newRecord.record_date) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('medical_records')
        .update({
          title: newRecord.title,
          record_type: newRecord.record_type,
          record_date: newRecord.record_date,
          description: newRecord.description || null,
          cost: newRecord.cost ? parseFloat(newRecord.cost) : null
        })
        .eq('id', editingRecord.id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Documento aggiornato con successo"
      });

      setEditingRecord(null);
      setNewRecord({ title: '', record_type: '', record_date: '', description: '', cost: '' });
      setShowAddRecord(false);
      fetchHealthData();
    } catch (error) {
      console.error('Error updating record:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il documento",
        variant: "destructive"
      });
    }
  };

  // Add Medication
  const handleAddMedication = async () => {
    if (!user || !selectedPet || !newMedication.name || !newMedication.dosage || !newMedication.frequency || !newMedication.start_date) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('medications')
        .insert({
          user_id: user.id,
          pet_id: selectedPet.id,
          name: newMedication.name,
          dosage: newMedication.dosage,
          frequency: newMedication.frequency,
          start_date: newMedication.start_date,
          end_date: newMedication.end_date || null,
          notes: newMedication.notes || null,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Farmaco aggiunto con successo"
      });

      setNewMedication({ name: '', dosage: '', frequency: '', start_date: '', end_date: '', notes: '' });
      setShowAddMedication(false);
      fetchHealthData();
    } catch (error) {
      console.error('Error adding medication:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiungere il farmaco",
        variant: "destructive"
      });
    }
  };

  // Update Medication
  const handleUpdateMedication = async () => {
    if (!editingMedication || !newMedication.name || !newMedication.dosage || !newMedication.frequency || !newMedication.start_date) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('medications')
        .update({
          name: newMedication.name,
          dosage: newMedication.dosage,
          frequency: newMedication.frequency,
          start_date: newMedication.start_date,
          end_date: newMedication.end_date || null,
          notes: newMedication.notes || null
        })
        .eq('id', editingMedication.id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Farmaco aggiornato con successo"
      });

      setEditingMedication(null);
      setNewMedication({ name: '', dosage: '', frequency: '', start_date: '', end_date: '', notes: '' });
      setShowAddMedication(false);
      fetchHealthData();
    } catch (error) {
      console.error('Error updating medication:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il farmaco",
        variant: "destructive"
      });
    }
  };

  // Add Veterinarian
  const handleAddVet = async () => {
    if (!user || !newVet.name || !newVet.vet_type) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('veterinarians')
        .insert({
          user_id: user.id,
          name: newVet.name,
          vet_type: newVet.vet_type,
          clinic_name: newVet.clinic_name || null,
          phone: newVet.phone || null,
          email: newVet.email || null,
          address: newVet.address || null,
          is_primary: newVet.vet_type === 'primary'
        });

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Veterinario aggiunto con successo"
      });

      setNewVet({ name: '', vet_type: '', clinic_name: '', phone: '', email: '', address: '' });
      setShowAddVet(false);
      fetchHealthData();
    } catch (error) {
      console.error('Error adding veterinarian:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiungere il veterinario",
        variant: "destructive"
      });
    }
  };

  // Update Veterinarian
  const handleUpdateVet = async () => {
    if (!editingVet || !newVet.name || !newVet.vet_type) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('veterinarians')
        .update({
          name: newVet.name,
          vet_type: newVet.vet_type,
          clinic_name: newVet.clinic_name || null,
          phone: newVet.phone || null,
          email: newVet.email || null,
          address: newVet.address || null,
          is_primary: newVet.vet_type === 'primary'
        })
        .eq('id', editingVet.id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Veterinario aggiornato con successo"
      });

      setEditingVet(null);
      setNewVet({ name: '', vet_type: '', clinic_name: '', phone: '', email: '', address: '' });
      setShowAddVet(false);
      fetchHealthData();
    } catch (error) {
      console.error('Error updating veterinarian:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il veterinario",
        variant: "destructive"
      });
    }
  };

  // Add Emergency Contact
  const handleAddContact = async () => {
    if (!user || !newContact.name || !newContact.contact_type || !newContact.phone) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .insert({
          user_id: user.id,
          name: newContact.name,
          contact_type: newContact.contact_type,
          phone: newContact.phone,
          relationship: newContact.relationship || null,
          email: newContact.email || null,
          notes: newContact.notes || null,
          is_primary: false
        });

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Contatto di emergenza aggiunto con successo"
      });

      setNewContact({ name: '', contact_type: '', phone: '', relationship: '', email: '', notes: '' });
      setShowAddContact(false);
      fetchHealthData();
    } catch (error) {
      console.error('Error adding contact:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiungere il contatto",
        variant: "destructive"
      });
    }
  };

  // Update Emergency Contact
  const handleUpdateContact = async () => {
    if (!editingContact || !newContact.name || !newContact.contact_type || !newContact.phone) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .update({
          name: newContact.name,
          contact_type: newContact.contact_type,
          phone: newContact.phone,
          relationship: newContact.relationship || null,
          email: newContact.email || null,
          notes: newContact.notes || null
        })
        .eq('id', editingContact.id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Contatto aggiornato con successo"
      });

      setEditingContact(null);
      setNewContact({ name: '', contact_type: '', phone: '', relationship: '', email: '', notes: '' });
      setShowAddContact(false);
      fetchHealthData();
    } catch (error) {
      console.error('Error updating contact:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il contatto",
        variant: "destructive"
      });
    }
  };

  // Add Insurance
  const handleAddInsurance = async () => {
    if (!user || !selectedPet || !newInsurance.provider_name || !newInsurance.policy_number || !newInsurance.start_date) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('pet_insurance')
        .insert({
          user_id: user.id,
          pet_id: selectedPet.id,
          provider_name: newInsurance.provider_name,
          policy_number: newInsurance.policy_number,
          policy_type: newInsurance.policy_type || null,
          start_date: newInsurance.start_date,
          end_date: newInsurance.end_date || null,
          premium_amount: newInsurance.premium_amount ? parseFloat(newInsurance.premium_amount) : null,
          deductible: newInsurance.deductible ? parseFloat(newInsurance.deductible) : null,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Assicurazione aggiunta con successo"
      });

      setNewInsurance({ provider_name: '', policy_number: '', policy_type: '', start_date: '', end_date: '', premium_amount: '', deductible: '' });
      setShowAddInsurance(false);
      fetchHealthData();
    } catch (error) {
      console.error('Error adding insurance:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiungere l'assicurazione",
        variant: "destructive"
      });
    }
  };

  // Save Medical ID
  const handleSaveMedicalId = async () => {
    if (!selectedPet || !medicalId.microchip) {
      toast({
        title: "Errore",
        description: "Inserisci almeno il numero del microchip",
        variant: "destructive"
      });
      return;
    }

    try {
      // Save medical ID info in existing pet fields
      const { error } = await supabase
        .from('pets')
        .update({
          allergies: medicalId.allergies,
          health_conditions: medicalId.conditions,
          description: `Microchip: ${medicalId.microchip}\nFarmaci: ${medicalId.medications}\nContatto emergenza: ${medicalId.emergency_contact}`
        })
        .eq('id', selectedPet.id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Informazioni mediche salvate con successo"
      });
    } catch (error) {
      console.error('Error saving medical ID:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare le informazioni mediche",
        variant: "destructive"
      });
    }
  };

  // Generate QR Code
  const handleGenerateQRCode = () => {
    if (!selectedPet || !medicalId.microchip) {
      toast({
        title: "Errore",
        description: "Salva prima le informazioni mediche",
        variant: "destructive"
      });
      return;
    }

    // Create downloadable QR code data
    const qrData = {
      pet_name: selectedPet.name,
      microchip: medicalId.microchip,
      allergies: medicalId.allergies,
      conditions: medicalId.conditions,
      emergency_contact: medicalId.emergency_contact,
      owner_id: user?.id
    };

    // Create and download QR code as JSON
    const blob = new Blob([JSON.stringify(qrData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedPet.name}_qr_medical_data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "QR Code Generato",
      description: "QR code salvato con le informazioni mediche di emergenza"
    });
  };

  // Create Medical Tag
  const handleCreateMedicalTag = () => {
    if (!selectedPet || !medicalId.microchip) {
      toast({
        title: "Errore",
        description: "Salva prima le informazioni mediche",
        variant: "destructive"
      });
      return;
    }

    // Create printable medical tag
    const tagData = `
**TAG MEDICO**
Nome: ${selectedPet.name}
Microchip: ${medicalId.microchip}
Allergie: ${medicalId.allergies || 'Nessuna'}
Condizioni: ${medicalId.conditions || 'Nessuna'}
Emergenza: ${medicalId.emergency_contact || 'N/A'}
Generato: ${new Date().toLocaleDateString('it-IT')}
    `;

    const blob = new Blob([tagData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedPet.name}_medical_tag.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Tag Medico Creato",
      description: "Tag di identificazione medica pronto per la stampa"
    });
  };

  // Upload document
  const handleUploadDocument = async (file: File) => {
    if (!selectedPet) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedPet.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('pet-media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('pet-media')
        .getPublicUrl(fileName);

      // Create medical record entry
      await supabase
        .from('medical_records')
        .insert({
          user_id: user?.id,
          pet_id: selectedPet.id,
          title: file.name,
          record_type: 'document',
          record_date: new Date().toISOString().split('T')[0],
          document_url: data.publicUrl,
          description: 'Documento caricato'
        });

      toast({
        title: "Successo",
        description: "Documento caricato con successo"
      });

      fetchHealthData(); // Refresh data
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare il documento",
        variant: "destructive"
      });
      return null;
    }
  };

  // Export health data
  const handleExportData = async () => {
    if (!selectedPet) return;

    try {
      const exportData = {
        pet: selectedPet,
        healthMetrics,
        medicalRecords,
        medications,
        veterinarians,
        emergencyContacts,
        petInsurance,
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedPet.name}_health_data_${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Successo",
        description: "Dati sanitari esportati con successo"
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Errore",
        description: "Impossibile esportare i dati",
        variant: "destructive"
      });
    }
  };

  // Generate emergency QR
  const handleGenerateEmergencyQR = () => {
    if (!selectedPet) return;

    const emergencyData = {
      pet_name: selectedPet.name,
      pet_type: selectedPet.type,
      owner_contacts: emergencyContacts.filter(c => c.is_primary),
      veterinarian: veterinarians.find(v => v.is_primary),
      allergies: selectedPet.allergies,
      conditions: selectedPet.health_conditions,
      active_medications: medications.filter(m => m.is_active && (!m.end_date || new Date(m.end_date) > new Date())),
      microchip: medicalId.microchip,
      generated_at: new Date().toISOString()
    };

    // Create and download emergency QR data
    const blob = new Blob([JSON.stringify(emergencyData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedPet.name}_emergency_qr.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "QR Emergenza Generato",
      description: "QR code di emergenza creato con tutti i dati essenziali"
    });
  };

  // Emergency actions
  const handleEmergencyAction = (action: string) => {
    switch (action) {
      case 'call_vet':
        const primaryVet = veterinarians.find(v => v.is_primary);
        if (primaryVet?.phone) {
          window.open(`tel:${primaryVet.phone}`, '_self');
        } else {
          toast({
            title: "Nessun veterinario",
            description: "Aggiungi un veterinario primario per chiamate di emergenza",
            variant: "destructive"
          });
        }
        break;
      case 'find_clinic':
        window.open('https://maps.google.com/?q=veterinario+vicino', '_blank');
        break;
      case 'poison_control':
        window.open('tel:+390644290300', '_self'); // Numero centro antiveleni Italia
        break;
      case 'first_aid':
        setShowFirstAidGuide(true);
        break;
    }
  };

  // Edit handlers
  const handleEditMetric = (metric: HealthMetric) => {
    setEditingMetric(metric);
    setNewMetric({
      metric_type: metric.metric_type,
      value: metric.value.toString(),
      unit: metric.unit,
      notes: metric.notes || ''
    });
    setShowAddMetric(true);
  };

  const handleEditRecord = (record: MedicalRecord) => {
    setEditingRecord(record);
    setNewRecord({
      title: record.title,
      record_type: record.record_type,
      record_date: record.record_date,
      description: record.description || '',
      cost: record.cost?.toString() || ''
    });
    setShowAddRecord(true);
  };

  const handleEditMedication = (medication: Medication) => {
    setEditingMedication(medication);
    setNewMedication({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      start_date: medication.start_date,
      end_date: medication.end_date || '',
      notes: medication.notes || ''
    });
    setShowAddMedication(true);
  };

  const handleEditVet = (vet: Veterinarian) => {
    setEditingVet(vet);
    setNewVet({
      name: vet.name,
      vet_type: vet.vet_type,
      clinic_name: vet.clinic_name || '',
      phone: vet.phone || '',
      email: vet.email || '',
      address: vet.address || ''
    });
    setShowAddVet(true);
  };

  const handleEditContact = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setNewContact({
      name: contact.name,
      contact_type: contact.contact_type,
      phone: contact.phone,
      relationship: contact.relationship || '',
      email: '',
      notes: ''
    });
    setShowAddContact(true);
  };

  // Prepare chart data
  const prepareChartData = (metricType: string) => {
    const filtered = healthMetrics
      .filter(m => m.metric_type === metricType)
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
      .slice(-30); // Last 30 data points

    return filtered.map(m => ({
      date: format(new Date(m.recorded_at), 'dd/MM'),
      value: m.value,
      fullDate: format(new Date(m.recorded_at), 'dd/MM/yyyy')
    }));
  };

  const weightData = prepareChartData('weight');
  const activityData = prepareChartData('activity');
  const appetiteData = prepareChartData('appetite');
  const sleepData = prepareChartData('sleep');

  // Health score color
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getHealthScoreStatus = (score: number) => {
    if (score >= 80) return 'Eccellente';
    if (score >= 60) return 'Buono';
    if (score >= 40) return 'Discreto';
    return 'Preoccupante';
  };

  // Quick stats
  const getQuickStats = () => {
    const lastVetVisit = medicalRecords
      .filter(r => r.record_type === 'visit' || r.record_type === 'exam' || r.record_type === 'checkup')
      .sort((a, b) => new Date(b.record_date).getTime() - new Date(a.record_date).getTime())[0];

    const nextAppointment = null; // Would come from calendar_events

    const activeMeds = medications.filter(m => 
      m.is_active && (!m.end_date || new Date(m.end_date) >= new Date())
    ).length;

    return {
      lastVetVisit: lastVetVisit ? format(new Date(lastVetVisit.record_date), 'dd/MM/yyyy') : 'Mai registrato',
      nextAppointment: 'Da programmare',
      activeMedications: activeMeds,
      totalRecords: medicalRecords.length
    };
  };

  // Check insurance status
  const getInsuranceStatus = (insurance: PetInsurance) => {
    if (!insurance.end_date) return 'active';
    
    const endDate = new Date(insurance.end_date);
    const today = new Date();
    const daysToExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (endDate < today) return 'expired';
    if (daysToExpiry <= 30) return 'expiring';
    return 'active';
  };

  // Check medication status
  const getMedicationStatus = (medication: Medication) => {
    if (!medication.is_active) return 'inactive';
    if (!medication.end_date) return 'active';
    
    const endDate = new Date(medication.end_date);
    const today = new Date();
    
    return endDate >= today ? 'active' : 'inactive';
  };

  const quickStats = getQuickStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Caricamento dati salute...</p>
        </div>
      </div>
    );
  }

  if (!selectedPet) {
    return (
      <div className="text-center py-12">
        <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Nessun Pet Selezionato</h2>
        <p className="text-muted-foreground">Seleziona un pet per visualizzare i dati di salute.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Salute e Benessere</h1>
          <p className="text-muted-foreground">
            Monitora la salute di {selectedPet.name} con strumenti professionali
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleGenerateEmergencyQR}>
            <QrCode className="h-4 w-4 mr-2" />
            QR Emergenza
          </Button>
        </div>
      </div>

      {/* Health Alerts */}
      {healthAlerts.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Alert di salute attivi ({healthAlerts.length})</p>
              {healthAlerts.slice(0, 3).map(alert => (
                <div key={alert.id} className="text-sm">
                  <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'} className="mr-2">
                    {alert.severity}
                  </Badge>
                  {alert.title}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="profile">Profilo Medico</TabsTrigger>
          <TabsTrigger value="records">Documenti</TabsTrigger>
          <TabsTrigger value="tracking">Monitoraggio</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="emergency">Emergenze</TabsTrigger>
        </TabsList>

        {/* DASHBOARD TAB */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Health Score Card */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-success/10 via-warning/10 to-destructive/10"></div>
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Health Score</CardTitle>
                  <CardDescription>Valutazione complessiva dello stato di salute</CardDescription>
                </div>
                <div className="text-right">
                  <div className={`text-4xl font-bold ${getHealthScoreColor(healthScore)}`}>
                    {healthScore}/100
                  </div>
                  <Badge variant="secondary" className={getHealthScoreColor(healthScore)}>
                    <Gauge className="h-3 w-3 mr-1" />
                    {getHealthScoreStatus(healthScore)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <Progress value={healthScore} className="h-3 mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <p className="font-medium">Ultimo Controllo</p>
                  <p className="text-muted-foreground">{quickStats.lastVetVisit}</p>
                </div>
                <div className="text-center">
                  <p className="font-medium">Prossimo Appuntamento</p>
                  <p className="text-muted-foreground">{quickStats.nextAppointment}</p>
                </div>
                <div className="text-center">
                  <p className="font-medium">Farmaci Attivi</p>
                  <p className="text-muted-foreground">{quickStats.activeMedications}</p>
                </div>
                <div className="text-center">
                  <p className="font-medium">Documenti Medici</p>
                  <p className="text-muted-foreground">{quickStats.totalRecords}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Trends Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Peso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip labelFormatter={(label) => `Data: ${label}`} />
                    <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Attività
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="hsl(var(--success))" fill="hsl(var(--success) / 0.3)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Appetito
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={appetiteData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="hsl(var(--warning))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Sonno
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={sleepData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="hsl(var(--accent))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col gap-2 bg-background hover:bg-muted/50 transition-colors"
              onClick={() => setShowAddMetric(true)}
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm">Aggiungi Metrica</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col gap-2 bg-background hover:bg-muted/50 transition-colors"
              onClick={() => setShowAddRecord(true)}
            >
              <FileText className="h-6 w-6" />
              <span className="text-sm">Nuovo Documento</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col gap-2 bg-background hover:bg-muted/50 transition-colors"
              onClick={() => setShowAddMedication(true)}
            >
              <Pill className="h-6 w-6" />
              <span className="text-sm">Aggiungi Farmaco</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col gap-2 bg-background hover:bg-muted/50 transition-colors"
              onClick={() => setActiveTab('emergency')}
            >
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Prenota Visita</span>
            </Button>
          </div>
        </TabsContent>

        {/* MEDICAL PROFILE TAB */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Veterinarians */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Veterinari
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-background hover:bg-muted/50 transition-colors"
                    onClick={() => setShowAddVet(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {veterinarians.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Nessun veterinario registrato</p>
                ) : (
                  veterinarians.map(vet => (
                    <div 
                      key={vet.id} 
                      className="border rounded-lg p-4 space-y-2 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => handleEditVet(vet)}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{vet.name}</h4>
                        <div className="flex gap-1">
                          {vet.is_primary && (
                            <Badge variant="default">Primario</Badge>
                          )}
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      {vet.clinic_name && (
                        <p className="text-sm text-muted-foreground">{vet.clinic_name}</p>
                      )}
                      <div className="flex gap-4 text-sm">
                        {vet.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {vet.phone}
                          </div>
                        )}
                        {vet.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {vet.email}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Insurance */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Assicurazione
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-background hover:bg-muted/50 transition-colors"
                    onClick={() => setShowAddInsurance(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {petInsurance.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Nessuna polizza assicurativa registrata</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {petInsurance.map(insurance => {
                      const status = getInsuranceStatus(insurance);
                      return (
                        <div key={insurance.id} className="border rounded-lg p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{insurance.provider_name}</h4>
                            <Badge variant={
                              status === 'active' ? "default" : 
                              status === 'expiring' ? "destructive" : "secondary"
                            }>
                              {status === 'active' ? "Attiva" : 
                               status === 'expiring' ? "In scadenza" : "Scaduta"}
                            </Badge>
                          </div>
                        <p className="text-sm text-muted-foreground">
                          Polizza: {insurance.policy_number}
                        </p>
                        <div className="flex gap-4 text-sm">
                          <span>Dal: {format(new Date(insurance.start_date), 'dd/MM/yyyy')}</span>
                          {insurance.end_date && (
                            <span>Al: {format(new Date(insurance.end_date), 'dd/MM/yyyy')}</span>
                          )}
                        </div>
                        {insurance.premium_amount && (
                          <p className="text-sm">Premio: €{insurance.premium_amount}/anno</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pet Medical ID */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Identificazione Medica
              </CardTitle>
              <CardDescription>
                Genera tag di identificazione medica e QR code per emergenze
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <Label>Microchip</Label>
                  <Input 
                    placeholder="Numero microchip" 
                    value={medicalId.microchip}
                    onChange={(e) => setMedicalId(prev => ({ ...prev, microchip: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Allergie</Label>
                  <Input 
                    placeholder="Es. Polline, alcuni cibi" 
                    value={medicalId.allergies}
                    onChange={(e) => setMedicalId(prev => ({ ...prev, allergies: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Condizioni</Label>
                  <Input 
                    placeholder="Es. Artrite, diabete" 
                    value={medicalId.conditions}
                    onChange={(e) => setMedicalId(prev => ({ ...prev, conditions: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <Label>Farmaci Attuali</Label>
                  <Textarea 
                    placeholder="Lista farmaci in corso" 
                    value={medicalId.medications}
                    onChange={(e) => setMedicalId(prev => ({ ...prev, medications: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contatto di Emergenza</Label>
                  <Textarea 
                    placeholder="Nome e telefono del contatto principale" 
                    value={medicalId.emergency_contact}
                    onChange={(e) => setMedicalId(prev => ({ ...prev, emergency_contact: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Button onClick={handleSaveMedicalId}>
                  <FileText className="h-4 w-4 mr-2" />
                  Salva Informazioni
                </Button>
                <Button variant="outline" onClick={handleGenerateQRCode}>
                  <QrCode className="h-4 w-4 mr-2" />
                  Genera QR Code
                </Button>
                <Button variant="outline" onClick={handleCreateMedicalTag}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Crea Tag Medico
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DOCUMENTS TAB */}
        <TabsContent value="records" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documenti Medici
                  </CardTitle>
                  <CardDescription>
                    Organizza e gestisci tutti i documenti sanitari del tuo pet
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-background hover:bg-muted/50 transition-colors"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Carica
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-background hover:bg-muted/50 transition-colors"
                    onClick={() => setShowAddRecord(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuovo Documento
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <input
                id="file-upload"
                type="file"
                hidden
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleUploadDocument(file);
                  }
                }}
              />
              <div className="space-y-4">
                {medicalRecords.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Nessun documento medico caricato</p>
                    <Button 
                      variant="outline" 
                      className="bg-background hover:bg-muted/50 transition-colors"
                      onClick={() => setShowAddRecord(true)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Carica Primo Documento
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {medicalRecords.map(record => (
                      <div 
                        key={record.id} 
                        className="border rounded-lg p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => handleEditRecord(record)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{record.title}</h4>
                              <Badge variant="secondary">{record.record_type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(record.record_date), 'dd MMMM yyyy', { locale: it })}
                            </p>
                            {record.description && (
                              <p className="text-sm">{record.description}</p>
                            )}
                            {record.veterinarian && (
                              <p className="text-xs text-muted-foreground">
                                Dr. {record.veterinarian.name}
                                {record.veterinarian.clinic_name && ` - ${record.veterinarian.clinic_name}`}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                        {status === 'expiring' && (
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              La polizza scade tra pochi giorni. Rinnova per mantenere la copertura.
                            </AlertDescription>
                          </Alert>
                        )}
                      );
                    })}
                   </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* HEALTH TRACKING TAB */}
        <TabsContent value="tracking" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Medications */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5" />
                    Farmaci Attivi
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-background hover:bg-muted/50 transition-colors"
                    onClick={() => setShowAddMedication(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medications.filter(m => m.is_active).length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">Nessun farmaco attivo</p>
                   ) : (
                      const medStatus = getMedicationStatus(med);
                      return (
                        <div 
                          key={med.id} 
                          className="border rounded-lg p-4 space-y-2 hover:bg-muted/30 transition-colors cursor-pointer"
                          onClick={() => handleEditMedication(med)}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{med.name}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant={medStatus === 'active' ? "default" : "secondary"}>
                                {medStatus === 'active' ? "Attivo" : "Scaduto"}
                              </Badge>
                              <Edit className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {med.dosage} - {med.frequency}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Dal {format(new Date(med.start_date), 'dd/MM/yyyy')}
                            {med.end_date && ` al ${format(new Date(med.end_date), 'dd/MM/yyyy')}`}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Latest Metrics */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Ultime Metriche
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-background hover:bg-muted/50 transition-colors"
                    onClick={() => setShowAddMetric(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {healthMetrics.slice(0, 5).map(metric => (
                    <div 
                      key={metric.id} 
                      className="flex items-center justify-between border-b pb-2 hover:bg-muted/30 transition-colors cursor-pointer rounded px-2 py-1"
                      onClick={() => handleEditMetric(metric)}
                    >
                      <div>
                        <p className="font-medium capitalize">{metric.metric_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(metric.recorded_at), 'dd/MM HH:mm')}
                        </p>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <div>
                          <p className="font-bold">{metric.value} {metric.unit}</p>
                        </div>
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Correlazioni Salute-Umore
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-32 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Analisi delle correlazioni tra salute fisica e stato emotivo
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => toast({
                      title: "Analisi Correlazioni",
                      description: "Funzionalità in sviluppo - Analisi avanzate disponibili presto"
                    })}
                  >
                    Visualizza Analisi
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Pattern Stagionali
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-32 bg-gradient-to-r from-warning/10 to-success/10 rounded-lg flex items-center justify-center">
                    <Eye className="h-8 w-8 text-warning" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Identifica pattern comportamentali e di salute stagionali
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => toast({
                      title: "Pattern Stagionali",
                      description: "Analisi dei pattern climatici e stagionali in corso"
                    })}
                  >
                    Analizza Pattern
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Efficacia Farmaci
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-32 bg-gradient-to-r from-success/10 to-primary/10 rounded-lg flex items-center justify-center">
                    <Target className="h-8 w-8 text-success" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Monitoraggio efficacia terapie e trattamenti
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => toast({
                      title: "Efficacia Farmaci",
                      description: "Tracking dell'efficacia delle terapie in corso"
                    })}
                  >
                    Valuta Efficacia
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Trend Salute Generale</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={prepareChartData('activity')}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuzione Visite</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Controlli di routine', 'Emergenze', 'Vaccinazioni', 'Specialistiche'].map((type, index) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm">{type}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={[60, 20, 15, 5][index]} className="w-20" />
                        <span className="text-sm text-muted-foreground">{[60, 20, 15, 5][index]}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* EMERGENCY TAB */}
        <TabsContent value="emergency" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Emergency Contacts */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contatti di Emergenza
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-background hover:bg-muted/50 transition-colors"
                    onClick={() => setShowAddContact(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {emergencyContacts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Nessun contatto di emergenza</p>
                ) : (
                  emergencyContacts.map(contact => (
                    <div 
                      key={contact.id} 
                      className="border rounded-lg p-4 space-y-2 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => handleEditContact(contact)}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{contact.name}</h4>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={(e) => {
                            e.stopPropagation();
                            if (contact.phone) {
                              window.open(`tel:${contact.phone}`, '_self');
                            }
                          }}>
                            <PhoneCall className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={(e) => {
                            e.stopPropagation();
                            if (contact.phone) {
                              window.open(`sms:${contact.phone}`, '_self');
                            }
                          }}>
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {contact.relationship} • {contact.contact_type}
                      </p>
                      <p className="text-sm font-mono">{contact.phone}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Quick Emergency Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Siren className="h-5 w-5" />
                  Azioni di Emergenza
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                  onClick={() => handleEmergencyAction('call_vet')}
                >
                  <PhoneCall className="h-4 w-4 mr-2" />
                  Chiama Veterinario di Emergenza
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start bg-background hover:bg-muted/50"
                  onClick={() => handleEmergencyAction('find_clinic')}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Trova Clinica Più Vicina
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start bg-background hover:bg-muted/50"
                  onClick={() => handleEmergencyAction('poison_control')}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Centro Antiveleni
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start bg-background hover:bg-muted/50"
                  onClick={() => handleEmergencyAction('first_aid')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Guida Primo Soccorso
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Protocol */}
          <Card>
            <CardHeader>
              <CardTitle>Protocollo di Emergenza</CardTitle>
              <CardDescription>
                Linee guida step-by-step per situazioni di emergenza
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-destructive pl-4">
                  <h4 className="font-medium text-destructive">1. Valuta la Situazione</h4>
                  <p className="text-sm text-muted-foreground">
                    Mantieni la calma e valuta se il pet è cosciente e respira normalmente
                  </p>
                </div>
                <div className="border-l-4 border-warning pl-4">
                  <h4 className="font-medium text-warning">2. Contatta il Veterinario</h4>
                  <p className="text-sm text-muted-foreground">
                    Chiama immediatamente il veterinario o la clinica di emergenza
                  </p>
                </div>
                <div className="border-l-4 border-success pl-4">
                  <h4 className="font-medium text-success">3. Primo Soccorso</h4>
                  <p className="text-sm text-muted-foreground">
                    Applica le tecniche di primo soccorso appropriate se necessario
                  </p>
                </div>
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-medium text-primary">4. Trasporto Sicuro</h4>
                  <p className="text-sm text-muted-foreground">
                    Trasporta il pet in modo sicuro seguendo le indicazioni del veterinario
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Metric Dialog */}
      <Dialog open={showAddMetric} onOpenChange={setShowAddMetric}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMetric ? 'Modifica Metrica di Salute' : 'Aggiungi Metrica di Salute'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo Metrica</Label>
              <Select value={newMetric.metric_type} onValueChange={(value) => setNewMetric(prev => ({ ...prev, metric_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo metrica" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight">Peso</SelectItem>
                  <SelectItem value="temperature">Temperatura</SelectItem>
                  <SelectItem value="appetite">Appetito (1-10)</SelectItem>
                  <SelectItem value="activity">Attività (1-10)</SelectItem>
                  <SelectItem value="sleep">Sonno (1-10)</SelectItem>
                  <SelectItem value="behavior">Comportamento (1-10)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valore</Label>
                <Input 
                  type="number" 
                  step="0.1" 
                  placeholder="Es. 15.5" 
                  value={newMetric.value}
                  onChange={(e) => setNewMetric(prev => ({ ...prev, value: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Unità</Label>
                <Input 
                  placeholder="Es. kg, °C" 
                  value={newMetric.unit}
                  onChange={(e) => setNewMetric(prev => ({ ...prev, unit: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Note (opzionale)</Label>
              <Textarea 
                placeholder="Aggiungi note o osservazioni..." 
                value={newMetric.notes}
                onChange={(e) => setNewMetric(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowAddMetric(false);
                setEditingMetric(null);
                setNewMetric({ metric_type: '', value: '', unit: '', notes: '' });
              }}>
                Annulla
              </Button>
              <Button onClick={editingMetric ? handleUpdateMetric : handleAddMetric}>
                {editingMetric ? 'Aggiorna Metrica' : 'Salva Metrica'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Medical Record Dialog */}
      <Dialog open={showAddRecord} onOpenChange={(open) => {
        setShowAddRecord(open);
        if (!open) {
          setEditingRecord(null);
          setNewRecord({ title: '', record_type: '', record_date: '', description: '', cost: '' });
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? 'Modifica Documento Medico' : 'Nuovo Documento Medico'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Titolo</Label>
                <Input 
                  placeholder="Es. Visita di controllo" 
                  value={newRecord.title}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo Documento</Label>
                <Select value={newRecord.record_type} onValueChange={(value) => setNewRecord(prev => ({ ...prev, record_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vaccination">Vaccinazione</SelectItem>
                    <SelectItem value="exam">Visita</SelectItem>
                    <SelectItem value="treatment">Trattamento</SelectItem>
                    <SelectItem value="lab_work">Analisi</SelectItem>
                    <SelectItem value="surgery">Chirurgia</SelectItem>
                    <SelectItem value="emergency">Emergenza</SelectItem>
                    <SelectItem value="other">Altro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Documento</Label>
                <Input 
                  type="date" 
                  value={newRecord.record_date}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, record_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Costo (opzionale)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="€ 0.00" 
                  value={newRecord.cost}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, cost: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrizione</Label>
              <Textarea 
                placeholder="Descrivi il documento o la visita..." 
                value={newRecord.description}
                onChange={(e) => setNewRecord(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Carica Documento</Label>
              <div 
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => document.getElementById('record-file-upload')?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Trascina qui i file o clicca per selezionare
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, immagini, documenti (max 10MB)
                </p>
              </div>
              <input
                id="record-file-upload"
                type="file"
                hidden
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleUploadDocument(file);
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddRecord(false)}>
                Annulla
              </Button>
              <Button onClick={editingRecord ? handleUpdateRecord : handleAddRecord}>
                {editingRecord ? 'Aggiorna Documento' : 'Salva Documento'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Medication Dialog */}
      <Dialog open={showAddMedication} onOpenChange={(open) => {
        setShowAddMedication(open);
        if (!open) {
          setEditingMedication(null);
          setNewMedication({ name: '', dosage: '', frequency: '', start_date: '', end_date: '', notes: '' });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMedication ? 'Modifica Farmaco' : 'Aggiungi Farmaco'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Farmaco</Label>
              <Input 
                placeholder="Es. Antibiotico XYZ" 
                value={newMedication.name}
                onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dosaggio</Label>
                <Input 
                  placeholder="Es. 10mg" 
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Frequenza</Label>
                <Input 
                  placeholder="Es. 2 volte al giorno" 
                  value={newMedication.frequency}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Inizio</Label>
                <Input 
                  type="date" 
                  value={newMedication.start_date}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Data Fine (opzionale)</Label>
                <Input 
                  type="date" 
                  value={newMedication.end_date}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea 
                placeholder="Istruzioni speciali, effetti collaterali, etc..." 
                value={newMedication.notes}
                onChange={(e) => setNewMedication(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddMedication(false)}>
                Annulla
              </Button>
              <Button onClick={editingMedication ? handleUpdateMedication : handleAddMedication}>
                {editingMedication ? 'Aggiorna Farmaco' : 'Salva Farmaco'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Veterinarian Dialog */}
      <Dialog open={showAddVet} onOpenChange={(open) => {
        setShowAddVet(open);
        if (!open) {
          setEditingVet(null);
          setNewVet({ name: '', vet_type: '', clinic_name: '', phone: '', email: '', address: '' });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingVet ? 'Modifica Veterinario' : 'Aggiungi Veterinario'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input 
                  placeholder="Dr. Mario Rossi" 
                  value={newVet.name}
                  onChange={(e) => setNewVet(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={newVet.vet_type} onValueChange={(value) => setNewVet(prev => ({ ...prev, vet_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primario</SelectItem>
                    <SelectItem value="specialist">Specialista</SelectItem>
                    <SelectItem value="emergency">Emergenza</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Clinica</Label>
              <Input 
                placeholder="Nome della clinica" 
                value={newVet.clinic_name}
                onChange={(e) => setNewVet(prev => ({ ...prev, clinic_name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefono</Label>
                <Input 
                  placeholder="+39 123 456 7890" 
                  value={newVet.phone}
                  onChange={(e) => setNewVet(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email" 
                  placeholder="vet@clinica.it" 
                  value={newVet.email}
                  onChange={(e) => setNewVet(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Indirizzo</Label>
              <Textarea 
                placeholder="Via Roma 123, Milano" 
                value={newVet.address}
                onChange={(e) => setNewVet(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddVet(false)}>
                Annulla
              </Button>
              <Button onClick={editingVet ? handleUpdateVet : handleAddVet}>
                {editingVet ? 'Aggiorna Veterinario' : 'Salva Veterinario'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Emergency Contact Dialog */}
      <Dialog open={showAddContact} onOpenChange={(open) => {
        setShowAddContact(open);
        if (!open) {
          setEditingContact(null);
          setNewContact({ name: '', contact_type: '', phone: '', relationship: '', email: '', notes: '' });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingContact ? 'Modifica Contatto di Emergenza' : 'Aggiungi Contatto di Emergenza'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input 
                  placeholder="Mario Rossi" 
                  value={newContact.name}
                  onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo Contatto</Label>
                <Select value={newContact.contact_type} onValueChange={(value) => setNewContact(prev => ({ ...prev, contact_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family">Famiglia</SelectItem>
                    <SelectItem value="friend">Amico</SelectItem>
                    <SelectItem value="vet">Veterinario</SelectItem>
                    <SelectItem value="emergency_vet">Vet. Emergenza</SelectItem>
                    <SelectItem value="poison_control">Centro Antiveleni</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefono</Label>
                <Input 
                  placeholder="+39 123 456 7890" 
                  value={newContact.phone}
                  onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Relazione</Label>
                <Input 
                  placeholder="Es. Fratello, Amico" 
                  value={newContact.relationship}
                  onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email (opzionale)</Label>
              <Input 
                type="email" 
                placeholder="contatto@email.it" 
                value={newContact.email}
                onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea 
                placeholder="Informazioni aggiuntive..." 
                value={newContact.notes}
                onChange={(e) => setNewContact(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddContact(false)}>
                Annulla
              </Button>
              <Button onClick={editingContact ? handleUpdateContact : handleAddContact}>
                {editingContact ? 'Aggiorna Contatto' : 'Salva Contatto'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Insurance Dialog */}
      <Dialog open={showAddInsurance} onOpenChange={setShowAddInsurance}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Assicurazione</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Compagnia Assicuratrice</Label>
                <Input 
                  placeholder="Es. Allianz Pet" 
                  value={newInsurance.provider_name}
                  onChange={(e) => setNewInsurance(prev => ({ ...prev, provider_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Numero Polizza</Label>
                <Input 
                  placeholder="Es. POL123456789" 
                  value={newInsurance.policy_number}
                  onChange={(e) => setNewInsurance(prev => ({ ...prev, policy_number: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tipo Polizza</Label>
              <Select value={newInsurance.policy_type} onValueChange={(value) => setNewInsurance(prev => ({ ...prev, policy_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Base</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="comprehensive">Completa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Inizio</Label>
                <Input 
                  type="date" 
                  value={newInsurance.start_date}
                  onChange={(e) => setNewInsurance(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Data Fine (opzionale)</Label>
                <Input 
                  type="date" 
                  value={newInsurance.end_date}
                  onChange={(e) => setNewInsurance(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Premio Annuale (€)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="500.00" 
                  value={newInsurance.premium_amount}
                  onChange={(e) => setNewInsurance(prev => ({ ...prev, premium_amount: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Franchigia (€)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="100.00" 
                  value={newInsurance.deductible}
                  onChange={(e) => setNewInsurance(prev => ({ ...prev, deductible: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddInsurance(false)}>
                Annulla
              </Button>
              <Button onClick={handleAddInsurance}>Salva Assicurazione</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
        <FirstAidGuide 
          open={showFirstAidGuide} 
          onOpenChange={setShowFirstAidGuide} 
        />
      </div>
    );
  };

  export default WellnessPage;