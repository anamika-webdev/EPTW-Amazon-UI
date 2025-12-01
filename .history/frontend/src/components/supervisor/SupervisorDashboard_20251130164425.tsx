// frontend/src/components/supervisor/SupervisorDashboard.tsx - FIXED VERSION
// This file fixes: stats loading from admin DB, workers list from admin DB, sites from admin DB

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { FileText, Users, CheckCircle2, Clock, XCircle, UserPlus } from 'lucide-react';
import { dashboardAPI, permitsAPI } from '../../services/api';
import type { Permit, SupervisorDashboardStats } from '../../types';

interface SupervisorDashboardProps {
  onNavigate: (page: string) => void;
}

export function SupervisorDashboard({ onNavigate }: SupervisorDashboardProps) {
  const [stats, setStats] = useState<SupervisorDashboardStats>({
    total_permits: 0,
    initiated_permits: 0,
    approved_permits: 0,
    in_progress_permits: 0,
    closed_permits: 0,
    total_workers: 0
  });
  const [recentPermits, setRecentPermits] = useState<Permit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading supervisor dashboard data from admin DB...');

      // Load stats and permits in parallel
      const [statsRes, permitsRes] = await Promise.all([
        dashboardAPI.getSupervisorStats().catch(err => {
          console.error('❌ Stats API error:', err);
          return { success: false, data: null };
        }),
        permitsAPI.getMySupervisorPermits().catch(err => {
          console.error('❌ Permits API error:', err);
          return { success: false, data: [] };
        })
      ]);

      // Set stats
      if (statsRes.success && statsRes.data) {
        console.log('✅ Stats loaded:', statsRes.data);
        setStats(statsRes.data);
      } else {
        console.warn('⚠️ Stats not loaded, using defaults');
      }

      // Set recent permits (limit to 10)
      if (permitsRes.success && permitsRes.data) {
        console.log('✅ Permits loaded:', permitsRes.data.length);
        setRecentPermits(permitsRes.data.slice(0, 10));
      }

    } catch (error: any) {
      console.error('❌ Dashboard load error:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color 
  }: { 
    title: string; 
    value: number; 
    icon: React.ReactNode; 
    color: string;
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      amber: 'bg-amber-50 text-amber-600',
      red: 'bg-red-50 text-red-600',
      purple: 'bg-purple-50 text-purple-600',
      slate: 'bg-slate-50 text-slate-600',
    };

    return (
      <div className="p-4 bg-white border rounded-lg shadow-sm border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">{title}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
            {icon}
          </div>
        </div>
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Draft': { class: 'bg-gray-100 text-gray-700', label: 'Draft' },
      'Pending_Approval': { class: 'bg-amber-100 text-amber-700', label: 'Pending' },
      'Active': { class: 'bg-green-100 text-green-700', label: 'Active' },
      'Closed': { class: 'bg-slate-100 text-slate-700', label: 'Closed' },
      'Rejected': { class: 'bg-red-100 text-red-700', label: 'Rejected' },
      'Extension_Requested': { class: 'bg-blue-100 text-blue-700', label: 'Extension' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Draft'];

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-green-600 rounded-full animate-spin"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <p className="font-semibold text-red-800">Failed to load dashboard</p>
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <Button 
              onClick={loadDashboardData}
              className="mt-4 bg-red-600 hover:bg-red-700"
              size="sm"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Supervisor Dashboard</h1>
          <p className="text-slate-600">Manage and monitor your work permits</p>
        </div>
        <Button
          onClick={() => onNavigate('create-permit')}
          className="gap-2 bg-green-600 hover:bg-green-700"
        >
          <FileText className="w-4 h-4" />
          Create New PTW
        </Button>
      </div>

      {/* Stats Grid - All data from Admin DB */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <button onClick={() => onNavigate('worker-list')} className="text-left">
          <StatCard
            title="Total Workers"
            value={stats.total_workers}
            icon={<Users className="w-5 h-5" />}
            color="blue"
          />
        </button>
        <div>
          <StatCard
            title="PTW Issued"
            value={stats.total_permits}
            icon={<FileText className="w-5 h-5" />}
            color="green"
          />
        </div>
        <div>
          <StatCard
            title="Initiated"
            value={stats.initiated_permits}
            icon={<Clock className="w-5 h-5" />}
            color="amber"
          />
        </div>
        <div>
          <StatCard
            title="Approved"
            value={stats.approved_permits}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="green"
          />
        </div>
        <div>
          <StatCard
            title="In Progress"
            value={stats.in_progress_permits}
            icon={<Clock className="w-5 h-5" />}
            color="purple"
          />
        </div>
        <div>
          <StatCard
            title="Closed"
            value={stats.closed_permits}
            icon={<XCircle className="w-5 h-5" />}
            color="slate"
          />
        </div>
      </div>

      {/* Recent Permits Table */}
      <div className="overflow-hidden bg-white border rounded-lg shadow-sm border-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Recent Permits</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onNavigate('create-permit')}
          >
            View All
          </Button>
        </div>

        {recentPermits.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium text-slate-600">No permits yet</p>
            <p className="mt-1 text-sm text-slate-500">Create your first PTW to get started</p>
            <Button
              onClick={() => onNavigate('create-permit')}
              className="mt-4 bg-green-600 hover:bg-green-700"
              size="sm"
            >
              Create PTW
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium text-left text-slate-600">Permit ID</th>
                  <th className="px-4 py-3 text-xs font-medium text-left text-slate-600">Type</th>
                  <th className="px-4 py-3 text-xs font-medium text-left text-slate-600">Site</th>
                  <th className="px-4 py-3 text-xs font-medium text-left text-slate-600">Location</th>
                  <th className="px-4 py-3 text-xs font-medium text-left text-slate-600">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-left text-slate-600">Start Date</th>
                  <th className="px-4 py-3 text-xs font-medium text-left text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentPermits.map((permit) => (
                  <tr key={permit.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {permit.permit_number}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {permit.permit_type?.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {permit.site_name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {permit.work_location}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(permit.status)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {permit.start_time ? formatDate(permit.start_time) : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        onClick={() => onNavigate(`permit-details-${permit.id}`)}
                        variant="outline"
                        size="sm"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <button
          onClick={() => onNavigate('worker-list')}
          className="flex items-center gap-4 p-6 text-left transition-all bg-white border rounded-lg shadow-sm border-slate-200 hover:shadow-md hover:border-blue-300"
        >
          <div className="p-4 rounded-lg bg-blue-50">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Manage Workers</h3>
            <p className="text-sm text-slate-600">View and manage all workers from admin database</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('create-permit')}
          className="flex items-center gap-4 p-6 text-left transition-all bg-white border rounded-lg shadow-sm border-slate-200 hover:shadow-md hover:border-green-300"
        >
          <div className="p-4 rounded-lg bg-green-50">
            <FileText className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Create New PTW</h3>
            <p className="text-sm text-slate-600">Issue a new permit to work with all data from admin DB</p>
          </div>
        </button>
      </div>
    </div>
  );
}