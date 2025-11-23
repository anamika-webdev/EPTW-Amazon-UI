import { useState } from 'react';
import { ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { StatusBadge } from '../shared/StatusBadge';
import { DigitalSignature } from '../shared/DigitalSignature';
import { mockPTWs } from '../../lib/mockData';

interface WorkerPTWDetailsProps {
  ptwId: string;
  onBack: () => void;
}

export function WorkerPTWDetails({ ptwId, onBack }: WorkerPTWDetailsProps) {
  const [showSignature, setShowSignature] = useState(false);
  const [checklist, setChecklist] = useState({
    briefingReceived: false,
    hazardsUnderstood: false,
    ppeAvailable: false,
    controlMeasuresUnderstood: false,
    emergencyProcedures: false,
  });
  const [workerSignature, setWorkerSignature] = useState('');

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

  const allChecklistChecked = Object.values(checklist).every(v => v);
  const needsSignature = !ptw.signatures.worker && ptw.status === 'approved';

  const handleSignatureSave = (signature: string) => {
    setWorkerSignature(signature);
    setShowSignature(false);
    alert('Signature saved! PTW acknowledged successfully.');
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
        <StatusBadge status={ptw.status} />
      </div>

      {/* Signature Required Alert */}
      {needsSignature && !workerSignature && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-slate-900 mb-1">Acknowledgment Required</h3>
              <p className="text-slate-600">
                Please review all permit details, complete the safety checklist, and provide your signature
                to acknowledge that you understand the work requirements and safety measures.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PTW Details */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-8">
        {/* Basic Information */}
        <div>
          <h2 className="text-slate-900 mb-4 pb-2 border-b border-slate-200">Work Details</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-500 mb-1">Site & Location</p>
              <p className="text-slate-900">{ptw.site} - {ptw.location}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Work Period</p>
              <p className="text-slate-900">{ptw.startDate} to {ptw.endDate}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Supervisor/Issuer</p>
              <p className="text-slate-900">{ptw.issuer}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Category</p>
              <p className="text-slate-900">{ptw.category}</p>
            </div>
          </div>
        </div>

        {/* Work Description */}
        <div>
          <h2 className="text-slate-900 mb-4 pb-2 border-b border-slate-200">Work Description</h2>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-slate-900">{ptw.workDescription}</p>
          </div>
        </div>

        {/* Hazards - Important for Worker */}
        <div>
          <h2 className="text-slate-900 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Identified Hazards - Please Read Carefully
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {ptw.hazards.map((hazard, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 bg-orange-50 border-2 border-orange-300 rounded-lg">
                <span className="text-orange-600 text-2xl">⚠️</span>
                <span className="text-slate-900">{hazard}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Control Measures */}
        <div>
          <h2 className="text-slate-900 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Safety Control Measures
          </h2>
          <div className="space-y-2">
            {ptw.controlMeasures.map((measure, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-900">{measure}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PPE Requirements - Visual */}
        <div>
          <h2 className="text-slate-900 mb-4 pb-2 border-b border-slate-200">
            Required Personal Protective Equipment (PPE)
          </h2>
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
            <p className="text-sm text-blue-900 mb-4">
              ⚠️ You MUST wear all the following PPE before starting work:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {ptw.ppe.map((item) => (
                <div key={item} className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-blue-200 rounded-lg">
                  <span className="text-5xl">{ppeLabels[item]?.split(' ')[0]}</span>
                  <span className="text-sm text-slate-900 text-center">{ppeLabels[item]?.substring(3)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div>
          <h2 className="text-slate-900 mb-4 pb-2 border-b border-slate-200">Team Members</h2>
          <div className="flex flex-wrap gap-3">
            {ptw.assignedWorkers.map((worker, idx) => (
              <div key={idx} className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white">
                  {worker.charAt(0)}
                </div>
                <span className="text-slate-900">{worker}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Worker Acknowledgment Section */}
      {needsSignature && (
        <div className="bg-white rounded-xl border-2 border-orange-300 p-8 space-y-6">
          <h2 className="text-slate-900">Worker Safety Acknowledgment</h2>
          
          {/* Safety Checklist */}
          <div className="space-y-4">
            <p className="text-slate-600">
              Please confirm the following before signing:
            </p>
            
            <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
              <Checkbox
                checked={checklist.briefingReceived}
                onCheckedChange={(checked) =>
                  setChecklist({ ...checklist, briefingReceived: !!checked })
                }
              />
              <div>
                <p className="text-slate-900">I have received a safety briefing from my supervisor</p>
                <p className="text-sm text-slate-500">
                  The supervisor has explained the work scope and safety requirements
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
              <Checkbox
                checked={checklist.hazardsUnderstood}
                onCheckedChange={(checked) =>
                  setChecklist({ ...checklist, hazardsUnderstood: !!checked })
                }
              />
              <div>
                <p className="text-slate-900">I understand all identified hazards</p>
                <p className="text-sm text-slate-500">
                  I have read and understood the hazards associated with this work
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
              <Checkbox
                checked={checklist.controlMeasuresUnderstood}
                onCheckedChange={(checked) =>
                  setChecklist({ ...checklist, controlMeasuresUnderstood: !!checked })
                }
              />
              <div>
                <p className="text-slate-900">I understand all control measures</p>
                <p className="text-sm text-slate-500">
                  I know what safety measures to follow during the work
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
              <Checkbox
                checked={checklist.ppeAvailable}
                onCheckedChange={(checked) =>
                  setChecklist({ ...checklist, ppeAvailable: !!checked })
                }
              />
              <div>
                <p className="text-slate-900">I have all required PPE and it is in good condition</p>
                <p className="text-sm text-slate-500">
                  All necessary protective equipment is available and functional
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
              <Checkbox
                checked={checklist.emergencyProcedures}
                onCheckedChange={(checked) =>
                  setChecklist({ ...checklist, emergencyProcedures: !!checked })
                }
              />
              <div>
                <p className="text-slate-900">I know the emergency procedures</p>
                <p className="text-sm text-slate-500">
                  I know what to do and who to contact in case of an emergency
                </p>
              </div>
            </label>
          </div>

          {/* Signature */}
          <div className="pt-6 border-t border-slate-200">
            <h3 className="text-slate-900 mb-4">Worker Signature</h3>
            {workerSignature || ptw.signatures.worker ? (
              <div className="p-6 bg-green-50 border-2 border-green-300 rounded-lg text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <p className="text-green-900">Permit Acknowledged</p>
                <p className="text-sm text-green-700">You have signed this permit</p>
              </div>
            ) : (
              <Button
                onClick={() => setShowSignature(true)}
                disabled={!allChecklistChecked}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {allChecklistChecked
                  ? 'Sign & Acknowledge Permit'
                  : 'Complete checklist to sign'
                }
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {showSignature && (
        <DigitalSignature
          onSave={handleSignatureSave}
          onClose={() => setShowSignature(false)}
          title="Worker Acknowledgment Signature"
        />
      )}
    </div>
  );
}
