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
    <header className="h-16 border-b border-neutral-200 bg-white px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: breadcrumb */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-neutral-400">
          <span className="text-primary">{t('appName')}</span>
          <ChevronRight className="h-3 w-3 text-neutral-300" />
          <span className="text-primary opacity-60">{getBreadcrumb()}</span>
        </div>
      </div>

      {/* Centre: search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl mx-8">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder={t('searchPlaceholder')}
            className="pl-9 h-9 bg-neutral-50 border-neutral-100 focus:bg-white focus:border-primary focus:ring-0 transition-all rounded-none text-xs font-medium"
            value={filters.searchQuery || ''}
            onChange={(e) => updateFilters({ searchQuery: e.target.value })}
          />
        </div>
      </div>

      {/* Right: actions + user */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-primary" title={t('help')}>
          <HelpCircle className="h-4 w-4" />
        </Button>

        {/* ── Language Switcher ── */}
        <div className="relative" ref={langMenuRef}>
          <button
            id="topbar-language-btn"
            onClick={() => setLangMenuOpen(prev => !prev)}
            title={t('selectLanguage')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-neutral-500 hover:text-primary hover:bg-neutral-50 transition-colors text-[10px] font-black uppercase tracking-widest border border-transparent"
          >
            <Languages size={14} />
            <span className="hidden sm:inline">{currentLang?.code.toUpperCase()}</span>
          </button>

          {langMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 shadow-xl rounded-none overflow-hidden z-50 animate-fadeIn">
              <div className="px-3 py-2 border-b border-neutral-50 bg-neutral-50">
                <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">{t('selectLanguage')}</p>
              </div>
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  id={`lang-option-${lang.code}`}
                  onClick={() => { changeLanguage(lang.code); setLangMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide transition-colors
                    ${language === lang.code
                      ? 'bg-primary/5 text-primary'
                      : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.label}</span>
                  </span>
                  {language === lang.code && <Check size={12} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <NotificationBell />
        <div className="h-6 w-px bg-neutral-200 mx-1" />

        {/* User info */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{currentUser?.name}</span>
          <span className="text-[9px] font-black text-primary uppercase tracking-widest">{currentUser?.role}</span>
        </div>
        <div className="h-8 w-8 bg-sky-50 border border-sky-100 flex items-center justify-center text-primary font-black text-[11px] shadow-sm">
          {currentUser?.name?.[0]}
        </div>

        {/* Sign out */}
        <button
          id="topbar-signout-btn"
          onClick={handleSignOut}
          title={t('signOut')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-slate-300 hover:text-red-500 transition-colors text-[10px] font-black uppercase tracking-widest"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">{t('signOut')}</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
