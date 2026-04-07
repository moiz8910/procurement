import React from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { 
  TrendingUp, 
  Globe, 
  Zap, 
  Target, 
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Search
} from 'lucide-react';

const CategoryIntelligence = () => {
  const { categories, filters, openCopilotWithPrompt } = useApp();
  const [localSearch, setLocalSearch] = React.useState('');

  const filteredCategories = categories.filter(c => {
    const globalQ = (filters?.searchQuery || '').toLowerCase();
    const localQ = localSearch.toLowerCase();
    
    const matchesGlobal = !globalQ || (c.name && c.name.toLowerCase().includes(globalQ));
    const matchesLocal = !localQ || (c.name && c.name.toLowerCase().includes(localQ));
    
    return matchesGlobal && matchesLocal;
  });

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-teal-600 font-bold text-[10px] uppercase tracking-widest mb-1">
            <Globe className="h-3 w-3" />
            Market Intelligence Engine
          </div>
          <h1 className="text-3xl font-black tracking-tight text-emerald-900">Category Strategy</h1>
          <p className="text-sm text-slate-500 font-medium">Global commodity benchmarks and strategic sourcing outlooks.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-64 transition-all focus-within:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search Categories..."
              className="h-10 w-full pl-9 pr-4 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-100 hover:border-slate-300 transition-all bg-white shadow-sm"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
            />
          </div>
          <Button 
            className="h-10 bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20"
            onClick={() => openCopilotWithPrompt("Generate a comprehensive sourcing strategy for External Alumina, showcasing market trends, supplier risk, and optimization levers based on our internal playbooks.")}
          >
            Generate Strategy
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-slate-100/50 p-1 border border-slate-200/60 mb-6">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 font-bold text-xs uppercase tracking-tight">Overview</TabsTrigger>
          <TabsTrigger value="benchmarks" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 font-bold text-xs uppercase tracking-tight">Benchmarks</TabsTrigger>
          <TabsTrigger value="risk" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 font-bold text-xs uppercase tracking-tight">Risk Matrix</TabsTrigger>
          <TabsTrigger value="vendors" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 font-bold text-xs uppercase tracking-tight">Scouted Vendors</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredCategories.map((cat) => (
              <Card key={cat.id} className="border-none shadow-xl shadow-slate-200/40 bg-white group hover:-translate-y-1 transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="bg-teal-50 text-teal-600 font-bold border-none uppercase text-[9px] tracking-tight">
                      {cat.id % 2 === 0 ? 'Direct Material' : 'Indirect Services'}
                    </Badge>
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  </div>
                  <CardTitle className="text-xl font-black text-emerald-900">{cat.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm py-2 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">YTD Spend</span>
                    <span className="font-black text-emerald-900">$2.4M</span>
                  </div>
                  <div className="flex items-center justify-between text-sm py-2 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Target Savings</span>
                    <span className="font-black text-emerald-600">12.5%</span>
                  </div>
                  <Button variant="ghost" className="w-full justify-between group-hover:bg-teal-50 transition-colors mt-2 font-bold text-xs text-teal-600">
                    View Strategy Docs
                    <ArrowRight className="h-4 w-4 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="benchmarks">
          <Card className="border-none shadow-2xl shadow-slate-200/50">
            <CardHeader>
              <CardTitle>Commodity Benchmarks</CardTitle>
              <CardDescription>Live pricing from LME and specialty indices.</CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <BarChart3 className="h-8 w-8 opacity-20" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Interactive Benchmark Visualization</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CategoryIntelligence;
