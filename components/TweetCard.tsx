
import React from 'react';
import { Tweet, UserProfile, ProfileType } from '../types';
import { Heart, MessageCircle, Repeat2, Share, BadgeCheck, Music } from 'lucide-react';
import { getAvatarUrl, getTweetImageUrl } from '../services/imageService';

interface TweetCardProps {
  tweet: Tweet;
  author: UserProfile;
  isReply?: boolean;
  onClick?: () => void;
  isMainTweet?: boolean;
  visualStyle?: string;
  onLike?: (tweetId: string) => void;
  isLiked?: boolean;
}

export const TweetCard: React.FC<TweetCardProps> = ({ 
  tweet, 
  author, 
  isReply = false, 
  onClick, 
  isMainTweet = false, 
  visualStyle = "realistic",
  onLike,
  isLiked = false
}) => {
  
  const getTypeBadge = (type: ProfileType) => {
    switch (type) {
      case ProfileType.GOSSIP: return "text-pink-500";
      case ProfileType.SPORTS: return "text-green-500";
      case ProfileType.COOKING: return "text-orange-500";
      case ProfileType.OFFICIAL: return "text-yellow-500";
      case ProfileType.HUMOR: return "text-indigo-400";
      default: return "text-blue-500";
    }
  };

  const handleActionClick = (e: React.MouseEvent, action?: () => void) => {
    e.stopPropagation();
    if (action) action();
  };

  return (
    <div 
        onClick={onClick}
        className={`
            p-4 border-b border-gray-800 transition 
            ${onClick ? 'cursor-pointer hover:bg-gray-900/30' : ''} 
            ${isReply ? 'bg-gray-900/10' : ''}
            ${isMainTweet ? 'pb-2' : ''}
        `}
    >
      <div className={`flex gap-3 ${isMainTweet ? 'flex-col' : ''}`}>
        
        {/* Header/Avatar Area */}
        <div className={`flex ${isMainTweet ? 'items-center gap-3' : ''}`}>
             <div className="flex-shrink-0">
                <img 
                    src={getAvatarUrl(author, visualStyle)}
                    alt={author.displayName}
                    className={`${isMainTweet ? 'w-12 h-12' : 'w-10 h-10'} rounded-full object-cover`}
                    loading="lazy"
                />
            </div>
            
            {isMainTweet && (
                <div className="flex flex-col">
                     <div className="flex items-center gap-1 text-base">
                        <span className="font-bold text-white">{author.displayName}</span>
                        {author.isVerified && (
                           <BadgeCheck className={`w-5 h-5 ${getTypeBadge(author.type)} fill-current`} />
                        )}
                    </div>
                    <span className="text-gray-500 text-sm">@{author.handle}</span>
                </div>
            )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {!isMainTweet && (
              <div className="flex items-center gap-1 text-sm mb-0.5">
                <span className="font-bold text-white truncate">{author.displayName}</span>
                {author.isVerified && (
                   <BadgeCheck className={`w-4 h-4 ${getTypeBadge(author.type)} fill-current`} />
                )}
                <span className="text-gray-500 truncate">@{author.handle}</span>
                <span className="text-gray-500">·</span>
                <span className="text-gray-500">Agora</span>
              </div>
          )}

          {/* Body */}
          <p className={`text-white leading-normal whitespace-pre-wrap ${isMainTweet ? 'text-xl mt-2 mb-4' : 'text-[15px]'}`}>
            {tweet.content}
          </p>

          {/* Media Attachments */}
          {tweet.media && (
             <div className={`mt-3 rounded-2xl overflow-hidden border border-gray-800 ${isMainTweet ? 'mb-4' : ''}`}>
               {tweet.media.type === 'IMAGE' && (
                   <img 
                     src={tweet.media.url || getTweetImageUrl(tweet.media, visualStyle)} 
                     alt={tweet.media.description || "Tweet image"}
                     className="w-full h-auto object-cover max-h-[500px]"
                   />
               )}
               {tweet.media.type === 'AUDIO' && (
                   <div className="bg-gray-900 p-4 flex items-center gap-4">
                       <div className="bg-blue-500/20 p-3 rounded-full text-blue-500">
                           <Music className="w-6 h-6" />
                       </div>
                       <div className="flex-1 min-w-0">
                           <audio controls src={tweet.media.url} className="w-full h-8 focus:outline-none" />
                       </div>
                   </div>
               )}
             </div>
          )}

          {isMainTweet && (
             <div className="border-b border-gray-800 py-3 mb-3 text-gray-500 text-sm mt-4">
                <span>{new Date().toLocaleTimeString()} · {new Date().toLocaleDateString()}</span>
             </div>
          )}

          {/* Actions */}
          <div className={`flex justify-between ${isMainTweet ? 'border-b border-gray-800 pb-3' : 'mt-3 max-w-md'} text-gray-500`}>
            <button 
                onClick={(e) => handleActionClick(e)} 
                className="flex items-center gap-2 group hover:text-blue-500 transition"
            >
              <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition">
                <MessageCircle className={`${isMainTweet ? 'w-6 h-6' : 'w-4 h-4'}`} />
              </div>
              <span className="text-xs">{tweet.replies > 0 ? tweet.replies : ''}</span>
            </button>
            <button 
                onClick={(e) => handleActionClick(e)} 
                className="flex items-center gap-2 group hover:text-green-500 transition"
            >
              <div className="p-2 rounded-full group-hover:bg-green-500/10 transition">
                <Repeat2 className={`${isMainTweet ? 'w-6 h-6' : 'w-4 h-4'}`} />
              </div>
              <span className="text-xs">{tweet.retweets > 0 ? tweet.retweets : ''}</span>
            </button>
            <button 
                onClick={(e) => handleActionClick(e, () => onLike && onLike(tweet.id))} 
                className={`flex items-center gap-2 group transition ${isLiked ? 'text-pink-500' : 'hover:text-pink-500'}`}
            >
              <div className="p-2 rounded-full group-hover:bg-pink-500/10 transition">
                <Heart className={`${isMainTweet ? 'w-6 h-6' : 'w-4 h-4'} ${isLiked ? 'fill-current' : ''}`} />
              </div>
              <span className="text-xs">{tweet.likes > 0 ? tweet.likes : ''}</span>
            </button>
            <button 
                onClick={(e) => handleActionClick(e)} 
                className="flex items-center gap-2 group hover:text-blue-500 transition"
            >
              <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition">
                <Share className={`${isMainTweet ? 'w-6 h-6' : 'w-4 h-4'}`} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
