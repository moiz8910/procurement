import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Search, 
  HelpCircle, 
  ChevronRight,
  Menu,
  LogOut,
  Languages,
  Check,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import NotificationBell from '../components/NotificationBell';

const Topbar = () => {
  const { activeTab, currentUser, filters, updateFilters } = useApp();
  const { language, changeLanguage, t, LANGUAGES } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'dashboard':    return t('dashboard');
      case 'categories':   return t('categories');
      case 'transactions': return t('transactions');
      case 'vendors':      return t('vendors');
      default:             return t('overview');
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('procura_logged_in');
    localStorage.removeItem('procura_user_id');
    window.location.reload();
  };

  const currentLang = LANGUAGES.find(l => l.code === language);

  return (
    <header className="h-16 border-b border-neutral-200 bg-white/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: breadcrumb */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-500">
          <span className="font-bold tracking-tight">{t('appName')}</span>
          <ChevronRight className="h-4 w-4 text-neutral-300" />
          <span className="text-emerald-900 font-bold">{getBreadcrumb()}</span>
        </div>
      </div>

      {/* Centre: search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl mx-8">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -tranneutral-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-teal-600 transition-colors" />
          <Input
            placeholder={t('searchPlaceholder')}
            className="pl-10 h-10 bg-neutral-50 border-neutral-200 focus:bg-white focus:ring-2 focus:ring-teal-100 transition-all rounded-full text-sm"
            value={filters.searchQuery || ''}
            onChange={(e) => updateFilters({ searchQuery: e.target.value })}
          />
        </div>
      </div>

      {/* Right: actions + user */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-teal-600" title={t('help')}>
          <HelpCircle className="h-5 w-5" />
        </Button>

        {/* ── Language Switcher ── */}
        <div className="relative" ref={langMenuRef}>
          <button
            id="topbar-language-btn"
            onClick={() => setLangMenuOpen(prev => !prev)}
            title={t('selectLanguage')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-neutral-500 hover:text-teal-700 hover:bg-teal-50 transition-colors text-sm font-medium border border-transparent hover:border-teal-100"
          >
            <Languages size={16} />
            <span className="hidden sm:inline text-xs font-bold">{currentLang?.flag} {currentLang?.code.toUpperCase()}</span>
          </button>

          {langMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 shadow-xl rounded-xl overflow-hidden z-50 animate-fadeIn">
              <div className="px-3 py-2 border-b border-neutral-100">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{t('selectLanguage')}</p>
              </div>
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  id={`lang-option-${lang.code}`}
                  onClick={() => { changeLanguage(lang.code); setLangMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors
                    ${language === lang.code
                      ? 'bg-teal-50 text-teal-700 font-bold'
                      : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.label}</span>
                  </span>
                  {language === lang.code && <Check size={13} className="text-teal-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <NotificationBell />
        <div className="h-8 w-px bg-neutral-200 mx-1" />

        {/* User info */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-xs font-bold text-emerald-900">{currentUser?.name}</span>
          <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">{currentUser?.role}</span>
        </div>
        <div className="h-9 w-9 rounded-full bg-blue-800 flex items-center justify-center text-white font-black text-sm shadow-sm ring-2 ring-neutral-100">
          {currentUser?.name?.[0]}
        </div>

        {/* Sign out */}
        <button
          id="topbar-signout-btn"
          onClick={handleSignOut}
          title={t('signOut')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">{t('signOut')}</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
