import React from 'react';
import { Customer } from '../types/index.ts';
import { Plane, ShieldCheck, RefreshCw, LogOut, ChevronDown } from 'lucide-react';

interface NavbarProps {
  currentCustomer: Customer | null;
  allCustomers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
  onLogout: () => void;
  onOpenPolicyInspector: () => void;
  onResetSession: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCustomer,
  allCustomers,
  onSelectCustomer,
  onLogout,
  onOpenPolicyInspector,
  onResetSession,
}) => {
  return (
    <div className="sticky top-0 z-40 w-full bg-white border-b border-hairline">
      {/* Primary Top Nav (56px) */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white">
            <Plane className="w-4 h-4 transform -rotate-45" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-base text-black tracking-tight font-sans">SkyResolve</span>
            <span className="font-mono text-[11px] uppercase tracking-eyebrow text-neutral-500 font-medium">
              / Resolution Agent
            </span>
          </div>
        </div>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-3">
          
          {/* Policy Inspector Pill Button */}
          <button
            onClick={onOpenPolicyInspector}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-black text-black hover:bg-neutral-100 text-xs font-medium transition"
            title="Inspect Grounded Airline Policies & Active Rules"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Policy Inspector</span>
          </button>

          {/* Active Customer Profile / Switcher */}
          {currentCustomer ? (
            <div className="flex items-center gap-2">
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black text-white hover:bg-neutral-800 transition text-xs font-medium">
                  <span className="font-mono uppercase text-[10px] tracking-wider text-neutral-300">
                    {currentCustomer.loyaltyTier}
                  </span>
                  <span className="hidden md:inline font-semibold">{currentCustomer.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 group-hover:rotate-180 transition-transform" />
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-64 p-2 bg-white border border-hairline rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                  <div className="px-3 py-1.5 font-mono text-[10px] font-bold text-neutral-400 uppercase tracking-caption">
                    Switch Test Passenger
                  </div>
                  {allCustomers.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => onSelectCustomer(c)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                        c.bookingReference === currentCustomer.bookingReference
                          ? 'bg-neutral-100 font-bold text-black'
                          : 'hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-black">{c.name}</div>
                        <div className="text-[10px] text-neutral-500 font-mono">{c.bookingReference}</div>
                      </div>
                      <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded-full bg-neutral-200 text-black font-semibold">
                        {c.loyaltyTier}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Session */}
              <button
                onClick={onResetSession}
                title="Reset Conversation Context"
                className="w-8 h-8 rounded-full border border-hairline hover:border-black flex items-center justify-center text-neutral-600 hover:text-black transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              {/* Logout / Switch */}
              <button
                onClick={onLogout}
                title="Exit Booking"
                className="w-8 h-8 rounded-full border border-hairline hover:border-red-500 hover:text-red-600 flex items-center justify-center text-neutral-600 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : null}

        </div>

      </header>

      {/* Marquee Ribbon (Black Strip) */}
      <div className="bg-black text-white py-1.5 px-4 sm:px-6 lg:px-8 text-[11px] font-mono tracking-caption uppercase overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-block-lime">● LIVE ENGINE</span>
            <span>EXERCISE DATE: WEDNESDAY 23 SEPTEMBER 2026</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-neutral-400">
            <span>DETERMINISTIC SERVICE RULES</span>
            <span>STRICT DATA GROUNDING</span>
            <span>AIRLINE PASSENGER CHARTER</span>
          </div>
        </div>
      </div>
    </div>
  );
};
