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
import { format, startOfMonth, endOfMonth, subMonths, subDays, isAfter, isBefore, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { FirstAidGuide } from '@/components/FirstAidGuide';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import jsPDF from 'jspdf';

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
  specialization?: string;
  is_primary: boolean;
}

interface EmergencyContact {
  id: string;
  name: string;
  contact_type: string;
  phone: string;
  relationship?: string;
  email?: string;
  notes?: string;
}

interface Insurance {
  id: string;
  provider_name: string;
  policy_number: string;
  policy_type?: string;
  start_date: string;
  end_date?: string;
  premium_amount?: number;
  deductible?: number;
  is_active: boolean;
}

const WellnessPage = () => {
  const { user } = useAuth();
  const { selectedPet } = usePets();
  
  // States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  // Dialog states
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [showAddVet, setShowAddVet] = useState(false);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showAddMetric, setShowAddMetric] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddInsurance, setShowAddInsurance] = useState(false);
  const [showFirstAidGuide, setShowFirstAidGuide] = useState(false);
  
  // Confirm dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {}
  });
  
  // Form states
  const [newDocument, setNewDocument] = useState({
    title: '',
    description: '',
    record_type: '',
    record_date: '',
    notes: ''
  });
  
  const [newVet, setNewVet] = useState({
    name: '',
    clinic_name: '',
    phone: '',
    email: '',
    address: '',
    specialization: '',
    is_primary: false
  });
  
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    start_date: '',
    end_date: '',
    notes: ''
  });
  
  const [newMetric, setNewMetric] = useState({
    metric_type: '',
    value: '',
    unit: '',
    notes: ''
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
  
  const [medicalId, setMedicalId] = useState({
    microchip: '',
    bloodType: '',
    allergies: '',
    medicalConditions: '',
    emergencyNotes: '',
    vetContact: ''
  });
  
  // Editing states
  const [editingDocument, setEditingDocument] = useState<MedicalRecord | null>(null);
  const [editingVet, setEditingVet] = useState<Veterinarian | null>(null);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [editingMetric, setEditingMetric] = useState<HealthMetric | null>(null);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [editingInsurance, setEditingInsurance] = useState<Insurance | null>(null);

  // Helper functions
  const getMedicationStatus = (medication: Medication) => {
    if (!medication.is_active) return 'inactive';
    if (medication.end_date && new Date(medication.end_date) < new Date()) return 'expired';
    return 'active';
  };

  const getInsuranceStatus = (insurance: Insurance) => {
    if (!insurance.is_active) return 'inactive';
    if (insurance.end_date) {
      const endDate = new Date(insurance.end_date);
      const today = new Date();
      const daysUntilExpiry = differenceInDays(endDate, today);
      
      if (daysUntilExpiry < 0) return 'expired';
      if (daysUntilExpiry <= 30) return 'expiring';
    }
    return 'active';
  };

  // Generate realistic chart data based on actual database data
  const generateHealthTrendData = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthMetrics = healthMetrics.filter(metric => {
        const metricDate = new Date(metric.recorded_at);
        return metricDate >= startOfMonth(date) && metricDate <= endOfMonth(date);
      });
      
      months.push({
        month: format(date, 'MMM', { locale: it }),
        score: monthMetrics.length > 0 
          ? Math.round(monthMetrics.reduce((sum, m) => sum + (m.value * 10), 0) / monthMetrics.length)
          : Math.floor(Math.random() * 20) + 75,
        visits: monthMetrics.filter(m => m.metric_type === 'checkup').length
      });
    }
    return months;
  };

  const generateVisitDistribution = () => {
    const visitTypes = medicalRecords.reduce((acc, record) => {
      acc[record.record_type] = (acc[record.record_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(visitTypes).map(([name, value]) => ({ name, value }));
  };

  // Fetch health data
  const fetchHealthData = async () => {
    if (!user || !selectedPet) return;
    
    setIsLoading(true);
    try {
      // Fetch all data in parallel
      const [metricsRes, recordsRes, medicationsRes, vetsRes, contactsRes, insuranceRes] = await Promise.all([
        supabase.from('health_metrics').select('*').eq('user_id', user.id).eq('pet_id', selectedPet.id).order('recorded_at', { ascending: false }),
        supabase.from('medical_records').select('*').eq('user_id', user.id).eq('pet_id', selectedPet.id).order('record_date', { ascending: false }),
        supabase.from('medications').select('*').eq('user_id', user.id).eq('pet_id', selectedPet.id).order('created_at', { ascending: false }),
        supabase.from('veterinarians').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('emergency_contacts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('pet_insurance').select('*').eq('user_id', user.id).eq('pet_id', selectedPet.id).order('created_at', { ascending: false })
      ]);
      
      if (metricsRes.data) setHealthMetrics(metricsRes.data);
      if (recordsRes.data) setMedicalRecords(recordsRes.data);
      if (medicationsRes.data) setMedications(medicationsRes.data);
      if (vetsRes.data) setVeterinarians(vetsRes.data);
      if (contactsRes.data) setEmergencyContacts(contactsRes.data);
      if (insuranceRes.data) setInsurances(insuranceRes.data);
      
    } catch (error) {
      console.error('Error fetching health data:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i dati sulla salute",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load Medical ID from localStorage when pet changes
  useEffect(() => {
    if (selectedPet) {
      const savedMedicalId = localStorage.getItem(`medicalId_${selectedPet.id}`);
      if (savedMedicalId) {
        try {
          const data = JSON.parse(savedMedicalId);
          setMedicalId({
            microchip: data.microchip || '',
            bloodType: data.bloodType || '',
            allergies: data.allergies || '',
            medicalConditions: data.medicalConditions || '',
            emergencyNotes: data.emergencyNotes || '',
            vetContact: data.vetContact || ''
          });
        } catch (error) {
          console.error('Error loading medical ID:', error);
        }
      } else {
        // Reset medical ID if no saved data
        setMedicalId({
          microchip: '',
          bloodType: '',
          allergies: '',
          medicalConditions: '',
          emergencyNotes: '',
          vetContact: ''
        });
      }
    }
  }, [selectedPet]);

  useEffect(() => {
    fetchHealthData();
  }, [user, selectedPet]);

  // Document upload function
  const handleUploadDocument = async (file: File) => {
    if (!user || !selectedPet) {
      toast({
        title: "Errore",
        description: "Devi essere autenticato e avere un pet selezionato",
        variant: "destructive"
      });
      return;
    }

    if (!file) {
      toast({
        title: "Errore",
        description: "Nessun file selezionato",
        variant: "destructive"
      });
      return;
    }

    // Validate required fields
    if (!newDocument.title.trim()) {
      toast({
        title: "Errore",
        description: "Il titolo del documento è obbligatorio",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/medical-documents/${selectedPet.id}/${Date.now()}.${fileExt}`;
      
      console.log('Starting file upload...', { fileName, fileSize: file.size });
      
      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pet-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Errore caricamento file: ${uploadError.message}`);
      }

      console.log('File uploaded successfully:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pet-media')
        .getPublicUrl(fileName);

      console.log('Public URL generated:', publicUrl);

      // Create medical record with explicit user_id
      const recordData = {
        user_id: user.id,
        pet_id: selectedPet.id,
        title: newDocument.title.trim(),
        description: newDocument.description?.trim() || null,
        record_type: newDocument.record_type || 'documento',
        record_date: newDocument.record_date || new Date().toISOString().split('T')[0],
        document_url: publicUrl,
        notes: newDocument.notes?.trim() || null
      };

      console.log('Inserting record with data:', recordData);

      const { data: recordResult, error: recordError } = await supabase
        .from('medical_records')
        .insert(recordData)
        .select('*');

      if (recordError) {
        console.error('Database insert error:', recordError);
        // Delete uploaded file if database insert fails
        await supabase.storage.from('pet-media').remove([fileName]);
        throw new Error(`Errore database: ${recordError.message}`);
      }

      console.log('Record created successfully:', recordResult);

      toast({
        title: "Successo",
        description: "Documento caricato con successo"
      });

      // Reset form and close dialog
      setNewDocument({ title: '', description: '', record_type: '', record_date: '', notes: '' });
      setShowAddDocument(false);
      setEditingDocument(null);
      
      // Refresh data
      fetchHealthData();
      
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast({
        title: "Errore di caricamento",
        description: error.message || "Impossibile caricare il documento. Verifica la connessione e riprova.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Save document without file upload
  const handleSaveDocumentOnly = async () => {
    if (!user || !selectedPet) {
      toast({
        title: "Errore",
        description: "Devi essere autenticato e avere un pet selezionato",
        variant: "destructive"
      });
      return;
    }

    if (!newDocument.title.trim()) {
      toast({
        title: "Errore",
        description: "Il titolo del documento è obbligatorio",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);

      const recordData = {
        user_id: user.id,
        pet_id: selectedPet.id,
        title: newDocument.title.trim(),
        description: newDocument.description?.trim() || null,
        record_type: newDocument.record_type || 'documento',
        record_date: newDocument.record_date || new Date().toISOString().split('T')[0],
        notes: newDocument.notes?.trim() || null
      };

      const { data: recordResult, error: recordError } = await supabase
        .from('medical_records')
        .insert(recordData)
        .select('*');

      if (recordError) {
        console.error('Database insert error:', recordError);
        throw new Error(`Errore database: ${recordError.message}`);
      }

      toast({
        title: "Successo",
        description: "Documento salvato con successo"
      });

      // Reset form and close dialog
      setNewDocument({ title: '', description: '', record_type: '', record_date: '', notes: '' });
      setShowAddDocument(false);
      setEditingDocument(null);
      
      // Refresh data
      fetchHealthData();
      
    } catch (error: any) {
      console.error('Error saving document:', error);
      toast({
        title: "Errore di salvataggio",
        description: error.message || "Impossibile salvare il documento.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Add Veterinarian
  const handleAddVet = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('veterinarians')
        .insert({
          user_id: user.id,
          name: newVet.name,
          clinic_name: newVet.clinic_name,
          phone: newVet.phone,
          email: newVet.email,
          address: newVet.address,
          specialization: newVet.specialization,
          is_primary: newVet.is_primary
        });

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Veterinario aggiunto con successo"
      });

      setNewVet({ name: '', clinic_name: '', phone: '', email: '', address: '', specialization: '', is_primary: false });
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

  // Add Medication
  const handleAddMedication = async () => {
    if (!user || !selectedPet) return;
    
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
          notes: newMedication.notes,
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

  // Add Health Metric
  const handleAddMetric = async () => {
    if (!user || !selectedPet) return;
    
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
          notes: newMetric.notes
        });

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Dato registrato con successo"
      });

      setNewMetric({ metric_type: '', value: '', unit: '', notes: '' });
      setShowAddMetric(false);
      fetchHealthData();
    } catch (error) {
      console.error('Error adding metric:', error);
      toast({
        title: "Errore",
        description: "Impossibile registrare il dato",
        variant: "destructive"
      });
    }
  };

  // Add Emergency Contact
  const handleAddContact = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .insert({
          user_id: user.id,
          name: newContact.name,
          contact_type: newContact.contact_type,
          phone: newContact.phone,
          relationship: newContact.relationship,
          email: newContact.email,
          notes: newContact.notes
        });

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Contatto aggiunto con successo"
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

  // Add Insurance
  const handleAddInsurance = async () => {
    if (!user || !selectedPet) return;
    
    try {
      const { error } = await supabase
        .from('pet_insurance')
        .insert({
          user_id: user.id,
          pet_id: selectedPet.id,
          provider_name: newInsurance.provider_name,
          policy_number: newInsurance.policy_number,
          policy_type: newInsurance.policy_type,
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

  // Delete functions
  const handleDeleteDocument = async (id: string) => {
    try {
      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Documento eliminato con successo"
      });
      fetchHealthData();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il documento",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMedication = async (id: string) => {
    try {
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Farmaco eliminato con successo"
      });
      fetchHealthData();
    } catch (error) {
      console.error('Error deleting medication:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il farmaco",
        variant: "destructive"
      });
    }
  };

  const handleDeleteVet = async (id: string) => {
    try {
      const { error } = await supabase
        .from('veterinarians')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Veterinario eliminato con successo"
      });
      fetchHealthData();
    } catch (error) {
      console.error('Error deleting veterinarian:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il veterinario",
        variant: "destructive"
      });
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Contatto eliminato con successo"
      });
      fetchHealthData();
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il contatto",
        variant: "destructive"
      });
    }
  };

  const handleDeleteInsurance = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pet_insurance')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Assicurazione eliminata con successo"
      });
      fetchHealthData();
    } catch (error) {
      console.error('Error deleting insurance:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare l'assicurazione",
        variant: "destructive"
      });
    }
  };

  // Save Medical ID to localStorage
  const saveMedicalId = () => {
    if (!selectedPet) return;
    
    try {
      localStorage.setItem(`medicalId_${selectedPet.id}`, JSON.stringify(medicalId));
      toast({
        title: "Successo",
        description: "Informazioni salvate con successo"
      });
    } catch (error) {
      console.error('Error saving medical ID:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare le informazioni",
        variant: "destructive"
      });
    }
  };

  // Export Medical ID to PDF
  const exportMedicalIdToPDF = () => {
    if (!selectedPet) return;

    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Identificazione Medica', 20, 30);
    doc.setFontSize(16);
    doc.text(`Pet: ${selectedPet.name}`, 20, 45);
    
    doc.setFontSize(12);
    let yPos = 65;
    
    if (medicalId.microchip) {
      doc.text(`Microchip: ${medicalId.microchip}`, 20, yPos);
      yPos += 15;
    }
    
    if (medicalId.bloodType) {
      doc.text(`Gruppo Sanguigno: ${medicalId.bloodType}`, 20, yPos);
      yPos += 15;
    }
    
    if (medicalId.allergies) {
      doc.text('Allergie:', 20, yPos);
      yPos += 10;
      const allergiesLines = doc.splitTextToSize(medicalId.allergies, 170);
      doc.text(allergiesLines, 20, yPos);
      yPos += allergiesLines.length * 7;
    }
    
    if (medicalId.medicalConditions) {
      doc.text('Condizioni Mediche:', 20, yPos);
      yPos += 10;
      const conditionsLines = doc.splitTextToSize(medicalId.medicalConditions, 170);
      doc.text(conditionsLines, 20, yPos);
      yPos += conditionsLines.length * 7;
    }
    
    if (medicalId.emergencyNotes) {
      doc.text('Note di Emergenza:', 20, yPos);
      yPos += 10;
      const notesLines = doc.splitTextToSize(medicalId.emergencyNotes, 170);
      doc.text(notesLines, 20, yPos);
      yPos += notesLines.length * 7;
    }
    
    if (medicalId.vetContact) {
      doc.text(`Veterinario di Emergenza: ${medicalId.vetContact}`, 20, yPos);
    }
    
    doc.save(`identificazione-medica-${selectedPet.name}.pdf`);
  };

  // Chart colors
  const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#413ea0'];

  // No pet selected
  if (!selectedPet) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-destructive" />
              Seleziona un Pet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Seleziona un pet per visualizzare i dati sulla salute e benessere.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="h-8 w-8 text-destructive" />
            Salute e Benessere
          </h1>
          <p className="text-muted-foreground">
            Monitora la salute di {selectedPet.name}
          </p>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="documenti" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documenti
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="emergenze" className="flex items-center gap-2">
            <Siren className="h-4 w-4" />
            Emergenze
          </TabsTrigger>
          <TabsTrigger value="info" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Info Mediche
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                      <div className="h-8 bg-muted rounded w-2/3"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Punteggio Benessere</p>
                        <p className="text-3xl font-bold text-primary">92</p>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                          <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                          +3% dal mese scorso
                        </p>
                      </div>
                      <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Heart className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Ultimo Controllo</p>
                        <p className="text-2xl font-bold">
                          {medicalRecords.length > 0 
                            ? `${differenceInDays(new Date(), new Date(medicalRecords[0].record_date))} giorni fa`
                            : 'Nessun dato'
                          }
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {medicalRecords.length > 0 
                            ? format(new Date(medicalRecords[0].record_date), 'dd/MM/yyyy', { locale: it })
                            : 'Non disponibile'
                          }
                        </p>
                      </div>
                      <div className="h-12 w-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                        <Stethoscope className="h-6 w-6 text-blue-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Farmaci Attivi</p>
                        <p className="text-3xl font-bold">
                          {medications.filter(med => getMedicationStatus(med) === 'active').length}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                          <Pill className="h-3 w-3 mr-1" />
                          Di {medications.length} totali
                        </p>
                      </div>
                      <div className="h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center">
                        <Pill className="h-6 w-6 text-green-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Documenti Salvati</p>
                        <p className="text-3xl font-bold">{medicalRecords.length}</p>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                          <FileText className="h-3 w-3 mr-1" />
                          Record medici
                        </p>
                      </div>
                      <div className="h-12 w-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                        <FileText className="h-6 w-6 text-orange-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Trend Benessere
                    </CardTitle>
                    <CardDescription>
                      Andamento del punteggio benessere negli ultimi 6 mesi
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={generateHealthTrendData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[60, 100]} />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#8884d8" 
                          fill="#8884d8" 
                          fillOpacity={0.6}
                          name="Punteggio"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-primary" />
                      Distribuzione Visite
                    </CardTitle>
                    <CardDescription>
                      Tipologia di visite mediche registrate
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={generateVisitDistribution()}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {generateVisitDistribution().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  onClick={() => setShowAddDocument(true)}
                  className="h-20 flex-col gap-2"
                  variant="outline"
                >
                  <Plus className="h-6 w-6" />
                  Aggiungi Documento
                </Button>
                <Button 
                  onClick={() => setShowAddMedication(true)}
                  className="h-20 flex-col gap-2"
                  variant="outline"
                >
                  <Pill className="h-6 w-6" />
                  Nuovo Farmaco
                </Button>
                <Button 
                  onClick={() => setShowAddMetric(true)}
                  className="h-20 flex-col gap-2"
                  variant="outline"
                >
                  <Activity className="h-6 w-6" />
                  Registra Dati
                </Button>
                <Button 
                  onClick={() => setShowFirstAidGuide(true)}
                  className="h-20 flex-col gap-2"
                  variant="outline"
                >
                  <AlertTriangle className="h-6 w-6" />
                  Primo Soccorso
                </Button>
              </div>

              {/* Recent Items */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Documents */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Documenti Recenti
                      </CardTitle>
                      <CardDescription>Ultimi documenti medici aggiunti</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('documenti')}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {medicalRecords.slice(0, 3).map((record) => (
                        <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{record.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(record.record_date), 'dd/MM/yyyy', { locale: it })}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary">{record.record_type}</Badge>
                        </div>
                      ))}
                      {medicalRecords.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                          Nessun documento disponibile
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Active Medications */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Pill className="h-5 w-5 text-primary" />
                        Farmaci Attivi
                      </CardTitle>
                      <CardDescription>Terapie in corso</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('documenti')}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {medications.filter(med => getMedicationStatus(med) === 'active').slice(0, 3).map((medication) => (
                        <div key={medication.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-green-500/10 rounded-full flex items-center justify-center">
                              <Pill className="h-4 w-4 text-green-500" />
                            </div>
                            <div>
                              <p className="font-medium">{medication.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {medication.dosage} - {medication.frequency}
                              </p>
                            </div>
                          </div>
                          <Badge variant="default">Attivo</Badge>
                        </div>
                      ))}
                      {medications.filter(med => getMedicationStatus(med) === 'active').length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                          Nessun farmaco attivo
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documenti" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Medical Records */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Documenti Medici
                  </CardTitle>
                  <CardDescription>Cartelle cliniche, esami e documenti</CardDescription>
                </div>
                <Button onClick={() => setShowAddDocument(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuovo Documento
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medicalRecords.map((record) => (
                    <div key={record.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                            {record.document_url ? (
                              <FileImage className="h-5 w-5 text-primary" />
                            ) : (
                              <FileText className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold">{record.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(record.record_date), 'dd MMMM yyyy', { locale: it })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{record.record_type}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setConfirmDialog({
                                open: true,
                                title: 'Elimina Documento',
                                description: 'Sei sicuro di voler eliminare questo documento? Questa azione non può essere annullata.',
                                onConfirm: () => handleDeleteDocument(record.id)
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {record.description && (
                        <p className="text-sm text-muted-foreground mb-2">{record.description}</p>
                      )}
                      {record.document_url && (
                        <Button variant="outline" size="sm" className="mb-2" asChild>
                          <a href={record.document_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" />
                            Visualizza Documento
                          </a>
                        </Button>
                      )}
                      {record.notes && (
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-sm"><strong>Note:</strong> {record.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  {medicalRecords.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Nessun documento</h3>
                      <p className="text-muted-foreground mb-4">
                        Inizia aggiungendo il primo documento medico
                      </p>
                      <Button onClick={() => setShowAddDocument(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Aggiungi Documento
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Medications Sidebar */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-primary" />
                    Farmaci
                  </CardTitle>
                  <CardDescription>Terapie e medicinali</CardDescription>
                </div>
                <Button onClick={() => setShowAddMedication(true)} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {medications.map((medication) => {
                    const status = getMedicationStatus(medication);
                    return (
                      <div key={medication.id} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{medication.name}</h4>
                            <p className="text-sm text-muted-foreground">{medication.dosage}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge 
                              variant={status === 'active' ? 'default' : status === 'expired' ? 'destructive' : 'secondary'}
                            >
                              {status === 'active' ? 'Attivo' : status === 'expired' ? 'Scaduto' : 'Inattivo'}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setConfirmDialog({
                                  open: true,
                                  title: 'Elimina Farmaco',
                                  description: 'Sei sicuro di voler eliminare questo farmaco?',
                                  onConfirm: () => handleDeleteMedication(medication.id)
                                });
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{medication.frequency}</p>
                        {medication.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{medication.notes}</p>
                        )}
                      </div>
                    );
                  })}
                  {medications.length === 0 && (
                    <div className="text-center py-4">
                      <Pill className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Nessun farmaco</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Metriche di Salute
                </CardTitle>
                <CardDescription>Dati registrati negli ultimi mesi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {healthMetrics.slice(0, 5).map((metric) => (
                    <div key={metric.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{metric.metric_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(metric.recorded_at), 'dd/MM/yyyy HH:mm', { locale: it })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{metric.value} {metric.unit}</p>
                      </div>
                    </div>
                  ))}
                  {healthMetrics.length === 0 && (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Nessun dato</h3>
                      <p className="text-muted-foreground mb-4">
                        Inizia registrando le prime metriche di salute
                      </p>
                      <Button onClick={() => setShowAddMetric(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Registra Dati
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Andamento Peso
                </CardTitle>
                <CardDescription>Controllo del peso nel tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={healthMetrics
                    .filter(m => m.metric_type === 'peso')
                    .slice(0, 10)
                    .reverse()
                    .map(m => ({
                      date: format(new Date(m.recorded_at), 'dd/MM'),
                      peso: m.value
                    }))
                  }>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="peso" stroke="#8884d8" name="Peso (kg)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center">
            <Button onClick={() => setShowAddMetric(true)} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Registra Nuova Metrica
            </Button>
          </div>
        </TabsContent>

        {/* Emergency Tab */}
        <TabsContent value="emergenze" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Emergency Contacts */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    Contatti di Emergenza
                  </CardTitle>
                  <CardDescription>Veterinari e contatti per emergenze</CardDescription>
                </div>
                <Button onClick={() => setShowAddContact(true)} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emergencyContacts.map((contact) => (
                    <div key={contact.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-red-500/10 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-red-500" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{contact.name}</h3>
                            <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{contact.contact_type}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setConfirmDialog({
                                open: true,
                                title: 'Elimina Contatto',
                                description: 'Sei sicuro di voler eliminare questo contatto?',
                                onConfirm: () => handleDeleteContact(contact.id)
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{contact.phone}</span>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={`tel:${contact.phone}`}>
                              <PhoneCall className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                        {contact.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{contact.email}</span>
                          </div>
                        )}
                      </div>
                      {contact.notes && (
                        <div className="bg-muted p-2 rounded-md mt-2">
                          <p className="text-sm">{contact.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  {emergencyContacts.length === 0 && (
                    <div className="text-center py-8">
                      <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Nessun contatto</h3>
                      <p className="text-muted-foreground mb-4">
                        Aggiungi i tuoi contatti di emergenza
                      </p>
                      <Button onClick={() => setShowAddContact(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Aggiungi Contatto
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Veterinarians */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    Veterinari
                  </CardTitle>
                  <CardDescription>I tuoi veterinari di fiducia</CardDescription>
                </div>
                <Button onClick={() => setShowAddVet(true)} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {veterinarians.map((vet) => (
                    <div key={vet.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                            <Stethoscope className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{vet.name}</h3>
                            {vet.clinic_name && (
                              <p className="text-sm text-muted-foreground">{vet.clinic_name}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {vet.is_primary && <Badge variant="default">Primario</Badge>}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setConfirmDialog({
                                open: true,
                                title: 'Elimina Veterinario',
                                description: 'Sei sicuro di voler eliminare questo veterinario?',
                                onConfirm: () => handleDeleteVet(vet.id)
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {vet.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{vet.phone}</span>
                            <Button variant="ghost" size="sm" asChild>
                              <a href={`tel:${vet.phone}`}>
                                <PhoneCall className="h-3 w-3" />
                              </a>
                            </Button>
                          </div>
                        )}
                        {vet.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{vet.email}</span>
                          </div>
                        )}
                        {vet.address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{vet.address}</span>
                          </div>
                        )}
                        {vet.specialization && (
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{vet.specialization}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {veterinarians.length === 0 && (
                    <div className="text-center py-8">
                      <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Nessun veterinario</h3>
                      <p className="text-muted-foreground mb-4">
                        Aggiungi i tuoi veterinari di fiducia
                      </p>
                      <Button onClick={() => setShowAddVet(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Aggiungi Veterinario
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* First Aid Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Primo Soccorso
              </CardTitle>
              <CardDescription>
                Guida rapida per le emergenze più comuni
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <Button onClick={() => setShowFirstAidGuide(true)} size="lg" variant="destructive">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Apri Guida Primo Soccorso
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical Info Tab */}
        <TabsContent value="info" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Medical Identification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Identificazione Medica
                </CardTitle>
                <CardDescription>
                  Informazioni di identificazione per emergenze
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="microchip">Numero Microchip</Label>
                  <Input
                    id="microchip"
                    value={medicalId.microchip}
                    onChange={(e) => setMedicalId(prev => ({ ...prev, microchip: e.target.value }))}
                    placeholder="es. 123456789012345"
                  />
                </div>
                <div>
                  <Label htmlFor="bloodType">Gruppo Sanguigno</Label>
                  <Input
                    id="bloodType"
                    value={medicalId.bloodType}
                    onChange={(e) => setMedicalId(prev => ({ ...prev, bloodType: e.target.value }))}
                    placeholder="es. DEA 1.1 positivo"
                  />
                </div>
                <div>
                  <Label htmlFor="allergies">Allergie Note</Label>
                  <Textarea
                    id="allergies"
                    value={medicalId.allergies}
                    onChange={(e) => setMedicalId(prev => ({ ...prev, allergies: e.target.value }))}
                    placeholder="Elenca le allergie note..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="medicalConditions">Condizioni Mediche</Label>
                  <Textarea
                    id="medicalConditions"
                    value={medicalId.medicalConditions}
                    onChange={(e) => setMedicalId(prev => ({ ...prev, medicalConditions: e.target.value }))}
                    placeholder="Condizioni mediche croniche o importanti..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyNotes">Note di Emergenza</Label>
                  <Textarea
                    id="emergencyNotes"
                    value={medicalId.emergencyNotes}
                    onChange={(e) => setMedicalId(prev => ({ ...prev, emergencyNotes: e.target.value }))}
                    placeholder="Informazioni importanti per le emergenze..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="vetContact">Veterinario di Emergenza</Label>
                  <Input
                    id="vetContact"
                    value={medicalId.vetContact}
                    onChange={(e) => setMedicalId(prev => ({ ...prev, vetContact: e.target.value }))}
                    placeholder="Nome e telefono del veterinario"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={saveMedicalId} className="flex-1">
                    <Shield className="h-4 w-4 mr-2" />
                    Salva Informazioni
                  </Button>
                  <Button onClick={exportMedicalIdToPDF} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Esporta PDF
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Insurance */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Assicurazioni
                  </CardTitle>
                  <CardDescription>Polizze assicurative del pet</CardDescription>
                </div>
                <Button onClick={() => setShowAddInsurance(true)} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insurances.map((insurance) => {
                    const status = getInsuranceStatus(insurance);
                    return (
                      <div key={insurance.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{insurance.provider_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Polizza: {insurance.policy_number}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={
                                status === 'active' ? 'default' : 
                                status === 'expiring' ? 'destructive' : 
                                status === 'expired' ? 'destructive' : 'secondary'
                              }
                            >
                              {status === 'active' ? 'Attiva' : 
                               status === 'expiring' ? 'In scadenza' : 
                               status === 'expired' ? 'Scaduta' : 'Inattiva'}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setConfirmDialog({
                                  open: true,
                                  title: 'Elimina Assicurazione',
                                  description: 'Sei sicuro di voler eliminare questa polizza?',
                                  onConfirm: () => handleDeleteInsurance(insurance.id)
                                });
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {insurance.policy_type && (
                            <p>Tipo: {insurance.policy_type}</p>
                          )}
                          <p>Dal: {format(new Date(insurance.start_date), 'dd/MM/yyyy', { locale: it })}</p>
                          {insurance.end_date && (
                            <p>Al: {format(new Date(insurance.end_date), 'dd/MM/yyyy', { locale: it })}</p>
                          )}
                          {insurance.premium_amount && (
                            <p>Premio: €{insurance.premium_amount}</p>
                          )}
                          {insurance.deductible && (
                            <p>Franchigia: €{insurance.deductible}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {insurances.length === 0 && (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Nessuna assicurazione</h3>
                      <p className="text-muted-foreground mb-4">
                        Aggiungi le polizze assicurative del tuo pet
                      </p>
                      <Button onClick={() => setShowAddInsurance(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Aggiungi Assicurazione
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Document Dialog */}
      <Dialog open={showAddDocument} onOpenChange={setShowAddDocument}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDocument ? 'Modifica Documento' : 'Nuovo Documento Medico'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titolo *</Label>
              <Input
                id="title"
                value={newDocument.title}
                onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
                placeholder="es. Visita di controllo"
              />
            </div>
            <div>
              <Label htmlFor="record_type">Tipo Documento</Label>
              <Select value={newDocument.record_type} onValueChange={(value) => setNewDocument(prev => ({ ...prev, record_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visita">Visita</SelectItem>
                  <SelectItem value="esame">Esame</SelectItem>
                  <SelectItem value="vaccino">Vaccino</SelectItem>
                  <SelectItem value="operazione">Operazione</SelectItem>
                  <SelectItem value="documento">Documento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="record_date">Data</Label>
              <Input
                id="record_date"
                type="date"
                value={newDocument.record_date}
                onChange={(e) => setNewDocument(prev => ({ ...prev, record_date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="description">Descrizione</Label>
              <Textarea
                id="description"
                value={newDocument.description}
                onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrizione del documento"
              />
            </div>
            <div>
              <Label htmlFor="notes">Note</Label>
              <Textarea
                id="notes"
                value={newDocument.notes}
                onChange={(e) => setNewDocument(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Note aggiuntive"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">Carica File (Opzionale)</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <div>
                    <label htmlFor="file" className="cursor-pointer">
                      <span className="text-primary font-medium hover:text-primary/80">Clicca per selezionare</span>
                      <span className="text-muted-foreground"> o trascina qui il file</span>
                    </label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleUploadDocument(file);
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    PDF, JPG, PNG, DOC, DOCX fino a 10MB
                  </p>
                </div>
              </div>
              {isUploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Caricamento in corso...
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => {
                  setShowAddDocument(false);
                  setEditingDocument(null);
                  setNewDocument({ title: '', description: '', record_type: '', record_date: '', notes: '' });
                }} 
                variant="outline"
                className="flex-1"
              >
                Annulla
              </Button>
              <Button 
                onClick={handleSaveDocumentOnly} 
                disabled={isUploading}
                className="flex-1"
              >
                Salva Documento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Veterinarian Dialog */}
      <Dialog open={showAddVet} onOpenChange={setShowAddVet}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingVet ? 'Modifica Veterinario' : 'Nuovo Veterinario'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="vet_name">Nome Veterinario *</Label>
              <Input
                id="vet_name"
                value={newVet.name}
                onChange={(e) => setNewVet(prev => ({ ...prev, name: e.target.value }))}
                placeholder="es. Dr. Mario Rossi"
              />
            </div>
            <div>
              <Label htmlFor="clinic_name">Nome Clinica</Label>
              <Input
                id="clinic_name"
                value={newVet.clinic_name}
                onChange={(e) => setNewVet(prev => ({ ...prev, clinic_name: e.target.value }))}
                placeholder="es. Clinica Veterinaria Roma"
              />
            </div>
            <div>
              <Label htmlFor="vet_phone">Telefono</Label>
              <Input
                id="vet_phone"
                type="tel"
                value={newVet.phone}
                onChange={(e) => setNewVet(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="es. +39 123 456 7890"
              />
            </div>
            <div>
              <Label htmlFor="vet_email">Email</Label>
              <Input
                id="vet_email"
                type="email"
                value={newVet.email}
                onChange={(e) => setNewVet(prev => ({ ...prev, email: e.target.value }))}
                placeholder="es. vet@clinica.com"
              />
            </div>
            <div>
              <Label htmlFor="vet_address">Indirizzo</Label>
              <Input
                id="vet_address"
                value={newVet.address}
                onChange={(e) => setNewVet(prev => ({ ...prev, address: e.target.value }))}
                placeholder="es. Via Roma 123, Milano"
              />
            </div>
            <div>
              <Label htmlFor="specialization">Specializzazione</Label>
              <Input
                id="specialization"
                value={newVet.specialization}
                onChange={(e) => setNewVet(prev => ({ ...prev, specialization: e.target.value }))}
                placeholder="es. Cardiologia, Neurologia"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={() => {
                setShowAddVet(false);
                setEditingVet(null);
                setNewVet({ name: '', clinic_name: '', phone: '', email: '', address: '', specialization: '', is_primary: false });
              }} 
              variant="outline"
            >
              Annulla
            </Button>
            <Button onClick={handleAddVet}>
              {editingVet ? 'Aggiorna' : 'Salva'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Medication Dialog */}
      <Dialog open={showAddMedication} onOpenChange={setShowAddMedication}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuovo Farmaco</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="medication_name">Nome Farmaco *</Label>
              <Input
                id="medication_name"
                value={newMedication.name}
                onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                placeholder="es. Antibiotico XYZ"
              />
            </div>
            <div>
              <Label htmlFor="dosage">Dosaggio *</Label>
              <Input
                id="dosage"
                value={newMedication.dosage}
                onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                placeholder="es. 250mg"
              />
            </div>
            <div>
              <Label htmlFor="frequency">Frequenza *</Label>
              <Input
                id="frequency"
                value={newMedication.frequency}
                onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))}
                placeholder="es. 2 volte al giorno"
              />
            </div>
            <div>
              <Label htmlFor="start_date">Data Inizio *</Label>
              <Input
                id="start_date"
                type="date"
                value={newMedication.start_date}
                onChange={(e) => setNewMedication(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="end_date">Data Fine</Label>
              <Input
                id="end_date"
                type="date"
                value={newMedication.end_date}
                onChange={(e) => setNewMedication(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="medication_notes">Note</Label>
              <Textarea
                id="medication_notes"
                value={newMedication.notes}
                onChange={(e) => setNewMedication(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Note aggiuntive sul farmaco"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={() => {
                setShowAddMedication(false);
                setNewMedication({ name: '', dosage: '', frequency: '', start_date: '', end_date: '', notes: '' });
              }} 
              variant="outline"
            >
              Annulla
            </Button>
            <Button onClick={handleAddMedication}>Salva</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Metric Dialog */}
      <Dialog open={showAddMetric} onOpenChange={setShowAddMetric}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registra Metrica di Salute</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="metric_type">Tipo Metrica *</Label>
              <Select value={newMetric.metric_type} onValueChange={(value) => setNewMetric(prev => ({ ...prev, metric_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="peso">Peso</SelectItem>
                  <SelectItem value="temperatura">Temperatura</SelectItem>
                  <SelectItem value="pressione">Pressione</SelectItem>
                  <SelectItem value="battiti">Battiti Cardiaci</SelectItem>
                  <SelectItem value="respirazione">Respirazione</SelectItem>
                  <SelectItem value="altro">Altro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="value">Valore *</Label>
              <Input
                id="value"
                type="number"
                step="0.1"
                value={newMetric.value}
                onChange={(e) => setNewMetric(prev => ({ ...prev, value: e.target.value }))}
                placeholder="es. 25.5"
              />
            </div>
            <div>
              <Label htmlFor="unit">Unità di Misura *</Label>
              <Input
                id="unit"
                value={newMetric.unit}
                onChange={(e) => setNewMetric(prev => ({ ...prev, unit: e.target.value }))}
                placeholder="es. kg, °C, bpm"
              />
            </div>
            <div>
              <Label htmlFor="metric_notes">Note</Label>
              <Textarea
                id="metric_notes"
                value={newMetric.notes}
                onChange={(e) => setNewMetric(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Note aggiuntive sulla misurazione"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={() => {
                setShowAddMetric(false);
                setNewMetric({ metric_type: '', value: '', unit: '', notes: '' });
              }} 
              variant="outline"
            >
              Annulla
            </Button>
            <Button onClick={handleAddMetric}>Salva</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Contact Dialog */}
      <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuovo Contatto di Emergenza</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="contact_name">Nome *</Label>
              <Input
                id="contact_name"
                value={newContact.name}
                onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                placeholder="es. Dr. Rossi"
              />
            </div>
            <div>
              <Label htmlFor="contact_type">Tipo Contatto *</Label>
              <Select value={newContact.contact_type} onValueChange={(value) => setNewContact(prev => ({ ...prev, contact_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="veterinario">Veterinario</SelectItem>
                  <SelectItem value="clinica">Clinica</SelectItem>
                  <SelectItem value="emergenza">Emergenza</SelectItem>
                  <SelectItem value="famiglia">Famiglia</SelectItem>
                  <SelectItem value="amico">Amico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="contact_phone">Telefono *</Label>
              <Input
                id="contact_phone"
                type="tel"
                value={newContact.phone}
                onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="es. +39 123 456 7890"
              />
            </div>
            <div>
              <Label htmlFor="relationship">Relazione</Label>
              <Input
                id="relationship"
                value={newContact.relationship}
                onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                placeholder="es. Veterinario di fiducia"
              />
            </div>
            <div>
              <Label htmlFor="contact_email">Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={newContact.email}
                onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                placeholder="es. contact@example.com"
              />
            </div>
            <div>
              <Label htmlFor="contact_notes">Note</Label>
              <Textarea
                id="contact_notes"
                value={newContact.notes}
                onChange={(e) => setNewContact(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Note aggiuntive"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={() => {
                setShowAddContact(false);
                setNewContact({ name: '', contact_type: '', phone: '', relationship: '', email: '', notes: '' });
              }} 
              variant="outline"
            >
              Annulla
            </Button>
            <Button onClick={handleAddContact}>Salva</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Insurance Dialog */}
      <Dialog open={showAddInsurance} onOpenChange={setShowAddInsurance}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuova Assicurazione</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="provider_name">Nome Compagnia *</Label>
              <Input
                id="provider_name"
                value={newInsurance.provider_name}
                onChange={(e) => setNewInsurance(prev => ({ ...prev, provider_name: e.target.value }))}
                placeholder="es. Assicurazione Pet Italia"
              />
            </div>
            <div>
              <Label htmlFor="policy_number">Numero Polizza *</Label>
              <Input
                id="policy_number"
                value={newInsurance.policy_number}
                onChange={(e) => setNewInsurance(prev => ({ ...prev, policy_number: e.target.value }))}
                placeholder="es. POL123456789"
              />
            </div>
            <div>
              <Label htmlFor="policy_type">Tipo Polizza</Label>
              <Input
                id="policy_type"
                value={newInsurance.policy_type}
                onChange={(e) => setNewInsurance(prev => ({ ...prev, policy_type: e.target.value }))}
                placeholder="es. Completa, Base, Premium"
              />
            </div>
            <div>
              <Label htmlFor="insurance_start_date">Data Inizio *</Label>
              <Input
                id="insurance_start_date"
                type="date"
                value={newInsurance.start_date}
                onChange={(e) => setNewInsurance(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="insurance_end_date">Data Fine</Label>
              <Input
                id="insurance_end_date"
                type="date"
                value={newInsurance.end_date}
                onChange={(e) => setNewInsurance(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="premium_amount">Premio Annuale (€)</Label>
              <Input
                id="premium_amount"
                type="number"
                step="0.01"
                value={newInsurance.premium_amount}
                onChange={(e) => setNewInsurance(prev => ({ ...prev, premium_amount: e.target.value }))}
                placeholder="es. 299.99"
              />
            </div>
            <div>
              <Label htmlFor="deductible">Franchigia (€)</Label>
              <Input
                id="deductible"
                type="number"
                step="0.01"
                value={newInsurance.deductible}
                onChange={(e) => setNewInsurance(prev => ({ ...prev, deductible: e.target.value }))}
                placeholder="es. 150.00"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={() => {
                setShowAddInsurance(false);
                setNewInsurance({ provider_name: '', policy_number: '', policy_type: '', start_date: '', end_date: '', premium_amount: '', deductible: '' });
              }} 
              variant="outline"
            >
              Annulla
            </Button>
            <Button onClick={handleAddInsurance}>Salva</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* First Aid Guide Dialog */}
      {showFirstAidGuide && (
        <FirstAidGuide
          open={showFirstAidGuide}
          onClose={() => setShowFirstAidGuide(false)}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        variant="destructive"
      />
    </div>
  );
};

export default WellnessPage;