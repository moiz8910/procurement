import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, BrainCircuit, Zap, Send, FileText, FileDown,
  Layers, Lightbulb, CheckCircle2, FileSignature
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCategories, getCategoryStrategy } from '../api';

// Simple mockup of a long 10-15 page strategy document
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
  const { setActiveTab, currentUser, filters, updateFilters } = useApp();
  
  const [localCategories, setLocalCategories] = useState([]);
  const [fetchingCategories, setFetchingCategories] = useState(true);

  // Directly pull the category mapped to the global app filter
  const activeCategoryId = parseInt(filters.categoryId) || (localCategories.length > 0 ? localCategories[0].id : null);
  const selectedCategory = localCategories.find(c => c.id === activeCategoryId) || localCategories[0] || null;
  
  const [documentSections, setDocumentSections] = useState(INITIAL_DOCUMENT_SECTIONS);
  const [loadingStrategy, setLoadingStrategy] = useState(false);

  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: 'Hello! I am your Procura Strategy Copilot. Together we can build and refine a comprehensive 10-15 page Category Strategy Workbook.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // 1. Fetch Categories explicitly from the Database on mount
  useEffect(() => {
    let active = true;
    getCategories()
      .then(res => {
        if (!active) return;
        setLocalCategories(res.data || []);
        setFetchingCategories(false);
        // If there's no filter set yet, just set it to the first category from the DB
        if (!filters.categoryId && res.data?.length > 0) {
          updateFilters({ categoryId: res.data[0].id });
        }
      })
      .catch(err => {
        console.error("Failed to fetch categories:", err);
        setFetchingCategories(false);
      });
    return () => { active = false; };
  }, []);

  // 2. Fetch the specific Strategy Database Content when the Category changes
  useEffect(() => {
    if (activeCategoryId) {
      setLoadingStrategy(true);
      getCategoryStrategy(activeCategoryId)
        .then(res => {
          if (res.data?.content_blocks && res.data.content_blocks.length > 0) {
            const blocks = res.data.content_blocks;
            if (typeof blocks[0] === 'string') {
              setDocumentSections(blocks.map((b, i) => ({
                id: `sec${i}`,
                title: `Strategy Initiative ${i + 1}`,
                content: b
              })));
            } else {
              setDocumentSections(blocks);
            }
          } else {
            // Fallback to placeholder if no DB strategy exists
            setDocumentSections(INITIAL_DOCUMENT_SECTIONS);
          }
        })
        .catch(() => {
           setDocumentSections(INITIAL_DOCUMENT_SECTIONS);
        })
        .finally(() => {
          setLoadingStrategy(false);
        });
    }
  }, [activeCategoryId]);

  useEffect(() => {
    // Scroll to bottom of chat
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const userMsg = { role: 'user', text: inputValue };
    setChatHistory(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking and building the document
    setTimeout(() => {
      setIsTyping(false);
      setChatHistory(prev => [
        ...prev, 
        { role: 'ai', text: 'I have generated new insights based on your request. I updated the document preview on the right.' }
      ]);
      
      // Update the document to reflect copilot action
      setDocumentSections(prev => {
        const newSecs = [...prev];
        if(newSecs[1]) {
           newSecs[1].content += '\n\n[Copilot Update]: Integrated recent supply chain index metrics demonstrating a 4% ease in freight costs over the next 2 quarters.';
        }
        return newSecs;
      });
    }, 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-h-screen bg-white relative text-[13px]">
      {/* Header with the prominent Category Filter */}
      <div className="flex-none bg-white border-b border-emerald-100 px-5 py-3 flex justify-between items-center z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('categories')}
            className="p-1.5 -ml-1 rounded-md hover:bg-emerald-50 text-emerald-600 hover:text-emerald-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-black text-blue-800 flex items-center gap-2 tracking-tight">
              <FileSignature className="text-emerald-600 w-4 h-4" />
              Strategy Builder
            </h1>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Category Strategy Workbook</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Main Select Category Filter Database Link */}
          <div className="flex flex-col items-start bg-emerald-50/50 px-3 py-1 rounded-lg border border-emerald-100 hover:bg-emerald-50 transition-colors">
             <label className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider pt-0.5">Filter Scope (Database)</label>
             {fetchingCategories ? (
               <span className="text-emerald-600 font-bold text-xs py-1">Loading...</span>
             ) : (
               <select 
                 className="bg-transparent font-bold text-emerald-800 outline-none cursor-pointer text-[13px] w-48 -ml-1"
                 value={activeCategoryId || ''}
                 onChange={(e) => {
                   const catId = parseInt(e.target.value);
                   const cat = localCategories.find(c => c.id === catId);
                   if (cat) updateFilters({ categoryId: cat.id });
                 }}
               >
                 {localCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
             )}
          </div>

          <button className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-2 rounded-md text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm">
            <FileDown className="w-3 h-3" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Main Content Workspace Split */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Pane - Copilot Chat */}
        <div className="w-full md:w-[320px] bg-white border-r border-emerald-100 flex flex-col relative z-0 shadow-sm">
          <div className="p-3 border-b border-emerald-50 flex items-center gap-2 bg-emerald-50/50">
            <div className="bg-emerald-100 p-1.5 rounded-md text-emerald-700">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-blue-800">Strategy Copilot</h2>
              <p className="text-[10px] font-medium text-emerald-600 hover:text-emerald-800 cursor-pointer">View Instructions</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4 bg-white text-xs" ref={scrollRef}>
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[90%] rounded-xl p-2.5 flex gap-2.5 ${
                  msg.role === 'ai' 
                    ? 'bg-emerald-50 border border-emerald-100 text-blue-800 rounded-tl-none shadow-sm' 
                    : 'bg-emerald-600 text-white rounded-tr-none shadow-sm'
                }`}>
                  {msg.role === 'ai' && <div className="mt-0.5"><Zap className="w-3 h-3 text-emerald-500" /></div>}
                  <div className="leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-xl p-3 bg-emerald-50 border border-emerald-100 rounded-tl-none flex items-center gap-1.5 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-3 bg-white border-t border-emerald-100">
            <div className="relative flex items-center">
              <textarea
                className="w-full bg-neutral-50 border border-emerald-200 rounded-lg pl-3 pr-10 py-2.5 text-xs focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 transition-all resize-none h-[42px]"
                placeholder="Instruct Copilot..."
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
                className="absolute right-1.5 p-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
            
            {/* Suggestions */}
            <div className="mt-2 flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
               <button className="text-[9px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md flex-shrink-0" onClick={() => setInputValue("Generate summary")}>Generate Summary</button>
               <button className="text-[9px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md flex-shrink-0" onClick={() => setInputValue("Expand Risk")}>Expand Risk</button>
            </div>
          </div>
        </div>

        {/* Right Pane - Strict Clean Document Viewer (Light Theme) */}
        <div className="flex-1 bg-neutral-50 overflow-y-auto p-4 md:p-8 flex justify-center custom-scrollbar shadow-inner relative relative">
           
           <div className={`bg-white w-full max-w-[700px] shadow-sm border border-emerald-100 min-h-[1000px] mb-12 overflow-hidden transition-opacity ${loadingStrategy ? 'opacity-50' : 'opacity-100'}`}>
              
              {/* Document Header (Light/White background instead of Dark Slate) */}
              <div className="px-8 py-10 bg-white border-b border-emerald-100 shadow-sm">
                 <h1 className="text-2xl font-black mb-3 text-emerald-900 tracking-tight">Category Strategy</h1>
                 <p className="text-sm font-bold text-emerald-600 border-b border-emerald-100 pb-4 mb-4 uppercase tracking-widest">Confidential Strategy Workbook</p>
                 
                 <div className="grid grid-cols-4 gap-4 text-xs">
                    <div>
                      <p className="text-neutral-400 font-bold uppercase tracking-wider mb-0.5 text-[9px]">Target Category</p>
                      <p className="font-bold text-blue-800">{selectedCategory?.name || 'Loading...'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-neutral-400 font-bold uppercase tracking-wider mb-0.5 text-[9px]">Prepared By</p>
                      <p className="font-bold text-blue-800">{currentUser?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-neutral-400 font-bold uppercase tracking-wider mb-0.5 text-[9px]">Date Configured</p>
                      <p className="font-bold text-blue-800">{new Date().toLocaleDateString()}</p>
                    </div>
                 </div>
              </div>

              {/* Document Body Sections */}
              <div className="p-8 space-y-8">
                 {loadingStrategy && <div className="text-center text-sm font-bold text-emerald-600 animate-pulse">Synchronizing Database Blocks...</div>}
                 
                 {!loadingStrategy && documentSections.map((sec, index) => (
                    <div key={sec.id} className="group relative">
                       <h2 className="text-sm font-bold text-blue-800 border-b border-neutral-100 pb-1.5 mb-3 flex items-center gap-2">
                         <span className="text-emerald-500/40 font-black text-lg">{String(index + 1).padStart(2, '0')}</span> 
                         {sec.title}
                       </h2>
                       <div className="text-neutral-600 text-xs leading-relaxed whitespace-pre-wrap pl-6 border-l-2 border-transparent group-hover:border-emerald-200 transition-colors">
                          {sec.content.split('\n').map((para, i) => (
                             <p key={i} className={i !== 0 ? 'mt-2' : ''}>
                                {para.includes('[Copilot Update]') ? (
                                   <span className="bg-emerald-50 text-emerald-800 font-medium px-1.5 py-0.5 rounded border border-emerald-200 block my-1 shadow-sm">
                                      {para}
                                   </span>
                                ) : para}
                             </p>
                          ))}
                       </div>
                    </div>
                 ))}
                 
                 <div className="mt-12 pt-6 border-t border-neutral-100 text-center text-neutral-400 flex flex-col items-center">
                    <Layers className="mb-1.5 w-4 h-4 opacity-30 text-emerald-600" />
                    <p className="uppercase tracking-widest text-[9px] font-bold">End of Document - Page 1 of 15</p>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default StrategyDefinitionModule;
