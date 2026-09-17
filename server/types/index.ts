export type LoyaltyTier = 'Silver' | 'Gold' | 'Platinum';

export type FlightStatus = 'Cancelled' | 'Delayed' | 'Unaffected' | 'On Time';

export interface Customer {
  id: string;
  name: string;
  loyaltyTier: LoyaltyTier;
  bookingReference: string;
  email: string;
  phone: string;
  flightsLast12Months: number;
  previousComplaint: string;
}

export interface Booking {
  id: string;
  customerId: string;
  pnr: string;
  flightNumber: string;
  route: string;
  date: string;
  scheduledDeparture: string;
  newDeparture?: string | null;
  delayHours?: number;
  status: string;
  disruptionReason?: string | null;
  isReturnFlight?: boolean;
}

export interface Policy {
  id: string;
  policyType: string;
  rule: string;
  enabled: boolean;
}

export interface Resolution {
  id: string;
  customerId: string;
  bookingId: string;
  action: string;
  details: string;
  status: 'completed' | 'pending_approval' | 'escalated';
  createdAt: string;
}

export interface Escalation {
  id: string;
  customerId: string;
  bookingId: string;
  reason: string;
  details: string;
  status: 'pending_supervisor' | 'resolved';
  createdAt: string;
}

export interface ActionOption {
  id: string;
  type: 'refund' | 'rebook' | 'meal_voucher' | 'lounge_access' | 'delayed_hotel' | 'escalate';
  label: string;
  description: string;
  variant?: 'primary' | 'secondary' | 'warning' | 'danger';
  requiresConfirmation?: boolean;
  confirmationDetails?: {
    title: string;
    description: string;
    fields: { label: string; value: string }[];
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
  actions?: ActionOption[];
  isEscalation?: boolean;
  policyNote?: string;
  suggestedPrompts?: string[];
}
