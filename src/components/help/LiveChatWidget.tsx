import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Clock, CheckCircle2 } from 'lucide-react';
import { triggerHaptic } from '../../utils/animations';

interface LiveChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

// Check if chat is available (9 AM - 5 PM EST)
function isChatAvailable(): boolean {
  const now = new Date();
  const estTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const hours = estTime.getHours();
  return hours >= 9 && hours < 17; // 9 AM - 5 PM EST
}

export default function LiveChatWidget({ isOpen, onClose }: LiveChatWidgetProps) {
  const [messages, setMessages] = useState<Array<{ id: string; text: string; from: 'user' | 'support'; timestamp: Date }>>([]);
  const [inputValue, setInputValue] = useState('');
  const [isOnline, setIsOnline] = useState(isChatAvailable());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check availability every minute
    const interval = setInterval(() => {
      setIsOnline(isChatAvailable());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    triggerHaptic('light');
    const newMessage = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      from: 'user' as const,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');

    // Simulate support response after 2 seconds
    setTimeout(() => {
      const supportMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Thank you for your message! Our support team will get back to you shortly.',
        from: 'support' as const,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, supportMessage]);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 w-full sm:w-96 h-[500px] sm:h-[600px] rounded-2xl sm:rounded-3xl overflow-hidden z-[997] shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative">
                <MessageCircle className="w-5 h-5 text-blue-400" />
                {isOnline && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-black/20" />
                )}
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Live Chat</h3>
                <p className="text-white/50 text-xs">
                  {isOnline ? 'Online now' : 'Offline - Leave a message'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/60 text-sm mb-1">Start a conversation</p>
                <p className="text-white/40 text-xs">
                  {isOnline
                    ? 'Our support team is online and ready to help!'
                    : 'Our team is offline. Leave a message and we\'ll respond within 24 hours.'}
                </p>
                {!isOnline && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-white/50 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>Available: 9 AM - 5 PM EST</span>
                  </div>
                )}
              </div>
            ) : (
              messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl p-3 ${
                      message.from === 'user'
                        ? 'bg-blue-500/30 text-white'
                        : 'bg-white/10 text-white/90'
                    }`}
                  >
                    <p className="text-xs sm:text-sm leading-relaxed">{message.text}</p>
                    <p className="text-white/40 text-[10px] mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10 flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={isOnline ? 'Type your message...' : 'Leave a message...'}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm sm:text-base text-white placeholder:text-white/50 bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

