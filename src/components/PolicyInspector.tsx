import React from 'react';
import { Customer, Booking, Policy } from '../types/index.ts';
import { ShieldCheck, X, Lock, BookOpen } from 'lucide-react';

interface PolicyInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  policies: Policy[];
  currentCustomer: Customer | null;
  primaryBooking: Booking | null;
}

export const PolicyInspector: React.FC<PolicyInspectorProps> = ({
  isOpen,
  onClose,
  policies,
  currentCustomer,
  primaryBooking,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-hairline shadow-2xl flex flex-col text-left">
          
          {/* Header */}
          <div className="p-6 border-b border-hairline bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-black tracking-tight">Policy & Audit Inspector</h2>
                <p className="font-mono text-[10px] text-neutral-500 uppercase tracking-caption">
                  Deterministic Airline Rules Engine
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-hairline hover:border-black flex items-center justify-center text-neutral-500 hover:text-black transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Active Evaluation Context (Lime Color Block) */}
            {currentCustomer && primaryBooking && (
              <div className="color-block-lime p-5 rounded-[24px] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-black uppercase tracking-eyebrow">
                    Active Evaluation State
                  </span>
                  <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-black text-white font-bold">
                    PNR: {currentCustomer.bookingReference}
                  </span>
                </div>

                <div className="text-xs space-y-1.5 pt-1">
                  <div className="flex justify-between">
                    <span className="text-black/70">Passenger:</span>
                    <span className="text-black font-bold">{currentCustomer.name} ({currentCustomer.loyaltyTier})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/70">Flight:</span>
                    <span className="text-black font-bold">{primaryBooking.flightNumber} ({primaryBooking.route})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/70">Status:</span>
                    <span className="font-mono font-bold text-black uppercase">{primaryBooking.status}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Core Grounded Rules */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-neutral-500 uppercase tracking-eyebrow">
                <BookOpen className="w-3.5 h-3.5 text-black" />
                <span>Airline Service Rules (PRD Data Pack)</span>
              </div>

              <div className="space-y-3">
                {policies.map((p) => (
                  <div key={p.id} className="p-4 rounded-2xl bg-surface-soft border border-hairline space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-black">{p.policyType}</span>
                      <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-neutral-200 text-black font-bold uppercase">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-neutral-700 text-xs leading-relaxed">{p.rule}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Strict Guardrails */}
            <div className="p-5 rounded-2xl color-block-coral space-y-2 text-xs">
              <div className="flex items-center gap-2 text-black font-bold">
                <Lock className="w-4 h-4" />
                <span>Strict Agent Guardrails</span>
              </div>
              <ul className="space-y-1 text-xs text-black/80 list-disc list-inside">
                <li>No hallucinations of ungrounded flights, fares, or hotel rooms.</li>
                <li>Fare difference &gt; ₹1,500 requires mandatory supervisor escalation.</li>
                <li>Refunds issued strictly to original payment method within 7 business days.</li>
                <li>Gold/Platinum tiers receive priority rebooking only — never extra compensation.</li>
                <li>Immediate escalation for legal threats or formal complaints.</li>
              </ul>
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-hairline bg-surface-soft text-center font-mono text-[10px] text-neutral-500 uppercase tracking-caption">
            GROUNDING VERIFIED • WEDNESDAY 23 SEPTEMBER 2026
          </div>

        </div>
      </div>
    </div>
  );
};
