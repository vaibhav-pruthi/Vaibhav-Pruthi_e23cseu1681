import React, { useState } from 'react';
import { Customer, Booking, Resolution, Escalation } from '../types/index.ts';
import {
  Plane,
  Clock,
  Ban,
  CheckCircle2,
  Coffee,
  Sparkles,
  BedDouble,
  Undo2,
  AlertOctagon,
  Info
} from 'lucide-react';

interface CustomerDashboardProps {
  customer: Customer;
  primaryBooking: Booking;
  allBookings: Booking[];
  resolutions: Resolution[];
  escalations: Escalation[];
  onTriggerQuickAction: (actionType: string) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  customer,
  primaryBooking,
  allBookings,
  resolutions,
  escalations,
  onTriggerQuickAction,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'resolutions' | 'escalations'>('overview');

  const isCancelled = primaryBooking.status === 'Cancelled';
  const isDelayed = primaryBooking.status.startsWith('Delayed');
  const delayHours = primaryBooking.delayHours || (primaryBooking.status.includes('4') ? 4 : primaryBooking.status.includes('6') ? 6 : 0);

  const returnFlight = allBookings.find((b) => b.isReturnFlight);

  return (
    <div className="flex flex-col h-full space-y-4">
      
      {/* Customer Profile Card (Cream Color Block) */}
      <div className="color-block-cream p-5 rounded-[24px] space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-black tracking-tight">{customer.name}</h2>
              <span className="font-mono text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-black text-white">
                {customer.loyaltyTier}
              </span>
            </div>
            <div className="font-mono text-xs text-black/70 mt-1">
              PNR: <strong className="text-black font-bold">{customer.bookingReference}</strong> • {customer.email}
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono text-[11px] px-2.5 py-1 rounded-full bg-black/10 text-black font-semibold">
              {customer.flightsLast12Months} flights / 12 mo
            </span>
          </div>
        </div>

        {customer.previousComplaint !== 'None' && (
          <div className="p-2.5 rounded-xl bg-black/5 text-xs text-black/80 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-black shrink-0" />
            <span>Previous History: <strong className="text-black">{customer.previousComplaint}</strong></span>
          </div>
        )}
      </div>

      {/* Disruption Notice Block (Coral for Cancelled, Mint for Delayed) */}
      <div
        className={`p-5 rounded-[24px] space-y-3 ${
          isCancelled ? 'color-block-coral' : 'color-block-mint'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
              {isCancelled ? <Ban className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-eyebrow font-bold text-black/70">
                {isCancelled ? 'Disruption Alert' : 'Delay Notification'}
              </div>
              <div className="text-base font-bold text-black flex items-center gap-2">
                <span>{primaryBooking.flightNumber}</span>
                <span className="text-xs font-normal text-black/70">({primaryBooking.route})</span>
              </div>
            </div>
          </div>

          <div className="font-mono text-xs font-bold uppercase px-3 py-1 rounded-full bg-black text-white">
            {primaryBooking.status}
          </div>
        </div>

        {/* Schedule Strip */}
        <div className="p-3.5 rounded-xl bg-white/80 border border-black/10 grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="font-mono text-[10px] text-black/60 uppercase font-bold">Scheduled Departure</div>
            <div className="text-black font-bold mt-0.5">{primaryBooking.date} • {primaryBooking.scheduledDeparture}</div>
          </div>

          <div>
            <div className="font-mono text-[10px] text-black/60 uppercase font-bold">
              {isCancelled ? 'Disruption Cause' : 'Revised Departure'}
            </div>
            <div className="font-bold text-black mt-0.5">
              {isCancelled ? primaryBooking.disruptionReason : `${primaryBooking.newDeparture} (+${delayHours}h)`}
            </div>
          </div>
        </div>

        {/* Return Flight Note if applicable (e.g. Priya Nair) */}
        {returnFlight && (
          <div className="p-2.5 rounded-xl bg-white/90 border border-black/10 text-xs flex items-center justify-between text-black">
            <div className="flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5 text-black rotate-180" />
              <span>Return: <strong className="font-bold">{returnFlight.flightNumber}</strong> ({returnFlight.route}) on {returnFlight.date}</span>
            </div>
            <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-black/10 text-black">
              {returnFlight.status}
            </span>
          </div>
        )}
      </div>

      {/* Pill Tabs Navigation */}
      <div className="flex items-center gap-2 p-1 bg-surface-soft rounded-full border border-hairline">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-1.5 px-3 rounded-full text-xs font-medium transition ${
            activeTab === 'overview'
              ? 'bg-black text-white shadow-sm'
              : 'text-neutral-600 hover:text-black'
          }`}
        >
          Disruption Benefits
        </button>

        <button
          onClick={() => setActiveTab('resolutions')}
          className={`flex-1 py-1.5 px-3 rounded-full text-xs font-medium transition flex items-center justify-center gap-1.5 ${
            activeTab === 'resolutions'
              ? 'bg-black text-white shadow-sm'
              : 'text-neutral-600 hover:text-black'
          }`}
        >
          <span>Resolutions</span>
          {resolutions.length > 0 && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'resolutions' ? 'bg-white text-black' : 'bg-neutral-200 text-black'}`}>
              {resolutions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('escalations')}
          className={`flex-1 py-1.5 px-3 rounded-full text-xs font-medium transition flex items-center justify-center gap-1.5 ${
            activeTab === 'escalations'
              ? 'bg-black text-white shadow-sm'
              : 'text-neutral-600 hover:text-black'
          }`}
        >
          <span>Escalations</span>
          {escalations.length > 0 && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'escalations' ? 'bg-white text-black' : 'bg-neutral-200 text-black'}`}>
              {escalations.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3">
        {activeTab === 'overview' && (
          <div className="space-y-3">
            <div className="font-mono text-[11px] font-bold text-neutral-500 uppercase tracking-eyebrow">
              Eligible Resolution Entitlements
            </div>

            {/* Cancelled Scenario Benefits */}
            {isCancelled && (
              <div className="grid grid-cols-1 gap-3">
                <div
                  onClick={() => onTriggerQuickAction('refund')}
                  className="p-4 rounded-2xl bg-white border border-hairline hover:border-black cursor-pointer flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-black">
                      <Undo2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-black">Full Refund (100%)</div>
                      <div className="text-xs text-neutral-600">Within 7 business days to original method</div>
                    </div>
                  </div>
                  <span className="btn-pill-primary text-xs px-4 py-1.5 group-hover:bg-neutral-800">
                    Select
                  </span>
                </div>

                <div
                  onClick={() => onTriggerQuickAction('rebook')}
                  className="p-4 rounded-2xl bg-white border border-hairline hover:border-black cursor-pointer flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-black">
                      <Plane className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-black">Free Rebooking (Within 24h)</div>
                      <div className="text-xs text-neutral-600">
                        {customer.loyaltyTier === 'Gold' || customer.loyaltyTier === 'Platinum' ? `${customer.loyaltyTier} priority seat access` : 'No fare difference charged'}
                      </div>
                    </div>
                  </div>
                  <span className="btn-pill-secondary text-xs px-4 py-1.5">
                    Select
                  </span>
                </div>
              </div>
            )}

            {/* Delayed Scenario Benefits */}
            {isDelayed && (
              <div className="grid grid-cols-1 gap-3">
                
                {/* Meal Voucher */}
                <div
                  onClick={() => onTriggerQuickAction('meal_voucher')}
                  className="p-4 rounded-2xl bg-white border border-hairline hover:border-black cursor-pointer flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-black">
                      <Coffee className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-black">Meal Voucher</div>
                      <div className="text-xs text-neutral-600">Valid at departure terminal food outlets</div>
                    </div>
                  </div>
                  <span className="btn-pill-primary text-xs px-4 py-1.5">
                    Claim
                  </span>
                </div>

                {/* Lounge Access (delay > 3h) */}
                {delayHours > 3 && (
                  <div
                    onClick={() => onTriggerQuickAction('lounge_access')}
                    className="p-4 rounded-2xl bg-white border border-hairline hover:border-black cursor-pointer flex items-center justify-between transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-black">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-black">Airport Lounge Access</div>
                        <div className="text-xs text-neutral-600">Complimentary lounge pass for {customer.name}</div>
                      </div>
                    </div>
                    <span className="btn-pill-primary text-xs px-4 py-1.5">
                      Claim
                    </span>
                  </div>
                )}

                {/* Delayed-Hours Hotel (delay > 5h) */}
                {delayHours > 5 ? (
                  <div
                    onClick={() => onTriggerQuickAction('delayed_hotel')}
                    className="color-block-pink p-4 rounded-[24px] cursor-pointer flex items-center justify-between transition hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center">
                        <BedDouble className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-black">Delayed-Hours Hotel</div>
                        <div className="text-xs text-black/75">Day-use room covering delay hours (not full night)</div>
                      </div>
                    </div>
                    <span className="btn-pill-primary text-xs px-4 py-1.5">
                      Arrange
                    </span>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-surface-soft border border-hairline text-xs text-neutral-500 flex items-center gap-2">
                    <BedDouble className="w-4 h-4 text-neutral-400" />
                    <span>Hotel accommodation requires delay &gt; 5 hours (Current: {delayHours}h)</span>
                  </div>
                )}

              </div>
            )}

            {/* Quick Escalate Action */}
            <div
              onClick={() => onTriggerQuickAction('escalate')}
              className="p-3.5 rounded-2xl border border-hairline hover:border-black bg-surface-soft cursor-pointer flex items-center justify-between text-neutral-700 hover:text-black transition"
            >
              <div className="flex items-center gap-2 text-xs font-medium">
                <AlertOctagon className="w-4 h-4 text-neutral-500" />
                <span>Need supervisor approval or specialist review?</span>
              </div>
              <span className="font-mono text-xs font-bold uppercase underline">Escalate</span>
            </div>
          </div>
        )}

        {/* Tab 2: Resolutions */}
        {activeTab === 'resolutions' && (
          <div className="space-y-2">
            {resolutions.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-400 font-mono">
                No resolutions executed yet.
              </div>
            ) : (
              resolutions.map((r) => (
                <div key={r.id} className="p-3.5 rounded-2xl bg-white border border-hairline space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-black flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                      {r.action}
                    </span>
                    <span className="font-mono text-[10px] text-neutral-500">
                      {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-neutral-700 text-xs">{r.details}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Escalations */}
        {activeTab === 'escalations' && (
          <div className="space-y-2">
            {escalations.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-400 font-mono">
                No active escalations recorded.
              </div>
            ) : (
              escalations.map((e) => (
                <div key={e.id} className="p-3.5 rounded-2xl color-block-coral space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-black flex items-center gap-1.5">
                      <AlertOctagon className="w-3.5 h-3.5 text-black" />
                      {e.reason}
                    </span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-black text-white uppercase font-bold">
                      {e.status}
                    </span>
                  </div>
                  <p className="text-black/80 text-xs">{e.details}</p>
                </div>
              ))
            )}
          </div>
        )}

      </div>

    </div>
  );
};
