
import React from 'react';
import { AIChatMessage } from '../types';
import AIChatMessageComponent from './AIChatMessage';

interface ChatDisplayProps {
  messages: AIChatMessage[];
  compact?: boolean;
}

const getDayIdentifier = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
}

const formatDateSeparator = (dateStr: string) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    const messageDate = new Date(dateStr);

    if (getDayIdentifier(messageDate) === getDayIdentifier(today)) {
        return "Hoje";
    }
    if (getDayIdentifier(messageDate) === getDayIdentifier(yesterday)) {
        return "Ontem";
    }
    return messageDate.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const ChatDisplay: React.FC<ChatDisplayProps> = ({ messages, compact = false }) => {
    const groupedMessages: React.ReactNode[] = [];
    let lastDateIdentifier: string | null = null;

    messages.forEach((msg, index) => {
        const currentDate = new Date(msg.timestamp);
        const currentDateIdentifier = getDayIdentifier(currentDate);

        if (currentDateIdentifier !== lastDateIdentifier) {
            groupedMessages.push(
                <div key={`date-${msg.id}`} className="text-center my-3">
                    <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        {formatDateSeparator(msg.timestamp)}
                    </span>
                </div>
            );
            lastDateIdentifier = currentDateIdentifier;
        }

        groupedMessages.push(
            compact ? (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-2 rounded-lg text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-800'}`}>
                        {msg.text}
                    </div>
                </div>
            ) : (
                <AIChatMessageComponent key={msg.id} message={msg} />
            )
        );
    });

    return <>{groupedMessages}</>;
};

export default ChatDisplay;
