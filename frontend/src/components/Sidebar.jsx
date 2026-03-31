import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  ShoppingCart, 
  Users, 
  Settings,
  LogOut,
  Layers,
  LayoutDashboard,
} from 'lucide-react';

const Sidebar = () => {
  const { activeTab, setActiveTab, currentUser, switchUser, MOCK_USERS } = useApp();

  // Role-based Access Rules for the main modules
  const mainModules = [
    { id: 'dashboard', label: 'Control Center', icon: LayoutDashboard, allowedRoles: ['CPO'] },
    { id: 'categories', label: 'Category Module', icon: Layers, allowedRoles: ['CPO', 'CATEGORY_MANAGER'] },
    { id: 'transactions', label: 'Transaction Procurement', icon: ShoppingCart, allowedRoles: ['CPO', 'CATEGORY_MANAGER', 'SOURCING_ANALYST', 'REQUESTER'] },
    { id: 'vendors', label: 'Vendor Module', icon: Users, allowedRoles: ['CPO', 'CATEGORY_MANAGER'] },
  ];

  const bottomLinks = [
    { id: 'settings', label: 'Settings', icon: Settings, allowedRoles: ['CPO', 'CATEGORY_MANAGER', 'SOURCING_ANALYST', 'REQUESTER'] }
  ];

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0 z-40 transition-all">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-200 bg-white">
        <div className="bg-blue-600 text-white p-1.5 rounded flex items-center justify-center">
          <Building2 size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 uppercase mt-0.5">PROCURA</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6 no-scrollbar">
        {/* Main Modules */}
        <nav className="space-y-1">
          {mainModules
            .filter(m => m.allowedRoles.includes(currentUser?.roleType))
            .map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id 
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <item.icon size={18} className={activeTab === item.id ? 'text-blue-600' : 'text-slate-400'} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Administration */}
        <div className="pt-4 border-t border-slate-200">
          <nav className="space-y-1">
            {bottomLinks
              .filter(l => l.allowedRoles.includes(currentUser?.roleType))
              .map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <item.icon size={18} className={activeTab === item.id ? 'text-blue-600' : 'text-slate-400'} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Modern User Footer for quick sign-out simulation */}
      <div className="p-4 border-t border-slate-200 bg-white">
         <button 
           className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-600 hover:text-red-600 group"
           onClick={() => switchUser(MOCK_USERS[0].id)} // Reset mechanism for demo
         >
           <LogOut size={16} className="text-slate-400 group-hover:text-red-500 transition-colors" />
           <span className="text-sm font-medium">Reset Demo User</span>
         </button>
      </div>
    </aside>
  );
};

export default Sidebar;
