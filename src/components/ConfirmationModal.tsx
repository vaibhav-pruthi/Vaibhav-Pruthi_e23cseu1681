import React from 'react';
import { ActionOption } from '../types/index.ts';
import { Check, X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  action: ActionOption | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  action,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen || !action) return null;

  const details = action.confirmationDetails || {
    title: `Confirm ${action.label}`,
    description: 'Please review and confirm this resolution request:',
    fields: [
      { label: 'Action', value: action.label },
      { label: 'Description', value: action.description },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="max-w-md w-full rounded-[24px] bg-white border border-hairline shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150 text-left">
        
        {/* Header */}
        <div className="space-y-1">
          <span className="font-mono text-[11px] uppercase tracking-eyebrow font-bold text-neutral-500">
            Action Confirmation
          </span>
          <h3 className="text-2xl font-bold text-black tracking-tight">{details.title}</h3>
          <p className="text-xs text-neutral-600">{details.description}</p>
        </div>

        {/* Breakdown Card */}
        <div className="p-4 rounded-2xl bg-surface-soft border border-hairline space-y-2.5">
          {details.fields.map((field, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-hairline last:border-0">
              <span className="font-mono text-neutral-500 text-[11px] uppercase">{field.label}:</span>
              <span className="text-black font-bold text-right">{field.value}</span>
            </div>
          ))}
        </div>

        {/* Notice */}
        <div className="p-3.5 rounded-xl bg-block-cream border border-black/10 text-xs text-black flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-black shrink-0 mt-0.5" />
          <span>
            This resolution will be recorded on your booking file in accordance with airline passenger charter policies.
          </span>
        </div>

        {/* Action Buttons (Pills) */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 btn-pill-secondary text-xs py-3"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 btn-pill-primary text-xs py-3"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Confirm Request</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
