// frontend/src/types/index.ts - UPDATED VERSION with PermitWithDetails
// This file includes ALL previous types PLUS the missing PermitWithDetails

// User Types
export interface User {
  id: number;
  login_id: string;
  full_name: string;
  email: string;
  role: 'Requester' | 'Approver_AreaManager' | 'Approver_Safety' | 'Admin';
  department?: string;
  signature_url?: string;
  created_at: string;
}

// Site Types
export interface Site {
  id: number;
  site_code: string;
  name: string;
  address?: string;
}

// Vendor Types
export interface Vendor {
  id: number;
  company_name: string;
  contact_person?: string;
  license_number?: string;
}

// Hazard Types
export interface Hazard {
  id: number;
  name: string;
  category: string;
  icon_url?: string;
}

// PPE Types
export interface PPE {
  id: number;
  name: string;
  icon_url?: string;
}

// Checklist Question Types
export interface ChecklistQuestion {
  id: number;
  permit_type: 'General' | 'Height' | 'Hot_Work' | 'Electrical' | 'Confined_Space';
  question_text: string;
  is_mandatory: boolean;
}

// Team Member Types WITH COMPANY NAME
export interface TeamMember {
  id: number;
  permit_id: number;
  worker_name: string;
  company_name: string;
  contact_number?: string;
  worker_role: 'Supervisor' | 'Fire_Watcher' | 'Entrant' | 'Worker' | 'Standby';
  badge_id?: string;
  is_qualified: boolean;
}

// Permit Types
export type PermitType = 'General' | 'Height' | 'Hot_Work' | 'Electrical' | 'Confined_Space';

export type PermitStatus = 
  | 'Draft'
  | 'Pending_Approval'
  | 'Active'
  | 'Extension_Requested'
  | 'Suspended'
  | 'Closed'
  | 'Cancelled'
  | 'Rejected';

export interface Permit {
  id: number;
  permit_serial: string;
  site_id: number;
  site_name?: string;
  site_code?: string;
  created_by_user_id: number;
  created_by_name?: string;
  created_by_email?: string;
  vendor_id?: number;
  vendor_name?: string;
  permit_type: PermitType;
  work_location: string;
  work_description: string;
  start_time: string;
  end_time: string;
  receiver_name: string;
  receiver_signature_path?: string;
  receiver_signed_at?: string;
  status: PermitStatus;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  
  // Related data
  team_members?: TeamMember[];
  hazards?: PermitHazard[];
  ppe?: PermitPPE[];
  checklist?: ChecklistResponse[];
  approvals?: PermitApproval[];
  extensions?: PermitExtension[];
  closure?: PermitClosure;
}

// PermitWithDetails - Extended version with all related data
export interface PermitWithDetails extends Permit {
  team_members: TeamMember[];
  hazards: PermitHazard[];
  ppe: PermitPPE[];
  checklist: ChecklistResponse[];
  approvals: PermitApproval[];
  extensions: PermitExtension[];
  closure?: PermitClosure;
}

// Permit Hazard
export interface PermitHazard {
  permit_id: number;
  hazard_id: number;
  name?: string;
  category?: string;
  icon_url?: string;
}

// Permit PPE
export interface PermitPPE {
  permit_id: number;
  ppe_id: number;
  name?: string;
  icon_url?: string;
}

// Checklist Response
export interface ChecklistResponse {
  id: number;
  permit_id: number;
  question_id: number;
  question_text?: string;
  permit_type?: PermitType;
  is_mandatory?: boolean;
  response: 'Yes' | 'No' | 'NA';
  remarks?: string;
}

// Permit Approval
export interface PermitApproval {
  id: number;
  permit_id: number;
  approver_user_id: number;
  approver_name?: string;
  approver_email?: string;
  role: 'Area_Manager' | 'Safety_Officer' | 'Site_Lead';
  status: 'Pending' | 'Approved' | 'Rejected';
  comments?: string;
  signature_path?: string;
  approved_at?: string;
}

// Permit Extension
export interface PermitExtension {
  id: number;
  permit_id: number;
  requested_by_user_id: number;
  requested_by_name?: string;
  requested_at: string;
  new_end_time: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approved_by_user_id?: number;
  approved_by_name?: string;
  approved_at?: string;
  rejection_reason?: string;
}

// Permit Closure
export interface PermitClosure {
  id: number;
  permit_id: number;
  closed_at: string;
  closed_by_user_id: number;
  closed_by_name?: string;
  housekeeping_done: boolean;
  tools_removed: boolean;
  locks_removed: boolean;
  area_restored: boolean;
  remarks?: string;
}

// Dashboard Statistics
export interface DashboardStats {
  by_status: Array<{
    status: PermitStatus;
    count: number;
  }>;
  by_type: Array<{
    permit_type: PermitType;
    count: number;
  }>;
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// Form Data for Creating Permit
export interface PermitFormData {
  // Basic Info
  category: PermitType | '';
  site_id: string;
  location: string;
  workDescription: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  
  // Workers
  selectedWorkers: number[];
  newWorkersList: NewWorkerForm[];
  
  // Hazards & Controls
  hazards: number[];
  otherHazards: string;
  controlMeasures: string;
  
  // PPE
  ppe: number[];
  
  // File
  swmsFile: File | null;
  
  // Signatures
  issuerSignature: string;
  
  // Requirements - ALL checklist responses
  checklistResponses: Record<number, 'Yes' | 'No' | 'NA'>;
  
  // Declaration
  declaration: boolean;
}

// New Worker Form Data WITH COMPANY NAME
export interface NewWorkerForm {
  name: string;
  company_name: string;
  phone: string;
  email: string;
  badge_id: string;
  role: string;
}

// Filter Types
export interface PermitFilters {
  site_id?: number;
  status?: PermitStatus;
  permit_type?: PermitType;
  start_date?: string;
  end_date?: string;
}

// Component Props Types
export interface CreatePTWProps {
  onBack: () => void;
}

export interface PTWDetailsProps {
  ptwId: string;
  onBack: () => void;
}

export interface DashboardProps {
  onNavigate: (page: string) => void;
  onPTWSelect?: (id: string) => void;
}

// Utility Types
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  key: string;
  order: SortOrder;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}