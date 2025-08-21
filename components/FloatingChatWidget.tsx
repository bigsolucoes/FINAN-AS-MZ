
import React, { useState, useRef, useEffect } from 'react';
import { useAppData } from '../hooks/useAppData';
import { AIChatMessage as AIChatMessageType } from '../types';
import { SparklesIcon, XIcon, SendHorizonal } from '../constants';
import { Maximize } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { callGeminiApi } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import ChatDisplay from './ChatDisplay';

const FloatingChatWidget: React.FC = () => {
  const { aiChatHistory, addAiChatMessage, debtors, debtorAgreements } = useAppData();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, aiChatHistory]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: AIChatMessageType = {
      id: uuidv4(),
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    addAiChatMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const contextData = { debtors, debtorAgreements };
      const aiResponse = await callGeminiApi(input, contextData);
      
      const aiMessage: AIChatMessageType = {
        id: uuidv4(),
        text: aiResponse.text,
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };
      addAiChatMessage(aiMessage);
    } catch (error) {
       addAiChatMessage({
        id: uuidv4(),
        text: "Desculpe, ocorreu um erro.",
        sender: 'ai',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow border border-slate-200"
        title="Abrir Assistente Financeiro"
      >
        <SparklesIcon size={28} className="text-blue-600" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[360px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-200 animate-modalShow z-50">
      <header className="p-3 border-b flex justify-between items-center bg-slate-50 rounded-t-2xl">
        <h3 className="font-semibold text-slate-800 flex items-center">
          <SparklesIcon size={18} className="mr-2 text-blue-600" />
          Assistente Financeiro
        </h3>
        <div>
            <button onClick={() => { navigate('/ai-assistant'); setIsOpen(false); }} className="p-1 text-slate-500 hover:text-blue-600" title="Expandir"><Maximize size={16}/></button>
            <button onClick={() => setIsOpen(false)} className="p-1 text-slate-500 hover:text-blue-600" title="Fechar"><XIcon size={20}/></button>
        </div>
      </header>
      <div className="flex-grow p-3 overflow-y-auto space-y-3">
        <ChatDisplay messages={aiChatHistory} compact />
         <div ref={messagesEndRef} />
        {isLoading && <div className="flex justify-center py-2"><LoadingSpinner size="sm" /></div>}
      </div>
      <form onSubmit={handleSendMessage} className="p-3 border-t flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Sua pergunta..."
          className="flex-grow p-2 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-600 outline-none"
          disabled={isLoading}
        />
        <button type="submit" className="p-2 bg-blue-600 text-white rounded-lg disabled:opacity-50" disabled={!input.trim() || isLoading}>
          <SendHorizonal size={20} />
        </button>
      </form>
    </div>
  );
};

export default FloatingChatWidget;
