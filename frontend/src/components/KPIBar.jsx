import React from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent } from '../components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  DollarSign,
  Package,
  Zap,
  Target
} from 'lucide-react';

const KPIBar = () => {
  const { prs, vendors } = useApp();

  // Dynamic calculations
  const totalSpend = prs.reduce((acc, pr) => acc + (pr.amount || 0), 0);
  const avgEfficiency = 84.2; // Sample
  const riskIndex = 12; // Sample

  const kpis = [
    { label: 'YTD Managed Spend', value: `$${(totalSpend / 1000000).toFixed(1)}M`, trend: '+4.2%', icon: DollarSign, color: 'text-teal-600' },
    { label: 'PR-to-PO Velocity', value: '4.8 Days', trend: '-0.5d', icon: Zap, color: 'text-amber-600' },
    { label: 'Sourcing Savings', value: '12.4%', trend: '+1.1%', icon: Target, color: 'text-emerald-600' },
    { label: 'Active Pipeline', value: prs.length, trend: 'Normal', icon: Package, color: 'text-emerald-600' },
  ];

  return (
    <div className="px-6 py-3 flex items-center justify-between gap-6 overflow-x-auto custom-scrollbar no-scrollbar">
      {kpis.map((kpi, idx) => (
        <div key={idx} className="flex items-center gap-4 shrink-0 px-4 py-1.5 rounded-full hover:bg-neutral-50 transition-colors group">
          <div className={`p-2 rounded-full bg-neutral-100 group-hover:bg-white group-hover:shadow-sm transition-all ${kpi.color}`}>
            <kpi.icon className="h-3.5 w-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-tight text-neutral-500">{kpi.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-emerald-900">{kpi.value}</span>
              <span className={`text-[10px] font-bold ${kpi.trend.startsWith('+') ? 'text-emerald-600' : 'text-neutral-400'}`}>
                {kpi.trend}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPIBar;
