import { Booking, Customer, LoyaltyTier, ActionOption } from '../types/index.ts';

export interface CancellationEvaluation {
  isEligible: boolean;
  options: {
    rebooking: {
      eligible: boolean;
      description: string;
      cost: number;
      priority: boolean;
    };
    refund: {
      eligible: boolean;
      description: string;
      processingTime: string;
      paymentMethodRule: string;
      amount: string;
    };
  };
  policyNotice: string;
}

export interface DelayEvaluation {
  delayHours: number;
  benefits: {
    mealVoucher: {
      eligible: boolean;
      amount?: string;
      description: string;
    };
    loungeAccess: {
      eligible: boolean;
      description: string;
    };
    hotelAccommodation: {
      eligible: boolean;
      description: string;
      isDelayedHoursOnly: boolean;
    };
  };
  ineligibleReason?: string;
  policySummary: string;
}

export interface FareDifferenceEvaluation {
  fareDifference: number;
  canAgentWaiveOrProceed: boolean;
  requiresSupervisorEscalation: boolean;
  explanation: string;
}

export interface EscalationCheckResult {
  requiresEscalation: boolean;
  reason?: string;
  ruleCitation?: string;
}

export class PolicyEngine {
  /**
   * Section 5.1 & Section 5.3: Cancellation Policy Evaluation
   */
  static evaluateCancellation(booking: Booking, customer?: Customer): CancellationEvaluation {
    const isCancelled = booking.status === 'Cancelled';
    const isPriority = customer?.loyaltyTier === 'Gold' || customer?.loyaltyTier === 'Platinum';

    return {
      isEligible: isCancelled,
      options: {
        rebooking: {
          eligible: isCancelled,
          description: 'Free rebooking on the next available flight within 24 hours (airline-caused cancellation).',
          cost: 0,
          priority: isPriority,
        },
        refund: {
          eligible: isCancelled,
          description: 'Full refund to the original payment method processed within 7 business days.',
          processingTime: '7 business days',
          paymentMethodRule: 'Original payment method only',
          amount: '100% Full Refund',
        },
      },
      policyNotice: isCancelled
        ? 'Under the airline disruption policy for operational cancellations, you are entitled to choose between: 1) Free rebooking on the next available flight within 24 hours, or 2) A 100% full refund to your original payment method.'
        : 'This flight is not marked as cancelled.',
    };
  }

  /**
   * Section 5.2: Delay Compensation Rule
   * - < 3 hours: ₹500 meal voucher
   * - > 3 hours: Meal voucher + Lounge access
   * - > 5 hours: Meal voucher + Lounge access + Hotel accommodation covering ONLY delayed hours (NOT full night)
   */
  static evaluateDelay(delayHours: number): DelayEvaluation {
    if (delayHours <= 0) {
      return {
        delayHours: 0,
        benefits: {
          mealVoucher: { eligible: false, description: 'No meal voucher applicable for on-time flights.' },
          loungeAccess: { eligible: false, description: 'No lounge access applicable.' },
          hotelAccommodation: { eligible: false, description: 'No hotel accommodation applicable.', isDelayedHoursOnly: false },
        },
        policySummary: 'Flight is not delayed.',
      };
    }

    if (delayHours < 3) {
      return {
        delayHours,
        benefits: {
          mealVoucher: { eligible: true, amount: '₹500', description: '₹500 meal voucher for delays under 3 hours.' },
          loungeAccess: { eligible: false, description: 'Lounge access requires a delay of more than 3 hours.' },
          hotelAccommodation: { eligible: false, description: 'Hotel accommodation requires a delay of more than 5 hours.', isDelayedHoursOnly: false },
        },
        policySummary: 'Delays under 3 hours qualify for a ₹500 meal voucher.',
      };
    }

    if (delayHours <= 5) {
      return {
        delayHours,
        benefits: {
          mealVoucher: { eligible: true, amount: 'Standard Meal Voucher', description: 'Complimentary meal voucher for delay > 3 hours.' },
          loungeAccess: { eligible: true, description: 'Complimentary airport lounge access pass.' },
          hotelAccommodation: { eligible: false, description: 'Hotel accommodation is only provided for delays exceeding 5 hours.', isDelayedHoursOnly: false },
        },
        ineligibleReason: 'Hotel accommodation applies strictly to delays of more than 5 hours. Your 4-hour delay does not qualify for hotel accommodation.',
        policySummary: 'Delays of more than 3 hours qualify for a meal voucher and airport lounge access.',
      };
    }

    // Delay > 5 hours
    return {
      delayHours,
      benefits: {
        mealVoucher: { eligible: true, amount: 'Standard Meal Voucher', description: 'Complimentary meal voucher for delay > 3 hours.' },
        loungeAccess: { eligible: true, description: 'Complimentary airport lounge access pass.' },
        hotelAccommodation: {
          eligible: true,
          description: 'Day-use hotel accommodation covering ONLY the delayed hours (strictly NOT a full night stay).',
          isDelayedHoursOnly: true,
        },
      },
      policySummary: 'Delays of more than 5 hours qualify for a meal voucher, airport lounge access, and hotel accommodation covering only the delayed hours.',
    };
  }

  /**
   * Section 5.4: Fare Difference Rule
   * - Difference <= ₹1,500: Agent can proceed
   * - Difference > ₹1,500: Must escalate to supervisor/human agent
   */
  static evaluateFareDifference(fareDifference: number): FareDifferenceEvaluation {
    if (fareDifference <= 1500) {
      return {
        fareDifference,
        canAgentWaiveOrProceed: true,
        requiresSupervisorEscalation: false,
        explanation: `Fare difference is ₹${fareDifference.toLocaleString('en-IN')}, which is within the ₹1,500 agent authorization limit.`,
      };
    }

    return {
      fareDifference,
      canAgentWaiveOrProceed: false,
      requiresSupervisorEscalation: true,
      explanation: `The fare difference is ₹${fareDifference.toLocaleString('en-IN')}. Under airline policy, agents cannot waive fare differences exceeding ₹1,500 without supervisor approval. This request must be escalated to a supervisor.`,
    };
  }

  /**
   * Section 5.5: Loyalty Tier Rule
   * - Gold & Platinum receive priority rebooking & first access to next-available seats.
   * - DO NOT receive extra compensation or free upgrades beyond standard policy.
   */
  static evaluateLoyaltyBenefits(tier: LoyaltyTier): { priorityRebooking: boolean; extraCompensationAllowed: boolean; explanation: string } {
    const isPriority = tier === 'Gold' || tier === 'Platinum';
    return {
      priorityRebooking: isPriority,
      extraCompensationAllowed: false,
      explanation: isPriority
        ? `${tier} tier members receive priority rebooking and first access to next-available seats. However, loyalty tiers do not provide additional cash compensation or free cabin upgrades beyond standard policy.`
        : 'Silver tier members follow standard rebooking and compensation guidelines.',
    };
  }

  /**
   * Section 8: Escalation Triggers Check
   */
  static checkEscalationTriggers(text: string, context?: { fareDifference?: number; isAltPayment?: boolean; asksExtraCompensation?: boolean }): EscalationCheckResult {
    const lower = text.toLowerCase();

    // Case 3: Legal Action / Lawyer / Court / Legal complaint
    const legalKeywords = ['legal action', 'lawyer', 'court', 'sue', 'lawsuit', 'legal complaint', 'consumer forum', 'advocate', 'legal notice'];
    for (const kw of legalKeywords) {
      if (lower.includes(kw)) {
        return {
          requiresEscalation: true,
          reason: 'Legal Action / Legal Consultation Mentioned',
          ruleCitation: 'Section 8 Case 3: Customer mentioned legal proceedings or representation. Immediate human agent handover mandatory.',
        };
      }
    }

    // Case 4: Formal Complaint
    const complaintKeywords = ['formal complaint', 'file a complaint', 'official complaint', 'escalate complaint', 'register a complaint', 'lodge a complaint'];
    for (const kw of complaintKeywords) {
      if (lower.includes(kw)) {
        return {
          requiresEscalation: true,
          reason: 'Formal Complaint Requested',
          ruleCitation: 'Section 8 Case 4: Customer requested to file a formal complaint. Mandatory human escalation.',
        };
      }
    }

    // Case 5: Different Refund Payment Method (Section 8 Case 5)
    const altPaymentKeywords = [
      'different account',
      'different card',
      'different bank',
      'another card',
      'another account',
      'different payment method',
      'alternative payment method',
      'crypto',
      'cash instead of original',
      'transfer to another bank',
      'refund to a different',
      'send to another account',
    ];
    if (context?.isAltPayment || altPaymentKeywords.some((kw) => lower.includes(kw))) {
      return {
        requiresEscalation: true,
        reason: 'Refund Requested to Different Payment Method',
        ruleCitation: 'Section 8 Case 5 & Section 5.3: Refunds can only be processed to the original payment method within 7 business days. Exceptions require specialist review.',
      };
    }

    // Case 2: Fare Difference > ₹1,500
    if (context?.fareDifference && context.fareDifference > 1500) {
      return {
        requiresEscalation: true,
        reason: `Fare Difference (₹${context.fareDifference}) Exceeds Agent Limit of ₹1,500`,
        ruleCitation: 'Section 8 Case 2 & Section 5.4: Fare difference exceeds ₹1,500 authorization cap. Supervisor escalation required.',
      };
    }

    return {
      requiresEscalation: false,
    };
  }

  /**
   * Generates actionable UI buttons based on booking and delay status
   */
  static getEligibleActions(booking: Booking, customer?: Customer): ActionOption[] {
    const actions: ActionOption[] = [];

    if (booking.status === 'Cancelled') {
      actions.push({
        id: 'req_refund',
        type: 'refund',
        label: 'Request Full Refund',
        description: '100% refund to original payment method within 7 business days',
        variant: 'primary',
        requiresConfirmation: true,
        confirmationDetails: {
          title: 'Confirm Full Refund Request',
          description: 'Please review the refund details before confirming:',
          fields: [
            { label: 'Booking Reference', value: booking.pnr },
            { label: 'Cancelled Flight', value: `${booking.flightNumber} (${booking.route})` },
            { label: 'Refund Amount', value: '100% Full Refund' },
            { label: 'Processing Timeline', value: 'Within 7 business days' },
            { label: 'Destination', value: 'Original payment method only' },
          ],
        },
      });

      actions.push({
        id: 'req_rebook',
        type: 'rebook',
        label: customer?.loyaltyTier === 'Gold' || customer?.loyaltyTier === 'Platinum'
          ? `Priority Rebooking (${customer.loyaltyTier})`
          : 'Request Rebooking',
        description: 'Next available flight within 24 hours at no extra charge',
        variant: 'secondary',
        requiresConfirmation: false,
      });
    } else if (booking.status.startsWith('Delayed')) {
      const delayHours = booking.delayHours || (booking.status.includes('4') ? 4 : booking.status.includes('6') ? 6 : 0);
      const evalResult = this.evaluateDelay(delayHours);

      if (evalResult.benefits.mealVoucher.eligible) {
        actions.push({
          id: 'claim_meal',
          type: 'meal_voucher',
          label: 'Claim Meal Voucher',
          description: 'Digital airport meal voucher',
          variant: 'primary',
        });
      }

      if (evalResult.benefits.loungeAccess.eligible) {
        actions.push({
          id: 'claim_lounge',
          type: 'lounge_access',
          label: 'Provide Lounge Access',
          description: 'Instant airport lounge access QR pass',
          variant: 'primary',
        });
      }

      if (evalResult.benefits.hotelAccommodation.eligible) {
        actions.push({
          id: 'claim_hotel',
          type: 'delayed_hotel',
          label: 'Arrange Delayed-Hours Hotel',
          description: 'Day-use hotel covering only delayed hours (not full night)',
          variant: 'warning',
          requiresConfirmation: true,
          confirmationDetails: {
            title: 'Confirm Delayed-Hours Hotel Accommodation',
            description: 'Please verify the hotel accommodation policy details:',
            fields: [
              { label: 'Flight', value: `${booking.flightNumber} (Delayed by ${delayHours} hours)` },
              { label: 'Duration Covered', value: `Delayed hours only (until new departure at ${booking.newDeparture || '20:00'})` },
              { label: 'Policy Condition', value: 'Does NOT cover a full night stay' },
            ],
          },
        });
      }
    }

    // Always offer escalation if needed
    actions.push({
      id: 'escalate_agent',
      type: 'escalate',
      label: 'Escalate to Human Agent',
      description: 'Connect with a senior airline resolution specialist',
      variant: 'secondary',
    });

    return actions;
  }
}
