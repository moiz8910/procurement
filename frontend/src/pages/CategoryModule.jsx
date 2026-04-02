import React, { useState, useEffect, useRef } from 'react';
import { 
  getCategories, 
  getCategoryMetaFilters,
  getCategoryKpis,
  getCategoryStrategy, 
  generateCategoryInsights,
  getSpendAnalysis,
  analyzeSpendInsights,
  copilotQuery,
  copilotEditCategoryStrategy,
  summarizeCategoryStrategy
} from '../api';
import { useApp } from '../context/AppContext';
import { 
  BrainCircuit, Calendar, User as UserIcon, Upload, FileText,   
  TrendingUp, MapPin, Zap, AlertTriangle, Sparkles, PieChartIcon, Key, Edit3, Activity,
  FileSignature, ChevronDown, ChevronUp, DollarSign, Percent, ShieldCheck, Clock,
  Users, BarChart3, Target, AlertCircle, Award, ArrowUpRight
} from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import MarketIntelligence from '../components/MarketIntelligence';
import PendingTasks from '../components/PendingTasks';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

// ── KPI Tile Component ──────────────────────────────────────────────────────
const KpiTile = ({ icon: Icon, label, value, sub, accent = 'emerald', children, expandable }) => {
  const [open, setOpen] = useState(false);
  const accents = {
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700 [&_.icon-bg]:bg-emerald-100 [&_.icon-bg]:text-emerald-600',
    teal:    'bg-teal-50   border-teal-100   text-teal-700   [&_.icon-bg]:bg-teal-100   [&_.icon-bg]:text-teal-600',
    amber:   'bg-amber-50  border-amber-100  text-amber-700  [&_.icon-bg]:bg-amber-100  [&_.icon-bg]:text-amber-600',
    slate:   'bg-slate-50  border-slate-100  text-slate-700  [&_.icon-bg]:bg-slate-100  [&_.icon-bg]:text-slate-600',
    rose:    'bg-rose-50   border-rose-100   text-rose-700   [&_.icon-bg]:bg-rose-100   [&_.icon-bg]:text-rose-600',
  };
  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-2 ${accents[accent]}`}>
      <div className="flex items-start justify-between">
        <div className="icon-bg p-2 rounded-lg">
          <Icon size={16} />
        </div>
        {expandable && (
          <button onClick={() => setOpen(o => !o)} className="opacity-60 hover:opacity-100 transition-opacity">
            {open ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
          </button>
        )}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">{label}</p>
        <p className="text-2xl font-black tracking-tight leading-none mt-0.5">{value ?? '—'}</p>
        {sub && <p className="text-[11px] font-medium opacity-70 mt-1">{sub}</p>}
      </div>
      {expandable && open && (
        <div className="border-t border-current/10 pt-2 mt-1 space-y-1 text-xs font-medium opacity-80">
          {children}
        </div>
      )}
    </div>
  );
};

// ── KPI Group Header ──────────────────────────────────────────────────────────
const KpiGroupHeader = ({ icon: Icon, label, color }) => (
  <div className={`flex items-center gap-2 mb-3 pb-2 border-b border-${color}-100`}>
    <Icon size={14} className={`text-${color}-600`} />
    <span className={`text-[10px] font-black uppercase tracking-widest text-${color}-700`}>{label}</span>
  </div>
);

// ── Main Component ──────────────────────────────────────────────────────────
const CategoryModule = () => {
  const { currentUser, updateFilters, setActiveTab } = useApp();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Filter bar state
  const [metaFilters, setMetaFilters]   = useState([]);   // [{parent_group, categories:[{name, owner}]}]
  const [parentGroup, setParentGroup]   = useState('');
  const [filteredCats, setFilteredCats] = useState([]);   // category list for selected parent group
  const [categoryOwner, setCategoryOwner] = useState('—');

  // KPI state
  const [kpiData, setKpiData] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(false);

  const [strategy, setStrategy] = useState(null);
  const [spendData, setSpendData] = useState(null);
  const [analyzingSpend, setAnalyzingSpend] = useState(false);
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [copilotEditPrompt, setCopilotEditPrompt] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(false);

  const [copilotInput, setCopilotInput] = useState('');
  const [copilotReading, setCopilotReading] = useState(false);
  const [copilotResponse, setCopilotResponse] = useState('');
  
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [summaryContent, setSummaryContent] = useState("");
  const [insightsLoading, setInsightsLoading] = useState(false);

  const fileInputRef = useRef(null);

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
      // auto-select first category in new group
      const firstCat = group.categories?.[0];
      if (firstCat) {
        const dbCat = categories.find(c => c.name === firstCat.name);
        if (dbCat) {
          setSelectedCategory(dbCat);
          updateFilters({ categoryId: dbCat.id });
          setCategoryOwner(firstCat.owner || '—');
        }
      }
    }
  }, [parentGroup, metaFilters, categories]);

  // ── Load category data whenever selection changes ────────────────────────
  useEffect(() => {
    if (selectedCategory) loadCategoryData(selectedCategory.id);
  }, [selectedCategory]);

  const loadCategoryData = async (catId) => {
    try {
      setKpiLoading(true);
      const [stratRes, spendRes, kpiRes] = await Promise.all([
        getCategoryStrategy(catId),
        getSpendAnalysis(catId),
        getCategoryKpis(catId),
      ]);
      setStrategy(stratRes.data);
      setSpendData(spendRes.data);
      setKpiData(kpiRes.data);
      // Update owner from KPI data (authoritative source since it reads Category Master)
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
    if (meta) setCategoryOwner(meta.owner || '—');
  };

  const handleAnalyzeSpend = async () => {
    if (!selectedCategory) return;
    setAnalyzingSpend(true);
    try {
      const res = await analyzeSpendInsights(selectedCategory.id);
      setSpendData(prev => ({...prev, aiInsights: res.data.insights}));
    } catch (err) { console.error(err); } 
    finally { setAnalyzingSpend(false); }
  };

  const askCopilot = async () => {
    if(!copilotInput.trim()) return;
    setCopilotReading(true);
    try {
      const res = await copilotQuery(copilotInput, { context: 'Category', category: selectedCategory?.name });
      setCopilotResponse(res.data.text);
    } catch(err) {
      setCopilotResponse("Copilot is experiencing heavy load. Please try again.");
    } finally {
      setCopilotReading(false);
      setCopilotInput('');
    }
  };

  const handleCopilotEditClick = async () => {
    if (!selectedCategory || !copilotEditPrompt.trim()) return;
    setLoadingEdit(true);
    try {
      await copilotEditCategoryStrategy(selectedCategory.id, copilotEditPrompt);
      setEditModalOpen(false);
      setCopilotEditPrompt("");
      loadCategoryData(selectedCategory.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleReadSummary = async () => {
    if(!selectedCategory) return;
    try {
      const res = await summarizeCategoryStrategy(selectedCategory.id);
      setSummaryContent(res.data.summary);
      setSummaryModalOpen(true);
    } catch(err) { console.error(err); }
  };

  if (currentUser?.roleType === 'REQUESTER') {
    return (
      <div className="flex flex-col items-center justify-center p-20 mt-10 max-w-2xl mx-auto text-center border border-rose-100 bg-rose-50 rounded-3xl">
        <Key className="text-rose-500 mb-4 h-16 w-16" />
        <h3 className="text-2xl font-black text-rose-700 mb-2">Access Restricted</h3>
      </div>
    );
  }

  const riskColor = kpiData?.avg_risk_score > 60 ? 'rose' : kpiData?.avg_risk_score > 40 ? 'amber' : 'emerald';

  return (
    <div className="space-y-6 flex flex-col max-w-[1600px] mx-auto px-4 py-6">
      <input type="file" ref={fileInputRef} className="hidden" />

      {/* ── Smart Filter Bar ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Category Module</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Category Intelligence Dashboard</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Parent Group */}
            <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 min-w-[160px]">
              <label className="text-[9px] font-bold text-slateald-400 uppercase tracking-wider text-slate-400">Parent Group</label>
              <select
                className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer text-sm"
                value={parentGroup}
                onChange={e => handleParentGroupChange(e.target.value)}
              >
                {metaFilters.map(g => (
                  <option key={g.parent_group} value={g.parent_group}>{g.parent_group}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="flex flex-col bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 min-w-[200px]">
              <label className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">Category</label>
              <select
                className="bg-transparent font-bold text-emerald-800 outline-none cursor-pointer text-sm"
                value={selectedCategory?.name || ''}
                onChange={e => handleCategoryChange(e.target.value)}
              >
                {filteredCats.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Sub-Category — N/A placeholder */}
            <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 min-w-[140px] opacity-60">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Sub-Category</label>
              <span className="text-sm font-bold text-slate-400">N/A</span>
            </div>

            {/* Category Owner */}
            <div className="flex items-center gap-2 bg-emerald-100 border border-emerald-200 rounded-xl px-4 py-2">
              <UserIcon size={14} className="text-emerald-600" />
              <div>
                <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Category Owner</p>
                <p className="text-sm font-black text-emerald-900">{categoryOwner}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Dashboard ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-black text-slate-800">Category KPIs</h2>
            <p className="text-xs text-slate-400 font-medium">
              {kpiData ? `${kpiData.category_name} · ${kpiData.parent_group}` : 'Loading KPIs from database...'}
            </p>
          </div>
          {kpiLoading && <Activity size={16} className="animate-spin text-emerald-500" />}
        </div>

        <div className="space-y-6">
          {/* GROUP 1: Spend Intelligence */}
          <div>
            <KpiGroupHeader icon={DollarSign} label="Spend Intelligence" color="emerald" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <KpiTile
                icon={DollarSign} label="Total Spend" accent="emerald"
                value={kpiData ? `₹${kpiData.total_spend_cr} Cr` : '—'}
                sub="Sum of all POs for this category"
              />
              <KpiTile
                icon={Percent} label="% of Overall Spend" accent="emerald"
                value={kpiData ? `${kpiData.spend_contribution_pct}%` : '—'}
                sub="Contribution to company-wide PO spend"
              />
              <KpiTile
                icon={ArrowUpRight} label="Savings (Negotiation)" accent="emerald"
                value={kpiData ? `₹${kpiData.savings_cr} Cr` : '—'}
                sub="Realized savings across negotiation rounds"
              />
            </div>
          </div>

          {/* GROUP 2: Contract & Sourcing Mix */}
          <div>
            <KpiGroupHeader icon={ShieldCheck} label="Contract & Sourcing Mix" color="teal" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <KpiTile
                icon={ShieldCheck} label="On-Contract %" accent="teal"
                value={kpiData ? `${kpiData.on_contract_pct}%` : '—'}
                sub={`Off-Contract: ${kpiData?.off_contract_pct ?? '—'}%`}
              />
              <div className="rounded-xl border bg-teal-50 border-teal-100 text-teal-700 p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="bg-teal-100 text-teal-600 p-2 rounded-lg"><BarChart3 size={16} /></div>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Off-Contract Breakdown</p>
                </div>
                <p className="text-2xl font-black tracking-tight leading-none">{kpiData ? `${kpiData.off_contract_pct}%` : '—'}</p>
                <div className="border-t border-teal-200 pt-2 space-y-2">
                  {/* RFX bar */}
                  <div>
                    <div className="flex justify-between text-[11px] font-bold mb-1">
                      <span>RFX / Tender Route</span>
                      <span>{kpiData?.off_contract_breakdown?.rfx_pct ?? 0}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-teal-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full transition-all duration-500"
                        style={{ width: `${kpiData?.off_contract_breakdown?.rfx_pct ?? 0}%` }}
                      />
                    </div>
                  </div>
                  {/* Spot bar */}
                  <div>
                    <div className="flex justify-between text-[11px] font-bold mb-1">
                      <span>Spot Purchase</span>
                      <span>{kpiData?.off_contract_breakdown?.spot_pct ?? 0}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-teal-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-300 rounded-full transition-all duration-500"
                        style={{ width: `${kpiData?.off_contract_breakdown?.spot_pct ?? 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <KpiTile
                icon={Target} label="Contract Coverage %" accent="teal"
                value={kpiData ? `${kpiData.contract_coverage_pct}%` : '—'}
                sub="Active rate contracts / total vendors"
              />
            </div>
          </div>

          {/* GROUP 3: Supplier Health */}
          <div>
            <KpiGroupHeader icon={Users} label="Supplier Health" color="amber" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <KpiTile
                icon={Users} label="Supplier Concentration" accent="amber"
                value={kpiData ? `${kpiData.supplier_concentration_pct}%` : '—'}
                sub={kpiData?.top3_vendors?.length ? `Top 3: ${kpiData.top3_vendors.join(', ')}` : 'Top 3 vendors / total spend'}
                expandable={!!kpiData?.top3_vendors?.length}
              >
                <p className="text-[10px] leading-relaxed opacity-80">
                  These 3 vendors represent <strong>{kpiData?.supplier_concentration_pct}%</strong> of category spend.
                  A value above 70% indicates high concentration risk.
                </p>
                {kpiData?.top3_vendors?.map((v, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-800 text-[9px] font-black flex items-center justify-center">{i+1}</span>
                    <span>{v}</span>
                  </div>
                ))}
              </KpiTile>
              <KpiTile
                icon={AlertCircle} label="Avg Supplier Risk Score" accent={riskColor}
                value={kpiData ? `${kpiData.avg_risk_score}` : '—'}
                sub={kpiData ? (kpiData.avg_risk_score > 60 ? '⚠ High Risk' : kpiData.avg_risk_score > 40 ? '⚡ Medium Risk' : '✓ Low Risk') : 'Out of 100'}
              />
              <KpiTile
                icon={Award} label="Avg Vendor Performance" accent="amber"
                value={kpiData ? `${kpiData.avg_vendor_performance_score}` : '—'}
                sub="Weighted score across quality, delivery, price"
              />
            </div>
          </div>

          {/* GROUP 4: Operational */}
          <div>
            <KpiGroupHeader icon={Clock} label="Operational" color="slate" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <KpiTile
                icon={Clock} label="PR-to-PO Cycle Time" accent="slate"
                value={kpiData ? `${kpiData.pr_to_po_cycle_days} days` : '—'}
                sub="Standard procurement lead time (SLA-based)"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Grid Layout (existing content) ────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left Column (Span 2) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Define Strategy Entry */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl shadow-xl relative overflow-hidden group cursor-pointer transition-all hover:shadow-2xl" onClick={() => setActiveTab('strategy_definition')}>
            <div className="absolute -top-10 -right-10 p-8 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500">
              <BrainCircuit size={180} />
            </div>
            <div className="p-8 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-white/20 p-2 rounded-lg text-white backdrop-blur-sm"><FileSignature size={24} /></div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Define Strategy</h2>
                </div>
                <p className="text-emerald-100 font-medium max-w-lg mb-4 text-sm leading-relaxed">Collaboratively build, refine, and generate your comprehensive Category Strategy Workbook with our intelligent AI Copilot.</p>
                <div className="flex items-center gap-4 text-xs font-bold text-emerald-50/90">
                  <span className="flex items-center gap-1 bg-black/20 px-3 py-1.5 rounded-full"><Calendar size={14}/> Next Review: {strategy?.next_review_date || 'N/A'}</span>
                  <span className="flex items-center gap-1 bg-black/20 px-3 py-1.5 rounded-full"><UserIcon size={14}/> Owner: {strategy?.owner || categoryOwner}</span>
                </div>
              </div>
              <button className="bg-white text-emerald-700 hover:bg-slate-50 px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2 whitespace-nowrap">
                <Zap size={18} className="text-emerald-500" /> Start Building
              </button>
            </div>
          </div>

          {/* Spend Breakdown Analysis */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="border-b border-slate-100 p-6 flex flex-col md:flex-row justify-between md:items-center bg-slate-50 gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><PieChartIcon size={20} /></div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Spend Breakdown Analysis</h2>
                </div>
              </div>
              <button onClick={handleAnalyzeSpend} disabled={analyzingSpend} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 leading-none">
                {analyzingSpend ? <Activity size={14} className="animate-spin" /> : <Zap size={14} />} Analyze
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Pie */}
              <div className="md:col-span-5 space-y-4 border-r border-slate-100 pr-4">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Spend Categories</h3>
                <div className="h-40 flex justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={spendData?.breakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                        {(spendData?.breakdown || []).map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {(spendData?.breakdown || []).map((b, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="font-medium text-slate-700">{b.name}</span>
                      <span className="font-bold text-emerald-900">{b.value}%</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-4 border-t border-slate-100">
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">₹ {spendData?.total_spend} Cr</h3>
                  <p className="text-sm font-bold text-slate-500">Last 3 months <span className="text-emerald-500">{spendData?.total_trend}</span></p>
                </div>
              </div>

              {/* Insights & Trend */}
              <div className="md:col-span-7 flex flex-col gap-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-2">Key insight:</h3>
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                    {spendData?.aiInsights ? (
                      <ul className="space-y-1">
                        {spendData.aiInsights.map((insight, idx) => (
                          <li key={idx} className="text-sm text-emerald-900 font-medium flex items-start gap-2">
                            <span className="text-emerald-500 mt-1">•</span> <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-emerald-900 font-medium italic">Top 3–4 insights from spend analysis will appear here after clicking Analyze.</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-2">Spend Trend</h3>
                    <p className="text-xs font-bold text-slate-500 mb-2">Last 6 months <span className="text-emerald-500 bg-emerald-50 px-1 py-0.5 rounded">+8%</span></p>
                    <div className="h-32 bg-slate-50 border border-slate-100 rounded-lg">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={spendData?.trend || []}>
                          <Line type="monotone" dataKey="spend" stroke="#10b981" strokeWidth={3} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-4">Spend by Location</h3>
                    <div className="space-y-3">
                      {spendData?.location?.map((loc, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700">{loc.location}</span>
                          <span className="font-bold text-emerald-900">{loc.spend}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="border-b border-slate-100 p-5 bg-slate-50 flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><TrendingUp size={16} /></div>
              <h2 className="text-sm font-bold text-slate-800">Market Intelligence</h2>
            </div>
            <div className="p-4 overflow-y-auto" style={{ maxHeight: '350px' }}>
              <MarketIntelligence />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="border-b border-slate-100 p-5 bg-slate-50 flex items-center gap-3">
              <div className="bg-rose-100 p-2 rounded-lg text-rose-600"><AlertTriangle size={16} /></div>
              <h2 className="text-sm font-bold text-slate-800">Pending Tasks</h2>
            </div>
            <div className="p-1">
              <PendingTasks selectedCategory={selectedCategory}/>
            </div>
          </div>

          <div className="bg-emerald-900 rounded-2xl shadow-sm overflow-hidden flex flex-col group border border-slate-800">
            <div className="p-4 flex flex-col h-full bg-emerald-900">
              <div className="flex items-center gap-3 mb-4 text-white">
                <BrainCircuit size={20} className="text-emerald-400" />
                <h2 className="text-sm font-bold tracking-widest uppercase text-white">Copilot</h2>
              </div>
              {copilotResponse ? (
                <div className="bg-slate-800 rounded-xl p-4 mb-4 text-white text-sm font-medium leading-relaxed border border-slate-700">
                  {copilotResponse}
                </div>
              ) : (
                <div className="bg-slate-800 rounded-xl p-4 mb-4 text-white text-sm font-medium leading-relaxed border border-slate-700">
                  Always on Copilot support
                </div>
              )}
              <div className="relative mt-auto">
                <input 
                  type="text" 
                  placeholder="Message..." 
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-sm focus:border-emerald-500 transition-all outline-none" 
                  value={copilotInput}
                  onChange={(e) => setCopilotInput(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter') askCopilot() }}
                  disabled={copilotReading}
                />
                <button 
                  className="absolute right-2 top-2 p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors disabled:opacity-50"
                  onClick={askCopilot}
                  disabled={copilotReading || !copilotInput.trim()}
                >
                  {copilotReading ? <Activity size={16} className="animate-spin" /> : <Zap size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2"><Sparkles className="text-emerald-600" size={18}/> Copilot Strategy Edit</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-600"><Key size={20}/></button>
            </div>
            <textarea
              className="w-full h-32 p-3 border border-slate-200 rounded-xl text-sm mb-4 outline-none focus:border-emerald-500"
              placeholder="E.g. Add a focus on dual sourcing..."
              value={copilotEditPrompt}
              onChange={(e) => setCopilotEditPrompt(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 text-slate-600 font-medium text-sm" onClick={() => setEditModalOpen(false)}>Cancel</button>
              <button 
                className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 text-sm disabled:opacity-50"
                onClick={handleCopilotEditClick} disabled={loadingEdit || !copilotEditPrompt.trim()}
              >
                {loadingEdit ? 'Applying...' : 'Apply Comments'}
              </button>
            </div>
          </div>
        </div>
      )}

      {summaryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><FileText className="text-emerald-600" size={18}/> Strategy Summary</h3>
            <div className="text-sm text-slate-600 leading-relaxed mb-6 max-h-96 overflow-y-auto">
              {summaryContent}
            </div>
            <div className="flex justify-end">
              <button className="px-6 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-emerald-900 text-xs" onClick={() => setSummaryModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryModule;
