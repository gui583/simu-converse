
import React, { useState } from 'react';
import { Search, MoreHorizontal, BadgeCheck } from 'lucide-react';
import { UserProfile } from '../types';
import { getAvatarUrl } from '../services/imageService';

interface TrendsSidebarProps {
  trends: string[];
  suggestedUsers: UserProfile[];
  onSearch: (query: string) => void;
  visualStyle?: string;
  currentUser?: UserProfile | null;
  onToggleFollow?: (userId: string) => void;
}

export const TrendsSidebar: React.FC<TrendsSidebarProps> = ({ 
  trends, 
  suggestedUsers, 
  onSearch, 
  visualStyle = "realistic",
  currentUser,
  onToggleFollow
}) => {
  const [query, setQuery] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch(query);
    }
  };

  const isFollowing = (userId: string) => {
     return (currentUser?.followingIds || []).includes(userId);
  };

  return (
    <div className="sticky top-0 h-screen overflow-y-auto no-scrollbar pb-10">
      {/* Search */}
      <div className="sticky top-0 bg-black z-10 py-1 mb-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="block w-full bg-gray-900 border border-transparent rounded-full py-3 pl-12 pr-3 text-sm placeholder-gray-500 text-white focus:outline-none focus:bg-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            placeholder="Buscar no SimuVerse"
          />
        </div>
      </div>

      {/* Trends */}
      <div className="bg-gray-900 rounded-2xl mb-4 overflow-hidden">
        <h2 className="text-xl font-bold px-4 py-3 text-white">O que está acontecendo</h2>
        
        {trends.map((trend, i) => (
          <div key={i} className="px-4 py-3 hover:bg-gray-800 transition cursor-pointer relative" onClick={() => onSearch(trend)}>
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-xs text-gray-500">Tendência no Universo</p>
                  <p className="font-bold text-white text-[15px]">{trend}</p>
                  <p className="text-xs text-gray-500">{Math.floor(Math.random() * 50)}K posts</p>
               </div>
               <button className="text-gray-500 hover:text-blue-500">
                 <MoreHorizontal className="w-4 h-4" />
               </button>
            </div>
          </div>
        ))}

        <div className="px-4 py-3 hover:bg-gray-800 transition cursor-pointer text-blue-500 text-sm">
          Mostrar mais
        </div>
      </div>

      {/* Who to follow */}
      <div className="bg-gray-900 rounded-2xl overflow-hidden">
        <h2 className="text-xl font-bold px-4 py-3 text-white">Quem seguir</h2>
        
        {suggestedUsers.slice(0, 4).map((user) => {
          const following = isFollowing(user.id);
          return (
            <div key={user.id} className="px-4 py-3 hover:bg-gray-800 transition cursor-pointer flex items-center justify-between">
               <div className="flex items-center gap-3">
                   <img 
                      src={getAvatarUrl(user, visualStyle)}
                      alt={user.displayName}
                      className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                           <span className="font-bold text-white text-sm hover:underline truncate max-w-[100px]">{user.displayName}</span>
                           {user.isVerified && <BadgeCheck className="w-4 h-4 text-blue-500 fill-current" />}
                      </div>
                      <span className="text-gray-500 text-sm">@{user.handle}</span>
                  </div>
               </div>
               <button 
                  onClick={() => onToggleFollow && onToggleFollow(user.id)}
                  className={`
                    font-bold px-4 py-1.5 rounded-full text-sm transition
                    ${following 
                        ? 'bg-transparent border border-gray-600 text-white hover:border-red-600 hover:text-red-600 hover:bg-red-600/10' 
                        : 'bg-white hover:bg-gray-200 text-black'
                    }
                  `}
               >
                  {following ? 'Seguindo' : 'Seguir'}
               </button>
            </div>
          );
        })}
         <div className="px-4 py-3 hover:bg-gray-800 transition cursor-pointer text-blue-500 text-sm">
          Mostrar mais
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 text-sm text-gray-500 flex flex-wrap gap-x-4 gap-y-1 leading-5">
        <a href="#" className="hover:underline">Termos de Serviço</a>
        <a href="#" className="hover:underline">Política de Privacidade</a>
        <a href="#" className="hover:underline">Política de Cookies</a>
        <a href="#" className="hover:underline">Acessibilidade</a>
        <a href="#" className="hover:underline">Informações de anúncios</a>
        <span>© 2024 SimuVerse Social</span>
      </div>
    </div>
  );
};
