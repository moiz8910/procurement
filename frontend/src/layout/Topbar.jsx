import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  HelpCircle, 
  ChevronRight,
  Menu,
  LogOut,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import NotificationBell from '../components/NotificationBell';

const Topbar = () => {
  const { activeTab, currentUser, filters, updateFilters } = useApp();

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'dashboard':    return 'Control Center';
      case 'categories':   return 'Category Module';
      case 'transactions': return 'Transactions';
      case 'vendors':      return 'Vendor Module';
      default:             return 'Overview';
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('procura_logged_in');
    localStorage.removeItem('procura_user_id');
    window.location.reload();
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: breadcrumb */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <span className="font-bold tracking-tight">PROCURA</span>
          <ChevronRight className="h-4 w-4 text-slate-300" />
          <span className="text-slate-900 font-bold">{getBreadcrumb()}</span>
        </div>
      </div>

      {/* Centre: search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl mx-8">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <Input
            placeholder="Search records, categories, or insights..."
            className="pl-10 h-10 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all rounded-full text-sm"
            value={filters.searchQuery || ''}
            onChange={(e) => updateFilters({ searchQuery: e.target.value })}
          />
        </div>
      </div>

      {/* Right: actions + user */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-indigo-600">
          <HelpCircle className="h-5 w-5" />
        </Button>
        <NotificationBell />
        <div className="h-8 w-px bg-slate-200 mx-1" />

        {/* User info */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-xs font-bold text-slate-900">{currentUser?.name}</span>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{currentUser?.role}</span>
        </div>
        <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-white font-black text-sm shadow-sm ring-2 ring-slate-100">
          {currentUser?.name?.[0]}
        </div>

        {/* Sign out */}
        <button
          id="topbar-signout-btn"
          onClick={handleSignOut}
          title="Sign Out"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
