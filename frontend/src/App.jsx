import React from 'react';
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

const AppContent = () => {
  const { activeTab, currentUser } = useApp();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'categories': return <CategoryModule />;
      case 'transactions': return <TransactionModule />;
      case 'vendors': return <VendorModule />;
      default: return currentUser?.roleType === 'CPO' ? <Dashboard /> : <CategoryModule />;
    }
  };

  return (
    <MainLayout>
      {renderContent()}
    </MainLayout>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
