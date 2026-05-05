import React, { useState, useEffect } from 'react';
import TransactionModule from './TransactionModule';
import ProcurementExecution from './ProcurementExecution';
import RequesterMarketplace from './RequesterMarketplace';
import { useApp } from '../context/AppContext';
import { ShoppingCart, Network, PackageSearch, FileText, BookOpen, HelpCircle } from 'lucide-react';

const ContractCenter = () => (
  <div className="p-8 flex flex-col items-center justify-center h-full text-center bg-neutral-50 animate-in fade-in duration-500">
    <FileText size={64} className="text-emerald-200 mb-6" />
    <h3 className="text-3xl font-black text-blue-900 tracking-tight">Contract Lifecycle Center</h3>
    <p className="text-neutral-500 font-medium max-w-lg mt-4 text-sm leading-relaxed">
      End-to-end contract generation, redlining, and digital signature integration.
    </p>
  </div>
);

const ProcurementGuidelines = () => (
  <div className="p-8 flex flex-col h-full bg-neutral-50 overflow-y-auto animate-in fade-in duration-500">
    <div className="max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-8 border-b border-neutral-200 pb-6">
        <div className="bg-emerald-100 p-4 rounded-2xl">
          <BookOpen strokeWidth={1.5} size={32} className="text-emerald-600" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-blue-900 tracking-tight">Procurement Policy & Guidelines</h3>
          <p className="text-neutral-500 font-medium mt-1">Review enterprise spending limits, preferred vendor mandates, and category rules.</p>
        </div>
      </div>
      
      <div className="grid gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
          <h4 className="text-lg font-bold text-neutral-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Approval Authority Matrix
          </h4>
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-neutral-50 text-neutral-500">
                <th className="p-3 font-bold rounded-l-lg">Role</th>
                <th className="p-3 font-bold">Standard Limit (INR)</th>
                <th className="p-3 font-bold rounded-r-lg">Exceptions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              <tr><td className="p-3 font-medium text-neutral-700">Category Analyst</td><td className="p-3 font-mono">Up to ₹ 50,000</td><td className="p-3 text-neutral-500">Catalog items only</td></tr>
              <tr><td className="p-3 font-medium text-neutral-700">Sourcing Manager</td><td className="p-3 font-mono">Up to ₹ 5,00,000</td><td className="p-3 text-neutral-500">Requires 3 quotes for spot buys</td></tr>
              <tr><td className="p-3 font-medium text-neutral-700">Category Lead</td><td className="p-3 font-mono">Up to ₹ 50,000,000</td><td className="p-3 text-neutral-500">—</td></tr>
              <tr><td className="p-3 font-medium text-neutral-700">CPO</td><td className="p-3 font-mono">&gt; ₹ 50,000,000</td><td className="p-3 text-neutral-500">Board approval for &gt; ₹ 500 Cr</td></tr>
            </tbody>
          </table>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
          <h4 className="text-lg font-bold text-neutral-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Code of Conduct summary
          </h4>
          <ul className="space-y-3 text-sm text-neutral-600 list-disc pl-5">
            <li><strong>Vendor Neutrality:</strong> All RFPs must be floated to a minimum of 3 empanelled vendors.</li>
            <li><strong>Conflict of Interest:</strong> Employees must declare any familial relationships with supplier directors.</li>
            <li><strong>Gifts Policy:</strong> No gifts exceeding ₹ 2,000 in value may be accepted from active bidders.</li>
            <li><strong>Sustainability:</strong> 15% weightage must be given to ESG compliance during vendor rating.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const HelpSupport = () => (
  <div className="p-8 flex flex-col items-center justify-center h-full text-center bg-neutral-50 animate-in fade-in duration-500">
    <HelpCircle size={64} className="text-emerald-200 mb-6" />
    <h3 className="text-3xl font-black text-blue-900 tracking-tight">Help & Support</h3>
    <p className="text-neutral-500 font-medium max-w-lg mt-4 text-sm leading-relaxed">
      Contact the global procurement service desk or chat with the Procura Copilot for requisition troubleshooting.
    </p>
  </div>
);

const TransactionMasterModule = () => {
  const { currentUser } = useApp();
  const isRequester = currentUser?.roleType === 'REQUESTER';

  const [activeTab, setActiveTab] = useState(isRequester ? 'marketplace' : 'orders');
  const [ordersKey, setOrdersKey] = useState(0);

  // Prevent active tab getting stuck if role changes dynamically
  useEffect(() => {
    setActiveTab(isRequester ? 'marketplace' : 'orders');
  }, [isRequester]);

  // When switching to orders tab, bump key to force re-mount (picks up localStorage PRs)
  const goToOrders = () => {
    setOrdersKey(k => k + 1);
    setActiveTab('orders');
  };

  const requesterTabs = [
    { id: 'marketplace', label: 'Requester Marketplace', icon: PackageSearch },
    { id: 'orders', label: 'PR Tracking', icon: ShoppingCart },
    { id: 'guidelines', label: 'Policy & Guidelines', icon: BookOpen },
    { id: 'support', label: 'Help & Support', icon: HelpCircle }
  ];

  const adminTabs = [
    { id: 'orders', label: 'Order Management', icon: ShoppingCart },
    { id: 'execution', label: 'Procurement Execution', icon: Network },
    { id: 'marketplace', label: 'Requester Marketplace', icon: PackageSearch },
    { id: 'contracts', label: 'Contract Center', icon: FileText }
  ];

  const tabs = isRequester ? requesterTabs : adminTabs;

  const renderContent = () => {
    switch (activeTab) {
      case 'orders': return <TransactionModule key={ordersKey} />;
      case 'execution': return <ProcurementExecution />;
      case 'marketplace': return <div className="h-full bg-neutral-50"><RequesterMarketplace onViewOrders={goToOrders} /></div>;
      case 'contracts': return <ContractCenter />;
      case 'guidelines': return <ProcurementGuidelines />;
      case 'support': return <HelpSupport />;
      default: return isRequester ? <div className="h-full bg-neutral-50"><RequesterMarketplace onViewOrders={goToOrders} /></div> : <TransactionModule key={ordersKey} />;
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="bg-white border-b border-emerald-100 shrink-0 sticky top-0 z-10 w-full px-6 pt-4 shadow-sm">
         <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
           {tabs.map(t => (
             <button
               key={t.id}
               onClick={() => t.id === 'orders' ? goToOrders() : setActiveTab(t.id)}
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

export default TransactionMasterModule;
