import React, { useState, useEffect } from 'react';
import { getTransactionPipeline, getTransactionAging, getTransactionSlas, getPrList, getPrGantt } from '../api';
import { useApp } from '../context/AppContext';
import { 
  FileText, Activity, Clock, Filter, AlertTriangle, ArrowRight, BrainCircuit, Zap, X
} from 'lucide-react';
import PendingTasks from '../components/PendingTasks';

const TransactionModule = () => {
  const { currentUser } = useApp();
  const [pipeline, setPipeline] = useState(null);
  const [aging, setAging] = useState(null);
  const [slas, setSlas] = useState([]);
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metricType, setMetricType] = useState('count');
  const [startDate] = useState('Jan 1');
  const [endDate] = useState('Jan 31');
  const [selectedPrId, setSelectedPrId] = useState(null);
  const [prDetail, setPrDetail] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: "compact" }).format(val);
  const getPipelineMetric = (stage, keyBase) => {
    if (metricType === 'route') {
      let key = keyBase === 'start' ? 'start_route' : keyBase === 'end' ? 'end_route' : `${keyBase}_route`;
      return stage[key] || '-';
    }
    let key = metricType === 'count' ? 
      (keyBase === 'start' ? 'start_count' : keyBase === 'end' ? 'end_count' : keyBase) :
      (keyBase === 'start' ? 'start_value' : keyBase === 'end' ? 'end_value' : `${keyBase}_value`);
    return metricType === 'count' ? (stage[key] || 0) : formatCurrency(stage[key] || 0);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const role = currentUser?.roleType;
      const isReq = role === 'REQUESTER';

      try {
        if (isReq) {
          // Requesters only need the PR list
          const prRes = await getPrList();
          setPrs(prRes.data || []);
        } else {
          // Admins/Analysts fetch everything
          const [pipeRes, ageRes, slaRes, prRes] = await Promise.all([
            getTransactionPipeline().catch(() => ({ data: null })),
            getTransactionAging().catch(() => ({ data: null })),
            getTransactionSlas().catch(() => ({ data: [] })),
            getPrList().catch(() => ({ data: [] }))
          ]);
          
          setPipeline(pipeRes.data);
          setAging(ageRes.data);
          setSlas(slaRes.data || []);
          setPrs(prRes.data || []);
        }
      } catch (err) {
        console.error("Error fetching transaction data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const handlePrClick = async (prId) => {
    setSelectedPrId(prId);
    setShowDrawer(true);
    setDrawerLoading(true);
    try {
      const res = await getPrGantt(prId);
      setPrDetail(res.data);
      setDrawerLoading(false);
    } catch (err) {
      console.error("Error fetching PR detail:", err);
      setDrawerLoading(false);
    }
  };

  const [viewMode, setViewMode] = useState('grid');

  const STAGES_LIST = [
    { id: 0, name: "PR Initiation", status: "CREATED" },
    { id: 1, name: "RFx Release", status: "APPROVED" },
    { id: 2, name: "Supplier Evaluation", status: "SOURCING" },
    { id: 3, name: "Negotiations", status: "SOURCING" }, // Logic for grouping can be refined
    { id: 4, name: "Order Generation", status: "PO_CREATED" }
  ];

  // Map PR status to stage index
  const getStageIndex = (status) => {
    const s = String(status || 'CREATED').toUpperCase();
    if (s === 'PO_CREATED' || s === 'CLOSED') return 4;
    if (s === 'SOURCING') return 2; // Default sourcing to evaluation
    if (s === 'APPROVED') return 1;
    return 0;
  };

  const groupedPrs = STAGES_LIST.map(stage => ({
    ...stage,
    items: prs.filter(pr => getStageIndex(pr.status) === stage.id)
  }));

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-neutral-400 font-bold animate-pulse">
      Loading Transaction data...
    </div>
  );

  return (
    <div className="space-y-6 px-4 py-6 max-w-[1400px] mx-auto min-h-screen relative">
      {/* PR Detail Drawer Overlay */}
      {showDrawer && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-blue-950/20 backdrop-blur-sm" onClick={() => setShowDrawer(false)}></div>
          <div className="bg-white w-[500px] max-w-full h-full shadow-2xl relative animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
              <div>
                <h2 className="text-xl font-black text-blue-950 tracking-tight leading-none mb-1">PR Information</h2>
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Transaction Registry • {selectedPrId}</span>
              </div>
              <button onClick={() => setShowDrawer(false)} className="p-2 hover:bg-neutral-200 rounded-lg text-neutral-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
              {drawerLoading ? (
                <div className="py-20 flex flex-col items-center gap-4 text-neutral-300">
                  <div className="w-10 h-10 border-4 border-blue-950 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Enriching context...</p>
                </div>
              ) : prDetail ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-50 p-4 rounded-none border border-neutral-100">
                      <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-1">Description</span>
                      <p className="text-xs font-bold text-neutral-700 leading-tight">{prDetail.description}</p>
                    </div>
                    <div className="bg-neutral-50 p-4 rounded-none border border-neutral-100">
                      <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-1">Requester</span>
                      <p className="text-xs font-bold text-neutral-700">{prDetail.requester}</p>
                    </div>
                    <div className="bg-neutral-50 p-4 rounded-none border border-neutral-100">
                      <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-1">Date Created</span>
                      <p className="text-xs font-bold text-neutral-700">{prDetail.date}</p>
                    </div>
                    <div className="bg-neutral-50 p-4 rounded-none border border-neutral-100">
                      <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-1">Status</span>
                      <span className="text-[10px] font-black px-2 py-0.5 bg-blue-950 text-white uppercase">{prDetail.status}</span>
                    </div>
                  </div>

                  {/* Pending With Status Block */}
                  <div className="bg-amber-50/50 p-4 border border-amber-100 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest block mb-1">Queue Ownership</span>
                      <p className="text-xs font-black text-blue-950 uppercase">{prDetail.pending_with || "Unassigned"}</p>
                    </div>
                    <div className="w-8 h-8 bg-amber-200/50 flex items-center justify-center text-amber-700 font-black text-[10px] uppercase">
                       {prDetail.pending_with?.charAt(0) || "?"}
                    </div>
                  </div>

                  {/* Gantt / Process Stages */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-l-4 border-blue-950 pl-3">
                      <h3 className="text-sm font-black text-blue-950 uppercase tracking-widest">Process Schedule</h3>
                      <div className="flex gap-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-0.5 border border-dashed border-neutral-300"></div>
                          <span className="text-[9px] font-bold text-neutral-400 uppercase">Baseline</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          <span className="text-[9px] font-bold text-neutral-400 uppercase">Actual</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 relative pl-4 border-l border-neutral-100">
                      {(() => {
                        let runningP = 0;
                        let runningC = 0;
                        const totalDays = prDetail.stages.reduce((sum, s) => sum + s.planned_days, 0);
                        const scale = Math.max(totalDays, 30);
                        
                        return prDetail.stages.map((stage, sidx) => {
                          const pStart = runningP;
                          const cStart = runningC;
                          runningP += stage.planned_days;
                          runningC += stage.current_days;

                          const pX = (pStart / scale) * 100;
                          const pW = (stage.planned_days / scale) * 100;
                          const cX = (cStart / scale) * 100;
                          const cW = (stage.current_days / scale) * 100;
                          
                          const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
                          const color = colors[sidx % colors.length];

                          return (
                            <div key={sidx} className="relative pb-4 last:pb-0">
                              {/* Dot indicator */}
                              <div className="absolute -left-[21px] top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm" style={{ backgroundColor: stage.status === 'pending' ? '#e5e7eb' : color }}></div>
                              
                              <div className={`p-3 rounded-none border-l-2 transition-all duration-300 ${
                                stage.status === 'in_progress' ? 'bg-neutral-50/80 border-blue-950' : 'bg-white border-transparent'
                              }`}>
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className={`text-[11px] font-black uppercase ${stage.status === 'pending' ? 'text-neutral-400' : 'text-blue-950'}`}>{stage.name}</h4>
                                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-tight">Owner: {stage.owner}</p>
                                  </div>
                                  {stage.date && (
                                    <span className="text-[9px] font-black text-neutral-400 tracking-tighter">{stage.date}</span>
                                  )}
                                </div>
                                
                                {/* Parallel Timeline bars */}
                                <div className="relative h-6 mt-2">
                                  {/* Baseline */}
                                  <div 
                                    className="absolute h-1.5 rounded-sm border border-neutral-100 bg-neutral-50 top-0 opacity-40"
                                    style={{ left: `${pX}%`, width: `${pW}%` }}
                                  ></div>
                                  {/* Actual/Performance */}
                                  <div 
                                    className={`absolute h-2.5 rounded-sm top-2.5 transition-all duration-1000 ${stage.status === 'in_progress' ? 'animate-pulse' : ''}`}
                                    style={{ 
                                      left: `${cX}%`, 
                                      width: `${cW}%`,
                                      backgroundColor: stage.status === 'pending' ? '#f3f4f6' : color,
                                    }}
                                  ></div>
                                </div>
                                
                                {stage.status !== 'pending' && (
                                  <div className="mt-1 flex justify-between items-center text-[8px] font-black uppercase tracking-tighter">
                                    <span className="text-neutral-400">TGT: {stage.planned_days}D</span>
                                    <span className={stage.current_days > stage.planned_days ? 'text-rose-500' : 'text-emerald-600'}>
                                      {stage.status === 'completed' ? 'ACT' : 'EST'}: {stage.current_days}D
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-20 text-neutral-400 font-bold">Failed to load PR detail</div>
              )}
            </div>
            
            {/* CTA in Modal */}
            <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 flex gap-4">
              <button className="flex-1 bg-white border border-neutral-200 py-3 rounded-xl text-sm font-bold text-neutral-700 hover:bg-neutral-100 transition-colors">Internal Note</button>
              <button className="flex-1 bg-teal-600 py-3 rounded-xl text-sm font-bold text-white hover:bg-teal-700 shadow-lg shadow-teal-200 transition-all">Escalate Stage</button>
            </div>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
        <div>
          <h1 className="text-2xl font-black text-blue-800 tracking-tight">Transactional Procurement</h1>
          <p className="text-sm font-medium text-neutral-500">Monitor your PR→PO pipeline and lifecycle SLAs.</p>
        </div>
        {!isRestricted && (
          <button className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 px-4 py-2 hover:bg-neutral-100 text-neutral-700 text-sm font-bold rounded-lg transition-colors">
            <Filter size={16} /> Filters
          </button>
        )}
      </div>

      {!isRestricted && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          <div className="xl:col-span-2 space-y-6">
            
            {/* Filter Toggle Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-4 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex bg-neutral-100 p-1 rounded-lg">
                <button 
                  onClick={() => setMetricType('value')}
                  className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${metricType === 'value' ? 'bg-white text-teal-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                >By Value</button>
                <button 
                  onClick={() => setMetricType('count')}
                  className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${metricType === 'count' ? 'bg-white text-teal-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                >By Count</button>
                <div className="w-px bg-neutral-200 mx-2 my-1"></div>
                <button 
                  onClick={() => setMetricType('route')}
                  className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${metricType === 'route' ? 'bg-white text-teal-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                >
                  Procurement Route
                </button>
              </div>
              <div className="text-sm font-bold text-neutral-600 flex gap-6">
                <div>Start Date: <span className="text-teal-600">{startDate}</span></div>
                <div>End Date: <span className="text-teal-600">{endDate}</span></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
              <div className="border-b border-neutral-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-teal-100 p-2 rounded-lg text-teal-600">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-blue-800">Procurement Pipeline Dashboard</h2>
                    <p className="text-xs font-bold text-neutral-500 mt-0.5">Pipeline Flow Overview</p>
                  </div>
                </div>
                {pipeline?.po_placed_ytd && (
                  <div className="text-right flex flex-col items-end">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">PO Placed YTD</span>
                    <div className="flex items-baseline gap-2">
                       <span className="text-2xl font-black text-blue-800">{metricType === 'count' ? pipeline.po_placed_ytd.count : formatCurrency(pipeline.po_placed_ytd.value_cr * 10000000)}</span>
                       <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded">{pipeline.po_placed_ytd.trend}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-neutral-100">
                      <th className="pb-3 text-xs font-bold text-neutral-400 uppercase tracking-wider">Pipeline Stages</th>
                      <th className="pb-3 text-xs font-bold text-neutral-400 uppercase tracking-wider text-right">As of {startDate}</th>
                      <th className="pb-3 text-xs font-bold text-neutral-400 uppercase tracking-wider text-right">Additions</th>
                      <th className="pb-3 text-xs font-bold text-neutral-400 uppercase tracking-wider text-right">Drops</th>
                      <th className="pb-3 text-xs font-bold text-neutral-400 uppercase tracking-wider text-right">Next Stage</th>
                      <th className="pb-3 text-xs font-bold text-teal-500 uppercase tracking-wider text-right bg-teal-50/50 rounded-t pt-2 px-2">As of {endDate}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {pipeline?.stages?.map((stage, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="py-3 text-sm font-bold text-neutral-700">{stage.name}</td>
                        <td className="py-3 text-sm font-bold text-neutral-600 text-right">{getPipelineMetric(stage, 'start')}</td>
                        <td className="py-3 text-sm font-medium text-emerald-600 text-right">{metricType !== 'route' ? '+' : ''}{getPipelineMetric(stage, 'additions')}</td>
                        <td className="py-3 text-sm font-medium text-rose-500 text-right">{metricType !== 'route' ? '-' : ''}{getPipelineMetric(stage, 'drops')}</td>
                        <td className="py-3 text-sm font-medium text-emerald-600 text-right">{metricType !== 'route' ? '-' : ''}{getPipelineMetric(stage, 'next_stage')}</td>
                        <td className={`py-3 text-sm font-black text-teal-700 text-right bg-teal-50/30 px-2 ${metricType !== 'route' ? 'font-mono' : ''}`}>{getPipelineMetric(stage, 'end')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Aging Analysis */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
              <div className="border-b border-neutral-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-sky-100 p-2 rounded-lg text-sky-600">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-blue-800">Aging Analysis</h2>
                    <p className="text-xs font-bold text-neutral-500 mt-0.5">As of: {startDate}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-neutral-100">
                      <th className="pb-3 text-xs font-bold text-neutral-400 uppercase tracking-wider">Stage</th>
                      <th className="pb-3 text-xs font-bold text-neutral-400 uppercase tracking-wider text-right">By Count</th>
                      <th className="pb-3 text-xs font-bold text-neutral-400 uppercase tracking-wider text-right">By Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {aging?.stages?.map((s, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="py-3 text-sm font-bold text-neutral-700">{s.name}</td>
                        <td className="py-3 text-sm font-medium text-neutral-600 text-right">{s.count}</td>
                        <td className="py-3 text-sm font-medium text-neutral-600 text-right">{formatCurrency(s.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SLA Heat Map */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
              <div className="border-b border-neutral-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                    <Activity size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-blue-800">Procurement Cycle Time SLA Heat Map</h2>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Select Analysis Period:</span>
                  <select className="bg-white border border-neutral-200 text-sm font-bold text-neutral-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm cursor-pointer">
                    <option>Year to Date</option>
                    <option>Last 30 Days</option>
                    <option>Last Quarter</option>
                  </select>
                </div>
              </div>
              
              <div className="p-6 overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr>
                      <th className="pb-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Stage</th>
                      <th className="pb-4 text-xs font-bold text-neutral-400 uppercase tracking-wider text-center">Within SLA</th>
                      <th className="pb-4 text-xs font-bold text-neutral-400 uppercase tracking-wider text-center">50% Above SLA</th>
                      <th className="pb-4 text-xs font-bold text-neutral-400 uppercase tracking-wider text-center">&gt;100% Over SLA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {slas.map((s, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="py-4 text-sm font-bold text-neutral-700">{s.stage}</td>
                        <td className="py-4 text-center">
                          <span className={`px-4 py-1.5 rounded-md text-sm font-black ${s.within_sla > 0 ? 'bg-emerald-50 text-emerald-600' : 'text-neutral-300'}`}>{s.within_sla}</span>
                        </td>
                        <td className="py-4 text-center">
                          <span className={`px-4 py-1.5 rounded-md text-sm font-black ${s.above_50_sla > 0 ? 'bg-amber-50 text-amber-600' : 'text-neutral-300'}`}>{s.above_50_sla}</span>
                        </td>
                        <td className="py-4 text-center">
                          <span className={`px-4 py-1.5 rounded-md text-sm font-black ${s.over_100_sla > 0 ? 'bg-rose-50 text-rose-600' : 'text-neutral-300'}`}>{s.over_100_sla}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column (1 Col) */}
          <div className="space-y-6">
            
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                <div className="border-b border-neutral-100 p-6 flex items-center gap-3 bg-neutral-50/50">
                  <div className="bg-rose-100 p-2 rounded-lg text-rose-600">
                    <AlertTriangle size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-blue-800">Pending Tasks</h2>
                </div>
                <PendingTasks />
            </div>

            {/* Always on Transaction Copilot */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
              <div className="bg-teal-600 p-5">
                  <div className="flex items-center gap-3">
                    <BrainCircuit className="text-white" size={24} />
                    <h2 className="text-lg font-bold text-white tracking-wide">Copilot Support</h2>
                  </div>
              </div>
              <div className="p-5 bg-teal-50/50">
                  <div className="bg-white border text-sm border-teal-100 rounded-xl p-4 mb-4 text-neutral-700 shadow-sm relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-teal-500 rounded-l-xl"></div>
                    I noticed <span className="font-bold text-teal-700">12 bottlenecks</span> in the Supplier Evaluation stage. Want me to draft an escalation alert?
                  </div>
                  <div className="relative">
                    <input type="text" placeholder="Message Copilot..." className="w-full pl-5 pr-12 py-3 rounded-xl border border-neutral-200 text-sm focus:border-teal-500 outline-none shadow-inner" />
                    <button className="absolute right-2 top-2 p-1.5 bg-teal-100 text-teal-600 rounded-lg hover:bg-teal-200 transition-colors">
                      <Zap size={16} />
                    </button>
                  </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PR List Table (Visible to everyone) */}
      {/* PR Section Header & Toggles */}
      <div className="flex items-center justify-between pb-6 border-b border-neutral-100">
        <div className="flex items-center gap-8">
          <h2 className="text-xl font-black text-blue-950 tracking-tight">Active Requisitions</h2>
          <div className="flex bg-neutral-100 p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-white text-blue-950 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
            >
              Registry View
            </button>
            <button 
              onClick={() => setViewMode('pipeline')}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'pipeline' ? 'bg-white text-blue-950 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
            >
              Pipeline Board
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 text-neutral-500 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-neutral-50">
            <Filter size={14} /> Filter Stack
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-950 text-white text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-black shadow-lg shadow-blue-900/10">
            <Zap size={14} /> Create Requisition
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="bg-white border border-neutral-100 overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  <th className="px-6 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">ID</th>
                  <th className="px-6 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Description</th>
                  <th className="px-6 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Requester</th>
                  <th className="px-6 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Location</th>
                  <th className="px-6 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {prs.map((pr) => (
                  <tr key={pr.id} 
                      onClick={() => handlePrClick(pr.id)}
                      className="hover:bg-neutral-50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-blue-950" />
                        <span className="text-xs font-black text-blue-950">PR-{pr.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-neutral-600 max-w-xs truncate">{pr.description}</td>
                    <td className="px-6 py-4 text-xs font-black text-blue-950">{pr.requester}</td>
                    <td className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">{pr.location}</td>
                    <td className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">{pr.date}</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black px-2 py-0.5 bg-blue-50 text-blue-950 border border-blue-100 uppercase">
                        {pr.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-950 opacity-0 group-hover:opacity-100 transition-opacity font-black text-[10px] bg-neutral-100 px-3 py-1.5 uppercase tracking-widest flex items-center gap-1 ml-auto">
                        Details <ArrowRight size={12}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar min-h-[600px] items-start">
          {groupedPrs.map((stage) => (
            <div key={stage.id} className="min-w-[320px] flex-1 flex flex-col bg-neutral-50/50 p-4 border border-neutral-100 h-full">
              <div className="flex items-center justify-between mb-6 px-1">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-blue-950" />
                   <h3 className="text-[12px] font-black text-blue-950 uppercase tracking-widest">{stage.name}</h3>
                </div>
                <span className="text-[11px] font-black text-neutral-300 bg-white px-2 py-0.5 border border-neutral-100">{stage.items.length}</span>
              </div>
              
              <div className="flex-1 space-y-4">
                {stage.items.map(pr => (
                  <div 
                    key={pr.id}
                    onClick={() => handlePrClick(pr.id)}
                    className="bg-white border border-neutral-200 p-5 hover:border-blue-950 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-950 transition-all origin-left" />
                    <div className="flex justify-between items-start mb-3">
                       <span className="text-[9px] font-black text-blue-950 bg-neutral-50 px-1.5 py-0.5 border border-neutral-100">PR-{pr.id}</span>
                       <span className="text-[9px] font-black text-neutral-300 uppercase italic tracking-tighter">{pr.date}</span>
                    </div>
                    <h5 className="text-xs font-black text-blue-950 uppercase tracking-tight line-clamp-2 mb-4 leading-tight group-hover:text-blue-700">
                      {pr.description}
                    </h5>
                    <div className="flex justify-between items-center pt-4 border-t border-neutral-50 mt-auto">
                       <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{pr.requester}</span>
                       <span className="text-[11px] font-black text-emerald-600 font-mono italic tracking-tighter">{formatCurrency(pr.amount)}</span>
                    </div>
                  </div>
                ))}
                {stage.items.length === 0 && (
                  <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 rounded-none opacity-40">
                     <FileText size={20} className="text-neutral-300 mb-2" />
                     <p className="text-[9px] font-black text-neutral-300 uppercase tracking-widest text-center">Empty Stage</p>
                  </div>
                )}
              </div>

              {/* Column Summary Footer */}
              <div className="mt-8 pt-4 border-t border-neutral-200">
                <div className="flex justify-between items-end">
                   <div>
                     <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">Commitment Value</p>
                     <p className="text-sm font-black text-blue-950">
                       {formatCurrency(stage.items.reduce((sum, p) => sum + (p.amount || 0), 0))}
                     </p>
                   </div>
                   <div className="text-[9px] font-black text-neutral-300 uppercase tracking-widest">
                      Q2 Pipeline
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionModule;
