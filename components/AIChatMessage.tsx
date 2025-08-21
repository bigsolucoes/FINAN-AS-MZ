
import React from 'react';
import { AIChatMessage as AIChatMessageType } from '../types';
import { SparklesIcon } from '../constants'; 

const AIChatMessage: React.FC<{ message: AIChatMessageType }> = ({ message }) => {
  const isUser = message.sender === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-3/4 p-3 rounded-lg shadow ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-slate-200 text-slate-800'
        }`}
      >
        {!isUser && (
          <div className="flex items-center mb-1 text-xs text-slate-500">
            <SparklesIcon size={16} className="mr-1" /> {/* Ensure size is appropriate */}
            <span className="font-semibold">Assistente AI</span>
          </div>
        )}
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        <div className={`text-xs mt-1 ${isUser ? 'text-blue-200 text-right' : 'text-slate-400 text-left'}`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default AIChatMessage;