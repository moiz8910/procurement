import React, { useState } from 'react';
import VendorModule from './VendorModule';
import SupplierGovernance from './SupplierGovernance';
import { Users, Shield, TrendingDown, ClipboardCheck } from 'lucide-react';

const PerformanceRisk = () => (
  <div className="p-8 flex flex-col items-center justify-center h-full text-center bg-neutral-50 animate-in fade-in duration-500">
    <TrendingDown size={64} className="text-emerald-200 mb-6" />
    <h3 className="text-3xl font-black text-blue-900 tracking-tight">Performance & Risk Forecasting</h3>
    <p className="text-neutral-500 font-medium max-w-lg mt-4 text-sm leading-relaxed">
      Predictive algorithms forecasting vendor default risks, quality degradation, and financial insolvency alerts.
    </p>
  </div>
);

const OnboardingAudit = () => (
  <div className="p-8 flex flex-col items-center justify-center h-full text-center bg-neutral-50 animate-in fade-in duration-500">
    <ClipboardCheck size={64} className="text-emerald-200 mb-6" />
    <h3 className="text-3xl font-black text-blue-900 tracking-tight">Onboarding & Audit Lifecycle</h3>
    <p className="text-neutral-500 font-medium max-w-lg mt-4 text-sm leading-relaxed">
      Digital ESG, ISO, and compliance certification uploads with direct 3rd-party validation feeds.
    </p>
  </div>
);

const VendorMasterModule = () => {
  const [activeTab, setActiveTab] = useState('directory');

  const tabs = [
    { id: 'directory', label: 'Vendor Directory', icon: Users },
    { id: 'governance', label: 'Supplier Governance', icon: Shield },
    { id: 'performance', label: 'Performance Risk', icon: TrendingDown },
    { id: 'onboarding', label: 'Onboarding & Audit', icon: ClipboardCheck }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'directory': return <VendorModule />;
      case 'governance': return <SupplierGovernance />;
      case 'performance': return <PerformanceRisk />;
      case 'onboarding': return <OnboardingAudit />;
      default: return <VendorModule />;
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="bg-white border-b border-emerald-100 shrink-0 sticky top-0 z-10 w-full px-6 pt-4 shadow-sm">
         <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
           {tabs.map(t => (
             <button
               key={t.id}
               onClick={() => setActiveTab(t.id)}
               className={`flex items-center gap-2 pb-3 border-b-[3px] font-black text-[11px] transition-all uppercase tracking-[0.1em] whitespace-nowrap ${
                 activeTab === t.id 
                 ? 'border-emerald-600 text-emerald-700' 
                 : 'border-transparent text-neutral-400 hover:text-neutral-700 hover:border-neutral-200'
               }`}
             >
               <t.icon size={16} className={activeTab === t.id ? "text-emerald-600" : "text-neutral-400"} /> 
               {t.label}
             </button>
           ))}
         </div>
      </div>
      <div className="flex-1 overflow-x-hidden min-h-0 bg-neutral-50/30">
         {renderContent()}
      </div>
    </div>
  );
};

export default VendorMasterModule;
