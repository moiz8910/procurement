import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { getKpis } from '../api';
import { 
  TrendingUp, 
  AlertTriangle, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2,
  PieChart,
  BarChart4,
  LayoutDashboard,
  DollarSign,
  Package,
  Activity,
  Award,
  ShieldAlert,
  CalendarDays
} from 'lucide-react';
import Filters from '../components/Filters';

const Dashboard = () => {
  const { prs, vendors, currentUser } = useApp();
  
  const [kpis, setKpis] = useState(null);
  const [kpiDateRange, setKpiDateRange] = useState('30d');
  
  useEffect(() => {
    getKpis({ time_range: kpiDateRange }).then(res => {
      setKpis(res.data);
    }).catch(err => console.error("Error fetching KPIs", err));
  }, [kpiDateRange]);

  return (
    <div className="p-6 space-y-6 animate-in slide-in-from-bottom-4 duration-700">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-widest mb-1">
            <LayoutDashboard className="h-3 w-3" />
            Enterprise Control Center
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 font-display">
            Welcome back, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-slate-500 font-medium">Here's what's happening across your procurement landscape today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-10 px-4 font-bold border-slate-200">Export Report</Button>
          <Button className="h-10 px-6 font-bold bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20">Analyze Spend</Button>
        </div>
      </div>

      {/* KPI Section with Dedicated Filter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-slate-800 font-bold px-2">
            <Activity className="h-5 w-5 text-indigo-500" />
            Executive KPIs
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            <select 
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-lg px-3 py-1.5 outline-none cursor-pointer"
              value={kpiDateRange}
              onChange={(e) => setKpiDateRange(e.target.value)}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="YTD">Year to Date</option>
            </select>
          </div>
        </div>

        {/* 8 Metric KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                YTD Spend <DollarSign className="h-4 w-4 text-emerald-500"/>
              </span>
              <div className="text-2xl font-black text-slate-900">${(kpis?.ytd_spend || 0).toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                Maverick Spend <AlertTriangle className="h-4 w-4 text-rose-500"/>
              </span>
              <div className="text-2xl font-black text-rose-600">${(kpis?.maverick_spend || 0).toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                MTD Spend <CalendarDays className="h-4 w-4 text-indigo-500"/>
              </span>
              <div className="text-2xl font-black text-slate-900">${(kpis?.mtd_spend || 0).toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                YTD Savings <TrendingUp className="h-4 w-4 text-emerald-500"/>
              </span>
              <div className="text-2xl font-black text-emerald-600">${(kpis?.ytd_savings || 0).toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                Total SKUs <Package className="h-4 w-4 text-blue-500"/>
              </span>
              <div className="text-2xl font-black text-slate-900">{(kpis?.total_skus || 0).toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                Supplier Conc. <PieChart className="h-4 w-4 text-purple-500"/>
              </span>
              <div className="text-2xl font-black text-slate-900">{kpis?.supplier_concentration || 0}%</div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-shadow bg-emerald-50 border-emerald-100">
            <CardContent className="p-5 flex flex-col gap-1">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center justify-between">
                Avg ESG Score <Award className="h-4 w-4 text-emerald-600"/>
              </span>
              <div className="text-2xl font-black text-emerald-800">{kpis?.avg_esg_score || 0}<span className="text-sm">/100</span></div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-shadow bg-rose-50 border-rose-100">
            <CardContent className="p-5 flex flex-col gap-1">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center justify-between">
                Avg Risk Score <ShieldAlert className="h-4 w-4 text-rose-600"/>
              </span>
              <div className="text-2xl font-black text-rose-800">{kpis?.avg_risk_score || 0}<span className="text-sm">/100</span></div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Premium Filtering Context */}
      <Filters />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Primary Insight: Spend Intelligence */}
        <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600" />
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-black">Spend Analytics</CardTitle>
              <CardDescription>Real-time spend distribution vs budget allocation</CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="group-hover:bg-slate-100 rounded-full transition-all">
              <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600" />
            </Button>
          </CardHeader>
          <CardContent>
            {/* Visual Placeholder for a Chart */}
            <div className="h-64 w-full bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center group-hover:border-indigo-200 transition-colors">
              <div className="flex flex-col items-center gap-3 text-slate-300">
                <BarChart4 className="h-12 w-12 opacity-20" />
                <span className="text-xs font-bold uppercase tracking-widest opacity-50">Interactive Spend Chart</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tactical: Action Items */}
        <Card className="border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/50">
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500 font-black" />
              Critical Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 cursor-pointer group">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-sm">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-sm font-bold text-slate-800">PR_{1024+i} Approval Pending</div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Due in 4 hours • High Priority</p>
                </div>
              </div>
            ))}
            <Button variant="ghost" className="w-full text-indigo-600 font-bold text-xs mt-2 hover:bg-indigo-50">View All Tasks</Button>
          </CardContent>
        </Card>

        {/* Global Performance Matrix */}
        <Card className="border-none shadow-xl shadow-slate-200/50 bg-indigo-900 text-white overflow-hidden relative">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
          <CardHeader>
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-300" />
              P•I•P Intelligence Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black mb-2">92<span className="text-xl text-indigo-300">/100</span></div>
            <p className="text-xs text-indigo-100 leading-relaxed mb-6 font-medium">
              Your procurement efficiency is in the <span className="text-indigo-300 font-black">top 5%</span> of peer institutions. 
              Automation is handling 84% of your low-value tail spend.
            </p>
            <div className="h-2 w-full bg-indigo-950/50 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-400 shadow-lg shadow-indigo-400/50" style={{ width: '92%' }}></div>
            </div>
          </CardContent>
        </Card>

        {/* Market Trends Summary */}
        <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/50 bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-black">Market Opportunities</CardTitle>
              <Badge variant="outline" className="border-emerald-200 text-emerald-600 font-bold bg-emerald-50">3 New Alerts</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">LME Aluminum</span>
                <span className="text-[10px] font-black text-rose-500">+12.4%</span>
              </div>
              <div className="text-xl font-black text-slate-900">$2,450 /t</div>
              <p className="text-[10px] text-slate-400 font-medium">Opportunity: Review long-term contracts for spot hedging.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Caustic Soda</span>
                <span className="text-[10px] font-black text-emerald-500">-5.1%</span>
              </div>
              <div className="text-xl font-black text-slate-900">$380 /dmt</div>
              <p className="text-[10px] text-slate-400 font-medium">Opportunity: Negotiate volume rebates for FY25 forecast.</p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Dashboard;
