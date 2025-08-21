
import React, { useState, useRef, useEffect } from 'react';
import { useAppData } from '../hooks/useAppData';
import { AIChatMessage as AIChatMessageType, GroundingChunk } from '../types';
import { SparklesIcon, SendHorizonal } from '../constants';
import { callGeminiApi } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';
import LoadingSpinner from '../components/LoadingSpinner';
import ChatDisplay from '../components/ChatDisplay';

const AIAssistantPage: React.FC = () => {
  const { debtors, debtorAgreements, loading: appDataLoading, aiChatHistory, addAiChatMessage } = useAppData();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [aiChatHistory]);

  useEffect(() => {
    if (aiChatHistory.length === 0) {
      addAiChatMessage({
        id: uuidv4(),
        text: "Olá! Sou seu assistente financeiro. Como posso ajudar com seus acordos, devedores e recebimentos hoje?",
        sender: 'ai',
        timestamp: new Date().toISOString()
      });
    }
  }, [aiChatHistory.length, addAiChatMessage]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
      
      let responseText = aiResponse.text;
      const groundingMetadata = aiResponse.candidates?.[0]?.groundingMetadata;
      
      if (groundingMetadata?.groundingChunks && groundingMetadata.groundingChunks.length > 0) {
        responseText += "\n\nFontes:\n";
        groundingMetadata.groundingChunks.forEach((chunk: GroundingChunk, index: number) => {
          const sourceUri = chunk.web?.uri || chunk.retrievedContext?.uri;
          const sourceTitle = chunk.web?.title || chunk.retrievedContext?.title || sourceUri;
          if (sourceUri) {
            responseText += `${index + 1}. [${sourceTitle}](${sourceUri})\n`;
          }
        });
      }

      const aiMessage: AIChatMessageType = {
        id: uuidv4(),
        text: responseText,
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };
      addAiChatMessage(aiMessage);
    } catch (error) {
      console.error("Error calling AI API:", error);
      const errorMessage: AIChatMessageType = {
        id: uuidv4(),
        text: "Desculpe, não consegui processar sua solicitação. Tente novamente mais tarde.",
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };
      addAiChatMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const exampleQuestions = [
    "Qual o valor total a receber de todos os acordos ativos?",
    "Liste os devedores inadimplentes.",
    "Resuma o acordo com a empresa Infratech Ltda.",
    "Quais parcelas vencem no próximo mês?",
  ];

  if (appDataLoading) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
  }

  return (
    <div className="flex flex-col h-full bg-white shadow-xl rounded-xl overflow-hidden">
      <header className="p-4 border-b border-slate-200 bg-slate-50">
        <h1 className="text-xl font-semibold text-slate-800 flex items-center">
          <SparklesIcon size={22} /> <span className="ml-2">Assistente Financeiro</span>
        </h1>
      </header>

      <div className="flex-grow p-4 overflow-y-auto space-y-2">
        <ChatDisplay messages={aiChatHistory} />
        <div ref={messagesEndRef} />
        {isLoading && <div className="flex justify-center py-2"><LoadingSpinner size="sm" /></div>}
      </div>

      <div className="p-2 border-t border-slate-200 bg-slate-50">
         <div className="mb-2 px-2 flex flex-wrap gap-2">
            {exampleQuestions.map((q, i) => (
              <button 
                key={i} 
                onClick={() => setInput(q)}
                className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-600 px-2 py-1 rounded-full transition-colors"
                disabled={isLoading}
              >
                {q}
              </button>
            ))}
          </div>
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2 p-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte algo ao assistente..."
            className="flex-grow p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-shadow"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-3 rounded-lg shadow hover:bg-opacity-90 transition-colors disabled:opacity-50"
            disabled={isLoading || !input.trim()}
          >
            <SendHorizonal size={24} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistantPage;
