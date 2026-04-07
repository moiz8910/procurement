import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getKpis } from '../api';
import { 
  TrendingUp, 
  AlertTriangle, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2,
  PieChart,
  LayoutDashboard,
  DollarSign,
  Package,
  Activity,
  Award,
  ShieldAlert,
  CalendarDays,
  Briefcase,
  TrendingDown,
  Star,
  Users,
  MapPin,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  Info,
  Globe,
  FileText,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Check,
  Ban,
  ArrowRight
} from 'lucide-react';

import KpiTile from '../components/KpiTile';
import Modal from '../components/SharedModal';

// ── MOCK DATA FOR CALENDAR ──────────────────────────────────────────────────
const MOCK_MEETINGS = [
  { id: 1, date: '2024-04-10', time: '10:00 AM', title: 'Q2 Coal Supply Review', vendor: 'Adani Enterprises', type: 'Performance', attendees: 4, agenda: 'Reviewing delivery delays in the northern corridor and discussing price escalation for Q3.' },
  { id: 2, date: '2024-04-12', time: '02:30 PM', title: 'New Alumina Sourcing RFQ', vendor: 'Vedanta Ltd', type: 'Strategic', attendees: 6, agenda: 'Exploring alternative sourcing routes for External Alumina to reduce lead times.' },
  { id: 3, date: '2024-04-15', time: '11:00 AM', title: 'ESG Compliance Audit', vendor: 'Hindalco', type: 'Risk', attendees: 3, agenda: 'Verification of environmental certifications and zero-carbon roadmap alignment.' },
];

const VENDOR_PROFILES = {
  'Adani Enterprises': { spend: '₹42.5 Cr', risk: 'Medium', perf: 78, location: 'India/Global', status: 'Active' },
  'Vedanta Ltd':        { spend: '₹28.4 Cr', risk: 'Low',    perf: 92, location: 'India',        status: 'Strategic' },
  'Hindalco':          { spend: '₹15.2 Cr', risk: 'Low',    perf: 85, location: 'India',        status: 'Active' },
};

// ── SUB-COMPONENT: VENDOR CALENDAR ──────────────────────────────────────────
const VendorCalendar = ({ onMeetingClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2024, 3, 1)); // April 2024

  const daysInMonth = (month) => {
    const date = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    return date.getDate();
  };

  const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth(currentMonth) }, (_, i) => i + 1);
  const blanks = Array.from({ length: startDay }, (_, i) => i);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm uppercase tracking-tight">
          <Calendar className="text-emerald-600" size={18} /> 
          System Engagement Calendar
        </h3>
        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-200"><ChevronLeft size={18} /></button>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">April 2024</span>
          <button className="p-1 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-200"><ChevronRight size={18} /></button>
        </div>
      </div>
      
      <div className="flex-1 p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[9px] font-black uppercase tracking-widest text-slate-300 py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {blanks.map(b => <div key={`b-${b}`} className="aspect-square" />)}
          {days.map(d => {
            const dateStr = `2024-04-${String(d).padStart(2,'0')}`;
            const mtg = MOCK_MEETINGS.find(m => m.date === dateStr);
            return (
              <div key={d} className="aspect-square border border-slate-50 rounded-xl p-1 relative hover:bg-slate-50 transition-all group">
                <span className="text-[10px] font-bold text-slate-300">{d}</span>
                {mtg && (
                  <div 
                    onClick={() => onMeetingClick(mtg)}
                    className="absolute inset-1 mt-4 rounded-lg bg-emerald-600 text-white p-1 flex flex-col justify-center items-center cursor-pointer hover:scale-105 transition-transform shadow-md"
                  >
                    <Users size={10} />
                    <span className="text-[6px] font-black uppercase tracking-tighter truncate w-full text-center">Meeting</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── MAIN COMPONENT: DASHBOARD ───────────────────────────────────────────────
const Dashboard = () => {
  const { currentUser } = useApp();
  
  const [kpis, setKpis] = useState(null);
  const [sd, setSd] = useState('2024-01-01');
  const [ed, setEd] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMtg, setSelectedMtg] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [decisionNote, setDecisionNote] = useState('');
  
  useEffect(() => {
    getKpis({ start_date: sd, end_date: ed }).then(res => {
      setKpis(res.data);
    }).catch(err => console.error("Error fetching KPIs", err));
  }, [sd, ed]);

  const vendorDetail = selectedMtg ? VENDOR_PROFILES[selectedMtg.vendor] : null;

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6 animate-in slide-in-from-bottom-4 duration-700">
      
      {/* ── HEADER AREA ────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] mb-2">
            <LayoutDashboard size={14} /> Enterprise Strategic Control Room
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">
            Welcome back, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-slate-500 font-bold mt-2">Executive oversight & strategic decision support center.</p>
        </div>

        {/* Global Date Filters */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex flex-col px-3 border-r border-slate-100">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
            <input type="date" className="bg-transparent font-bold text-slate-800 outline-none text-xs" value={sd} onChange={e => setSd(e.target.value)} />
          </div>
          <div className="flex flex-col px-3 border-r border-slate-100">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">End Date</label>
            <input type="date" className="bg-transparent font-bold text-slate-800 outline-none text-xs" value={ed} onChange={e => setEd(e.target.value)} />
          </div>
          <div className="p-2"><CalendarDays className="text-emerald-400" size={20} /></div>
        </div>
      </div>

      {/* ── 1. UNIFIED EXECUTIVE KPI BAR ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-2">
        <KpiTile icon={DollarSign} label="Enterprise Spend" value={kpis ? `₹${kpis.total_spend_cr}Cr` : '—'} sub="INR Crore" accent="emerald" />
        <KpiTile icon={TrendingUp} label="Savings YTD" value={kpis ? `₹${kpis.negotiation_savings_cr}Cr` : '—'} sub="FY Target: ₹25.5 Cr" accent="emerald" />
        <KpiTile icon={Users} label="Supplier Conc." value={kpis ? `${kpis.supplier_concentration_pct}%` : '—'} sub="Top 3 Enterprise" accent="emerald" />
        <KpiTile icon={ShieldAlert} label="Global Risk" value={kpis?.avg_risk_score} sub="Consolidated" accent="emerald" />
        <KpiTile icon={Star} label="Vendor Perf." value={kpis?.avg_vendor_performance_score} sub="Organization Avg" accent="emerald" />
        <KpiTile icon={Clock} label="PR to PO Cycle" value={kpis ? `${kpis.pr_to_po_cycle_days}d` : '4.2d'} sub="Efficiency Benchmark" accent="emerald" />
        <KpiTile icon={Briefcase} label="On-Contract" value={kpis ? `${kpis.on_contract_spend_pct}%` : '86%'} sub="Compliance Rate" accent="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── 2. PERFORMANCE MATRIX ───────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-emerald-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] group-hover:scale-110 transition-transform duration-1000" />
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">P•I•P Intelligence Index</h3>
               <TrendingUp className="text-emerald-400" size={20} />
            </div>
            <div className="text-7xl font-black tracking-tighter mb-4">92<span className="text-2xl text-emerald-400">/100</span></div>
            <p className="text-sm font-medium text-emerald-100 leading-relaxed opacity-80">
              Procurement efficiency is in the <span className="text-emerald-400 font-black">top 3%</span> enterprise-wide. 
              Automation handles 84% of high-velocity spend.
            </p>
            <div className="mt-8 flex gap-1">
               <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 w-[92%] shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
               </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-6">
            <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight text-sm"><Award size={18} className="text-emerald-500" /> System Critical Tasks</h3>
             {[
               { id: 'PR_1025', desc: 'High Value PO Approval', sub: 'Coal Logistics · Q2', urgency: 'High', pr: 'PR_1025', amt: '4.2', req: 'S. Sharma' },
               { id: 'SR_108', desc: 'Supplier Risk Mitigation', sub: 'Vendor Audit · Vedanta', urgency: 'Medium', pr: 'SR_108', amt: '0.0', req: 'Audit Team' },
               { id: 'CN_92', desc: 'Contract Renewal: Belts', sub: 'Strategic Sourcing', urgency: 'High', pr: 'CN_92', amt: '2.1', req: 'Y. Kumar' }
             ].map((t, i) => (
              <div key={i} onClick={() => setSelectedTask(t)} className="flex gap-4 p-4 rounded-2xl hover:bg-emerald-50/50 transition-all border border-transparent hover:border-emerald-100 cursor-pointer group">
                <div className={`h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-md transition-all ${t.urgency === 'High' ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {t.urgency === 'High' ? <AlertTriangle size={20} /> : <FileText size={20} />}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-black text-slate-800 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{t.desc}</div>
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-0.5">{t.sub} · {t.id}</p>
                </div>
                <ArrowUpRight size={14} className="text-slate-300 group-hover:text-emerald-600" />
              </div>
            ))}
            <button className="w-full py-4 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:bg-emerald-50 rounded-2xl transition-all border border-transparent hover:border-emerald-100">View All Enterprise Tasks</button>
          </div>
        </div>

        {/* ── 3. SYSTEM ENGAGEMENT CALENDAR ───────────────────────────── */}
        <div className="lg:col-span-2">
          <VendorCalendar onMeetingClick={(mtg) => setSelectedMtg(mtg)} />
        </div>

      </div>

      {/* ── 4. MARKET MONITOR ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Market Intelligence & Risks</h3>
              <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">3 New Trend Alerts</div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4 group hover:border-rose-200 transition-all cursor-pointer">
                 <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">LME Aluminum Spot</span>
                    <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">+12.4% Hike</span>
                 </div>
                 <div className="text-3xl font-black text-slate-900">$2,450 <span className="text-xs font-bold text-slate-400">/ton</span></div>
                 <p className="text-xs font-medium text-slate-500 leading-relaxed italic border-l-4 border-rose-400 pl-3">"Suez disruption impact projected – review active long-term framework hedges."</p>
              </div>
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4 group hover:border-emerald-200 transition-all cursor-pointer">
                 <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Thermal Coal Index</span>
                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">-5.1% Drop</span>
                 </div>
                 <div className="text-3xl font-black text-slate-900">$380 <span className="text-xs font-bold text-slate-400">/t</span></div>
                 <p className="text-xs font-medium text-slate-500 leading-relaxed italic border-l-4 border-emerald-400 pl-3">"Market surplus detected – initiate spot RFQ for buffer replenishment."</p>
              </div>
           </div>
        </div>

        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
           <MapPin className="absolute -top-6 -right-6 text-white/5" size={120} />
           <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-6 flex items-center gap-2"><Globe size={14}/> Geopolitical Exposure Index</h5>
           <div className="space-y-6">
              {[
                { name: 'Port of Singapore', status: 'Stable', col: 'emerald-400', pct: 92 },
                { name: 'Suez Corridor',     status: 'Congested', col: 'rose-400',   pct: 34 },
                { name: 'Indian Domestic',   status: 'Active', col: 'emerald-400', pct: 86 },
              ].map((l, i) => (
                <div key={i} className="space-y-2">
                   <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-tight">
                      <span className="text-slate-400">{l.name}</span>
                      <span className={`text-${l.col}`}>{l.status}</span>
                   </div>
                   <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${l.pct}%` }} />
                   </div>
                </div>
              ))}
           </div>
           <button className="w-full mt-10 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Strategic Drill-down</button>
        </div>
      </div>

      {/* ── MODAL: MEETING DETAIL (Second Screen) ────────────────────── */}
      {selectedMtg && (
        <Modal onClose={() => setSelectedMtg(null)} maxWidth="max-w-4xl">
           <div className="flex flex-col h-full">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                 <div className="flex gap-4 items-center">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-100"><Users size={28}/></div>
                    <div>
                       <h3 className="text-2xl font-black text-slate-800 leading-none">{selectedMtg.title}</h3>
                       <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">{selectedMtg.date} · {selectedMtg.time}</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedMtg(null)} className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all text-slate-400"><X size={24}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Left: Meeting Info */}
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><FileText size={12}/> Meeting Agenda</h5>
                       <p className="text-sm font-medium text-slate-700 leading-relaxed bg-slate-50 p-5 rounded-3xl border border-slate-100 italic">{selectedMtg.agenda}</p>
                    </div>

                    <div className="space-y-3">
                       <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expected Attendees</h5>
                       <div className="flex gap-2">
                          {[1,2,3,4].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-400 -ml-2 first:ml-0">U{i}</div>
                          ))}
                          <div className="w-10 h-10 rounded-full bg-emerald-50 border-2 border-white flex items-center justify-center text-[10px] font-black text-emerald-500">+{selectedMtg.attendees - 4}</div>
                       </div>
                    </div>
                 </div>

                 {/* Right: Vendor Profile */}
                 <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-6 shadow-sm space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100"><Star className="text-amber-500" size={24}/></div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Vendor Partner Profile</p>
                          <h4 className="text-lg font-black text-slate-800">{selectedMtg.vendor}</h4>
                       </div>
                       <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{vendorDetail?.status}</span>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                       <div className="bg-slate-50 rounded-2xl p-4">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Annual Spend</p>
                          <p className="text-xl font-black text-emerald-600">{vendorDetail?.spend}</p>
                       </div>
                       <div className="bg-slate-50 rounded-2xl p-4">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Performance Score</p>
                          <p className="text-xl font-black text-slate-900">{vendorDetail?.perf}<span className="text-xs">/100</span></p>
                       </div>
                       <div className="bg-slate-50 rounded-2xl p-4">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Composite Risk</p>
                          <p className={`text-xl font-black ${vendorDetail?.risk === 'High' ? 'text-rose-600' : 'text-emerald-600'}`}>{vendorDetail?.risk}</p>
                       </div>
                       <div className="bg-slate-50 rounded-2xl p-4">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Base Location</p>
                          <p className="text-sm font-black text-slate-500 flex items-center gap-1 mt-1"><MapPin size={12}/>{vendorDetail?.location}</p>
                       </div>
                    </div>
                    <div className="p-4 bg-emerald-50/50 rounded-3xl border border-emerald-100 flex items-start gap-3">
                       <Info size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                       <p className="text-[11px] font-medium text-emerald-700 italic leading-relaxed">"Strategic partner for carbon-heavy categories. ESG compliance audit completed with No Major Non-Conformances."</p>
                    </div>
                 </div>
              </div>
           </div>
        </Modal>
      )}

      {/* ── MODAL: PENDING TASK WORKFLOW ────────────────────────────────── */}
      {selectedTask && (
        <Modal onClose={() => setSelectedTask(null)} maxWidth="max-w-2xl">
           <div className="border-b border-slate-200 px-8 py-6 flex items-center gap-4 bg-slate-50/50">
             <div className={`p-4 rounded-2xl shadow-sm ${selectedTask.urgency === 'High' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {selectedTask.urgency === 'High' ? <AlertTriangle size={24}/> : <FileText size={24}/>}
             </div>
             <div className="flex-1">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">{selectedTask.desc}</h3>
                <div className="flex items-center gap-2 mt-2">
                   <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${selectedTask.urgency === 'High' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>{selectedTask.urgency} URGENCY</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedTask.id} · {selectedTask.req}</span>
                </div>
             </div>
             <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-slate-600 p-2"><X size={24}/></button>
           </div>
           
           <div className="p-8 space-y-8">
              <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 space-y-6">
                 <div className="flex justify-between items-center bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Strategic Justification</p>
                       <p className="text-sm font-bold text-slate-800 leading-snug">
                          {selectedTask.id.startsWith('PR') ? "Critical replenishment for Q2 operational buffer. Aligned with fiscal inventory optimization strategy." : "Periodic strategic audit to verify master service agreement compliance and performance levels."}
                       </p>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl p-4 border border-slate-100">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Decision Value</p>
                       <p className="text-2xl font-black text-slate-900">₹{selectedTask.amt || '0.0'} Cr</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 border border-slate-100">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Compliance Status</p>
                       <p className="text-lg font-black text-emerald-600 flex items-center gap-1.5"><Check size={16}/> VERIFIED</p>
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><MessageSquare size={14}/> Executive Decision Comments</label>
                    <span className="text-[9px] font-black text-slate-300">MAX 500 CHARS</span>
                 </div>
                 <textarea 
                    rows={4} 
                    value={decisionNote} 
                    onChange={e => setDecisionNote(e.target.value)} 
                    placeholder="Enter formal decision notes for the audit trail..." 
                    className="w-full text-sm font-medium p-5 border-2 border-slate-100 rounded-3xl outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all bg-slate-50/50" 
                 />
                 
                 <div className="flex gap-4 pt-4">
                    <button 
                       onClick={() => setSelectedTask(null)} 
                       className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-200"
                    >
                       <Check size={20}/> APPROVE REQUEST
                    </button>
                    <button 
                       onClick={() => setSelectedTask(null)} 
                       className="flex-1 bg-white border-2 border-rose-100 hover:bg-rose-50 text-rose-600 font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all"
                    >
                       <Ban size={18}/> REJECT
                    </button>
                 </div>
              </div>
           </div>
        </Modal>
      )}

    </div>
  );
};

export default Dashboard;
