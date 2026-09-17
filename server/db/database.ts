import { Customer, Booking, Policy, Resolution, Escalation } from '../types/index.ts';

class DatabaseStore {
  private customers: Map<string, Customer> = new Map();
  private bookings: Map<string, Booking[]> = new Map();
  private policies: Policy[] = [];
  private resolutions: Resolution[] = [];
  private escalations: Escalation[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Seed Customers
    const initialCustomers: Customer[] = [
      {
        id: 'cust_1',
        name: 'Priya Nair',
        loyaltyTier: 'Gold',
        bookingReference: 'SK4821X',
        email: 'priya.nair@example.com',
        phone: '+91-98xxxxxxx1',
        flightsLast12Months: 6,
        previousComplaint: 'Delayed baggage, resolved with voucher',
      },
      {
        id: 'cust_2',
        name: 'Arvind Kulkarni',
        loyaltyTier: 'Silver',
        bookingReference: 'TR1190B',
        email: 'arvind.kulkarni@example.com',
        phone: '+91-98xxxxxxx2',
        flightsLast12Months: 3,
        previousComplaint: 'None',
      },
      {
        id: 'cust_3',
        name: 'Meher Kaur',
        loyaltyTier: 'Platinum',
        bookingReference: 'WL7742',
        email: 'meher.kaur@example.com',
        phone: '+91-98xxxxxxx3',
        flightsLast12Months: 10,
        previousComplaint: 'Overbooking, resolved with tier-status upgrade',
      },
    ];

    for (const c of initialCustomers) {
      this.customers.set(c.bookingReference.toUpperCase(), c);
    }

    // Seed Bookings
    const initialBookings: Booking[] = [
      {
        id: 'bk_1',
        customerId: 'cust_1',
        pnr: 'SK4821X',
        flightNumber: 'SK-204',
        route: 'Delhi → Goa',
        date: 'Wed 23 Sep 2026',
        scheduledDeparture: '18:40',
        newDeparture: null,
        delayHours: 0,
        status: 'Cancelled',
        disruptionReason: 'Operational reasons',
        isReturnFlight: false,
      },
      {
        id: 'bk_1_ret',
        customerId: 'cust_1',
        pnr: 'SK4821X',
        flightNumber: 'SK-205',
        route: 'Goa → Delhi',
        date: 'Fri 25 Sep 2026',
        scheduledDeparture: '16:20',
        newDeparture: null,
        delayHours: 0,
        status: 'Unaffected',
        disruptionReason: null,
        isReturnFlight: true,
      },
      {
        id: 'bk_2',
        customerId: 'cust_2',
        pnr: 'TR1190B',
        flightNumber: 'SK-118',
        route: 'Mumbai → Bengaluru',
        date: 'Wed 23 Sep 2026',
        scheduledDeparture: '07:10',
        newDeparture: '11:10',
        delayHours: 4,
        status: 'Delayed 4 hours',
        disruptionReason: 'Operational reasons',
        isReturnFlight: false,
      },
      {
        id: 'bk_3',
        customerId: 'cust_3',
        pnr: 'WL7742',
        flightNumber: 'SK-305',
        route: 'Delhi → Hyderabad',
        date: 'Wed 23 Sep 2026',
        scheduledDeparture: '14:00',
        newDeparture: '20:00',
        delayHours: 6,
        status: 'Delayed 6 hours',
        disruptionReason: 'Operational reasons',
        isReturnFlight: false,
      },
    ];

    for (const b of initialBookings) {
      const pnrKey = b.pnr.toUpperCase();
      const existing = this.bookings.get(pnrKey) || [];
      existing.push(b);
      this.bookings.set(pnrKey, existing);
    }

    // Seed Policies
    this.policies = [
      {
        id: 'pol_1',
        policyType: 'Cancellation Rebooking',
        rule: 'Free rebooking on the next available flight within 24 hours OR full refund. No fare charged for airline-caused cancellation.',
        enabled: true,
      },
      {
        id: 'pol_2',
        policyType: 'Delay Compensation (< 3 hours)',
        rule: 'Customer receives ₹500 meal voucher.',
        enabled: true,
      },
      {
        id: 'pol_3',
        policyType: 'Delay Compensation (> 3 hours)',
        rule: 'Customer receives meal voucher and airport lounge access.',
        enabled: true,
      },
      {
        id: 'pol_4',
        policyType: 'Delay Compensation (> 5 hours)',
        rule: 'Customer receives meal voucher, lounge access, and hotel accommodation covering ONLY delayed hours (NOT a full night stay).',
        enabled: true,
      },
      {
        id: 'pol_5',
        policyType: 'Refund Processing',
        rule: 'Full refund processed within 7 business days ONLY to original payment method. Alternative payment methods not permitted.',
        enabled: true,
      },
      {
        id: 'pol_6',
        policyType: 'Fare Difference Waiver',
        rule: 'Agent can waive/process voluntary higher-fare rebooking if difference <= ₹1,500. Differences > ₹1,500 require supervisor escalation.',
        enabled: true,
      },
      {
        id: 'pol_7',
        policyType: 'Loyalty Benefits',
        rule: 'Gold and Platinum customers receive priority rebooking & first access to next-available seats, but DO NOT receive extra compensation or free upgrades beyond policy.',
        enabled: true,
      },
      {
        id: 'pol_8',
        policyType: 'Mandatory Escalation',
        rule: 'Immediately escalate threats of legal action/lawyer/court, formal complaints, fare differences > ₹1,500, non-standard compensation demands, or alternate refund methods.',
        enabled: true,
      },
    ];
  }

  // Customers
  getAllCustomers(): Customer[] {
    return Array.from(this.customers.values());
  }

  getCustomerByPNR(pnr: string): Customer | null {
    if (!pnr) return null;
    return this.customers.get(pnr.trim().toUpperCase()) || null;
  }

  getCustomerById(id: string): Customer | null {
    for (const c of this.customers.values()) {
      if (c.id === id) return c;
    }
    return null;
  }

  // Bookings
  getBookingsByPNR(pnr: string): Booking[] {
    if (!pnr) return [];
    return this.bookings.get(pnr.trim().toUpperCase()) || [];
  }

  getPrimaryDisruptedBooking(pnr: string): Booking | null {
    const list = this.getBookingsByPNR(pnr);
    if (list.length === 0) return null;
    // Prefer disrupted flight (cancelled or delayed) over unaffected return flights
    const disrupted = list.find((b) => b.status === 'Cancelled' || b.status.startsWith('Delayed'));
    return disrupted || list[0];
  }

  // Policies
  getPolicies(): Policy[] {
    return this.policies;
  }

  // Resolutions
  addResolution(customerId: string, bookingId: string, action: string, details: string, status: Resolution['status'] = 'completed'): Resolution {
    const res: Resolution = {
      id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      customerId,
      bookingId,
      action,
      details,
      status,
      createdAt: new Date().toISOString(),
    };
    this.resolutions.unshift(res);
    return res;
  }

  getResolutions(customerId?: string): Resolution[] {
    if (customerId) {
      return this.resolutions.filter((r) => r.customerId === customerId);
    }
    return this.resolutions;
  }

  // Escalations
  addEscalation(customerId: string, bookingId: string, reason: string, details: string): Escalation {
    const esc: Escalation = {
      id: `esc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      customerId,
      bookingId,
      reason,
      details,
      status: 'pending_supervisor',
      createdAt: new Date().toISOString(),
    };
    this.escalations.unshift(esc);
    return esc;
  }

  getEscalations(customerId?: string): Escalation[] {
    if (customerId) {
      return this.escalations.filter((e) => e.customerId === customerId);
    }
    return this.escalations;
  }
}

export const db = new DatabaseStore();
