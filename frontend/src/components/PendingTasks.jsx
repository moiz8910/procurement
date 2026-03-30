import React, { useState, useEffect } from 'react';
import { ListChecks, User, Calendar, CheckSquare, Activity, AlertTriangle, Square } from 'lucide-react';
import { getCategoryTasks, toggleCategoryTask } from '../api';
import { useApp } from '../context/AppContext';

const PendingTasks = ({ selectedCategory }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedCategory?.id) {
       fetchTasks();
    }
  }, [selectedCategory]);

  const [allTasksModal, setAllTasksModal] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await getCategoryTasks(selectedCategory.id);
      setTasks(res.data || []);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (taskId) => {
    // Optimistic toggle
    const currentTasks = [...tasks];
    setTasks(prev => prev.map(t => t.id === taskId ? {...t, status: t.status === 'RESOLVED' ? 'UNREAD' : 'RESOLVED'} : t));
    
    try {
      await toggleCategoryTask(selectedCategory.id, taskId);
    } catch (err) {
      console.error("Failed to toggle task", err);
      setTasks(currentTasks); // revert on failure
    }
  };

  const renderTask = (t, i) => {
    const isResolved = t.status === 'RESOLVED';
    return (
      <div 
        key={t.id || i} 
        className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${isResolved ? 'bg-slate-50 border-transparent opacity-60' : 'bg-white border-slate-200 hover:shadow-md hover:border-indigo-200'}`} 
        onClick={() => handleToggle(t.id)}
      >
        <div className="mt-0.5 shrink-0 text-indigo-500">
          {isResolved ? <CheckSquare size={18} className="text-emerald-500" /> : <Square size={18} className="text-slate-300 hover:text-indigo-400" />}
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium leading-relaxed mb-2 ${isResolved ? 'line-through text-slate-400' : 'text-slate-700'}`}>{t.desc}</p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <User size={12} className="text-slate-400" /> {t.assigned}
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <Calendar size={12} className="text-slate-400" /> {t.due}
            </span>
            <span className={`ml-auto text-xs px-2.5 py-0.5 rounded font-medium ${
              t.status === 'In Progress' ? 'bg-blue-50 text-blue-700' :
              t.status === 'Pending' ? 'bg-amber-50 text-amber-700' :
              'bg-slate-100 text-slate-500'
            }`}>
              {t.status}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-48">
        <Activity size={24} className="animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="p-4">
      {tasks.length > 0 ? (
        <div className="space-y-3">
          {tasks.slice(0, 3).map((t, i) => renderTask(t, i))}
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
           <AlertTriangle size={24} className="text-slate-300" />
           <span className="text-sm font-bold">No Pending Tasks</span>
        </div>
      )}
      
      {tasks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100 text-center">
          <button 
            onClick={() => setAllTasksModal(true)}
            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            View All Tasks ({tasks.length})
          </button>
        </div>
      )}

      {/* Expanded Tasks Modal */}
      {allTasksModal && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold flex items-center gap-2"><ListChecks className="text-indigo-600" size={24}/> All Pending Actions</h3>
               <button onClick={() => setAllTasksModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar">
               {tasks.map((t, i) => renderTask(t, i))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button className="px-6 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 text-xs" onClick={() => setAllTasksModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingTasks;
