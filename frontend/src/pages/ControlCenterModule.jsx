import React, { useState } from 'react';
import Dashboard from './Dashboard';
import TasksPage from './TasksPage';
import { LayoutDashboard, CheckSquare, ShieldCheck, Activity } from 'lucide-react';

const ComplianceLogs = () => (
  <div className="p-8 flex flex-col items-center justify-center h-full text-center bg-neutral-50 animate-in fade-in duration-500">
    <ShieldCheck size={64} className="text-emerald-200 mb-6" />
    <h3 className="text-3xl font-black text-blue-900 tracking-tight">Compliance & Audit Logs</h3>
    <p className="text-neutral-500 font-medium max-w-lg mt-4 text-sm leading-relaxed">
      All enterprise compliance checks have passed. Audit logs are aggregated securely for the CISO team in an immutable ledger.
    </p>
  </div>
);

const SystemWorkflows = () => (
  <div className="p-8 flex flex-col items-center justify-center h-full text-center bg-neutral-50 animate-in fade-in duration-500">
    <Activity size={64} className="text-emerald-200 mb-6" />
    <h3 className="text-3xl font-black text-blue-900 tracking-tight">System Workflows</h3>
    <p className="text-neutral-500 font-medium max-w-lg mt-4 text-sm leading-relaxed">
      Design, automate, and monitor complex ERP integration workflows across your distributed procurement landscape.
    </p>
  </div>
);

const ControlCenterModule = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Exec Overview', icon: LayoutDashboard },
    { id: 'tasks', label: 'Pending Approvals', icon: CheckSquare },
    { id: 'compliance', label: 'Compliance Logs', icon: ShieldCheck },
    { id: 'workflows', label: 'System Workflows', icon: Activity }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <Dashboard />;
      case 'tasks': return <div className="p-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500"><TasksPage /></div>;
      case 'compliance': return <ComplianceLogs />;
      case 'workflows': return <SystemWorkflows />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="bg-white border-b border-neutral-100 shrink-0 sticky top-0 z-10 w-full px-6 pt-4 shadow-sm">
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

export default ControlCenterModule;
