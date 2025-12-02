// frontend/src/components/supervisor/PermitDetailView.tsx
import { useEffect, useState } from 'react';
import { X, FileText, MapPin, Users, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { permitsAPI } from '../../services/api';
import type { Permit } from '../../types';

interface PermitDetailViewProps {
  permitId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PermitDetailView({ permitId, isOpen, onClose }: PermitDetailViewProps) {
  const [permit, setPermit] = useState<Permit | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && permitId) {
      loadPermitDetails();
    }
  }, [isOpen, permitId]);

  const loadPermitDetails = async () => {
    if (!permitId) return;
    
    setIsLoading(true);
    try {
      const response = await permitsAPI.getById(permitId);
      if (response.success && response.data) {
        setPermit(response.data);
      }
    } catch (error) {
      console.error('Error loading permit details:', error);
      alert('Failed to load permit details');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      'Draft': { label: 'Draft', className: 'bg-slate-100 text-slate-800' },
      'Pending_Approval': { label: 'Pending', className: 'bg-amber-100 text-amber-800' },
      'Active': { label: 'Active', className: 'bg-green-100 text-green-800' },
      'Extension_Requested': { label: 'Extended', className: 'bg-purple-100 text-purple-800' },
      'Closed': { label: 'Closed', className: 'bg-blue-100 text-blue-800' },
      'Cancelled': { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
      'Rejected': { label: 'Rejected', className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-slate-100 text-slate-800' };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-50">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {permit?.permit_serial || permit?.permit_number || `PTW-${permitId}`}
              </h2>
              <p className="text-sm text-slate-600">Permit Details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
              <p className="text-slate-600">Loading permit details...</p>
            </div>
          </div>
        ) : permit ? (
          <div className="p-6 space-y-6">
            {/* Status Bar */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50 border-slate-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-slate-600" />
                <span className="font-medium text-slate-900">Status:</span>
              </div>
              {getStatusBadge(permit.status)}
            </div>

            {/* Basic Information */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <FileText className="w-5 h-5" />
                  Basic Information
                </h3>
                
                <div>
                  <label className="text-sm font-medium text-slate-600">Permit Type</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {permit.permit_type?.split(',').map((type, idx) => (
                      <span key={idx} className="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                        {type.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">Work Location</label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <p className="text-slate-900">{permit.work_location || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">Work Description</label>
                  <p className="mt-1 text-slate-900">{permit.work_description || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <Calendar className="w-5 h-5" />
                  Schedule
                </h3>
                
                <div>
                  <label className="text-sm font-medium text-slate-600">Start Time</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <p className="text-slate-900">{formatDate(permit.start_time)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">End Time</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <p className="text-slate-900">{formatDate(permit.end_time)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">Site</label>
                  <p className="mt-1 text-slate-900">{permit.site_name || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Users className="w-5 h-5" />
                Team Members ({permit.team_members?.length || 0})
              </h3>
              
              {permit.team_members && permit.team_members.length > 0 ? (
                <div className="overflow-x-auto border rounded-lg border-slate-200">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-xs font-medium text-left text-slate-600">Name</th>
                        <th className="px-4 py-3 text-xs font-medium text-left text-slate-600">Company</th>
                        <th className="px-4 py-3 text-xs font-medium text-left text-slate-600">Role</th>
                        <th className="px-4 py-3 text-xs font-medium text-left text-slate-600">Badge ID</th>
                        <th className="px-4 py-3 text-xs font-medium text-left text-slate-600">Contact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {permit.team_members.map((member: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm text-slate-900">{member.worker_name}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{member.company_name || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{member.worker_role || 'Worker'}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{member.badge_id || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{member.phone || member.email || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No team members assigned</p>
              )}
            </div>

            {/* Hazards */}
            {permit.hazards && permit.hazards.length > 0 && (
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <AlertCircle className="w-5 h-5" />
                  Identified Hazards ({permit.hazards.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {permit.hazards.map((hazard: any, idx: number) => (
                    <span key={idx} className="px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full">
                      {hazard.hazard_name || hazard}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* PPE */}
            {permit.ppe && permit.ppe.length > 0 && (
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <CheckCircle className="w-5 h-5" />
                  Required PPE ({permit.ppe.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {permit.ppe.map((item: any, idx: number) => (
                    <span key={idx} className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                      {item.ppe_name || item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Receiver Information */}
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <h3 className="flex items-center gap-2 mb-3 text-lg font-semibold text-slate-900">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                Receiver Information
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-600">Receiver Name</label>
                  <p className="text-slate-900">{permit.receiver_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Receiver Contact</label>
                  <p className="text-slate-900">{permit.receiver_contact || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button
                onClick={onClose}
                variant="outline"
              >
                Close
              </Button>
              <Button
                onClick={() => window.print()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Print Permit
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-600">Permit not found</p>
          </div>
        )}
      </div>
    </div>
  );
}