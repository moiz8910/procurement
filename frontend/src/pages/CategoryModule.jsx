import React, { useState, useEffect, useRef } from 'react';
import { 
  getCategories, 
  getCategoryMetaFilters,
  getCategoryKpis,
  getCategoryStrategy, 
  getSpendAnalysis,
  analyzeSpendInsights
} from '../api';
import { useApp } from '../context/AppContext';
import { 
  BrainCircuit, Calendar, User as UserIcon,  
  TrendingUp, Zap, AlertTriangle, PieChartIcon, Activity,
  FileSignature, ChevronDown, ChevronUp, DollarSign, Percent, Clock,
  Users, BarChart3, AlertCircle, Award, ArrowUpRight
} from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import MarketIntelligence from '../components/MarketIntelligence';
import PendingTasks from '../components/PendingTasks';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

// ── Compressed KPI Tile Component ──────────────────────────────────────────
const KpiTile = ({ icon: Icon, label, value, sub, accent = 'emerald', expandable, expandContent, onClick }) => {
  const [open, setOpen] = useState(false);
  const accents = {
    emerald: 'bg-white border-emerald-100   text-emerald-700   [&_.icon-bg]:bg-emerald-100 [&_.icon-bg]:text-emerald-600',
    teal:    'bg-white border-teal-100      text-teal-700      [&_.icon-bg]:bg-teal-100   [&_.icon-bg]:text-teal-600',
    amber:   'bg-white border-amber-100     text-amber-700     [&_.icon-bg]:bg-amber-100  [&_.icon-bg]:text-amber-600',
    slate:   'bg-white border-slate-100     text-slate-700     [&_.icon-bg]:bg-slate-100  [&_.icon-bg]:text-slate-600',
    rose:    'bg-white border-rose-100      text-rose-700      [&_.icon-bg]:bg-rose-100   [&_.icon-bg]:text-rose-600',
  };
  return (
    <div 
      className={`rounded-xl border p-4 flex flex-col gap-2 shadow-sm ${accents[accent]} ${onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="icon-bg p-1.5 rounded-md">
            <Icon size={14} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 opacity-80">{label}</p>
        </div>
        {expandable && (
          <button onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }} className="opacity-60 hover:opacity-100">
            {open ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
          </button>
        )}
      </div>
      <div>
        <p className="text-2xl font-black tracking-tight leading-none text-slate-800">{value ?? '—'}</p>
        {sub && <p className="text-[11px] font-medium text-slate-400 mt-1">{sub}</p>}
      </div>
      {expandable && open && (
        <div className="border-t border-slate-100 pt-2 mt-1 space-y-1 text-xs font-medium text-slate-500">
          {expandContent}
        </div>
      )}
    </div>
  );
};

// ── Main Component ──────────────────────────────────────────────────────────
const CategoryModule = () => {
  const { currentUser, updateFilters, setActiveTab } = useApp();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Filter bar state
  const [metaFilters, setMetaFilters]   = useState([]);   
  const [parentGroup, setParentGroup]   = useState('');
  const [filteredCats, setFilteredCats] = useState([]);   
  const [filteredSubCats, setFilteredSubCats] = useState([]);
  const [selectedSubCat, setSelectedSubCat] = useState('');
  const [categoryOwner, setCategoryOwner] = useState('—');

  // KPI & Spend Data
  const [kpiData, setKpiData] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(false);
  const [strategy, setStrategy] = useState(null);
  const [spendData, setSpendData] = useState(null);
  const [analyzingSpend, setAnalyzingSpend] = useState(false);
  const [timeFilter, setTimeFilter] = useState('monthly'); // weekly, monthly, quarterly

  // Modals
  const [vendorDetailModal, setVendorDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedIntel, setSelectedIntel] = useState(null);

  // ── Fetch meta filters on mount ──────────────────────────────────────────
  useEffect(() => {
    if (currentUser?.roleType === 'REQUESTER') return;
    getCategoryMetaFilters()
      .then(res => {
        setMetaFilters(res.data || []);
        if (res.data?.length > 0) {
          const firstGroup = res.data[0];
          setParentGroup(firstGroup.parent_group);
          setFilteredCats(firstGroup.categories || []);
          if (firstGroup.categories?.length > 0) {
            setFilteredSubCats(firstGroup.categories[0].subcategories || []);
          }
        }
      })
      .catch(() => {});
  }, [currentUser]);

  // ── Fetch DB categories & set initial selection ──────────────────────────
  useEffect(() => {
    if (currentUser?.roleType === 'REQUESTER') return;
    getCategories().then(res => {
      setCategories(res.data);
      if (res.data.length > 0) {
        setSelectedCategory(res.data[0]);
        updateFilters({ categoryId: res.data[0].id });
      }
    });
  }, [currentUser]);

  // ── React to parent group change ────────────────────────────────────────
  useEffect(() => {
    const group = metaFilters.find(g => g.parent_group === parentGroup);
    if (group) {
      setFilteredCats(group.categories || []);
      const firstCat = group.categories?.[0];
      if (firstCat) {
        const dbCat = categories.find(c => c.name === firstCat.name);
        if (dbCat) {
          setSelectedCategory(dbCat);
          updateFilters({ categoryId: dbCat.id });
          setCategoryOwner(firstCat.owner || '—');
          const subcats = firstCat.subcategories || [];
          setFilteredSubCats(subcats);
          setSelectedSubCat(subcats.length > 0 ? subcats[0] : '');
        }
      }
    }
  }, [parentGroup, metaFilters, categories]);

  // ── Load category + spend data whenever selection changes ────────────────
  useEffect(() => {
    if (selectedCategory) loadData(selectedCategory.id, timeFilter);
  }, [selectedCategory, timeFilter]);

  const loadData = async (catId, filterTime) => {
    try {
      setKpiLoading(true);
      const [stratRes, spendRes, kpiRes] = await Promise.all([
        getCategoryStrategy(catId),
        getSpendAnalysis(catId, filterTime),
        getCategoryKpis(catId),
      ]);
      setStrategy(stratRes.data);
      setSpendData(spendRes.data);
      setKpiData(kpiRes.data);
      if (kpiRes.data?.category_owner) setCategoryOwner(kpiRes.data.category_owner);
    } catch (e) {
      console.error(e);
    } finally {
      setKpiLoading(false);
    }
  };

  const handleParentGroupChange = (pg) => {
    setParentGroup(pg);
  };

  const handleCategoryChange = (catName) => {
    const dbCat = categories.find(c => c.name === catName);
    if (dbCat) {
      setSelectedCategory(dbCat);
      updateFilters({ categoryId: dbCat.id });
    }
    const meta = filteredCats.find(c => c.name === catName);
    if (meta) {
      setCategoryOwner(meta.owner || '—');
      const subcats = meta.subcategories || [];
      setFilteredSubCats(subcats);
      setSelectedSubCat(subcats.length > 0 ? subcats[0] : '');
    }
  };

  if (currentUser?.roleType === 'REQUESTER') {
    return (
      <div className="flex flex-col items-center justify-center p-20 mt-10 max-w-2xl mx-auto text-center border border-rose-100 bg-rose-50 rounded-3xl">
        <h3 className="text-2xl font-black text-rose-700 mb-2">Access Restricted</h3>
      </div>
    );
  }

  return (
    <div className="space-y-4 flex flex-col max-w-[1600px] mx-auto px-4 py-4">

      {/* ── Filter Bar & KPI Row (Compact) ─────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          
          {/* Smart Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 min-w-[140px]">
              <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Parent Group</label>
              <select className="bg-transparent font-bold text-slate-700 outline-none text-xs" value={parentGroup} onChange={e => handleParentGroupChange(e.target.value)}>
                {metaFilters.map(g => <option key={g.parent_group} value={g.parent_group}>{g.parent_group}</option>)}
              </select>
            </div>
            <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 min-w-[150px]">
              <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Category</label>
              <select className="bg-transparent font-bold text-slate-800 outline-none text-xs" value={selectedCategory?.name || ''} onChange={e => handleCategoryChange(e.target.value)}>
                {filteredCats.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 min-w-[150px]">
              <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Sub-Category</label>
              <select className="bg-transparent font-bold text-slate-600 outline-none text-xs" value={selectedSubCat} onChange={e => setSelectedSubCat(e.target.value)}>
                {filteredSubCats.length > 0 ? filteredSubCats.map(sc => <option key={sc} value={sc}>{sc}</option>) : <option value="">N/A</option>}
              </select>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg px-3 py-1.5 h-[38px] cursor-help" title={`Accountable Owner: ${categoryOwner}`}>
              <UserIcon size={12} className="text-emerald-500" />
              <span className="text-xs font-bold truncate max-w-[100px]">{categoryOwner}</span>
            </div>
          </div>

          {/* Quick KPIs Row */}
          <div className="flex gap-3 overflow-x-auto pb-1 xl:pb-0 hide-scrollbar">
            <KpiTile icon={DollarSign} label="Total Spend" accent="emerald"
               value={kpiData ? `₹${kpiData.total_spend_cr} Cr` : '—'}
               sub={kpiData ? `${kpiData.spend_contribution_pct}% of total PO spend` : ''}
            />
            <KpiTile icon={Clock} label="PR-to-PO Cycle" accent="slate"
               value={kpiData ? `${kpiData.pr_to_po_cycle_days} days` : '—'}
               sub="Calculated average"
            />
            <KpiTile icon={Award} label="Avg Vendor Score" accent="amber"
               value={kpiData ? `${kpiData.avg_vendor_performance_score}/${kpiData.vendor_score_max}` : '—'}
               sub="Click to drill-down factors"
               onClick={() => setVendorDetailModal(true)}
            />
            <div className="rounded-xl border bg-white border-teal-100 shadow-sm p-4 flex flex-col gap-2 min-w-[200px]">
              <div className="flex items-center gap-2">
                <div className="bg-teal-50 text-teal-600 p-1.5 rounded-md"><BarChart3 size={14} /></div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Off-Contract</p>
              </div>
              <p className="text-2xl font-black tracking-tight leading-none text-slate-800">{kpiData ? `${kpiData.off_contract_pct}%` : '—'}</p>
              <div className="flex gap-3 mt-1 opacity-80">
                <div className="flex-1 space-y-1"><p className="text-[9px] font-bold uppercase text-slate-400">RFX Routes</p><div className="h-1 bg-teal-100 rounded-full"><div className="h-full bg-teal-500 rounded-full" style={{width: `${kpiData?.off_contract_breakdown?.rfx_pct}%`}}/></div></div>
                <div className="flex-1 space-y-1"><p className="text-[9px] font-bold uppercase text-slate-400">Spot Buys</p><div className="h-1 bg-teal-100 rounded-full"><div className="h-full bg-teal-300 rounded-full" style={{width: `${kpiData?.off_contract_breakdown?.spot_pct}%`}}/></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Layout Grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Left Column (Span 2) */}
        <div className="xl:col-span-2 space-y-4">
          
          {/* Spend Breakdown Analysis */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="border-b border-slate-100 p-4 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <PieChartIcon size={16} className="text-emerald-500" />
                <h2 className="text-sm font-bold text-slate-800">Spend Time-Series & Vendor Split</h2>
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                {['weekly', 'monthly', 'quarterly'].map(t => (
                  <button key={t} 
                    className={`px-3 py-1 text-xs font-bold rounded-md capitalize transition-colors ${timeFilter === t ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                    onClick={() => setTimeFilter(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Trend Chart */}
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Spend Trend ({timeFilter})</h3>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={spendData?.trend || []}>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                      <Line type="monotone" dataKey="spend" stroke="#10b981" strokeWidth={3} dot={{r: 3, fill: '#10b981', strokeWidth: 0}} activeDot={{r: 5}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* Vendor Split Donut */}
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Top Vendors Split</h3>
                <div className="h-44 flex items-center justify-between gap-4">
                  <div className="w-1/2 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={spendData?.vendors || []} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value">
                          {(spendData?.vendors || []).map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-1/2 space-y-1.5 overflow-y-auto pr-1">
                    {(spendData?.vendors || []).map((v, i) => (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{bg: COLORS[i%COLORS.length]}}></span>
                          <span className="font-medium text-slate-600 truncate">{v.name}</span>
                        </div>
                        <span className="font-bold text-slate-800 shrink-0 ml-2">{v.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actionable Insights */}
            <div className="bg-emerald-50/50 border-t border-emerald-100 p-4">
               <h3 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Zap size={12}/> Analysis Insights</h3>
               {spendData?.insights?.length ? (
                  <ul className="space-y-1">
                    {spendData.insights.map((insight, idx) => (
                      <li key={idx} className="text-xs text-emerald-900 font-medium flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5">•</span> <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
               ) : (
                  <span className="text-xs text-emerald-600/60 font-medium italic">Select category to view AI insights.</span>
               )}
            </div>
          </div>

          {/* Strategy Entry Banner */}
          <div className="bg-slate-800 rounded-xl shadow-lg relative overflow-hidden group cursor-pointer transition-all hover:bg-slate-900 flex items-center justify-between p-5" onClick={() => setActiveTab('strategy_definition')}>
            <div className="flex items-center gap-4">
              <div className="bg-emerald-500/20 p-3 rounded-xl text-emerald-400"><FileSignature size={24} /></div>
              <div>
                <h2 className="text-lg font-black text-white tracking-tight">Strategy Definition Desk</h2>
                <p className="text-slate-400 font-medium text-xs mt-0.5">Collaboratively build {selectedCategory?.name} workbooks</p>
              </div>
            </div>
            <button className="bg-emerald-500 text-white hover:bg-emerald-400 px-5 py-2 rounded-lg font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 text-sm">
              Open Workbench
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col max-h-[350px]">
            <div className="border-b border-slate-100 p-3 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="text-indigo-600"><TrendingUp size={14} /></div>
                <h2 className="text-xs font-bold text-slate-800">Market Intelligence</h2>
              </div>
              <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400">Live Feed</span>
            </div>
            <div className="p-3 overflow-y-auto no-scrollbar flex-1">
              <MarketIntelligence onItemClick={(item) => setSelectedIntel(item)} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col max-h-[350px]">
            <div className="border-b border-slate-100 p-3 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="text-rose-600"><AlertTriangle size={14} /></div>
                <h2 className="text-xs font-bold text-slate-800">Pending Actions</h2>
              </div>
            </div>
            <div className="p-2 overflow-y-auto no-scrollbar flex-1">
              <PendingTasks selectedCategory={selectedCategory} onItemClick={(task) => setSelectedTask(task)} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Drill-Down Modals ────────────────────────────────────────────────── */}
      
      {/* Screen 2: Vendor Performance Drill-Down */}
      {vendorDetailModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setVendorDetailModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                   <Award className="text-amber-500" size={20}/> Vendor Performance Profile
                </h3>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{selectedCategory?.name} Category</p>
              </div>
              <button onClick={() => setVendorDetailModal(false)} className="bg-slate-100 text-slate-500 hover:bg-slate-200 px-3 py-1 font-bold rounded-lg text-sm transition-colors">Close</button>
            </div>
            
            <div className="grid grid-cols-3 gap-6 mb-8">
               <div className="col-span-1 border border-slate-100 rounded-xl bg-slate-50 p-6 flex flex-col items-center justify-center text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Overall Avg Score</p>
                  <p className="text-4xl font-black text-slate-800">{kpiData?.avg_vendor_performance_score}</p>
                  <p className="text-sm font-bold text-slate-500 mt-1">out of {kpiData?.vendor_score_max}</p>
               </div>
               <div className="col-span-2 space-y-4">
                  <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1">Scoring Factors & Weightage</h4>
                  {kpiData?.vendor_score_factors?.map((f, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-32 shrink-0">
                        <p className="text-xs font-bold text-slate-700">{f.name}</p>
                        <p className="text-[10px] font-bold text-slate-400">{f.weight}% weight</p>
                      </div>
                      <div className="flex-1">
                        <div className="h-2 bg-slate-100 rounded-full w-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all`} style={{width: `${(f.score / 10) * 100}%`, backgroundColor: f.score > 7 ? '#10b981' : f.score > 5 ? '#f59e0b' : '#ef4444'}}></div>
                        </div>
                      </div>
                      <div className="w-8 shrink-0 text-right">
                         <span className="text-xs font-black text-slate-800">{f.score}</span>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Screen 3: Market Intel Drill-Down */}
      {selectedIntel && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedIntel(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-black text-slate-800">{selectedIntel.title}</h3>
              <button onClick={() => setSelectedIntel(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Assessed Impact</p>
                   <span className={`px-2 py-1 text-xs font-bold rounded-md ${selectedIntel.impact === 'High' ? 'bg-rose-100 text-rose-700' : selectedIntel.impact === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                     {selectedIntel.impact} Impact
                   </span>
                 </div>
                 <div className="text-right">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date</p>
                   <p className="text-sm font-bold text-slate-700">{selectedIntel.time}</p>
                 </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Detailed Analysis</p>
                <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium leading-relaxed">
                  {selectedIntel.desc}
                </p>
              </div>
              <div className="pt-4 flex justify-end">
                <button className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm px-6 py-2.5 rounded-lg transition-colors" onClick={() => setSelectedIntel(null)}>Acknowledge</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Screen 4: Pending Task Drill-Down */}
      {selectedTask && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedTask(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-black text-slate-800">Task Details</h3>
              <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>
            <div className="space-y-4">
              <p className="text-lg font-medium text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">{selectedTask.desc}</p>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-100 flex items-center gap-3">
                    <UserIcon size={20} className="text-emerald-500" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/70">Assigned To</p>
                      <p className="text-sm font-bold truncate">{selectedTask.assigned}</p>
                    </div>
                 </div>
                 <div className="bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100 flex items-center gap-3">
                    <Calendar size={20} className="text-blue-500" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600/70">Due Date</p>
                      <p className="text-sm font-bold">{selectedTask.due}</p>
                    </div>
                 </div>
              </div>
              
              <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 mt-2">
                <button className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm px-6 py-2.5 rounded-lg transition-colors" onClick={() => setSelectedTask(null)}>Cancel</button>
                <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-6 py-2.5 rounded-lg transition-colors" onClick={() => setSelectedTask(null)}>Resolve Task</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CategoryModule;
