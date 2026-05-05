import React, { useState, useEffect } from 'react';
import SharedModal from './SharedModal';
import { 
  Calendar, Clock, CheckCircle2, CircleDashed, 
  ArrowRight, Info, ChevronRight, User, TrendingUp 
} from 'lucide-react';
import { Badge } from './ui/badge';
import { getPrGantt } from '../api';

const PRGanttModal = ({ pr, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await getPrGantt(pr.id);
        setDetail(res.data);
      } catch (err) {
        console.error("Failed to fetch PR Gantt details:", err);
      } finally {
        setLoading(false);
      }
    };
    if (pr?.id) fetchDetail();
  }, [pr]);

  if (!pr) return null;

  const currentStatus = detail?.status || pr.status || 'Pending';
  const stages = detail?.stages || [];
  
  let plannedRunningSum = 0;
  let currentRunningSum = 0;
  
  const processedStages = stages.map((s, i) => {
    const pStart = plannedRunningSum;
    const cStart = currentRunningSum;
    plannedRunningSum += s.planned_days;
    currentRunningSum += s.current_days;
    return { ...s, pStart, cStart, pEnd: plannedRunningSum, cEnd: currentRunningSum };
  });

  const totalPossibleDays = Math.max(plannedRunningSum, currentRunningSum, 30);
  const scaleMax = Math.ceil(totalPossibleDays / 4) * 4;

  const STAGE_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

  return (
    <SharedModal onClose={onClose} maxWidth="max-w-6xl">
      <div className="bg-white flex flex-col h-[90vh] overflow-hidden">
        
        {/* Top Branding & Header */}
        <div className="flex-shrink-0 p-8 border-b border-neutral-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-blue-950 flex items-center justify-center text-white font-black text-xl">P</div>
             <div>
                <h2 className="text-2xl font-black text-blue-950 tracking-tight leading-none uppercase">Procurement Lifecycle Gantt</h2>
                <p className="text-[10px] font-black text-neutral-400 mt-1 uppercase tracking-widest">Transaction ID: PR-{pr.id} • {detail?.requester}</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right mr-4">
                <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest leading-none">Overall Progress</p>
                <p className="text-lg font-black text-blue-950">{(currentRunningSum/plannedRunningSum * 100).toFixed(0)}%</p>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-neutral-100 transition-colors text-neutral-400 border border-neutral-100">
                <X size={24} />
             </button>
          </div>
        </div>

        {/* The Gantt Chart Area */}
        <div className="flex-1 overflow-auto bg-[#fafafa] p-8 no-scrollbar relative">
          {loading ? (
            <div className="h-full flex items-center justify-center animate-pulse text-neutral-300">
               <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-blue-950 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Calibrating Phases...</p>
               </div>
            </div>
          ) : (
            <div className="min-w-[1000px] bg-white border border-neutral-200 shadow-sm relative">
              
              {/* Double Decker Header */}
              <div className="flex border-b border-neutral-200">
                <div className="w-[300px] p-4 bg-neutral-50 border-r border-neutral-200 text-[11px] font-black text-neutral-400 uppercase tracking-widest">
                  Task Specification
                </div>
                <div className="flex-1 flex">
                   {Array.from({ length: 4 }).map((_, i) => (
                     <div key={i} className="flex-1 border-r border-neutral-200 last:border-r-0">
                        <div className="p-2 text-center text-[10px] font-black text-blue-950 bg-neutral-50 border-b border-neutral-100">PERIOD 0{i+1}</div>
                        <div className="flex">
                           {[1,2,3].map(d => (
                             <div key={d} className="flex-1 text-center py-1 text-[8px] font-bold text-neutral-300 border-r border-neutral-50 last:border-r-0">
                                {i * 7 + (d * 2)}
                             </div>
                           ))}
                        </div>
                     </div>
                   ))}
                </div>
              </div>

              {/* Rows */}
              <div className="relative">
                {/* Vertical Grid Lines */}
                <div className="absolute inset-x-[300px] inset-y-0 flex justify-between pointer-events-none">
                  {Array.from({ length: scaleMax / 2 + 1 }).map((_, i) => (
                    <div key={i} className="h-full border-l border-neutral-50" />
                  ))}
                </div>

                <div className="divide-y divide-neutral-100">
                  {processedStages.map((stage, idx) => {
                    const cX = (stage.cStart / scaleMax) * 100;
                    const cW = (stage.current_days / scaleMax) * 100;
                    const pW = (stage.planned_days / scaleMax) * 100;
                    const color = STAGE_COLORS[idx % STAGE_COLORS.length];

                    return (
                      <div key={idx} className="flex h-16 relative hover:bg-neutral-50/50 transition-colors group">
                        {/* Task Label Cell */}
                        <div className="w-[300px] flex-shrink-0 px-6 flex items-center gap-4 border-r border-neutral-100 bg-white z-10 group-hover:bg-neutral-50">
                           <span className="text-[10px] font-black text-neutral-300 italic tracking-tighter">0{idx+1}</span>
                           <div>
                              <h4 className="text-[11px] font-black text-blue-950 uppercase leading-none mb-1">{stage.name}</h4>
                              <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{stage.owner}</p>
                           </div>
                        </div>

                        {/* Chart Cell */}
                        <div className="flex-1 relative flex items-center px-4">
                           {/* Baseline Reference (Thin Shadow Bar) */}
                           <div 
                              className="absolute h-0.5 bg-neutral-200/50 top-10"
                              style={{ left: `calc(${cX}% + 16px)`, width: `${pW}%` }}
                           />
                           
                           {/* Main Performance Bar */}
                           <div 
                              className="h-6 rounded-full shadow-lg z-10 flex items-center px-3 group-hover:h-8 transition-all"
                              style={{ 
                                left: `calc(${cX}% + 16px)`, 
                                width: `${cW}%`,
                                backgroundColor: color,
                                position: 'absolute'
                              }}
                           >
                              <div className="flex items-center justify-between w-full overflow-hidden">
                                 <span className="text-[7px] font-black text-white whitespace-nowrap uppercase">
                                    {stage.status === 'completed' ? 'ACT' : 'EST'} {stage.current_days}d
                                 </span>
                                 {stage.status === 'completed' && <CheckCircle2 size={10} className="text-white opacity-80" />}
                              </div>
                           </div>

                           {/* Connector dots */}
                           {idx < processedStages.length - 1 && (
                             <div 
                               className="absolute h-px border-t border-dashed border-neutral-200 z-0"
                               style={{ top: '50%', left: `calc(${cX + cW}% + 16px)`, width: '20px' }}
                             />
                           )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* High Fidelity Legend Footer */}
        <div className="flex-shrink-0 p-8 border-t border-neutral-100 bg-white flex justify-between items-center">
           <div className="flex gap-6">
              {processedStages.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STAGE_COLORS[i % STAGE_COLORS.length] }} />
                   <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">{s.name}</span>
                </div>
              ))}
           </div>
           <div className="flex gap-4">
              <button 
                onClick={onClose}
                className="px-10 py-3 text-[10px] font-black uppercase tracking-widest text-blue-950 border-2 border-blue-950 hover:bg-blue-950 hover:text-white transition-all"
              >
                Dismiss Overview
              </button>
              <button className="px-10 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-900/20 hover:bg-emerald-700 transition-all">
                Export Strategic Analysis
              </button>
           </div>
        </div>
      </div>
    </SharedModal>
  );
};

export default PRGanttModal;
