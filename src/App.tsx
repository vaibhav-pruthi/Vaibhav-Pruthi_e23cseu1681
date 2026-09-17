import React, { useState, useEffect } from 'react';
import { Customer, Booking, Policy, ChatMessage, ActionOption, Resolution, Escalation } from './types/index.ts';
import { Navbar } from './components/Navbar.tsx';
import { LandingHero } from './components/LandingHero.tsx';
import { CustomerDashboard } from './components/CustomerDashboard.tsx';
import { ChatInterface } from './components/ChatInterface.tsx';
import { ConfirmationModal } from './components/ConfirmationModal.tsx';
import { EscalationModal } from './components/EscalationModal.tsx';
import { PolicyInspector } from './components/PolicyInspector.tsx';

export const App: React.FC = () => {
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [primaryBooking, setPrimaryBooking] = useState<Booking | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [escalations, setEscalations] = useState<Escalation[]>([]);

  // UI States
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isPolicyInspectorOpen, setIsPolicyInspectorOpen] = useState(false);

  // Modals
  const [pendingAction, setPendingAction] = useState<ActionOption | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isEscalationModalOpen, setIsEscalationModalOpen] = useState(false);
  const [escalationReason, setEscalationReason] = useState<string>('Supervisor Authorization Required');

  // 1. Initial Load: Customers & Policies
  useEffect(() => {
    fetchCustomers();
    fetchPolicies();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (data.success) {
        setAllCustomers(data.customers);
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    }
  };

  const fetchPolicies = async () => {
    try {
      const res = await fetch('/api/policies');
      const data = await res.json();
      if (data.success) {
        setPolicies(data.policies);
      }
    } catch (err) {
      console.error('Failed to fetch policies:', err);
    }
  };

  // 2. Lookup by PNR
  const handleLookupPNR = async (pnr: string) => {
    setIsLoadingAuth(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/auth/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pnr }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setAuthError(data.message || "We couldn't find a booking with this reference.");
        setIsLoadingAuth(false);
        return;
      }

      setCurrentCustomer(data.customer);
      setAllBookings(data.bookings);
      setPrimaryBooking(data.primaryBooking);

      // Load initial chat greeting
      await loadInitialGreeting(data.customer.id, data.customer.bookingReference);
      await fetchResolutions(data.customer.id);
      await fetchEscalations(data.customer.id);
    } catch (err) {
      console.error('Error in PNR lookup:', err);
      setAuthError('Connection error. Please try again.');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleSelectCustomer = async (customer: Customer) => {
    await handleLookupPNR(customer.bookingReference);
  };

  const loadInitialGreeting = async (customerId: string, pnr: string) => {
    setIsTyping(true);
    try {
      const res = await fetch('/api/chat/initial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, pnr }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages([data.message]);
      }
    } catch (err) {
      console.error('Error loading greeting:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const fetchResolutions = async (customerId: string) => {
    try {
      const res = await fetch(`/api/resolutions/${customerId}`);
      const data = await res.json();
      if (data.success) {
        setResolutions(data.resolutions);
      }
    } catch (err) {
      console.error('Error fetching resolutions:', err);
    }
  };

  const fetchEscalations = async (_customerId?: string) => {
    try {
      const res = await fetch('/api/escalations');
      const data = await res.json();
      if (data.success) {
        setEscalations(data.escalations);
      }
    } catch (err) {
      console.error('Error fetching escalations:', err);
    }
  };

  // 3. Send Customer Chat Message
  const handleSendMessage = async (text: string) => {
    if (!currentCustomer || !primaryBooking || !text.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: currentCustomer.id,
          pnr: currentCustomer.bookingReference,
          message: text,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
        if (data.message.isEscalation) {
          await fetchEscalations(currentCustomer.id);
        }
      }
    } catch (err) {
      console.error('Error in chat:', err);
    } finally {
      setIsTyping(false);
    }
  };

  // 4. Action Button Handling
  const handleActionClick = (action: ActionOption) => {
    if (action.requiresConfirmation) {
      setPendingAction(action);
      setIsConfirmModalOpen(true);
    } else {
      executeAction(action.type);
    }
  };

  const handleConfirmModalAction = async () => {
    if (pendingAction) {
      setIsConfirmModalOpen(false);
      await executeAction(pendingAction.type, pendingAction.confirmationDetails);
      setPendingAction(null);
    }
  };

  const executeAction = async (actionType: string, details?: any) => {
    if (!currentCustomer || !primaryBooking) return;

    setIsTyping(true);
    try {
      const res = await fetch('/api/actions/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: currentCustomer.id,
          pnr: currentCustomer.bookingReference,
          actionType,
          details,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
        await fetchResolutions(currentCustomer.id);
        await fetchEscalations(currentCustomer.id);
      }
    } catch (err) {
      console.error('Error executing action:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleOpenEscalationModal = (reason?: string) => {
    setEscalationReason(reason || 'Supervisor Authorization Required');
    setIsEscalationModalOpen(true);
  };

  const handleConfirmEscalation = async (reason: string, notes: string) => {
    await executeAction('escalate', { reason, text: notes });
    await fetchEscalations();
  };

  const handleResetSession = async () => {
    if (currentCustomer) {
      await fetch('/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: currentCustomer.id }),
      });
      await loadInitialGreeting(currentCustomer.id, currentCustomer.bookingReference);
      await fetchResolutions(currentCustomer.id);
      await fetchEscalations(currentCustomer.id);
    }
  };

  const handleLogout = () => {
    setCurrentCustomer(null);
    setPrimaryBooking(null);
    setAllBookings([]);
    setMessages([]);
    setResolutions([]);
    setEscalations([]);
    setAuthError(null);
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentCustomer={currentCustomer}
        allCustomers={allCustomers}
        onSelectCustomer={handleSelectCustomer}
        onLogout={handleLogout}
        onOpenPolicyInspector={() => setIsPolicyInspectorOpen(true)}
        onResetSession={handleResetSession}
      />

      {/* Main Workspace View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        {!currentCustomer || !primaryBooking ? (
          /* Landing Screen */
          <LandingHero
            onLookupPNR={handleLookupPNR}
            onSelectCustomer={handleSelectCustomer}
            allCustomers={allCustomers}
            isLoading={isLoadingAuth}
            errorMessage={authError}
          />
        ) : (
          /* 2-Column Resolution Workspace (Dashboard + Chat) */
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-9rem)]">
            
            {/* Left Column: Disruption Dashboard & Passenger Status */}
            <div className="lg:col-span-5 flex flex-col">
              <CustomerDashboard
                customer={currentCustomer}
                primaryBooking={primaryBooking}
                allBookings={allBookings}
                resolutions={resolutions}
                escalations={escalations}
                onTriggerQuickAction={(actType) => {
                  if (actType === 'refund') {
                    handleActionClick({
                      id: 'refund_quick',
                      type: 'refund',
                      label: 'Full Refund Request',
                      description: '100% refund within 7 business days to original payment method',
                      requiresConfirmation: true,
                      confirmationDetails: {
                        title: 'Confirm Full Refund Request',
                        description: 'Please review the refund details before confirming:',
                        fields: [
                          { label: 'Booking Reference', value: primaryBooking.pnr },
                          { label: 'Flight', value: `${primaryBooking.flightNumber} (${primaryBooking.route})` },
                          { label: 'Refund Amount', value: '100% Full Refund' },
                          { label: 'Processing Timeline', value: 'Within 7 business days' },
                          { label: 'Destination', value: 'Original payment method only' },
                        ],
                      },
                    });
                  } else if (actType === 'delayed_hotel') {
                    handleActionClick({
                      id: 'hotel_quick',
                      type: 'delayed_hotel',
                      label: 'Delayed-Hours Hotel Voucher',
                      description: 'Day-use hotel covering only delayed hours (not full night)',
                      requiresConfirmation: true,
                      confirmationDetails: {
                        title: 'Confirm Delayed-Hours Hotel Accommodation',
                        description: 'Please verify the hotel accommodation policy details:',
                        fields: [
                          { label: 'Flight', value: `${primaryBooking.flightNumber} (Delayed by ${primaryBooking.delayHours} hours)` },
                          { label: 'Duration Covered', value: `Delayed hours only (until new departure at ${primaryBooking.newDeparture})` },
                          { label: 'Policy Condition', value: 'Does NOT cover a full night stay' },
                        ],
                      },
                    });
                  } else if (actType === 'escalate') {
                    handleOpenEscalationModal();
                  } else {
                    executeAction(actType);
                  }
                }}
              />
            </div>

            {/* Right Column: AI Resolution Chat Window */}
            <div className="lg:col-span-7 flex flex-col">
              <ChatInterface
                customer={currentCustomer}
                primaryBooking={primaryBooking}
                messages={messages}
                isTyping={isTyping}
                onSendMessage={handleSendMessage}
                onActionClick={handleActionClick}
                onOpenEscalationModal={handleOpenEscalationModal}
              />
            </div>

          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        action={pendingAction}
        onConfirm={handleConfirmModalAction}
        onCancel={() => {
          setIsConfirmModalOpen(false);
          setPendingAction(null);
        }}
      />

      {/* Escalation Modal */}
      {currentCustomer && primaryBooking && (
        <EscalationModal
          isOpen={isEscalationModalOpen}
          reason={escalationReason}
          pnr={currentCustomer.bookingReference}
          customerName={currentCustomer.name}
          onConfirmEscalation={handleConfirmEscalation}
          onClose={() => setIsEscalationModalOpen(false)}
        />
      )}

      {/* Policy Inspector Drawer */}
      <PolicyInspector
        isOpen={isPolicyInspectorOpen}
        onClose={() => setIsPolicyInspectorOpen(false)}
        policies={policies}
        currentCustomer={currentCustomer}
        primaryBooking={primaryBooking}
      />
    </div>
  );
};
