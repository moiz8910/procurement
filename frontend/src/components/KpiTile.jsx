import React from 'react';

const KpiTile = ({ icon: Icon, label, value, sub, accent = 'emerald', onClick, badge, isDark }) => {
  const map = {
    emerald: 'border-emerald-100 bg-white [&_.ib]:bg-emerald-50 [&_.ib]:text-emerald-600',
    teal:    'border-teal-100   bg-white [&_.ib]:bg-teal-50   [&_.ib]:text-teal-600',
    amber:   'border-amber-100  bg-white [&_.ib]:bg-amber-50  [&_.ib]:text-amber-600',
    slate:   'border-neutral-200  bg-white [&_.ib]:bg-neutral-100 [&_.ib]:text-neutral-600',
    indigo:  'border-indigo-100 bg-white [&_.ib]:bg-indigo-50 [&_.ib]:text-indigo-600',
    rose:    'border-rose-100   bg-white [&_.ib]:bg-rose-50   [&_.ib]:text-rose-600',
    dark:    'border-neutral-700  bg-blue-800 text-white [&_.ib]:bg-neutral-700/50 [&_.ib]:text-emerald-400',
  };
  const theme = isDark ? map.dark : (map[accent] || map.emerald);
  
  return (
    <div
      className={`rounded-xl border p-4 flex flex-col gap-2 shadow-sm transition-all duration-200 ${theme} ${onClick ? 'cursor-pointer hover:-tranneutral-y-0.5 hover:shadow-md' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="ib p-1.5 rounded-md"><Icon size={14} /></div>
          <p className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>{label}</p>
        </div>
        {badge && <span className="text-[8px] font-black bg-amber-500/10 text-amber-600 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase tracking-tighter">{badge}</span>}
      </div>
      <p className={`text-2xl font-black tracking-tight leading-none ${isDark ? 'text-white' : 'text-blue-800'}`}>{value ?? '—'}</p>
      {sub && <p className={`text-[10px] font-bold leading-tight ${isDark ? 'text-neutral-400' : 'text-neutral-400'}`}>{sub}</p>}
    </div>
  );
};

export default KpiTile;
