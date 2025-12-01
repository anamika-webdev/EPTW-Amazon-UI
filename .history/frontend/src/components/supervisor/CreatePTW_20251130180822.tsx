// frontend/src/components/supervisor/CreatePTW.tsx
// COMPLETE 7-STEP PTW FORM WITH ALL FEATURES
// Version: FINAL - Includes SWMS, Worker Management, Digital Signatures

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { DigitalSignature } from '../shared/DigitalSignature';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Check, 
  AlertTriangle,
  X,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { 
  sitesAPI, 
  usersAPI, 
  masterDataAPI, 
  permitsAPI,
  vendorsAPI 
} from '../../services/api';
import type {
  Site,
  User,
  MasterHazard,
  MasterPPE,
  MasterChecklistQuestion,
  PermitType,
  WorkerRole,
  ChecklistResponse,
  Vendor
} from '../../types';

interface CreatePTWProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function CreatePTW({ onBack, onSuccess }: CreatePTWProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Master data
  const [sites, setSites] = useState<Site[]>([]);
  const [hazards, setHazards] = useState<MasterHazard[]>([]);
  const [ppeItems, setPPEItems] = useState<MasterPPE[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [checklistQuestions, setChecklistQuestions] = useState<MasterChecklistQuestion[]>([]);

  // Approvers
  const [areaManagers, setAreaManagers] = useState<User[]>([]);
  const [safetyOfficers, setSafetyOfficers] = useState<User[]>([]);
  const [siteLeaders, setSiteLeaders] = useState<User[]>([]);

  // New workers management
  const [newWorkers, setNewWorkers] = useState<Array<{ 
    id: string;
    name: string; 
    phone: string; 
    email: string; 
    companyName: string;
    role: WorkerRole;
    badgeId: string;
  }>>([]);

  const [showAddWorker, setShowAddWorker] = useState(false);
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);
  const [workerForm, setWorkerForm] = useState({
    name: '',
    role: 'Worker' as WorkerRole,
    companyName: '',
    badgeId: '',
    phone: '',
    email: ''
  });

  // Signature modal
  const [showSignature, setShowSignature] = useState<'areaManager' | 'safetyOfficer' | 'siteLeader' | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    categories: [] as PermitType[],
    site_id: 0,
    location: '',
    issueDepartment: '',
    workDescription: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    vendor_id: 0,
    permitInitiator: '',
    permitInitiatorContact: '',
    
    // Step 2: Receiver & Workers
    issuedToName: '',
    issuedToContact: '',
    selectedWorkers: [] as number[],
    
    // Step 3: Hazards & Safety
    selectedHazards: [] as number[],
    selectedPPE: [] as number[],
    otherHazards: '',
    controlMeasures: '',
    
    // Step 4: SWMS
    swmsFile: null as File | null,
    swmsText: '',
    swmsMode: 'file' as 'file' | 'text',
    
    // Step 5: Safety Checklist
    checklistResponses: {} as Record<number, ChecklistResponse>,
    checklistRemarks: {} as Record<number, string>,
    checklistTextResponses: {} as Record<number, string>,
    
    // Step 6: Approvers & Signatures
    areaManagerId: 0,
    safetyOfficerId: 0,
    siteLeaderId: 0,
    areaManagerSignature: '',
    safetyOfficerSignature: '',
    siteLeaderSignature: '',
    
    // Step 7: Review & Submit
    declaration: false,
  });

  const totalSteps = 7;
  const progress = (currentStep / totalSteps) * 100;

  const highRiskPermits: PermitType[] = ['Hot_Work', 'Confined_Space', 'Height'];
  const requiresSiteLeaderApproval = formData.categories.includes('Confined_Space') || formData.categories.includes('Height');

  // Load initial data
  useEffect(() => {
    loadAllMasterData();
    loadPermitInitiator();
    loadAllChecklistQuestions();
  }, []);

  const loadPermitInitiator = () => {
    try {
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (userStr) {
        const currentUser = JSON.parse(userStr);
        setFormData(prev => ({
          ...prev,
          permitInitiator: currentUser.full_name || currentUser.name || '',
          permitInitiatorContact: currentUser.email || ''
        }));
      }
    } catch (error) {
      console.error('Error loading permit initiator:', error);
    }
  };

  const loadAllMasterData = async () => {
    setIsLoading(true);
    setLoadError(null);
    
    try {
      console.log('🔄 Loading all master data...');

      const results = await Promise.allSettled([
        sitesAPI.getAll(),
        masterDataAPI.getHazards(),
        masterDataAPI.getPPE(),
        usersAPI.getWorkers(),
        vendorsAPI.getAll(),
        usersAPI.getApprovers('Approver_AreaManager'),
        usersAPI.getApprovers('Approver_Safety'),
        usersAPI.getApprovers('Approver_SiteLeader')
      ]);

      if (results[0].status === 'fulfilled' && results[0].value.success) {
        setSites(results[0].value.data || []);
        console.log('✅ Sites loaded:', results[0].value.data?.length);
      }
      if (results[1].status === 'fulfilled' && results[1].value.success) {
        setHazards(results[1].value.data || []);
        console.log('✅ Hazards loaded:', results[1].value.data?.length);
      }
      if (results[2].status === 'fulfilled' && results[2].value.success) {
        setPPEItems(results[2].value.data || []);
        console.log('✅ PPE loaded:', results[2].value.data?.length);
      }
      if (results[3].status === 'fulfilled' && results[3].value.success) {
        setWorkers(results[3].value.data || []);
        console.log('✅ Workers loaded:', results[3].value.data?.length);
      }
      if (results[4].status === 'fulfilled' && results[4].value.success) {
        setVendors(results[4].value.data || []);
        console.log('✅ Vendors loaded:', results[4].value.data?.length);
      }
      if (results[5].status === 'fulfilled' && results[5].value.success) {
        setAreaManagers(results[5].value.data || []);
        console.log('✅ Area Managers loaded:', results[5].value.data?.length);
      }
      if (results[6].status === 'fulfilled' && results[6].value.success) {
        setSafetyOfficers(results[6].value.data || []);
        console.log('✅ Safety Officers loaded:', results[6].value.data?.length);
      }
      if (results[7].status === 'fulfilled' && results[7].value.success) {
        setSiteLeaders(results[7].value.data || []);
        console.log('✅ Site Leaders loaded:', results[7].value.data?.length);
      }

    } catch (error: any) {
      console.error('❌ Error loading data:', error);
      setLoadError('Failed to load form data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllChecklistQuestions = async () => {
    try {
      const response = await masterDataAPI.getChecklistQuestions();
      if (response.success && response.data) {
        setChecklistQuestions(response.data);
        console.log('✅ Checklist questions loaded:', response.data.length);
      }
    } catch (error) {
      console.error('❌ Error loading checklist:', error);
    }
  };

  // Worker management functions
  const handleAddWorker = () => {
    if (!workerForm.name.trim()) {
      alert('Please enter worker name');
      return;
    }

    if (editingWorkerId) {
      setNewWorkers(prev => prev.map(w => 
        w.id === editingWorkerId ? { ...workerForm, id: editingWorkerId } : w
      ));
      setEditingWorkerId(null);
    } else {
      const newWorker = { 
        id: Date.now().toString(), 
        ...workerForm 
      };
      setNewWorkers(prev => [...prev, newWorker]);
    }

    setWorkerForm({
      name: '',
      role: 'Worker',
      companyName: '',
      badgeId: '',
      phone: '',
      email: ''
    });
    setShowAddWorker(false);
  };

  const handleEditWorker = (workerId: string) => {
    const worker = newWorkers.find(w => w.id === workerId);
    if (worker) {
      setWorkerForm({
        name: worker.name,
        role: worker.role,
        companyName: worker.companyName,
        badgeId: worker.badgeId,
        phone: worker.phone,
        email: worker.email
      });
      setEditingWorkerId(workerId);
      setShowAddWorker(true);
    }
  };

  const handleDeleteWorker = (workerId: string) => {
    if (confirm('Are you sure you want to remove this worker?')) {
      setNewWorkers(prev => prev.filter(w => w.id !== workerId));
    }
  };

  const cancelWorkerForm = () => {
    setShowAddWorker(false);
    setEditingWorkerId(null);
    setWorkerForm({
      name: '',
      role: 'Worker',
      companyName: '',
      badgeId: '',
      phone: '',
      email: ''
    });
  };

  // SWMS file handling
  const handleSWMSFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file only');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setFormData(prev => ({ ...prev, swmsFile: file }));
  };

  const removeSWMSFile = () => {
    setFormData(prev => ({ ...prev, swmsFile: null }));
  };

  // Signature handling
  const handleSaveSignature = (signatureData: string) => {
    if (showSignature === 'areaManager') {
      setFormData(prev => ({ ...prev, areaManagerSignature: signatureData }));
    } else if (showSignature === 'safetyOfficer') {
      setFormData(prev => ({ ...prev, safetyOfficerSignature: signatureData }));
    } else if (showSignature === 'siteLeader') {
      setFormData(prev => ({ ...prev, siteLeaderSignature: signatureData }));
    }
    setShowSignature(null);
  };

  // Navigation
  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step <= currentStep || step === currentStep + 1) {
      setCurrentStep(step);
    }
  };

  // Validation
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (formData.categories.length === 0) {
          alert('Please select at least one permit category');
          return false;
        }
        if (!formData.site_id) {
          alert('Please select a site');
          return false;
        }
        if (!formData.location.trim()) {
          alert('Please enter work location');
          return false;
        }
        if (!formData.workDescription.trim()) {
          alert('Please enter work description');
          return false;
        }
        if (!formData.startDate || !formData.startTime) {
          alert('Please enter start date and time');
          return false;
        }
        if (!formData.endDate || !formData.endTime) {
          alert('Please enter end date and time');
          return false;
        }
        return true;

      case 2:
        if (!formData.issuedToName.trim()) {
          alert('Please enter receiver name');
          return false;
        }
        if (formData.selectedWorkers.length === 0 && newWorkers.length === 0) {
          alert('Please select at least one worker or add a new worker');
          return false;
        }
        return true;

      case 3:
        if (formData.selectedHazards.length === 0) {
          alert('Please select at least one hazard');
          return false;
        }
        if (formData.selectedPPE.length === 0) {
          alert('Please select at least one PPE item');
          return false;
        }
        if (!formData.controlMeasures.trim()) {
          alert('Please enter control measures');
          return false;
        }
        return true;

      case 4:
        if (!formData.swmsFile && !formData.swmsText.trim()) {
          alert('Please upload a SWMS file or enter SWMS text');
          return false;
        }
        return true;

      case 5:
        const relevantQuestions = checklistQuestions.filter(q => 
          formData.categories.includes(q.permit_type)
        );
        
        const mandatoryQuestions = relevantQuestions.filter(q => q.is_mandatory);
        
        for (const question of mandatoryQuestions) {
          if (question.response_type === 'radio') {
            if (!formData.checklistResponses[question.id]) {
              alert(`Please answer: ${question.question_text}`);
              return false;
            }
          } else if (question.response_type === 'text') {
            if (!formData.checklistTextResponses[question.id]?.trim()) {
              alert(`Please provide: ${question.question_text}`);
              return false;
            }
          }
        }
        return true;

      case 6:
        if (!formData.areaManagerId) {
          alert('Please select an Area Manager');
          return false;
        }
        if (!formData.safetyOfficerId) {
          alert('Please select a Safety Officer');
          return false;
        }
        if (requiresSiteLeaderApproval && !formData.siteLeaderId) {
          alert('Site Leader approval is required for this permit type');
          return false;
        }
        return true;

      case 7:
        if (!formData.declaration) {
          alert('Please accept the declaration');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  // Submit
  const handleSubmit = async () => {
    if (!formData.declaration) {
      alert('Please accept the declaration to submit');
      return;
    }

    if (!validateStep(7)) return;

    setIsSubmitting(true);
    try {
      // Combine selected workers and new workers
      const teamMembers = [
        ...formData.selectedWorkers.map(workerId => {
          const worker = workers.find(w => w.id === workerId);
          return {
            worker_name: worker?.full_name || '',
            worker_role: 'Worker' as WorkerRole,
            badge_id: worker?.login_id || '',
          };
        }),
        ...newWorkers.map(worker => ({
          worker_name: worker.name,
          worker_role: worker.role,
          company_name: worker.companyName,
          badge_id: worker.badgeId,
          phone: worker.phone,
          email: worker.email,
        })),
      ];

      // Prepare checklist responses
      const checklistResponses = Object.entries(formData.checklistResponses)
        .map(([questionId, response]) => ({
          question_id: parseInt(questionId),
          response,
          remarks: formData.checklistRemarks[parseInt(questionId)] || undefined,
        }));

      // Add text responses
      Object.entries(formData.checklistTextResponses).forEach(([questionId, textValue]) => {
        if (textValue && textValue.trim()) {
          checklistResponses.push({
            question_id: parseInt(questionId),
            response: 'Yes' as ChecklistResponse,
            remarks: textValue,
          });
        }
      });

      // Prepare approvers
      const approvers = [
        { role: 'Area_Manager', user_id: formData.areaManagerId },
        { role: 'Safety_Officer', user_id: formData.safetyOfficerId }
      ];

      if (requiresSiteLeaderApproval && formData.siteLeaderId) {
        approvers.push({ role: 'Site_Leader', user_id: formData.siteLeaderId });
      }

      // Prepare permit data
      const permitData = {
        site_id: formData.site_id,
        permit_type: formData.categories[0] || 'General',
        permit_types: formData.categories,
        work_location: formData.location,
        work_description: formData.workDescription,
        start_time: `${formData.startDate}T${formData.startTime}:00`,
        end_time: `${formData.endDate}T${formData.endTime}:00`,
        receiver_name: formData.issuedToName,
        receiver_contact: formData.issuedToContact,
        vendor_id: formData.vendor_id || undefined,
        hazard_ids: formData.selectedHazards,
        ppe_ids: formData.selectedPPE,
        team_members: teamMembers,
        control_measures: formData.controlMeasures,
        other_hazards: formData.otherHazards,
        checklist_responses: checklistResponses,
        approvers: approvers,
        issue_department: formData.issueDepartment,
        swms_text: formData.swmsText || undefined,
      };

      console.log('📤 Submitting permit:', permitData);

      const response = await permitsAPI.create(permitData);

      if (response.success) {
        const permitId = response.data?.permit_number || response.data?.permit_serial || response.data?.id;
        alert(`✅ PTW Created Successfully!\n\nPermit Number: ${permitId}`);
        onSuccess();
      } else {
        throw new Error(response.message || 'Failed to create permit');
      }
    } catch (error: any) {
      console.error('❌ Submit error:', error);
      alert('Error creating PTW: ' + (error.message || 'Unknown error occurred'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions
  const toggleCategory = (category: PermitType) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const toggleWorker = (workerId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedWorkers: prev.selectedWorkers.includes(workerId)
        ? prev.selectedWorkers.filter(id => id !== workerId)
        : [...prev.selectedWorkers, workerId]
    }));
  };

  const toggleHazard = (hazardId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedHazards: prev.selectedHazards.includes(hazardId)
        ? prev.selectedHazards.filter(id => id !== hazardId)
        : [...prev.selectedHazards, hazardId]
    }));
  };

  const togglePPE = (ppeId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedPPE: prev.selectedPPE.includes(ppeId)
        ? prev.selectedPPE.filter(id => id !== ppeId)
        : [...prev.selectedPPE, ppeId]
    }));
  };

  const getCategoryBadgeColor = (category: PermitType) => {
    const colors: Record<PermitType, string> = {
      'General': 'bg-blue-100 text-blue-800 border-blue-300',
      'Height': 'bg-purple-100 text-purple-800 border-purple-300',
      'Hot_Work': 'bg-red-100 text-red-800 border-red-300',
      'Electrical': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Confined_Space': 'bg-orange-100 text-orange-800 border-orange-300',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getSelectedSiteName = () => {
    const site = sites.find(s => s.id === formData.site_id);
    return site?.site_name || 'Not selected';
  };

  const getRelevantChecklistQuestions = () => {
    return checklistQuestions.filter(q => 
      formData.categories.includes(q.permit_type)
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-t-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          <p className="text-lg font-medium text-slate-700">Loading form data...</p>
          <p className="text-sm text-slate-500">Please wait</p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="w-5 h-5" />
          <AlertDescription>
            <p className="mb-2 font-semibold">Failed to load form data</p>
            <p className="mb-4 text-sm">{loadError}</p>
            <div className="flex gap-2">
              <Button onClick={loadAllMasterData} size="sm">
                Retry
              </Button>
              <Button onClick={onBack} variant="outline" size="sm">
                Go Back
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl px-4 py-8 mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button onClick={onBack} variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900">Create New Permit to Work</h1>
            <p className="text-slate-600">Step {currentStep} of {totalSteps}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-3" />
        </div>

        {/* Form Card */}
        <div className="p-8 bg-white border shadow-sm rounded-xl border-slate-200">
          
          {/* STEP 1: BASIC INFORMATION */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Basic Information</h2>
                <p className="text-slate-600">Enter permit details and work information</p>
              </div>

              {/* Permit Initiator (Read-only) */}
              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                <Label className="text-blue-900">Permit Initiator</Label>
                <p className="font-semibold text-blue-900">{formData.permitInitiator || 'Not set'}</p>
                <p className="text-sm text-blue-700">{formData.permitInitiatorContact}</p>
              </div>

              {/* Permit Categories */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Permit Categories * 
                  <span className="ml-2 text-sm font-normal text-slate-500">(Select all that apply)</span>
                </Label>
                <div className="grid gap-3 md:grid-cols-2">
                  {(['General', 'Height', 'Hot_Work', 'Electrical', 'Confined_Space'] as PermitType[]).map(category => (
                    <div
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`
                        p-4 border-2 rounded-lg cursor-pointer transition-all
                        ${formData.categories.includes(category)
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={formData.categories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">
                              {category.replace('_', ' ')}
                            </span>
                            {highRiskPermits.includes(category) && (
                              <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 border border-red-200 rounded-full">
                                High Risk
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-slate-600">
                            {category === 'General' && 'Standard work permit for general activities'}
                            {category === 'Height' && 'Work above 1.8m requires fall protection'}
                            {category === 'Hot_Work' && 'Welding, cutting, or any spark-producing work'}
                            {category === 'Electrical' && 'Work on electrical systems and equipment'}
                            {category === 'Confined_Space' && 'Work in restricted or enclosed spaces'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Site Selection */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="site">Site *</Label>
                  <Select
                    value={formData.site_id.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, site_id: parseInt(value) }))}
                  >
                    <SelectTrigger id="site">
                      <SelectValue placeholder="Select site" />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.map(site => (
                        <SelectItem key={site.id} value={site.id.toString()}>
                          {site.site_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Work Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Building, floor, area"
                  />
                </div>
              </div>

              {/* Department and Vendor */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="department">Issue Department</Label>
                  <Input
                    id="department"
                    value={formData.issueDepartment}
                    onChange={(e) => setFormData(prev => ({ ...prev, issueDepartment: e.target.value }))}
                    placeholder="Department name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor (Optional)</Label>
                  <Select
                    value={formData.vendor_id.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, vendor_id: parseInt(value) }))}
                  >
                    <SelectTrigger id="vendor">
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None</SelectItem>
                      {vendors.map(vendor => (
                        <SelectItem key={vendor.id} value={vendor.id.toString()}>
                          {vendor.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Work Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Work Description *</Label>
                <Textarea
                  id="description"
                  value={formData.workDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, workDescription: e.target.value }))}
                  placeholder="Describe the work to be performed in detail..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Date and Time */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date & Time *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date & Time *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* High Risk Alert */}
              {formData.categories.some(cat => highRiskPermits.includes(cat)) && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <AlertDescription className="text-orange-900">
                    <span className="font-semibold">High Risk Permit Selected</span>
                    <p className="mt-1 text-sm">
                      Additional safety measures and approvals will be required for this permit.
                    </p>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* STEP 2: RECEIVER & WORKERS */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Receiver & Workers</h2>
                <p className="text-slate-600">Specify who will receive the permit and workers involved</p>
              </div>

              {/* Receiver Information */}
              <div className="p-4 space-y-4 border-2 rounded-lg border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-900">Permit Receiver</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="receiverName">Receiver Name *</Label>
                    <Input
                      id="receiverName"
                      value={formData.issuedToName}
                      onChange={(e) => setFormData(prev => ({ ...prev, issuedToName: e.target.value }))}
                      placeholder="Full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receiverContact">Receiver Contact *</Label>
                    <Input
                      id="receiverContact"
                      value={formData.issuedToContact}
                      onChange={(e) => setFormData(prev => ({ ...prev, issuedToContact: e.target.value }))}
                      placeholder="Phone or email"
                    />
                  </div>
                </div>
              </div>

              {/* Select Existing Workers */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Select Existing Workers</Label>
                {workers.length > 0 ? (
                  <div className="grid gap-2 md:grid-cols-2">
                    {workers.map(worker => (
                      <div
                        key={worker.id}
                        onClick={() => toggleWorker(worker.id)}
                        className={`
                          p-3 border rounded-lg cursor-pointer transition-all
                          ${formData.selectedWorkers.includes(worker.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                          }
                        `}
                      >
                        <div className="flex items-start gap-2">
                          <Checkbox
                            checked={formData.selectedWorkers.includes(worker.id)}
                            onCheckedChange={() => toggleWorker(worker.id)}
                          />
                          <div>
                            <p className="font-medium text-slate-900">{worker.full_name}</p>
                            <p className="text-sm text-slate-600">{worker.email}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      No workers available. Add workers manually below.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Add New Worker */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Add New Worker (Contractor/Vendor)</Label>
                  <Button
                    onClick={() => setShowAddWorker(true)}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Worker
                  </Button>
                </div>

                {/* Worker Form Modal */}
                {showAddWorker && (
                  <div className="p-6 border-2 border-blue-300 rounded-lg bg-blue-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-blue-900">
                        {editingWorkerId ? 'Edit Worker' : 'Add New Worker'}
                      </h4>
                      <button
                        onClick={cancelWorkerForm}
                        className="text-slate-500 hover:text-slate-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Worker Name *</Label>
                        <Input
                          value={workerForm.name}
                          onChange={(e) => setWorkerForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Full name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Role *</Label>
                        <Select
                          value={workerForm.role}
                          onValueChange={(value: WorkerRole) => 
                            setWorkerForm(prev => ({ ...prev, role: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Worker">Worker</SelectItem>
                            <SelectItem value="Supervisor">Supervisor</SelectItem>
                            <SelectItem value="Fire_Watcher">Fire Watcher</SelectItem>
                            <SelectItem value="Entrant">Entrant</SelectItem>
                            <SelectItem value="Standby">Standby Person</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Company Name</Label>
                        <Input
                          value={workerForm.companyName}
                          onChange={(e) => setWorkerForm(prev => ({ ...prev, companyName: e.target.value }))}
                          placeholder="Contractor/Vendor name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Badge ID</Label>
                        <Input
                          value={workerForm.badgeId}
                          onChange={(e) => setWorkerForm(prev => ({ ...prev, badgeId: e.target.value }))}
                          placeholder="Badge or Employee ID"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          value={workerForm.phone}
                          onChange={(e) => setWorkerForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+91 XXXXXXXXXX"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={workerForm.email}
                          onChange={(e) => setWorkerForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="worker@company.com"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button onClick={handleAddWorker} className="gap-2">
                        <Save className="w-4 h-4" />
                        {editingWorkerId ? 'Update Worker' : 'Add Worker'}
                      </Button>
                      <Button onClick={cancelWorkerForm} variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Display Added Workers */}
                {newWorkers.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">
                      Added Workers ({newWorkers.length})
                    </p>
                    {newWorkers.map(worker => (
                      <div
                        key={worker.id}
                        className="flex items-center justify-between p-3 bg-white border rounded-lg border-slate-200"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{worker.name}</p>
                          <p className="text-sm text-slate-600">
                            {worker.role.replace('_', ' ')}
                            {worker.companyName && ` • ${worker.companyName}`}
                            {worker.badgeId && ` • Badge: ${worker.badgeId}`}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditWorker(worker.id)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Edit"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteWorker(worker.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Worker Count Summary */}
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <AlertDescription className="text-green-900">
                  Total Workers: {formData.selectedWorkers.length + newWorkers.length}
                  {formData.selectedWorkers.length > 0 && ` (${formData.selectedWorkers.length} existing)`}
                  {newWorkers.length > 0 && ` (${newWorkers.length} new)`}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* STEP 3: HAZARDS & SAFETY */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Hazards & Safety Measures</h2>
                <p className="text-slate-600">Identify hazards and required PPE</p>
              </div>

              {/* Hazards Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Identified Hazards *</Label>
                <div className="grid gap-2 md:grid-cols-2">
                  {hazards.map(hazard => (
                    <div
                      key={hazard.id}
                      onClick={() => toggleHazard(hazard.id)}
                      className={`
                        p-3 border rounded-lg cursor-pointer transition-all
                        ${formData.selectedHazards.includes(hazard.id)
                          ? 'border-red-500 bg-red-50'
                          : 'border-slate-200 hover:border-slate-300'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={formData.selectedHazards.includes(hazard.id)}
                          onCheckedChange={() => toggleHazard(hazard.id)}
                        />
                        <span className="font-medium text-slate-900">{hazard.hazard_name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PPE Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Required PPE *</Label>
                <div className="grid gap-2 md:grid-cols-2">
                  {ppeItems.map(ppe => (
                    <div
                      key={ppe.id}
                      onClick={() => togglePPE(ppe.id)}
                      className={`
                        p-3 border rounded-lg cursor-pointer transition-all
                        ${formData.selectedPPE.includes(ppe.id)
                          ? 'border-green-500 bg-green-50'
                          : 'border-slate-200 hover:border-slate-300'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={formData.selectedPPE.includes(ppe.id)}
                          onCheckedChange={() => togglePPE(ppe.id)}
                        />
                        <span className="font-medium text-slate-900">{ppe.ppe_name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Control Measures */}
              <div className="space-y-2">
                <Label htmlFor="controlMeasures">Control Measures *</Label>
                <Textarea
                  id="controlMeasures"
                  value={formData.controlMeasures}
                  onChange={(e) => setFormData(prev => ({ ...prev, controlMeasures: e.target.value }))}
                  placeholder="Describe safety control measures to be implemented..."
                  rows={4}
                />
              </div>

              {/* Other Hazards */}
              <div className="space-y-2">
                <Label htmlFor="otherHazards">Other Hazards (if any)</Label>
                <Textarea
                  id="otherHazards"
                  value={formData.otherHazards}
                  onChange={(e) => setFormData(prev => ({ ...prev, otherHazards: e.target.value }))}
                  placeholder="Specify any additional hazards not listed above..."
                  rows={3}
                />
              </div>

              {/* Safety Summary */}
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  <p className="font-semibold">Safety Summary</p>
                  <p className="mt-1 text-sm">
                    {formData.selectedHazards.length} hazard(s) identified • 
                    {formData.selectedPPE.length} PPE item(s) required
                  </p>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* STEP 4: SWMS */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">SWMS (Safe Work Method Statement)</h2>
                <p className="text-slate-600">Upload SWMS document or enter text</p>
              </div>

              {/* Mode Toggle */}
              <div className="flex gap-2 p-1 rounded-lg bg-slate-100 w-fit">
                <button
                  onClick={() => setFormData(prev => ({ ...prev, swmsMode: 'file' }))}
                  className={`
                    px-6 py-3 rounded-md font-medium transition-all flex items-center gap-2
                    ${formData.swmsMode === 'file'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                    }
                  `}
                >
                  <Upload className="w-4 h-4" />
                  Upload File
                </button>
                <button
                  onClick={() => setFormData(prev => ({ ...prev, swmsMode: 'text' }))}
                  className={`
                    px-6 py-3 rounded-md font-medium transition-all flex items-center gap-2
                    ${formData.swmsMode === 'text'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                    }
                  `}
                >
                  <FileText className="w-4 h-4" />
                  Enter Text
                </button>
              </div>

              {/* File Upload Mode */}
              {formData.swmsMode === 'file' && (
                <div className="space-y-4">
                  <Label>Upload SWMS Document *</Label>
                  <div className="p-8 transition-colors border-2 border-dashed rounded-lg border-slate-300 bg-slate-50 hover:bg-slate-100">
                    <div className="text-center">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleSWMSFileChange}
                        className="hidden"
                        id="swms-file-input"
                      />
                      <label
                        htmlFor="swms-file-input"
                        className="inline-block px-4 py-2 font-medium text-white bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700"
                      >
                        Choose PDF File
                      </label>
                      <p className="mt-2 text-sm text-slate-500">
                        PDF only, maximum 10MB
                      </p>
                    </div>
                  </div>
                  
                  {formData.swmsFile && (
                    <div className="flex items-center gap-3 p-4 border border-green-200 rounded-lg bg-green-50">
                      <Check className="flex-shrink-0 w-5 h-5 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium text-green-900">{formData.swmsFile.name}</p>
                        <p className="text-sm text-green-700">
                          {(formData.swmsFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        onClick={removeSWMSFile}
                        className="flex-shrink-0 text-red-600 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Text Input Mode */}
              {formData.swmsMode === 'text' && (
                <div className="space-y-4">
                  <Label>Enter SWMS Text *</Label>
                  <Textarea
                    value={formData.swmsText}
                    onChange={(e) => setFormData(prev => ({ ...prev, swmsText: e.target.value }))}
                    rows={14}
                    className="font-mono text-sm"
                    placeholder={`Enter Safe Work Method Statement here...

Example Structure:

1. TASK DESCRIPTION
   - Overview of work to be performed
   - Sequence of activities

2. RISK ASSESSMENT
   - Identified hazards
   - Risk level (High/Medium/Low)
   - Persons at risk

3. CONTROL MEASURES
   - Engineering controls
   - Administrative controls
   - PPE requirements
   - Isolation procedures

4. EMERGENCY PROCEDURES
   - First aid provisions
   - Emergency contacts
   - Evacuation procedures
   - Emergency equipment locations

5. PERMITS & APPROVALS
   - Required permits
   - Authorized personnel
   - Inspection requirements`}
                  />
                  <div className="flex items-center justify-between">
                    <p className={`text-sm ${formData.swmsText.length > 5000 ? 'text-red-600' : 'text-slate-500'}`}>
                      Characters: {formData.swmsText.length} / 5000
                    </p>
                    {formData.swmsText.length > 5000 && (
                      <span className="text-sm font-medium text-red-600">
                        Text exceeds maximum length
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* SWMS Guidelines */}
              <Alert className="border-blue-200 bg-blue-50">
                <FileText className="w-5 h-5 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  <p className="mb-2 font-semibold">SWMS Guidelines:</p>
                  <ul className="space-y-1 text-sm">
                    <li>• Document all work steps and associated hazards</li>
                    <li>• Specify control measures for each identified hazard</li>
                    <li>• Include emergency response procedures</li>
                    <li>• List required permits and authorizations</li>
                    <li>• Specify competency requirements for workers</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* STEP 5: SAFETY CHECKLIST */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Safety Checklist</h2>
                <p className="text-slate-600">Complete all mandatory safety checks</p>
              </div>

              {getRelevantChecklistQuestions().length > 0 ? (
                <div className="space-y-4">
                  {getRelevantChecklistQuestions().map((question, index) => (
                    <div
                      key={question.id}
                      className="p-4 bg-white border rounded-lg border-slate-200"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex items-center justify-center flex-shrink-0 w-8 h-8 font-semibold rounded-full bg-slate-100 text-slate-700">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <Label className="text-base font-medium text-slate-900">
                              {question.question_text}
                              {question.is_mandatory && (
                                <span className="ml-2 text-red-600">*</span>
                              )}
                            </Label>
                            <span className={`
                              px-2 py-1 text-xs font-semibold rounded-full
                              ${getCategoryBadgeColor(question.permit_type)}
                            `}>
                              {question.permit_type.replace('_', ' ')}
                            </span>
                          </div>

                          {question.response_type === 'radio' ? (
                            <div className="space-y-2">
                              <div className="flex gap-4">
                                {['Yes', 'No', 'N/A'].map(option => (
                                  <label
                                    key={option}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <input
                                      type="radio"
                                      name={`question-${question.id}`}
                                      value={option}
                                      checked={formData.checklistResponses[question.id] === option}
                                      onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        checklistResponses: {
                                          ...prev.checklistResponses,
                                          [question.id]: e.target.value as ChecklistResponse
                                        }
                                      }))}
                                      className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="text-sm font-medium text-slate-700">
                                      {option}
                                    </span>
                                  </label>
                                ))}
                              </div>

                              {/* Remarks field */}
                              {formData.checklistResponses[question.id] && (
                                <div className="mt-3">
                                  <Input
                                    value={formData.checklistRemarks[question.id] || ''}
                                    onChange={(e) => setFormData(prev => ({
                                      ...prev,
                                      checklistRemarks: {
                                        ...prev.checklistRemarks,
                                        [question.id]: e.target.value
                                      }
                                    }))}
                                    placeholder="Add remarks (optional)"
                                    className="text-sm"
                                  />
                                </div>
                              )}
                            </div>
                          ) : (
                            <Input
                              value={formData.checklistTextResponses[question.id] || ''}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                checklistTextResponses: {
                                  ...prev.checklistTextResponses,
                                  [question.id]: e.target.value
                                }
                              }))}
                              placeholder="Enter response..."
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    No checklist questions available for selected permit categories.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* STEP 6: APPROVERS & SIGNATURES */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Approvers & Signatures</h2>
                <p className="text-slate-600">Select approvers and capture digital signatures</p>
              </div>

              {/* Area Manager */}
              <div className={`p-4 border-2 rounded-lg ${formData.areaManagerId ? 'border-green-300 bg-green-50' : 'border-slate-200'}`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Area Manager *</Label>
                    {formData.areaManagerSignature && (
                      <span className="flex items-center gap-1 text-sm font-medium text-green-700">
                        <CheckCircle2 className="w-4 h-4" />
                        Signed
                      </span>
                    )}
                  </div>
                  
                  <Select
                    value={formData.areaManagerId.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, areaManagerId: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Area Manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {areaManagers.map(manager => (
                        <SelectItem key={manager.id} value={manager.id.toString()}>
                          {manager.full_name} ({manager.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {formData.areaManagerId > 0 && (
                    <Button
                      onClick={() => setShowSignature('areaManager')}
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      {formData.areaManagerSignature ? 'Update Signature' : 'Add Signature'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Safety Officer */}
              <div className={`p-4 border-2 rounded-lg ${formData.safetyOfficerId ? 'border-green-300 bg-green-50' : 'border-slate-200'}`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Safety Officer *</Label>
                    {formData.safetyOfficerSignature && (
                      <span className="flex items-center gap-1 text-sm font-medium text-green-700">
                        <CheckCircle2 className="w-4 h-4" />
                        Signed
                      </span>
                    )}
                  </div>
                  
                  <Select
                    value={formData.safetyOfficerId.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, safetyOfficerId: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Safety Officer" />
                    </SelectTrigger>
                    <SelectContent>
                      {safetyOfficers.map(officer => (
                        <SelectItem key={officer.id} value={officer.id.toString()}>
                          {officer.full_name} ({officer.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {formData.safetyOfficerId > 0 && (
                    <Button
                      onClick={() => setShowSignature('safetyOfficer')}
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      {formData.safetyOfficerSignature ? 'Update Signature' : 'Add Signature'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Site Leader (Conditional) */}
              {requiresSiteLeaderApproval && (
                <div className={`p-4 border-2 rounded-lg ${formData.siteLeaderId ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">
                        Site Leader *
                        <span className="ml-2 text-sm font-normal text-red-600">
                          (Required for Height/Confined Space)
                        </span>
                      </Label>
                      {formData.siteLeaderSignature && (
                        <span className="flex items-center gap-1 text-sm font-medium text-green-700">
                          <CheckCircle2 className="w-4 h-4" />
                          Signed
                        </span>
                      )}
                    </div>
                    
                    <Select
                      value={formData.siteLeaderId.toString()}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, siteLeaderId: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Site Leader" />
                      </SelectTrigger>
                      <SelectContent>
                        {siteLeaders.map(leader => (
                          <SelectItem key={leader.id} value={leader.id.toString()}>
                            {leader.full_name} ({leader.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {formData.siteLeaderId > 0 && (
                      <Button
                        onClick={() => setShowSignature('siteLeader')}
                        variant="outline"
                        className="w-full gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        {formData.siteLeaderSignature ? 'Update Signature' : 'Add Signature'}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* High Risk Warning */}
              {requiresSiteLeaderApproval && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <AlertDescription className="text-orange-900">
                    <p className="font-semibold">Additional Approval Required</p>
                    <p className="mt-1 text-sm">
                      Site Leader approval is mandatory for Height and Confined Space permits.
                    </p>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* STEP 7: REVIEW & SUBMIT */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Review & Submit</h2>
                <p className="text-slate-600">Review all information before submitting</p>
              </div>

              {/* Basic Information */}
              <div className="p-4 space-y-3 border rounded-lg border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-900">Basic Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Permit Initiator:</span>
                    <span className="font-medium text-slate-900">{formData.permitInitiator}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Categories:</span>
                    <div className="flex flex-wrap gap-1">
                      {formData.categories.map(cat => (
                        <span
                          key={cat}
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadgeColor(cat)}`}
                        >
                          {cat.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Site:</span>
                    <span className="font-medium text-slate-900">{getSelectedSiteName()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Location:</span>
                    <span className="font-medium text-slate-900">{formData.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Work Period:</span>
                    <span className="font-medium text-slate-900">
                      {formData.startDate} {formData.startTime} → {formData.endDate} {formData.endTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Work Description */}
              <div className="p-4 space-y-2 border rounded-lg border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-900">Work Description</h3>
                <p className="text-sm text-slate-700">{formData.workDescription}</p>
              </div>

              {/* Receiver & Workers */}
              <div className="p-4 space-y-3 border rounded-lg border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-900">Receiver & Workers</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Receiver:</span>
                    <span className="font-medium text-slate-900">
                      {formData.issuedToName} ({formData.issuedToContact})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Total Workers: </span>
                    <span className="font-medium text-slate-900">
                      {formData.selectedWorkers.length + newWorkers.length}
                    </span>
                  </div>
                  {newWorkers.length > 0 && (
                    <div className="pt-2 mt-2 border-t border-slate-300">
                      <p className="mb-1 font-medium text-slate-700">New Workers Added:</p>
                      {newWorkers.map(worker => (
                        <div key={worker.id} className="text-xs text-slate-600">
                          • {worker.name} - {worker.role.replace('_', ' ')}
                          {worker.companyName && ` (${worker.companyName})`}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Hazards & PPE */}
              <div className="p-4 space-y-3 border rounded-lg border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-900">Safety Measures</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-slate-600">Hazards: </span>
                    <span className="font-medium text-slate-900">{formData.selectedHazards.length} identified</span>
                  </div>
                  <div>
                    <span className="text-slate-600">PPE Required: </span>
                    <span className="font-medium text-slate-900">{formData.selectedPPE.length} items</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-slate-300">
                    <p className="mb-1 font-medium text-slate-700">Control Measures:</p>
                    <p className="text-xs text-slate-600">{formData.controlMeasures}</p>
                  </div>
                </div>
              </div>

              {/* SWMS */}
              <div className="p-4 space-y-2 border rounded-lg border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-900">SWMS</h3>
                {formData.swmsFile ? (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-slate-900">{formData.swmsFile.name}</span>
                    <span className="text-slate-600">
                      ({(formData.swmsFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                ) : formData.swmsText ? (
                  <div className="text-sm text-slate-700">
                    <p className="font-medium">Text entered ({formData.swmsText.length} characters)</p>
                    <p className="mt-1 text-xs text-slate-600 line-clamp-3">{formData.swmsText}</p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-600">No SWMS provided</p>
                )}
              </div>

              {/* Checklist */}
              <div className="p-4 space-y-2 border rounded-lg border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-900">Safety Checklist</h3>
                <p className="text-sm text-slate-700">
                  {Object.keys(formData.checklistResponses).length + Object.keys(formData.checklistTextResponses).length} questions answered
                </p>
              </div>

              {/* Approvers */}
              <div className="p-4 space-y-3 border rounded-lg border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-900">Approvers</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Area Manager:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">
                        {areaManagers.find(m => m.id === formData.areaManagerId)?.full_name || 'Not selected'}
                      </span>
                      {formData.areaManagerSignature && (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Safety Officer:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">
                        {safetyOfficers.find(o => o.id === formData.safetyOfficerId)?.full_name || 'Not selected'}
                      </span>
                      {formData.safetyOfficerSignature && (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                  </div>
                  {requiresSiteLeaderApproval && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Site Leader:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">
                          {siteLeaders.find(l => l.id === formData.siteLeaderId)?.full_name || 'Not selected'}
                        </span>
                        {formData.siteLeaderSignature && (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Declaration */}
              <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={formData.declaration}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, declaration: checked === true }))
                    }
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900">Declaration *</p>
                    <p className="mt-1 text-sm text-blue-800">
                      I declare that all information provided is accurate and complete. I understand 
                      that this permit must be displayed at the work location and that work must stop 
                      immediately if conditions change or hazards are identified that are not covered 
                      by this permit.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 mt-8 border-t border-slate-200">
            <Button
              onClick={handleBack}
              variant="outline"
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            {currentStep < totalSteps ? (
              <Button onClick={handleNext} className="gap-2">
                Next
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.declaration}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Submit Permit
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Step Navigation (Optional) */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map(step => (
            <button
              key={step}
              onClick={() => goToStep(step)}
              disabled={step > currentStep + 1}
              className={`
                w-10 h-10 rounded-full font-semibold transition-all
                ${step === currentStep
                  ? 'bg-blue-600 text-white shadow-lg scale-110'
                  : step < currentStep
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }
              `}
            >
              {step}
            </button>
          ))}
        </div>
      </div>

      {/* Signature Modal */}
      {showSignature && (
        <DigitalSignature
          onSave={handleSaveSignature}
          onCancel={() => setShowSignature(null)}
          existingSignature={
            showSignature === 'areaManager' ? formData.areaManagerSignature :
            showSignature === 'safetyOfficer' ? formData.safetyOfficerSignature :
            formData.siteLeaderSignature
          }
        />
      )}
    </div>
  );
}