
import React, { useState, useEffect } from 'react';
import { UserProfile, Tweet, WorldState } from '../types';
import { TweetCard } from './TweetCard';
import { Search, BadgeCheck, Loader2 } from 'lucide-react';

interface ExploreViewProps {
  world: WorldState;
  initialQuery?: string;
  onTweetClick: (id: string) => void;
  onSearch: (query: string) => void;
  isSearching: boolean;
  onLike: (tweetId: string) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({ world, initialQuery = '', onTweetClick, onSearch, isSearching, onLike }) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'TOP' | 'PEOPLE'>('TOP');
  
  const currentUserId = world.userProfile?.id;

  // Sync internal state if initialQuery changes from outside (e.g. Sidebar click)
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          onSearch(query);
      }
  };

  const filteredTweets = world.tweets.filter(t => 
    t.content.toLowerCase().includes(query.toLowerCase())
  );

  const filteredProfiles = world.profiles.filter(p => 
    p.displayName.toLowerCase().includes(query.toLowerCase()) || 
    p.handle.toLowerCase().includes(query.toLowerCase()) ||
    p.bio.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
        {/* Search Header */}
        <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10 px-4 py-2 border-b border-gray-800">
             <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-500" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="block w-full bg-gray-900 border border-transparent rounded-full py-2 pl-12 pr-3 text-white focus:outline-none focus:bg-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    placeholder="Buscar no SimuVerse"
                />
            </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 mt-2">
            <button 
                onClick={() => setActiveTab('TOP')}
                className={`flex-1 p-4 text-center font-bold hover:bg-gray-900 transition ${activeTab === 'TOP' ? 'text-white border-b-4 border-blue-500' : 'text-gray-500'}`}
            >
                Principais
            </button>
            <button 
                onClick={() => setActiveTab('PEOPLE')}
                className={`flex-1 p-4 text-center font-bold hover:bg-gray-900 transition ${activeTab === 'PEOPLE' ? 'text-white border-b-4 border-blue-500' : 'text-gray-500'}`}
            >
                Pessoas
            </button>
        </div>

        {/* Content */}
        <div className="pb-20">
            {!query && (
                <div className="p-8 text-center text-gray-500">
                    <p className="mb-2 text-lg">Busque por tópicos, pessoas ou palavras-chave.</p>
                    <p className="text-sm">Explore o que está acontecendo no seu universo.</p>
                </div>
            )}

            {isSearching && (
                <div className="p-8 flex flex-col items-center justify-center text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-500" />
                    <p>A IA está gerando resultados para "{query}"...</p>
                </div>
            )}

            {!isSearching && query && activeTab === 'TOP' && (
                <div>
                     {filteredTweets.length === 0 ? (
                         <div className="p-8 text-center text-gray-500">Nenhum tweet encontrado para "{query}"</div>
                     ) : (
                         filteredTweets.map(tweet => {
                             const author = world.profiles.find(p => p.id === tweet.authorId);
                             if(!author) return null;
                             return (
                                <TweetCard 
                                    key={tweet.id} 
                                    tweet={tweet} 
                                    author={author} 
                                    onClick={() => onTweetClick(tweet.id)}
                                    onLike={onLike}
                                    isLiked={tweet.likedBy?.includes(currentUserId || '')}
                                />
                             );
                         })
                     )}
                </div>
            )}

            {!isSearching && query && activeTab === 'PEOPLE' && (
                <div>
                    {filteredProfiles.length === 0 ? (
                         <div className="p-8 text-center text-gray-500">Nenhuma pessoa encontrada para "{query}"</div>
                    ) : (
                        filteredProfiles.map(profile => (
                            <div key={profile.id} className="p-4 hover:bg-gray-900 transition flex items-center justify-between border-b border-gray-800">
                                <div className="flex items-center gap-3">
                                    <img 
                                        src={`https://picsum.photos/seed/${profile.avatarSeed}/200`} 
                                        alt={profile.displayName}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold text-white">{profile.displayName}</span>
                                            {profile.isVerified && <BadgeCheck className="w-4 h-4 text-blue-500 fill-current" />}
                                        </div>
                                        <div className="text-gray-500 text-sm">@{profile.handle}</div>
                                        <div className="text-white text-sm mt-1">{profile.bio}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    </div>
  );
};
