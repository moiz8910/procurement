import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
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

// ─── Role-Based Permission Map ───────────────────────────────────────────────
// Defines which tabs each roleType may access, and their landing page.
const ROLE_PERMISSIONS = {
  CPO: {
    allowed: ['dashboard', 'categories', 'transactions', 'vendors'],
    defaultTab: 'dashboard',
  },
  CATEGORY_MANAGER: {
    allowed: ['categories', 'transactions', 'vendors'],
    defaultTab: 'categories',
  },
  SOURCING_ANALYST: {
    allowed: ['transactions', 'categories'],
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
      case 'dashboard':    return <Dashboard />;
      case 'categories':   return <CategoryModule />;
      case 'transactions': return <TransactionModule />;
      case 'vendors':      return <VendorModule />;
      default:             return <TransactionModule />;
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
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
