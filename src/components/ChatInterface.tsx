import React, { useState, useRef, useEffect } from 'react';
import { Customer, Booking, ChatMessage, ActionOption } from '../types/index.ts';
import {
  Send,
  Bot,
  User,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
  Undo2,
  Plane,
  Coffee,
  BedDouble,
  UserCheck
} from 'lucide-react';

interface ChatInterfaceProps {
  customer: Customer;
  primaryBooking: Booking;
  messages: ChatMessage[];
  isTyping: boolean;
  onSendMessage: (text: string) => void;
  onActionClick: (action: ActionOption) => void;
  onOpenEscalationModal: (reason?: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  customer,
  primaryBooking,
  messages,
  isTyping,
  onSendMessage,
  onActionClick,
  onOpenEscalationModal,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    onSendMessage(prompt);
  };

  const renderActionIcon = (type: ActionOption['type']) => {
    switch (type) {
      case 'refund':
        return <Undo2 className="w-3.5 h-3.5" />;
      case 'rebook':
        return <Plane className="w-3.5 h-3.5" />;
      case 'meal_voucher':
        return <Coffee className="w-3.5 h-3.5" />;
      case 'lounge_access':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'delayed_hotel':
        return <BedDouble className="w-3.5 h-3.5" />;
      case 'escalate':
        return <UserCheck className="w-3.5 h-3.5" />;
      default:
        return <ArrowUpRight className="w-3.5 h-3.5" />;
    }
  };

  const latestMessage = messages[messages.length - 1];
  const suggestedPrompts = latestMessage?.suggestedPrompts || [];

  return (
    <div className="flex flex-col h-full rounded-[24px] bg-white border border-hairline overflow-hidden shadow-sm">
      
      {/* Chat Header (56px) */}
      <div className="px-6 py-3.5 border-b border-hairline bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-black">AI Resolution Assistant</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="font-mono text-[11px] text-neutral-500 flex items-center gap-2">
              <span>Customer: <strong className="text-black font-semibold">{customer.name}</strong></span>
              <span>•</span>
              <span>PNR: <strong className="text-black font-semibold">{customer.bookingReference}</strong></span>
            </div>
          </div>
        </div>

        {/* Flight Status Pill */}
        <div className="text-right">
          <span className="font-mono text-[11px] uppercase font-bold px-3 py-1 rounded-full bg-black text-white">
            {primaryBooking.status}
          </span>
        </div>
      </div>

      {/* Messages List Area */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-white">
        {messages.map((msg) => {
          const isAgent = msg.sender === 'agent';
          const isSystem = msg.sender === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <span className="font-mono text-[11px] px-3.5 py-1 rounded-full bg-surface-soft border border-hairline text-neutral-600">
                  {msg.text}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isAgent ? 'justify-start' : 'justify-end'}`}
            >
              {isAgent && (
                <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs shrink-0 mt-1">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[78%] space-y-2 ${
                  isAgent ? 'text-left' : 'text-right'
                }`}
              >
                {/* Bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isAgent
                      ? msg.isEscalation
                        ? 'color-block-coral border border-black/20 text-black'
                        : 'bg-surface-soft border border-hairline text-black'
                      : 'bg-black text-white text-left'
                  }`}
                >
                  <div className="whitespace-pre-line">
                    {msg.text.split('\n').map((paragraph, i) => (
                      <p key={i} className="mb-2 last:mb-0">
                        {paragraph.split('**').map((chunk, j) =>
                          j % 2 === 1 ? (
                            <strong key={j} className={isAgent ? 'font-bold text-black' : 'font-bold text-white'}>
                              {chunk}
                            </strong>
                          ) : (
                            chunk
                          )
                        )}
                      </p>
                    ))}
                  </div>

                  {/* Policy Citation / Audit Footnote */}
                  {msg.policyNote && (
                    <div className="mt-3 pt-2.5 border-t border-black/10 font-mono text-[10px] text-black/60 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-black shrink-0" />
                      <span>{msg.policyNote}</span>
                    </div>
                  )}
                </div>

                {/* Interactive Action Pill Buttons (PRD Section 19) */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {msg.actions.map((act) => {
                      const isEscalate = act.type === 'escalate';
                      return (
                        <button
                          key={act.id}
                          onClick={() => (isEscalate ? onOpenEscalationModal(act.description) : onActionClick(act))}
                          className={`px-4 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 transition ${
                            act.variant === 'primary'
                              ? 'bg-black text-white hover:bg-neutral-800'
                              : act.variant === 'warning' || act.variant === 'danger'
                              ? 'bg-black text-white hover:bg-neutral-800'
                              : 'bg-white text-black border border-black hover:bg-neutral-100'
                          }`}
                        >
                          {renderActionIcon(act.type)}
                          <span>{act.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Timestamp */}
                <div className={`font-mono text-[10px] text-neutral-400 px-1 ${isAgent ? 'text-left' : 'text-right'}`}>
                  {msg.timestamp}
                </div>
              </div>

              {!isAgent && (
                <div className="w-7 h-7 rounded-full bg-neutral-200 text-black flex items-center justify-center text-xs shrink-0 mt-1">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start gap-3 justify-start">
            <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="p-3.5 rounded-2xl bg-surface-soft border border-hairline flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-black animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-black animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-black animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Query Chips */}
      {suggestedPrompts.length > 0 && (
        <div className="px-5 py-2.5 border-t border-hairline bg-surface-soft overflow-x-auto flex items-center gap-2 scrollbar-none">
          <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase tracking-caption shrink-0">
            Suggested:
          </span>
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestedPrompt(prompt)}
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-neutral-100 border border-hairline hover:border-black text-xs text-black transition shrink-0 whitespace-nowrap"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Chat Input Bar (PRD Section 13) */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-hairline bg-white flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask about your flight or request help..."
          className="flex-1 px-4 py-3 bg-surface-soft border border-hairline focus:border-black rounded-full text-xs sm:text-sm text-black placeholder:text-neutral-500 outline-none transition"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="w-11 h-11 rounded-full bg-black hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 text-white flex items-center justify-center transition shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
