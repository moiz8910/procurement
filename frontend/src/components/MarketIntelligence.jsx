import React, { useEffect, useState } from 'react';
import { getMarketIntelligence } from '../api';
import { useApp } from '../context/AppContext';
import { Globe, AlertTriangle, Activity, TrendingUp } from 'lucide-react';

const MarketIntelligence = ({ onItemClick }) => {
  const { filters } = useApp();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const catId = filters.categoryId || 1;
    setLoading(true);
    getMarketIntelligence(catId)
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [filters.categoryId]);

  if (loading) return (
    <div className="card p-6 text-neutral-400 flex justify-center items-center h-48 animate-pulse text-sm font-bold">
      Loading intelligence...
    </div>
  );

  return (
    <div className="space-y-4">
      {data.map((item, idx) => (
        <div 
          key={idx} 
          className="group p-5 bg-white border border-neutral-200 rounded-2xl hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
          onClick={() => onItemClick && onItemClick(item)}
        >
          <div className="absolute top-0 right-0 w-1.5 h-full" style={{
            backgroundColor: item.impact === 'High' ? '#ef4444' : item.impact === 'Medium' ? '#f59e0b' : '#3b82f6'
          }} />
          
          <div className="flex items-center justify-between mb-3 pr-4">
            <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{
              color: item.impact === 'High' ? '#ef4444' : item.impact === 'Medium' ? '#f59e0b' : '#3b82f6'
            }}>
              {item.impact === 'High' ? <AlertTriangle size={14} /> : item.impact === 'Medium' ? <Activity size={14} /> : <TrendingUp size={14} />}
              {item.title}
            </h4>
            <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 px-2 py-1 rounded-md">{item.time}</span>
          </div>
          <p className="text-sm text-neutral-600 font-medium leading-relaxed pr-4">{item.desc}</p>
        </div>
      ))}
      {data.length === 0 && (
        <div className="p-8 text-center text-neutral-500 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
          <Globe size={32} className="mx-auto mb-3 text-neutral-300" />
          <p className="text-sm font-bold">No recent market intelligence available for this category.</p>
        </div>
      )}
    </div>
  );
};

export default MarketIntelligence;
