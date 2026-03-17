import React from 'react';

const MicrophoneButton = ({ listening, onClick, disabled }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative inline-flex h-14 w-14 items-center justify-center rounded-full border border-slate-700 transition-colors ${
        listening
          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40'
          : 'bg-slate-800 text-slate-100 hover:bg-slate-700'
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      <span className="sr-only">
        {listening ? 'Stop listening' : 'Start listening'}
      </span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-7 w-7"
      >
        <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z" />
        <path d="M5 11a1 1 0 0 0-2 0 9 9 0 0 0 8 8.95V22a1 1 0 1 0 2 0v-2.05A9 9 0 0 0 21 11a1 1 0 1 0-2 0 7 7 0 0 1-14 0Z" />
      </svg>
      {listening && (
        <span className="absolute inline-flex h-16 w-16 animate-ping rounded-full bg-rose-500/40" />
      )}
    </button>
  );
};

export default MicrophoneButton;

