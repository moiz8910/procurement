import React from 'react';
import { Bell } from 'lucide-react';

const NotificationBell = ({ count, onClick }) => {
  return (
    <button className="relative p-2 text-gray-400 hover:text-primary transition-colors" onClick={onClick}>
      <Bell size={24} />
      {count > 0 && (
        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
