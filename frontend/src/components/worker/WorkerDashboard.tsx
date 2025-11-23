import { ClipboardList, Clock, CheckCircle } from 'lucide-react';
import { StatCard } from '../shared/StatCard';
import { StatusBadge } from '../shared/StatusBadge';
import { mockPTWs } from '../../lib/mockData';

interface WorkerDashboardProps {
  onPTWSelect: (ptwId: string) => void;
}

export function WorkerDashboard({ onPTWSelect }: WorkerDashboardProps) {
  // In real app, filter by logged-in worker
  const workerName = 'Amit Patel';
  const myPTWs = mockPTWs.filter(ptw => ptw.assignedWorkers.includes(workerName));
  const pendingSignature = myPTWs.filter(ptw => !ptw.signatures.worker && ptw.status === 'approved');
  const completedPTWs = myPTWs.filter(ptw => ptw.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-slate-900 mb-2">My Permits</h1>
        <p className="text-slate-600">View and sign your assigned work permits</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Assigned PTWs"
          value={myPTWs.length}
          icon={ClipboardList}
          color="blue"
        />
        <StatCard
          title="Pending Signatures"
          value={pendingSignature.length}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Completed PTWs"
          value={completedPTWs.length}
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* Pending Signatures Alert */}
      {pendingSignature.length > 0 && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-slate-900 mb-1">Action Required</h3>
              <p className="text-slate-600">
                You have {pendingSignature.length} permit(s) waiting for your signature and acknowledgment.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PTW Cards */}
      <div>
        <h2 className="text-slate-900 mb-4">All My PTWs</h2>
        <div className="space-y-4">
          {myPTWs.map((ptw) => {
            const needsSignature = !ptw.signatures.worker && ptw.status === 'approved';
            
            return (
              <button
                key={ptw.id}
                onClick={() => onPTWSelect(ptw.id)}
                className={`w-full text-left bg-white rounded-xl border-2 p-6 hover:shadow-lg transition-all ${
                  needsSignature ? 'border-orange-300' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-slate-900">{ptw.ptwNumber}</h3>
                      {needsSignature && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                          Signature Required
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600">{ptw.workDescription}</p>
                  </div>
                  <StatusBadge status={ptw.status} />
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Category</p>
                    <p className="text-sm text-slate-900">{ptw.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Site</p>
                    <p className="text-sm text-slate-900">{ptw.site}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Location</p>
                    <p className="text-sm text-slate-900">{ptw.location}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Work Date</p>
                    <p className="text-sm text-slate-900">{ptw.startDate}</p>
                  </div>
                </div>

                {/* PPE Preview */}
                <div>
                  <p className="text-xs text-slate-500 mb-2">Required PPE</p>
                  <div className="flex gap-2">
                    {ptw.ppe.slice(0, 4).map((item, idx) => {
                      const icons: Record<string, string> = {
                        helmet: '⛑️',
                        vest: '🦺',
                        gloves: '🧤',
                        boots: '🥾',
                        glasses: '🥽',
                        mask: '😷',
                        earplugs: '🎧',
                        harness: '🪢',
                      };
                      return (
                        <span
                          key={idx}
                          className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-xl"
                        >
                          {icons[item]}
                        </span>
                      );
                    })}
                    {ptw.ppe.length > 4 && (
                      <span className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-sm text-slate-600">
                        +{ptw.ppe.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}