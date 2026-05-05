import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getPrList, getPrGantt } from '../api';
import {
  Search, Star, X, Plus, Minus, Package, CheckCircle,
  Clock, Truck, Filter, FileText, ArrowRight, ChevronRight,
  Layers, Cpu, ShieldCheck, Building2, Wrench, Archive,
  Inbox, CircleDot, TrendingUp, Sparkles, SendHorizontal,
  LayoutGrid, AlignJustify, SlidersHorizontal, RotateCcw,
  Tag, BadgeCheck, AlertCircle, Heart, Scale, Square, CheckSquare, Info
} from 'lucide-react';

// ─── Category Config ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all',         label: 'All Items',        icon: Layers,       hue: 'var(--primary)', bg: '#f8fafc', text: 'var(--primary)' },
  { id: 'it',          label: 'IT & Electronics',  icon: Cpu,          hue: 'var(--primary)', bg: '#f8fafc', text: 'var(--primary)' },
  { id: 'office',      label: 'Office Supplies',   icon: Archive,      hue: 'var(--primary)', bg: '#f8fafc', text: 'var(--primary)' },
  { id: 'safety',      label: 'Safety & PPE',      icon: ShieldCheck,  hue: 'var(--primary)', bg: '#f8fafc', text: 'var(--primary)' },
  { id: 'facilities',  label: 'Facilities',        icon: Building2,    hue: 'var(--primary)', bg: '#f8fafc', text: 'var(--primary)' },
  { id: 'tools',       label: 'Tools & Equipment', icon: Wrench,       hue: 'var(--primary)', bg: '#f8fafc', text: 'var(--primary)' },
  { id: 'consumables', label: 'Consumables',       icon: Package,      hue: 'var(--primary)', bg: '#f8fafc', text: 'var(--primary)' },
];

// ─── Catalog Data ─────────────────────────────────────────────────────────────
const CATALOG = [
  {
    id: 'P001', sku: 'IT-LAPTOP-001', category: 'it',
    name: 'Dell Latitude 5540 Business Laptop',
    vendor: 'Tech Solutions Pvt Ltd', vendorVerified: true,
    price: 89500, originalPrice: 102000, historicalPrice: 91200,
    benchmarks: {
      ofbusiness: 88500,
      jswone: 92000,
      indiamart: 86900,
      amazon: 94000
    },
    unit: 'unit', minQty: 1, maxQty: 10, stock: 12,
    leadDays: '5–7 days',
    rating: 4.6, reviews: 238,
    tag: 'PREFERRED', tagColor: '#051c2c',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=400',
    keySpec: '16GB RAM · 512GB SSD · Intel i5',
    description: '14" FHD IPS display, Intel Core i5-1335U, 16GB RAM, 512GB NVMe SSD, Windows 11 Pro.',
    specs: ['14" FHD IPS', 'Intel i5-1335U', '16GB DDR4', '512GB NVMe', 'Win 11 Pro', '3-Yr Support'],
    labels: ['IT Approved', 'Business Grade'],
  },
  {
    id: 'P002', sku: 'OFF-CHAIR-002', category: 'office',
    name: 'Herman Miller Aeron Ergonomic Chair',
    vendor: 'Office Essentials Corp', vendorVerified: true,
    price: 145000, originalPrice: 165000, historicalPrice: 142000,
    benchmarks: {
      ofbusiness: 148000,
      jswone: 152000,
      indiamart: 139500,
      amazon: 146000
    },
    unit: 'unit', minQty: 1, maxQty: 5, stock: 5,
    leadDays: '10–14 days',
    rating: 4.9, reviews: 512,
    tag: 'TOP RATED', tagColor: '#051c2c',
    image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=400',
    keySpec: 'Size B · PostureFit SL · 12-yr Warranty',
    description: 'Size B, Graphite frame with PostureFit SL lumbar support. Fully adjustable arms and tilt tension.',
    specs: ['Size B (Medium)', 'PostureFit SL', 'Graphite Frame', 'Fully Adjustable', '12-Yr Warranty', 'HR Approved'],
    labels: ['Ergonomics', 'HR Approved'],
  },
  {
    id: 'P003', sku: 'SAF-HELM-003', category: 'safety',
    name: 'MSA V-Gard Hard Hat · ANSI Type I',
    vendor: 'SafeGuard Industrial', vendorVerified: true,
    price: 1850, originalPrice: 2200, historicalPrice: 1950,
    benchmarks: {
      ofbusiness: 1900,
      jswone: 2100,
      indiamart: 1750,
      amazon: 2250
    },
    unit: 'unit', minQty: 10, maxQty: 500, stock: 200,
    leadDays: '2–3 days',
    rating: 4.7, reviews: 1024,
    tag: 'MANDATORY', tagColor: '#0062ff',
    image: 'https://images.unsplash.com/photo-1542617719-7561fb55bed8?auto=format&fit=crop&q=80&w=400',
    keySpec: 'ANSI Z89.1-2014 · Class E · UV Stabilized',
    description: 'ANSI/ISEA Z89.1-2014 Type I, Class E certified. UV-stabilized polyethylene shell. Meets IS: 2925 standards.',
    specs: ['ANSI Z89.1-2014', 'Type I, Class E', 'UV Stabilized', 'IS:2925 Certified', 'Full Brim', '4-Point Strap'],
    labels: ['Safety Critical', 'IS Certified'],
  },
  {
    id: 'P004', sku: 'OFF-PAPER-004', category: 'consumables',
    name: 'JK Copier A4 Paper 75 GSM',
    vendor: 'Stationery World Ltd', vendorVerified: false,
    price: 485, originalPrice: 520, historicalPrice: 470,
    benchmarks: {
      ofbusiness: 495,
      jswone: 510,
      indiamart: 465,
      amazon: 540
    },
    unit: 'ream (500 sheets)', minQty: 5, maxQty: 200, stock: 5000,
    leadDays: '1–2 days',
    rating: 4.4, reviews: 3841,
    tag: 'BEST VALUE', tagColor: '#00bea0',
    image: 'https://images.unsplash.com/photo-1588636400305-649df18c3562?auto=format&fit=crop&q=80&w=400',
    keySpec: 'A4 · 75 GSM · 104% Brightness',
    description: 'A4 size, 75 GSM, 500 sheets per ream. Optical brightness 104%.',
    specs: ['A4 Size', '75 GSM', '500 Sheets', 'Brightness 104%', 'Acid Free', 'All Printers'],
    labels: ['High Volume', 'Acid Free'],
  },
  {
    id: 'P005', sku: 'FAC-DESK-005', category: 'facilities',
    name: 'Godrej Interio Workstation Desk 1.2M',
    vendor: 'FurnCorp Solutions', vendorVerified: true,
    price: 18500, originalPrice: 22000,
    unit: 'unit', minQty: 1, maxQty: 20, stock: 8,
    leadDays: '15–20 days',
    rating: 4.3, reviews: 189,
    tag: null, tagColor: null,
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=400',
    keySpec: '1200×600mm · Cable Mgmt · Lockable Pedestal',
    description: '1200mm × 600mm workstation with integrated cable management channel and lockable drawer pedestal.',
    specs: ['1200×600mm', 'Cable Management', 'Lockable Pedestal', 'Melamine Finish', 'Steel Frame', '5-Yr Warranty'],
    labels: ['Facilities', 'Standard Issue'],
  },
  {
    id: 'P006', sku: 'TOOL-WRNCH-006', category: 'tools',
    name: 'Taparia Combination Spanner Set (12 pcs)',
    vendor: 'Industrial Tools Hub', vendorVerified: true,
    price: 3200, originalPrice: 3800,
    unit: 'set', minQty: 1, maxQty: 50, stock: 45,
    leadDays: '3–5 days',
    rating: 4.5, reviews: 672,
    tag: null, tagColor: null,
    image: 'https://images.unsplash.com/photo-1493015949667-fd7bfeaaae9f?auto=format&fit=crop&q=80&w=400',
    keySpec: '8–32mm · Drop-Forged · DIN 3113',
    description: '12-piece combination spanner set (8mm to 32mm). Drop-forged carbon steel with chrome vanadium finish.',
    specs: ['12-Piece Set', '8–32mm Range', 'Drop-Forged', 'Chrome Vanadium', 'DIN 3113', 'Carrying Roll'],
    labels: ['Maintenance', 'DIN Standard'],
  },
  {
    id: 'P007', sku: 'IT-MOUSE-007', category: 'it',
    name: 'Logitech MX Master 3S Wireless Mouse',
    vendor: 'Tech Solutions Pvt Ltd', vendorVerified: true,
    price: 9500, originalPrice: 11000, historicalPrice: 9200,
    benchmarks: {
      ofbusiness: 9350,
      jswone: 9600,
      indiamart: 9100,
      amazon: 9800
    },
    unit: 'unit', minQty: 1, maxQty: 25, stock: 35,
    leadDays: '2–4 days',
    rating: 4.8, reviews: 4521,
    tag: 'BEST SELLER', tagColor: '#051c2c',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=400',
    keySpec: '8000 DPI · USB-C · 70-day battery',
    description: '8000 DPI sensor, USB-C rechargeable, Bluetooth & 2.4GHz. 70-day battery life.',
    specs: ['8000 DPI', 'USB-C Rechg.', 'BT + 2.4GHz', '70-Day Battery', 'Multi-Device', 'Logi Options+'],
    labels: ['IT Approved', 'Rechargeable'],
  },
  {
    id: 'P008', sku: 'SAF-VEST-008', category: 'safety',
    name: 'Hi-Vis Reflective Safety Vest · Class 2',
    vendor: 'SafeGuard Industrial', vendorVerified: true,
    price: 650, originalPrice: 800, historicalPrice: 620,
    benchmarks: {
      ofbusiness: 670,
      jswone: 685,
      indiamart: 610,
      amazon: 720
    },
    unit: 'unit', minQty: 10, maxQty: 1000, stock: 800,
    leadDays: '1–2 days',
    rating: 4.3, reviews: 2103,
    tag: 'MANDATORY', tagColor: '#0062ff',
    image: 'https://images.unsplash.com/photo-1621379434310-a29d44effdc3?auto=format&fit=crop&q=80&w=400',
    keySpec: 'EN ISO 20471 Class 2 · Sizes S–3XL',
    description: 'Class 2 EN ISO 20471 certified. Orange polyester mesh fabric, 3 reflective strips, velcro closure.',
    specs: ['EN ISO 20471', 'Class 2', '3 Reflective Strips', 'Velcro Closure', 'Sizes S–3XL', 'Machine Wash'],
    labels: ['Safety Critical', 'EN ISO 20471'],
  },
  {
    id: 'P009', sku: 'CONS-BRICK-009', category: 'consumables',
    name: 'High-Temp Alumina Refractory Bricks',
    vendor: 'Global Refractories Ltd', vendorVerified: true,
    price: 350, originalPrice: 420, historicalPrice: 380,
    benchmarks: {
      ofbusiness: 345,
      jswone: 360,
      indiamart: 330,
      amazon: 390
    },
    unit: 'brick', minQty: 100, maxQty: 5000, stock: 10000,
    leadDays: '5–8 days',
    rating: 4.8, reviews: 342,
    tag: 'CRITICAL', tagColor: '#1e293b',
    image: 'https://images.unsplash.com/photo-1502421377852-c0cb4a5fac5e?auto=format&fit=crop&q=80&w=400',
    keySpec: '80% Alumina · Max 1800°C · Slag Resistant',
    description: 'Premium high-alumina refractory bricks designed for extreme temperatures in aluminium smelting furnaces.',
    specs: ['80% Al2O3', 'Temp Limit: 1800°C', 'High Slag Resistance', 'Low Porosity', 'Standard Size', 'Pallet Packaging'],
    labels: ['Smelter Approved', 'High Temp'],
  },
  {
    id: 'P010', sku: 'SAF-GLOV-010', category: 'safety',
    name: 'Heat-Resistant Smelting Safety Gloves',
    vendor: 'SafeGuard Industrial', vendorVerified: true,
    price: 1250, originalPrice: 1500, historicalPrice: 1320,
    benchmarks: {
      ofbusiness: 1220,
      jswone: 1300,
      indiamart: 1150,
      amazon: 1400
    },
    unit: 'pair', minQty: 5, maxQty: 200, stock: 450,
    leadDays: '1–2 days',
    rating: 4.9, reviews: 890,
    tag: 'MANDATORY', tagColor: '#ef4444',
    image: 'https://images.unsplash.com/photo-1584677685655-46aa3205739a?auto=format&fit=crop&q=80&w=400',
    keySpec: 'Kevlar Blend · 500°C Contact Temp',
    description: 'Heavy industrial heat-resistant gloves made from a Kevlar/Nomex blend. Ideal for handling hot metals.',
    specs: ['Kevlar/Nomex Blend', 'Contact Temp 500°C', 'Cut Resistant', 'Extended Cuff', 'EN 407 Certified', 'Flame Retardant'],
    labels: ['Safety Critical', 'EN 407'],
  },
  {
    id: 'P011', sku: 'TOOL-CRUC-011', category: 'tools',
    name: 'Heavy-Duty Graphite Crucible 500kg',
    vendor: 'Industrial Tools Hub', vendorVerified: true,
    price: 45000, originalPrice: 52000, historicalPrice: 47500,
    benchmarks: {
      ofbusiness: 44000,
      jswone: 46500,
      indiamart: 42000,
      amazon: 49000
    },
    unit: 'unit', minQty: 1, maxQty: 10, stock: 3,
    leadDays: '15–20 days',
    rating: 4.7, reviews: 54,
    tag: 'SPECIAL ITEM', tagColor: '#8b5cf6',
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=400',
    keySpec: '500kg Capacity · Silicon Carbide Graphite',
    description: 'High-capacity graphite crucible for aluminium melting. Excellent thermal conductivity and shock resistance.',
    specs: ['500kg Al Capacity', 'Silicon Carbide', 'Thermal Shock Resist', 'Long Lifespan', 'Non-wetting', 'Gas/Oil Furnace'],
    labels: ['Smelter Critical', 'Heavy Duty'],
  },
  {
    id: 'P012', sku: 'TOOL-DIE-012', category: 'tools',
    name: 'Aluminium Extrusion Die Set',
    vendor: 'Precision Machining Corp', vendorVerified: true,
    price: 125000, originalPrice: 135000, historicalPrice: 118000,
    benchmarks: {
      ofbusiness: 128000,
      jswone: 132000,
      indiamart: 121000,
      amazon: 140000
    },
    unit: 'set', minQty: 1, maxQty: 5, stock: 2,
    leadDays: '25–30 days',
    rating: 4.6, reviews: 29,
    tag: 'CUSTOM', tagColor: '#3b82f6',
    image: 'https://images.unsplash.com/photo-1535406200216-f365d7e5dce2?auto=format&fit=crop&q=80&w=400',
    keySpec: 'H13 Tool Steel · Nitride Coated',
    description: 'Custom-profile extrusion die set crafted from H13 tool steel with advanced nitride coating for extended wear resistance.',
    specs: ['H13 Tool Steel', 'Nitride Coated', 'High Precision', 'Custom Profile', 'High Wear Resist.', 'ISO 9001'],
    labels: ['Extrusion', 'Precision'],
  },
  {
    id: 'P013', sku: 'SAF-BOOT-013', category: 'safety',
    name: 'Foundry Grade Safety Boots',
    vendor: 'SafeGuard Industrial', vendorVerified: true,
    price: 4500, originalPrice: 5500, historicalPrice: 4200,
    benchmarks: {
      ofbusiness: 4400,
      jswone: 4600,
      indiamart: 4100,
      amazon: 4800
    },
    unit: 'pair', minQty: 5, maxQty: 150, stock: 120,
    leadDays: '3–5 days',
    rating: 4.8, reviews: 1432,
    tag: 'PREFERRED', tagColor: '#10b981',
    image: 'https://images.unsplash.com/photo-1589139265261-26c71ca53b92?auto=format&fit=crop&q=80&w=400',
    keySpec: 'Heat Resistant Outsole · Steel Toe · Metatarsal',
    description: 'Industrial safety boots tough enough for foundry and smelter environments. Features metatarsal guard and 300°C rated outsole.',
    specs: ['300°C Heat Outsole', 'Steel Toe Cap', 'Metatarsal Guard', 'Kevlar Stitching', 'Slip Resistant', 'EN ISO 20345'],
    labels: ['Safety Critical', 'Smelter Grade'],
  }
];

// ─── Utility Helpers ──────────────────────────────────────────────────────────
const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
const disc = (old, cur) => Math.round(((old - cur) / old) * 100);
const getCat = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[0];

const RatingDots = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <div 
        key={s} 
        className={`w-1.5 h-1.5 ${s <= Math.round(rating) ? 'bg-[#051c2c]' : 'bg-neutral-200'}`}
      />
    ))}
  </div>
);

// ─── Benchmarking Platforms ──────────────────────────────────────────────────
const BENCHMARK_PLATFORMS = [
  { id: 'ofbusiness', name: 'OfBusiness',   icon: TrendingUp },
  { id: 'jswone',     name: 'JSW One',       icon: ShieldCheck },
  { id: 'indiamart',  name: 'IndiaMART',     icon: LayoutGrid },
  { id: 'amazon',     name: 'Amazon Business', icon: Package }
];

const BenchmarkingPanel = ({ item }) => {
  const [selected, setSelected] = useState(['ofbusiness', 'jswone', 'indiamart', 'amazon']);
  
  const toggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const getStatus = (price) => {
    const diff = ((item.price - price) / price) * 100;
    if (diff < -5) return { label: 'Optimal', col: 'text-sky-500' };
    if (diff < 5) return { label: 'Market Align', col: 'text-sky-500' };
    return { label: 'Above Market', col: 'text-red-500' };
  };

  return (
    <div className="mt-10 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black text-blue-900 uppercase tracking-[0.2em] flex items-center gap-3">
           <span className="w-8 h-px bg-blue-900" />
           Price Benchmarking Intelligence
        </h3>
        <div className="flex items-center gap-2">
          {BENCHMARK_PLATFORMS.map(p => (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              className={`px-2 py-1 text-[8px] font-black uppercase tracking-widest border transition-all ${
                selected.includes(p.id) ? 'bg-[#051c2c] text-white border-[#051c2c]' : 'bg-transparent text-neutral-400 border-neutral-100'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Baseline Source */}
        <div className="p-5 border border-neutral-100 bg-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-5">
            <Tag size={40} />
          </div>
          <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">Baseline Source</p>
          <p className="text-xs font-black text-[#051c2c] uppercase">Latest Vendor Catalogue</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#051c2c]">{fmt(item.price)}</span>
            <span className="text-[10px] font-bold text-neutral-400">/{item.unit}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-sky-50 flex items-center justify-between">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Rate</span>
            <div className="flex items-center gap-1 text-primary">
              <CheckCircle size={10} />
              <span className="text-[10px] font-black">LATEST</span>
            </div>
          </div>
        </div>

        {/* Historical LPP */}
        <div className="p-5 border border-neutral-100 bg-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-5">
            <RotateCcw size={40} />
          </div>
          <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">Historical Benchmark</p>
          <p className="text-xs font-black text-primary uppercase">Last Purchase Price (LPP)</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-black text-primary">{fmt(item.historicalPrice)}</span>
            <span className="text-[10px] font-bold text-neutral-400">/2023 FY</span>
          </div>
          {item.price > item.historicalPrice ? (
            <div className="mt-4 pt-4 border-t border-neutral-50 flex items-center justify-between">
              <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Inflationary Var.</span>
              <span className="text-[10px] font-black text-amber-500">+{((item.price - item.historicalPrice) / item.historicalPrice * 100).toFixed(1)}%</span>
            </div>
          ) : (
             <div className="mt-4 pt-4 border-t border-sky-50 flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cost Savings</span>
                <span className="text-[10px] font-black text-sky-500">{((item.historicalPrice - item.price) / item.historicalPrice * 100).toFixed(1)}% Saving</span>
              </div>
          )}
        </div>

        {/* Market Index */}
        <div className="p-5 border border-sky-100 bg-sky-50/20">
          <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">External Market Index</p>
          <div className="space-y-3 mt-4">
            {BENCHMARK_PLATFORMS.filter(p => selected.includes(p.id)).map(p => {
              const price = item.benchmarks?.[p.id] || (item.price * (0.95 + Math.random() * 0.1));
              const status = getStatus(price);
              return (
                <div key={p.id} className="flex items-center justify-between group/line">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black text-[#051c2c] uppercase tracking-tight">{p.name}</p>
                    <div className="w-1 h-1 rounded-full bg-neutral-200 group-hover/line:bg-[#00bea0] transition-colors" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-[#051c2c]">{fmt(price)}</span>
                    <span className="text-[8px] font-black px-1.5 py-0.5 border" style={{ color: status.col, borderColor: status.col + '20', backgroundColor: status.col + '05' }}>
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Catalog Card ─────────────────────────────────────────────────────────────
const CatalogCard = ({ item, onSelect, inBasket, onQuickAdd, onToggleCompare, isCompared }) => {
  const cat = getCat(item.category);
  const d = disc(item.originalPrice, item.price);

  return (
    <div
      className="group bg-white border border-sky-100 hover:border-primary transition-all duration-300 cursor-pointer flex flex-col relative overflow-hidden"
      onClick={() => onSelect(item)}
    >
      {/* Analytics Badge */}
      <div className="absolute top-0 right-0 z-10">
        {item.tag && (
          <div
            className="px-3 py-1 text-[8px] font-black uppercase tracking-[0.15em] text-white"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {item.tag}
          </div>
        )}
      </div>

      {/* Image area - Minimalist */}
      <div className="relative h-48 flex items-center justify-center overflow-hidden bg-white border-b border-sky-50">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-90 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100 select-none text-transparent" />

        <button
          className="absolute bottom-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-none shadow-sm hover:bg-white transition-all z-10 flex items-center gap-1 border border-sky-100 opacity-0 group-hover:opacity-100"
          style={isCompared ? { opacity: 1, borderColor: 'var(--primary)', backgroundColor: 'var(--secondary)' } : {}}
          onClick={(e) => { e.stopPropagation(); onToggleCompare(item.id); }}
        >
          {isCompared ? <CheckSquare size={12} className="text-primary" /> : <Square size={12} className="text-slate-300" />}
          <span className={`text-[9px] font-black uppercase tracking-wider ${isCompared ? 'text-primary' : 'text-slate-400'}`}>Benchmark</span>
        </button>

        {d > 0 && (
          <div className="absolute top-3 left-3 text-[9px] font-black text-white bg-primary px-2 py-0.5">
            -{d}% ARCHIVED
          </div>
        )}
      </div>

      {/* Body - High Density */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Metadata Line */}
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-[9px] font-black uppercase tracking-widest text-primary truncate">
              {item.vendor}
            </span>
            {item.vendorVerified && <BadgeCheck size={11} className="text-primary flex-shrink-0" />}
            {item.benchmarks && (
              <div className="flex items-center gap-1 ml-1 px-1.5 py-0.5 bg-sky-50 text-primary border border-sky-100">
                <TrendingUp size={8} />
                <span className="text-[7px] font-black uppercase tracking-tighter">Benchmarked</span>
              </div>
            )}
          </div>
          <span className="text-[9px] font-bold text-neutral-300 font-mono flex-shrink-0">SKU-{item.sku.split('-').pop()}</span>

        {/* Product Identity */}
        <div className="space-y-1">
          <h3 className="text-sm font-black text-primary leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {item.name}
          </h3>
          <p className="text-[10px] text-neutral-500 font-medium leading-tight line-clamp-1">{item.keySpec}</p>
        </div>

        {/* Technical Ratings */}
        <div className="flex items-center gap-3 py-1 border-y border-sky-50">
          <div className="flex items-center gap-1">
            <RatingDots rating={item.rating} />
            <span className="text-[10px] font-black text-[#051c2c]">{item.rating}</span>
          </div>
          <div className="w-px h-2 bg-neutral-200" />
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">{item.reviews.toLocaleString()} Records</span>
        </div>

        {/* Tags - Minimalist */}
        <div className="flex flex-wrap gap-1.5">
          {item.labels.map(l => (
            <span
              key={l}
              className="text-[8px] font-black px-2 py-0.5 uppercase tracking-widest border border-sky-100 bg-sky-50 text-sky-600"
            >
              {l}
            </span>
          ))}
        </div>

        {/* Price & Execution */}
        <div className="mt-auto pt-4 flex items-end justify-between">
          <div>
            <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-0.5">Category Rate</div>
            <div className="text-xl font-black text-[#051c2c] tracking-tighter">{fmt(item.price)}</div>
          </div>
          <button
            className={`flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${
              inBasket
                ? 'bg-sky-50 text-primary border border-primary'
                : 'bg-primary text-white hover:bg-black'
            }`}
            onClick={(e) => { e.stopPropagation(); onQuickAdd(item); }}
          >
            {inBasket ? <><CheckCircle size={12} /> Staged</> : <><Plus size={12} /> Requisition</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── List Row - Analytical View ───────────────────────────────────────────────
const CatalogRow = ({ item, onSelect, inBasket, onQuickAdd, onToggleCompare, isCompared }) => {
  const cat = getCat(item.category);
  const d = disc(item.originalPrice, item.price);
  return (
    <div
      className="group bg-white border border-sky-100 hover:border-primary/20 hover:bg-sky-50/20 transition-all duration-300 cursor-pointer flex gap-0 overflow-hidden"
      onClick={() => onSelect(item)}
    >
      {/* Status Bar */}
      <div className="w-1 flex-shrink-0 bg-primary" />

      {/* Technical Thumbnail */}
      <div className="relative w-40 flex-shrink-0 flex items-center justify-center bg-white border-r border-sky-50">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity select-none text-transparent" />
        <button
          className="absolute bottom-2 left-2 p-1.5 bg-white shadow-sm border border-sky-100 hover:border-[#00bea0] transition-all z-10"
          style={isCompared ? { borderColor: '#00bea0', color: '#00bea0' } : {}}
          onClick={(e) => { e.stopPropagation(); onToggleCompare(item.id); }}
        >
          {isCompared ? <CheckSquare size={14} /> : <Square size={14} className="text-neutral-200" />}
        </button>
      </div>

      {/* Core Intelligence */}
      <div className="flex-1 p-6 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#00bea0]">{item.vendor}</span>
          {item.vendorVerified && <BadgeCheck size={12} className="text-[#00bea0]" />}
          {item.benchmarks && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-sky-50 text-primary border border-sky-100">
              <TrendingUp size={10} />
              <span className="text-[8px] font-black uppercase tracking-widest">Market Verified</span>
            </div>
          )}
          <div className="w-px h-2 bg-neutral-200" />
          <span className="text-[9px] font-bold text-neutral-400 font-mono tracking-widest">{item.sku}</span>
        </div>
        
        <h3 className="text-base font-black text-[#051c2c] group-hover:text-[#0062ff] transition-colors">{item.name}</h3>
        <p className="text-[11px] text-neutral-500 mt-1 font-medium">{item.keySpec} · {item.description.slice(0, 80)}...</p>
        
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1.5">
            <RatingDots rating={item.rating} />
            <span className="text-[10px] font-black text-[#051c2c]">{item.rating} SCORE</span>
          </div>
          <div className="flex items-center gap-1.5">
            {item.labels.map(l => (
              <span key={l} className="text-[8px] font-black px-2 py-0.5 border border-sky-100 text-sky-600 bg-sky-50">{l}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Execution Matrix */}
      <div className="flex-shrink-0 p-6 flex flex-col items-end justify-between bg-sky-50/20 border-l border-sky-50 w-60">
        <div className="text-right space-y-1">
          <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Unit Requisition Rate</p>
          <div className="text-2xl font-black text-[#051c2c] tracking-tighter">{fmt(item.price)}</div>
          <div className="flex items-center gap-2 justify-end">
            <span className="text-[11px] font-bold text-neutral-500">/{item.unit}</span>
            {d > 0 && <span className="text-[10px] font-black text-[#0062ff] bg-sky-50 px-1.5 py-0.5">-{d}% VARIANCE</span>}
          </div>
        </div>
        
        <button
          className={`w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
            inBasket ? 'bg-sky-50 text-primary border border-primary' : 'bg-[#051c2c] text-white hover:bg-black'
          }`}
          onClick={(e) => { e.stopPropagation(); onQuickAdd(item); }}
        >
          {inBasket ? <><CheckSquare size={12} /> Staged for Request</> : <><Plus size={12} /> Source Item</>}
        </button>
      </div>
    </div>
  );
};

// ─── Item Detail Panel (right slide-in) ───────────────────────────────────────
// ─── Product Detail View (Full Screen) ───────────────────────────────────────
const ProductDetailView = ({ item, onBack, onAdd, inBasket }) => {
  const cat = getCat(item.category);
  const [qty, setQty] = useState(item.minQty);
  const d = disc(item.originalPrice, item.price);
  
  return (
    <div className="min-h-screen bg-white animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
       <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-sky-100 flex items-center justify-between px-6 py-4 px-10">
          <button onClick={onBack} className="flex items-center gap-2 text-neutral-500 hover:text-blue-900 font-bold text-sm transition-colors group">
            <ArrowRight size={16} className="rotate-180 transform group-hover:-translate-x-1 transition-transform" /> Back to Catalog
          </button>
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">Total Request Value</p>
                <p className="text-sm font-black text-emerald-600 leading-none">{fmt(item.price * qty)}</p>
             </div>
             <button 
                onClick={() => onAdd(item, qty)}
                className={`px-8 py-3 text-xs font-black uppercase tracking-widest transition-all ${inBasket ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-blue-950 text-white hover:bg-black shadow-lg shadow-blue-200'}`}
             >
                {inBasket ? 'Update in Basket' : 'Add to Request Basket'}
             </button>
          </div>
       </div>

       <div className="max-w-[1400px] mx-auto px-6 pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
             {/* Left: Images */}
             <div className="space-y-6">
                <div className="aspect-[4/5] bg-neutral-50 border border-sky-100 overflow-hidden relative group rounded-2xl">
                   <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                   {item.tag && (
                      <div className="absolute top-6 left-6">
                         <span className="px-3 py-1.5 bg-blue-950 text-white text-[10px] font-black uppercase tracking-widest shadow-xl">{item.tag}</span>
                      </div>
                   )}
                   {d > 0 && (
                      <div className="absolute top-6 right-6">
                         <span className="px-3 py-1.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl">-{d}% OFF</span>
                      </div>
                   )}
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                   {[1,2,3,4].map(i => (
                      <div key={i} className="aspect-square bg-neutral-100 border border-sky-100 rounded-xl overflow-hidden opacity-50 hover:opacity-100 cursor-pointer transition-opacity">
                         <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
                      </div>
                   ))}
                </div>
             </div>
             
             {/* Right: Info */}
             <div className="space-y-10">
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <span className="text-xs font-black uppercase tracking-widest px-3 py-1 bg-sky-50 text-sky-800 border border-sky-100 rounded-full">{item.vendor}</span>
                      {item.vendorVerified && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                           <BadgeCheck size={14} />
                           <span className="text-[10px] font-black uppercase tracking-wider">Verified Vendor</span>
                        </div>
                      )}
                   </div>
                   <h1 className="text-5xl font-black text-blue-950 leading-[1.1] tracking-tight">{item.name}</h1>
                   <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                         <RatingDots rating={item.rating} />
                         <span className="text-sm font-black text-neutral-800 ml-1">{item.rating}</span>
                      </div>
                      <span className="text-neutral-200">/</span>
                      <span className="text-sm text-neutral-500 font-bold uppercase tracking-widest">{item.reviews.toLocaleString()} Reviews</span>
                      <span className="text-neutral-200">/</span>
                      <span className="text-sm text-neutral-500 font-bold uppercase tracking-widest">SKU: {item.sku}</span>
                   </div>
                </div>

                <div className="bg-sky-50/20 border border-sky-100 p-8 rounded-3xl space-y-6 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                   <div className="flex items-baseline gap-4">
                      <span className="text-5xl font-black text-blue-950">{fmt(item.price)}</span>
                      {d > 0 && <span className="text-xl text-neutral-400 line-through">{fmt(item.originalPrice)}</span>}
                      <span className="text-sm text-neutral-400 font-black uppercase tracking-widest">Excl. GST</span>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-6 pt-6 border-t border-sky-100">
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Inventory Status</p>
                         <div className="flex items-center gap-2 text-emerald-600">
                            <CircleDot size={14} className="animate-pulse" />
                            <span className="text-sm font-black uppercase tracking-tighter">In Stock · {item.stock} Units</span>
                         </div>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Procurement SLA</p>
<div className="flex items-center gap-2 text-blue-600">
                            <Truck size={14} />
                            <span className="text-sm font-black uppercase tracking-tighter">{item.leadDays} Delivery</span>
                         </div>
                      </div>
                    </div>
                 </div>

                 <BenchmarkingPanel item={item} />

                 <div className="space-y-4">
                   <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none">Select Quantity (Min: {item.minQty} {item.unit})</p>
                   <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                      <div className="flex items-center border-2 border-sky-100 bg-white rounded-2xl overflow-hidden p-1">
                         <button onClick={() => setQty(q => Math.max(item.minQty, q - 1))} className="w-12 h-12 flex items-center justify-center hover:bg-sky-50 text-neutral-400 hover:text-blue-900 transition-all"><Minus size={18} /></button>
                         <input type="number" value={qty} readOnly className="w-20 text-center text-xl font-black text-blue-950 outline-none bg-transparent" />
                         <button onClick={() => setQty(q => Math.min(item.maxQty, q + 1))} className="w-12 h-12 flex items-center justify-center hover:bg-sky-50 text-neutral-400 hover:text-blue-900 transition-all"><Plus size={18} /></button>
                      </div>
                      <div className="flex-1 space-y-2 text-center sm:text-left">
                         <p className="text-xs font-bold text-neutral-400">Requesting <span className="text-blue-900 font-black">{qty} {item.unit}</span> for Site 01</p>
                         <div className="h-1.5 w-full bg-sky-50 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${Math.min(100, (qty / item.maxQty) * 100)}%` }}></div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-10 border-y border-sky-100">
                   <div className="space-y-6">
                      <h3 className="text-xs font-black text-blue-900 uppercase tracking-[0.2em] flex items-center gap-3">
                         <span className="w-8 h-px bg-blue-900" />
                         Technical Specs
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                         {item.specs.map((s, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3.5 bg-sky-50/20 border border-sky-100/30 rounded-xl group hover:bg-white hover:shadow-sm transition-all">
                               <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{s.split('·')[0].trim()}</span>
                               <span className="text-xs font-black text-blue-900">{s.split('·')[1] || 'Verified'}</span>
                            </div>
                         ))}
                      </div>
                   </div>
                   <div className="space-y-6">
                      <h3 className="text-xs font-black text-blue-900 uppercase tracking-[0.2em] flex items-center gap-3">
                         <span className="w-8 h-px bg-blue-900" />
                         Description
                      </h3>
                      <div className="space-y-5">
                         <p className="text-sm text-neutral-600 leading-relaxed font-medium">
                            {item.description}
                         </p>
                         <div className="p-5 border-l-4 border-amber-400 bg-amber-50 rounded-r-2xl">
                            <p className="text-xs font-bold text-amber-800 leading-relaxed">
                               This item is categorized under <span className="font-black underline">{cat.label}</span>. Procurement policy code <span className="font-black">PRC-2024-X</span> applies to all requisitions exceeding 100 units.
                            </p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

// ─── Request Basket Drawer ────────────────────────────────────────────────────
const RequestBasket = ({ basket, onClose, onUpdateQty, onRemove, onSubmit, requesterName }) => {
  const [justification, setJustification] = useState('');
  const [priority, setPriority] = useState('normal');
  const [submitted, setSubmitted] = useState(false);
  const [prRef, setPrRef] = useState('');

  const subtotal = basket.reduce((s, i) => s + i.price * i.qty, 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;
  const totalItems = basket.reduce((s, i) => s + i.qty, 0);

  const handleSubmit = () => {
    if (!basket.length) return;
    const ref = `PR-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`;
    setPrRef(ref);

    // Persist to local storage for tracking
    const localPRs = JSON.parse(localStorage.getItem('mock_raised_prs') || '[]');
    localPRs.unshift({
        id: ref.replace('PR-', ''),
        description: `${basket[0].name}${basket.length > 1 ? ` + ${basket.length - 1} more item${basket.length > 2 ? 's' : ''}` : ''}`,
        requester: requesterName || 'Requester',
        location: "Site 1",
        date: new Date().toISOString().slice(0, 10),
        status: "Pending Approval",
        amount: total,
        age_days: 0
    });
    localStorage.setItem('mock_raised_prs', JSON.stringify(localPRs));

    setSubmitted(true);
    // Switch to orders tab after showing success!
    setTimeout(() => { onSubmit(ref); }, 3000);
  };

  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-[420px] bg-white shadow-2xl z-[100] flex flex-col border-l border-sky-100 animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="flex-shrink-0 bg-sky-50/50 text-slate-800 p-5 flex items-start justify-between border-b border-sky-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Inbox size={16} className="text-primary" />
              <span className="text-xs font-black text-primary uppercase tracking-widest">Request Basket</span>
            </div>
            <p className="text-xl font-black text-slate-800">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
            <p className="text-xs text-slate-400 mt-0.5">Review before submitting your PR</p>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-slate-800 transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          /* Success State */
          <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8 text-center">
            <div className="w-20 h-20 bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
              <CheckCircle size={40} className="text-emerald-500" />
            </div>
            <div>
              <h3 className="text-xl font-black text-blue-800">PR Submitted!</h3>
              <p className="text-sm text-neutral-500 mt-1">Your request is now pending approval.</p>
            </div>
            <div className="w-full bg-neutral-50 border border-neutral-200 p-4 text-left">
              <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Reference Number</p>
              <p className="text-2xl font-black text-emerald-700 font-mono">{prRef}</p>
              <p className="text-xs text-neutral-400 mt-1">Track this PR in the Transactions module</p>
            </div>
            <div className="text-xs text-neutral-400 flex items-center gap-2">
              <Clock size={12} />
              Typical approval: 2–3 business days
            </div>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="flex-1 overflow-y-auto divide-y divide-sky-50">
              {basket.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center gap-3 text-neutral-400">
                  <Inbox size={36} className="opacity-20" />
                  <p className="text-sm font-bold">Your basket is empty</p>
                  <p className="text-xs text-center text-neutral-300">Browse the catalog and add items to request them</p>
                </div>
              ) : basket.map(item => {
                const cat = getCat(item.category);
                return (
                  <div key={item.id} className="p-4 flex gap-3 group">
                    {/* Left bar */}
                    <div className="w-0.5 flex-shrink-0 self-stretch" style={{ backgroundColor: cat.hue }} />
                    {/* Image */}
                    <div
                      className="relative w-14 h-14 flex-shrink-0 flex items-center justify-center overflow-hidden"
                      style={{ background: cat.bg }}
                    >
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover text-transparent" />
                    </div>
                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-blue-800 leading-tight line-clamp-2">{item.name}</p>
                      <p className="text-[10px] font-bold mt-0.5" style={{ color: cat.hue }}>{item.vendor}</p>
                      <p className="text-xs font-black text-neutral-700 mt-1">{fmt(item.price)} / {item.unit}</p>
                      {/* Qty controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-sky-100">
                          <button className="w-6 h-6 flex items-center justify-center hover:bg-sky-50 transition-colors border-r border-sky-100"
                            onClick={() => onUpdateQty(item.id, Math.max(item.minQty, item.qty - 1))}>
                            <Minus size={10} className="text-neutral-500" />
                          </button>
                          <span className="w-8 text-center text-xs font-black text-blue-800">{item.qty}</span>
                          <button className="w-6 h-6 flex items-center justify-center hover:bg-sky-50 transition-colors border-l border-sky-100"
                            onClick={() => onUpdateQty(item.id, Math.min(item.maxQty, item.qty + 1))}>
                            <Plus size={10} className="text-neutral-500" />
                          </button>
                        </div>
                        <button className="text-[10px] font-bold text-neutral-300 hover:text-red-400 transition-colors"
                          onClick={() => onRemove(item.id)}>
                          Remove
                        </button>
                      </div>
                    </div>
                    {/* Line total */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-black text-blue-800">{fmt(item.price * item.qty)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {basket.length > 0 && (
              <div className="flex-shrink-0 border-t border-sky-100 bg-sky-50/20">
                {/* PR Form */}
                <div className="p-4 space-y-3 border-b border-sky-100">
                  {/* Priority */}
                  <div>
                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Request Priority</p>
                    <div className="flex gap-2">
                      {[
                        { key: 'low',    label: 'Routine',  color: '#64748b' },
                        { key: 'normal', label: 'Standard', color: '#10b981' },
                        { key: 'high',   label: 'Urgent',   color: '#f59e0b' },
                        { key: 'crit',   label: 'Critical', color: '#ef4444' },
                      ].map(p => (
                        <button
                          key={p.key}
                          onClick={() => setPriority(p.key)}
                          className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wide transition-all border ${
                            priority === p.key ? 'text-white border-transparent' : 'bg-white text-neutral-400 border-sky-100'
                          }`}
                          style={priority === p.key ? { backgroundColor: p.color } : {}}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Justification */}
                  <div>
                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1.5">Business Justification</p>
                    <textarea
                      value={justification}
                      onChange={e => setJustification(e.target.value)}
                      placeholder="Describe the business need for this request..."
                      className="w-full text-xs p-3 border border-sky-100 bg-white outline-none focus:border-emerald-400 h-20 resize-none text-neutral-700 placeholder-neutral-300 transition-colors"
                    />
                  </div>
                </div>

                {/* Cost Summary */}
                <div className="p-4 space-y-2">
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>Subtotal · {totalItems} items</span>
                    <span className="font-bold text-neutral-700">{fmt(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>Estimated GST (18%)</span>
                    <span className="font-bold text-neutral-700">{fmt(gst)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-sky-100">
                    <span className="text-sm font-black text-blue-800">Total PR Value</span>
                    <span className="text-lg font-black text-emerald-700">{fmt(total)}</span>
                  </div>
                </div>

                {/* Submit */}
                <div className="px-4 pb-4">
                  <button
                    onClick={handleSubmit}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                  >
                    <SendHorizontal size={16} />
                    Submit Purchase Requisition
                  </button>
                  <p className="text-center text-[10px] text-neutral-400 mt-2">
                    Submitted PRs enter the approval workflow automatically
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ─── PR Orders View ───────────────────────────────────────────────────────────
const MyPRsView = ({ prs, onBack }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = async (id) => {
    setSelectedId(id);
    setLoading(true);
    try { const r = await getPrGantt(id); setDetail(r.data); } catch {}
    setLoading(false);
  };

  const statusStyle = (s) => {
    if (!s || s === 'Pending') return { bg: '#fef3c7', text: '#92400e' };
    if (s === 'Approved' || s === 'PO_Created') return { bg: '#d1fae5', text: '#065f46' };
    if (s === 'Rejected') return { bg: '#fee2e2', text: '#991b1b' };
    return { bg: '#f1f5f9', text: '#475569' };
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 transition-colors">
          ← Back to Catalog
        </button>
        <div className="h-4 w-px bg-neutral-200" />
        <h1 className="text-lg font-black text-blue-800">My Purchase Requisitions</h1>
        <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 ml-auto">{prs.length} total</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* PR List */}
        <div className="lg:col-span-2 space-y-2">
          {prs.length === 0 ? (
            <div className="bg-white border border-sky-100 p-12 flex flex-col items-center gap-3 text-neutral-400">
              <Inbox size={32} className="opacity-20" />
              <p className="text-sm font-bold">No PRs submitted yet</p>
            </div>
          ) : prs.map(pr => {
            const s = statusStyle(pr.status);
            const isSelected = selectedId === pr.id;
            return (
              <div
                key={pr.id}
                onClick={() => handleSelect(pr.id)}
                className={`bg-white border cursor-pointer p-4 transition-all ${
                  isSelected ? 'border-emerald-400 shadow-md' : 'border-sky-100 hover:border-sky-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-black text-blue-800 font-mono">PR-{pr.id}</span>
                  <span className="text-[9px] font-black px-2 py-0.5 uppercase tracking-wide" style={{ backgroundColor: s.bg, color: s.text }}>
                    {pr.status || 'Pending'}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 line-clamp-2">{pr.description}</p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-neutral-400">
                  <span>{pr.date}</span>
                  <span className="text-neutral-200">·</span>
                  <span>{pr.location}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* PR Timeline */}
        <div className="lg:col-span-3 bg-white border border-sky-100">
          {!selectedId ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-neutral-300">
              <CircleDot size={28} className="opacity-40" />
              <p className="text-sm font-bold">Select a PR to view its timeline</p>
            </div>
          ) : (
            <div>
              <div className="p-4 border-b border-sky-50 flex items-center gap-2">
                <Clock size={14} className="text-emerald-500" />
                <h3 className="text-xs font-black text-neutral-700 uppercase tracking-wider">Process Timeline · PR-{selectedId}</h3>
              </div>
              <div className="p-5">
                {loading ? (
                  <div className="space-y-3 animate-pulse">{[1,2,3,4].map(i => <div key={i} className="h-12 bg-sky-50" />)}</div>
                ) : detail?.stages ? (
                  <div className="relative">
                    <div className="absolute left-[15px] top-0 bottom-0 w-px bg-sky-100" />
                    <div className="space-y-4">
                      {(() => {
                        let runningP = 0;
                        let runningC = 0;
                        const totalDays = detail.stages.reduce((sum, s) => sum + s.planned_days, 0);
                        const scale = Math.max(totalDays, 25);

                        return detail.stages.map((stage, i) => {
                          const pStart = runningP;
                          const cStart = runningC;
                          runningP += stage.planned_days;
                          runningC += stage.current_days;

                          const pX = (pStart / scale) * 100;
                          const pW = (stage.planned_days / scale) * 100;
                          const cX = (cStart / scale) * 100;
                          const cW = (stage.current_days / scale) * 100;

                          const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
                          const color = colors[i % colors.length];

                          return (
                            <div key={i} className="flex gap-4 relative">
                              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center z-10 border-2 border-white shadow-sm transition-all`}
                                   style={{ backgroundColor: stage.status === 'pending' ? '#f1f5f9' : color }}>
                                {stage.status === 'completed' ? <CheckCircle size={14} className="text-white" /> :
                                 stage.status === 'in_progress' ? <CircleDot size={14} className="text-white animate-pulse" /> :
                                 <span className="text-[10px] font-black text-neutral-300">{i+1}</span>}
                              </div>
                              <div className="flex-1 pb-6">
                                <div className="flex items-center justify-between">
                                  <p className={`text-[11px] font-black uppercase tracking-tight ${stage.status === 'pending' ? 'text-neutral-300' : 'text-blue-950'}`}>{stage.name}</p>
                                  {stage.date && <span className="text-[9px] font-black text-neutral-400 bg-neutral-50 px-1.5 py-0.5">{stage.date}</span>}
                                </div>
                                <p className="text-[9px] font-bold text-neutral-400 mt-0.5 uppercase tracking-tighter">Owner: {stage.owner}</p>
                                
                                {/* Parallel Gantt Bars */}
                                <div className="mt-3 relative h-6">
                                  {/* Planned Baseline */}
                                  <div 
                                    className="absolute h-1.5 rounded-sm border border-neutral-100 bg-neutral-50 top-0 opacity-40"
                                    style={{ left: `${pX}%`, width: `${pW}%` }}
                                  ></div>
                                  {/* Performance Bar (Actual/Forecast) */}
                                  <div 
                                    className={`absolute h-2.5 rounded-sm top-2.5 transition-all duration-1000`}
                                    style={{ 
                                      left: `${cX}%`, 
                                      width: `${cW}%`,
                                      backgroundColor: stage.status === 'pending' ? '#f8fafc' : color,
                                    }}
                                  ></div>
                                </div>
                                
                                {stage.status !== 'pending' && (
                                  <div className="mt-1 flex justify-between text-[8px] font-black uppercase tracking-tighter">
                                    <span className="text-neutral-400">Target: {stage.planned_days}D</span>
                                    <span className={stage.current_days > stage.planned_days ? 'text-rose-500' : 'text-emerald-600'}>
                                      {stage.status === 'completed' ? 'Actual' : 'Forecast'}: {stage.current_days}D
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                ) : <p className="text-sm text-neutral-400 text-center py-8">No timeline data</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total PRs', val: prs.length, c: '#10b981' },
          { label: 'Approved', val: prs.filter(p => p.status === 'Approved').length, c: '#22c55e' },
          { label: 'Pending', val: prs.filter(p => !p.status || p.status === 'Pending').length, c: '#f59e0b' },
          { label: 'Rejected', val: prs.filter(p => p.status === 'Rejected').length, c: '#ef4444' },
        ].map(({ label, val, c }) => (
          <div key={label} className="bg-white border border-sky-100 p-4 flex flex-col gap-1">
            <div className="w-3 h-1" style={{ backgroundColor: c }} />
            <p className="text-2xl font-black text-blue-900 mt-1">{val}</p>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Comparison Modal ─────────────────────────────────────────────────────────
const ComparisonModal = ({ items, onClose, onQuickAdd, basket }) => {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-sky-900/10 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[1400px] max-h-[90vh] bg-white shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex-shrink-0 p-5 border-b border-sky-100 flex items-center justify-between bg-white text-slate-800">
          <div className="flex items-center gap-3">
            <Scale size={20} className="text-primary" />
            <h2 className="text-xl font-black tracking-wide text-slate-800">Product Comparison</h2>
            <span className="px-2.5 py-1 bg-sky-50 text-primary text-xs font-bold uppercase tracking-widest border border-sky-100">
              {items.length} Items Selected
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Comparison Table Grid */}
        <div className="flex-1 overflow-auto bg-neutral-50">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white">
                <th className="p-4 border-b border-r border-neutral-100 w-48 sticky left-0 z-20 bg-white min-w-[200px] shadow-[4px_0_12px_rgba(0,0,0,0.03)]" />
                {items.map(item => (
                  <th key={item.id} className="p-6 border-b border-r border-neutral-100 w-72 min-w-[300px] bg-white relative align-top">
                    <button onClick={() => onClose(item.id)} className="absolute top-3 right-3 p-1 text-neutral-300 hover:text-red-500 transition-colors z-20 tooltip" title="Remove from comparison">
                      <X size={16} />
                    </button>
                    <div className="h-44 w-full mb-4 bg-neutral-100 flex items-center justify-center overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover text-transparent" />
                    </div>
                    <div className="flex flex-col gap-1.5 h-40">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-primary">{item.vendor}</p>
                      <h3 className="text-sm font-black text-slate-800 leading-snug line-clamp-3" title={item.name}>{item.name}</h3>
                      <div className="text-xl font-black text-primary mt-1">{fmt(item.price)}</div>
                      <div className="mt-auto pt-2">
                        <button
                          className={`w-full py-2.5 text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                            basket.find(b => b.id === item.id) ? 'bg-sky-50 text-primary border border-sky-200' : 'bg-primary text-white hover:bg-sky-600'
                          }`}
                          onClick={() => onQuickAdd(item)}
                        >
                          {basket.find(b => b.id === item.id) ? <><CheckCircle size={14} /> Added to Request</> : <><Plus size={14} /> Add to Request</>}
                        </button>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm text-neutral-700">
              {/* Ratings */}
              <tr className="bg-white hover:bg-neutral-50 transition-colors">
                <td className="p-5 border-b border-r border-neutral-100 font-black text-neutral-500 uppercase tracking-widest text-[10px] sticky left-0 z-10 bg-inherit shadow-[4px_0_12px_rgba(0,0,0,0.03)]">Rating & Reviews</td>
                {items.map(item => (
                  <td key={item.id} className="p-5 border-b border-r border-neutral-100">
                    <div className="flex items-center gap-2">
                      <RatingDots rating={item.rating} />
                      <span className="font-bold text-primary">{item.rating}</span>
                      <span className="text-slate-400 text-xs">({item.reviews.toLocaleString()})</span>
                    </div>
                  </td>
                ))}
              </tr>
              {/* Delivery */}
              <tr className="bg-white hover:bg-neutral-50 transition-colors group">
                <td className="p-5 border-b border-r border-neutral-100 font-black text-neutral-500 uppercase tracking-widest text-[10px] sticky left-0 z-10 bg-inherit shadow-[4px_0_12px_rgba(0,0,0,0.03)]">Estimated Delivery</td>
                {items.map(item => (
                  <td key={item.id} className="p-5 border-b border-r border-neutral-100 font-bold">
                    <div className="flex items-center gap-2 text-neutral-700">
                      <Truck size={14} className="text-neutral-400 group-hover:text-emerald-500 transition-colors" />
                      {item.leadDays}
                    </div>
                  </td>
                ))}
              </tr>
              {/* Min Qty */}
              <tr className="bg-white hover:bg-neutral-50 transition-colors">
                <td className="p-5 border-b border-r border-neutral-100 font-black text-neutral-500 uppercase tracking-widest text-[10px] sticky left-0 z-10 bg-inherit shadow-[4px_0_12px_rgba(0,0,0,0.03)]">Min Order Qty</td>
                {items.map(item => (
                  <td key={item.id} className="p-5 border-b border-r border-neutral-100 text-neutral-700 font-medium">
                    {item.minQty} {item.unit}
                  </td>
                ))}
              </tr>
              {/* Stock */}
              <tr className="bg-white hover:bg-neutral-50 transition-colors">
                <td className="p-5 border-b border-r border-neutral-100 font-black text-neutral-500 uppercase tracking-widest text-[10px] sticky left-0 z-10 bg-inherit shadow-[4px_0_12px_rgba(0,0,0,0.03)]">Availability</td>
                {items.map(item => (
                  <td key={item.id} className="p-5 border-b border-r border-neutral-100 font-bold">
                    <div className="flex items-center gap-2 text-primary">
                      <CircleDot size={12} />
                      In Stock ({item.stock})
                    </div>
                  </td>
                ))}
              </tr>
              {/* Description */}
              <tr className="bg-white hover:bg-neutral-50 transition-colors">
                <td className="p-5 border-b border-r border-neutral-100 font-black text-neutral-500 uppercase tracking-widest text-[10px] sticky left-0 z-10 bg-inherit shadow-[4px_0_12px_rgba(0,0,0,0.03)] align-top">Description</td>
                {items.map(item => (
                  <td key={item.id} className="p-5 border-b border-r border-neutral-100 align-top">
                    <p className="text-xs text-neutral-600 leading-relaxed font-medium">{item.description}</p>
                  </td>
                ))}
              </tr>
              {/* Specs */}
              <tr className="bg-white hover:bg-neutral-50 transition-colors">
                <td className="p-5 border-b border-r border-neutral-100 font-black text-neutral-500 uppercase tracking-widest text-[10px] sticky left-0 z-10 bg-inherit shadow-[4px_0_12px_rgba(0,0,0,0.03)] align-top">Specifications</td>
                {items.map(item => (
                  <td key={item.id} className="p-5 border-b border-r border-neutral-100 align-top">
                    <ul className="text-xs text-neutral-700 space-y-2 list-none">
                      {item.specs.map(s => (
                        <li key={s} className="flex gap-2 items-start">
                          <span className="text-emerald-500 mt-1 flex-shrink-0">›</span>
                          <span className="font-semibold">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RequesterMarketplace({ onViewOrders }) {
  const { currentUser } = useApp();
  const [basket, setBasket] = useState([]);
  const [showBasket, setShowBasket] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [sort, setSort] = useState('default');
  const [view, setView] = useState('grid');
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeView, setActiveView] = useState('catalog'); // 'catalog' | 'myorders' | 'product'
  const [prs, setPrs] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    getPrList().then(r => setPrs(r.data || [])).catch(() => {});
  }, [currentUser]);

  // Basket ops
  const addToBasket = (item, qty = item.minQty) => {
    setBasket(prev => {
      const ex = prev.find(b => b.id === item.id);
      if (ex) return prev.map(b => b.id === item.id ? { ...b, qty: Math.min(item.maxQty, b.qty + qty) } : b);
      return [...prev, { ...item, qty }];
    });
  };

  const updateQty = (id, qty) => setBasket(prev => prev.map(b => b.id === id ? { ...b, qty } : b));
  const removeItem = (id) => setBasket(prev => prev.filter(b => b.id !== id));
  
  const toggleCompare = (id) => {
    setCompareList(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };
  const handleSubmit = (ref) => {
    setBasket([]);
    setShowBasket(false);
    // Refresh the local PR list so the counter in the header updates immediately
    getPrList().then(r => setPrs(r.data || [])).catch(() => {});
  };

  const basketCount = basket.reduce((s, i) => s + i.qty, 0);
  const basketTotal = basket.reduce((s, i) => s + i.price * i.qty, 0);

  // Filtered items
  const items = CATALOG
    .filter(i => catFilter === 'all' || i.category === catFilter)
    .filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.vendor.toLowerCase().includes(search.toLowerCase()) || i.keySpec.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === 'price_asc' ? a.price - b.price : sort === 'price_desc' ? b.price - a.price : sort === 'rating' ? b.rating - a.rating : 0);

  const currentCat = getCat(catFilter);

  if (activeView === 'myorders') {
    return <MyPRsView prs={prs} onBack={() => setActiveView('catalog')} />;
  }

  if (activeView === 'product' && selectedItem) {
    return (
      <ProductDetailView 
        item={selectedItem} 
        onBack={() => setActiveView('catalog')} 
        onAdd={(item, qty) => {
           addToBasket(item, qty);
        }} 
        inBasket={!!basket.find(b => b.id === selectedItem.id)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9]">

      {/* ─── Header / Welcome Banner ─── */}
      <div className="bg-slate-50/50 text-slate-900 border-b border-sky-100">
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">

            {/* Left: Branding & Analytics */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Strategy & Procurement Platform</span>
              </div>
              <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-800">
                Global Category <span className="text-primary font-light italic">Intelligence</span>
              </h1>
              <p className="text-sm text-slate-400 mt-1 font-medium italic">Empowering strategic sourcing through AI-driven marketplace insights.</p>
            </div>

            {/* Right: Stats + Actions */}
            <div className="flex items-center gap-4">
              {/* Quick stats with minimalist sky aesthetic */}
              <div className="hidden lg:flex items-center gap-8 px-6 py-3 bg-white border border-sky-100">
                <div className="text-center">
                  <p className="text-xl font-black text-slate-800 leading-none">{prs.length}</p>
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1.5">Active PRs</p>
                </div>
                <div className="w-px h-6 bg-sky-50" />
                <div className="text-center">
                  <p className="text-xl font-black text-primary leading-none">{prs.filter(p => p.status === 'Approved').length}</p>
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1.5">Approved</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveView('myorders')}
                  className="flex items-center gap-2 px-5 py-3 border border-sky-200 bg-white hover:bg-sky-50 text-xs font-black text-primary uppercase tracking-widest transition-all"
                >
                  <FileText size={14} /> My Dashboard
                </button>

                <button
                  onClick={() => setShowBasket(true)}
                  className="relative flex items-center gap-2 px-5 py-3 bg-primary hover:bg-sky-600 text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-sky-500/10"
                >
                  <Inbox size={14} />
                  <span>Request Basket</span>
                  {basketCount > 0 && (
                    <span className="flex items-center justify-center w-5 h-5 bg-white text-blue-700 text-[10px] font-black">
                      {basketCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Search bar - Integrated into header */}
          <div className="mt-8 flex gap-2">
            <div className="relative flex-1 max-w-2xl group">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
              <input
                ref={searchRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search global inventory, vendors, or technical SKU specifications..."
                className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-sky-100 outline-none focus:border-primary focus:bg-white text-slate-800 placeholder-slate-300 transition-all font-medium"
                onKeyDown={(e) => {
                   if (e.key === 'Enter') searchRef.current?.blur();
                }}
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white">
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Category Navigation (McKinsey Style - Hidden Scrollbar) ─── */}
      <div className="bg-white border-b border-neutral-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto no-scrollbar scroll-smooth">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const active = catFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCatFilter(cat.id)}
                  className={`flex items-center gap-2 px-8 py-5 text-[10px] font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all group ${
                    active
                      ? 'text-primary border-primary bg-sky-50/20'
                      : 'border-transparent text-slate-400 hover:text-primary hover:bg-sky-50/50'
                  }`}
                >
                  <Icon size={14} className={active ? 'text-primary' : 'text-neutral-300 group-hover:text-neutral-500'} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: currentCat.hue }} />
            <p className="text-lg font-black text-blue-950">{currentCat.label}</p>
            <span className="text-neutral-300">/</span>
            <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest">{items.length} Product{items.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="flex items-center gap-2 border-2 border-neutral-100 bg-white px-4 py-2 rounded-xl">
              <SlidersHorizontal size={14} className="text-neutral-400" />
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="text-xs font-black text-neutral-700 bg-transparent outline-none cursor-pointer"
              >
                <option value="default">Default Sort</option>
                <option value="rating">Top Rated First</option>
                <option value="price_asc">Price Low to High</option>
                <option value="price_desc">Price High to Low</option>
              </select>
            </div>

            {/* View toggle */}
            <div className="flex border-2 border-neutral-100 bg-white rounded-xl overflow-hidden p-1">
              <button
                onClick={() => setView('grid')}
                className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-primary text-white shadow-lg shadow-sky-500/10' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-primary text-white shadow-lg shadow-sky-500/10' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <AlignJustify size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Active label strip */}
        {catFilter !== 'all' && (
          <div
            className="flex items-center gap-3 px-6 py-3 mb-8 border-l-4 rounded-r-3xl"
            style={{ borderLeftColor: currentCat.hue, backgroundColor: currentCat.bg }}
          >
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: currentCat.text }}>{currentCat.label} Catalog</span>
            <span className="text-xs font-medium" style={{ color: currentCat.text + 'CC' }}>
              Showing curated, pre-approved inventory for your site.
            </span>
            <button
              onClick={() => setCatFilter('all')}
              className="ml-auto text-xs font-black uppercase tracking-widest transition-opacity hover:opacity-70 bg-white/20 px-3 py-1 rounded"
              style={{ color: currentCat.text }}
            >
              Reset Filters ×
            </button>
          </div>
        )}

        {/* Products */}
        {items.length === 0 ? (
          <div className="bg-white border-2 border-neutral-100 rounded-3xl py-32 flex flex-col items-center gap-6 text-neutral-400">
            <Package size={64} className="opacity-10" />
            <div className="text-center">
              <p className="font-black text-xl text-blue-950 mb-1">No items match your criteria</p>
              <p className="text-sm font-medium text-neutral-500">Try adjusting your search or category filters.</p>
            </div>
            <button onClick={() => { setSearch(''); setCatFilter('all'); }} className="px-6 py-2.5 bg-neutral-100 text-blue-950 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-neutral-200 transition-all">
              Clear All Filters
            </button>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {items.map(item => (
              <CatalogCard
                key={item.id}
                item={item}
                onSelect={(item) => {
                  setSelectedItem(item);
                  setActiveView('product');
                }}
                inBasket={!!basket.find(b => b.id === item.id)}
                onQuickAdd={addToBasket}
                onToggleCompare={toggleCompare}
                isCompared={compareList.includes(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {items.map(item => (
              <CatalogRow
                key={item.id}
                item={item}
                onSelect={(item) => {
                   setSelectedItem(item);
                   setActiveView('product');
                }}
                inBasket={!!basket.find(b => b.id === item.id)}
                onQuickAdd={addToBasket}
                onToggleCompare={toggleCompare}
                isCompared={compareList.includes(item.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── Modals / Drawers ─── */}
      {/* Removed ItemDetailPanel drawer as requested - now using full screen ProductDetailView */}

      {showBasket && (
        <RequestBasket
          basket={basket}
          onClose={() => setShowBasket(false)}
          onUpdateQty={updateQty}
          onRemove={removeItem}
          onSubmit={handleSubmit}
          requesterName={currentUser?.name}
        />
      )}

      {/* ─── Floating Action Pills ─── */}
      {(compareList.length > 0 || (basketCount > 0 && !showBasket)) && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 animate-in slide-in-from-bottom duration-300 shadow-2xl">
          {compareList.length > 0 && (
            <button
              onClick={() => setShowCompareModal(true)}
              className="flex items-center gap-3 bg-white text-primary px-6 py-3 border border-sky-100 hover:bg-sky-50 transition-all text-sm font-black shadow-xl rounded-none"
            >
              <Scale size={16} />
              <span>Compare {compareList.length}</span>
              {compareList.length === 4 && <span className="text-[10px] bg-sky-100 px-1.5 py-0.5 ml-1 rounded">MAX</span>}
            </button>
          )}

          {basketCount > 0 && !showBasket && (
            <button
              onClick={() => setShowBasket(true)}
              className="flex items-center gap-3 bg-primary text-white px-6 py-3 hover:bg-sky-600 transition-all text-sm font-black shadow-xl rounded-none"
            >
              <Inbox size={16} className="text-white" />
              <span>{basketCount} item{basketCount !== 1 ? 's' : ''}</span>
              <div className="w-px h-4 bg-white/20" />
              <span className="text-white">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(basketTotal)}</span>
              <ArrowRight size={14} className="text-white/40" />
            </button>
          )}
        </div>
      )}

      {showCompareModal && (
        <ComparisonModal
          items={compareList.map(id => CATALOG.find(c => c.id === id))}
          onClose={(e) => typeof e === 'string' ? toggleCompare(e) : setShowCompareModal(false)}
          onQuickAdd={addToBasket}
          basket={basket}
        />
      )}
    </div>
  );
}
