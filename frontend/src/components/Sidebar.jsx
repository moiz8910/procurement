import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  ShoppingCart, 
  Users, 
  Layers,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';

// Role → badge colour
const ROLE_BADGE = {
  CPO:               { label: 'CPO',              bg: 'bg-violet-100', text: 'text-violet-700' },
  CATEGORY_MANAGER:  { label: 'Cat. Manager',     bg: 'bg-emerald-100',   text: 'text-emerald-700'   },
  SOURCING_ANALYST:  { label: 'Sourcing Analyst',  bg: 'bg-sky-100',    text: 'text-sky-700'    },
  REQUESTER:         { label: 'PR Requester',      bg: 'bg-emerald-100',text: 'text-emerald-700'},
};

const Sidebar = () => {
  const { activeTab, setActiveTab, currentUser } = useApp();

  const mainModules = [
    {
      id: 'dashboard',
      label: 'Control Center',
      icon: LayoutDashboard,
      allowedRoles: ['CPO'],
      description: 'Executive overview & KPIs',
    },
    {
      id: 'categories',
      label: 'Category Module',
      icon: Layers,
      allowedRoles: ['CPO', 'CATEGORY_MANAGER', 'SOURCING_ANALYST'],
      description: 'Manage spend categories',
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: ShoppingCart,
      allowedRoles: ['CPO', 'CATEGORY_MANAGER', 'SOURCING_ANALYST', 'REQUESTER'],
      description: 'Purchase orders & PRs',
    },
    {
      id: 'vendors',
      label: 'Vendor Module',
      icon: Users,
      allowedRoles: ['CPO', 'CATEGORY_MANAGER'],
      description: 'Supplier governance',
    },
  ];

  const visibleModules = mainModules.filter(m =>
    m.allowedRoles.includes(currentUser?.roleType)
  );

  const handleSignOut = () => {
    localStorage.removeItem('procura_logged_in');
    localStorage.removeItem('procura_user_id');
    window.location.reload();
  };

  return (
    <aside className="w-64 bg-white text-slate-800 h-screen flex flex-col fixed left-0 top-0 z-40 border-r border-sky-100">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-sky-50 bg-white">
        <div className="bg-sky-500 text-white p-1.5 flex items-center justify-center">
          <Building2 size={18} />
        </div>
        <div>
          <h1 className="text-lg font-black tracking-[0.2em] text-primary mt-0.5">SOURCE</h1>
        </div>
        <div className="ml-auto">
          <span className="text-[8px] font-black border border-primary text-primary px-1.5 py-0.5">AI</span>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-8 px-0 no-scrollbar">
        {/* Role label */}
        <div className="px-6 mb-8 uppercase">
          <p className="text-[9px] font-black text-slate-300 tracking-[0.2em] mb-1">Authenticated As</p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-primary" />
            <p className="text-[10px] font-black text-slate-400 tracking-widest">{currentUser?.role}</p>
          </div>
        </div>

        <nav className="space-y-0.5">
          {visibleModules.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={item.description}
              className={`w-full flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-l-2 ${
                activeTab === item.id
                  ? 'bg-sky-50 text-primary border-primary font-black'
                  : 'text-slate-400 border-transparent hover:text-primary hover:bg-sky-50/50'
              }`}
            >
              <item.icon
                size={16}
                className={activeTab === item.id ? 'text-primary' : 'text-slate-300'}
              />
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* User footer + Sign Out */}
      <div className="p-4 border-t border-sky-50 bg-slate-50/50">
        <div className="flex items-center gap-3 px-2 py-3 mb-4">
          <div className="h-8 w-8 bg-sky-50 border border-sky-100 flex items-center justify-center text-primary font-black text-[11px] flex-shrink-0">
            {currentUser?.name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-black text-slate-800 truncate uppercase tracking-tight">{currentUser?.name}</p>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest truncate">{currentUser?.role}</p>
          </div>
        </div>
        <button
          id="sidebar-signout-btn"
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-3 hover:bg-red-50 text-slate-400 hover:text-red-500 group border border-sky-50 transition-all"
        >
          <LogOut size={14} className="text-slate-300 group-hover:text-red-500 transition-colors" />
          <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
