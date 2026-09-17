import { Router, Request, Response } from 'express';
import { db } from '../db/database.ts';
import { DialogEngine } from '../services/dialogEngine.ts';
import { PolicyEngine } from '../services/policyEngine.ts';

export const apiRouter = Router();

// 1. Get all customer test profiles
apiRouter.get('/customers', (_req: Request, res: Response) => {
  const customers = db.getAllCustomers();
  res.json({ success: true, customers });
});

// 2. Lookup customer by PNR
apiRouter.post('/auth/lookup', (req: Request, res: Response) => {
  const { pnr } = req.body;
  if (!pnr) {
    return res.status(400).json({ success: false, message: 'Booking reference is required.' });
  }

  const customer = db.getCustomerByPNR(pnr);
  if (!customer) {
    return res.status(404).json({
      success: false,
      message: "We couldn't find a booking with this reference.",
    });
  }

  const bookings = db.getBookingsByPNR(pnr);
  const primaryBooking = db.getPrimaryDisruptedBooking(pnr);

  res.json({
    success: true,
    customer,
    bookings,
    primaryBooking,
  });
});

// 3. Get bookings by PNR
apiRouter.get('/bookings/:pnr', (req: Request, res: Response) => {
  const { pnr } = req.params;
  const bookings = db.getBookingsByPNR(pnr);
  const customer = db.getCustomerByPNR(pnr);

  if (!customer) {
    return res.status(404).json({ success: false, message: "We couldn't find a booking with this reference." });
  }

  res.json({ success: true, customer, bookings });
});

// 4. Get active policies
apiRouter.get('/policies', (_req: Request, res: Response) => {
  const policies = db.getPolicies();
  res.json({ success: true, policies });
});

// 5. Initial Chat Greeting
apiRouter.post('/chat/initial', (req: Request, res: Response) => {
  const { customerId, pnr } = req.body;
  const customer = db.getCustomerByPNR(pnr) || db.getCustomerById(customerId);
  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer not found.' });
  }

  const booking = db.getPrimaryDisruptedBooking(customer.bookingReference);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }

  const greetingMessage = DialogEngine.getInitialGreeting(customer, booking);
  res.json({ success: true, message: greetingMessage });
});

// 6. Process Chat Message
apiRouter.post('/chat', (req: Request, res: Response) => {
  const { customerId, pnr, message } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, message: 'Message text is required.' });
  }

  const customer = db.getCustomerByPNR(pnr) || db.getCustomerById(customerId);
  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer not found.' });
  }

  const booking = db.getPrimaryDisruptedBooking(customer.bookingReference);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }

  const responseMessage = DialogEngine.processMessage(message, customer, booking);
  res.json({ success: true, message: responseMessage });
});

// 7. Execute Allowed Action
apiRouter.post('/actions/execute', (req: Request, res: Response) => {
  const { customerId, pnr, actionType, details } = req.body;
  if (!actionType) {
    return res.status(400).json({ success: false, message: 'Action type is required.' });
  }

  const customer = db.getCustomerByPNR(pnr) || db.getCustomerById(customerId);
  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer not found.' });
  }

  const booking = db.getPrimaryDisruptedBooking(customer.bookingReference);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }

  const result = DialogEngine.executeAction(actionType, customer, booking, details);
  res.json({
    success: true,
    message: result.message,
    resolution: result.resolution,
  });
});

// 8. Get Resolutions
apiRouter.get('/resolutions/:customerId', (req: Request, res: Response) => {
  const { customerId } = req.params;
  const resolutions = db.getResolutions(customerId);
  res.json({ success: true, resolutions });
});

// 9. Get Escalations
apiRouter.get('/escalations', (_req: Request, res: Response) => {
  const escalations = db.getEscalations();
  res.json({ success: true, escalations });
});

// 10. Policy Evaluation Endpoint (for Policy Inspector / Debugger)
apiRouter.post('/policies/evaluate', (req: Request, res: Response) => {
  const { pnr, message, fareDifference } = req.body;
  const customer = db.getCustomerByPNR(pnr);
  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer not found.' });
  }

  const booking = db.getPrimaryDisruptedBooking(pnr);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }

  const delayHours = booking.delayHours || (booking.status.includes('4') ? 4 : booking.status.includes('6') ? 6 : 0);
  const cancellationEval = PolicyEngine.evaluateCancellation(booking, customer);
  const delayEval = PolicyEngine.evaluateDelay(delayHours);
  const fareEval = fareDifference ? PolicyEngine.evaluateFareDifference(fareDifference) : null;
  const loyaltyEval = PolicyEngine.evaluateLoyaltyBenefits(customer.loyaltyTier);
  const escalationCheck = message ? PolicyEngine.checkEscalationTriggers(message) : null;

  res.json({
    success: true,
    cancellationEval,
    delayEval,
    fareEval,
    loyaltyEval,
    escalationCheck,
  });
});

// 11. Reset Context
apiRouter.post('/reset', (req: Request, res: Response) => {
  const { customerId } = req.body;
  if (customerId) {
    DialogEngine.resetContext(customerId);
  }
  res.json({ success: true, message: 'Context reset successfully.' });
});
