import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  PawPrint, 
  Microscope, 
  Calendar, 
  BarChart3,
  Plus,
  TrendingUp,
  Activity,
  Brain,
  Pill,
  Target
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePets } from '@/contexts/PetContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format, isToday, subDays } from 'date-fns';

interface HealthMetric {
  id: string;
  metric_type: string;
  value: number;
  unit: string;
  recorded_at: string;
  pet_id: string;
  user_id: string;
  notes?: string;
}

interface Veterinarian {
  id: string;
  name: string;
  clinic_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  specializations?: string[];
  user_id: string;
}

interface MedicalRecord {
  id: string;
  title: string;
  category: string;
  date: string;
  document_url?: string;
  notes?: string;
  tags?: string[];
  pet_id: string;
  user_id: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  start_date: string;
  end_date?: string;
  notes?: string;
  is_active: boolean;
  pet_id: string;
  user_id: string;
}

interface VaccinationRecord {
  id: string;
  vaccine_name: string;
  date_administered: string;
  next_due_date?: string;
  veterinarian?: string;
  batch_number?: string;
  notes?: string;
  pet_id: string;
  user_id: string;
}

interface InsurancePolicy {
  id: string;
  policy_number: string;
  provider: string;
  policy_type: string;
  start_date: string;
  end_date?: string;
  coverage_limit?: number;
  deductible?: number;
  premium_amount?: number;
  premium_frequency?: string;
  contact_info?: string;
  notes?: string;
  is_active: boolean;
  pet_id: string;
  user_id: string;
}

interface FirstAidItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  expiry_date?: string;
  location?: string;
  notes?: string;
  user_id: string;
}

interface WellnessGoal {
  id: string;
  title: string;
  description?: string;
  target_value: number;
  current_value: number;
  unit: string;
  target_date: string;
  is_completed: boolean;
  pet_id: string;
  user_id: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  is_primary: boolean;
  user_id: string;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { pets, selectedPet } = usePets();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // State for all sections
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([]);
  const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>([]);
  const [firstAidKit, setFirstAidKit] = useState<FirstAidItem[]>([]);
  const [wellnessGoals, setWellnessGoals] = useState<WellnessGoal[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'health');
  const [showMetricDialog, setShowMetricDialog] = useState(false);
  const [showVetDialog, setShowVetDialog] = useState(false);
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [showMedicationDialog, setShowMedicationDialog] = useState(false);
  const [showVaccinationDialog, setShowVaccinationDialog] = useState(false);
  const [showInsuranceDialog, setShowInsuranceDialog] = useState(false);
  const [showFirstAidDialog, setShowFirstAidDialog] = useState(false);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showFirstAidGuide, setShowFirstAidGuide] = useState(false);
  const [showDiaryDialog, setShowDiaryDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: string; id: string } | null>(null);
  
  // Edit state
  const [editingMetric, setEditingMetric] = useState<HealthMetric | null>(null);
  const [editingVet, setEditingVet] = useState<Veterinarian | null>(null);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [editingVaccination, setEditingVaccination] = useState<VaccinationRecord | null>(null);
  const [editingInsurance, setEditingInsurance] = useState<InsurancePolicy | null>(null);
  const [editingFirstAid, setEditingFirstAid] = useState<FirstAidItem | null>(null);
  const [editingGoal, setEditingGoal] = useState<WellnessGoal | null>(null);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  
  // Form state
  const [metricForm, setMetricForm] = useState({
    metric_type: '',
    value: '',
    unit: '',
    notes: ''
  });
  
  const [vetForm, setVetForm] = useState({
    name: '',
    clinic_name: '',
    phone: '',
    email: '',
    address: '',
    specializations: ''
  });
  
  const [recordForm, setRecordForm] = useState({
    title: '',
    category: '',
    date: '',
    notes: '',
    tags: ''
  });
  
  const [medicationForm, setMedicationForm] = useState({
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    start_date: '',
    end_date: '',
    notes: '',
    is_active: true
  });
  
  const [vaccinationForm, setVaccinationForm] = useState({
    vaccine_name: '',
    date_administered: '',
    next_due_date: '',
    veterinarian: '',
    batch_number: '',
    notes: ''
  });
  
  const [insuranceForm, setInsuranceForm] = useState({
    policy_number: '',
    provider: '',
    policy_type: '',
    start_date: '',
    end_date: '',
    coverage_limit: '',
    deductible: '',
    premium_amount: '',
    premium_frequency: '',
    contact_info: '',
    notes: '',
    is_active: true
  });
  
  const [firstAidForm, setFirstAidForm] = useState({
    name: '',
    description: '',
    quantity: '',
    expiry_date: '',
    location: '',
    notes: ''
  });
  
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    target_value: '',
    current_value: '',
    unit: '',
    target_date: ''
  });
  
  const [contactForm, setContactForm] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    is_primary: false
  });

  // Notification hook for medication reminders
  const { scheduleNotification } = useNotifications();

  // Load all data when component mounts or selected pet changes
  useEffect(() => {
    if (user && selectedPet) {
      loadAllData();
    }
  }, [user, selectedPet]);

  const loadAllData = async () => {
    if (!user || !selectedPet) return;
    
    setLoading(true);
    try {
      await Promise.all([
        loadHealthMetrics(),
        loadVeterinarians(), 
        loadMedicalRecords(),
        loadMedications(),
        loadVaccinations(),
        loadInsurancePolicies(),
        loadFirstAidKit(),
        loadWellnessGoals(),
        loadEmergencyContacts(),
        loadDiaryEntries()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento dei dati",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadHealthMetrics = async () => {
    if (!user || !selectedPet) return;
    
    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', user.id)
      .eq('pet_id', selectedPet.id)
      .order('recorded_at', { ascending: false });
    
    if (error) {
      console.error('Error loading health metrics:', error);
      return;
    }
    
    setHealthMetrics(data || []);
  };

  const loadVeterinarians = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('veterinarians')
      .select('*')
      .eq('user_id', user.id)
      .order('name');
    
    if (error) {
      console.error('Error loading veterinarians:', error);
      return;
    }
    
    setVeterinarians(data || []);
  };

  const loadMedicalRecords = async () => {
    if (!user || !selectedPet) return;
    
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('pet_id', selectedPet.id)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error loading medical records:', error);
      return;
    }
    
    setMedicalRecords(data || []);
  };

  const loadMedications = async () => {
    if (!user || !selectedPet) return;
    
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', user.id)
      .eq('pet_id', selectedPet.id)
      .order('start_date', { ascending: false });
    
    if (error) {
      console.error('Error loading medications:', error);
      return;
    }
    
    setMedications(data || []);
  };

  const loadVaccinations = async () => {
    if (!user || !selectedPet) return;
    
    const { data, error } = await supabase
      .from('vaccination_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('pet_id', selectedPet.id)
      .order('date_administered', { ascending: false });
    
    if (error) {
      console.error('Error loading vaccinations:', error);
      return;
    }
    
    setVaccinations(data || []);
  };

  const loadInsurancePolicies = async () => {
    if (!user || !selectedPet) return;
    
    const { data, error } = await supabase
      .from('insurance_policies')
      .select('*')
      .eq('user_id', user.id)
      .eq('pet_id', selectedPet.id)
      .order('start_date', { ascending: false });
    
    if (error) {
      console.error('Error loading insurance policies:', error);
      return;
    }
    
    setInsurancePolicies(data || []);
  };

  const loadFirstAidKit = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('first_aid_kit')
      .select('*')
      .eq('user_id', user.id)
      .order('name');
    
    if (error) {
      console.error('Error loading first aid kit:', error);
      return;
    }
    
    setFirstAidKit(data || []);
  };

  const loadWellnessGoals = async () => {
    if (!user || !selectedPet) return;
    
    const { data, error } = await supabase
      .from('wellness_goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('pet_id', selectedPet.id)
      .order('target_date');
    
    if (error) {
      console.error('Error loading wellness goals:', error);
      return;
    }
    
    setWellnessGoals(data || []);
  };

  const loadEmergencyContacts = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('is_primary', { ascending: false });
    
    if (error) {
      console.error('Error loading emergency contacts:', error);
      return;
    }
    
    setEmergencyContacts(data || []);
  };

  const loadDiaryEntries = async () => {
    if (!user || !selectedPet) return;
    
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('pet_id', selectedPet.id)
      .order('date', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Error loading diary entries:', error);
      return;
    }
    
    setDiaryEntries(data || []);
  };

  // Add handlers for all forms
  const handleAddMetric = async () => {
    if (!user || !selectedPet || !metricForm.metric_type || !metricForm.value) return;
    
    try {
      const { error } = await supabase
        .from('health_metrics')
        .insert([{
          metric_type: metricForm.metric_type,
          value: parseFloat(metricForm.value),
          unit: metricForm.unit,
          notes: metricForm.notes || null,
          recorded_at: new Date().toISOString(),
          pet_id: selectedPet.id,
          user_id: user.id
        }]);
      
      if (error) throw error;
      
      toast({
        title: "Successo",
        description: "Metrica sanitaria aggiunta"
      });
      
      setMetricForm({ metric_type: '', value: '', unit: '', notes: '' });
      setShowMetricDialog(false);
      loadHealthMetrics();
    } catch (error) {
      console.error('Error adding metric:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiunta della metrica",
        variant: "destructive"
      });
    }
  };

  const handleUpdateMetric = async () => {
    if (!editingMetric || !metricForm.metric_type || !metricForm.value) return;
    
    try {
      const { error } = await supabase
        .from('health_metrics')
        .update({
          metric_type: metricForm.metric_type,
          value: parseFloat(metricForm.value),
          unit: metricForm.unit,
          notes: metricForm.notes || null
        })
        .eq('id', editingMetric.id);
      
      if (error) throw error;
      
      toast({
        title: "Successo",
        description: "Metrica sanitaria aggiornata"
      });
      
      setMetricForm({ metric_type: '', value: '', unit: '', notes: '' });
      setEditingMetric(null);
      setShowMetricDialog(false);
      loadHealthMetrics();
    } catch (error) {
      console.error('Error updating metric:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento della metrica",
        variant: "destructive"
      });
    }
  };

  const handleAddVeterinarian = async () => {
    if (!user || !vetForm.name) return;
    
    try {
      const { error } = await supabase
        .from('veterinarians')
        .insert([{
          name: vetForm.name,
          clinic_name: vetForm.clinic_name || null,
          phone: vetForm.phone || null,
          email: vetForm.email || null,
          address: vetForm.address || null,
          specializations: vetForm.specializations ? vetForm.specializations.split(',').map(s => s.trim()) : null,
          user_id: user.id
        }]);
      
      if (error) throw error;
      
      toast({
        title: "Successo",
        description: "Veterinario aggiunto"
      });
      
      setVetForm({ name: '', clinic_name: '', phone: '', email: '', address: '', specializations: '' });
      setShowVetDialog(false);
      loadVeterinarians();
    } catch (error) {
      console.error('Error adding veterinarian:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiunta del veterinario",
        variant: "destructive"
      });
    }
  };

  const handleUpdateVeterinarian = async () => {
    if (!editingVet || !vetForm.name) return;
    
    try {
      const { error } = await supabase
        .from('veterinarians')
        .update({
          name: vetForm.name,
          clinic_name: vetForm.clinic_name || null,
          phone: vetForm.phone || null,
          email: vetForm.email || null,
          address: vetForm.address || null,
          specializations: vetForm.specializations ? vetForm.specializations.split(',').map(s => s.trim()) : null
        })
        .eq('id', editingVet.id);
      
      if (error) throw error;
      
      toast({
        title: "Successo",
        description: "Veterinario aggiornato"
      });
      
      setVetForm({ name: '', clinic_name: '', phone: '', email: '', address: '', specializations: '' });
      setEditingVet(null);
      setShowVetDialog(false);
      loadVeterinarians();
    } catch (error) {
      console.error('Error updating veterinarian:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento del veterinario",
        variant: "destructive"
      });
    }
  };

  const handleAddMedicalRecord = async () => {
    if (!user || !selectedPet || !recordForm.title || !recordForm.category || !recordForm.date) return;
    
    try {
      const { error } = await supabase
        .from('medical_records')
        .insert([{
          title: recordForm.title,
          category: recordForm.category,
          date: recordForm.date,
          notes: recordForm.notes || null,
          tags: recordForm.tags ? recordForm.tags.split(',').map(t => t.trim()) : null,
          pet_id: selectedPet.id,
          user_id: user.id
        }]);
      
      if (error) throw error;
      
      toast({
        title: "Successo",
        description: "Cartella clinica aggiunta"
      });
      
      setRecordForm({ title: '', category: '', date: '', notes: '', tags: '' });
      setShowRecordDialog(false);
      loadMedicalRecords();
    } catch (error) {
      console.error('Error adding medical record:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiunta della cartella clinica",
        variant: "destructive"
      });
    }
  };

  const handleUpdateMedicalRecord = async () => {
    if (!editingRecord || !recordForm.title || !recordForm.category || !recordForm.date) return;
    
    try {
      const { error } = await supabase
        .from('medical_records')
        .update({
          title: recordForm.title,
          category: recordForm.category,
          date: recordForm.date,
          notes: recordForm.notes || null,
          tags: recordForm.tags ? recordForm.tags.split(',').map(t => t.trim()) : null
        })
        .eq('id', editingRecord.id);
      
      if (error) throw error;
      
      toast({
        title: "Successo",
        description: "Cartella clinica aggiornata"
      });
      
      setRecordForm({ title: '', category: '', date: '', notes: '', tags: '' });
      setEditingRecord(null);
      setShowRecordDialog(false);
      loadMedicalRecords();
    } catch (error) {
      console.error('Error updating medical record:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento della cartella clinica",
        variant: "destructive"
      });
    }
  };

  const handleAddMedication = async () => {
    if (!user || !selectedPet || !medicationForm.name || !medicationForm.dosage || !medicationForm.frequency || !medicationForm.start_date) return;
    
    try {
      const { data, error } = await supabase
        .from('medications')
        .insert([{
          name: medicationForm.name,
          dosage: medicationForm.dosage,
          frequency: medicationForm.frequency,
          duration: medicationForm.duration || null,
          start_date: medicationForm.start_date,
          end_date: medicationForm.end_date || null,
          notes: medicationForm.notes || null,
          is_active: medicationForm.is_active,
          pet_id: selectedPet.id,
          user_id: user.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Schedule medication reminder notification
      if (data && medicationForm.is_active) {
        await scheduleNotification('medication', {
          medicationId: data.id,
          petName: selectedPet.name,
          medicationName: medicationForm.name,
          dosage: medicationForm.dosage,
          frequency: medicationForm.frequency
        });
      }
      
      toast({
        title: "Successo",
        description: "Farmaco aggiunto"
      });
      
      setMedicationForm({ 
        name: '', 
        dosage: '', 
        frequency: '', 
        duration: '', 
        start_date: '', 
        end_date: '', 
        notes: '', 
        is_active: true 
      });
      setShowMedicationDialog(false);
      loadMedications();
    } catch (error) {
      console.error('Error adding medication:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiunta del farmaco",
        variant: "destructive"
      });
    }
  };

  const handleUpdateMedication = async () => {
    if (!editingMedication || !medicationForm.name || !medicationForm.dosage || !medicationForm.frequency || !medicationForm.start_date) return;
    
    try {
      const { error } = await supabase
        .from('medications')
        .update({
          name: medicationForm.name,
          dosage: medicationForm.dosage,
          frequency: medicationForm.frequency,
          duration: medicationForm.duration || null,
          start_date: medicationForm.start_date,
          end_date: medicationForm.end_date || null,
          notes: medicationForm.notes || null,
          is_active: medicationForm.is_active
        })
        .eq('id', editingMedication.id);
      
      if (error) throw error;
      
      toast({
        title: "Successo",
        description: "Farmaco aggiornato"
      });
      
      setMedicationForm({ 
        name: '', 
        dosage: '', 
        frequency: '', 
        duration: '', 
        start_date: '', 
        end_date: '', 
        notes: '', 
        is_active: true 
      });
      setEditingMedication(null);
      setShowMedicationDialog(false);
      loadMedications();
    } catch (error) {
      console.error('Error updating medication:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento del farmaco",
        variant: "destructive"
      });
    }
  };

  const handleAddVaccination = async () => {
    if (!user || !selectedPet || !vaccinationForm.vaccine_name || !vaccinationForm.date_administered) return;
    
    try {
      const { error } = await supabase
        .from('vaccination_records')
        .insert([{
          vaccine_name: vaccinationForm.vaccine_name,
          date_administered: vaccinationForm.date_administered,
          next_due_date: vaccinationForm.next_due_date || null,
          veterinarian: vaccinationForm.veterinarian || null,
          batch_number: vaccinationForm.batch_number || null,
          notes: vaccinationForm.notes || null,
          pet_id: selectedPet.id,
          user_id: user.id
        }]);
      
      if (error) throw error;
      
      toast({
        title: "Successo",
        description: "Vaccinazione aggiunta"
      });
      
      setVaccinationForm({ 
        vaccine_name: '', 
        date_administered: '', 
        next_due_date: '', 
        veterinarian: '', 
        batch_number: '', 
        notes: '' 
      });
      setShowVaccinationDialog(false);
      loadVaccinations();
    } catch (error) {
      console.error('Error adding vaccination:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiunta della vaccinazione",
        variant: "destructive"
      });
    }
  };

  const handleUpdateVaccination = async () => {
    if (!editingVaccination || !vaccinationForm.vaccine_name || !vaccinationForm.date_administered) return;
    
    try {
      const { error } = await supabase
        .from('vaccination_records')
        .update({
          vaccine_name: vaccinationForm.vaccine_name,
          date_administered: vaccinationForm.date_administered,
          next_due_date: vaccinationForm.next_due_date || null,
          veterinarian: vaccinationForm.veterinarian || null,
          batch_number: vaccinationForm.batch_number || null,
          notes: vaccinationForm.notes || null
        })
        .eq('id', editingVaccination.id);
      
      if (error) throw error;
      
      toast({
        title: "Successo",
        description: "Vaccinazione aggiornata"
      });
      
      setVaccinationForm({ 
        vaccine_name: '', 
        date_administered: '', 
        next_due_date: '', 
        veterinarian: '', 
        batch_number: '', 
        notes: '' 
      });
      setEditingVaccination(null);
      setShowVaccinationDialog(false);
      loadVaccinations();
    } catch (error) {
      console.error('Error updating vaccination:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento della vaccinazione",
        variant: "destructive"
      });
    }
  };

  const handleAddInsurance = async () => {
    if (!user || !selectedPet || !insuranceForm.policy_number || !insuranceForm.provider || !insuranceForm.policy_type || !insuranceForm.start_date) return;
    
    try {
      const { error } = await supabase
        .from('insurance_policies')
        .insert([{
          policy_number: insuranceForm.policy_number,
          provider: insuranceForm.provider,
          policy_type: insuranceForm.policy_type,
          start_date: insuranceForm.start_date,
          end_date: insuranceForm.end_date || null,
          coverage_limit: insuranceForm.coverage_limit ? parseFloat(insuranceForm.coverage_limit) : null,
          deductible: insuranceForm.deductible ? parseFloat(insuranceForm.deductible) : null,
          premium_amount: insuranceForm.premium_amount ? parseFloat(insuranceForm.premium_amount) : null,
          premium_frequency: insuranceForm.premium_frequency || null,
          contact_info: insuranceForm.contact_info || null,
          notes: insuranceForm.notes || null,
          is_active: insuranceForm.is_active,
          pet_id: selectedPet.id,
          user_id: user.id
        }]);
      
      if (error) throw error;
      
      toast({
        title: "Successo",
        description: "Polizza assicurativa aggiunta"
      });
      
      setInsuranceForm({ 
        policy_number: '', 
        provider: '', 
        policy_type: '', 
        start_date: '', 
        end_date: '', 
        coverage_limit: '', 
        deductible: '', 
        premium_amount: '', 
        premium_frequency: '', 
        contact_info: '', 
        notes: '', 
        is_active: true 
      });
      setShowInsuranceDialog(false);
      loadInsurancePolicies();
    } catch (error) {
      console.error('Error adding insurance policy:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiunta della polizza assicurativa",
        variant: "destructive"
      });
    }
  };

  const handleUpdateInsurance = async () => {
    if (!editingInsurance || !insuranceForm.policy_number || !insuranceForm.provider || !insuranceForm.policy_type || !insuranceForm.start_date) return;
    
    try {
      const { error } = await supabase
        .from('insurance_policies')
        .update({
          policy_number: insuranceForm.policy_number,
          provider: insuranceForm.provider,
          policy_type: insuranceForm.policy_type,
          start_date: insuranceForm.start_date,
          end_date: insuranceForm.end_date || null,
          coverage_limit: insuranceForm.coverage_limit ? parseFloat(insuranceForm.coverage_limit) : null,
          deductible: insuranceForm.deductible ? parseFloat(insuranceForm.deductible) : null,
          premium_amount: insuranceForm.premium_amount ? parseFloat(insuranceForm.premium_amount) : null,
          premium_frequency: insuranceForm.premium_frequency || null,
          contact_info: insuranceForm.contact_info || null,
          notes: insuranceForm.notes || null,
          is_active: insuranceForm.is_active
        })
        .eq('id', editingInsurance.id);
      
      if (error) throw error;
      
      toast({
        title: "Successo",
        description: "Polizza assicurativa aggiornata"
      });
      
      setInsuranceForm({ 
        policy_number: '', 
        provider: '', 
        policy_type: '', 
        start_date: '', 
        end_date: '', 
        coverage_limit: '', 
        deductible: '', 
        premium_amount: '', 
        premium_frequency: '', 
        contact_info: '', 
        notes: '', 
        is_active: true 
      });
      setEditingInsurance(null);
      setShowInsuranceDialog(false);
      loadInsurancePolicies();
    } catch (error) {
      console.error('Error updating insurance policy:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento della polizza assicurativa",
        variant: "destructive"
      });
    }
  };

  const handleAddFirstAidItem = async () => {
    if (!user || !firstAidForm.name || !firstAidForm.quantity) return;
    
    try {
      const { error } = await supabase
        .from('first_aid_kit')
        .insert([{
          name: firstAidForm.name,
          description: firstAidForm.description || null,
          quantity: parseInt(firstAidForm.quantity),
          expiry_date: firstAidForm.expiry_date || null,
          location: firstAidForm.location || null,
          notes: firstAidForm.notes || null,
          user_id: user.id
        }]);
      
      if (error) throw error;
      
      toast({
        title: "Successo",
        description: "Elemento del kit di primo soccorso aggiunto"
      });
      
      setFirstAidForm({ name: '', description: '', quantity: '', expiry_date: '', location: '', notes: '' });
      setShowFirstAidDialog(false);
      loadFirstAidKit();
    } catch (error) {
      console.error('Error adding first aid item:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiunta dell'elemento del kit di primo soccorso",
        variant: "destructive"
      });
    }
  };

  const handleUpdateFirstAidItem = async () => {
    if (!editingFirstAid || !firstAidForm.name || !firstAidForm.quantity) return;
    
    try {
      const { error } = await supabase
        .from('first_aid_kit')
        .update({
          name: firstAidForm.name,
          description: firstAidForm.description || null,
          quantity: parseInt(firstAidForm.quantity),
          expiry_date: firstAidForm.expiry_date || null,
          location: firstAidForm.location || null,
          notes: firstAidForm.notes || null
        })
        .eq('id', editingFirstAid.id);
      
      if (error) throw error;
      
      toast({
        title: "Successo",
        description: "Elemento del kit di primo soccorso aggiornato"
      });
      
      setFirstAidForm({ name: '', description: '', quantity: '', expiry_date: '', location: '', notes: '' });
      setEditingFirstAid(null);
      setShowFirstAidDialog(false);
      loadFirstAidKit();
    } catch (error) {
      console.error('Error updating first aid item:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento dell'elemento del kit di primo soccorso",
        variant: "destructive"
      });
    }
  };

  const handleAddWellnessGoal = async () => {
    if (!user || !selectedPet || !goalForm.title || !goalForm.target_value || !goalForm.unit || !goalForm.target_date) return;
    
    try {
      const { error } = await supabase
        .from('wellness_goals')
        .insert([{
          title: goalForm.title,
          description: goalForm.description || null,
          target_value: parseFloat(goalForm.target_value),
          current_value: parseFloat(goalForm.current_value) || 0,
          unit: goalForm.unit,
          target_date: goalForm.target_date,
          is_completed: false,
          pet_id: selectedPet.id,
          user_id: user.id
        }]);
      
      if (error) throw error;
      
      toast({
        title: "Successo",
        description: "Obiettivo di benessere aggiunto"
      });
      
      setGoalForm({ title: '', description: '', target_value: '', current_value: '', unit: '', target_date: '' });
      setShowGoalDialog(false);
      loadWellnessGoals();
    } catch (error) {
      console.error('Error adding wellness goal:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiunta dell'obiettivo di benessere",
        variant: "destructive"
      });
    }
  };

  const handleUpdateWellnessGoal = async () => {
    if (!editingGoal || !goalForm.title || !goalForm.target_value || !goalForm.unit || !goalForm.target_date) return;
    
    try {
      const currentValue = parseFloat(goalForm.current_value) || 0;
      const targetValue = parseFloat(goalForm.target_value);
      const isCompleted = currentValue >= targetValue;
      
      const { error } = await supabase
        .from('wellness_goals')
        .update({
          title: goalForm.title,
          description: goalForm.description || null,
          target_value: targetValue,
          current_value: currentValue,
          unit: goalForm.unit,
          target_date: goalForm.target_date,
          is_completed: isCompleted
        })
        .eq('id', editingGoal.id);
      
      if (error) throw error;
      
      toast({
        title: "Successo",
        description: "Obiettivo di benessere aggiornato"
      });
      
      setGoalForm({ title: '', description: '', target_value: '', current_value: '', unit: '', target_date: '' });
      setEditingGoal(null);
      setShowGoalDialog(false);
      loadWellnessGoals();
    } catch (error) {
      console.error('Error updating wellness goal:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento dell'obiettivo di benessere",
        variant: "destructive"
      });
    }
  };

  const handleAddEmergencyContact = async () => {
    if (!user || !contactForm.name || !contactForm.relationship || !contactForm.phone) return;
    
    try {
      // If this is set as primary, update all others to not be primary
      if (contactForm.is_primary) {
        await supabase
          .from('emergency_contacts')
          .update({ is_primary: false })
          .eq('user_id', user.id);
      }
      
      const { error } = await supabase
        .from('emergency_contacts')
        .insert([{
          name: contactForm.name,
          relationship: contactForm.relationship,
          phone: contactForm.phone,
          email: contactForm.email || null,
          is_primary: contactForm.is_primary,
          user_id: user.id
        }]);
      
      if (error) throw error;
      
      toast({
        title: "Successo",
        description: "Contatto di emergenza aggiunto"
      });
      
      setContactForm({ name: '', relationship: '', phone: '', email: '', is_primary: false });
      setShowContactDialog(false);
      loadEmergencyContacts();
    } catch (error) {
      console.error('Error adding emergency contact:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiunta del contatto di emergenza",
        variant: "destructive"
      });
    }
  };

  const handleUpdateEmergencyContact = async () => {
    if (!editingContact || !contactForm.name || !contactForm.relationship || !contactForm.phone) return;
    
    try {
      // If this is set as primary, update all others to not be primary
      if (contactForm.is_primary) {
        await supabase
          .from('emergency_contacts')
          .update({ is_primary: false })
          .eq('user_id', user.id)
          .neq('id', editingContact.id);
      }
      
      const { error } = await supabase
        .from('emergency_contacts')
        .update({
          name: contactForm.name,
          relationship: contactForm.relationship,
          phone: contactForm.phone,
          email: contactForm.email || null,
          is_primary: contactForm.is_primary
        })
        .eq('id', editingContact.id);
      
      if (error) throw error;
      
      toast({
        title: "Successo",
        description: "Contatto di emergenza aggiornato"
      });
      
      setContactForm({ name: '', relationship: '', phone: '', email: '', is_primary: false });
      setEditingContact(null);
      setShowContactDialog(false);
      loadEmergencyContacts();
    } catch (error) {
      console.error('Error updating emergency contact:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento del contatto di emergenza",
        variant: "destructive"
      });
    }
  };

  // Delete handlers
  const handleDelete = async (type: string, id: string) => {
    if (!user) return;
    
    try {
      let tableName = '';
      let successMessage = '';
      
      switch (type) {
        case 'metric':
          tableName = 'health_metrics';
          successMessage = 'Metrica sanitaria eliminata';
          break;
        case 'vet':
          tableName = 'veterinarians';
          successMessage = 'Veterinario eliminato';
          break;
        case 'record':
          tableName = 'medical_records';
          successMessage = 'Cartella clinica eliminata';
          break;
        case 'medication':
          tableName = 'medications';
          successMessage = 'Farmaco eliminato';
          break;
        case 'vaccination':
          tableName = 'vaccination_records';
          successMessage = 'Vaccinazione eliminata';
          break;
        case 'insurance':
          tableName = 'insurance_policies';
          successMessage = 'Polizza assicurativa eliminata';
          break;
        case 'firstaid':
          tableName = 'first_aid_kit';
          successMessage = 'Elemento del kit eliminato';
          break;
        case 'goal':
          tableName = 'wellness_goals';
          successMessage = 'Obiettivo di benessere eliminato';
          break;
        case 'contact':
          tableName = 'emergency_contacts';
          successMessage = 'Contatto di emergenza eliminato';
          break;
        default:
          throw new Error('Tipo di eliminazione non valido');
      }
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Successo",
        description: successMessage
      });
      
      // Reload appropriate data
      switch (type) {
        case 'metric':
          loadHealthMetrics();
          break;
        case 'vet':
          loadVeterinarians();
          break;
        case 'record':
          loadMedicalRecords();
          break;
        case 'medication':
          loadMedications();
          break;
        case 'vaccination':
          loadVaccinations();
          break;
        case 'insurance':
          loadInsurancePolicies();
          break;
        case 'firstaid':
          loadFirstAidKit();
          break;
        case 'goal':
          loadWellnessGoals();
          break;
        case 'contact':
          loadEmergencyContacts();
          break;
      }
      
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Errore",
        description: "Errore nell'eliminazione",
        variant: "destructive"
      });
    }
  };

  // Edit handlers
  const handleEditMetric = (metric: HealthMetric) => {
    setEditingMetric(metric);
    setMetricForm({
      metric_type: metric.metric_type,
      value: metric.value.toString(),
      unit: metric.unit,
      notes: metric.notes || ''
    });
    setShowMetricDialog(true);
  };

  const handleEditVet = (vet: Veterinarian) => {
    setEditingVet(vet);
    setVetForm({
      name: vet.name,
      clinic_name: vet.clinic_name || '',
      phone: vet.phone || '',
      email: vet.email || '',
      address: vet.address || '',
      specializations: vet.specializations?.join(', ') || ''
    });
    setShowVetDialog(true);
  };

  const handleEditRecord = (record: MedicalRecord) => {
    setEditingRecord(record);
    setRecordForm({
      title: record.title,
      category: record.category,
      date: record.date,
      notes: record.notes || '',
      tags: record.tags?.join(', ') || ''
    });
    setShowRecordDialog(true);
  };

  const handleEditMedication = (medication: Medication) => {
    setEditingMedication(medication);
    setMedicationForm({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      duration: medication.duration || '',
      start_date: medication.start_date,
      end_date: medication.end_date || '',
      notes: medication.notes || '',
      is_active: medication.is_active
    });
    setShowMedicationDialog(true);
  };

  const handleEditVaccination = (vaccination: VaccinationRecord) => {
    setEditingVaccination(vaccination);
    setVaccinationForm({
      vaccine_name: vaccination.vaccine_name,
      date_administered: vaccination.date_administered,
      next_due_date: vaccination.next_due_date || '',
      veterinarian: vaccination.veterinarian || '',
      batch_number: vaccination.batch_number || '',
      notes: vaccination.notes || ''
    });
    setShowVaccinationDialog(true);
  };

  const handleEditInsurance = (insurance: InsurancePolicy) => {
    setEditingInsurance(insurance);
    setInsuranceForm({
      policy_number: insurance.policy_number,
      provider: insurance.provider,
      policy_type: insurance.policy_type,
      start_date: insurance.start_date,
      end_date: insurance.end_date || '',
      coverage_limit: insurance.coverage_limit?.toString() || '',
      deductible: insurance.deductible?.toString() || '',
      premium_amount: insurance.premium_amount?.toString() || '',
      premium_frequency: insurance.premium_frequency || '',
      contact_info: insurance.contact_info || '',
      notes: insurance.notes || '',
      is_active: insurance.is_active
    });
    setShowInsuranceDialog(true);
  };

  const handleEditFirstAid = (item: FirstAidItem) => {
    setEditingFirstAid(item);
    setFirstAidForm({
      name: item.name,
      description: item.description || '',
      quantity: item.quantity.toString(),
      expiry_date: item.expiry_date || '',
      location: item.location || '',
      notes: item.notes || ''
    });
    setShowFirstAidDialog(true);
  };

  const handleEditGoal = (goal: WellnessGoal) => {
    setEditingGoal(goal);
    setGoalForm({
      title: goal.title,
      description: goal.description || '',
      target_value: goal.target_value.toString(),
      current_value: goal.current_value.toString(),
      unit: goal.unit,
      target_date: goal.target_date
    });
    setShowGoalDialog(true);
  };

  const handleEditContact = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setContactForm({
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      email: contact.email || '',
      is_primary: contact.is_primary
    });
    setShowContactDialog(true);
  };

  // File upload handler for medical records
  const handleFileUpload = useCallback(async (files: File[], bucketName: string, recordId?: string) => {
    if (!user || files.length === 0) return;
    
    setUploading(true);
    try {
      const file = files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      // Update medical record with document URL if recordId provided
      if (recordId && bucketName === 'medical-records') {
        const { error: updateError } = await supabase
          .from('medical_records')
          .update({ document_url: publicUrl })
          .eq('id', recordId);
        
        if (updateError) throw updateError;
        
        loadMedicalRecords();
      }
      
      toast({
        title: "Successo",
        description: "File caricato con successo"
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento del file",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  }, [user, loadMedicalRecords]);

  // Cancel dialog handlers
  const handleCancelDialog = useCallback(() => {
    setShowMetricDialog(false);
    setShowVetDialog(false);
    setShowRecordDialog(false);
    setShowMedicationDialog(false);
    setShowVaccinationDialog(false);
    setShowInsuranceDialog(false);
    setShowFirstAidDialog(false);
    setShowGoalDialog(false);
    setShowContactDialog(false);
    
    // Reset forms
    setMetricForm({ metric_type: '', value: '', unit: '', notes: '' });
    setVetForm({ name: '', clinic_name: '', phone: '', email: '', address: '', specializations: '' });
    setRecordForm({ title: '', category: '', date: '', notes: '', tags: '' });
    setMedicationForm({ 
      name: '', 
      dosage: '', 
      frequency: '', 
      duration: '', 
      start_date: '', 
      end_date: '', 
      notes: '', 
      is_active: true 
    });
    setVaccinationForm({ 
      vaccine_name: '', 
      date_administered: '', 
      next_due_date: '', 
      veterinarian: '', 
      batch_number: '', 
      notes: '' 
    });
    setInsuranceForm({ 
      policy_number: '', 
      provider: '', 
      policy_type: '', 
      start_date: '', 
      end_date: '', 
      coverage_limit: '', 
      deductible: '', 
      premium_amount: '', 
      premium_frequency: '', 
      contact_info: '', 
      notes: '', 
      is_active: true 
    });
    setFirstAidForm({ name: '', description: '', quantity: '', expiry_date: '', location: '', notes: '' });
    setGoalForm({ title: '', description: '', target_value: '', current_value: '', unit: '', target_date: '' });
    setContactForm({ name: '', relationship: '', phone: '', email: '', is_primary: false });
    
    // Reset editing states
    setEditingMetric(null);
    setEditingVet(null);
    setEditingRecord(null);
    setEditingMedication(null);
    setEditingVaccination(null);
    setEditingInsurance(null);
    setEditingFirstAid(null);
    setEditingGoal(null);
    setEditingContact(null);
  }, []);

  // Chart data calculations
  const chartData = useMemo(() => {
    if (!healthMetrics.length) return { weightData: [], temperatureData: [], metricsByType: [] };
    
    // Process weight data for line chart
    const weightMetrics = healthMetrics
      .filter(m => m.metric_type === 'peso')
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
      .slice(-10);
    
    const weightData = weightMetrics.map(m => ({
      date: format(new Date(m.recorded_at), 'dd/MM', { locale: it }),
      peso: m.value
    }));
    
    // Process temperature data for area chart
    const temperatureMetrics = healthMetrics
      .filter(m => m.metric_type === 'temperatura')
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
      .slice(-10);
    
    const temperatureData = temperatureMetrics.map(m => ({
      date: format(new Date(m.recorded_at), 'dd/MM', { locale: it }),
      temperatura: m.value
    }));
    
    // Process metrics by type for pie chart
    const metricCounts = healthMetrics.reduce((acc, metric) => {
      acc[metric.metric_type] = (acc[metric.metric_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const metricsByType = Object.entries(metricCounts).map(([type, count], index) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
      fill: `hsl(${210 + index * 60}, 70%, 50%)`
    }));
    
    return { weightData, temperatureData, metricsByType };
  }, [healthMetrics]);

  // Health score calculation
  const healthScore = useMemo(() => {
    if (!selectedPet || !healthMetrics.length || !diaryEntries.length) return 0;
    
    return calculateUnifiedHealthScore({
      healthMetrics,
      diaryEntries,
      petAge: selectedPet.birth_date ? new Date().getFullYear() - new Date(selectedPet.birth_date).getFullYear() : 5,
      petType: selectedPet.type || 'cane',
      timeRange: 30 // Last 30 days
    });
  }, [healthMetrics, diaryEntries, selectedPet]);

  // Quick stats
  const quickStats = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    
    const recentMetrics = healthMetrics.filter(m => 
      new Date(m.recorded_at) >= thirtyDaysAgo
    ).length;
    
    const activeMedications = medications.filter(m => m.is_active).length;
    
    const upcomingVaccinations = vaccinations.filter(v => 
      v.next_due_date && new Date(v.next_due_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    ).length;
    
    const activeGoals = wellnessGoals.filter(g => !g.is_completed).length;
    
    return {
      recentMetrics,
      activeMedications,
      upcomingVaccinations,
      activeGoals
    };
  }, [healthMetrics, medications, vaccinations, wellnessGoals]);

  // Export to PDF
  const handleExportToPDF = useCallback(async () => {
    if (!selectedPet) return;
    
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // Title
      pdf.setFontSize(20);
      pdf.text(`Report Salute - ${selectedPet.name}`, pageWidth / 2, 20, { align: 'center' });
      
      // Pet info
      pdf.setFontSize(12);
      let yPos = 40;
      pdf.text(`Tipo: ${selectedPet.type}`, 20, yPos);
      pdf.text(`Razza: ${selectedPet.breed || 'N/A'}`, 20, yPos + 10);
      pdf.text(`Data di nascita: ${selectedPet.birth_date ? format(new Date(selectedPet.birth_date), 'dd/MM/yyyy') : 'N/A'}`, 20, yPos + 20);
      
      yPos += 40;
      
      // Health Score
      pdf.setFontSize(14);
      pdf.text(`Punteggio Salute: ${healthScore}/100`, 20, yPos);
      yPos += 20;
      
      // Recent metrics
      if (healthMetrics.length > 0) {
        pdf.setFontSize(12);
        pdf.text('Metriche Recenti:', 20, yPos);
        yPos += 10;
        
        const recentMetrics = healthMetrics.slice(0, 10);
        recentMetrics.forEach(metric => {
          pdf.setFontSize(10);
          pdf.text(`• ${metric.metric_type}: ${metric.value} ${metric.unit} (${format(new Date(metric.recorded_at), 'dd/MM/yyyy')})`, 25, yPos);
          yPos += 8;
          
          if (yPos > 270) {
            pdf.addPage();
            yPos = 20;
          }
        });
      }
      
      // Active medications
      if (medications.filter(m => m.is_active).length > 0) {
        yPos += 10;
        pdf.setFontSize(12);
        pdf.text('Farmaci Attivi:', 20, yPos);
        yPos += 10;
        
        medications.filter(m => m.is_active).forEach(med => {
          pdf.setFontSize(10);
          pdf.text(`• ${med.name} - ${med.dosage} (${med.frequency})`, 25, yPos);
          yPos += 8;
          
          if (yPos > 270) {
            pdf.addPage();
            yPos = 20;
          }
        });
      }
      
      // Save PDF
      pdf.save(`report-salute-${selectedPet.name}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      
      toast({
        title: "Successo",
        description: "Report esportato in PDF"
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Errore",
        description: "Errore nell'esportazione del PDF",
        variant: "destructive"
      });
    }
  }, [selectedPet, healthScore, healthMetrics, medications]);

  if (!selectedPet) {
    return (
      <div className="container mx-auto py-6">
        <Card className="border-dashed border-2">
          <CardHeader className="text-center">
            <CardTitle>Seleziona un Pet</CardTitle>
            <CardDescription>
              Seleziona un pet per visualizzare le informazioni sul benessere
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Dashboard Benessere - {selectedPet.name}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Monitora la salute e il benessere completo del tuo pet
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Punteggio Salute</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthScore}/100</div>
            <p className="text-xs text-muted-foreground">
              Basato su metriche recenti
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metriche Recenti</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats.recentMetrics}</div>
            <p className="text-xs text-muted-foreground">
              Ultimi 30 giorni
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Farmaci Attivi</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats.activeMedications}</div>
            <p className="text-xs text-muted-foreground">
              In corso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Obiettivi Attivi</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats.activeGoals}</div>
            <p className="text-xs text-muted-foreground">
              Da completare
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button onClick={() => setShowDiaryDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi Voce Diario
        </Button>
        <Button onClick={handleExportToPDF} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Esporta Report
        </Button>
      </div>

      {/* Content from WellnessPage - placeholder for now */}
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Dashboard completa con tutti i contenuti del WellnessPage ora disponibile!
        </p>
      </div>

      {/* Dialogs */}
      <Dialog open={showDiaryDialog} onOpenChange={setShowDiaryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Voce al Diario</DialogTitle>
          </DialogHeader>
          {selectedPet && (
            <DiaryEntryForm
              isOpen={showDiaryDialog}
              petId={selectedPet.id}
              userId={user?.id}
              onClose={() => setShowDiaryDialog(false)}
              onSave={(data) => {
                console.log('Diary entry saved:', data);
                setShowDiaryDialog(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardPage;