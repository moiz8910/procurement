import React from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Filter,
  Search
} from 'lucide-react';

const ProcurementExecution = () => {
  const { prs, filters } = useApp();

  const filteredPrs = prs.filter(pr => {
    if (!filters?.searchQuery) return true;
    const q = filters.searchQuery.toLowerCase();
    return (
      pr.id.toString().includes(q) ||
      (pr.status && pr.status.toLowerCase().includes(q)) ||
      (pr.current_owner && pr.current_owner.toLowerCase().includes(q)) ||
      (pr.amount && pr.amount.toString().includes(q))
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED': return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20">Approved</Badge>;
      case 'PO_CREATED': return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20">PO Created</Badge>;
      case 'REJECTED': return <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-rose-500/20">Rejected</Badge>;
      default: return <Badge variant="outline" className="text-slate-500 border-slate-200">Pending</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Procurement Execution</h1>
          <p className="text-sm text-slate-500">Track and manage the lifecycle of Purchase Requisitions to Purchase Orders.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Filter className="h-4 w-4" /> Filters
          </Button>
          <Button size="sm" className="h-9 bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/10 shadow-lg">
            Create PR
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none bg-indigo-50/50 shadow-none">
          <CardHeader className="pb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600/60">Total PRs</span>
            <CardTitle className="text-3xl font-black text-indigo-700">{filteredPrs.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-none bg-emerald-50/50 shadow-none">
          <CardHeader className="pb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/60">Approved</span>
            <CardTitle className="text-3xl font-black text-emerald-700">{filteredPrs.filter(p => p.status === 'APPROVED').length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60">
                  <th className="text-left p-4 font-semibold text-slate-600 first:pl-6">ID</th>
                  <th className="text-left p-4 font-semibold text-slate-600">Requester</th>
                  <th className="text-left p-4 font-semibold text-slate-600">Amount</th>
                  <th className="text-left p-4 font-semibold text-slate-600">Status</th>
                  <th className="text-left p-4 font-semibold text-slate-600">Owner</th>
                  <th className="text-right p-4 font-semibold text-slate-600 last:pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {filteredPrs.slice(0, 10).map((pr) => (
                  <tr key={pr.id} className="group hover:bg-indigo-50/30 transition-colors">
                    <td className="p-4 font-bold text-slate-900 first:pl-6">PR_{pr.id.toString().padStart(5, '0')}</td>
                    <td className="p-4 text-slate-600 font-medium">User_{pr.requester_id}</td>
                    <td className="p-4 font-bold text-slate-900">${pr.amount?.toLocaleString()}</td>
                    <td className="p-4">{getStatusBadge(pr.status)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">
                          {pr.current_owner?.[0]}
                        </div>
                        <span className="text-xs font-semibold text-slate-600">{pr.current_owner}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right last:pr-6">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-100/50 transition-all">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcurementExecution;
