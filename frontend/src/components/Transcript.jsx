import React from 'react';
import ChatMessage from './ChatMessage.jsx';

const Transcript = ({ messages }) => {
  return (
    <div className="flex-1 overflow-y-auto pr-1 space-y-2">
      {messages.map((msg, idx) => (
        <ChatMessage key={idx} from={msg.from} text={msg.text} />
      ))}
    </div>
  );
};

export default Transcript;

