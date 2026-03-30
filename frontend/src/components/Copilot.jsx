import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, X, Maximize2, Minimize2, ChevronRight, ExternalLink, Loader2 } from 'lucide-react';
import { copilotQuery } from '../api';
import { useApp } from '../context/AppContext';
import { Button } from './ui/button';
import { Input } from './ui/input';

const Copilot = () => {
  const { filters, currentUser, activeTab, setActiveTab, isCopilotOpen, setIsCopilotOpen, copilotInput, setCopilotInput } = useApp();

  const ROLE_PLACEHOLDERS = {
    CPO: "Ask about PRs, Vendors, or Category strategies...",
    CATEGORY_MANAGER: "Ask about category spend or PR issues...",
    ANALYST: "Ask about PR bottlenecks or savings...",
    REQUESTER: "Ask about the status of your PRs...",
    SRM: "Ask about vendor risk scores or ESG ratings...",
  };
  
  const ROLE_GREETING = {
    CPO: "Hi! I'm Procura AI — your enterprise intelligence assistant.",
    CATEGORY_MANAGER: "Hi! I'm Procura AI — I can help with category strategy and vendor analysis.",
    ANALYST: "Hi! I'm Procura AI — ask me about PR bottlenecks or cycle times.",
    REQUESTER: "Hi! I'm Procura AI — I can help you track the status of your PRs.",
    SRM: "Hi! I'm Procura AI — ask me about vendor risk scores and ESG data.",
  };

  const copilotPlaceholder = ROLE_PLACEHOLDERS[currentUser?.role] || "Ask Procura AI...";
  const copilotGreeting = ROLE_GREETING[currentUser?.role] || "Hello! I am Procura AI. How can I help you today?";

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: copilotGreeting }
  ]);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, logs]);

  const handleSend = async () => {
    if (!copilotInput.trim()) return;

    const userMsg = { role: 'user', content: copilotInput };
    setMessages(prev => [...prev, userMsg]);
    setCopilotInput('');
    setLoading(true);
    setLogs([]);

    const steps = [
      "Fetching context data from DB...",
      "Applying industry benchmarks...",
      "Generating strategic insights..."
    ];

    for (const step of steps) {
      setLogs(prev => [...prev, step]);
      await new Promise(r => setTimeout(r, 500));
    }

    try {
      console.log('[UI] Sending query to Copilot:', copilotInput);
      const context = { module: activeTab, filters };
      const res = await copilotQuery(copilotInput, context);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: res.data.answer, 
        insights: res.data.insights, 
        actions: res.data.actions,
        deep_links: res.data.deep_links 
      }]);
    } catch (error) {
      console.error('[API] Copilot Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered a system error processing your request." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isCopilotOpen) {
    return (
      <button 
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center hover:scale-110 hover:shadow-2xl transition-all duration-300 z-50 ring-4 ring-white/50 group"
        onClick={() => setIsCopilotOpen(true)}
      >
        <Bot size={24} className="group-hover:animate-pulse" />
        <span className="absolute top-0 right-0 h-3 w-3 bg-emerald-400 border-2 border-white rounded-full animate-ping"></span>
        <span className="absolute top-0 right-0 h-3 w-3 bg-emerald-500 border-2 border-white rounded-full"></span>
      </button>
    );
  }

  return (
    <div className={`fixed z-50 transition-all duration-300 flex flex-col bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-2xl overflow-hidden ${
      isFullscreen 
        ? 'inset-4 md:inset-10 rounded-3xl' 
        : 'bottom-24 right-6 w-[400px] h-[600px] max-h-[80vh] rounded-2xl'
    }`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-white/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Bot size={22} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Procura Copilot</h3>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Always On AI</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full" onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full" onClick={() => setIsCopilotOpen(false)}>
            <X size={16} />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/30 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center shadow-sm ${
              msg.role === 'user' 
                ? 'bg-gradient-to-tr from-indigo-500 to-blue-500 text-white font-bold text-xs ring-2 ring-white' 
                : 'bg-white border border-slate-200 text-indigo-600'
            }`}>
              {msg.role === 'user' ? currentUser?.name[0] : <Bot size={16} />}
            </div>

            {/* Bubble */}
            <div className={`space-y-3 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-3.5 text-sm shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm' 
                  : 'bg-white border border-slate-100 text-slate-700 rounded-2xl rounded-tl-sm'
              }`}>
                <p className="leading-relaxed">{msg.content}</p>
              </div>

              {/* Insights */}
              {msg.insights && msg.insights.length > 0 && (
                <div className="space-y-2 mt-2 w-full">
                  {msg.insights.map((insight, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 bg-amber-50/50 border border-amber-100/50 rounded-xl text-xs text-amber-900 font-medium">
                      <Sparkles size={14} className="text-amber-500 shrink-0 mt-0.5" />
                      <span className="leading-snug">{insight}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions & Links */}
              {(msg.actions?.length > 0 || msg.deep_links?.length > 0) && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {msg.actions?.map((action, i) => (
                    <button key={`act-${i}`} className="text-[11px] font-bold bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
                      {action.label}
                      <ChevronRight size={12} />
                    </button>
                  ))}
                  {msg.deep_links?.map((link, i) => (
                    <button 
                      key={`lnk-${i}`} 
                      className="text-[11px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-indigo-100 transition-all shadow-sm"
                      onClick={() => {
                        setActiveTab(link.target);
                        setIsCopilotOpen(false);
                      }}
                    >
                      {link.label}
                      <ExternalLink size={12} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading State logs */}
        {loading && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="h-8 w-8 shrink-0 rounded-full bg-white border border-slate-200 text-indigo-600 flex items-center justify-center shadow-sm">
              <Bot size={16} />
            </div>
            <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-2xl rounded-tl-sm p-4 w-full">
              <div className="space-y-3">
                {logs.map((log, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-semibold text-indigo-700/70">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span className="animate-in fade-in duration-300">{log}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 mt-2">
                  <Loader2 size={14} className="animate-spin" />
                  Synthesizing data...
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
        <div className="relative flex items-center">
          <Input
            className="pr-12 h-12 bg-slate-50 border-slate-200 rounded-full focus-visible:ring-indigo-100 focus-visible:ring-2 focus-visible:border-indigo-300"
            placeholder={copilotPlaceholder}
            value={copilotInput}
            onChange={(e) => setCopilotInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <Button 
            size="icon" 
            className="absolute right-1.5 h-9 w-9 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-sm"
            onClick={handleSend}
            disabled={loading || !copilotInput.trim()}
          >
            <Send size={16} className="ml-0.5 text-white" />
          </Button>
        </div>
        <div className="text-center mt-3">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            AI-Generated content may be inaccurate
          </span>
        </div>
      </div>
    </div>
  );
};

// CheckCircle2 icon needed locally
const CheckCircle2 = ({ className, size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
)

export default Copilot;
