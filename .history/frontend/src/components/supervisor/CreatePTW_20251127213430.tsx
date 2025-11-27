// frontend/src/components/supervisor/CreatePTW.tsx - FIXED VERSION
// All TypeScript errors resolved

import { useState, useEffect } from 'react';
import { ArrowLeft, Upload, FileText, Check, Plus, X, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Progress } from '../ui/progress';
import { DigitalSignature } from '../shared/DigitalSignature';
import { permitService } from '../../services/permit.service';
import { apiService } from '../../services/api.service';

interface CreatePTWProps {
  onBack: () => void;
}

interface Worker {
  id: number;
  name: string;
  email: string;
  phone: string;
  badge_id: string;
  company_name?: string;
}

interface NewWorkerForm {
  name: string;
  company_name: string;
  phone: string;
  email: string;
  badge_id: string;
  role: string;
}

export function CreatePTW({ onBack }: CreatePTWProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSignature, setShowSignature] = useState(false);
  const [signatureType, setSignatureType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Real-time data from database
  const [sites, setSites] = useState<any[]>([]);
  const [existingWorkers, setExistingWorkers] = useState<Worker[]>([]);
  const [hazardsMaster, setHazardsMaster] = useState<any[]>([]);
  const [ppeMaster, setPPEMaster] = useState<any[]>([]);
  const [checklistQuestions, setChecklistQuestions] = useState<any[]>([]);
  
  // Worker management
  const [workerSelectionMode, setWorkerSelectionMode] = useState<'existing' | 'new'>('existing');
  const [newWorkers, setNewWorkers] = useState<NewWorkerForm[]>([]);
  const [newWorkerForm, setNewWorkerForm] = useState<NewWorkerForm>({
    name: '',
    company_name: '',
    phone: '',
    email: '',
    badge_id: '',
    role: 'Worker'
  });
  
  const [formData, setFormData] = useState({
    // Basic Info
    category: '',
    site_id: '',
    location: '',
    workDescription: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    
    // Workers
    selectedWorkers: [] as number[],
    newWorkersList: [] as NewWorkerForm[],
    
    // Hazards & Controls
    hazards: [] as number[],
    otherHazards: '',
    controlMeasures: '',
    
    // PPE
    ppe: [] as number[],
    
    // File
    swmsFile: null as File | null,
    
    // Signatures
    issuerSignature: '',
    
    // ALL Requirements
    checklistResponses: {} as Record<number, 'Yes' | 'No' | 'NA'>,
    
    // Declaration
    declaration: false,
  });

  // Load real-time data from database
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch all required master data
      const [sitesData, workersData, hazardsData, ppeData, questionsData] = await Promise.all([
        apiService.get('/api/sites'),
        apiService.get('/api/users?role=Requester'),
        apiService.get('/api/master/hazards'),
        apiService.get('/api/master/ppe'),
        apiService.get('/api/master/checklist-questions')
      ]);
      
      setSites(sitesData.data);
      setExistingWorkers(workersData.data);
      setHazardsMaster(hazardsData.data);
      setPPEMaster(ppeData.data);
      setChecklistQuestions(questionsData.data);
      
      // Initialize checklist responses with NA
      const initialResponses: Record<number, 'Yes' | 'No' | 'NA'> = {};
      questionsData.data.forEach((q: any) => {
        initialResponses[q.id] = 'NA';
      });
      setFormData(prev => ({ ...prev, checklistResponses: initialResponses }));
      
    } catch (err: any) {
      setError('Failed to load initial data: ' + (err.message || 'Unknown error'));
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Basic Information', description: 'Work details and location' },
    { number: 2, title: 'Assign Workers', description: 'Select team members' },
    { number: 3, title: 'Hazards & Controls', description: 'Identify risks' },
    { number: 4, title: 'PPE & SWMS', description: 'Safety equipment & documents' },
    { number: 5, title: 'Work Requirements', description: 'Complete safety checklist' },
    { number: 6, title: 'Review & Submit', description: 'Final verification' }
  ];

  const progress = (currentStep / steps.length) * 100;

  const nextStep = () => {
    // Validation
    if (currentStep === 1) {
      if (!formData.category || !formData.site_id || !formData.location || 
          !formData.workDescription || !formData.startDate || !formData.endDate) {
        setError('Please fill all required fields');
        return;
      }
    }
    
    if (currentStep === 2) {
      if (formData.selectedWorkers.length === 0 && newWorkers.length === 0) {
        setError('Please assign at least one worker');
        return;
      }
    }
    
    if (currentStep === 3) {
      if (formData.hazards.length === 0) {
        setError('Please identify at least one hazard');
        return;
      }
      if (!formData.controlMeasures.trim()) {
        setError('Please describe control measures');
        return;
      }
    }
    
    if (currentStep === 4) {
      if (formData.ppe.length === 0) {
        setError('Please select required PPE');
        return;
      }
    }
    
    setError('');
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setError('');
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFormData({ ...formData, swmsFile: file });
    }
  };

  const toggleHazard = (hazardId: number) => {
    setFormData(prev => ({
      ...prev,
      hazards: prev.hazards.includes(hazardId)
        ? prev.hazards.filter(id => id !== hazardId)
        : [...prev.hazards, hazardId]
    }));
  };

  const handleSignature = (signature: string) => {
    setFormData({ ...formData, issuerSignature: signature });
    setShowSignature(false);
  };

  // Add new worker to list
  const addNewWorker = () => {
    if (!newWorkerForm.name || !newWorkerForm.company_name || !newWorkerForm.phone) {
      setError('Please fill all required worker fields (Name, Company, Phone)');
      return;
    }
    
    setNewWorkers([...newWorkers, { ...newWorkerForm }]);
    setFormData(prev => ({ ...prev, newWorkersList: [...prev.newWorkersList, newWorkerForm] }));
    
    // Reset form
    setNewWorkerForm({
      name: '',
      company_name: '',
      phone: '',
      email: '',
      badge_id: '',
      role: 'Worker'
    });
    setError('');
  };

  const removeNewWorker = (index: number) => {
    const updated = newWorkers.filter((_, i) => i !== index);
    setNewWorkers(updated);
    setFormData(prev => ({ ...prev, newWorkersList: updated }));
  };

  const toggleWorkerSelection = (workerId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedWorkers: prev.selectedWorkers.includes(workerId)
        ? prev.selectedWorkers.filter(id => id !== workerId)
        : [...prev.selectedWorkers, workerId]
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.declaration) {
        setError('Please accept the declaration to submit');
        return;
      }

      if (!formData.issuerSignature) {
        setError('Please provide issuer signature');
        return;
      }

      setLoading(true);
      setError('');

      // Prepare permit data with proper types
      const permitData = {
        site_id: parseInt(formData.site_id),
        permit_type: formData.category,
        work_location: formData.location,
        work_description: formData.workDescription,
        start_time: `${formData.startDate} ${formData.startTime}`,
        end_time: `${formData.endDate} ${formData.endTime}`,
        receiver_name: 'Pending',
        
        // Team members - ensure all fields are strings (not undefined)
        team_members: [
          ...formData.selectedWorkers.map(workerId => {
            const worker = existingWorkers.find(w => w.id === workerId);
            return {
              worker_name: worker?.name || '',
              company_name: worker?.company_name || '',
              badge_id: worker?.badge_id || '',
              worker_role: 'Worker',
              contact_number: worker?.phone || ''
            };
          }),
          ...newWorkers.map(nw => ({
            worker_name: nw.name,
            company_name: nw.company_name,
            badge_id: nw.badge_id || '',
            worker_role: nw.role,
            contact_number: nw.phone
          }))
        ],
        
        // Hazards
        hazards: formData.hazards,
        other_hazards: formData.otherHazards,
        control_measures: formData.controlMeasures,
        
        // PPE
        ppe: formData.ppe,
        
        // Checklist responses
        checklist_responses: Object.entries(formData.checklistResponses).map(([questionId, response]) => ({
          question_id: parseInt(questionId),
          response: response,
          remarks: ''
        })),
        
        // Signature
        issuer_signature: formData.issuerSignature
      };

      // Submit to backend
      const response = await permitService.createPermit(permitData, formData.swmsFile);
      
      if (response.success) {
        alert('PTW created successfully! PTW Number: ' + response.data.permit_serial);
        onBack();
      } else {
        setError(response.message || 'Failed to create PTW');
      }
      
    } catch (err: any) {
      setError('Error submitting PTW: ' + (err.message || 'Unknown error'));
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Requirement Row Component
  const RequirementRow = ({ 
    label, 
    value, 
    onChange 
  }: { 
    label: string; 
    value: 'Yes' | 'No' | 'NA'; 
    onChange: (val: 'Yes' | 'No' | 'NA') => void;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-200 last:border-0">
      <span className="flex-1 text-sm text-slate-700">{label}</span>
      <div className="flex gap-2">
        {(['Yes', 'No', 'NA'] as const).map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`px-4 py-1.5 text-sm rounded-lg border-2 transition-all ${
              value === option
                ? option === 'Yes'
                  ? 'bg-green-600 text-white border-green-600'
                  : option === 'No'
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-slate-600 text-white border-slate-600'
                : 'border-slate-300 text-slate-700 hover:border-slate-400'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );

  if (loading && currentStep === 1) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Create New PTW</h1>
            <p className="text-slate-600">Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}</p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-3 p-4 border-2 border-red-200 rounded-lg bg-red-50">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-900">Error</h4>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button onClick={() => setError('')} className="ml-auto">
            <X className="w-5 h-5 text-red-600" />
          </button>
        </div>
      )}

      {/* Progress Bar */}
      <div className="p-6 bg-white border rounded-xl border-slate-200">
        <div className="flex justify-between mb-4">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${
                step.number === currentStep
                  ? 'bg-green-600 text-white'
                  : step.number < currentStep
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {step.number < currentStep ? <Check className="w-5 h-5" /> : step.number}
              </div>
              <p className="hidden text-xs font-medium text-center text-slate-700 md:block">{step.title}</p>
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <div className="p-6 bg-white border rounded-xl border-slate-200 md:p-8">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">Basic Work Information</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="category">Permit Category *</Label>
                <Select value={formData.category} onValueChange={(val: string) => setFormData({ ...formData, category: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General Work</SelectItem>
                    <SelectItem value="Height">Work at Height</SelectItem>
                    <SelectItem value="Hot_Work">Hot Work (Welding/Cutting)</SelectItem>
                    <SelectItem value="Electrical">Electrical Work</SelectItem>
                    <SelectItem value="Confined_Space">Confined Space</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="site">Site *</Label>
                <Select value={formData.site_id} onValueChange={(val: string) => setFormData({ ...formData, site_id: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select site" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites.map(site => (
                      <SelectItem key={site.id} value={site.id.toString()}>
                        {site.name} ({site.site_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="location">Work Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Building A - Floor 2 - Room 205"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="workDescription">Work Description *</Label>
                <Textarea
                  id="workDescription"
                  value={formData.workDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, workDescription: e.target.value })}
                  placeholder="Describe the work to be performed in detail..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, endDate: e.target.value })}
                  min={formData.startDate}
                />
              </div>

              <div>
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>

            {/* Issuer Signature */}
            <div className="pt-6 border-t border-slate-200">
              <h3 className="mb-4 text-lg font-medium text-slate-900">Issuer Signature *</h3>
              {formData.issuerSignature ? (
                <div className="space-y-3">
                  <img src={formData.issuerSignature} alt="Signature" className="h-32 p-2 bg-white border rounded-lg border-slate-300" />
                  <Button
                    onClick={() => {
                      setShowSignature(true);
                      setSignatureType('issuer');
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Change Signature
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    setShowSignature(true);
                    setSignatureType('issuer');
                  }}
                  variant="outline"
                  className="gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Add Signature
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Assign Workers WITH COMPANY NAME */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">Assign Workers</h2>
            
            {/* Selection Mode Toggle */}
            <div className="flex gap-2 p-1 rounded-lg bg-slate-100 w-fit">
              <button
                onClick={() => setWorkerSelectionMode('existing')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  workerSelectionMode === 'existing'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Select Existing Workers
              </button>
              <button
                onClick={() => setWorkerSelectionMode('new')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  workerSelectionMode === 'new'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Add New Workers
              </button>
            </div>

            {/* Existing Workers Selection */}
            {workerSelectionMode === 'existing' && (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">Select workers from existing database</p>
                <div className="grid gap-3 overflow-y-auto md:grid-cols-2 max-h-96">
                  {existingWorkers.map((worker) => (
                    <label
                      key={worker.id}
                      className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.selectedWorkers.includes(worker.id)
                          ? 'border-green-500 bg-green-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Checkbox
                        checked={formData.selectedWorkers.includes(worker.id)}
                        onCheckedChange={() => toggleWorkerSelection(worker.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{worker.name}</p>
                        {worker.company_name && (
                          <p className="text-sm text-slate-600">Company: {worker.company_name}</p>
                        )}
                        <p className="text-sm text-slate-600">{worker.email}</p>
                        <p className="text-sm text-slate-500">Badge: {worker.badge_id}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {existingWorkers.length === 0 && (
                  <p className="py-8 text-center text-slate-500">No workers found in database</p>
                )}
              </div>
            )}

            {/* New Worker Form WITH COMPANY NAME */}
            {workerSelectionMode === 'new' && (
              <div className="space-y-6">
                <p className="text-sm text-slate-600">Add workers who are not in the database</p>
                
                <div className="p-6 space-y-4 border rounded-lg border-slate-300 bg-slate-50">
                  <h3 className="font-medium text-slate-900">New Worker Details</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="workerName">Worker Name *</Label>
                      <Input
                        id="workerName"
                        value={newWorkerForm.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewWorkerForm({ ...newWorkerForm, name: e.target.value })}
                        placeholder="Full name"
                      />
                    </div>

                    {/* COMPANY NAME FIELD - NEW REQUIREMENT */}
                    <div>
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        value={newWorkerForm.company_name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewWorkerForm({ ...newWorkerForm, company_name: e.target.value })}
                        placeholder="Company/Vendor name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="workerPhone">Contact Number *</Label>
                      <Input
                        id="workerPhone"
                        value={newWorkerForm.phone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewWorkerForm({ ...newWorkerForm, phone: e.target.value })}
                        placeholder="+91 1234567890"
                      />
                    </div>

                    <div>
                      <Label htmlFor="workerEmail">Email (Optional)</Label>
                      <Input
                        id="workerEmail"
                        type="email"
                        value={newWorkerForm.email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewWorkerForm({ ...newWorkerForm, email: e.target.value })}
                        placeholder="email@example.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="badgeId">Badge ID (Optional)</Label>
                      <Input
                        id="badgeId"
                        value={newWorkerForm.badge_id}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewWorkerForm({ ...newWorkerForm, badge_id: e.target.value })}
                        placeholder="Badge/ID number"
                      />
                    </div>

                    <div>
                      <Label htmlFor="workerRole">Role</Label>
                      <Select 
                        value={newWorkerForm.role} 
                        onValueChange={(val: string) => setNewWorkerForm({ ...newWorkerForm, role: val })}
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
                  </div>

                  <Button onClick={addNewWorker} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Worker to List
                  </Button>
                </div>

                {/* Added New Workers List */}
                {newWorkers.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-slate-900">Added Workers ({newWorkers.length})</h3>
                    <div className="space-y-2">
                      {newWorkers.map((worker, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-white border rounded-lg border-slate-200">
                          <div>
                            <p className="font-medium text-slate-900">{worker.name}</p>
                            <p className="text-sm text-slate-600">Company: {worker.company_name}</p>
                            <p className="text-sm text-slate-600">{worker.phone} {worker.email && `• ${worker.email}`}</p>
                            <p className="text-sm text-slate-500">Role: {worker.role}</p>
                          </div>
                          <Button
                            onClick={() => removeNewWorker(index)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Summary */}
            <div className="pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                Total Workers Assigned: <span className="font-semibold text-slate-900">
                  {formData.selectedWorkers.length + newWorkers.length}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Hazards & Control Measures - UPDATED */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">Hazards & Control Measures</h2>
            
            {/* Hazard Selection */}
            <div>
              <Label>Identified Hazards *</Label>
              <p className="mb-3 text-sm text-slate-500">Select all applicable hazards for this work</p>
              <div className="grid gap-3 md:grid-cols-2">
                {hazardsMaster.map((hazard) => (
                  <label
                    key={hazard.id}
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.hazards.includes(hazard.id)
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Checkbox
                      checked={formData.hazards.includes(hazard.id)}
                      onCheckedChange={() => toggleHazard(hazard.id)}
                    />
                    <div>
                      <p className="font-medium text-slate-900">{hazard.name}</p>
                      <p className="text-xs text-slate-500">{hazard.category}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Other Hazards */}
            <div>
              <Label htmlFor="otherHazards">Other Hazards (If any)</Label>
              <Textarea
                id="otherHazards"
                value={formData.otherHazards}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, otherHazards: e.target.value })}
                placeholder="Describe any other hazards not listed above..."
                rows={3}
              />
            </div>

            {/* Control Measures */}
            <div>
              <Label htmlFor="controlMeasures">Control Measures *</Label>
              <Textarea
                id="controlMeasures"
                value={formData.controlMeasures}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, controlMeasures: e.target.value })}
                placeholder="Describe the control measures to mitigate identified hazards..."
                rows={6}
              />
              
              {/* UPDATED: Simple Note instead of editable textbox */}
              <div className="p-4 mt-3 border border-blue-200 rounded-lg bg-blue-50">
                <p className="flex items-start gap-2 text-sm text-blue-900">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Note:</strong> Describe all safety measures, procedures, and precautions to be taken during the work.
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: PPE & SWMS File - WITH SVG ICONS */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">PPE Requirements & SWMS Upload</h2>
            
            <div>
              <Label>Required Personal Protective Equipment (PPE) *</Label>
              <p className="mb-4 text-sm text-slate-500">Select all required PPE for this work</p>
              
              {/* PPE Selector with SVG Icons */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {ppeMaster.map((ppe) => (
                  <button
                    key={ppe.id}
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        ppe: prev.ppe.includes(ppe.id)
                          ? prev.ppe.filter(id => id !== ppe.id)
                          : [...prev.ppe, ppe.id]
                      }));
                    }}
                    className={`flex flex-col items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                      formData.ppe.includes(ppe.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* SVG Icon based on PPE type */}
                    <div className="flex items-center justify-center w-16 h-16">
                      {getPPESVGIcon(ppe.name)}
                    </div>
                    <span className="text-sm font-medium text-center text-slate-900">{ppe.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SWMS File Upload */}
            <div>
              <Label htmlFor="swms">Upload SWMS Document</Label>
              <p className="mb-2 text-sm text-slate-500">Safe Work Method Statement (Optional)</p>
              <div className="mt-2">
                <label className="flex items-center justify-center gap-3 p-8 transition-all border-2 border-dashed rounded-lg cursor-pointer border-slate-300 hover:border-blue-500 hover:bg-blue-50">
                  <input
                    id="swms"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Upload className="w-6 h-6 text-slate-400" />
                  <div className="text-center">
                    {formData.swmsFile ? (
                      <>
                        <p className="font-medium text-slate-900">{formData.swmsFile.name}</p>
                        <p className="text-sm text-green-600">File uploaded successfully</p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-slate-900">Click to upload SWMS file</p>
                        <p className="text-sm text-slate-500">PDF, DOC, DOCX up to 10MB</p>
                      </>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: ALL Work Requirements - REGARDLESS OF CATEGORY */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">Work Requirements Checklist</h2>
            <p className="text-sm text-slate-600">
              Complete all applicable requirements below. Select YES, NO, or NA for each item.
            </p>
            
            {/* Group questions by permit type */}
            {['General', 'Height', 'Hot_Work', 'Electrical', 'Confined_Space'].map(permitType => {
              const questions = checklistQuestions.filter(q => q.permit_type === permitType);
              if (questions.length === 0) return null;
              
              return (
                <div key={permitType} className="p-6 space-y-1 border rounded-lg border-slate-200">
                  <h3 className="mb-4 text-lg font-medium text-slate-900">
                    {permitType.replace('_', ' ')} Requirements
                  </h3>
                  <div>
                    {questions.map(question => (
                      <RequirementRow
                        key={question.id}
                        label={question.question_text}
                        value={formData.checklistResponses[question.id] || 'NA'}
                        onChange={(val: 'Yes' | 'No' | 'NA') => setFormData(prev => ({
                          ...prev,
                          checklistResponses: {
                            ...prev.checklistResponses,
                            [question.id]: val
                          }
                        }))}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Step 6: Review & Submit */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">Review & Submit</h2>
            
            {/* Summary */}
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Category</p>
                  <p className="font-medium text-slate-900">{formData.category || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Site & Location</p>
                  <p className="font-medium text-slate-900">
                    {sites.find(s => s.id.toString() === formData.site_id)?.name} - {formData.location}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Work Period</p>
                  <p className="font-medium text-slate-900">
                    {formData.startDate} {formData.startTime} to {formData.endDate} {formData.endTime}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Assigned Workers</p>
                  <p className="font-medium text-slate-900">
                    {formData.selectedWorkers.length + newWorkers.length} workers
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Hazards Identified</p>
                  <p className="font-medium text-slate-900">{formData.hazards.length} hazards</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">PPE Required</p>
                  <p className="font-medium text-slate-900">{formData.ppe.length} items</p>
                </div>
              </div>
            </div>

            {/* Declaration */}
            <div className="pt-6 border-t border-slate-200">
              <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer border-slate-200 hover:bg-slate-50">
                <Checkbox
                  checked={formData.declaration}
                  onCheckedChange={(checked: boolean) => setFormData({ ...formData, declaration: !!checked })}
                />
                <div className="text-sm text-slate-700">
                  <p className="mb-1 font-medium text-slate-900">Declaration</p>
                  <p>
                    I hereby declare that all information provided is accurate and complete. 
                    I have ensured all safety measures are in place and all team members 
                    are aware of the hazards and control measures.
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4 pt-6 mt-8 border-t border-slate-200">
          <Button
            onClick={prevStep}
            variant="outline"
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          {currentStep < steps.length ? (
            <Button onClick={nextStep} className="gap-2">
              Next
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              className="gap-2 bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-b-2 border-white rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Submit PTW
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Digital Signature Modal */}
      {showSignature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-2xl p-6 bg-white rounded-xl">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              {signatureType === 'issuer' ? 'Issuer Signature' : 'Signature'}
            </h3>
            <DigitalSignature onSave={handleSignature} onCancel={() => setShowSignature(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

// SVG Icon Helper Function
function getPPESVGIcon(ppeName: string) {
  const icons: Record<string, JSX.Element> = {
    'Safety Helmet': (
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
        <path d="M32 8C20 8 12 16 12 28V36H52V28C52 16 44 8 32 8Z" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
        <path d="M12 36H52L48 48H16L12 36Z" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
        <circle cx="32" cy="28" r="2" fill="#F59E0B"/>
      </svg>
    ),
    'Reflective Vest': (
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
        <path d="M16 20L24 12L32 16L40 12L48 20V52H16V20Z" fill="#F97316" stroke="#EA580C" strokeWidth="2"/>
        <path d="M24 20L26 28L32 24L38 28L40 20" stroke="#FCD34D" strokeWidth="3"/>
        <path d="M20 32H28" stroke="#FCD34D" strokeWidth="2"/>
        <path d="M36 32H44" stroke="#FCD34D" strokeWidth="2"/>
      </svg>
    ),
    'Safety Shoes': (
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
        <path d="M16 40L20 28L32 24L44 28L48 40V48H16V40Z" fill="#1F2937" stroke="#111827" strokeWidth="2"/>
        <path d="M16 48H48V52H16V48Z" fill="#6B7280" stroke="#111827" strokeWidth="2"/>
        <circle cx="24" cy="44" r="2" fill="#9CA3AF"/>
        <circle cx="40" cy="44" r="2" fill="#9CA3AF"/>
      </svg>
    ),
    'Safety Goggles': (
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
        <ellipse cx="22" cy="32" rx="10" ry="12" fill="#93C5FD" stroke="#3B82F6" strokeWidth="2"/>
        <ellipse cx="42" cy="32" rx="10" ry="12" fill="#93C5FD" stroke="#3B82F6" strokeWidth="2"/>
        <path d="M12 32H8M56 32H52" stroke="#3B82F6" strokeWidth="2"/>
        <path d="M32 32H32.1" stroke="#3B82F6" strokeWidth="2"/>
      </svg>
    ),
    'Full Body Harness': (
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
        <circle cx="32" cy="16" r="6" fill="#F59E0B" stroke="#D97706" strokeWidth="2"/>
        <path d="M32 22V36M24 28L32 36L40 28M20 36V52M44 36V52" stroke="#D97706" strokeWidth="2"/>
        <path d="M20 36L32 28L44 36" stroke="#D97706" strokeWidth="2"/>
        <circle cx="32" cy="36" r="4" fill="#FCD34D" stroke="#D97706" strokeWidth="2"/>
      </svg>
    ),
    'Ear Plugs': (
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
        <ellipse cx="24" cy="32" rx="8" ry="16" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
        <ellipse cx="40" cy="32" rx="8" ry="16" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
        <path d="M24 24V40M40 24V40" stroke="#F59E0B" strokeWidth="1.5"/>
      </svg>
    ),
    'Safety Gloves': (
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
        <path d="M16 28L20 16L28 18L32 12L36 18L44 16L48 28V52H16V28Z" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2"/>
        <path d="M28 28V44M32 24V46M36 28V44M40 32V42" stroke="#1D4ED8" strokeWidth="2"/>
      </svg>
    )
  };
  
  return icons[ppeName] || (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <circle cx="32" cy="32" r="20" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2"/>
    </svg>
  );
}