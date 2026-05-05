import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LanguageProvider } from './context/LanguageContext';
import MainLayout from './layout/MainLayout';
import Dashboard from './pages/Dashboard';
import TasksPage from './pages/TasksPage';
import CategoryModule from './pages/CategoryModule';
import CategoryIntelligence from './pages/CategoryIntelligence';
import SupplierGovernance from './pages/SupplierGovernance';
import ProcurementExecution from './pages/ProcurementExecution';
import TransactionModule from './pages/TransactionModule';
import VendorModule from './pages/VendorModule';
import LoginPage from './pages/LoginPage';
import StrategyDefinitionModule from './pages/StrategyDefinitionModule';
import RequesterMarketplace from './pages/RequesterMarketplace';

import ControlCenterModule from './pages/ControlCenterModule';
import CategoryMasterModule from './pages/CategoryMasterModule';
import TransactionMasterModule from './pages/TransactionMasterModule';
import VendorMasterModule from './pages/VendorMasterModule';

// ─── Role-Based Permission Map ───────────────────────────────────────────────
// Defines which tabs each roleType may access, and their landing page.
const ROLE_PERMISSIONS = {
  CPO: {
    allowed: ['dashboard', 'categories', 'transactions', 'vendors', 'strategy_definition'],
    defaultTab: 'dashboard',
  },
  CATEGORY_MANAGER: {
    allowed: ['categories', 'transactions', 'vendors', 'strategy_definition'],
    defaultTab: 'categories',
  },
  SOURCING_ANALYST: {
    allowed: ['transactions', 'categories', 'strategy_definition'],
    defaultTab: 'transactions',
  },
  REQUESTER: {
    allowed: ['transactions'],
    defaultTab: 'transactions',
  },
};

const AppContent = () => {
  const { activeTab, setActiveTab, currentUser } = useApp();

  const roleType = currentUser?.roleType || 'REQUESTER';
  const permissions = ROLE_PERMISSIONS[roleType] || ROLE_PERMISSIONS['REQUESTER'];

  // If the active tab isn't allowed for this role, redirect to default
  const resolvedTab = permissions.allowed.includes(activeTab)
    ? activeTab
    : permissions.defaultTab;

  // Ensure the stored activeTab is updated if it was out of bounds
  React.useEffect(() => {
    if (!permissions.allowed.includes(activeTab)) {
      setActiveTab(permissions.defaultTab);
    }
  }, [currentUser]);

  const renderContent = () => {
    switch (resolvedTab) {
      case 'dashboard':    return <ControlCenterModule />;
      case 'categories':   return <CategoryMasterModule />;
      case 'transactions': return <TransactionMasterModule />;
      case 'vendors':      return <VendorMasterModule />;
      case 'strategy_definition': return <CategoryMasterModule />; // Fallback wrapper
      default:             return <TransactionMasterModule />;
    }
  };

  return (
    <MainLayout>
      {renderContent()}
    </MainLayout>
  );
};

const App = () => {
  const [loggedIn, setLoggedIn] = useState(
    () => localStorage.getItem('procura_logged_in') === 'true'
  );

  const handleLogin = (user) => {
    setLoggedIn(true);
  };

  if (!loggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <LanguageProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </LanguageProvider>
  );
};

export default App;
