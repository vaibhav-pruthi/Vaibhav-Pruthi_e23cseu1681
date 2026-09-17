import React, { useState } from 'react';
import { UserCheck, CheckCircle2, X } from 'lucide-react';

interface EscalationModalProps {
  isOpen: boolean;
  reason: string;
  pnr: string;
  customerName: string;
  onConfirmEscalation: (reason: string, notes: string) => Promise<void>;
  onClose: () => void;
}

export const EscalationModal: React.FC<EscalationModalProps> = ({
  isOpen,
  reason,
  pnr,
  customerName,
  onConfirmEscalation,
  onClose,
}) => {
  const [selectedReason, setSelectedReason] = useState(reason || 'Supervisor Authorization Required');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const presetReasons = [
    'Fare difference above ₹1,500',
    'Request for additional compensation / upgrade exception',
    'Legal action / Lawyer consultation',
    'Formal complaint escalation',
    'Refund to another payment method',
    'Specialist rebooking assignment',
  ];

  const handleEscalate = async () => {
    setIsLoading(true);
    await onConfirmEscalation(selectedReason, notes || `Escalation requested for booking ${pnr}`);
    setIsLoading(false);
    setIsSubmitted(true);
  };

  const handleDone = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="max-w-lg w-full rounded-[24px] bg-white border border-hairline shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150 text-left">
        
        {!isSubmitted ? (
          <>
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="font-mono text-[11px] uppercase tracking-eyebrow font-bold text-neutral-500">
                  Specialist Transfer
                </span>
                <h3 className="text-2xl font-bold text-black tracking-tight">Human Support Required</h3>
                <p className="text-xs text-neutral-600">
                  Your request requires supervisor authorization or specialist support outside automated policies.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full border border-hairline hover:border-black flex items-center justify-center text-neutral-500 hover:text-black transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Passenger Summary */}
            <div className="p-4 rounded-2xl bg-surface-soft border border-hairline flex items-center justify-between text-xs">
              <div>
                <div className="font-mono text-[10px] uppercase font-bold text-neutral-400">PASSENGER</div>
                <div className="font-bold text-black text-sm">{customerName}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10px] uppercase font-bold text-neutral-400">BOOKING PNR</div>
                <div className="font-mono font-bold text-black text-sm">{pnr}</div>
              </div>
            </div>

            {/* Escalation Reason Selector */}
            <div className="space-y-1.5">
              <label className="block font-mono text-xs uppercase tracking-caption font-bold text-neutral-700">
                Reason for Escalation
              </label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-hairline focus:border-black rounded-xl text-xs text-black outline-none transition"
              >
                {presetReasons.map((r, idx) => (
                  <option key={idx} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Optional Notes */}
            <div className="space-y-1.5">
              <label className="block font-mono text-xs uppercase tracking-caption font-bold text-neutral-700">
                Additional Notes / Case Summary (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter any additional details for the supervisor..."
                rows={3}
                className="w-full px-4 py-3 bg-white border border-hairline focus:border-black rounded-xl text-xs text-black placeholder:text-neutral-400 outline-none transition"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-pill-secondary text-xs py-3"
              >
                Back to Chat
              </button>

              <button
                type="button"
                onClick={handleEscalate}
                disabled={isLoading}
                className="flex-1 btn-pill-primary text-xs py-3"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Escalate to Human Agent</span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          /* Confirmation Success State */
          <div className="text-center py-4 space-y-5">
            <div className="w-14 h-14 mx-auto rounded-full bg-block-mint flex items-center justify-center text-black">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-black tracking-tight">Escalation Ticket Opened</h3>
              <p className="text-xs text-neutral-600 max-w-sm mx-auto">
                Your request has been escalated to human support. A senior resolution supervisor has been assigned to your case.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-soft border border-hairline text-xs text-left space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-neutral-500">Ticket ID:</span>
                <span className="font-bold text-black">ESC-{Math.random().toString(36).substring(2, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Reason:</span>
                <span className="text-black font-semibold">{selectedReason}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Queue Status:</span>
                <span className="font-bold text-black uppercase">Assigned to Specialist</span>
              </div>
            </div>

            <button
              onClick={handleDone}
              className="w-full btn-pill-primary text-xs py-3"
            >
              Return to Assistant
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
