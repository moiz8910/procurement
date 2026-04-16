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

  const badge = ROLE_BADGE[currentUser?.roleType] || ROLE_BADGE['REQUESTER'];

  const handleSignOut = () => {
    localStorage.removeItem('procura_logged_in');
    localStorage.removeItem('procura_user_id');
    window.location.reload();
  };

  return (
    <aside className="w-64 bg-neutral-50 border-r border-neutral-200 h-screen flex flex-col fixed left-0 top-0 z-40">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-neutral-200 bg-white">
        <div className="bg-emerald-600 text-white p-1.5 rounded flex items-center justify-center">
          <Building2 size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-blue-800 uppercase mt-0.5">PROCURA</h1>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-6 px-4 no-scrollbar">
        {/* Role context pill */}
        <div className={`mb-5 px-3 py-2 rounded-lg ${badge.bg} flex items-center gap-2`}>
          <div className={`w-2 h-2 rounded-full ${badge.text.replace('text-', 'bg-')}`} />
          <span className={`text-xs font-bold ${badge.text}`}>Logged in as: {badge.label}</span>
        </div>

        <nav className="space-y-1">
          {visibleModules.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={item.description}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-emerald-900'
              }`}
            >
              <item.icon
                size={18}
                className={activeTab === item.id ? 'text-emerald-600' : 'text-neutral-400'}
              />
              <span className="flex-1 text-left">{item.label}</span>
              {activeTab === item.id && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* User footer + Sign Out */}
      <div className="p-4 border-t border-neutral-200 bg-white">
        <div className="flex items-center gap-3 px-2 py-1.5 mb-2">
          <div className="h-8 w-8 rounded-full bg-blue-800 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
            {currentUser?.name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-emerald-900 truncate">{currentUser?.name}</p>
            <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest truncate">{currentUser?.role}</p>
          </div>
        </div>
        <button
          id="sidebar-signout-btn"
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 rounded-lg transition-colors text-neutral-500 hover:text-red-600 group"
        >
          <LogOut size={16} className="text-neutral-400 group-hover:text-red-500 transition-colors" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
