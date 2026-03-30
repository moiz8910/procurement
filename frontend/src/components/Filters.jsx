import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Filter, Calendar, Tag, Users } from 'lucide-react';

const Filters = () => {
  const { categories, vendors, currentUser } = useApp();

  return (
    <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-xl border border-slate-100 shadow-sm mb-6">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">
        <Filter className="h-3 w-3" />
        Context
      </div>

      <div className="h-6 w-px bg-slate-100 mx-2 hidden md:block" />

      {/* Category Filter */}
      {currentUser.role !== 'SRM' && (
        <div className="flex items-center gap-2 min-w-[160px]">
          <Tag className="h-3.5 w-3.5 text-slate-400" />
          <Select>
            <SelectTrigger className="h-9 bg-slate-50 border-none focus:ring-1 focus:ring-indigo-200">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => (
                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Vendor Filter */}
      <div className="flex items-center gap-2 min-w-[160px]">
        <Users className="h-3.5 w-3.5 text-slate-400" />
        <Select>
          <SelectTrigger className="h-9 bg-slate-50 border-none focus:ring-1 focus:ring-indigo-200">
            <SelectValue placeholder="All Suppliers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Suppliers</SelectItem>
            {vendors.map(v => (
              <SelectItem key={v.id} value={v.id.toString()}>{v.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Time Range Filter */}
      <div className="flex items-center gap-2 min-w-[160px]">
        <Calendar className="h-3.5 w-3.5 text-slate-400" />
        <Select defaultValue="ytd">
          <SelectTrigger className="h-9 bg-slate-50 border-none focus:ring-1 focus:ring-indigo-200">
            <SelectValue placeholder="Time Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mtd">Month to Date</SelectItem>
            <SelectItem value="qtd">Quarter to Date</SelectItem>
            <SelectItem value="ytd">Year to Date</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="ml-auto hidden lg:flex items-center gap-2">
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 uppercase tracking-tighter">Live Sync Active</span>
      </div>
    </div>
  );
};

export default Filters;
