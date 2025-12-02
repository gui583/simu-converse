
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Conversation, Message } from '../types';
import { ArrowLeft, Send, MoreVertical, Loader2 } from 'lucide-react';
import { getAvatarUrl } from '../services/imageService';

interface ChatViewProps {
  conversation: Conversation;
  participant: UserProfile;
  currentUser: UserProfile;
  onBack: () => void;
  onSendMessage: (text: string) => void;
  visualStyle?: string;
  isTyping: boolean;
}

export const ChatView: React.FC<ChatViewProps> = ({ 
  conversation, 
  participant, 
  currentUser, 
  onBack, 
  onSendMessage, 
  visualStyle = "realistic",
  isTyping
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages, isTyping]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Header */}
      <div className="flex-shrink-0 sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-gray-800 px-4 py-3 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-800 rounded-full transition">
           <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex items-center gap-3 flex-1">
             <img 
                src={getAvatarUrl(participant, visualStyle)}
                alt={participant.displayName}
                className="w-8 h-8 rounded-full object-cover"
             />
             <div>
                <h2 className="text-base font-bold text-white leading-tight">{participant.displayName}</h2>
                <p className="text-xs text-gray-500">@{participant.handle}</p>
             </div>
        </div>
        <button className="p-2 text-gray-500 hover:text-blue-500">
            <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="text-center text-gray-500 text-xs py-4">
              Início da conversa com {participant.displayName}
          </div>

          {conversation.messages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div 
                        className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                            isMe 
                            ? 'bg-blue-500 text-white rounded-br-none' 
                            : 'bg-gray-800 text-white rounded-bl-none'
                        }`}
                      >
                          {msg.content}
                          <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                              {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                      </div>
                  </div>
              );
          })}

          {isTyping && (
             <div className="flex justify-start">
                 <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-1">
                     <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                     <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                     <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                 </div>
             </div>
          )}
          <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-gray-800 p-3 bg-black">
          <div className="bg-gray-900 rounded-xl flex items-center px-4 py-2 gap-2">
              <input 
                 value={inputText}
                 onChange={(e) => setInputText(e.target.value)}
                 onKeyDown={handleKeyDown}
                 placeholder="Escreva uma mensagem..."
                 className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none"
              />
              <button 
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="text-blue-500 disabled:opacity-50 hover:bg-blue-500/10 p-2 rounded-full transition"
              >
                  <Send className="w-5 h-5" />
              </button>
          </div>
      </div>
    </div>
  );
};
