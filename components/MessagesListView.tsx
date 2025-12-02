
import React, { useState } from 'react';
import { Conversation, UserProfile } from '../types';
import { MailPlus, ArrowLeft, ChevronRight, Search, BadgeCheck } from 'lucide-react';
import { getAvatarUrl } from '../services/imageService';

interface MessagesListViewProps {
  conversations: Conversation[];
  profiles: UserProfile[];
  onSelectConversation: (conversationId: string) => void;
  onStartChat: (userId: string) => void;
  onBack: () => void; // Usually back to feed on mobile
  visualStyle?: string;
}

export const MessagesListView: React.FC<MessagesListViewProps> = ({ 
  conversations, 
  profiles, 
  onSelectConversation, 
  onStartChat,
  onBack,
  visualStyle = "realistic"
}) => {
  const [isSelectingUser, setIsSelectingUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sort conversations by last message
  const sortedConversations = [...conversations].sort((a, b) => 
     new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime()
  );

  // Filter profiles for selection (exclude current user and already chatting users if desired, but here we just exclude USER)
  const availableProfiles = profiles
    .filter(p => p.type !== 'USER')
    .filter(p => 
        p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.handle.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (isSelectingUser) {
    return (
        <div>
            <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-gray-800 px-4 py-3 flex items-center gap-4">
                <button onClick={() => setIsSelectingUser(false)} className="p-2 hover:bg-gray-800 rounded-full transition">
                    <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <h2 className="text-xl font-bold text-white">Nova Mensagem</h2>
            </div>

            <div className="p-4 border-b border-gray-800">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full bg-gray-900 border border-transparent rounded-full py-2 pl-12 pr-3 text-white focus:outline-none focus:bg-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="Pesquisar pessoas"
                        autoFocus
                    />
                </div>
            </div>

            <div className="overflow-y-auto pb-20">
                {availableProfiles.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        Nenhuma pessoa encontrada.
                    </div>
                ) : (
                    availableProfiles.map(profile => (
                        <div 
                            key={profile.id}
                            onClick={() => onStartChat(profile.id)}
                            className="p-4 hover:bg-gray-900 transition cursor-pointer flex items-center justify-between border-b border-gray-800"
                        >
                            <div className="flex items-center gap-3">
                                <img 
                                    src={getAvatarUrl(profile, visualStyle)}
                                    alt={profile.displayName}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <div className="flex items-center gap-1">
                                        <span className="font-bold text-white">{profile.displayName}</span>
                                        {profile.isVerified && <BadgeCheck className="w-4 h-4 text-blue-500 fill-current" />}
                                    </div>
                                    <div className="text-gray-500 text-sm">@{profile.handle}</div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
  }

  return (
    <div>
      <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
         <div className="flex items-center gap-4">
             {/* Only show back button on small screens conceptually, or if needed */}
             <h2 className="text-xl font-bold text-white">Mensagens</h2>
         </div>
         <button 
            onClick={() => setIsSelectingUser(true)}
            className="p-2 hover:bg-gray-800 rounded-full transition" 
            title="Nova Mensagem"
         >
             <MailPlus className="w-5 h-5 text-white" />
         </button>
      </div>

      <div className="pb-20">
         {sortedConversations.length === 0 ? (
             <div className="p-8 text-center text-gray-500">
                 <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center">
                        <MailPlus className="w-8 h-8 text-gray-500" />
                    </div>
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2">Boas-vindas à sua caixa de entrada!</h3>
                 <p className="mb-4">Envie mensagens privadas para compartilhar Tweets e muito mais com outras pessoas.</p>
                 <button 
                    onClick={() => setIsSelectingUser(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition"
                 >
                     Escrever uma mensagem
                 </button>
             </div>
         ) : (
             sortedConversations.map(conv => {
                 const participant = profiles.find(p => p.id === conv.participantId);
                 if (!participant) return null;
                 
                 const lastMsg = conv.messages[conv.messages.length - 1];

                 return (
                     <div 
                        key={conv.id} 
                        onClick={() => onSelectConversation(conv.id)}
                        className="p-4 hover:bg-gray-900 transition cursor-pointer flex gap-3 border-b border-gray-800 relative"
                     >
                         <img 
                            src={getAvatarUrl(participant, visualStyle)}
                            alt={participant.displayName}
                            className="w-12 h-12 rounded-full object-cover"
                         />
                         <div className="flex-1 min-w-0">
                             <div className="flex justify-between items-baseline">
                                 <div className="flex items-center gap-1 truncate">
                                     <span className="font-bold text-white text-[15px]">{participant.displayName}</span>
                                     <span className="text-gray-500 text-sm">@{participant.handle}</span>
                                 </div>
                                 <span className="text-gray-500 text-xs">
                                     {new Date(lastMsg.timestamp).toLocaleDateString()}
                                 </span>
                             </div>
                             <p className={`truncate text-sm mt-0.5 ${conv.unreadCount > 0 ? 'text-white font-bold' : 'text-gray-500'}`}>
                                 {lastMsg.content}
                             </p>
                         </div>
                         {conv.unreadCount > 0 && (
                             <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                         )}
                     </div>
                 );
             })
         )}
      </div>
    </div>
  );
};
