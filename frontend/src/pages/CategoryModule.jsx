import React, { useState, useEffect } from 'react';
import {
  getCategories, getCategoryMetaFilters, getCategoryKpis,
  getSpendAnalysis, getMarketIntelligence, getCategoryStrategy,
  summarizeCategoryStrategy, copilotEditCategoryStrategy, uploadCategoryStrategyFile,
  updateCategoryStrategy
} from '../api';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert, BrainCircuit, Send, FileDown, CloudUpload, Layers, Briefcase,
  History, ArrowRight, Check, Ban, Clock, DollarSign, TrendingUp, Users, Star,
  LayoutGrid, PieChart as PieChartIcon, Globe, FileSignature, Zap, AlertCircle,
  FileText, RefreshCw, MessageSquare, ThumbsUp, ThumbsDown, Activity, Search, X,
  Lightbulb
} from 'lucide-react';
import {
  PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  BarChart, Bar, ReferenceLine, Legend
} from 'recharts';

import KpiTile from '../components/KpiTile';
import Modal from '../components/SharedModal';

const COLORS       = ['#10b981', '#059669', '#34d399', '#6ee7b7', '#064e3b'];
const RADIAN       = Math.PI / 180;

// ── DONUT LABEL ────────────────────────────────────────────────────────────
const renderDonutLabel = ({ cx, cy, midAngle, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const rx = cx + (outerRadius + 22) * Math.cos(-midAngle * RADIAN);
  const ry = cy + (outerRadius + 22) * Math.sin(-midAngle * RADIAN);
  return (
    <text x={rx} y={ry} fill="#475569" textAnchor={rx > cx ? 'start' : 'end'}
      dominantBaseline="central" fontSize={10} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ── REUSABLE SUB-COMPONENTS ────────────────────────────────────────────────
const FilterSelect = ({ label, value, onChange, children }) => (
  <div className="flex flex-col bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 min-w-[140px]">
    <label className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">{label}</label>
    <select className="bg-transparent font-bold text-blue-800 outline-none text-xs" value={value} onChange={onChange}>
      {children}
    </select>
  </div>
);

const SectionHeader = ({ label }) => (
  <div className="flex items-center gap-3 pt-1">
    <p className="text-[11px] font-black text-neutral-400 uppercase tracking-widest whitespace-nowrap">{label}</p>
    <div className="flex-1 h-px bg-neutral-100" />
  </div>
);

const ImpactBadge = ({ impact }) => {
  const c = impact === 'High'   ? 'bg-rose-50  text-rose-600  border-rose-200'
          : impact === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-200'
          :                       'bg-blue-50  text-blue-600  border-blue-200';
  return <span className={`text-[9px] font-black uppercase tracking-wider border px-2 py-0.5 rounded ${c}`}>{impact} Risk</span>;
};

const IntelCard = ({ item, onClick }) => {
  const col = item.impact === 'High' ? '#ef4444' : item.impact === 'Medium' ? '#f59e0b' : '#3b82f6';
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 cursor-pointer hover:shadow-lg transition-all relative overflow-hidden group" onClick={onClick}>
      <div className="absolute inset-y-0 left-0 w-1 group-hover:w-1.5 transition-all" style={{ backgroundColor: col }} />
      <div className="ml-3 space-y-2">
        <div className="flex justify-between items-start gap-2">
          <h5 className="font-bold text-blue-800 text-sm leading-tight flex-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{item.title}</h5>
          <ImpactBadge impact={item.impact} />
        </div>
        <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2 font-medium">{item.desc}</p>
        <p className="text-[9px] uppercase font-bold tracking-widest text-neutral-300 flex items-center gap-1"><Clock size={9}/> {item.time || 'JUST NOW'}</p>
      </div>
    </div>
  );
};

const UrgencyBadge = ({ urgency }) => {
  const c = urgency === 'High' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-100 text-amber-700 border border-amber-200';
  return <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${c}`}>{urgency} Priority</span>;
};

const TaskTypeIcon = ({ type }) => {
  if (type === 'pr_approval')     return <FileText size={16} className="text-blue-500" />;
  if (type === 'supplier_eval')   return <Users size={16} className="text-indigo-500" />;
  if (type === 'contract_renewal')return <RefreshCw size={16} className="text-rose-500" />;
  return <AlertCircle size={16} className="text-neutral-400" />;
};

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────
const CategoryModule = () => {
  const { currentUser, updateFilters, setActiveTab } = useApp();

  const [categories,      setCategories]      = useState([]);
  const [metaFilters,     setMetaFilters]     = useState([]);
  const [selectedCategory,setSelectedCategory]= useState(null);
  const [parentGroup,     setParentGroup]     = useState('');
  const [filteredCats,    setFilteredCats]    = useState([]);
  const [filteredSubCats, setFilteredSubCats] = useState([]);
  const [selectedSubCat,  setSelectedSubCat]  = useState('');
  const [categoryOwner,   setCategoryOwner]   = useState('—');

  const [kpiData,     setKpiData]    = useState(null);
  const [spendData,   setSpendData]  = useState(null);
  const [intelItems,  setIntelItems] = useState([]);
  const [kpiLoading,  setKpiLoading] = useState(false);
  const [timeFilter,  setTimeFilter] = useState('monthly');

  const [activeModTab, setActiveModTab] = useState('spend');

  const [sd, setSd] = useState('2024-01-01');
  const [ed, setEd] = useState(new Date().toISOString().split('T')[0]);

  // Modals
  const [vendorModal,   setVendorModal]   = useState(false);
  const [riskModal,     setRiskModal]     = useState(false);
  const [pipModal,      setPipModal]      = useState(false);
  const [selectedTask,  setSelectedTask]  = useState(null);
  const [selectedIntel, setSelectedIntel] = useState(null);
  const [approvalNote,  setApprovalNote]  = useState('');

  // Local Modal Filters
  const [vendorFilter,  setVendorFilter]  = useState('');
  const [riskFilter,    setRiskFilter]    = useState('');

  // Strategy Workbook State
  const [strategySections, setStrategySections] = useState([]);
  const [strategyHistory,  setStrategyHistory]  = useState([
    { role: 'ai', text: 'Hello! I am your Procura Strategy Copilot. Together we can build and refine a comprehensive 10-15 page Category Strategy Workbook.' }
  ]);
  const [copilotInput,     setCopilotInput]     = useState('');
  const [isCopilotTyping,  setIsCopilotTyping]  = useState(false);
  const [strategyLoading,  setStrategyLoading]  = useState(false);
  const scrollRef = React.useRef(null);

  // ── INIT: Load Data ───────────────────────────────────────────────────
  useEffect(() => {
    if (currentUser?.roleType === 'REQUESTER') return;
    getCategoryMetaFilters().then(res => {
      const data = res.data || [];
      setMetaFilters(data);
      if (data.length > 0) {
        setParentGroup(data[0].parent_group);
        setFilteredCats(data[0].categories || []);
      }
    });
    getCategories().then(res => {
      const list = res.data || [];
      setCategories(list);
      if (list.length > 0) setSelectedCategory(list[0]);
    });
  }, [currentUser]);

  useEffect(() => {
    if (!parentGroup || !metaFilters.length) return;
    const group = metaFilters.find(g => g.parent_group === parentGroup);
    if (group) setFilteredCats(group.categories || []);
  }, [parentGroup, metaFilters]);

  useEffect(() => {
    if (!selectedCategory) return;
    setKpiLoading(true);
    updateFilters({ categoryId: selectedCategory.id });
    
    Promise.all([
      getCategoryKpis(selectedCategory.id, { start_date: sd, end_date: ed }),
      getMarketIntelligence(selectedCategory.id),
      getSpendAnalysis(selectedCategory.id, timeFilter)
    ]).then(([kpis, intel, spend]) => {
      setKpiData(kpis.data);
      setIntelItems(intel.data || []);
      setSpendData(spend.data);
    }).catch(console.error).finally(() => setKpiLoading(false));

    if (activeModTab === 'strategy') {
      setStrategyLoading(true);
      getCategoryStrategy(selectedCategory.id)
        .then(res => setStrategySections(res.data?.content_blocks || []))
        .finally(() => setStrategyLoading(false));
    }
  }, [selectedCategory, sd, ed, timeFilter, activeModTab]);

  const handleSendMessage = () => {
    if (!copilotInput.trim()) return;
    const userMsg = { role: 'user', text: copilotInput };
    setStrategyHistory(prev => [...prev, userMsg]);
    setCopilotInput('');
    setIsCopilotTyping(true);

    copilotEditCategoryStrategy(selectedCategory.id, copilotInput)
      .then(res => {
        setStrategyHistory(prev => [...prev, { role: 'ai', text: res.data.message || 'Updated!' }]);
        getCategoryStrategy(selectedCategory.id).then(r => setStrategySections(r.data?.content_blocks || []));
      })
      .finally(() => setIsCopilotTyping(false));
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [strategyHistory, isCopilotTyping]);

  const handleCategoryChange = (catName) => {
    const dbCat = categories.find(c => c.name === catName);
    if (dbCat) setSelectedCategory(dbCat);
    
    // Also update owner from meta
    const meta = filteredCats.find(c => c.name === catName);
    if (meta) {
      setCategoryOwner(meta.owner || '—');
      setFilteredSubCats(meta.subcategories || []);
    }
  };

  if (currentUser?.roleType === 'REQUESTER') {
    return (
      <div className="flex flex-col items-center justify-center p-20 mt-10 max-w-2xl mx-auto text-center border border-rose-100 bg-rose-50 rounded-3xl">
        <AlertCircle size={48} className="text-rose-500 mb-4" />
        <h3 className="text-2xl font-black text-rose-700 mb-2">Access Restricted</h3>
        <p className="text-rose-600 font-medium leading-relaxed">Executive intelligence is limited to Category Managers and CPO roles. Please contact system admin for escalation.</p>
      </div>
    );
  }

  // ── FILTERED MODAL DATA ───────────────────────────────────────────────
  const filteredVendorScores = (kpiData?.vendor_scores_detail || []).filter(v =>
    v.vendor.toLowerCase().includes(vendorFilter.toLowerCase())
  );
  const filteredVendorRisk = (kpiData?.vendor_risk_detail || []).filter(v =>
    v.vendor.toLowerCase().includes(riskFilter.toLowerCase())
  );

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-4 space-y-4 text-blue-800">

      {/* ── 1. FILTER BAR ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-3 flex flex-wrap items-center gap-3">
        <FilterSelect label="Parent Group" value={parentGroup} onChange={e => setParentGroup(e.target.value)}>
          {metaFilters.map(g => <option key={g.parent_group} value={g.parent_group}>{g.parent_group}</option>)}
        </FilterSelect>

        <FilterSelect label="Category" value={selectedCategory?.name || ''} onChange={e => handleCategoryChange(e.target.value)}>
          {filteredCats.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
        </FilterSelect>

        <FilterSelect label="Sub-Category" value={selectedSubCat} onChange={e => setSelectedSubCat(e.target.value)}>
          <option value="">— ALL SUB-CATEGORIES —</option>
          {filteredSubCats.map(sc => <option key={sc} value={sc}>{sc}</option>)}
        </FilterSelect>

        <div className="flex flex-col bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 min-w-[140px]">
          <label className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Start Date</label>
          <input type="date" className="bg-transparent font-bold text-blue-800 outline-none text-xs" value={sd} onChange={e => setSd(e.target.value)} />
        </div>

        <div className="flex flex-col bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 min-w-[140px]">
          <label className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">End Date</label>
          <input type="date" className="bg-transparent font-bold text-blue-800 outline-none text-xs" value={ed} onChange={e => setEd(e.target.value)} />
        </div>

        <div className="ml-auto flex items-center gap-4 bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-2">
          <div className="text-right">
            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none">Category Manager</p>
            <p className="text-xs font-black text-blue-800">{categoryOwner || 'Not Assigned'}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-black text-xs">
             {categoryOwner ? categoryOwner.split(' ').map(n => n[0]).join('') : '—'}
          </div>
        </div>
      </div>

      {/* ── 2. EXECUTIVE KPI BAR (Unified) ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-2">
        <KpiTile icon={DollarSign} label="Spend YTD" value={kpiData ? `₹${kpiData.total_spend_cr}Cr` : '—'} sub="INR Crore" accent="emerald" />
        <KpiTile icon={TrendingUp} label="Negotiation Savings" value={kpiData ? `₹${kpiData.negotiation_savings_cr}Cr` : '—'} sub="Target: 5.5Cr" accent="emerald" />
        <KpiTile icon={Users} label="Supplier Conc." value={kpiData ? `${kpiData.supplier_concentration_pct}%` : '—'} sub="Top 3 Vendors" accent="emerald" />
        <KpiTile icon={Briefcase} label="On-Contract" value={kpiData ? `${kpiData.on_contract_spend_pct}%` : '—'} sub="Compliance Target: 85%" accent="emerald" />
        <KpiTile icon={ShieldAlert} label="Avg Supplier Risk" value={kpiData?.avg_risk_score} sub="Scoring Drill-down" accent="emerald" onClick={() => setRiskModal(true)} />
        <KpiTile icon={Clock} label="Avg PR to PO" value={kpiData ? `${kpiData.pr_to_po_cycle_days}d` : '—'} sub="Target: 4.0d" accent="emerald" />
        <KpiTile icon={Star} label="Avg Vendor Perf." value={kpiData?.avg_vendor_performance_score} sub="Scoring Drill-down" accent="emerald" onClick={() => setVendorModal(true)} />
      </div>

      {/* ── 3. TABS ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-neutral-100 w-fit shadow-sm">
        {[
          { id: 'spend',    label: 'Spend Intelligence',  icon: PieChartIcon },
          { id: 'market',   label: 'Market & Risk',      icon: Globe },
          { id: 'strategy', label: 'Category Strategy',   icon: FileSignature },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveModTab(t.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-black text-xs transition-md ${
              activeModTab === t.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-neutral-400 hover:bg-neutral-50 hover:text-emerald-700'
            }`}
          >
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {/* ── 4. CONTENT ────────────────────────────────────────────────── */}
      <div className="min-h-[600px]">

        {activeModTab === 'spend' && (
          <div className="bg-white rounded-3xl border border-neutral-100 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
             <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-xl font-black text-blue-800">Spend Analytics Pulse</h3>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Global Trend & Anomaly Observation</p>
                </div>
                <div className="flex bg-neutral-50 p-1 rounded-xl border border-neutral-200">
                  {['monthly','quarterly','yearly'].map(t => (
                    <button key={t} onClick={() => setTimeFilter(t)} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${timeFilter === t ? 'bg-white text-indigo-600 shadow-sm border border-neutral-100' : 'text-neutral-400 hover:text-neutral-600'}`}>{t}</button>
                  ))}
                </div>
             </div>
             <div className="h-[450px]">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={spendData?.trend || []}>
                    <defs>
                      <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} tickFormatter={v => `₹${v}Cr`} />
                    <Tooltip />
                    <Area type="monotone" dataKey="spend" stroke="#10b981" strokeWidth={3} fill="url(#spendGrad)" dot={{ r: 4, fill: '#fff', stroke: '#10b981', strokeWidth: 2 }} />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>
        )}

        {activeModTab === 'market' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <div className="lg:col-span-3 space-y-4">
                <SectionHeader label="Strategic Intelligence Engine" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {intelItems.map((item, i) => <IntelCard key={i} item={item} onClick={() => setSelectedIntel(item)} />)}
                   {intelItems.length === 0 && <p className="text-sm font-bold text-neutral-400 italic py-10">No intelligence hits for this category period.</p>}
                </div>
             </div>
             <div className="lg:col-span-1 space-y-4">
                <SectionHeader label="Market Opportunity Analysis" />
                <div className="bg-emerald-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
                   <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                   <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-6 flex items-center gap-2"><Globe size={14}/> Strategic Advantage Scan</h5>
                   <div className="space-y-6">
                      {[
                        { label: 'Renegotiation Window', val: 'OPEN', col: 'text-emerald-400', pct: 90 },
                        { label: 'Material Hedging', val: 'READY', col: 'text-emerald-400', pct: 75 },
                        { label: 'Vendor Consolidation', val: 'PENDING', col: 'text-amber-400', pct: 42 },
                      ].map((r, i) => (
                        <div key={i} className="space-y-2">
                           <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-neutral-400 uppercase tracking-tighter">{r.label}</span>
                              <span className={`font-black uppercase text-[10px] ${r.col}`}>{r.val}</span>
                           </div>
                           <div className="h-1.5 bg-blue-800/50 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${r.pct}%` }} />
                           </div>
                        </div>
                      ))}
                   </div>
                   <button className="w-full mt-10 bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/40">Run Full Analysis</button>
                </div>
             </div>
          </div>
        )}

        {activeModTab === 'strategy' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
             
             {/* Left Pane - Copilot Chat */}
             <div className="lg:col-span-1 bg-white rounded-3xl border border-neutral-100 flex flex-col h-[600px] shadow-sm relative overflow-hidden">
                <div className="p-4 border-b border-neutral-50 flex items-center gap-3 bg-indigo-50/30">
                   <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600"><BrainCircuit size={18}/></div>
                   <div>
                      <h4 className="text-xs font-black text-blue-800 uppercase tracking-tight">Strategy Copilot</h4>
                      <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">Generative Intelligence</p>
                   </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs" ref={scrollRef}>
                   {strategyHistory.map((msg, i) => (
                     <div key={i} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[90%] p-3 rounded-2xl ${msg.role === 'ai' ? 'bg-neutral-50 text-neutral-700 border border-neutral-100 rounded-tl-none' : 'bg-indigo-600 text-white rounded-tr-none'}`}>
                           <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        </div>
                     </div>
                   ))}
                   {isCopilotTyping && (
                      <div className="flex justify-start">
                         <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-2xl rounded-tl-none flex gap-1.5 animate-pulse">
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" /><div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" /><div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                         </div>
                      </div>
                   )}
                </div>

                <div className="p-4 border-t border-neutral-50 bg-neutral-50/50">
                   <div className="relative flex items-center">
                      <textarea
                        rows={1}
                        value={copilotInput}
                        onChange={e => setCopilotInput(e.target.value)}
                        placeholder="Instruct AI..."
                        className="w-full bg-white border border-neutral-200 rounded-xl pl-4 pr-12 py-3 text-xs font-medium focus:border-indigo-400 outline-none transition-all resize-none"
                        onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
                      />
                      <button onClick={handleSendMessage} className="absolute right-2 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-all"><Send size={14}/></button>
                   </div>
                   <div className="flex gap-2 mt-3">
                      <button className="flex-1 bg-white border border-neutral-200 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-neutral-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all" onClick={() => setCopilotInput('Summarize this strategy')}>Summarize</button>
                      <button className="flex-1 bg-white border border-neutral-200 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-neutral-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all" onClick={() => setCopilotInput('Analyze Risks')}>Risk Check</button>
                   </div>
                </div>
             </div>

             {/* Right Pane - Workbook Viewer */}
             <div className="lg:col-span-3 bg-neutral-50 rounded-3xl border border-neutral-100 overflow-y-auto h-[600px] shadow-inner relative p-8">
                <div className="bg-white w-full max-w-[800px] mx-auto min-h-full shadow-lg border border-neutral-100 p-12 space-y-10 relative">
                   
                   {/* Document Watermark */}
                   <div className="absolute top-10 right-10 flex flex-col items-end opacity-20">
                      <Layers size={40} className="text-indigo-400" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mt-2">Internal Memo</p>
                   </div>

                   <div className="border-b-4 border-blue-900 pb-8">
                      <h1 className="text-4xl font-black text-blue-900 tracking-tighter mb-2 uppercase">Category Strategy Workbook</h1>
                      <div className="flex justify-between items-end">
                         <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Confidential Strategy Document v2.4</p>
                         <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Fiscal Target Category</p>
                            <p className="text-xl font-black text-blue-800">{selectedCategory?.name}</p>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-3 gap-6 text-xs border-b border-neutral-100 pb-8">
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Strategy Lead</p>
                         <p className="font-bold text-blue-800 underline decoration-indigo-200 decoration-2">{categoryOwner}</p>
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Last AI Review</p>
                         <p className="font-bold text-blue-800">Just Now</p>
                      </div>
                      <div className="flex justify-end gap-3">
                         <button className="flex items-center gap-1.5 bg-blue-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-neutral-200">
                            <FileDown size={14}/> Export
                         </button>
                         <button className="flex items-center gap-1.5 bg-neutral-100 text-neutral-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 transition-all">
                            <CloudUpload size={14}/> Upload
                         </button>
                      </div>
                   </div>

                   <div className="space-y-12">
                      {strategyLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 animate-pulse">
                           <RefreshCw size={48} className="text-indigo-200 animate-spin" />
                           <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Synchronizing Intelligence Blocks...</p>
                        </div>
                      ) : strategySections.map((sec, idx) => (
                        <div key={idx} className="group relative pl-8 border-l-2 border-transparent hover:border-indigo-100 transition-colors">
                           <div className="absolute left-0 top-0 -tranneutral-x-1/2 w-2 h-2 rounded-full bg-indigo-200 group-hover:scale-150 transition-transform"/>
                           <h3 className="text-lg font-black text-blue-800 mb-4 flex items-center gap-3">
                              <span className="text-indigo-200 font-bold tabular-nums">{String(idx+1).padStart(2,'0')}</span>
                              <span className="uppercase tracking-tight underline decoration-neutral-100 decoration-4 underline-offset-4 group-hover:decoration-indigo-100 transition-all">{typeof sec === 'string' ? `Section ${idx+1}` : sec.title}</span>
                           </h3>
                           <div className="text-sm font-medium text-neutral-600 leading-relaxed max-w-[640px]">
                              {typeof sec === 'string' ? sec : sec.content}
                           </div>
                        </div>
                      ))}

                      {strategySections.length === 0 && !strategyLoading && (
                        <div className="text-center py-20 bg-neutral-50 rounded-3xl border-2 border-dashed border-neutral-100">
                           <Lightbulb size={48} className="text-indigo-200 mx-auto mb-4" />
                           <h4 className="text-lg font-black text-neutral-400">Strategy Workspace Empty</h4>
                           <p className="text-sm font-bold text-neutral-300 mt-2 uppercase tracking-widest">Instruct the Copilot to generate your first draft</p>
                        </div>
                      )}
                   </div>

                   <div className="pt-20 border-t border-neutral-100 flex flex-col items-center opacity-30">
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-400">Workbook End · Page 1 of 1</p>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* ── 5. MODALS ─────────────────────────────────────────────────── */}

      {/* Vendor Modal */}
      {vendorModal && (
        <Modal onClose={() => setVendorModal(false)} maxWidth="max-w-4xl">
          <div className="p-6 space-y-5 flex flex-col h-full">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-blue-800">Vendor Performance Scoring</h3>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Metric-level Performance Breakdown</p>
              </div>
              <button onClick={() => setVendorModal(false)} className="text-neutral-400 hover:text-neutral-600 p-2 hover:bg-neutral-100 rounded-full transition-all"><X size={20}/></button>
            </div>
            <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200 flex items-center gap-3">
              <Search size={14} className="text-neutral-400 ml-2" />
              <input type="text" placeholder="Filter vendors..." value={vendorFilter} onChange={e => setVendorFilter(e.target.value)} className="bg-transparent outline-none text-sm w-full font-bold" />
            </div>
             <div className="flex-1 min-h-0 overflow-hidden rounded-2xl border border-neutral-100 bg-white">
                <div className="overflow-x-auto h-full">
                  <table className="w-full text-xs text-left">
                     <thead className="bg-neutral-50 border-b border-neutral-100 sticky top-0">
                        <tr className="text-[9px] font-black uppercase tracking-widest text-neutral-400">
                           <th className="px-4 py-3">Vendor</th>
                           <th className="px-4 py-3">Rating</th>
                           <th className="px-4 py-3 text-center">Overall</th>
                           {Object.keys(kpiData?.performance_weights || {}).map(k => (
                             <th key={k} className="px-4 py-3 text-center">{k} ({kpiData.performance_weights[k]}%)</th>
                           ))}
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-neutral-50">
                        {filteredVendorScores.map((v, i) => (
                          <tr key={i} className="hover:bg-emerald-50/30 transition-colors">
                            <td className="px-4 py-3 font-bold text-neutral-700">{v.vendor}</td>
                            <td className="px-4 py-3"><span className="font-black px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded border border-emerald-200">{v.level}</span></td>
                            <td className="px-4 py-3 text-center font-black text-blue-900">{v.overall}</td>
                            {Object.keys(kpiData?.performance_weights || {}).map(k => (
                              <td key={k} className="px-4 py-3 text-center font-bold text-neutral-500">
                                {v.breakdown?.[k] || '—'}
                              </td>
                            ))}
                          </tr>
                        ))}
                     </tbody>
                  </table>
                </div>
             </div>
          </div>
        </Modal>
      )}

      {/* Risk Modal */}
      {riskModal && (
        <Modal onClose={() => setRiskModal(false)} maxWidth="max-w-5xl">
          <div className="p-6 space-y-5 flex flex-col h-full">
            <h3 className="text-xl font-black text-blue-800">Supplier Risk Matrix</h3>
            <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200 flex items-center gap-3">
              <Search size={14} className="text-neutral-400 ml-2" />
              <input type="text" placeholder="Filter risk profiles..." value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="bg-transparent outline-none text-sm w-full font-bold" />
            </div>
            <div className="flex-1 overflow-x-auto border border-neutral-100 rounded-2xl">
               <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-50 border-b border-neutral-100">
                    <tr className="text-[9px] font-black uppercase tracking-widest text-neutral-400">
                      <th className="px-4 py-3">Vendor</th>
                      <th className="px-4 py-3">Risk Level</th>
                      <th className="px-4 py-3 text-center">Overall</th>
                      {Object.keys(kpiData?.risk_weights || {}).map(k => (
                        <th key={k} className="px-4 py-3 text-center">{k} ({kpiData.risk_weights[k]}%)</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {filteredVendorRisk.map((v, i) => (
                      <tr key={i} className="hover:bg-emerald-50/30 transition-colors">
                        <td className="px-4 py-3 font-bold text-neutral-700">{v.vendor}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${v.risk_level === 'High' ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>{v.risk_level}</span>
                        </td>
                        <td className="px-4 py-3 text-center font-black text-blue-900">{v.overall_risk}</td>
                        {Object.keys(kpiData?.risk_weights || {}).map(k => (
                          <td key={k} className="px-4 py-3 text-center font-bold text-neutral-500">
                            {v.breakdown?.[k] || '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        </Modal>
      )}

      {/* Task Modal */}
      {selectedTask && (
        <Modal onClose={() => setSelectedTask(null)} maxWidth="max-w-2xl">
          <div className="border-b border-neutral-200 px-6 py-4 flex items-center gap-3 bg-neutral-50/50">
            <div className={`p-2.5 rounded-xl ${selectedTask.urgency === 'High' ? 'bg-rose-100 text-rose-500' : 'bg-amber-100 text-amber-500'}`}>
              <TaskTypeIcon type={selectedTask.type} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black text-blue-800 tracking-tight">{selectedTask.desc}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <UrgencyBadge urgency={selectedTask.urgency} />
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{selectedTask.requester} · {selectedTask.pr_id || 'GENERAL'}</span>
              </div>
            </div>
            <button onClick={() => setSelectedTask(null)} className="text-neutral-400 hover:text-neutral-600 p-2"><X size={20}/></button>
          </div>
          <div className="p-6 space-y-6">
             <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
                   <div>
                     <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Total Value</p>
                     <p className="text-2xl font-black text-blue-900">₹{selectedTask.amount_cr || '0'} Cr</p>
                   </div>
                   <span className="text-[10px] font-black px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg uppercase">Strategic Allocation</span>
                </div>
                <div className="space-y-1.5">
                   <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-1"><MessageSquare size={10}/> Requester Justification</p>
                   <p className="text-sm font-medium text-neutral-600 leading-relaxed italic">"Integrated supply chain buffer replenishment for Q2 operational continuity. Required for high-priority production line expansion."</p>
                </div>
             </div>
             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Decision Comments (CPO)</label>
                <textarea rows={3} value={approvalNote} onChange={e => setApprovalNote(e.target.value)} placeholder="Enter formal decision notes..." className="w-full text-sm font-medium p-4 border border-neutral-200 rounded-2xl outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all bg-neutral-50" />
                <div className="flex gap-3 pt-2">
                   <button onClick={() => setSelectedTask(null)} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-200"><ThumbsUp size={16}/> Approve</button>
                   <button onClick={() => setSelectedTask(null)} className="flex-1 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all"><ThumbsDown size={16}/> Reject</button>
                </div>
             </div>
          </div>
        </Modal>
      )}

      {/* PIP Modal */}
      {pipModal && (
        <Modal onClose={() => setPipModal(false)} maxWidth="max-w-4xl">
           <div className="p-8 space-y-8">
              <div className="flex justify-between items-center">
                 <div>
                    <h3 className="text-2xl font-black text-blue-800 flex items-center gap-2"><Activity size={24} className="text-indigo-600" /> P•I•P Intelligence: Peer Benchmarking</h3>
                    <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Internal Category Performance Index</p>
                 </div>
                 <button onClick={() => setPipModal(false)} className="p-2 hover:bg-neutral-100 rounded-full transition-all text-neutral-400"><X size={24} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl" />
                    <p className="text-xs font-black uppercase tracking-widest text-indigo-300 mb-2">Category Score</p>
                    <div className="text-7xl font-black tracking-tighter">92<span className="text-2xl not-italic text-indigo-400 ml-1">/100</span></div>
                    <p className="mt-4 text-xs font-bold text-emerald-400 flex items-center gap-1"><TrendingUp size={14}/> Top 5% Peer Performance</p>
                 </div>
                 <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    {[
                      { label: 'Spend Automation', val: '84%', sub: 'Target: 90%' },
                      { label: 'Contract Compliance', val: '96%', sub: 'Target: 95%' },
                      { label: 'Cycle Velocity', val: '4.2d', sub: 'Target: 5.0d' },
                      { label: 'Sourcing Savings', val: '12%', sub: 'Target: 10%' },
                    ].map((p, i) => (
                      <div key={i} className="bg-neutral-50 border border-neutral-100 rounded-2xl p-5">
                         <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">{p.label}</p>
                         <p className="text-2xl font-black text-blue-800">{p.val}</p>
                         <p className="text-[10px] font-bold text-indigo-500 mt-0.5">{p.sub}</p>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="space-y-4">
                 <SectionHeader label="Benchmark Parameters & Information" />
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                       <h5 className="text-xs font-black text-blue-800 uppercase tracking-widest">How we calculate index</h5>
                       <p className="text-sm text-neutral-500 leading-relaxed font-medium">The PIP index is a weighted benchmark consisting of 4 pillars: Operational Efficiency (30%), Strategic Savings (30%), Compliance Integrity (20%), and Market Agility (20%).</p>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex items-start gap-4">
                       <Lightbulb size={24} className="text-indigo-600 shrink-0" />
                       <div>
                          <h6 className="text-[11px] font-black text-indigo-800 uppercase tracking-widest mb-1">Efficiency Insight</h6>
                          <p className="text-sm text-indigo-700 font-medium italic leading-snug">"Category is outperforming peers in RFQ cycle time but has high manual overhead in tail-spend invoice reconciliation."</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </Modal>
      )}

      {/* Market Intel Modal */}
      {selectedIntel && (
        <Modal onClose={() => setSelectedIntel(null)} maxWidth="max-w-5xl">
           <div className="flex flex-col h-full bg-white">
              <div className="p-8 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                 <div className="flex items-center gap-4">
                    <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-200"><BarChart2 size={24}/></div>
                    <div>
                      <h3 className="text-2xl font-black text-blue-800">Intelligence Opportunity Drill-Down</h3>
                      <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">{selectedCategory?.name} · Global Market Dynamics</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedIntel(null)} className="p-3 hover:bg-white hover:shadow-md rounded-full transition-all text-neutral-400"><X size={24}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                 <div className={`p-6 rounded-3xl border-l-[8px] shadow-sm flex flex-col gap-3 ${selectedIntel.impact === 'High' ? 'bg-rose-50 border-rose-500' : 'bg-amber-50 border-amber-500'}`}>
                    <div className="flex justify-between items-center">
                       <h4 className="text-xl font-black text-blue-900">{selectedIntel.title}</h4>
                       <ImpactBadge impact={selectedIntel.impact} />
                    </div>
                    <p className="text-sm text-neutral-700 font-medium leading-relaxed italic">"Dynamic market shifts detected in the Southeast Asian corridor. This signal suggests a 12% price hike likelihood within 6 months."</p>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm space-y-6">
                       <h5 className="text-[11px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2"><Target size={14}/> Impact Assessment & Quantification</h5>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                             <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Financial Loss Risk</p>
                             <p className="text-2xl font-black text-rose-600">₹{selectedIntel.quantified_value || '1.4'} Cr</p>
                          </div>
                          <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                             <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Business Impact</p>
                             <p className="text-2xl font-black text-indigo-600">{selectedIntel.business_impact || 'Moderate'}</p>
                          </div>
                       </div>
                       <div className="space-y-4">
                          <p className="text-[11px] font-black text-neutral-500 uppercase tracking-widest">Recommended Mitigation Plan</p>
                          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-2">
                             <p className="text-sm font-bold text-emerald-800">Strategy: Hedging & Safety Stock</p>
                             <p className="text-xs text-emerald-700 leading-relaxed">Increase safety buffer to 45 days and initiate fixed-price hedges for 40% of the Q3 volume immediately.</p>
                          </div>
                       </div>
                    </div>
                    <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
                       <IntelAnalysisPanel intel={selectedIntel} category={selectedCategory?.name} />
                    </div>
                 </div>
              </div>
           </div>
        </Modal>
      )}
    </div>
  );
};

// ── ANALYSIS PANEL ────────────────────────────────────────────────────────
const PRICE_HISTORY = [
  { year: '2020', price: 21400, forecast: null },
  { year: '2021', price: 24800, forecast: null },
  { year: '2022', price: 31200, forecast: null },
  { year: '2023', price: 28600, forecast: null },
  { year: '2024', price: 32100, forecast: null },
  { year: '2025F',price: null,  forecast: 34500 },
  { year: '2026F',price: null,  forecast: 37200 },
];
const ALT_SOURCES = [
  { vendor: 'Vedanta Alumina',   price: '₹30,800/MT', reliability: 92, risk: 'Low' },
  { vendor: 'NALCO',             price: '₹31,200/MT', reliability: 88, risk: 'Low' },
  { vendor: 'Rio Tinto Global',  price: '₹29,500/MT', reliability: 95, risk: 'Med' },
];

const IntelAnalysisPanel = ({ intel, category }) => {
  const [activeTab, setActiveTab] = useState('price');
  return (
    <div className="space-y-6">
       <div className="flex bg-neutral-50 p-1.5 rounded-xl border border-neutral-100">
         {['price','sourcing'].map(t => (
           <button key={t} onClick={() => setActiveTab(t)} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === t ? 'bg-white shadow-md text-indigo-600' : 'text-neutral-400'}`}>{t === 'price' ? 'Price Movement' : 'Alt sourcing'}</button>
         ))}
       </div>
       
       {activeTab === 'price' && (
         <div className="space-y-4 animate-in fade-in duration-300">
            <h6 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Historical & Forecast (INR / MT)</h6>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={PRICE_HISTORY}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="year" fontSize={9} fontWeight={700} axisLine={false} tickLine={false} />
                   <Tooltip />
                   <Area type="monotone" dataKey="price" stroke="#6366f1" fill="#6366f120" strokeWidth={2.5} connectNulls />
                   <Area type="monotone" dataKey="forecast" stroke="#f59e0b" fill="#f59e0b20" strokeWidth={2.5} strokeDasharray="5 5" connectNulls />
                 </AreaChart>
              </ResponsiveContainer>
            </div>
         </div>
       )}

       {activeTab === 'sourcing' && (
         <div className="space-y-4 animate-in fade-in duration-300">
            <h6 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Recommended Secondary Sources</h6>
            <div className="space-y-3">
               {ALT_SOURCES.map((s, i) => (
                 <div key={i} className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 flex justify-between items-center">
                    <div>
                       <p className="text-xs font-black text-blue-800">{s.vendor}</p>
                       <p className="text-[10px] font-bold text-neutral-400">Reliability Index: {s.reliability}%</p>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-black text-indigo-700">{s.price}</p>
                       <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${s.risk === 'Low' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{s.risk} Risk</span>
                    </div>
                 </div>
               ))}
            </div>
         </div>
       )}
    </div>
  );
};

export default CategoryModule;
