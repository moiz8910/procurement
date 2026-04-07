import React from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from './Topbar';
import KPIBar from '../components/KPIBar';
import Copilot from '../components/Copilot';
import { useApp } from '../context/AppContext';

const MainLayout = ({ children }) => {
  const { activeTab } = useApp();
  
  return (
    <div className="flex h-screen w-screen bg-slate-50/50 overflow-hidden font-sans text-emerald-900">
      {/* Sidebar - Fixed Left */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 bg-white ml-64">
        <Topbar />

        {/* Scrollable Workspace */}
        <main className="flex-1 overflow-y-auto relative custom-scrollbar">
          {/* Global KPI Strip - Sticky below Topbar */}
          <div className="sticky top-0 z-20 bg-white/60 backdrop-blur-lg border-b border-slate-100/60">
            {['transactions', 'vendors'].includes(activeTab) && <KPIBar />}
          </div>

          {/* Page Content */}
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Always-On Floating Copilot */}
      <Copilot />
    </div>
  );
};

export default MainLayout;

