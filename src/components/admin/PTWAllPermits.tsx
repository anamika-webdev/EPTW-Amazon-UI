import { useState } from 'react';
import { Filter, Calendar } from 'lucide-react';
import { StatusBadge, PTWStatus } from '../shared/StatusBadge';
import { mockPTWs, PTW, PTWCategory } from '../../lib/mockData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface PTWAllPermitsProps {
  onPTWSelect: (ptwId: string) => void;
}

export function PTWAllPermits({ onPTWSelect }: PTWAllPermitsProps) {
  const [permits, setPermits] = useState<PTW[]>(mockPTWs);
  const [filterSite, setFilterSite] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredPermits = permits.filter(permit => {
    if (filterSite !== 'all' && permit.site !== filterSite) return false;
    if (filterStatus !== 'all' && permit.status !== filterStatus) return false;
    if (filterCategory !== 'all' && permit.category !== filterCategory) return false;
    return true;
  });

  const getCategoryBadge = (category: PTWCategory) => {
    const colors = {
      'General': 'bg-blue-100 text-blue-700',
      'Height': 'bg-purple-100 text-purple-700',
      'Electrical': 'bg-yellow-100 text-yellow-700',
      'Hot Work': 'bg-red-100 text-red-700',
      'Confined Space': 'bg-orange-100 text-orange-700',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs ${colors[category]}`}>
        {category}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 mb-2">All Permits</h1>
        <p className="text-slate-600">View and manage all PTW permits across all sites</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-slate-600" />
          <h3 className="text-slate-900">Filters</h3>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm text-slate-600 mb-2 block">Site</label>
            <Select value={filterSite} onValueChange={setFilterSite}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sites</SelectItem>
                <SelectItem value="Mumbai Data Center">Mumbai Data Center</SelectItem>
                <SelectItem value="Bangalore Tech Park">Bangalore Tech Park</SelectItem>
                <SelectItem value="Delhi Telecom Hub">Delhi Telecom Hub</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-2 block">Status</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-2 block">Category</label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Height">Height</SelectItem>
                <SelectItem value="Electrical">Electrical</SelectItem>
                <SelectItem value="Hot Work">Hot Work</SelectItem>
                <SelectItem value="Confined Space">Confined Space</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-2 block">Date Range</label>
            <button className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
              <Calendar className="w-4 h-4 text-slate-600" />
              <span className="text-sm text-slate-600">Select dates</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-slate-600">
          Showing <span className="text-slate-900">{filteredPermits.length}</span> permits
        </p>
      </div>

      {/* Permits Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm text-slate-600">PTW Number</th>
                <th className="px-6 py-4 text-left text-sm text-slate-600">Category</th>
                <th className="px-6 py-4 text-left text-sm text-slate-600">Site & Location</th>
                <th className="px-6 py-4 text-left text-sm text-slate-600">Work Description</th>
                <th className="px-6 py-4 text-left text-sm text-slate-600">Issuer</th>
                <th className="px-6 py-4 text-left text-sm text-slate-600">Date</th>
                <th className="px-6 py-4 text-left text-sm text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredPermits.map((permit) => (
                <tr
                  key={permit.id}
                  onClick={() => onPTWSelect(permit.id)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="text-slate-900">{permit.ptwNumber}</p>
                    <p className="text-xs text-slate-500">Created {permit.createdDate}</p>
                  </td>
                  <td className="px-6 py-4">
                    {getCategoryBadge(permit.category)}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-900 text-sm">{permit.site}</p>
                    <p className="text-xs text-slate-500">{permit.location}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-900 text-sm max-w-xs truncate">{permit.workDescription}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-900 text-sm">{permit.issuer}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-900 text-sm">{permit.startDate}</p>
                    <p className="text-xs text-slate-500">to {permit.endDate}</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={permit.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-200">
          {filteredPermits.map((permit) => (
            <button
              key={permit.id}
              onClick={() => onPTWSelect(permit.id)}
              className="w-full text-left p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-slate-900 mb-1">{permit.ptwNumber}</p>
                  {getCategoryBadge(permit.category)}
                </div>
                <StatusBadge status={permit.status} />
              </div>
              
              <p className="text-sm text-slate-700 mb-3">{permit.workDescription}</p>
              
              <div className="space-y-1 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{permit.site} - {permit.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>👤</span>
                  <span>{permit.issuer}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📅</span>
                  <span>{permit.startDate} to {permit.endDate}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}