import React, { useState, useEffect } from 'react';
import { 
  TrendingDown, 
  CheckCircle, 
  Clock, 
  IndianRupee, 
  FileCheck,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCategoryKpis } from '../api';

const CategoryKPIBanner = () => {
  const { filters } = useApp();
  const [kpis, setKpis] = useState(null);

  useEffect(() => {
    const catId = filters.categoryId || 1;
    getCategoryKpis(catId).then(res => setKpis(res.data));
  }, [filters.categoryId]);

  if (!kpis) return (
    <div className="bg-white border-b flex items-center justify-between px-8 py-3 animate-pulse">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-8 w-32 bg-slate-100 rounded-lg" />
      ))}
    </div>
  );

  const items = [
    { 
      label: 'Unit Cost Reduction', 
      value: `${kpis.unit_cost_reduction || 8.0}%`, 
      icon: TrendingDown, 
      color: 'text-rose-500',
      trend: 'Target: 10%',
      bg: 'bg-rose-50'
    },
    { 
      label: 'On-Contract Spend', 
      value: `${kpis.on_contract_spend || 72.0}%`, 
      icon: CheckCircle, 
      color: 'text-indigo-500',
      trend: '+2.4% MoM',
      bg: 'bg-indigo-50'
    },
    { 
      label: 'On-Time Delivery', 
      value: `${kpis.on_time_delivery || 85}%`, 
      icon: Clock, 
      color: 'text-amber-500',
      trend: 'Critical Line',
      bg: 'bg-amber-50'
    },
    { 
      label: 'Cost Savings', 
      value: `₹${(kpis.cost_savings / 10000000).toFixed(1)} Cr`, 
      icon: IndianRupee, 
      color: 'text-emerald-500',
      trend: 'FY Target: 5.5Cr',
      bg: 'bg-emerald-50'
    },
    { 
      label: 'Invoice Accuracy', 
      value: `${kpis.invoice_accuracy || 96.0}%`, 
      icon: FileCheck, 
      color: 'text-blue-500',
      trend: 'Stable',
      bg: 'bg-blue-50'
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200 flex items-center justify-between px-8 py-3 gap-4 overflow-x-auto no-scrollbar shadow-sm">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-3 shrink-0">
          <div className={`p-2 rounded-lg ${item.bg}`}>
            <item.icon className={`h-4 w-4 ${item.color}`} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
              {item.label}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-black text-slate-900 tabular-nums">
                {item.value}
              </span>
              <span className={`text-[9px] font-bold whitespace-nowrap ${item.color} opacity-80`}>
                {item.trend}
              </span>
            </div>
          </div>
          {idx < items.length - 1 && (
            <div className="h-6 w-px bg-slate-200 ml-4 hidden xl:block" />
          )}
        </div>
      ))}
    </div>
  );
};

export default CategoryKPIBanner;
