import React, { createContext, useState, useContext } from 'react';

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
  { code: 'ms', label: 'Bahasa Melayu', flag: '🇲🇾' },
];

export const TRANSLATIONS = {
  en: {
    // Breadcrumbs
    appName: 'PROCURA',
    dashboard: 'Control Center',
    categories: 'Category Module',
    transactions: 'Transactions',
    vendors: 'Vendor Module',
    overview: 'Overview',
    // Topbar
    searchPlaceholder: 'Search records, categories, or insights...',
    signOut: 'Sign Out',
    help: 'Help',
    // Sidebar
    home: 'Home',
    settings: 'Settings',
    // General
    language: 'Language',
    selectLanguage: 'Select Language',
  },
  ta: {
    appName: 'PROCURA',
    dashboard: 'கட்டுப்பாட்டு மையம்',
    categories: 'வகை தொகுதி',
    transactions: 'பரிவர்த்தனைகள்',
    vendors: 'விற்பனையாளர் தொகுதி',
    overview: 'கண்ணோட்டம்',
    searchPlaceholder: 'பதிவுகள், வகைகள் அல்லது நுண்ணறிவுகளை தேடுங்கள்...',
    signOut: 'வெளியேறு',
    help: 'உதவி',
    home: 'முகப்பு',
    settings: 'அமைப்புகள்',
    language: 'மொழி',
    selectLanguage: 'மொழியை தேர்ந்தெடு',
  },
  ms: {
    appName: 'PROCURA',
    dashboard: 'Pusat Kawalan',
    categories: 'Modul Kategori',
    transactions: 'Transaksi',
    vendors: 'Modul Vendor',
    overview: 'Gambaran Keseluruhan',
    searchPlaceholder: 'Cari rekod, kategori, atau wawasan...',
    signOut: 'Log Keluar',
    help: 'Bantuan',
    home: 'Laman Utama',
    settings: 'Tetapan',
    language: 'Bahasa',
    selectLanguage: 'Pilih Bahasa',
  },
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('procura_language') || 'en';
  });

  const changeLanguage = (code) => {
    setLanguage(code);
    localStorage.setItem('procura_language', code);
  };

  const t = (key) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
