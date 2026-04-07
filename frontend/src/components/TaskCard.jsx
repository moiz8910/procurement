import React from 'react';
import { CheckCircle, Clock, AlertCircle, ArrowRight, User, Tag } from 'lucide-react';

const TaskCard = ({ task, onMarkRead, onResolve }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'border-l-red-500 bg-red-50/10';
      case 'MEDIUM': return 'border-l-yellow-500 bg-yellow-50/10';
      default: return 'border-l-gray-300';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'APPROVAL': return <CheckCircle size={16} className="text-emerald-500" />;
      case 'ALERT': return <AlertCircle size={16} className="text-red-500" />;
      default: return <Tag size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className={`card p-5 border-l-4 mb-4 transition-all hover:shadow-md ${getPriorityColor(task.priority)}`}>
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <div className="mt-1">
            {getTypeIcon(task.type)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                task.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 
                task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {task.priority} Priority
              </span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">{task.type}</span>
            </div>
            <h4 className={`text-base mb-2 ${task.status === 'UNREAD' ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
              {task.message}
            </h4>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>Created {new Date(task.created_at).toLocaleDateString()}</span>
              </div>
              {task.due_date && (
                <div className={`flex items-center gap-1 ${new Date(task.due_date) < new Date() ? 'text-red-600 font-bold' : ''}`}>
                  <AlertCircle size={14} />
                  <span>Due {new Date(task.due_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {task.status === 'UNREAD' && (
            <button 
              onClick={() => onMarkRead(task.id)}
              className="btn-secondary text-xs px-3 py-1.5 hover:bg-gray-200"
            >
              Mark Read
            </button>
          )}
          <button 
            onClick={() => onResolve(task.id)}
            className="bg-primary text-white text-xs px-4 py-1.5 rounded-lg font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            Resolve <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
