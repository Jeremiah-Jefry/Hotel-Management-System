import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import api from '../services/api';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: "👋 Hello! I'm HotelEase Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEnd = useRef(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const quickReplies = [
    { label: '🏨 Room Types', message: 'What room types do you have?' },
    { label: '💰 Pricing', message: 'What are your room prices?' },
    { label: '🕐 Check-in', message: 'What is the check-in time?' },
    { label: '❌ Cancel', message: "What's your cancellation policy?" },
    { label: '📞 Contact', message: 'How can I contact the front desk?' }
  ];

  const sendMessage = async (text) => {
    const msgText = text || input.trim();
    if (!msgText) return;

    const userMsg = { role: 'user', content: msgText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.content
      }));

      const res = await api.post('/chatbot/message', {
        message: msgText,
        history
      });

      setMessages(prev => [...prev, { role: 'bot', content: res.data.data.reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'bot',
        content: "I'm sorry, I'm having trouble connecting. Please try again later or call Extension 0 for assistance."
      }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-accent hover:bg-accent-dark text-primary-dark shadow-xl flex items-center justify-center transition-all hover:scale-110"
        style={{ animation: !isOpen ? 'pulse-glow 2s infinite' : 'none' }}>
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)] bg-white rounded-2xl shadow-2xl border border-border overflow-hidden animate-slide-up flex flex-col" style={{ height: '500px' }}>
          {/* Header */}
          <div className="gradient-primary px-5 py-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-dark" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">HotelEase Assistant</h3>
                <p className="text-white/60 text-xs">Online • Ready to help</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-bg">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-primary' : 'bg-accent'
                }`}>
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-primary-dark" />}
                </div>
                <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-br-md'
                    : 'bg-white text-text border border-border rounded-bl-md shadow-sm'
                }`} style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex gap-2 animate-fade-in">
                <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-primary-dark" />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md border border-border shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-text-secondary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-text-secondary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-text-secondary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEnd} />
          </div>

          {/* Quick Replies */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 bg-white border-t border-border shrink-0">
              <div className="flex gap-2 overflow-x-auto">
                {quickReplies.map((q, i) => (
                  <button key={i} onClick={() => sendMessage(q.message)}
                    className="px-3 py-1.5 bg-bg text-xs text-text rounded-full whitespace-nowrap hover:bg-accent/10 hover:text-accent-dark transition-colors border border-border">
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 bg-white border-t border-border shrink-0">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
              <input type="text" value={input} onChange={e => setInput(e.target.value)}
                placeholder="Ask me anything..." disabled={typing}
                className="flex-1 px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none" />
              <button type="submit" disabled={!input.trim() || typing}
                className="w-10 h-10 rounded-xl bg-accent hover:bg-accent-dark text-primary-dark flex items-center justify-center transition-all disabled:opacity-50 shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
