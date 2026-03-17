import React from 'react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const ChatMessage = ({ from, text }) => {
  const isAgent = from === 'agent';

  return (
    <div
      className={classNames(
        'flex w-full mb-3',
        isAgent ? 'justify-start' : 'justify-end'
      )}
    >
      <div
        className={classNames(
          'max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-lg',
          isAgent
            ? 'bg-slate-800 text-slate-50 rounded-bl-sm'
            : 'bg-indigo-600 text-white rounded-br-sm'
        )}
      >
        <p className="whitespace-pre-line">{text}</p>
      </div>
    </div>
  );
};

export default ChatMessage;

