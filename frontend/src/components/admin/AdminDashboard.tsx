import { Building2, Users, UserCheck, FileText } from 'lucide-react';
import { StatCard } from '../shared/StatCard';
import { StatusBadge } from '../shared/StatusBadge';
import { mockSites, mockSupervisors, mockWorkers, mockPTWs, getPTWsByCategory } from '../../lib/mockData';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { CurrentPage } from '../../App';

interface AdminDashboardProps {
  onNavigate: (page: CurrentPage) => void;
  onPTWSelect: (ptwId: string) => void;
}

export function AdminDashboard({ onNavigate, onPTWSelect }: AdminDashboardProps) {
  const categoryData = getPTWsByCategory();
  const recentPTWs = mockPTWs.slice(0, 5);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-slate-900 mb-2">Admin Dashboard</h1>
        <p className="text-slate-600">Overview of system operations and statistics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button onClick={() => onNavigate('site-management')} className="text-left">
          <StatCard
            title="Total Sites"
            value={mockSites.length}
            icon={Building2}
            color="blue"
            trend={{ value: '2 new this month', isPositive: true }}
          />
        </button>
        <div>
          <StatCard
            title="Total Workers"
            value={mockWorkers.length}
            icon={Users}
            color="green"
            trend={{ value: '3 active today', isPositive: true }}
          />
        </div>
        <div>
          <StatCard
            title="Total Supervisors"
            value={mockSupervisors.length}
            icon={UserCheck}
            color="purple"
          />
        </div>
        <button onClick={() => onNavigate('ptw-all-permits')} className="text-left">
          <StatCard
            title="Total PTW Issued"
            value={mockPTWs.length}
            icon={FileText}
            color="orange"
            trend={{ value: '12% increase', isPositive: true }}
          />
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* PTW by Category Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-slate-900 mb-6">PTW by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent PTWs */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-slate-900">Recent PTWs</h3>
            <button
              onClick={() => onNavigate('ptw-all-permits')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentPTWs.map((ptw) => (
              <button
                key={ptw.id}
                onClick={() => onPTWSelect(ptw.id)}
                className="w-full text-left p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-slate-900">{ptw.ptwNumber}</p>
                    <p className="text-sm text-slate-600">{ptw.workDescription}</p>
                  </div>
                  <StatusBadge status={ptw.status} />
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>📍 {ptw.site}</span>
                  <span>👤 {ptw.issuer}</span>
                  <span>📅 {ptw.startDate}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
