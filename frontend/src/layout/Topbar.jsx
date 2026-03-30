import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  HelpCircle, 
  ChevronRight,
  Menu,
  ChevronDown,
  UserCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import NotificationBell from '../components/NotificationBell';

const Topbar = () => {
  const { activeTab, currentUser, switchUser, MOCK_USERS, filters, updateFilters } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'categories': return 'Category Intelligence';
      case 'transactions': return 'Transactional Procurement';
      case 'vendors': return 'Vendor Governance';
      default: return 'Overview';
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
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

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-indigo-600">
          <HelpCircle className="h-5 w-5" />
        </Button>
        <NotificationBell />
        <div className="h-8 w-px bg-slate-200 mx-2" />
        
        {/* User Role Switcher */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 pl-2 hover:bg-slate-50 p-1.5 rounded-xl transition-colors text-left"
          >
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-xs font-bold text-slate-900">{currentUser.name}</span>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{currentUser.role}</span>
            </div>
            <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-white font-black text-sm shadow-sm ring-2 ring-slate-100">
              {currentUser.name[0]}
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 z-50 py-2 overflow-hidden">
                <div className="px-4 py-2 border-b border-slate-100 mb-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Simulate Role</p>
                </div>
                {MOCK_USERS.map(user => (
                  <button
                    key={user.id}
                    onClick={() => {
                      switchUser(user.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-slate-50 flex flex-col gap-0.5 ${currentUser.id === user.id ? 'bg-indigo-50/50' : ''}`}
                  >
                    <span className="text-sm font-bold text-slate-800">{user.name}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${currentUser.id === user.id ? 'text-indigo-600' : 'text-slate-500'}`}>
                      {user.role}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
