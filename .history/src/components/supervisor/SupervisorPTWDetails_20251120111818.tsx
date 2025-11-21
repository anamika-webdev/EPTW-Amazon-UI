import { ArrowLeft, Download, Edit, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { StatusBadge } from '../shared/StatusBadge';
import { mockPTWs } from '../../lib/mockData';

interface SupervisorPTWDetailsProps {
  ptwId: string;
  onBack: () => void;
}

export function SupervisorPTWDetails({ ptwId, onBack }: SupervisorPTWDetailsProps) {
  const ptw = mockPTWs.find(p => p.id === ptwId);

  if (!ptw) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">PTW not found</p>
        <Button onClick={onBack} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const ppeLabels: Record<string, string> = {
    helmet: '⛑️ Safety Helmet',
    vest: '🦺 Safety Vest',
    gloves: '🧤 Safety Gloves',
    boots: '🥾 Safety Boots',
    glasses: '🥽 Safety Glasses',
    mask: '😷 Face Mask',
    earplugs: '🎧 Ear Protection',
    harness: '🪢 Safety Harness',
  };

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
            <h1 className="text-slate-900">{ptw.ptwNumber}</h1>
            <p className="text-slate-600">{ptw.category} Work Permit</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={ptw.status} />
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* PTW Details */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-8">
        {/* Basic Information */}
        <div>
          <h2 className="text-slate-900 mb-4 pb-2 border-b border-slate-200">Basic Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-500 mb-1">PTW Number</p>
              <p className="text-slate-900">{ptw.ptwNumber}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Category</p>
              <p className="text-slate-900">{ptw.category}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Site</p>
              <p className="text-slate-900">{ptw.site}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Location</p>
              <p className="text-slate-900">{ptw.location}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Issuer</p>
              <p className="text-slate-900">{ptw.issuer}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Created Date</p>
              <p className="text-slate-900">{ptw.createdDate}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Work Period</p>
              <p className="text-slate-900">{ptw.startDate} to {ptw.endDate}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Status</p>
              <StatusBadge status={ptw.status} />
            </div>
          </div>
        </div>

        {/* Work Description */}
        <div>
          <h2 className="text-slate-900 mb-4 pb-2 border-b border-slate-200">Work Description</h2>
          <p className="text-slate-700">{ptw.workDescription}</p>
        </div>

        {/* Assigned Workers */}
        <div>
          <h2 className="text-slate-900 mb-4 pb-2 border-b border-slate-200">Assigned Workers</h2>
          <div className="flex flex-wrap gap-3">
            {ptw.assignedWorkers.map((worker, idx) => (
              <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white text-sm">
                  {worker.charAt(0)}
                </div>
                <span className="text-slate-900">{worker}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hazards */}
        <div>
          <h2 className="text-slate-900 mb-4 pb-2 border-b border-slate-200">Identified Hazards</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {ptw.hazards.map((hazard, idx) => (
              <div key={idx} className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <span className="text-orange-600">⚠️</span>
                <span className="text-slate-900">{hazard}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Control Measures */}
        <div>
          <h2 className="text-slate-900 mb-4 pb-2 border-b border-slate-200">Control Measures</h2>
          <div className="space-y-2">
            {ptw.controlMeasures.map((measure, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-900">{measure}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PPE Requirements */}
        <div>
          <h2 className="text-slate-900 mb-4 pb-2 border-b border-slate-200">Required PPE</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ptw.ppe.map((item) => (
              <div key={item} className="flex flex-col items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-4xl">{ppeLabels[item]?.split(' ')[0]}</span>
                <span className="text-sm text-slate-900 text-center">{ppeLabels[item]?.substring(3)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SWMS File */}
        {ptw.swmsFile && (
          <div>
            <h2 className="text-slate-900 mb-4 pb-2 border-b border-slate-200">SWMS Document</h2>
            <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">📄</span>
              </div>
              <div className="flex-1">
                <p className="text-slate-900">{ptw.swmsFile}</p>
                <p className="text-sm text-slate-500">Safe Work Method Statement</p>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </div>
        )}

        {/* Signatures */}
        <div>
          <h2 className="text-slate-900 mb-4 pb-2 border-b border-slate-200">Approvals & Signatures</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {ptw.signatures.issuer && (
              <div className="border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-500 mb-2">Issuer Signature</p>
                <div className="h-24 bg-slate-50 rounded border border-slate-200 flex items-center justify-center">
                  <span className="text-green-600 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Signed
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-2">{ptw.issuer}</p>
              </div>
            )}
            {ptw.signatures.areaInCharge && (
              <div className="border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-500 mb-2">Area In-Charge</p>
                <div className="h-24 bg-slate-50 rounded border border-slate-200 flex items-center justify-center">
                  <span className="text-green-600 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Signed
                  </span>
                </div>
              </div>
            )}
            {ptw.signatures.safetyInCharge && (
              <div className="border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-500 mb-2">Safety In-Charge</p>
                <div className="h-24 bg-slate-50 rounded border border-slate-200 flex items-center justify-center">
                  <span className="text-green-600 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Signed
                  </span>
                </div>
              </div>
            )}
            {ptw.signatures.siteLeader && (
              <div className="border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-500 mb-2">Site Leader</p>
                <div className="h-24 bg-slate-50 rounded border border-slate-200 flex items-center justify-center">
                  <span className="text-green-600 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Signed
                  </span>
                </div>
              </div>
            )}
            {ptw.signatures.worker && (
              <div className="border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-500 mb-2">Worker Acknowledgment</p>
                <div className="h-24 bg-slate-50 rounded border border-slate-200 flex items-center justify-center">
                  <span className="text-green-600 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Signed
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
