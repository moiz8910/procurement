import React from 'react';

const SharedModal = ({ onClose, maxWidth = 'max-w-3xl', children }) => (
  <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
    <div className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200`} onClick={e => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

export default SharedModal;
