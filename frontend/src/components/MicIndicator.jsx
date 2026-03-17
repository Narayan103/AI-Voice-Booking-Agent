import React from 'react';

const MicIndicator = ({ active }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-10 w-10 flex items-center justify-center rounded-full bg-slate-900 border border-slate-700">
        {active && (
          <span className="absolute inline-flex h-10 w-10 animate-ping rounded-full bg-emerald-400/40" />
        )}
        <span className="relative inline-flex h-6 w-6 rounded-full bg-emerald-400 shadow-lg shadow-emerald-500/40" />
      </div>
      <div className="flex flex-col text-xs">
        <span className="font-medium text-slate-100">
          {active ? 'Listening...' : 'Mic idle'}
        </span>
        <span className="text-slate-400">
          {active ? 'You can speak now' : 'Tap Start Call to begin'}
        </span>
      </div>
    </div>
  );
};

export default MicIndicator;

