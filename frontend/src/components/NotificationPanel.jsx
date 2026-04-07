import React from 'react';
import { Clock, CheckCircle, AlertCircle, Eye } from 'lucide-react';

const NotificationPanel = ({ notifications, onMarkRead, onResolve, onClose }) => {
  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-slide-down">
      <div className="p-4 border-bottom flex justify-between items-center bg-gray-50/50">
        <h3 className="font-bold text-gray-800">Recent Tasks</h3>
        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
          {notifications.filter(n => n.status === 'UNREAD').length} NEW
        </span>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <CheckCircle size={40} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm">All caught up!</p>
          </div>
        ) : (
          notifications.slice(0, 8).map((n) => (
            <div 
              key={n.id} 
              className={`p-4 border-bottom hover:bg-gray-50 transition-colors cursor-pointer group ${n.status === 'UNREAD' ? 'bg-emerald-50/30' : ''}`}
            >
              <div className="flex gap-3">
                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                  n.priority === 'HIGH' ? 'bg-red-500' : 
                  n.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-gray-300'
                }`}></div>
                <div className="flex-1">
                  <p className={`text-sm leading-tight mb-1 ${n.status === 'UNREAD' ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                    {n.message}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <Clock size={10} />
                    <span>{new Date(n.created_at).toLocaleDateString()}</span>
                    <span className="mx-1">•</span>
                    <span className="uppercase font-bold">{n.type}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {n.status === 'UNREAD' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onMarkRead(n.id); }}
                      className="p-1 hover:bg-white rounded border border-gray-200 text-gray-400 hover:text-primary"
                      title="Mark as Read"
                    >
                      <Eye size={14} />
                    </button>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); onResolve(n.id); }}
                    className="p-1 hover:bg-white rounded border border-gray-200 text-gray-400 hover:text-green-500"
                    title="Resolve"
                  >
                    <CheckCircle size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-3 bg-gray-50 text-center">
        <button 
          className="text-xs font-bold text-primary hover:underline"
          onClick={onClose}
        >
          View All Tasks
        </button>
      </div>
    </div>
  );
};

export default NotificationPanel;
