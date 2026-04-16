import React, { useState, useEffect } from 'react';
import { 
  getVendorDashboardKpis, 
  getVendorPerformance, 
  getVendorIntelligenceDash, 
  getVendorRegistration,
  getVendorSlaAging,
  getVendorDiscovery,
  getVendorTasks
} from '../api';
import { useApp } from '../context/AppContext';
import { 
  ShieldAlert, Award, FileText, AlertTriangle, TrendingUp, 
  Calendar as CalendarIcon, Zap, CheckCircle, MapPin, Search, 
  ChevronRight, BrainCircuit, Users, Clock, Star
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
// removed react-hot-toast to resolve build error


const VendorModule = () => {
  const { currentUser } = useApp();
  const [kpis, setKpis] = useState(null);
  const [perf, setPerf] = useState(null);
  const [intel, setIntel] = useState([]);
  const [registration, setRegistration] = useState(null);
  const [sla, setSla] = useState(null);
  const [discovery, setDiscovery] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (['REQUESTER', 'SOURCING_ANALYST'].includes(currentUser?.roleType)) return;
    
    Promise.all([
      getVendorDashboardKpis(),
      getVendorPerformance(),
      getVendorIntelligenceDash(),
      getVendorRegistration(),
      getVendorSlaAging(),
      getVendorDiscovery(),
      getVendorTasks()
    ]).then(([kRes, pRes, iRes, rRes, sRes, dRes, tRes]) => {
      setKpis(kRes.data);
      setPerf(pRes.data);
      setIntel(iRes.data);
      setRegistration(rRes.data);
      setDiscovery(dRes.data);
      setTasks(tRes.data);
      
      const slaArray = Object.entries(sRes.data).map(([range, count]) => ({ range, count }));
      setSla(slaArray);
      
      setLoading(false);
    }).catch(console.error);
  }, [currentUser]);

  const handleShortlist = () => {
    alert('Vendors successfully added to shortlisted pool!');
  };

  const handleGoogleCalendar = () => {
    const calendarUrl = "https://calendar.google.com/calendar/u/0/r/eventedit?text=Strategic+Meeting+with+Vendor+CFO&details=Discussion+on+leadership+transition+and+performance+alignment.&location=Virtual+Meeting";
    window.open(calendarUrl, '_blank');
  };

  if (['REQUESTER', 'SOURCING_ANALYST'].includes(currentUser?.roleType)) {
    return (
      <div className="flex flex-col items-center justify-center p-20 mt-10 max-w-2xl mx-auto text-center border border-rose-100 bg-rose-50 rounded-3xl">
        <ShieldAlert className="text-rose-500 mb-4 h-16 w-16" />
        <h3 className="text-2xl font-black text-rose-700 mb-2">Restricted Access</h3>
        <p className="text-rose-600 font-medium leading-relaxed">Your current role <strong>({currentUser.role})</strong> does not grant access to enterprise supplier governance data.</p>
      </div>
    );
  }

  if (loading) return <div className="p-10 text-center font-bold text-neutral-400 animate-pulse text-lg tracking-widest uppercase">Initializing Supplier Intelligence...</div>;

  return (
    <div className="space-y-6 px-4 py-6 max-w-[1700px] mx-auto min-h-screen bg-neutral-50/20">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <h1 className="text-3xl font-black text-emerald-900 tracking-tight">Vendor Management Hub</h1>
           <p className="text-sm font-bold text-neutral-500">Live performance monitoring & strategic supplier discovery.</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border border-neutral-200 px-5 py-2.5 hover:bg-neutral-50 text-neutral-700 text-sm font-black rounded-2xl transition-all shadow-sm">Reporting Console</button>
           <button className="bg-emerald-900 px-5 py-2.5 hover:bg-black text-white text-sm font-black rounded-2xl transition-all shadow-lg">Onboard New Supplier</button>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
        {[
          { label: "Unit Cost Reduction", value: kpis?.unitCostReduction || "8%", icon: TrendingUp, color: "indigo" },
          { label: "On-Contract Spend", value: kpis?.onContractSpend || "72%", icon: CheckCircle, color: "emerald" },
          { label: "On-Time Delivery", value: kpis?.onTimeDelivery || "85%", icon: Award, color: "sky" },
          { label: "Cost Savings", value: kpis?.costSavings || "₹4.2 Cr", icon: Zap, color: "amber" },
          { label: "Invoice Accuracy", value: kpis?.invoiceAccuracy || "96%", icon: FileText, color: "rose" }
        ].map((k, i) => (
          <div key={i} className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:tranneutral-y-[-4px] transition-all duration-300 group">
             <div className={`h-12 w-12 shrink-0 bg-${k.color}-50 rounded-2xl flex items-center justify-center text-${k.color}-600 mb-4 group-hover:scale-110 transition-transform`}>
               <k.icon size={24} />
             </div>
             <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">{k.label}</p>
             <h4 className="text-2xl font-black text-emerald-900 tracking-tight">{k.value}</h4>
          </div>
        ))}
      </div>

      {/* Main Grid Overhaul */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* Col 1: Performance Management */}
        <div className="space-y-6">
           <div className="bg-white rounded-[2rem] shadow-sm border border-neutral-100 overflow-hidden h-full flex flex-col">
             <div className="border-b border-neutral-100 p-6 bg-neutral-50/50">
               <h2 className="text-xs font-black text-blue-800 uppercase tracking-[0.2em] flex items-center gap-2">
                 <div className="w-1.5 h-4 bg-teal-500 rounded-full"></div>
                 Performance Management
               </h2>
             </div>
             <div className="p-7 flex-1">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-4 flex items-center gap-1.5">
                 <AlertTriangle size={12} /> Priority Performance Gaps
               </h3>
               <div className="space-y-2 mb-8">
                 {(perf?.top_issues || ["Missed OTIF targets", "High reject rates", "Frequent delays"]).map((issue, idx) => (
                   <div key={idx} className="flex items-center gap-3 text-xs font-bold text-neutral-600 bg-rose-50/30 p-3 rounded-2xl border border-rose-100/30">
                     <div className="h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0"></div> {issue}
                   </div>
                 ))}
               </div>
               
               <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-4 flex items-center gap-1.5">
                 <Star size={12} /> Top Performing Suppliers
               </h3>
               <div className="space-y-3 mb-8">
                 {(perf?.top_vendors || ["Vendor A", "Vendor B", "Vendor C"]).map((vendor, idx) => (
                   <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl border border-neutral-50 bg-neutral-50/50 hover:border-emerald-200 transition-colors cursor-default">
                     <span className="text-xs font-black text-neutral-700">{vendor}</span>
                     <div className="flex gap-1 text-amber-400">
                        {[1,2,3,4,5].map(s => <Star key={s} size={10} fill={s <= 4 ? "currentColor" : "none"} />)}
                     </div>
                   </div>
                 ))}
               </div>
               <button className="w-full text-center text-xs font-black text-teal-600 bg-teal-50/50 py-3.5 rounded-2xl hover:bg-teal-600 hover:text-white transition-all duration-300">
                 View Global Scorecards
               </button>
             </div>
           </div>
        </div>

        {/* Col 2: Vendor Intelligence (Perfect) */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-neutral-100 overflow-hidden flex flex-col pt-7">
            <div className="px-6 mb-6">
              <h2 className="text-xs font-black text-blue-800 uppercase tracking-[0.2em] flex items-center gap-2 outline-none">
                 <div className="w-1.5 h-4 bg-amber-500 rounded-full"></div>
                 Market Intelligence
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto px-7 pb-6 space-y-4">
               {intel.map((item, idx) => (
                 <div key={idx} className="group cursor-pointer border-b border-neutral-50 pb-4 last:border-0">
                   <div className="flex justify-between items-center mb-2">
                     <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                       item.impact === 'High' ? 'bg-rose-100 text-rose-600' : 
                       item.impact === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-sky-100 text-sky-600'
                     }`}>{item.impact} Impact</span>
                     <span className="text-[10px] font-bold text-neutral-400 flex items-center gap-1"><Clock size={10} /> {item.time}</span>
                   </div>
                   <h4 className="text-xs font-black text-neutral-700 leading-normal group-hover:text-teal-600 transition-colors uppercase tracking-tight">{item.title}</h4>
                 </div>
               ))}
            </div>
        </div>

        {/* Col 3: Alerts + Global Calendar */}
        <div className="space-y-6">
            {/* Functional Link Card */}
            <div className="bg-rose-600 rounded-[2rem] p-7 shadow-2xl relative overflow-hidden group border border-rose-700">
               <div className="absolute right-0 top-0 overflow-hidden h-32 w-32 blur-3xl opacity-20 bg-white rounded-full"></div>
               <div className="flex items-center gap-3 mb-6 relative">
                  <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center text-white outline outline-1 outline-white/30 backdrop-blur-md">
                     <ShieldAlert size={20} />
                  </div>
                  <h3 className="text-white font-black text-[10px] tracking-widest uppercase opacity-80">Critical Alert</h3>
               </div>
               <h4 className="text-white text-xl font-black leading-[1.1] mb-3 pr-4">Vendor X CFO Leadership Change</h4>
               <p className="text-white/80 text-xs font-bold leading-relaxed mb-8">Urgent: Leadership realignment detected. Contract terms may require immediate reassessment.</p>
               <button 
                onClick={handleGoogleCalendar} 
                className="w-full bg-white text-rose-600 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:shadow-inner hover:scale-[0.98] transition-all flex items-center justify-center gap-2"
               >
                  <CalendarIcon size={14} /> Create Meeting Plan
               </button>
            </div>

            {/* Calendar & Tasks Block */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-neutral-100 overflow-hidden flex flex-col h-full">
               <div className="p-7 flex gap-7 items-start">
                  <div className="flex flex-col items-center bg-teal-600 rounded-3xl p-5 w-24 border border-teal-700 shadow-xl shadow-teal-100 shrink-0">
                     <span className="text-[10px] font-black text-teal-200 uppercase tracking-widest leading-none mb-1">Wed</span>
                     <span className="text-4xl font-black text-white leading-none">24</span>
                  </div>
                  <div className="flex-1 pt-1">
                     <h3 className="text-xs font-black text-blue-800 uppercase tracking-widest mb-4">Pending Tasks</h3>
                     <div className="space-y-3">
                        {tasks.map((task, i) => (
                          <div key={i} className="flex items-start gap-2.5 group cursor-pointer">
                             <div className="h-4 w-4 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 group-hover:bg-teal-600 transition-colors">
                                <CheckCircle size={10} className="text-teal-600 group-hover:text-white" />
                             </div>
                             <span className="text-[11px] font-bold text-neutral-500 group-hover:text-emerald-900 transition-colors leading-tight">{task}</span>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
        </div>

        {/* Col 4: Discovery, Registration & SLA */}
        <div className="space-y-6">
           {/* Proper Vendor Discovery Card */}
           <div className="bg-[#0f172a] rounded-[2rem] p-7 shadow-2xl relative overflow-hidden ring-1 ring-white/10">
              <div className="absolute right-0 top-0 p-4">
                 <div className="h-10 w-10 bg-teal-500/10 text-teal-400 rounded-2xl flex items-center justify-center border border-teal-500/20">
                    <Search size={18} />
                 </div>
              </div>
              <h2 className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                 <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse shadow-[0_0_10px_#6366f1]"></div>
                 Vendor Discovery
              </h2>
              <div className="flex flex-col gap-1 mb-8">
                 <span className="text-5xl font-black text-white tracking-tighter">12</span>
                 <span className="text-teal-400 text-[10px] font-black uppercase tracking-widest">New matches this week</span>
              </div>
              
              <div className="space-y-4 mb-8 pt-4 border-t border-white/5">
                 <div>
                    <h5 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Target Categories</h5>
                    <div className="flex flex-wrap gap-2">
                       {(discovery?.categories || ["1", "2", "3"]).map((cat, i) => (
                         <span key={i} className="text-[9px] font-black text-teal-200 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">{cat}</span>
                       ))}
                    </div>
                 </div>
                 <div>
                    <h5 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Top Geographies</h5>
                    <div className="flex flex-wrap gap-2">
                       {(discovery?.geographies || ["1", "2", "3"]).map((geo, i) => (
                         <span key={i} className="text-[9px] font-black text-emerald-200 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">{geo}</span>
                       ))}
                    </div>
                 </div>
              </div>
              
              <button 
                onClick={handleShortlist}
                className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-teal-900 transition-all active:scale-95 shadow-xl shadow-teal-900/10 border border-teal-500"
              >
                 Shortlist Candidates <ChevronRight size={14} />
              </button>
           </div>

           {/* Registration Pipeline (Proper) */}
           <div className="bg-white rounded-[2rem] shadow-sm border border-neutral-100 overflow-hidden">
              <div className="p-7">
                 <h2 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-5">Onboarding Pipeline</h2>
                 <div className="grid grid-cols-2 gap-3">
                    {[
                      { l: "Initial", v: registration?.started || 42, c: "slate" },
                      { l: "Analysis", v: registration?.in_progress || 30, c: "amber" },
                      { l: "Submitted", v: registration?.submitted || 20, c: "indigo" },
                      { l: "Certified", v: registration?.approved || 15, c: "emerald" }
                    ].map((st, i) => (
                      <div key={i} className={`bg-${st.c}-50 p-4 rounded-[1.5rem] border border-${st.c}-100 flex flex-col items-center group`}>
                         <span className={`text-xl font-black text-${st.c}-800 group-hover:scale-125 transition-transform`}>{st.v}</span>
                         <span className={`text-[8px] uppercase font-black text-${st.c}-500 tracking-tighter opacity-70 mt-1`}>{st.l}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* SLA Aging (Proper) */}
           <div className="bg-white rounded-[2rem] shadow-sm border border-neutral-100 overflow-hidden pt-7">
              <div className="px-7 flex justify-between items-center mb-2">
                 <h2 className="text-[10px] font-black text-blue-800 uppercase tracking-widest">SLA Aging</h2>
                 <button className="text-teal-600 text-[10px] font-black uppercase border-b border-teal-600">View All</button>
              </div>
              <div className="h-28 px-4 pb-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sla} margin={{ top: 10, right: 0, left: -40, bottom: 0 }}>
                      <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 'bold' }} />
                      <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
              </div>
           </div>
        </div>
      </div>

      {/* Integrated Copilot Footer */}
      <div className="mt-8 bg-[#0f172a] rounded-[2rem] p-4 flex flex-col md:flex-row items-center gap-6 shadow-2xl relative border border-white/5">
         <div className="flex items-center gap-4 pl-4 shrink-0">
            <div className="h-10 w-10 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] border border-teal-400/50">
               <BrainCircuit size={20} />
            </div>
            <div>
               <h3 className="text-white text-sm font-black tracking-tight">Always-on Copilot support</h3>
               <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Supplier Analytics Active</p>
            </div>
         </div>
         <div className="flex-1 w-full max-w-4xl relative">
            <input type="text" placeholder="Simulate SLA bottleneck risk for Category 1..." className="w-full pl-6 pr-14 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white text-sm font-medium focus:bg-white/10 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none" />
            <button className="absolute right-2 top-2 p-1.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors shadow-lg">
               <Zap size={18} />
            </button>
         </div>
         <div className="flex gap-4 pr-4">
           <div className="flex -space-x-3">
              {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-blue-800 border-2 border-[#0f172a] flex items-center justify-center text-[10px] text-neutral-500 font-bold uppercase">{i}</div>)}
           </div>
         </div>
      </div>
    </div>
  );
};

export default VendorModule;
