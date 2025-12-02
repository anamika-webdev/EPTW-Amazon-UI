// frontend/src/components/supervisor/ExtendPTWModal.tsx
import { useState } from 'react';
import { X, Calendar, Clock, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import type { Permit } from '../../types';

interface ExtendPTWModalProps {
  permit: Permit | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    new_end_date: string;
    new_end_time: string;
    reason: string;
    work_completion_percentage: number;
  }) => Promise<void>;
}

export function ExtendPTWModal({ permit, isOpen, onClose, onSubmit }: ExtendPTWModalProps) {
  const [newEndDate, setNewEndDate] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [reason, setReason] = useState('');
  const [workCompletion, setWorkCompletion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !permit) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEndDate || !newEndTime || !reason || !workCompletion) {
      alert('Please fill in all required fields');
      return;
    }

    const completionPercent = parseInt(workCompletion);
    if (isNaN(completionPercent) || completionPercent < 0 || completionPercent > 100) {
      alert('Work completion must be between 0 and 100');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        new_end_date: newEndDate,
        new_end_time: newEndTime,
        reason,
        work_completion_percentage: completionPercent
      });
      
      // Reset form
      setNewEndDate('');
      setNewEndTime('');
      setReason('');
      setWorkCompletion('');
      onClose();
    } catch (error) {
      console.error('Error submitting extension:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format current end date and time
  const currentEndDateTime = permit.end_time ? new Date(permit.end_time) : null;
  const currentEndDate = currentEndDateTime?.toISOString().split('T')[0] || 'N/A';
  const currentEndTime = currentEndDateTime?.toTimeString().slice(0, 5) || 'N/A';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Extend PTW</h2>
            <p className="text-sm text-slate-600">
              {permit.permit_serial || permit.permit_number || `PTW-${permit.id}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current End Date & Time */}
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Current End Date & Time
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div className="px-3 py-2 border rounded-lg bg-slate-50 border-slate-200">
                <div className="text-xs text-slate-500">Date</div>
                <div className="font-medium text-slate-900">{currentEndDate}</div>
              </div>
              <div className="px-3 py-2 border rounded-lg bg-slate-50 border-slate-200">
                <div className="text-xs text-slate-500">Time</div>
                <div className="font-medium text-slate-900">{currentEndTime}</div>
              </div>
            </div>
          </div>

          {/* New End Date */}
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              New End Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min={currentEndDate}
              />
              <Calendar className="absolute w-4 h-4 pointer-events-none text-slate-400 right-3 top-3" />
            </div>
            <p className="mt-1 text-xs text-slate-500">dd-mm-yyyy format</p>
          </div>

          {/* New End Time */}
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              New End Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="time"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <Clock className="absolute w-4 h-4 pointer-events-none text-slate-400 right-3 top-3" />
            </div>
            <p className="mt-1 text-xs text-slate-500">--:-- format</p>
          </div>

          {/* Reason for Extension */}
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Reason for Extension <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why the work requires additional time..."
              className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              required
            />
          </div>

          {/* Current Work Completion */}
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Current Work Completion (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={workCompletion}
              onChange={(e) => setWorkCompletion(e.target.value)}
              placeholder="e.g. 65"
              min="0"
              max="100"
              className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              Enter the percentage of work completed so far
            </p>
          </div>

          {/* Important Notice */}
          <div className="flex gap-3 p-3 border rounded-lg bg-amber-50 border-amber-200">
            <AlertCircle className="w-5 h-5 mt-0.5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-900">Important Notice</p>
              <p className="text-xs text-amber-700">
                Extending this PTW will require re-approval from safety personnel. All workers will be
                notified of the extension via email and SMS.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Extending...' : 'Extend PTW'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}