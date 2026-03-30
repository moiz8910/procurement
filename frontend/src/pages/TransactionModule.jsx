import React, { useState, useEffect } from 'react';
import { getTransactionPipeline, getTransactionAging, getTransactionSlas, getPrList } from '../api';
import { useApp } from '../context/AppContext';
import { 
  FileText, Activity, Clock, Filter, AlertTriangle, ArrowRight, BrainCircuit, Zap
} from 'lucide-react';
import PendingTasks from '../components/PendingTasks';

const TransactionModule = () => {
  const { currentUser } = useApp();
  const [pipeline, setPipeline] = useState(null);
  const [aging, setAging] = useState(null);
  const [slas, setSlas] = useState([]);
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-400 font-bold animate-pulse">
      Loading Transaction data...
    </div>
  );

  const isRestricted = currentUser?.roleType === 'REQUESTER';

  return (
    <div className="space-y-6 px-4 py-6 max-w-[1400px] mx-auto">
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
          
          {/* Main Funnel Pipeline (2 Col) */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="border-b border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Procurement Pipeline Dashboard</h2>
                    <p className="text-xs font-bold text-slate-500 mt-0.5">As of Today | By Count</p>
                  </div>
                </div>
                {pipeline?.po_placed_ytd && (
                  <div className="text-right flex flex-col items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PO Placed YTD</span>
                    <div className="flex items-baseline gap-2">
                       <span className="text-2xl font-black text-slate-800">{pipeline.po_placed_ytd.count}</span>
                       <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded">{pipeline.po_placed_ytd.trend}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Pipeline Stages</th>
                      <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Additions</th>
                      <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Drops</th>
                      <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Next Stage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {pipeline?.stages?.map((stage, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 text-sm font-bold text-slate-700">{stage.name}</td>
                        <td className="py-3 text-sm font-medium text-emerald-600 text-right">+{stage.additions}</td>
                        <td className="py-3 text-sm font-medium text-rose-500 text-right">-{stage.drops}</td>
                        <td className="py-3 text-sm font-black text-indigo-600 text-right">{stage.next_stage}</td>
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
                    <Clock size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">Procurement Cycle Time SLA Heat Map</h2>
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
                <tr key={pr.id} className="hover:bg-indigo-50/30 transition-colors group cursor-pointer">
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
