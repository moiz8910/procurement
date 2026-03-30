import React, { useState, useEffect } from 'react';
import { getNotifications, getTaskSummary, markNotificationRead, resolveNotification } from '../api';
import TaskCard from '../components/TaskCard';
import { AlertCircle, Clock, CheckCircle, Filter, Search } from 'lucide-react';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState({ total: 0, high_priority: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('[UI] Fetching tasks and summary...');
      const [tasksRes, summaryRes] = await Promise.all([
        getNotifications(),
        getTaskSummary()
      ]);
      setTasks(tasksRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('[API] Error fetching task data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    fetchData();
  };

  const handleResolve = async (id) => {
    await resolveNotification(id);
    fetchData();
  };

  const filteredTasks = tasks.filter(t => {
    const statusMatch = filter === 'ALL' || t.status === filter;
    const priorityMatch = priorityFilter === 'ALL' || t.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  if (loading && tasks.length === 0) return <div className="loading-bar">Loading Your Task Queue...</div>;

  return (
    <div className="space-y-6">
      {/* Task Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 bg-white border-l-4 border-l-primary">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Tasks</h4>
            <Filter size={16} className="text-gray-300" />
          </div>
          <p className="text-3xl font-black text-gray-900">{summary.total}</p>
          <span className="text-[10px] text-gray-400 font-bold uppercase mt-1 inline-block text-primary bg-primary/10 px-2 py-0.5 rounded">Action Required</span>
        </div>
        
        <div className="card p-6 bg-white border-l-4 border-l-red-500">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">High Priority</h4>
            <AlertCircle size={16} className="text-red-300" />
          </div>
          <p className="text-3xl font-black text-red-600">{summary.high_priority}</p>
          <span className="text-[10px] text-red-400 font-bold uppercase mt-1 inline-block bg-red-50 px-2 py-0.5 rounded">Immediate Focus</span>
        </div>

        <div className="card p-6 bg-white border-l-4 border-l-orange-500">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Overdue</h4>
            <Clock size={16} className="text-orange-300" />
          </div>
          <p className="text-3xl font-black text-orange-600">{summary.overdue}</p>
          <span className="text-[10px] text-orange-400 font-bold uppercase mt-1 inline-block bg-orange-50 px-2 py-0.5 rounded">SLA Breached</span>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            <span className="text-xs font-bold text-gray-500">Status:</span>
            <select 
              className="bg-transparent text-sm font-bold outline-none cursor-pointer"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="UNREAD">Unread</option>
              <option value="READ">Read</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            <span className="text-xs font-bold text-gray-500">Priority:</span>
            <select 
              className="bg-transparent text-sm font-bold outline-none cursor-pointer"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Only</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
        
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
          />
        </div>
      </div>

      <div className="task-list">
        {filteredTasks.length === 0 ? (
          <div className="card p-20 text-center text-gray-300 bg-white border-dashed border-2">
            <CheckCircle size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-bold">No tasks matching your filters</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onMarkRead={handleMarkRead} 
              onResolve={handleResolve}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TasksPage;
