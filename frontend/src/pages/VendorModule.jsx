import React, { useState, useEffect } from 'react';
import { 
  getVendorDashboardKpis, 
  getVendorPerformance, 
  getVendorIntelligenceDash, 
  getVendorRegistration,
  getVendorSlaAging
} from '../api';
import { useApp } from '../context/AppContext';
import { 
  ShieldAlert, Award, FileText, AlertTriangle, TrendingUp, Calendar as CalendarIcon, Zap, CheckCircle 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const VendorModule = () => {
  const { currentUser } = useApp();
  const [kpis, setKpis] = useState(null);
  const [perf, setPerf] = useState(null);
  const [intel, setIntel] = useState([]);
  const [registration, setRegistration] = useState(null);
  const [sla, setSla] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (['REQUESTER', 'SOURCING_ANALYST'].includes(currentUser?.roleType)) return;
    
    Promise.all([
      getVendorDashboardKpis(),
      getVendorPerformance(),
      getVendorIntelligenceDash(),
      getVendorRegistration(),
      getVendorSlaAging()
    ]).then(([kRes, pRes, iRes, rRes, sRes]) => {
      setKpis(kRes.data);
      setPerf(pRes.data);
      setIntel(iRes.data);
      setRegistration(rRes.data);
      
      // Transform SLA dict to array for chart
      const slaArray = Object.entries(sRes.data).map(([range, count]) => ({ range, count }));
      setSla(slaArray);
      
      setLoading(false);
    }).catch(console.error);
  }, [currentUser]);

  if (['REQUESTER', 'SOURCING_ANALYST'].includes(currentUser?.roleType)) {
    return (
      <div className="flex flex-col items-center justify-center p-20 mt-10 max-w-2xl mx-auto text-center border border-rose-100 bg-rose-50 rounded-3xl">
        <ShieldAlert className="text-rose-500 mb-4 h-16 w-16" />
        <h3 className="text-2xl font-black text-rose-700 mb-2">Restricted Access</h3>
        <p className="text-rose-600 font-medium leading-relaxed">Your current role <strong>({currentUser.role})</strong> does not grant access to enterprise supplier governance data. Please switch to a CPO or Category Manager profile to view this dashboard.</p>
      </div>
    );
  }

  if (loading) return <div className="p-10 text-center font-bold text-slate-400 animate-pulse">Loading Vendor Governance...</div>;

  return (
    <div className="space-y-6 px-4 py-6 max-w-[1600px] mx-auto">
      {/* Dynamic Global KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Unit Cost Reduction", value: kpis?.unitCostReduction, icon: TrendingUp },
          { label: "On-Contract Spend", value: kpis?.onContractSpend, icon: CheckCircle },
          { label: "On-Time Delivery", value: kpis?.onTimeDelivery, icon: Award },
          { label: "Cost Savings", value: kpis?.costSavings, icon: Zap },
          { label: "Invoice Accuracy", value: kpis?.invoiceAccuracy, icon: FileText }
        ].map((k, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="h-10 w-10 shrink-0 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <k.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{k.label}</p>
              <h4 className="text-xl font-black text-slate-800 leading-none">{k.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (1 Col) */}
        <div className="space-y-6">
          {/* Performance Management */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
             <div className="border-b border-slate-100 p-5 bg-slate-50/50 flex justify-between items-center">
               <h2 className="text-base font-bold text-slate-800">Performance Management</h2>
             </div>
             <div className="p-5">
               <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 text-rose-600">Top Global Issues</h3>
               <ul className="space-y-2 mb-6">
                 {perf?.top_issues?.map((issue, idx) => (
                   <li key={idx} className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-rose-50/50 p-2 rounded-lg border border-rose-100/50">
                     <AlertTriangle size={14} className="text-rose-400 shrink-0" /> {issue}
                   </li>
                 ))}
               </ul>
               <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3">Top Performing Vendors</h3>
               <ul className="space-y-2 mb-4">
                 {perf?.top_vendors?.map((vendor, idx) => (
                   <li key={idx} className="flex items-center justify-between text-sm font-bold text-slate-800 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/50">
                     <span>{vendor}</span>
                     <span className="text-emerald-600">Rank #{idx+1}</span>
                   </li>
                 ))}
               </ul>
               <button className="w-full text-center text-xs font-bold text-indigo-600 bg-indigo-50 py-2 rounded-lg hover:bg-indigo-100 transition-colors">
                 View Detailed Scorecards
               </button>
             </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
             <div className="border-b border-slate-100 p-5 bg-slate-50/50">
               <h2 className="text-base font-bold text-slate-800">Always-On Vendor Discovery</h2>
             </div>
             <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                   <div className="h-12 w-12 bg-blue-100 rounded-xl flex flex-col items-center justify-center text-blue-700 font-black">
                     12
                   </div>
                   <div>
                     <span className="text-sm font-bold text-slate-800 block">New matches this week</span>
                     <span className="text-[10px] font-bold text-slate-400 uppercase">Categories analyzed</span>
                   </div>
                </div>
                <button className="w-full text-center text-xs font-bold text-blue-600 bg-blue-50 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                 View Shortlist
               </button>
             </div>
          </div>
        </div>

        {/* Center Column (1 Col) - Vendor Intelligence */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
            <div className="border-b border-slate-100 p-5 bg-slate-50/50 flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-800">Vendor Intelligence Feed</h2>
            </div>
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
               {intel.map((item, idx) => (
                 <div key={idx} className="p-4 border border-slate-100 rounded-xl relative overflow-hidden group hover:border-indigo-100 hover:shadow-sm transition-all cursor-pointer bg-slate-50/30">
                    <div className="absolute top-0 left-0 w-1 h-full" style={{
                      backgroundColor: item.impact === 'High' ? '#ef4444' : item.impact === 'Medium' ? '#f59e0b' : '#3b82f6'
                    }} />
                    <div className="pl-2">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] uppercase font-black tracking-widest" style={{
                          color: item.impact === 'High' ? '#ef4444' : item.impact === 'Medium' ? '#f59e0b' : '#3b82f6'
                        }}>{item.impact} Impact</span>
                        <span className="text-xs font-bold text-slate-400">{item.time}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 leading-snug">{item.title}</h4>
                      {item.desc && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{item.desc}</p>}
                    </div>
                 </div>
               ))}
               <button className="w-full text-center text-xs font-bold text-slate-500 hover:text-indigo-600 pt-4 border-t border-slate-100 mt-4 transition-colors">
                 Load older news
               </button>
            </div>
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
           {/* Registration SLA & Pipeline */}
           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
             <div className="border-b border-slate-100 p-5 bg-slate-50/50">
               <h2 className="text-base font-bold text-slate-800">Registration Pipeline</h2>
             </div>
             <div className="p-5">
               <div className="grid grid-cols-2 gap-3 mb-6">
                 <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col items-center">
                   <span className="text-xl font-black text-slate-700">{registration?.started}</span>
                   <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Started</span>
                 </div>
                 <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 flex flex-col items-center">
                   <span className="text-xl font-black text-amber-600">{registration?.in_progress}</span>
                   <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">In-Progress</span>
                 </div>
                 <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 flex flex-col items-center">
                   <span className="text-xl font-black text-indigo-600">{registration?.submitted}</span>
                   <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Submitted</span>
                 </div>
                 <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex flex-col items-center">
                   <span className="text-xl font-black text-emerald-600">{registration?.approved}</span>
                   <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Approved</span>
                 </div>
               </div>

               <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 border-t border-slate-100 pt-4">SLA Aging Chart (Approvals)</h3>
               <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sla} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                      <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 'bold' }} />
                      <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
             </div>
           </div>

           {/* Always on Vendor Copilot */}
           <div className="bg-indigo-600 rounded-2xl shadow-sm overflow-hidden flex flex-col group border border-indigo-700">
             <div className="p-4 flex flex-col h-full bg-indigo-600">
                <div className="flex items-center gap-3 mb-4 text-white">
                  <Zap size={20} className="text-yellow-400 fill-current" />
                  <h2 className="text-sm font-bold tracking-widest uppercase text-white/90">Vendor Assistant</h2>
                </div>
                <div className="bg-white/10 rounded-xl p-3 mb-4 backdrop-blur-sm border border-white/20 text-white text-xs font-medium leading-relaxed">
                  I analyze vendor ESG risks and financial drops. Need a meeting brief for Vendor C regarding missed OTIF targets? 
                </div>
                <div className="relative mt-auto">
                    <input type="text" placeholder="Draft a vendor governance plan..." className="w-full pl-4 pr-10 py-3 rounded-xl bg-white/10 border border-indigo-400 text-white placeholder-indigo-300 text-xs focus:bg-white focus:text-indigo-900 focus:placeholder-slate-400 transition-all outline-none" />
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default VendorModule;
