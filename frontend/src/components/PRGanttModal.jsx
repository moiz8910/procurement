import React from 'react';
import SharedModal from './SharedModal';
import { Calendar, Clock, CheckCircle2, CircleDashed, ArrowRight } from 'lucide-react';
import { Badge } from './ui/badge';

const PRGanttModal = ({ pr, onClose }) => {
  if (!pr) return null;

  // Derive process stages and their status based on the PR status
  const currentStatus = pr.status || 'Pending';

  const stages = [
    { id: 'req', name: 'Requisition Raised', durationDays: 1, type: 'past' },
    { id: 'approval', name: 'Approval Process', durationDays: 3, type: currentStatus === 'Pending' ? 'current' : (['APPROVED', 'PO_CREATED'].includes(currentStatus) ? 'past' : 'future') },
    { id: 'sourcing', name: 'Vendor Sourcing', durationDays: 5, type: currentStatus === 'APPROVED' ? 'current' : (currentStatus === 'PO_CREATED' ? 'past' : 'future') },
    { id: 'po', name: 'PO Creation', durationDays: 2, type: currentStatus === 'PO_CREATED' ? 'current' : 'future' },
    { id: 'delivery', name: 'Goods Delivery', durationDays: 10, type: 'future' },
    { id: 'invoice', name: 'Invoice Processing', durationDays: 4, type: 'future' }
  ];

  const totalDays = stages.reduce((acc, s) => acc + s.durationDays, 0);
  
  let currentAccumulatedDays = 0;

  return (
    <SharedModal onClose={onClose} maxWidth="max-w-4xl">
      <div className="p-6 bg-white rounded-none border-b-4 border-teal-600">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-black text-emerald-900 tracking-tight">PR_{pr.id?.toString().padStart(5, '0')} Process Timeline</h2>
              <Badge className={
                currentStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 rounded-none' :
                currentStatus === 'PO_CREATED' ? 'bg-emerald-100 text-emerald-700 rounded-none' :
                'bg-amber-100 text-amber-700 rounded-none'
              }>{currentStatus}</Badge>
            </div>
            <p className="text-neutral-500 font-medium text-sm flex items-center gap-2">
              <span className="font-bold text-neutral-700">Requester:</span> User_{pr.requester_id} 
              <span className="mx-2 text-neutral-300">|</span> 
              <span className="font-bold text-neutral-700">Amount:</span> ${pr.amount?.toLocaleString()}
            </p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 font-black text-2xl leading-none">
            &times;
          </button>
        </div>

        <div className="bg-neutral-50 p-6 rounded-none border border-neutral-200">
          <div className="relative pt-8 pb-12">
            {/* Timeline Header - Scale */}
            <div className="absolute top-0 left-0 w-full flex text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-200 pb-2">
              <div className="w-[30%]">Stage</div>
              <div className="w-[70%] flex justify-between pr-4">
                <span>Start</span>
                <span>Day {Math.floor(totalDays/2)}</span>
                <span>Day {totalDays}</span>
              </div>
            </div>

            {/* Gantt Bars */}
            <div className="mt-6 space-y-4">
              {stages.map((stage, idx) => {
                const widthPercent = (stage.durationDays / totalDays) * 100;
                const leftPercent = (currentAccumulatedDays / totalDays) * 100;
                
                currentAccumulatedDays += stage.durationDays;

                let barColor = 'bg-neutral-200 border-neutral-300';
                let icon = <CircleDashed className="w-4 h-4 text-neutral-400" />;
                let textColor = 'text-neutral-500';

                if (stage.type === 'past') {
                  barColor = 'bg-teal-600 border-teal-700 shadow-sm';
                  icon = <CheckCircle2 className="w-4 h-4 text-teal-600" />;
                  textColor = 'text-teal-900 font-bold';
                } else if (stage.type === 'current') {
                  barColor = 'bg-amber-400 border-amber-500 shadow-md animate-pulse';
                  icon = <Clock className="w-4 h-4 text-amber-600" />;
                  textColor = 'text-amber-800 font-black';
                }

                return (
                  <div key={stage.id} className="flex items-center group">
                    <div className="w-[30%] pr-4 flex items-center gap-3">
                      {icon}
                      <span className={`text-sm ${textColor} group-hover:text-teal-600 transition-colors`}>{stage.name}</span>
                    </div>
                    <div className="w-[70%] relative h-8 bg-neutral-100 border-y border-neutral-200/50 flex flex-col justify-center">
                      {/* Guide lines */}
                      <div className="absolute inset-x-0 inset-y-0 flex justify-between pointer-events-none opacity-20">
                         {Array.from({length: 10}).map((_, i) => <div key={i} className="h-full border-l border-neutral-400"></div>)}
                      </div>

                      {/* Actual Bar */}
                      <div 
                        className={`absolute h-6 ${barColor} border rounded-none transition-all duration-700 ease-out group-hover:brightness-110`}
                        style={{
                          width: `${widthPercent}%`,
                          left: `${leftPercent}%`
                        }}
                      >
                         <div className="px-2 py-0.5 text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {stage.durationDays} Days
                         </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Current Day Line Indicator (Mocked at end of 'current' stage or a fixed point) */}
            <div className="absolute top-8 bottom-0 w-px bg-rose-500 z-10 hidden md:block" style={{ left: '55%' }}>
               <div className="absolute -top-6 -left-8 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 uppercase rounded-none shadow-sm before:content-[''] before:absolute before:-bottom-1 before:left-1/2 before:-tranneutral-x-1/2 before:border-4 before:border-transparent before:border-t-rose-500">
                 Today
               </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 text-sm font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors uppercase tracking-widest rounded-none">
            Close Panel
          </button>
          <button className="px-5 py-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all uppercase tracking-widest rounded-none flex items-center gap-2">
            View full details <ArrowRight className="w-4 h-4"/>
          </button>
        </div>
      </div>
    </SharedModal>
  );
};

export default PRGanttModal;
