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
  { id: 'all',         label: 'All Items',        icon: Layers,       hue: '#10b981', bg: '#ecfdf5', text: '#065f46' },
  { id: 'it',          label: 'IT & Electronics',  icon: Cpu,          hue: '#6366f1', bg: '#eef2ff', text: '#3730a3' },
  { id: 'office',      label: 'Office Supplies',   icon: Archive,      hue: '#0ea5e9', bg: '#e0f2fe', text: '#0c4a6e' },
  { id: 'safety',      label: 'Safety & PPE',      icon: ShieldCheck,  hue: '#f59e0b', bg: '#fffbeb', text: '#78350f' },
  { id: 'facilities',  label: 'Facilities',        icon: Building2,    hue: '#8b5cf6', bg: '#f5f3ff', text: '#4c1d95' },
  { id: 'tools',       label: 'Tools & Equipment', icon: Wrench,       hue: '#64748b', bg: '#f1f5f9', text: '#1e293b' },
  { id: 'consumables', label: 'Consumables',       icon: Package,      hue: '#10b981', bg: '#ecfdf5', text: '#065f46' },
];

// ─── Catalog Data ─────────────────────────────────────────────────────────────
const CATALOG = [
  {
    id: 'P001', sku: 'IT-LAPTOP-001', category: 'it',
    name: 'Dell Latitude 5540 Business Laptop',
    vendor: 'Tech Solutions Pvt Ltd', vendorVerified: true,
    price: 89500, originalPrice: 102000,
    unit: 'unit', minQty: 1, maxQty: 10, stock: 12,
    leadDays: '5–7 days',
    rating: 4.6, reviews: 238,
    tag: 'PREFERRED', tagColor: '#10b981',
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
    price: 145000, originalPrice: 165000,
    unit: 'unit', minQty: 1, maxQty: 5, stock: 5,
    leadDays: '10–14 days',
    rating: 4.9, reviews: 512,
    tag: 'TOP RATED', tagColor: '#8b5cf6',
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
    price: 1850, originalPrice: 2200,
    unit: 'unit', minQty: 10, maxQty: 500, stock: 200,
    leadDays: '2–3 days',
    rating: 4.7, reviews: 1024,
    tag: 'MANDATORY', tagColor: '#ef4444',
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
    price: 485, originalPrice: 520,
    unit: 'ream (500 sheets)', minQty: 5, maxQty: 200, stock: 5000,
    leadDays: '1–2 days',
    rating: 4.4, reviews: 3841,
    tag: 'BEST VALUE', tagColor: '#0ea5e9',
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
    price: 9500, originalPrice: 11000,
    unit: 'unit', minQty: 1, maxQty: 25, stock: 35,
    leadDays: '2–4 days',
    rating: 4.8, reviews: 4521,
    tag: 'BEST SELLER', tagColor: '#f59e0b',
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
    price: 650, originalPrice: 800,
    unit: 'unit', minQty: 10, maxQty: 1000, stock: 800,
    leadDays: '1–2 days',
    rating: 4.3, reviews: 2103,
    tag: 'MANDATORY', tagColor: '#ef4444',
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
    price: 350, originalPrice: 420,
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
    price: 1250, originalPrice: 1500,
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
    price: 45000, originalPrice: 52000,
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
    price: 125000, originalPrice: 135000,
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
    price: 4500, originalPrice: 5500,
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

// ─── Utilities ────────────────────────────────────────────────────────────────
const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
const disc = (o, c) => Math.round(((o - c) / o) * 100);
const getCat = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[0];

// ─── Subcomponents ────────────────────────────────────────────────────────────

const RatingDots = ({ rating }) => (
  <span className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(i => (
      <span key={i} className="text-[10px]" style={{ color: i <= Math.round(rating) ? '#f59e0b' : '#e2e8f0' }}>●</span>
    ))}
  </span>
);

// ─── Catalog Card ─────────────────────────────────────────────────────────────
const CatalogCard = ({ item, onSelect, inBasket, onQuickAdd, onToggleCompare, isCompared }) => {
  const cat = getCat(item.category);
  const d = disc(item.originalPrice, item.price);
  const [liked, setLiked] = useState(false);

  return (
    <div
      className="group bg-white border border-neutral-100 hover:border-neutral-300 hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col relative overflow-hidden"
      onClick={() => onSelect(item)}
    >
      {/* Category color top accent */}
      <div className="h-1 w-full" style={{ backgroundColor: cat.hue }} />

      {/* Image area */}
      <div
        className="relative h-48 flex items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${cat.bg}, white)` }}
      >
        <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none text-transparent" />

        <button
          className="absolute bottom-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded shadow-sm hover:bg-white transition-all z-10 flex items-center gap-1 border border-neutral-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
          style={isCompared ? { opacity: 1, borderColor: '#10b981', backgroundColor: '#ecfdf5' } : {}}
          onClick={(e) => { e.stopPropagation(); onToggleCompare(item.id); }}
        >
          {isCompared ? <CheckSquare size={12} className="text-emerald-600" /> : <Square size={12} className="text-neutral-400" />}
          <span className={`text-[10px] font-bold ${isCompared ? 'text-emerald-700' : 'text-neutral-600'}`}>Compare</span>
        </button>

        {/* Tag pill */}
        {item.tag && (
          <div
            className="absolute top-3 left-3 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white"
            style={{ backgroundColor: item.tagColor }}
          >
            {item.tag}
          </div>
        )}

        {/* Discount */}
        {d > 0 && (
          <div className="absolute top-3 right-3 text-[10px] font-black text-white bg-blue-800 px-1.5 py-0.5">
            -{d}%
          </div>
        )}

        {/* Wishlist */}
        <button
          className="absolute bottom-3 right-3 p-1.5 bg-white/80 backdrop-blur hover:bg-white transition-all opacity-0 group-hover:opacity-100"
          onClick={(e) => { e.stopPropagation(); setLiked(l => !l); }}
        >
          <Heart size={13} className={liked ? 'fill-red-500 text-red-500' : 'text-neutral-300'} />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2.5 flex-1">
        {/* Vendor */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: cat.hue }}>
            {item.vendor}
          </span>
          {item.vendorVerified && <BadgeCheck size={11} style={{ color: cat.hue }} />}
        </div>

        {/* Name */}
        <h3 className="text-sm font-bold text-blue-800 leading-snug line-clamp-2 group-hover:text-blue-900">
          {item.name}
        </h3>

        {/* Key Spec */}
        <p className="text-[11px] text-neutral-500 font-medium leading-tight line-clamp-1">{item.keySpec}</p>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <RatingDots rating={item.rating} />
          <span className="text-[11px] font-bold text-neutral-400">{item.rating} ({item.reviews.toLocaleString()})</span>
        </div>

        {/* Labels */}
        <div className="flex flex-wrap gap-1">
          {item.labels.map(l => (
            <span
              key={l}
              className="text-[9px] font-bold px-2 py-0.5 uppercase tracking-wide"
              style={{ backgroundColor: cat.bg, color: cat.text }}
            >
              {l}
            </span>
          ))}
        </div>

        {/* Price + CTA */}
        <div className="mt-auto pt-3 border-t border-neutral-100 flex items-end justify-between gap-2">
          <div>
            <div className="text-lg font-black text-blue-900">{fmt(item.price)}</div>
            <div className="flex items-center gap-1.5">
              {d > 0 && <span className="text-[10px] text-neutral-400 line-through">{fmt(item.originalPrice)}</span>}
              <span className="text-[10px] text-neutral-400">/ {item.unit}</span>
            </div>
          </div>
          <button
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-black transition-all ${
              inBasket
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'text-white hover:opacity-90'
            }`}
            style={!inBasket ? { backgroundColor: cat.hue } : {}}
            onClick={(e) => { e.stopPropagation(); onQuickAdd(item); }}
          >
            {inBasket ? <><CheckCircle size={12} /> Added</> : <><Plus size={12} /> Request</>}
          </button>
        </div>

        {/* Lead time */}
        <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
          <Truck size={10} className="text-neutral-400" />
          <span>Ships in <strong className="text-neutral-600">{item.leadDays}</strong></span>
          <span className="ml-auto flex items-center gap-1">
            <CircleDot size={8} className="text-emerald-500" />
            <span className="text-emerald-600 font-bold">{item.stock} in stock</span>
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── List Row ─────────────────────────────────────────────────────────────────
const CatalogRow = ({ item, onSelect, inBasket, onQuickAdd, onToggleCompare, isCompared }) => {
  const cat = getCat(item.category);
  const d = disc(item.originalPrice, item.price);
  return (
    <div
      className="group bg-white border border-neutral-100 hover:border-neutral-300 hover:shadow-lg transition-all duration-300 cursor-pointer flex gap-0 overflow-hidden"
      onClick={() => onSelect(item)}
    >
      {/* Left color bar */}
      <div className="w-1 flex-shrink-0" style={{ backgroundColor: cat.hue }} />

      {/* Image */}
      <div
        className="relative w-36 flex-shrink-0 flex items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${cat.bg}, white)` }}
      >
        <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none text-transparent" />
        <button
          className="absolute bottom-2 left-2 p-1 bg-white/90 backdrop-blur-sm rounded shadow-sm hover:bg-white transition-all z-10 flex items-center gap-1 border border-neutral-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
          style={isCompared ? { opacity: 1, borderColor: '#10b981', backgroundColor: '#ecfdf5' } : {}}
          onClick={(e) => { e.stopPropagation(); onToggleCompare(item.id); }}
        >
          {isCompared ? <CheckSquare size={12} className="text-emerald-600" /> : <Square size={12} className="text-neutral-400" />}
        </button>
      </div>

      {/* Main Info */}
      <div className="flex-1 p-4 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: cat.hue }}>{item.vendor}</span>
          {item.vendorVerified && <BadgeCheck size={10} style={{ color: cat.hue }} />}
          {item.tag && (
            <span className="text-[9px] font-black px-2 py-0.5 text-white uppercase" style={{ backgroundColor: item.tagColor }}>
              {item.tag}
            </span>
          )}
        </div>
        <h3 className="text-sm font-bold text-blue-800 group-hover:text-blue-900">{item.name}</h3>
        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{item.keySpec}</p>
        <div className="flex items-center gap-2 mt-2">
          <RatingDots rating={item.rating} />
          <span className="text-[11px] text-neutral-400">{item.rating} ({item.reviews.toLocaleString()})</span>
          <span className="text-neutral-200">·</span>
          {item.labels.map(l => (
            <span key={l} className="text-[9px] font-bold px-1.5 py-0.5" style={{ backgroundColor: cat.bg, color: cat.text }}>{l}</span>
          ))}
        </div>
      </div>

      {/* Right: Price + Action */}
      <div className="flex-shrink-0 p-4 flex flex-col items-end justify-between gap-2 w-48">
        <div className="text-right">
          <div className="text-xl font-black text-blue-900">{fmt(item.price)}</div>
          {d > 0 && <div className="flex items-center gap-1 justify-end">
            <span className="text-[10px] text-neutral-400 line-through">{fmt(item.originalPrice)}</span>
            <span className="text-[10px] font-black text-red-400">-{d}%</span>
          </div>}
          <p className="text-[10px] text-neutral-400">per {item.unit}</p>
        </div>
        <button
          className={`w-full py-2 text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            inBasket ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-white hover:opacity-90'
          }`}
          style={!inBasket ? { backgroundColor: cat.hue } : {}}
          onClick={(e) => { e.stopPropagation(); onQuickAdd(item); }}
        >
          {inBasket ? <><CheckCircle size={12} /> Added</> : <><Plus size={12} /> Quick Request</>}
        </button>
        <div className="flex items-center gap-1 text-[10px] text-neutral-400">
          <Truck size={9} />
          <span>{item.leadDays}</span>
        </div>
      </div>
    </div>
  );
};

// ─── Item Detail Panel (right slide-in) ───────────────────────────────────────
const ItemDetailPanel = ({ item, onClose, onRequest, inBasket }) => {
  const cat = getCat(item.category);
  const [qty, setQty] = useState(item.minQty);
  const d = disc(item.originalPrice, item.price);

  return (
    <div className="fixed inset-0 z-[70] flex items-stretch justify-end">
      <div className="absolute inset-0 bg-blue-900/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">

        {/* Color header */}
        <div className="h-2 w-full flex-shrink-0" style={{ backgroundColor: cat.hue }} />

        {/* Top */}
        <div className="flex-shrink-0 p-5 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Layers size={12} />
            <span>{cat.label}</span>
            <ChevronRight size={10} />
            <span className="text-neutral-700 font-bold">{item.sku}</span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-700">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Hero image */}
          <div
            className="h-52 relative flex flex-col items-center justify-center overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${cat.bg} 0%, #ffffff 80%)` }}
          >
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            <div className="absolute bottom-3 right-3 flex gap-2">
              {item.tag && (
                <span className="text-[9px] font-black px-2 py-0.5 text-white uppercase tracking-widest" style={{ backgroundColor: item.tagColor }}>
                  {item.tag}
                </span>
              )}
              {d > 0 && (
                <span className="text-[9px] font-black px-2 py-0.5 bg-blue-800 text-white uppercase">
                  SAVE {d}%
                </span>
              )}
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Vendor */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: cat.hue }}>{item.vendor}</span>
              {item.vendorVerified && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-400">
                  <BadgeCheck size={12} className="text-emerald-500" /> Verified Vendor
                </div>
              )}
            </div>

            {/* Name */}
            <h2 className="text-2xl font-black text-blue-900 leading-tight">{item.name}</h2>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <RatingDots rating={item.rating} />
              <span className="text-sm font-bold text-neutral-600">{item.rating}</span>
              <span className="text-sm text-neutral-400">({item.reviews.toLocaleString()} reviews)</span>
            </div>

            {/* Price block */}
            <div className="p-4 border border-neutral-100 bg-neutral-50/50 space-y-1.5">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-blue-900">{fmt(item.price)}</span>
                {d > 0 && <span className="text-sm text-neutral-400 line-through">{fmt(item.originalPrice)}</span>}
              </div>
              <p className="text-xs text-neutral-500">Per {item.unit} · + 18% GST applicable</p>
              <div className="flex items-center gap-2 pt-1">
                <CircleDot size={10} className="text-emerald-500" />
                <span className="text-xs font-bold text-emerald-600">In Stock · {item.stock} available</span>
              </div>
            </div>

            {/* Key spec */}
            <div>
              <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Key Specification</p>
              <p className="text-sm font-bold text-neutral-700 leading-relaxed">{item.keySpec}</p>
            </div>

            {/* Description */}
            <div>
              <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Description</p>
              <p className="text-sm text-neutral-600 leading-relaxed">{item.description}</p>
            </div>

            {/* Specs grid */}
            <div>
              <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Specifications</p>
              <div className="grid grid-cols-2 gap-1.5">
                {item.specs.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 px-3 bg-neutral-50 text-xs font-medium text-neutral-600 border border-neutral-100">
                    <div className="w-1.5 h-1.5 flex-shrink-0" style={{ backgroundColor: cat.hue }} />
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery */}
            <div className="flex gap-3">
              <div className="flex-1 p-3 border border-neutral-100 flex flex-col items-center gap-1.5 text-center">
                <Truck size={16} className="text-neutral-400" />
                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-wide">Delivery</p>
                <p className="text-xs font-bold text-neutral-700">{item.leadDays}</p>
              </div>
              <div className="flex-1 p-3 border border-neutral-100 flex flex-col items-center gap-1.5 text-center">
                <ShieldCheck size={16} className="text-neutral-400" />
                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-wide">Vendor Status</p>
                <p className="text-xs font-bold text-neutral-700">{item.vendorVerified ? 'Pre-Approved' : 'Pending Review'}</p>
              </div>
              <div className="flex-1 p-3 border border-neutral-100 flex flex-col items-center gap-1.5 text-center">
                <RotateCcw size={16} className="text-neutral-400" />
                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-wide">Min. Order</p>
                <p className="text-xs font-bold text-neutral-700">{item.minQty} {item.unit}</p>
              </div>
            </div>

            {/* Qty */}
            <div className="space-y-2">
              <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Quantity to Request</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-neutral-200 flex-shrink-0">
                  <button className="w-9 h-9 flex items-center justify-center hover:bg-neutral-50 text-neutral-600 transition-colors border-r border-neutral-200"
                    onClick={() => setQty(q => Math.max(item.minQty, q - 1))}>
                    <Minus size={13} />
                  </button>
                  <span className="w-12 text-center text-sm font-black text-blue-800">{qty}</span>
                  <button className="w-9 h-9 flex items-center justify-center hover:bg-neutral-50 text-neutral-600 transition-colors border-l border-neutral-200"
                    onClick={() => setQty(q => Math.min(item.maxQty, q + 1))}>
                    <Plus size={13} />
                  </button>
                </div>
                <p className="text-xs text-neutral-400">Min {item.minQty} · Max {item.maxQty}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="flex-shrink-0 p-5 border-t border-neutral-100 flex gap-3">
          <button onClick={onClose} className="px-4 py-3 border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-colors">
            Cancel
          </button>
          <button
            className={`flex-1 py-3 text-sm font-black transition-all flex items-center justify-center gap-2 ${
              inBasket ? 'bg-emerald-500 text-white' : 'text-white hover:opacity-90'
            }`}
            style={!inBasket ? { backgroundColor: cat.hue } : {}}
            onClick={() => { onRequest(item, qty); onClose(); }}
          >
            {inBasket ? <><CheckCircle size={15} /> Added to Request Basket</> : <><SendHorizontal size={15} /> Add to Request Basket</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Request Basket Drawer ────────────────────────────────────────────────────
const RequestBasket = ({ basket, onClose, onUpdateQty, onRemove, onSubmit }) => {
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
    setSubmitted(true);
    setTimeout(() => { onSubmit(ref); }, 3000);
  };

  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white w-[460px] max-w-full h-full flex flex-col shadow-2xl border-l border-neutral-200 animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="flex-shrink-0 bg-blue-950 text-white p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Inbox size={16} className="text-emerald-400" />
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Request Basket</span>
            </div>
            <p className="text-xl font-black text-white">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
            <p className="text-xs text-neutral-400 mt-0.5">Review before submitting your PR</p>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors p-1">
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
            <div className="flex-1 overflow-y-auto divide-y divide-neutral-50">
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
                        <div className="flex items-center border border-neutral-200">
                          <button className="w-6 h-6 flex items-center justify-center hover:bg-neutral-50 transition-colors border-r border-neutral-200"
                            onClick={() => onUpdateQty(item.id, Math.max(item.minQty, item.qty - 1))}>
                            <Minus size={10} className="text-neutral-500" />
                          </button>
                          <span className="w-8 text-center text-xs font-black text-blue-800">{item.qty}</span>
                          <button className="w-6 h-6 flex items-center justify-center hover:bg-neutral-50 transition-colors border-l border-neutral-200"
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
              <div className="flex-shrink-0 border-t border-neutral-100 bg-neutral-50/50">
                {/* PR Form */}
                <div className="p-4 space-y-3 border-b border-neutral-100">
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
                            priority === p.key ? 'text-white border-transparent' : 'bg-white text-neutral-400 border-neutral-200'
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
                      className="w-full text-xs p-3 border border-neutral-200 bg-white outline-none focus:border-emerald-400 h-20 resize-none text-neutral-700 placeholder-neutral-300 transition-colors"
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
                  <div className="flex justify-between pt-2 border-t border-neutral-200">
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
            <div className="bg-white border border-neutral-100 p-12 flex flex-col items-center gap-3 text-neutral-400">
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
                  isSelected ? 'border-emerald-400 shadow-md' : 'border-neutral-100 hover:border-neutral-300'
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
        <div className="lg:col-span-3 bg-white border border-neutral-100">
          {!selectedId ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-neutral-300">
              <CircleDot size={28} className="opacity-40" />
              <p className="text-sm font-bold">Select a PR to view its timeline</p>
            </div>
          ) : (
            <div>
              <div className="p-4 border-b border-neutral-100 flex items-center gap-2">
                <Clock size={14} className="text-emerald-500" />
                <h3 className="text-xs font-black text-neutral-700 uppercase tracking-wider">Process Timeline · PR-{selectedId}</h3>
              </div>
              <div className="p-5">
                {loading ? (
                  <div className="space-y-3 animate-pulse">{[1,2,3,4].map(i => <div key={i} className="h-12 bg-neutral-50" />)}</div>
                ) : detail?.stages ? (
                  <div className="relative">
                    <div className="absolute left-[15px] top-0 bottom-0 w-px bg-neutral-100" />
                    <div className="space-y-4">
                      {detail.stages.map((stage, i) => (
                        <div key={i} className="flex gap-4 relative">
                          <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center z-10 border-2 border-white ${
                            stage.status === 'completed' ? 'bg-emerald-500' :
                            stage.status === 'in_progress' ? 'bg-amber-400' : 'bg-neutral-100'
                          }`}>
                            {stage.status === 'completed' ? <CheckCircle size={14} className="text-white" /> :
                             stage.status === 'in_progress' ? <CircleDot size={14} className="text-white" /> :
                             <span className="text-[10px] font-black text-neutral-400">{i+1}</span>}
                          </div>
                          <div className="flex-1 pb-1">
                            <div className="flex items-center justify-between">
                              <p className={`text-xs font-black ${stage.status === 'pending' ? 'text-neutral-300' : 'text-blue-800'}`}>{stage.name}</p>
                              {stage.date && <span className="text-[10px] text-neutral-400">{stage.date}</span>}
                            </div>
                            <p className="text-[10px] text-neutral-400 mt-0.5">Owner: {stage.owner}</p>
                            <div className="mt-2 h-1.5 bg-neutral-100 overflow-hidden">
                              <div className={`h-full transition-all duration-700 ${
                                stage.status === 'completed' ? 'w-full bg-emerald-400' :
                                stage.status === 'in_progress' ? 'w-2/3 bg-amber-400 animate-pulse' : 'w-0'
                              }`} />
                            </div>
                          </div>
                        </div>
                      ))}
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
          <div key={label} className="bg-white border border-neutral-100 p-4 flex flex-col gap-1">
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
      <div className="absolute inset-0 bg-blue-900/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[1400px] max-h-[90vh] bg-white shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex-shrink-0 p-5 border-b border-neutral-100 flex items-center justify-between bg-blue-950 text-white">
          <div className="flex items-center gap-3">
            <Scale size={20} className="text-emerald-400" />
            <h2 className="text-xl font-black tracking-wide">Product Comparison</h2>
            <span className="px-2.5 py-1 bg-emerald-900/50 text-emerald-400 text-xs font-bold uppercase tracking-widest border border-emerald-800">
              {items.length} Items Selected
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 bg-blue-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors">
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
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">{item.vendor}</p>
                      <h3 className="text-sm font-black text-blue-800 leading-snug line-clamp-3" title={item.name}>{item.name}</h3>
                      <div className="text-xl font-black text-blue-900 mt-1">{fmt(item.price)}</div>
                      <div className="mt-auto pt-2">
                        <button
                          className={`w-full py-2.5 text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                            basket.find(b => b.id === item.id) ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'
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
                      <span className="font-bold text-blue-800">{item.rating}</span>
                      <span className="text-neutral-400 text-xs">({item.reviews.toLocaleString()})</span>
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
                    <div className="flex items-center gap-2 text-emerald-600">
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
export default function RequesterMarketplace() {
  const { currentUser } = useApp();
  const [basket, setBasket] = useState([]);
  const [showBasket, setShowBasket] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [sort, setSort] = useState('default');
  const [view, setView] = useState('grid');
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeView, setActiveView] = useState('catalog'); // 'catalog' | 'myorders'
  const [prs, setPrs] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    getPrList().then(r => setPrs(r.data)).catch(() => {});
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
  const handleSubmit = (ref) => { setBasket([]); setTimeout(() => setShowBasket(false), 3000); };

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

  return (
    <div className="min-h-screen bg-[#F6F7F9]">

      {/* ─── Header / Welcome Banner ─── */}
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-[1400px] mx-auto px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-center gap-4">

            {/* Left: greeting */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-emerald-500" />
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Procurement Catalog</span>
              </div>
              <h1 className="text-2xl font-black text-blue-900 leading-tight">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
                <span className="text-emerald-600">{currentUser?.name?.split(' ')[0] || 'Alice'}.</span>
              </h1>
              <p className="text-sm text-neutral-500 mt-0.5">Browse pre-approved items and submit your purchase requests.</p>
            </div>

            {/* Right: Stats + Actions */}
            <div className="flex items-center gap-3">
              {/* Quick stat */}
              <div className="hidden md:flex items-center gap-4 px-5 py-3 bg-neutral-50 border border-neutral-100">
                <div className="text-center">
                  <p className="text-xl font-black text-blue-800">{prs.length}</p>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">My PRs</p>
                </div>
                <div className="w-px h-8 bg-neutral-200" />
                <div className="text-center">
                  <p className="text-xl font-black text-emerald-600">{prs.filter(p => p.status === 'Approved').length}</p>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Approved</p>
                </div>
                <div className="w-px h-8 bg-neutral-200" />
                <div className="text-center">
                  <p className="text-xl font-black text-amber-500">{prs.filter(p => !p.status || p.status === 'Pending').length}</p>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Pending</p>
                </div>
              </div>

              {/* My Orders */}
              <button
                onClick={() => setActiveView('myorders')}
                className="flex items-center gap-2 px-4 py-3 border border-neutral-200 hover:border-neutral-400 text-sm font-bold text-neutral-700 transition-all"
              >
                <FileText size={15} /> My PRs
              </button>

              {/* Basket trigger */}
              <button
                onClick={() => setShowBasket(true)}
                className="relative flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black transition-all shadow-lg shadow-emerald-200"
              >
                <Inbox size={15} />
                <span className="hidden md:inline">Request Basket</span>
                {basketCount > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 bg-white text-emerald-700 text-[10px] font-black rounded-full">
                    {basketCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4 flex gap-2">
            <div className="relative flex-1 max-w-xl">
              <Search size={15} className="absolute left-3.5 top-1/2 -tranneutral-y-1/2 text-neutral-400" />
              <input
                ref={searchRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products, vendors, or specifications..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-neutral-200 bg-white outline-none focus:border-emerald-400 text-neutral-700 placeholder-neutral-400 transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -tranneutral-y-1/2 text-neutral-300 hover:text-neutral-600">
                  <X size={13} />
                </button>
              )}
            </div>
            {basketCount > 0 && (
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-sm">
                <TrendingUp size={13} className="text-emerald-600" />
                <span className="font-bold text-emerald-700">{basketCount} items · {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(basketTotal)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Category Tabs ─── */}
      <div className="bg-white border-b border-neutral-100 sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const active = catFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCatFilter(cat.id)}
                  className={`flex items-center gap-2 px-4 py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                    active
                      ? 'border-b-2 text-blue-900'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
                  }`}
                  style={active ? { borderBottomColor: cat.hue, color: cat.text } : {}}
                >
                  <Icon size={13} style={active ? { color: cat.hue } : {}} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="max-w-[1400px] mx-auto px-6 py-5">

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-5" style={{ backgroundColor: currentCat.hue }} />
            <p className="text-sm font-black text-blue-800">{currentCat.label}</p>
            <span className="text-sm text-neutral-400">·</span>
            <p className="text-sm text-neutral-500">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort */}
            <div className="flex items-center gap-1.5 border border-neutral-200 bg-white px-3 py-1.5">
              <SlidersHorizontal size={12} className="text-neutral-400" />
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="text-xs font-bold text-neutral-600 bg-transparent outline-none cursor-pointer"
              >
                <option value="default">Default</option>
                <option value="rating">Top Rated</option>
                <option value="price_asc">Price ↑</option>
                <option value="price_desc">Price ↓</option>
              </select>
            </div>

            {/* View toggle */}
            <div className="flex border border-neutral-200 bg-white">
              <button
                onClick={() => setView('grid')}
                className={`p-2 transition-colors ${view === 'grid' ? 'bg-blue-900 text-white' : 'text-neutral-400 hover:text-neutral-700'}`}
              >
                <LayoutGrid size={13} />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2 transition-colors border-l border-neutral-200 ${view === 'list' ? 'bg-blue-900 text-white' : 'text-neutral-400 hover:text-neutral-700'}`}
              >
                <AlignJustify size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Active label strip */}
        {catFilter !== 'all' && (
          <div
            className="flex items-center gap-3 px-4 py-2.5 mb-4 border-l-2"
            style={{ borderLeftColor: currentCat.hue, backgroundColor: currentCat.bg }}
          >
            <span className="text-xs font-black" style={{ color: currentCat.text }}>{currentCat.label}</span>
            <span className="text-xs" style={{ color: currentCat.text + '99' }}>
              Showing {items.length} pre-approved item{items.length !== 1 ? 's' : ''} in this category
            </span>
            <button
              onClick={() => setCatFilter('all')}
              className="ml-auto text-xs font-bold transition-opacity hover:opacity-70"
              style={{ color: currentCat.text }}
            >
              Clear ×
            </button>
          </div>
        )}

        {/* Products */}
        {items.length === 0 ? (
          <div className="bg-white border border-neutral-100 py-20 flex flex-col items-center gap-4 text-neutral-400">
            <Package size={40} className="opacity-20" />
            <p className="font-bold text-neutral-500">No items found</p>
            <p className="text-sm text-center">Try a different category or search term</p>
            <button onClick={() => { setSearch(''); setCatFilter('all'); }} className="text-sm font-bold text-emerald-600 hover:text-emerald-800 transition-colors">
              Reset filters
            </button>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(item => (
              <CatalogCard
                key={item.id}
                item={item}
                onSelect={setSelectedItem}
                inBasket={!!basket.find(b => b.id === item.id)}
                onQuickAdd={addToBasket}
                onToggleCompare={toggleCompare}
                isCompared={compareList.includes(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <CatalogRow
                key={item.id}
                item={item}
                onSelect={setSelectedItem}
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
      {selectedItem && (
        <ItemDetailPanel
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onRequest={addToBasket}
          inBasket={!!basket.find(b => b.id === selectedItem.id)}
        />
      )}

      {showBasket && (
        <RequestBasket
          basket={basket}
          onClose={() => setShowBasket(false)}
          onUpdateQty={updateQty}
          onRemove={removeItem}
          onSubmit={handleSubmit}
        />
      )}

      {/* ─── Floating Action Pills ─── */}
      {(compareList.length > 0 || (basketCount > 0 && !showBasket)) && (
        <div className="fixed bottom-6 left-1/2 -tranneutral-x-1/2 z-40 flex items-center gap-2 animate-in slide-in-from-bottom duration-300 shadow-2xl">
          {compareList.length > 0 && (
            <button
              onClick={() => setShowCompareModal(true)}
              className="flex items-center gap-3 bg-emerald-600 text-white px-6 py-3 hover:bg-emerald-700 transition-all text-sm font-black shadow-lg"
            >
              <Scale size={16} />
              <span>Compare {compareList.length}</span>
              {compareList.length === 4 && <span className="text-[10px] bg-emerald-800 px-1.5 py-0.5 ml-1 rounded">MAX</span>}
            </button>
          )}

          {basketCount > 0 && !showBasket && (
            <button
              onClick={() => setShowBasket(true)}
              className="flex items-center gap-3 bg-blue-950 text-white px-6 py-3 hover:bg-blue-800 transition-all text-sm font-black shadow-lg"
            >
              <Inbox size={16} className="text-emerald-400" />
              <span>{basketCount} item{basketCount !== 1 ? 's' : ''}</span>
              <div className="w-px h-4 bg-neutral-700" />
              <span className="text-emerald-400">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(basketTotal)}</span>
              <ArrowRight size={14} className="text-neutral-400" />
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
