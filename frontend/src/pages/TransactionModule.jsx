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
    Promise.all([
      getTransactionPipeline(),
      getTransactionAging(),
      getTransactionSlas(),
      getPrList()
    ]).then(([pipeRes, ageRes, slaRes, prRes]) => {
      setPipeline(pipeRes.data);
      setAging(ageRes.data);
      setSlas(slaRes.data);
      setPrs(prRes.data);
      setLoading(false);
    }).catch(console.error);
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

  const isRestricted = currentUser?.roleType === 'REQUESTER';

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-400 font-bold animate-pulse">
      Loading Transaction data...
    </div>
  );

  return (
    <div className="space-y-6 px-4 py-6 max-w-[1400px] mx-auto min-h-screen relative">
      {/* PR Detail Drawer Overlay */}
      {showDrawer && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDrawer(false)}></div>
          <div className="bg-white w-[500px] max-w-full h-full shadow-2xl relative animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">PR Information</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded uppercase tracking-wider">ID: {prDetail?.id || selectedPrId}</span>
                  <span className="text-xs font-bold text-slate-400 capitalize">{prDetail?.status?.toLowerCase()}</span>
                </div>
              </div>
              <button onClick={() => setShowDrawer(false)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {drawerLoading ? (
                <div className="space-y-4 animate-pulse">
                   <div className="h-6 w-1/2 bg-slate-100 rounded"></div>
                   <div className="h-4 w-1/3 bg-slate-100 rounded"></div>
                   <div className="h-32 bg-slate-50 rounded-xl"></div>
                   <div className="space-y-2">
                     {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-slate-50 rounded"></div>)}
                   </div>
                </div>
              ) : prDetail ? (
                <>
                  {/* Metadata Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Description</span>
                      <p className="text-sm font-bold text-slate-700 leading-tight">{prDetail.description}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Requester</span>
                      <p className="text-sm font-bold text-slate-700">{prDetail.requester}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Date Created</span>
                      <p className="text-sm font-bold text-slate-700">{prDetail.date}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Pending With</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center text-[10px] font-black text-amber-700 capitalize">
                          {prDetail.pending_with?.charAt(0) || "X"}
                        </div>
                        <p className="text-sm font-black text-amber-600">{prDetail.pending_with || "Pending"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Gantt / Process Stages */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-l-4 border-indigo-500 pl-3">Process Stages</h3>
                    <div className="space-y-0.5 relative pl-4 border-l border-slate-100">
                      {prDetail.stages.map((stage, sidx) => (
                        <div key={sidx} className="relative pb-6 last:pb-0">
                          {/* Dot indicator */}
                          <div className={`absolute -left-[21px] top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm transition-colors duration-300 ${
                            stage.status === 'completed' ? 'bg-emerald-500' : 
                            stage.status === 'in_progress' ? 'bg-amber-500 ring-4 ring-amber-50' : 'bg-slate-300'
                          }`}></div>
                          
                          <div className={`p-4 rounded-xl border transition-all duration-300 ${
                            stage.status === 'in_progress' ? 'bg-amber-50/30 border-amber-100 shadow-sm' : 
                            stage.status === 'completed' ? 'bg-slate-50/50 border-slate-100' : 'bg-transparent border-transparent opacity-60'
                          }`}>
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className={`text-sm font-black ${stage.status === 'pending' ? 'text-slate-400' : 'text-slate-700'}`}>{stage.name}</h4>
                                <p className="text-[10px] font-bold text-slate-400 mt-0.5">Owner: <span className="text-slate-600">{stage.owner}</span></p>
                              </div>
                              {stage.date && (
                                <span className="text-[10px] font-black bg-white px-2 py-1 rounded shadow-sm border border-slate-100 text-slate-500 capitalize">{stage.date}</span>
                              )}
                            </div>
                            
                            {/* Gantt Bar mock-up */}
                            <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full transition-all duration-700 ${
                                stage.status === 'completed' ? 'bg-emerald-400 w-full' :
                                stage.status === 'in_progress' ? 'bg-amber-400 w-2/3 animate-pulse' : 'w-0'
                              }`}></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-20 text-slate-400 font-bold">Failed to load PR detail</div>
              )}
            </div>
            
            {/* CTA in Modal */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-4">
              <button className="flex-1 bg-white border border-slate-200 py-3 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors">Internal Note</button>
              <button className="flex-1 bg-indigo-600 py-3 rounded-xl text-sm font-bold text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">Escalate Stage</button>
            </div>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Transactional Procurement</h1>
          <p className="text-sm font-medium text-slate-500">Monitor your PR→PO pipeline and lifecycle SLAs.</p>
        </div>
        {!isRestricted && (
          <button className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-lg transition-colors">
            <Filter size={16} /> Filters
          </button>
        )}
      </div>

      {!isRestricted && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          <div className="xl:col-span-2 space-y-6">
            
            {/* Filter Toggle Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setMetricType('value')}
                  className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${metricType === 'value' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >By Value</button>
                <button 
                  onClick={() => setMetricType('count')}
                  className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${metricType === 'count' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >By Count</button>
                <div className="w-px bg-slate-200 mx-2 my-1"></div>
                <button 
                  onClick={() => setMetricType('route')}
                  className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${metricType === 'route' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Procurement Route
                </button>
              </div>
              <div className="text-sm font-bold text-slate-600 flex gap-6">
                <div>Start Date: <span className="text-indigo-600">{startDate}</span></div>
                <div>End Date: <span className="text-indigo-600">{endDate}</span></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="border-b border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Procurement Pipeline Dashboard</h2>
                    <p className="text-xs font-bold text-slate-500 mt-0.5">Pipeline Flow Overview</p>
                  </div>
                </div>
                {pipeline?.po_placed_ytd && (
                  <div className="text-right flex flex-col items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PO Placed YTD</span>
                    <div className="flex items-baseline gap-2">
                       <span className="text-2xl font-black text-slate-800">{metricType === 'count' ? pipeline.po_placed_ytd.count : formatCurrency(pipeline.po_placed_ytd.value_cr * 10000000)}</span>
                       <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded">{pipeline.po_placed_ytd.trend}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Pipeline Stages</th>
                      <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">As of {startDate}</th>
                      <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Additions</th>
                      <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Drops</th>
                      <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Next Stage</th>
                      <th className="pb-3 text-xs font-bold text-indigo-500 uppercase tracking-wider text-right bg-indigo-50/50 rounded-t pt-2 px-2">As of {endDate}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {pipeline?.stages?.map((stage, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 text-sm font-bold text-slate-700">{stage.name}</td>
                        <td className="py-3 text-sm font-bold text-slate-600 text-right">{getPipelineMetric(stage, 'start')}</td>
                        <td className="py-3 text-sm font-medium text-emerald-600 text-right">{metricType !== 'route' ? '+' : ''}{getPipelineMetric(stage, 'additions')}</td>
                        <td className="py-3 text-sm font-medium text-rose-500 text-right">{metricType !== 'route' ? '-' : ''}{getPipelineMetric(stage, 'drops')}</td>
                        <td className="py-3 text-sm font-medium text-blue-600 text-right">{metricType !== 'route' ? '-' : ''}{getPipelineMetric(stage, 'next_stage')}</td>
                        <td className={`py-3 text-sm font-black text-indigo-700 text-right bg-indigo-50/30 px-2 ${metricType !== 'route' ? 'font-mono' : ''}`}>{getPipelineMetric(stage, 'end')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Aging Analysis */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="border-b border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-sky-100 p-2 rounded-lg text-sky-600">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Aging Analysis</h2>
                    <p className="text-xs font-bold text-slate-500 mt-0.5">As of: {startDate}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Stage</th>
                      <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">By Count</th>
                      <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">By Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {aging?.stages?.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 text-sm font-bold text-slate-700">{s.name}</td>
                        <td className="py-3 text-sm font-medium text-slate-600 text-right">{s.count}</td>
                        <td className="py-3 text-sm font-medium text-slate-600 text-right">{formatCurrency(s.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SLA Heat Map */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="border-b border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                    <Activity size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">Procurement Cycle Time SLA Heat Map</h2>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Analysis Period:</span>
                  <select className="bg-white border border-slate-200 text-sm font-bold text-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm cursor-pointer">
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
                      <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Stage</th>
                      <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Within SLA</th>
                      <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">50% Above SLA</th>
                      <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">&gt;100% Over SLA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {slas.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 text-sm font-bold text-slate-700">{s.stage}</td>
                        <td className="py-4 text-center">
                          <span className={`px-4 py-1.5 rounded-md text-sm font-black ${s.within_sla > 0 ? 'bg-emerald-50 text-emerald-600' : 'text-slate-300'}`}>{s.within_sla}</span>
                        </td>
                        <td className="py-4 text-center">
                          <span className={`px-4 py-1.5 rounded-md text-sm font-black ${s.above_50_sla > 0 ? 'bg-amber-50 text-amber-600' : 'text-slate-300'}`}>{s.above_50_sla}</span>
                        </td>
                        <td className="py-4 text-center">
                          <span className={`px-4 py-1.5 rounded-md text-sm font-black ${s.over_100_sla > 0 ? 'bg-rose-50 text-rose-600' : 'text-slate-300'}`}>{s.over_100_sla}</span>
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
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="border-b border-slate-100 p-6 flex items-center gap-3 bg-slate-50/50">
                  <div className="bg-rose-100 p-2 rounded-lg text-rose-600">
                    <AlertTriangle size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">Pending Tasks</h2>
                </div>
                <PendingTasks />
            </div>

            {/* Always on Transaction Copilot */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-indigo-600 p-5">
                  <div className="flex items-center gap-3">
                    <BrainCircuit className="text-white" size={24} />
                    <h2 className="text-lg font-bold text-white tracking-wide">Copilot Support</h2>
                  </div>
              </div>
              <div className="p-5 bg-indigo-50/50">
                  <div className="bg-white border text-sm border-indigo-100 rounded-xl p-4 mb-4 text-slate-700 shadow-sm relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-xl"></div>
                    I noticed <span className="font-bold text-indigo-700">12 bottlenecks</span> in the Supplier Evaluation stage. Want me to draft an escalation alert?
                  </div>
                  <div className="relative">
                    <input type="text" placeholder="Message Copilot..." className="w-full pl-5 pr-12 py-3 rounded-xl border border-slate-200 text-sm focus:border-indigo-500 outline-none shadow-inner" />
                    <button className="absolute right-2 top-2 p-1.5 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors">
                      <Zap size={16} />
                    </button>
                  </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PR List Table (Visible to everyone) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="border-b border-slate-100 p-6 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800">{isRestricted ? "My Purchase Requisitions" : "Purchase Requisitions"}</h2>
        </div>
        
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Requester</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prs.map((pr) => (
                <tr key={pr.id} 
                    onClick={() => handlePrClick(pr.id)}
                    className="hover:bg-indigo-50/30 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-indigo-400" />
                      <span className="text-sm font-black text-slate-700">PR-{pr.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600 max-w-xs truncate" title={pr.description}>{pr.description}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800">{pr.requester}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{pr.location}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{pr.date}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${
                      pr.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 
                      pr.status === 'Rejected' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                    } px-2.5 py-1 rounded text-xs font-bold`}>
                      {pr.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold text-sm bg-indigo-50 px-3 py-1.5 rounded-lg flex items-center gap-1 ml-auto">
                      View <ArrowRight size={14}/>
                    </button>
                  </td>
                </tr>
              ))}
              {prs.length === 0 && (
                <tr>
                   <td colSpan={7} className="text-center py-10 text-slate-500 font-medium">No purchase requisitions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionModule;
