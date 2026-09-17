import { db } from '../db/database.ts';
import { PolicyEngine } from '../services/policyEngine.ts';
import { DialogEngine } from '../services/dialogEngine.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('\n--- Running Customer Resolution Agent Policy Tests ---\n');

// 1. Customer 1 — Priya Nair (Gold, PNR: SK4821X)
console.log('Testing Scenario 1: Priya Nair (Cancelled Flight SK-204)');
const priya = db.getCustomerByPNR('SK4821X')!;
assert(priya !== null && priya.name === 'Priya Nair', 'Customer Priya Nair found by PNR SK4821X');
assert(priya.loyaltyTier === 'Gold', 'Priya has Gold loyalty tier');

const priyaBooking = db.getPrimaryDisruptedBooking('SK4821X')!;
assert(priyaBooking.status === 'Cancelled', 'Priya flight SK-204 is marked Cancelled');

const priyaEval = PolicyEngine.evaluateCancellation(priyaBooking, priya);
assert(priyaEval.isEligible === true, 'Priya is eligible for cancellation resolution');
assert(priyaEval.options.refund.eligible === true, 'Refund option is eligible');
assert(priyaEval.options.refund.processingTime === '7 business days', 'Refund processing time is 7 business days');
assert(priyaEval.options.refund.paymentMethodRule === 'Original payment method only', 'Refund restricted to original payment method only');
assert(priyaEval.options.rebooking.eligible === true, 'Rebooking option is eligible');
assert(priyaEval.options.rebooking.priority === true, 'Gold tier priority applied to rebooking');

// Priya asks for extra upgrade
const priyaUpgradeResp = DialogEngine.processMessage('I want a full cash refund plus a free business-class upgrade on my return flight for the trouble.', priya, priyaBooking);
assert(priyaUpgradeResp.text.includes('does not qualify for additional cash compensation or complimentary cabin upgrades') || priyaUpgradeResp.text.includes('does not provide additional'), 'Agent denies extra business class upgrade');

// Priya mentions legal action
const priyaLegalResp = DialogEngine.processMessage('I will take legal action against the airline', priya, priyaBooking);
assert(priyaLegalResp.isEscalation === true, 'Mentions of legal action immediately trigger escalation');


// 2. Customer 2 — Arvind Kulkarni (Silver, PNR: TR1190B)
console.log('\nTesting Scenario 2: Arvind Kulkarni (4h Delay Flight SK-118)');
const arvind = db.getCustomerByPNR('TR1190B')!;
assert(arvind !== null && arvind.name === 'Arvind Kulkarni', 'Customer Arvind found by PNR TR1190B');
assert(arvind.loyaltyTier === 'Silver', 'Arvind has Silver loyalty tier');

const arvindBooking = db.getPrimaryDisruptedBooking('TR1190B')!;
assert(arvindBooking.delayHours === 4, 'Arvind flight delay is 4 hours');

const arvindEval = PolicyEngine.evaluateDelay(4);
assert(arvindEval.benefits.mealVoucher.eligible === true, 'Arvind qualifies for meal voucher');
assert(arvindEval.benefits.loungeAccess.eligible === true, 'Arvind qualifies for lounge access (>3h)');
assert(arvindEval.benefits.hotelAccommodation.eligible === false, 'Arvind DOES NOT qualify for hotel accommodation (delay <= 5h)');

// Arvind asks for hotel
const arvindHotelResp = DialogEngine.processMessage('I missed my meeting. Give me a hotel because this delay is too long.', arvind, arvindBooking);
assert(arvindHotelResp.text.includes('Hotel accommodation applies strictly to delays of more than 5 hours') || arvindHotelResp.text.includes('cannot arrange a hotel'), 'Agent denies hotel for 4-hour delay');


// 3. Customer 3 — Meher Kaur (Platinum, PNR: WL7742)
console.log('\nTesting Scenario 3: Meher Kaur (6h Delay Flight SK-305)');
const meher = db.getCustomerByPNR('WL7742')!;
assert(meher !== null && meher.name === 'Meher Kaur', 'Customer Meher found by PNR WL7742');
assert(meher.loyaltyTier === 'Platinum', 'Meher has Platinum loyalty tier');

const meherBooking = db.getPrimaryDisruptedBooking('WL7742')!;
assert(meherBooking.delayHours === 6, 'Meher flight delay is 6 hours');

const meherEval = PolicyEngine.evaluateDelay(6);
assert(meherEval.benefits.mealVoucher.eligible === true, 'Meher qualifies for meal voucher');
assert(meherEval.benefits.loungeAccess.eligible === true, 'Meher qualifies for lounge access');
assert(meherEval.benefits.hotelAccommodation.eligible === true, 'Meher qualifies for hotel accommodation (>5h)');
assert(meherEval.benefits.hotelAccommodation.isDelayedHoursOnly === true, 'Meher hotel covers ONLY delayed hours');

// Meher asks for full night hotel
const meherFullNightResp = DialogEngine.processMessage('I want a hotel for the full night', meher, meherBooking);
console.log('Meher full night response text:', meherFullNightResp.text);
assert(meherFullNightResp.text.includes('delayed hours') && (meherFullNightResp.text.includes('NOT') || meherFullNightResp.text.includes('not provide a full night')), 'Agent clarifies hotel is delayed hours only, not full night');

// Meher asks for ₹2,000 higher-fare flight
const meherFareResp = DialogEngine.processMessage('Can you put me on this higher-fare flight with ₹2,000 difference?', meher, meherBooking);
assert(meherFareResp.text.includes('cannot waive') && meherFareResp.text.includes('supervisor'), 'Agent refuses to waive ₹2,000 fare difference and escalates');

// 4. Invalid PNR check
console.log('\nTesting Invalid PNR Lookup');
const invalidCust = db.getCustomerByPNR('INVALID999');
assert(invalidCust === null, 'Invalid PNR returns null');

console.log('\n🎉 ALL POLICY TESTS PASSED SUCCESSFULLY!\n');
