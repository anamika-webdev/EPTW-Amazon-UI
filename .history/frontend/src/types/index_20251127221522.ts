// src/types/index.ts

// User Types
export type UserRole = 'Requester' | 'Approver_AreaManager' | 'Approver_Safety' | 'Admin';

export interface User {
  id: number;
  login_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  department: string | null;
  signature_url: string | null;
  created_at: string;
}

// Site Types
export interface Site {
  id: number;
  site_code: string;
  name: string;
  address: string | null;
}

// Vendor Types
export interface Vendor {
  id: number;
  company_name: string;
  contact_person: string | null;
  license_number: string | null;
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
  created_by_user_id: number;
  vendor_id: number | null;
  permit_type: PermitType;
  work_location: string;
  work_description: string;
  start_time: string;
  end_time: string;
  receiver_name: string;
  receiver_signature_path: string | null;
  receiver_signed_at: string | null;
  status: PermitStatus;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined data
  site?: Site;
  created_by?: User;
  vendor?: Vendor;
  hazards?: MasterHazard[];
  ppe?: MasterPPE[];
  team_members?: PermitTeamMember[];
  approvals?: PermitApproval[];
}

// Hazard Types
export interface MasterHazard {
  id: number;
  name: string;
  category: string;
  icon_url: string | null;
}

// PPE Types
export interface MasterPPE {
  id: number;
  name: string;
  icon_url: string | null;
}

// Team Member Types
export type WorkerRole = 'Supervisor' | 'Fire_Watcher' | 'Entrant' | 'Worker' | 'Standby';

export interface PermitTeamMember {
  id: number;
  permit_id: number;
  worker_name: string;
  worker_role: WorkerRole;
  badge_id: string | null;
  is_qualified: boolean;
  company_name?: string;
  phone?: string;
  email?: string;
}

// Approval Types
export type ApproverRole = 'Area_Manager' | 'Safety_Officer' | 'Site_Lead';
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

export interface PermitApproval {
  id: number;
  permit_id: number;
  approver_user_id: number;
  role: ApproverRole;
  status: ApprovalStatus;
  comments: string | null;
  signature_path: string | null;
  approved_at: string | null;
  approver?: User;
}

// Checklist Types
export interface MasterChecklistQuestion {
  id: number;
  permit_type: PermitType;
  question_text: string;
  is_mandatory: boolean;
}

export type ChecklistResponse = 'Yes' | 'No' | 'NA';

export interface PermitChecklistResponse {
  id: number;
  permit_id: number;
  question_id: number;
  response: ChecklistResponse;
  remarks: string | null;
  question?: MasterChecklistQuestion;
}

// Gas Reading Types
export type GasReadingResult = 'Safe' | 'Unsafe';

export interface PermitGasReading {
  id: number;
  permit_id: number;
  reading_time: string;
  oxygen_percent: number;
  lel_percent: number;
  h2s_ppm: number;
  co_ppm: number;
  tested_by: string;
  result: GasReadingResult;
}

// LOTO Types
export interface PermitLOTOIsolation {
  id: number;
  permit_id: number;
  equipment_name: string;
  tag_number: string;
  lock_applied_by: string;
  lock_date: string;
  isolation_verified_by: string | null;
}

// Closure Types
export interface PermitClosure {
  id: number;
  permit_id: number;
  closed_at: string;
  closed_by_user_id: number;
  housekeeping_done: boolean;
  tools_removed: boolean;
  locks_removed: boolean;
  area_restored: boolean;
  remarks: string | null;
  closed_by?: User;
}

// Extension Types
export interface PermitExtension {
  id: number;
  permit_id: number;
  original_end_time: string;
  requested_end_time: string;
  reason: string;
  approved_by_user_id: number | null;
  approval_status: ApprovalStatus;
  created_at: string;
  approved_by?: User;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Data Types for Creating Permits
export interface CreatePermitFormData {
  site_id: number;
  permit_type: PermitType;
  work_location: string;
  work_description: string;
  start_time: string;
  end_time: string;
  receiver_name: string;
  receiver_contact: string;
  vendor_id?: number;
  hazard_ids: number[];
  ppe_ids: number[];
  team_members: {
    worker_name: string;
    worker_role: WorkerRole;
    badge_id?: string;
    company_name?: string;
    phone?: string;
    email?: string;
  }[];
  control_measures: string;
  other_hazards?: string;
  checklist_responses: {
    question_id: number;
    response: ChecklistResponse;
    remarks?: string;
  }[];
}

// Dashboard Statistics
export interface SupervisorDashboardStats {
  total_permits: number;
  initiated_permits: number;
  approved_permits: number;
  in_progress_permits: number;
  closed_permits: number;
  total_workers: number;
}