import React, { useState } from 'react';
import { Customer } from '../types/index.ts';
import { ArrowRight, AlertCircle, Ban, Clock, Sparkles } from 'lucide-react';

interface LandingHeroProps {
  onLookupPNR: (pnr: string) => Promise<void>;
  onSelectCustomer?: (customer: Customer) => void;
  allCustomers?: Customer[];
  isLoading: boolean;
  errorMessage: string | null;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onLookupPNR,
  isLoading,
  errorMessage,
}) => {
  const [pnrInput, setPnrInput] = useState('');
  const [showIdentificationForm, setShowIdentificationForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pnrInput.trim()) {
      onLookupPNR(pnrInput.trim());
    }
  };

  const handleStartSupport = () => {
    setShowIdentificationForm(true);
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      
      {/* Editorial Hero Section (White Canvas) */}
      <div className="max-w-4xl mx-auto text-center space-y-6 pt-4">
        
        {/* Uppercase Mono Eyebrow */}
        <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-eyebrow text-neutral-600 font-semibold">
          <span>AIRLINE DISRUPTION RESOLUTION SYSTEM</span>
          <span>•</span>
          <span>23 SEP 2026</span>
        </div>

        {/* Oversized Display Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-normal tracking-display-xl text-black leading-[1.05]">
          Customer Resolution Agent.
        </h1>

        {/* Lead Subhead */}
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-neutral-800 font-normal leading-relaxed">
          Resolve airline flight disruptions instantly with deterministic policy execution. Claim 100% refunds, free 24-hour rebooking, meal vouchers, and delayed-hours accommodation.
        </p>

        {/* CTA Pills */}
        {!showIdentificationForm ? (
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={handleStartSupport}
              className="btn-pill-primary text-base px-8 py-3.5"
            >
              <span>Start Support</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setPnrInput('SK4821X');
                onLookupPNR('SK4821X');
              }}
              className="btn-pill-secondary text-base px-8 py-3.5"
            >
              <span>Try Priya Nair (SK4821X)</span>
            </button>
          </div>
        ) : (
          /* Identification Form Card */
          <div className="max-w-md mx-auto p-8 rounded-2xl bg-surface-soft border border-hairline text-left space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="space-y-1">
              <span className="font-mono text-[11px] uppercase tracking-eyebrow text-neutral-500 font-bold">
                Passenger Authentication
              </span>
              <h2 className="text-xl font-bold text-black tracking-tight">
                Enter Booking Reference
              </h2>
              <p className="text-xs text-neutral-600">
                Please enter the 6-7 character alphanumeric PNR reference found on your e-ticket.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="pnr" className="block font-mono text-xs uppercase tracking-caption text-neutral-700 font-semibold mb-1.5">
                  Booking Reference (PNR)
                </label>
                <input
                  id="pnr"
                  type="text"
                  value={pnrInput}
                  onChange={(e) => setPnrInput(e.target.value.toUpperCase())}
                  placeholder="e.g. SK4821X, TR1190B, WL7742"
                  className="w-full px-4 py-3 bg-white border border-hairline focus:border-black rounded-lg text-black font-mono text-base tracking-wider uppercase placeholder:text-neutral-400 outline-none transition"
                  maxLength={10}
                  autoFocus
                />
              </div>

              {/* Error Notification */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-[#FED7AA] border border-black/20 text-black text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-black shrink-0 mt-0.5" />
                  <span className="font-medium">{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !pnrInput.trim()}
                className="w-full btn-pill-primary py-3 text-sm disabled:bg-neutral-300 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Continue to Resolution Agent</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

      </div>

      {/* Promo Banner (Lilac block with Magenta CTA) */}
      <div className="color-block-lilac p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="font-mono text-[11px] uppercase tracking-eyebrow font-bold text-black/70">
            Deterministic Passenger Protection
          </div>
          <div className="text-base sm:text-lg font-bold text-black">
            Strict airline service policies evaluated in real-time with zero hallucinations.
          </div>
        </div>

        <button
          onClick={() => {
            setPnrInput('WL7742');
            onLookupPNR('WL7742');
          }}
          className="btn-pill-magenta shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Test Meher Kaur Scenario</span>
        </button>
      </div>

      {/* Color-Block Passenger Scenarios Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-eyebrow font-bold text-neutral-500">
            Demo passenger scenarios
          </span>
          <span className="font-mono text-xs text-neutral-400">
            Select a profile to load instant test state
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          
          {/* Scenario 1: Priya Nair (Lilac Color Block) */}
          <div
            onClick={() => {
              setPnrInput('SK4821X');
              onLookupPNR('SK4821X');
            }}
            className="color-block-lilac p-8 rounded-[24px] cursor-pointer hover:scale-[1.01] transition-transform flex flex-col justify-between space-y-6"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs uppercase tracking-caption font-bold px-3 py-1 rounded-full bg-black text-white">
                  Gold Tier
                </span>
                <span className="font-mono font-bold text-xs bg-white/80 px-2.5 py-1 rounded-full border border-black/10">
                  PNR: SK4821X
                </span>
              </div>
              <h3 className="text-2xl font-bold text-black tracking-tight">Priya Nair</h3>
              <p className="text-sm text-black/80 mt-1">Delhi → Goa • Flight SK-204</p>
            </div>

            <div className="space-y-2 pt-4 border-t border-black/10">
              <div className="flex items-center gap-1.5 text-xs font-bold text-black">
                <Ban className="w-4 h-4 text-black" />
                <span>Flight Cancelled (Operational)</span>
              </div>
              <div className="text-xs text-black/75 leading-relaxed">
                Eligible for Free 24h Rebooking (Gold Priority) or 100% Refund within 7 business days.
              </div>
            </div>

            <button className="btn-pill-dark w-full">
              <span>Inspect Priya's Disruption</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scenario 2: Arvind Kulkarni (Mint Color Block) */}
          <div
            onClick={() => {
              setPnrInput('TR1190B');
              onLookupPNR('TR1190B');
            }}
            className="color-block-mint p-8 rounded-[24px] cursor-pointer hover:scale-[1.01] transition-transform flex flex-col justify-between space-y-6"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs uppercase tracking-caption font-bold px-3 py-1 rounded-full bg-black text-white">
                  Silver Tier
                </span>
                <span className="font-mono font-bold text-xs bg-white/80 px-2.5 py-1 rounded-full border border-black/10">
                  PNR: TR1190B
                </span>
              </div>
              <h3 className="text-2xl font-bold text-black tracking-tight">Arvind Kulkarni</h3>
              <p className="text-sm text-black/80 mt-1">Mumbai → Bengaluru • Flight SK-118</p>
            </div>

            <div className="space-y-2 pt-4 border-t border-black/10">
              <div className="flex items-center gap-1.5 text-xs font-bold text-black">
                <Clock className="w-4 h-4 text-black" />
                <span>Delayed 4 Hours (11:10 New Dep.)</span>
              </div>
              <div className="text-xs text-black/75 leading-relaxed">
                Eligible for Meal Voucher and Airport Lounge Pass. Hotel requires &gt;5h delay.
              </div>
            </div>

            <button className="btn-pill-dark w-full">
              <span>Inspect Arvind's Disruption</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scenario 3: Meher Kaur (Coral Color Block) */}
          <div
            onClick={() => {
              setPnrInput('WL7742');
              onLookupPNR('WL7742');
            }}
            className="color-block-coral p-8 rounded-[24px] cursor-pointer hover:scale-[1.01] transition-transform flex flex-col justify-between space-y-6"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs uppercase tracking-caption font-bold px-3 py-1 rounded-full bg-black text-white">
                  Platinum Tier
                </span>
                <span className="font-mono font-bold text-xs bg-white/80 px-2.5 py-1 rounded-full border border-black/10">
                  PNR: WL7742
                </span>
              </div>
              <h3 className="text-2xl font-bold text-black tracking-tight">Meher Kaur</h3>
              <p className="text-sm text-black/80 mt-1">Delhi → Hyderabad • Flight SK-305</p>
            </div>

            <div className="space-y-2 pt-4 border-t border-black/10">
              <div className="flex items-center gap-1.5 text-xs font-bold text-black">
                <Clock className="w-4 h-4 text-black" />
                <span>Delayed 6 Hours (20:00 New Dep.)</span>
              </div>
              <div className="text-xs text-black/75 leading-relaxed">
                Eligible for Meal Voucher, Lounge Access, and Delayed-Hours Hotel Accommodation.
              </div>
            </div>

            <button className="btn-pill-dark w-full">
              <span>Inspect Meher's Disruption</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* Signature Lime Systems Block (Figma Style FAQ / Rules) */}
      <div className="color-block-lime p-8 sm:p-12 rounded-[24px] space-y-6 text-left">
        <div className="max-w-2xl space-y-2">
          <div className="font-mono text-xs uppercase tracking-eyebrow font-bold text-black/70">
            Deterministic Engine Rules
          </div>
          <h2 className="text-3xl sm:text-4xl font-normal tracking-display-lg text-black leading-tight">
            How our AI resolution agent handles flight disruptions.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-black/10">
          <div className="space-y-1.5">
            <div className="font-bold text-base text-black">1. Cancellations</div>
            <p className="text-xs text-black/80 leading-relaxed">
              Customers choose between free rebooking on the next available flight within 24h or a 100% full refund issued within 7 business days to the original payment method.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="font-bold text-base text-black">2. Delays & Compensation</div>
            <p className="text-xs text-black/80 leading-relaxed">
              &lt;3h delay: ₹500 meal voucher. &gt;3h delay: Meal voucher + Lounge access. &gt;5h delay: Meal + Lounge + Delayed-hours transit hotel (not full night).
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="font-bold text-base text-black">3. Strict Authorizations</div>
            <p className="text-xs text-black/80 leading-relaxed">
              Agent can waive fare differences up to ₹1,500. Differences &gt; ₹1,500, legal proceedings, or non-policy upgrades mandate immediate supervisor escalation.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
