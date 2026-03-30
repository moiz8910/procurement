import React, { useState, useEffect, useRef } from 'react';
import { 
  getCategories, 
  getCategoryStrategy, 
  generateCategoryInsights,
  getSpendAnalysis,
  analyzeSpendInsights,
  copilotQuery,
  copilotEditCategoryStrategy,
  summarizeCategoryStrategy
} from '../api';
import { useApp } from '../context/AppContext';
import { 
  BrainCircuit, Calendar, User as UserIcon, Upload, FileText,   
  TrendingUp, MapPin, Zap, AlertTriangle, Sparkles, PieChartIcon, Key, Edit3
} from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import MarketIntelligence from '../components/MarketIntelligence';
import PendingTasks from '../components/PendingTasks';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

const CategoryModule = () => {
  const { currentUser, updateFilters } = useApp();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const [strategy, setStrategy] = useState(null);
  const [insights, setInsights] = useState(null);
  const [spendData, setSpendData] = useState(null);
  const [analyzingSpend, setAnalyzingSpend] = useState(false);
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [copilotEditPrompt, setCopilotEditPrompt] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(false);

  const [copilotInput, setCopilotInput] = useState('');
  const [copilotReading, setCopilotReading] = useState(false);
  const [copilotResponse, setCopilotResponse] = useState('');
  
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [summaryContent, setSummaryContent] = useState("");
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [savingComment, setSavingComment] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (currentUser?.roleType === 'REQUESTER') return;
    getCategories().then(res => {
      setCategories(res.data);
      if (res.data.length > 0) {
        setSelectedCategory(res.data[0]);
        updateFilters({ categoryId: res.data[0].id });
      }
    });
  }, [currentUser]);

  useEffect(() => {
    if (selectedCategory) loadCategoryData(selectedCategory.id);
  }, [selectedCategory]);

  const loadCategoryData = async (catId) => {
    try {
      const [stratRes, spendRes] = await Promise.all([
        getCategoryStrategy(catId), getSpendAnalysis(catId)
      ]);
      setStrategy(stratRes.data);
      setSpendData(spendRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAnalyzeSpend = async () => {
    if (!selectedCategory) return;
    setAnalyzingSpend(true);
    try {
      const res = await analyzeSpendInsights(selectedCategory.id);
      setSpendData(prev => ({...prev, aiInsights: res.data.insights}));
    } catch (err) { console.error(err); } 
    finally { setAnalyzingSpend(false); }
  };

  const askCopilot = async () => {
    if(!copilotInput.trim()) return;
    setCopilotReading(true);
    try {
      const res = await copilotQuery(copilotInput, { context: 'Category', category: selectedCategory?.name });
      setCopilotResponse(res.data.text);
    } catch(err) {
      setCopilotResponse("Copilot is experiencing heavy load. Please try again.");
    } finally {
      setCopilotReading(false);
      setCopilotInput('');
    }
  };

  const handleCopilotEditClick = async () => {
    if (!selectedCategory || !copilotEditPrompt.trim()) return;
    setLoadingEdit(true);
    try {
      await copilotEditCategoryStrategy(selectedCategory.id, copilotEditPrompt);
      setEditModalOpen(false);
      setCopilotEditPrompt("");
      loadCategoryData(selectedCategory.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleReadSummary = async () => {
    if(!selectedCategory) return;
    try {
      const res = await summarizeCategoryStrategy(selectedCategory.id);
      setSummaryContent(res.data.summary);
      setSummaryModalOpen(true);
    } catch(err) { console.error(err); }
  };

  const handleGenerateInsights = async () => {
    if(!selectedCategory) return;
    setInsightsLoading(true);
    try {
      const res = await generateCategoryInsights(selectedCategory.id);
      setInsights(res.data);
    } catch(err) { console.error(err); }
    finally { setInsightsLoading(false); }
  };

  const handleSaveComment = async () => {
    if(!commentInput.trim()) return;
    setSavingComment(true);
    // Simulate API call to save comment
    setTimeout(() => {
      setSavingComment(false);
      setCommentModalOpen(false);
      setCommentInput("");
    }, 1000);
  };

  if (currentUser?.roleType === 'REQUESTER') {
    return (
      <div className="flex flex-col items-center justify-center p-20 mt-10 max-w-2xl mx-auto text-center border border-rose-100 bg-rose-50 rounded-3xl">
        <Key className="text-rose-500 mb-4 h-16 w-16" />
        <h3 className="text-2xl font-black text-rose-700 mb-2">Access Restricted</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6 flex flex-col max-w-[1600px] mx-auto px-4 py-6">
      <input type="file" ref={fileInputRef} className="hidden" />

      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Category Module</h1>
        </div>
        <select 
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold text-blue-600 outline-none cursor-pointer"
          value={selectedCategory?.id || ''}
          onChange={(e) => {
            const cat = categories.find(c => c.id === parseInt(e.target.value));
            setSelectedCategory(cat);
            updateFilters({ categoryId: cat.id });
          }}
        >
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Grid Layout Start */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left Column (Span 2) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Strategy Workbook */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="border-b border-slate-100 p-6 flex flex-wrap justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><FileText size={20} /></div>
                <h2 className="text-lg font-bold text-slate-800 transition-colors">Category Strategy Workbook</h2>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 font-bold">
                <span className="flex items-center gap-1"><Calendar size={14}/> Next Review: {strategy?.next_review_date}</span>
                <span className="flex items-center gap-1"><UserIcon size={14}/> Owner: {strategy?.owner}</span>
              </div>
            </div>
            
            <div className="p-6">
              <ul className="space-y-2 mb-6 ml-1">
                {strategy?.content_blocks?.slice(0,4)?.map((block, i) => (
                  <li key={i} className="text-sm font-medium text-slate-600 flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span> <span>{block}</span>
                  </li>
                ))}
              </ul>
              
              <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
                <button onClick={handleReadSummary} className="px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition-colors leading-none">Read Summary</button>
                <button onClick={() => setCommentModalOpen(true)} className="px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition-colors leading-none">Add Comment</button>
                <button onClick={handleGenerateInsights} disabled={insightsLoading} className="px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition-colors leading-none disabled:opacity-50">
                  {insightsLoading ? 'Generating...' : 'Generate Insights'}
                </button>
                
                <button onClick={() => setEditModalOpen(true)} className="px-4 py-2 bg-blue-50 border border-blue-100 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors ml-auto flex items-center gap-2 leading-none">
                   <Edit3 size={14} /> Edit content with the help of copilot
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-slate-800 border border-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 leading-none">
                  <Upload size={14}/> Upload
                </button>
              </div>
            </div>
          </div>

          {/* Spend Breakdown Analysis */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="border-b border-slate-100 p-6 flex flex-col md:flex-row justify-between md:items-center bg-slate-50 gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><PieChartIcon size={20} /></div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Spend Breakdown Analysis</h2>
                </div>
              </div>
              <button onClick={handleAnalyzeSpend} disabled={analyzingSpend} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 leading-none">
                {analyzingSpend ? <Activity size={14} className="animate-spin" /> : <Zap size={14} />} Analyze
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Category Breakdown (Pie) */}
              <div className="md:col-span-5 space-y-4 border-r border-slate-100 pr-4">
                  <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Spend Categories</h3>
                  <div className="h-40 flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={spendData?.breakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                          {(spendData?.breakdown || []).map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4">
                      {(spendData?.breakdown || []).map((b, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <span className="font-medium text-slate-700">{b.name}</span>
                          <span className="font-bold text-slate-900">{b.value}%</span>
                        </div>
                      ))}
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">₹ {spendData?.total_spend} Cr</h3>
                    <p className="text-sm font-bold text-slate-500">Last 3 months <span className="text-emerald-500">{spendData?.total_trend}</span></p>
                  </div>
              </div>

              {/* Insights, Trend, Location */}
              <div className="md:col-span-7 flex flex-col gap-6">
                 <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-2">Key insight:</h3>
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                      {spendData?.aiInsights ? (
                        <ul className="space-y-1">
                          {spendData.aiInsights.map((insight, idx) => (
                            <li key={idx} className="text-sm text-blue-900 font-medium flex items-start gap-2">
                              <span className="text-blue-500 mt-1">•</span> <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-blue-900 font-medium italic">Top 3–4 insights from spend analysis will appear here after clicking Analyze.</p>
                      )}
                    </div>
                 </div>

                 {/* Trend & Location Flex Row */}
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 mb-2">Spend Trend</h3>
                      <p className="text-xs font-bold text-slate-500 mb-2">Last 6 months <span className="text-emerald-500 bg-emerald-50 px-1 py-0.5 rounded">+8%</span></p>
                      <div className="h-32 bg-slate-50 border border-slate-100 rounded-lg">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={spendData?.trend || []}>
                              <Line type="monotone" dataKey="spend" stroke="#3b82f6" strokeWidth={3} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-800 mb-4">Spend by Location</h3>
                      <div className="space-y-3">
                         {spendData?.location?.map((loc, i) => (
                           <div key={i} className="flex items-center justify-between text-sm">
                             <span className="font-medium text-slate-700">{loc.location}</span>
                             <span className="font-bold text-slate-900">{loc.spend}%</span>
                           </div>
                         ))}
                      </div>
                    </div>
                 </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column (Span 1) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="border-b border-slate-100 p-5 bg-slate-50 flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><TrendingUp size={16} /></div>
              <h2 className="text-sm font-bold text-slate-800">Market Intelligence</h2>
            </div>
            <div className="p-4 overflow-y-auto" style={{ maxHeight: '350px' }}>
              <MarketIntelligence />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
             <div className="border-b border-slate-100 p-5 bg-slate-50 flex items-center gap-3">
              <div className="bg-rose-100 p-2 rounded-lg text-rose-600"><AlertTriangle size={16} /></div>
              <h2 className="text-sm font-bold text-slate-800">Pending Tasks</h2>
            </div>
            <div className="p-1">
              <PendingTasks selectedCategory={selectedCategory}/>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl shadow-sm overflow-hidden flex flex-col group border border-slate-800">
             <div className="p-4 flex flex-col h-full bg-slate-900">
                <div className="flex items-center gap-3 mb-4 text-white">
                  <BrainCircuit size={20} className="text-blue-400" />
                  <h2 className="text-sm font-bold tracking-widest uppercase text-white">Copilot</h2>
                </div>
                
                {copilotResponse ? (
                  <div className="bg-slate-800 rounded-xl p-4 mb-4 text-white text-sm font-medium leading-relaxed border border-slate-700">
                    {copilotResponse}
                  </div>
                ) : (
                  <div className="bg-slate-800 rounded-xl p-4 mb-4 text-white text-sm font-medium leading-relaxed border border-slate-700">
                    Always on Copilot support
                  </div>
                )}
                
                <div className="relative mt-auto">
                    <input 
                      type="text" 
                      placeholder="Message..." 
                      className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-sm focus:border-blue-500 transition-all outline-none" 
                      value={copilotInput}
                      onChange={(e) => setCopilotInput(e.target.value)}
                      onKeyDown={(e) => { if(e.key === 'Enter') askCopilot() }}
                      disabled={copilotReading}
                    />
                    <button 
                      className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
                      onClick={askCopilot}
                      disabled={copilotReading || !copilotInput.trim()}
                    >
                      {copilotReading ? <Activity size={16} className="animate-spin" /> : <Zap size={16} />}
                    </button>
                </div>
             </div>
           </div>

        </div>

      </div>
      {/* Modals Summary/Edit */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2"><Sparkles className="text-blue-600" size={18}/> Copilot Strategy Edit</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-600"><Key size={20}/></button>
            </div>
            <textarea
              className="w-full h-32 p-3 border border-slate-200 rounded-xl text-sm mb-4 outline-none focus:border-blue-500"
              placeholder="E.g. Add a focus on dual sourcing..."
              value={copilotEditPrompt}
              onChange={(e) => setCopilotEditPrompt(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 text-slate-600 font-medium text-sm" onClick={() => setEditModalOpen(false)}>Cancel</button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
                onClick={handleCopilotEditClick} disabled={loadingEdit || !copilotEditPrompt.trim()}
              >
                {loadingEdit ? 'Applying...' : 'Apply Comments'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Modal */}
      {summaryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><FileText className="text-blue-600" size={18}/> Strategy Summary</h3>
            <div className="text-sm text-slate-600 leading-relaxed mb-6 max-h-96 overflow-y-auto">
              {summaryContent}
            </div>
            <div className="flex justify-end">
              <button className="px-6 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 text-xs" onClick={() => setSummaryModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {commentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Edit3 className="text-blue-600" size={18}/> Add Category Comment</h3>
            <textarea
              className="w-full h-32 p-3 border border-slate-200 rounded-xl text-sm mb-4 outline-none focus:border-blue-500"
              placeholder="Enter your observations or comments..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 text-slate-600 font-medium text-sm" onClick={() => setCommentModalOpen(false)}>Cancel</button>
              <button 
                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 text-xs disabled:opacity-50"
                onClick={handleSaveComment} disabled={savingComment || !commentInput.trim()}
              >
                {savingComment ? 'Saving...' : 'Save Comment'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CategoryModule;
