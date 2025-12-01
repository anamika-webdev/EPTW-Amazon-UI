// frontend/src/components/supervisor/CreatePTW.tsx - FIXED VERSION
// This file fixes: sites loading, workers loading, approvers loading, and form data errors

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import { Upload, FileText } from 'lucide-react'; // Add to existing imports
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
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CreatePTWProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function CreatePTW({ onBack, onSuccess }: CreatePTWProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [workerSelectionMode, setWorkerSelectionMode] = useState<'existing' | 'new'>('existing');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Master data from ADMIN DATABASE
  const [sites, setSites] = useState<Site[]>([]);
  const [hazards, setHazards] = useState<MasterHazard[]>([]);
  const [ppeItems, setPPEItems] = useState<MasterPPE[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [checklistQuestions, setChecklistQuestions] = useState<MasterChecklistQuestion[]>([]);

  // Approvers by role (from ADMIN DATABASE)
  const [areaManagers, setAreaManagers] = useState<User[]>([]);
  const [safetyOfficers, setSafetyOfficers] = useState<User[]>([]);
  const [siteLeaders, setSiteLeaders] = useState<User[]>([]);

  const [newWorkers, setNewWorkers] = useState<Array<{ 
    name: string; 
    phone: string; 
    email: string; 
    companyName: string;
    role: WorkerRole;
  }>>([]);

  const [formData, setFormData] = useState({
    // Multiple categories support
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
    
    // Issued To
    issuedToName: '',
    issuedToContact: '',
    
    // Workers
    selectedWorkers: [] as number[],
    
    // Hazards & PPE
    selectedHazards: [] as number[],
    selectedPPE: [] as number[],
    otherHazards: '',
    controlMeasures: '',
    
    // Approvers (by role)
    areaManagerId: 0,
    safetyOfficerId: 0,
    siteLeaderId: 0,
    
    // Checklist
    checklistResponses: {} as Record<number, ChecklistResponse>,
    checklistRemarks: {} as Record<number, string>,
    checklistTextResponses: {} as Record<number, string>,
    
    // Permit Initiator (auto-filled from logged-in user)
    permitInitiator: '',
    permitInitiatorContact: '',
    
    // SWMS & Declaration
    swmsFile: null as File | null,
    swmsText: '',
    swmsMode: 'file' as 'file' | 'text',
  });

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  // Check if site leader approval is required
  const requiresSiteLeaderApproval = formData.categories.some(
    cat => cat === 'Confined_Space' || cat === 'Height'
  );

  // ========== DATA LOADING ==========
  
  useEffect(() => {
    loadAllMasterData();
    loadPermitInitiator();
  }, []);

  useEffect(() => {
    // Load checklist questions for all categories
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
      console.log('🔄 Loading master data from admin database...');

      // Load all data in parallel
      const [
        sitesRes,
        hazardsRes,
        ppeRes,
        workersRes,
        vendorsRes,
        areaManagersRes,
        safetyOfficersRes,
        siteLeadersRes
      ] = await Promise.all([
        sitesAPI.getAll().catch(err => {
          console.error('❌ Sites API error:', err);
          return { success: false, data: [] };
        }),
        masterDataAPI.getHazards().catch(err => {
          console.error('❌ Hazards API error:', err);
          return { success: false, data: [] };
        }),
        masterDataAPI.getPPE().catch(err => {
          console.error('❌ PPE API error:', err);
          return { success: false, data: [] };
        }),
        usersAPI.getWorkers().catch(err => {
          console.error('❌ Workers API error:', err);
          return { success: false, data: [] };
        }),
        vendorsAPI.getAll().catch(err => {
          console.error('❌ Vendors API error:', err);
          return { success: false, data: [] };
        }),
        // Fetch approvers by role
        usersAPI.getAll('Approver_AreaManager').catch(err => {
          console.error('❌ Area Managers API error:', err);
          return { success: false, data: [] };
        }),
        usersAPI.getAll('Approver_Safety').catch(err => {
          console.error('❌ Safety Officers API error:', err);
          return { success: false, data: [] };
        }),
        usersAPI.getAll('Approver_SiteLeader').catch(err => {
          console.error('❌ Site Leaders API error:', err);
          return { success: false, data: [] };
        })
      ]);

      // Set all data
      if (sitesRes.success && sitesRes.data) {
        console.log('✅ Sites loaded:', sitesRes.data.length);
        setSites(sitesRes.data);
      }
      
      if (hazardsRes.success && hazardsRes.data) {
        console.log('✅ Hazards loaded:', hazardsRes.data.length);
        setHazards(hazardsRes.data);
      }
      
      if (ppeRes.success && ppeRes.data) {
        console.log('✅ PPE loaded:', ppeRes.data.length);
        setPPEItems(ppeRes.data);
      }
      
      if (workersRes.success && workersRes.data) {
        console.log('✅ Workers loaded:', workersRes.data.length);
        setWorkers(workersRes.data);
      }
      
      if (vendorsRes.success && vendorsRes.data) {
        console.log('✅ Vendors loaded:', vendorsRes.data.length);
        setVendors(vendorsRes.data);
      }

      if (areaManagersRes.success && areaManagersRes.data) {
        console.log('✅ Area Managers loaded:', areaManagersRes.data.length);
        setAreaManagers(areaManagersRes.data);
      }

      if (safetyOfficersRes.success && safetyOfficersRes.data) {
        console.log('✅ Safety Officers loaded:', safetyOfficersRes.data.length);
        setSafetyOfficers(safetyOfficersRes.data);
      }

      if (siteLeadersRes.success && siteLeadersRes.data) {
        console.log('✅ Site Leaders loaded:', siteLeadersRes.data.length);
        setSiteLeaders(siteLeadersRes.data);
      }

      // Check if critical data is missing
      if (!sitesRes.success || !sitesRes.data || sitesRes.data.length === 0) {
        setLoadError('No sites available. Please add sites in Admin portal first.');
      } else if (!workersRes.success || !workersRes.data || workersRes.data.length === 0) {
        setLoadError('No workers available. Please add workers in Admin portal first.');
      } else if (!areaManagersRes.success || !areaManagersRes.data || areaManagersRes.data.length === 0) {
        setLoadError('No Area Managers found. Please add Area Managers in Admin portal first.');
      } else if (!safetyOfficersRes.success || !safetyOfficersRes.data || safetyOfficersRes.data.length === 0) {
        setLoadError('No Safety Officers found. Please add Safety Officers in Admin portal first.');
      }

    } catch (error: any) {
      console.error('❌ Critical error loading master data:', error);
      setLoadError(error.message || 'Failed to load form data. Please refresh the page.');
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
      console.error('❌ Error loading checklist questions:', error);
    }
  };

  // ========== HANDLERS ==========

  const handleCategoryToggle = (category: PermitType) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleNext = () => {
    // Validation
    if (currentStep === 1) {
      if (formData.categories.length === 0) {
        alert('Please select at least one permit category');
        return;
      }
      if (!formData.site_id) {
        alert('Please select a site');
        return;
      }
      if (!formData.location.trim()) {
        alert('Please enter work location');
        return;
      }
      if (!formData.workDescription.trim()) {
        alert('Please enter work description');
        return;
      }
    }

    if (currentStep === 5) {
      // Approver validation
      if (!formData.areaManagerId) {
        alert('Please select an Area Manager');
        return;
      }
      if (!formData.safetyOfficerId) {
        alert('Please select a Safety Officer');
        return;
      }
      if (requiresSiteLeaderApproval && !formData.siteLeaderId) {
        alert('This permit requires Site Leader approval. Please select a Site Leader.');
        return;
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.declaration) {
      alert('Please accept the declaration to submit');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare team members
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
          phone: worker.phone,
          email: worker.email,
        })),
      ];

      // Prepare checklist responses
      const checklistResponses = Object.entries(formData.checklistResponses).map(([questionId, response]) => ({
        question_id: parseInt(questionId),
        response,
        remarks: formData.checklistRemarks[parseInt(questionId)] || undefined,
      }));

      // Add text-based responses
      Object.entries(formData.checklistTextResponses).forEach(([questionId, textValue]) => {
        if (textValue) {
          checklistResponses.push({
            question_id: parseInt(questionId),
            response: 'Yes' as ChecklistResponse,
            remarks: textValue,
          });
        }
      });

      // Prepare approvers array
      const approvers = [
        { role: 'Area_Manager', user_id: formData.areaManagerId },
        { role: 'Safety_Officer', user_id: formData.safetyOfficerId }
      ];

      if (requiresSiteLeaderApproval) {
        approvers.push({ role: 'Site_Leader', user_id: formData.siteLeaderId });
      }

      // Submit permit
      const permitData = {
        site_id: formData.site_id,
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
      };

      console.log('📤 Submitting permit:', permitData);

      const response = await permitsAPI.create(permitData);

      if (response.success) {
        alert('PTW Created Successfully! Permit ID: ' + response.data.permit_number);
        onSuccess();
      } else {
        throw new Error(response.message || 'Failed to create permit');
      }
    } catch (error: any) {
      console.error('❌ Submit error:', error);
      alert('Error: ' + (error.message || 'Failed to create PTW. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========== RENDER ==========

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-green-600 rounded-full animate-spin"></div>
          <p className="text-slate-600">Loading form data from admin database...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert className="max-w-md border-red-200 bg-red-50">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong className="font-semibold">Failed to load form data</strong>
            <p className="mt-2">{loadError}</p>
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={loadAllMasterData} 
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                Retry
              </Button>
              <Button 
                onClick={onBack} 
                size="sm" 
                variant="outline"
              >
                Go Back
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Permit to Work</h1>
          <p className="text-slate-600">Step {currentStep} of {totalSteps}</p>
        </div>
        <Button onClick={onBack} variant="outline">
          Cancel
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="h-2 overflow-hidden bg-gray-200 rounded-full">
        <div 
          className="h-full transition-all duration-300 bg-green-600"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Content */}
      <div className="p-6 bg-white border rounded-lg shadow-sm border-slate-200">
        
        {/* STEP 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">Basic Information</h2>

            {/* Category Selection */}
            <div>
              <Label>Permit Categories *</Label>
              <div className="grid grid-cols-2 gap-3 mt-2 md:grid-cols-3">
                {(['General', 'Hot_Work', 'Electrical', 'Height', 'Confined_Space'] as PermitType[]).map(cat => (
                  <label key={cat} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <Checkbox
                      checked={formData.categories.includes(cat)}
                      onCheckedChange={() => handleCategoryToggle(cat)}
                    />
                    <span className="text-sm">{cat.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
              {(formData.categories.includes('Confined_Space') || formData.categories.includes('Height')) && (
                <Alert className="mt-3 border-amber-200 bg-amber-50">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <AlertDescription className="text-sm text-amber-800">
                    This permit requires Site Leader approval in addition to Area Manager and Safety Officer.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Site Selection */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="site">Site *</Label>
                <Select 
                  value={formData.site_id.toString()} 
                  onValueChange={(value) => setFormData({ ...formData, site_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select site" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites.map((site) => (
                      <SelectItem key={site.id} value={site.id.toString()}>
                        {site.name} - {site.site_code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Work Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Building A, Floor 3"
                />
              </div>
            </div>

            {/* Issue Department */}
            <div>
              <Label htmlFor="issueDepartment">Issue Department</Label>
              <Input
                id="issueDepartment"
                value={formData.issueDepartment}
                onChange={(e) => setFormData({ ...formData, issueDepartment: e.target.value })}
                placeholder="e.g., Maintenance, Operations, Engineering"
              />
            </div>

            {/* Work Description */}
            <div>
              <Label htmlFor="workDescription">Work Description *</Label>
              <Textarea
                id="workDescription"
                value={formData.workDescription}
                onChange={(e) => setFormData({ ...formData, workDescription: e.target.value })}
                placeholder="Describe the work to be performed..."
                rows={4}
              />
            </div>

            {/* Date & Time */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="startDate">Start Date & Time</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="endDate">End Date & Time</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Receiver & Workers - SIMPLIFIED */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">Receiver & Workers</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Receiver Name</Label>
                <Input
                  value={formData.issuedToName}
                  onChange={(e) => setFormData({ ...formData, issuedToName: e.target.value })}
                  placeholder="Name of person receiving permit"
                />
              </div>
              <div>
                <Label>Receiver Contact</Label>
                <Input
                  value={formData.issuedToContact}
                  onChange={(e) => setFormData({ ...formData, issuedToContact: e.target.value })}
                  placeholder="Phone or email"
                />
              </div>
            </div>

            <div>
              <Label>Select Workers from Database</Label>
              <div className="mt-2 space-y-2 overflow-y-auto max-h-96">
                {workers.map(worker => (
                  <label key={worker.id} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-slate-50">
                    <Checkbox
                      checked={formData.selectedWorkers.includes(worker.id)}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({
                          ...prev,
                          selectedWorkers: checked
                            ? [...prev.selectedWorkers, worker.id]
                            : prev.selectedWorkers.filter(id => id !== worker.id)
                        }));
                      }}
                    />
                    <div>
                      <p className="font-medium">{worker.full_name}</p>
                      <p className="text-xs text-slate-600">{worker.login_id} • {worker.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Hazards & PPE - SIMPLIFIED */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">Hazards & Safety</h2>

            <div>
              <Label>Identified Hazards</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {hazards.map(hazard => (
                  <label key={hazard.id} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-slate-50">
                    <Checkbox
                      checked={formData.selectedHazards.includes(hazard.id)}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({
                          ...prev,
                          selectedHazards: checked
                            ? [...prev.selectedHazards, hazard.id]
                            : prev.selectedHazards.filter(id => id !== hazard.id)
                        }));
                      }}
                    />
                    <span className="text-sm">{hazard.hazard_name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label>Required PPE</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {ppeItems.map(ppe => (
                  <label key={ppe.id} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-slate-50">
                    <Checkbox
                      checked={formData.selectedPPE.includes(ppe.id)}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({
                          ...prev,
                          selectedPPE: checked
                            ? [...prev.selectedPPE, ppe.id]
                            : prev.selectedPPE.filter(id => id !== ppe.id)
                        }));
                      }}
                    />
                    <span className="text-sm">{ppe.ppe_name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label>Control Measures</Label>
              <Textarea
                value={formData.controlMeasures}
                onChange={(e) => setFormData({ ...formData, controlMeasures: e.target.value })}
                placeholder="Describe safety measures and controls..."
                rows={4}
              />
            </div>
          </div>
        )}

        {/* STEP 4: Checklist - SIMPLIFIED */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">Safety Checklist</h2>
            
            {checklistQuestions.length === 0 ? (
              <p className="text-slate-600">No checklist questions available.</p>
            ) : (
              <div className="space-y-4">
                {checklistQuestions.map((question, index) => (
                  <div key={question.id} className="p-4 border rounded-lg">
                    <p className="font-medium">{index + 1}. {question.question_text}</p>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          checked={formData.checklistResponses[question.id] === 'Yes'}
                          onChange={() => setFormData(prev => ({
                            ...prev,
                            checklistResponses: { ...prev.checklistResponses, [question.id]: 'Yes' }
                          }))}
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          checked={formData.checklistResponses[question.id] === 'No'}
                          onChange={() => setFormData(prev => ({
                            ...prev,
                            checklistResponses: { ...prev.checklistResponses, [question.id]: 'No' }
                          }))}
                        />
                        <span>No</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          checked={formData.checklistResponses[question.id] === 'N/A'}
                          onChange={() => setFormData(prev => ({
                            ...prev,
                            checklistResponses: { ...prev.checklistResponses, [question.id]: 'N/A' }
                          }))}
                        />
                        <span>N/A</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 5: Approvers - FROM ADMIN DB */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">Approval Workflow</h2>

            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-800">
                All approvers are loaded from the Admin database. 
                {requiresSiteLeaderApproval 
                  ? ' This permit requires 3 approvals: Area Manager, Safety Officer, and Site Leader.'
                  : ' This permit requires 2 approvals: Area Manager and Safety Officer.'}
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              {/* Area Manager */}
              <div>
                <Label>Area Manager * (Loaded from Admin DB)</Label>
                <Select 
                  value={formData.areaManagerId.toString()}
                  onValueChange={(value) => setFormData({ ...formData, areaManagerId: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Area Manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {areaManagers.length === 0 ? (
                      <SelectItem value="0" disabled>No Area Managers available</SelectItem>
                    ) : (
                      areaManagers.map(manager => (
                        <SelectItem key={manager.id} value={manager.id.toString()}>
                          {manager.full_name} ({manager.login_id})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Safety Officer */}
              <div>
                <Label>Safety Officer * (Loaded from Admin DB)</Label>
                <Select 
                  value={formData.safetyOfficerId.toString()}
                  onValueChange={(value) => setFormData({ ...formData, safetyOfficerId: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Safety Officer" />
                  </SelectTrigger>
                  <SelectContent>
                    {safetyOfficers.length === 0 ? (
                      <SelectItem value="0" disabled>No Safety Officers available</SelectItem>
                    ) : (
                      safetyOfficers.map(officer => (
                        <SelectItem key={officer.id} value={officer.id.toString()}>
                          {officer.full_name} ({officer.login_id})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Site Leader (conditional) */}
              {requiresSiteLeaderApproval && (
                <div>
                  <Label>Site Leader * (Required for Height/Confined Space)</Label>
                  <Select 
                    value={formData.siteLeaderId.toString()}
                    onValueChange={(value) => setFormData({ ...formData, siteLeaderId: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Site Leader" />
                    </SelectTrigger>
                    <SelectContent>
                      {siteLeaders.length === 0 ? (
                        <SelectItem value="0" disabled>No Site Leaders available</SelectItem>
                      ) : (
                        siteLeaders.map(leader => (
                          <SelectItem key={leader.id} value={leader.id.toString()}>
                            {leader.full_name} ({leader.login_id})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 6: Review & Submit */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">Review & Submit</h2>

            <div className="p-4 space-y-3 border rounded-lg bg-slate-50">
              <div>
                <p className="text-sm text-slate-500">Categories</p>
                <p className="text-slate-900">{formData.categories.join(', ')}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Site</p>
                <p className="text-slate-900">{sites.find(s => s.id === formData.site_id)?.name || 'Not selected'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Workers</p>
                <p className="text-slate-900">{formData.selectedWorkers.length} selected</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Approvers</p>
                <p className="text-sm text-slate-700">
                  Area Manager: {areaManagers.find(a => a.id === formData.areaManagerId)?.full_name || 'Not selected'}
                  <br />
                  Safety Officer: {safetyOfficers.find(s => s.id === formData.safetyOfficerId)?.full_name || 'Not selected'}
                  {requiresSiteLeaderApproval && (
                    <>
                      <br />
                      Site Leader: {siteLeaders.find(l => l.id === formData.siteLeaderId)?.full_name || 'Not selected'}
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="p-4 border rounded-lg border-slate-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={formData.declaration}
                  onCheckedChange={(checked) => setFormData({ ...formData, declaration: checked as boolean })}
                />
                <div>
                  <p className="text-sm font-medium text-slate-900">Declaration</p>
                  <p className="mt-1 text-sm text-slate-600">
                    I confirm that all information provided is accurate and complete. All necessary safety measures 
                    have been identified and will be implemented.
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          onClick={handleBack}
          variant="outline"
          disabled={currentStep === 1 || isSubmitting}
        >
          Previous
        </Button>
        
        {currentStep < totalSteps ? (
          <Button onClick={handleNext} disabled={isSubmitting}>
            Next
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit}
            disabled={!formData.declaration || isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? 'Submitting...' : 'Submit PTW'}
          </Button>
        )}
      </div>
    </div>
  );
}