import React from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  Flag,
  BarChart4,
  ArrowUpRight,
  Filter
} from 'lucide-react';

const SupplierGovernance = () => {
  const { vendors, filters } = useApp();

  const filteredVendors = vendors.filter(v => {
    if (!filters?.searchQuery) return true;
    const q = filters.searchQuery.toLowerCase();
    return v.name && v.name.toLowerCase().includes(q);
  });

  const getRiskBadge = (score) => {
    if (score > 80) return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold uppercase text-[9px]">Low Risk</Badge>;
    if (score > 60) return <Badge className="bg-amber-50 text-amber-600 border-amber-100 font-bold uppercase text-[9px]">Moderate</Badge>;
    return <Badge className="bg-rose-50 text-rose-600 border-rose-100 font-bold uppercase text-[9px]">High Risk</Badge>;
  };

  return (
    <div className="p-6 space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-teal-600 font-bold text-[10px] uppercase tracking-widest mb-1">
            <ShieldCheck className="h-3 w-3" />
            Supplier Risk & Governance
          </div>
          <h1 className="text-3xl font-black tracking-tight text-emerald-900">Vendor Ecosystem</h1>
          <p className="text-sm text-slate-500 font-medium">Monitor compliance, ESG scores, and performance health.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-10 border-slate-200">
            <Filter className="h-4 w-4 mr-2" /> Compliance Filter
          </Button>
          <Button className="h-10 bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20">
            Assess New Vendor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-none bg-slate-50/50">
          <CardContent className="pt-6">
            <div className="text-xs font-bold text-slate-400 uppercase mb-1">Total Vendors</div>
            <div className="text-2xl font-black">{filteredVendors.length}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-none bg-rose-50/50">
          <CardContent className="pt-6">
            <div className="text-xs font-bold text-rose-600/60 uppercase mb-1">High Risk</div>
            <div className="text-2xl font-black text-rose-700">3</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-none bg-emerald-50/50">
          <CardContent className="pt-6">
            <div className="text-xs font-bold text-emerald-600/60 uppercase mb-1">Compliant</div>
            <div className="text-2xl font-black text-emerald-700">94%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="risk" className="w-full">
        <TabsList className="bg-slate-100/50 p-1 border border-slate-200/60 mb-6">
          <TabsTrigger value="risk" className="px-6 font-bold text-xs uppercase">Risk Heatmap</TabsTrigger>
          <TabsTrigger value="performance" className="px-6 font-bold text-xs uppercase">Performance</TabsTrigger>
          <TabsTrigger value="esg" className="px-6 font-bold text-xs uppercase">ESG Scorecard</TabsTrigger>
        </TabsList>

        <TabsContent value="risk">
          <Card className="border-slate-200/60 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left p-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest pl-6">Supplier</th>
                    <th className="text-left p-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Category</th>
                    <th className="text-left p-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Risk Score</th>
                    <th className="text-left p-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Status</th>
                    <th className="text-right p-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest pr-6">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVendors.slice(0, 10).map((vendor) => (
                    <tr key={vendor.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6 font-black text-emerald-900">{vendor.name}</td>
                      <td className="p-4 text-slate-600 font-medium">Bauxite Mining</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${vendor.id % 3 === 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                              style={{ width: `${85 - (vendor.id * 2)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">{85 - (vendor.id * 2)}%</span>
                        </div>
                      </td>
                      <td className="p-4">{getRiskBadge(85 - (vendor.id * 2))}</td>
                      <td className="p-4 text-right pr-6">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 group-hover:text-teal-600 transition-colors">
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupplierGovernance;
