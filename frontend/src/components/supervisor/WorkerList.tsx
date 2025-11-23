import { Mail, Phone, ClipboardList } from 'lucide-react';
import { Button } from '../ui/button';
import { mockWorkers } from '../../lib/mockData';
import type { CurrentPage } from '../../App';

interface WorkerListProps {
  onNavigate: (page: CurrentPage) => void;
}

export function WorkerList({ onNavigate }: WorkerListProps) {
  // Filter workers by supervisor's site (in real app, filter by logged-in supervisor)
  const myWorkers = mockWorkers.filter(w => w.site === 'Mumbai Data Center');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 mb-2">My Workers</h1>
          <p className="text-slate-600">Manage and assign permits to your workers</p>
        </div>
        <Button
          onClick={() => onNavigate('create-ptw')}
          className="gap-2 bg-green-600 hover:bg-green-700 text-white"
        >
          <ClipboardList className="w-4 h-4" />
          Create PTW
        </Button>
      </div>

      {/* Workers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myWorkers.map((worker) => (
          <div key={worker.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white flex-shrink-0 text-xl">
                {worker.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-slate-900 mb-1">{worker.name}</h3>
                <p className="text-sm text-slate-500">Worker</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{worker.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{worker.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>📍</span>
                <span>{worker.site}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-xs text-slate-500">Active PTWs</p>
                <p className="text-slate-900">2</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Completed</p>
                <p className="text-slate-900">15</p>
              </div>
            </div>

            <Button
              onClick={() => onNavigate('create-ptw')}
              variant="outline"
              className="w-full gap-2"
            >
              <ClipboardList className="w-4 h-4" />
              Assign PTW
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}