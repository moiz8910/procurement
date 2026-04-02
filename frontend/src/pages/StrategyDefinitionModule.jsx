import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, BrainCircuit, Zap, Send, FileText, FileDown,
  Layers, Lightbulb, CheckCircle2, FileSignature, ChevronRight,
  Sparkles, CheckCircle, ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// Mockup of a Strategy Document
const INITIAL_DOCUMENT_SECTIONS = [
  { id: 'sec1', title: 'Executive Summary', content: 'Our category strategy focuses on optimizing Total Cost of Ownership (TCO), mitigating supply chain risks, and enhancing sustainability across our supplier network.' },
  { id: 'sec2', title: 'Market Analysis & Intelligence', content: 'The global market is experiencing significant volatility due to geopolitical tensions and logistical constraints. We are observing a shift towards regional sourcing models.' },
  { id: 'sec3', title: 'Spend Profile & Baseline', content: 'Total addressable spend stands at $450M annually. High dependency on top 3 suppliers accounts for 60% of the total category spend, highlighting concentration risk.' },
  { id: 'sec4', title: 'Risk Management Plan', content: 'Primary risks identified include single-source dependencies and raw material inflation. We recommend implementing dual-sourcing strategies for top tier items.' },
  { id: 'sec5', title: 'Sustainability & ESG', content: 'We aim to increase our ESG compliance rating by partnering with EcoVadis rated suppliers. Current carbon footprint baseline requires a 15% reduction by 2027.' },
  { id: 'sec6', title: 'Strategic Initiatives', content: '1. Vendor Consolidation.\n2. E-Auction implementation.\n3. Long-term volume contracting.\n4. Value Engineering.' },
  { id: 'sec7', title: 'Value & Savings Roadmap', content: 'Targeting a 5% YoY cost reduction through strategic sourcing, and a 2% cost avoidance via demand management.' },
  { id: 'sec8', title: 'Implementation Timeline', content: 'Q1: Market sounding. \nQ2: RFP execution & Negotiation. \nQ3: Award & Contracting. \nQ4: Transition and Value Tracking.' },
];

const StrategyDefinitionModule = () => {
  const { categories, setActiveTab, currentUser, filters, updateFilters } = useApp();
  
  // Setup Flow State
  const [setupComplete, setSetupComplete] = useState(false);
  const [targetCategory, setTargetCategory] = useState(null);
  
  // Workspace State
  const [documentSections, setDocumentSections] = useState(INITIAL_DOCUMENT_SECTIONS);
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: 'Welcome to the Strategy Workspace! I am your Copilot. I have prepared an initial 10-page draft framework. How would you like to refine the Executive Summary or Market Assessment?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // Re-scroll chat when it updates
  useEffect(() => {
    if (scrollRef.current && setupComplete) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping, setupComplete]);

  const handleInitialize = () => {
    if(!targetCategory) return;
    updateFilters({ categoryId: targetCategory.id });
    setSetupComplete(true);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const userMsg = { role: 'user', text: inputValue };
    setChatHistory(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setChatHistory(prev => [
        ...prev, 
        { role: 'ai', text: 'I have successfully generated new insights and updated the Market Analysis section in the document preview. Let me know if you need to adjust the tone or details.' }
      ]);
      
      setDocumentSections(prev => {
        const newSecs = [...prev];
        newSecs[1].content += '\n\n[Copilot Update]: Integrated recent supply chain index metrics demonstrating a 4% ease in freight costs and 12% drop in raw material inflation over the next 2 quarters.';
        return newSecs;
      });
    }, 2000);
  };

  // ─── SETUP SCREEN ─────────────────────────────────────────────────────────────
  if (!setupComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] relative bg-slate-900 overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/30 blur-[150px] rounded-full mix-blend-screen animate-pulse pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[130px] rounded-full mix-blend-screen pointer-events-none" />
        
        <button 
          onClick={() => setActiveTab('categories')}
          className="absolute top-8 left-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all shadow-lg flex items-center gap-2 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold pr-2">Back</span>
        </button>

        <div className="relative z-10 w-full max-w-2xl bg-white/10 backdrop-blur-2xl border border-white/20 p-12 rounded-3xl shadow-2xl flex flex-col items-center transform transition-all">
          <div className="bg-gradient-to-br from-blue-400 to-indigo-600 p-4 rounded-2xl shadow-xl shadow-blue-500/20 mb-8 border border-white/20">
             <BrainCircuit className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-4xl font-black text-white tracking-tight text-center mb-4">Initialize Workstream</h1>
          <p className="text-slate-300 text-center mb-10 text-lg leading-relaxed max-w-lg">
            Select a target category to enter the Copilot-assisted Strategy Workspace. We'll pre-load your data assets.
          </p>

          <div className="w-full max-w-md bg-white/5 p-2 rounded-2xl border border-white/10 mb-8">
            <select 
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-5 py-4 font-bold text-white outline-none cursor-pointer text-lg appearance-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner"
              value={targetCategory?.id || ''}
              onChange={(e) => {
                const cat = categories.find(c => c.id === parseInt(e.target.value));
                setTargetCategory(cat);
              }}
            >
              <option value="" disabled>Select Category...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <button 
            disabled={!targetCategory}
            onClick={handleInitialize}
            className="w-full max-w-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex justify-center items-center gap-3 group"
          >
            Launch Builder <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  // ─── PREMIUM WORKSPACE SCREEN ──────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-h-screen relative overflow-hidden bg-[#F8FAFC]">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[500px] bg-blue-100/50 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-indigo-100/40 blur-[120px] rounded-full pointer-events-none" />

      {/* Glass Header */}
      <div className="flex-none bg-white/70 backdrop-blur-xl border-b border-white shadow-sm px-6 py-4 flex justify-between items-center z-20 relative">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => setSetupComplete(false)}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-all shadow-sm active:scale-95 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-slate-800 flex items-center gap-2.5 tracking-tight">
              <span className="bg-blue-600 text-white p-1 rounded-md"><FileSignature size={18} /></span>
              Strategy Builder
            </h1>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
              <span>{targetCategory?.name}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span className="text-blue-600 flex items-center gap-1"><Sparkles size={12}/> Copilot Active</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           {/* Visual Pill for the current category context */}
           <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50/80 border border-blue-100/80 rounded-full text-blue-700 font-bold text-sm shadow-inner">
             <Layers size={16} className="text-blue-500" />
             {targetCategory?.name}
           </div>

          <button className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-700 transition-all shadow-md active:scale-95 group">
            <FileDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            Publish PDF
          </button>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative z-10 w-full max-w-[1700px] mx-auto p-4 gap-4">
        
        {/* Left Pane - Premium Chat */}
        <div className="w-full md:w-[400px] flex-shrink-0 bg-white/60 backdrop-blur-2xl border border-white shadow-xl rounded-3xl flex flex-col relative overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50/[0.8] to-indigo-50/[0.8] flex items-center gap-4 drop-shadow-sm">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400 blur-sm rounded-full opacity-50 animate-pulse"></div>
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-full text-white relative z-10 shadow-lg">
                <BrainCircuit className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800 tracking-tight">Procura AI</h2>
              <p className="text-xs font-bold text-blue-600 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"/> Writing Assistant</p>
            </div>
          </div>

          {/* Chat Transcript */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar" ref={scrollRef}>
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex w-full ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-shrink-0 items-center justify-center text-white mr-3 shadow-md mt-1">
                    <Sparkles size={14} />
                  </div>
                )}
                <div className={`max-w-[75%] px-4 py-3 text-sm font-medium leading-relaxed shadow-sm ${
                  msg.role === 'ai' 
                    ? 'bg-white border border-slate-100 text-slate-700 rounded-2xl rounded-tl-sm' 
                    : 'bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl rounded-tr-sm'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex w-full justify-start">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-shrink-0 items-center justify-center text-white mr-3 shadow-md mt-1">
                    <Sparkles size={14} />
                 </div>
                 <div className="max-w-[75%] px-4 py-4 bg-white border border-slate-100 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                 </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white/80 border-t border-slate-100 backdrop-blur-md">
            <div className="relative flex items-end bg-slate-50 border border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 rounded-2xl p-2 transition-all shadow-inner">
              <textarea
                className="w-full bg-transparent pl-3 pr-12 py-2 text-sm text-slate-800 focus:outline-none resize-none h-[60px] custom-scrollbar"
                placeholder="Ask Copilot to generate sections, edit data, or refine tone..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="absolute right-3 bottom-3 p-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
            
            {/* Quick Actions */}
            <div className="mt-3 flex overflow-x-auto gap-2 custom-scrollbar pb-1">
               <button onClick={() => setInputValue("Generate summary")} className="flex-shrink-0 text-[11px] font-bold text-slate-600 hover:text-blue-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap">
                  Summarize Risk
               </button>
               <button onClick={() => setInputValue("Assess market constraints")} className="flex-shrink-0 text-[11px] font-bold text-slate-600 hover:text-blue-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap">
                  Expand Market Setup
               </button>
               <button onClick={() => setInputValue("Make the tone more formal")} className="flex-shrink-0 text-[11px] font-bold text-slate-600 hover:text-blue-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap">
                  Formalize Tone
               </button>
            </div>
          </div>
        </div>

        {/* Right Pane - Elegant Document Viewer */}
        <div className="flex-1 bg-white/40 backdrop-blur-3xl shadow-xl rounded-3xl border border-white overflow-y-auto relative p-6 md:p-10 custom-scrollbar flex justify-center">
           {/* Document Mockup Canvas */}
           <div className="bg-white w-full max-w-[900px] shadow-2xl rounded-2xl border border-slate-100 min-h-[1400px] mb-20 overflow-hidden transform transition-all">
              
              {/* Premium Document Header */}
              <div className="relative px-16 py-20 bg-slate-50 border-b border-slate-100 overflow-hidden">
                 {/* Top graphic accent */}
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
                 
                 <div className="flex justify-between items-start mb-10">
                    <div>
                      <div className="text-blue-600 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                        <CheckCircle size={14} /> Official Record
                      </div>
                      <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4 leading-tight">
                        Category Strategy <br/> <span className="text-slate-400">Workbook</span>
                      </h1>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-right">
                       <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">Status</p>
                       <p className="text-emerald-500 font-black text-sm uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">Drafted</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-200">
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-wider mb-1 text-[10px]">Target Category</p>
                      <p className="font-bold text-slate-800 text-base">{targetCategory?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-wider mb-1 text-[10px]">Strategy Lead</p>
                      <p className="font-bold text-slate-800 text-base">{currentUser?.name}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-wider mb-1 text-[10px]">Last Compiled</p>
                      <p className="font-bold text-slate-800 text-base">{new Date().toLocaleDateString()}</p>
                    </div>
                 </div>
              </div>

              {/* Document Body Sections (Rich Typography) */}
              <div className="px-16 py-12 space-y-16">
                 {documentSections.map((sec, index) => (
                    <div key={sec.id} className="group relative">
                       <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-baseline gap-4 tracking-tight">
                         <span className="text-blue-600/30 font-black text-3xl font-serif italic">{String(index + 1).padStart(2, '0')}</span> 
                         {sec.title}
                       </h2>
                       <div className="text-slate-600 text-[15px] leading-loose whitespace-pre-wrap pl-12 border-l-[3px] border-slate-100 group-hover:border-blue-400 transition-colors">
                          {sec.content.split('\n').map((para, i) => (
                             <p key={i} className={i !== 0 ? 'mt-4' : ''}>
                                {para.includes('[Copilot Update]') ? (
                                   <span className="bg-blue-50 text-blue-800 font-medium px-2 py-1 rounded-md border border-blue-100 shadow-sm">
                                      {para}
                                   </span>
                                ) : para}
                             </p>
                          ))}
                       </div>
                    </div>
                 ))}
                 
                 {/* Footer Watermark */}
                 <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col items-center opacity-40">
                    <Layers className="mb-3 w-8 h-8 text-slate-400" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Procura Technologies</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">Page 1 of 15</p>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default StrategyDefinitionModule;
