
import React, { useEffect, useState } from 'react';
import { Tweet, UserProfile, WorldState } from '../types';
import { TweetCard } from './TweetCard';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { generateTweetReplies } from '../services/geminiService';

interface ThreadViewProps {
  tweet: Tweet;
  world: WorldState;
  onBack: () => void;
  onUpdateWorld: (newTweets: Tweet[], newProfiles: UserProfile[]) => void;
  onLike: (tweetId: string) => void;
}

export const ThreadView: React.FC<ThreadViewProps> = ({ tweet, world, onBack, onUpdateWorld, onLike }) => {
  const [loading, setLoading] = useState(false);
  
  const author = world.profiles.find(p => p.id === tweet.authorId);
  const currentUserId = world.userProfile?.id;
  
  // Find existing replies in global state
  const existingReplies = world.tweets.filter(t => t.replyToId === tweet.id);

  useEffect(() => {
    // If no replies exist and we haven't loaded them yet, fetch them
    const fetchReplies = async () => {
      if (existingReplies.length === 0 && author) {
        setLoading(true);
        try {
           const { replies, newProfiles } = await generateTweetReplies(tweet, author, world);
           onUpdateWorld(replies, newProfiles);
        } catch (e) {
           console.error("Failed to load replies");
        } finally {
           setLoading(false);
        }
      }
    };

    fetchReplies();
  }, [tweet.id]);

  if (!author) return <div>Erro: Autor não encontrado</div>;

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-gray-800 px-4 py-3 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-800 rounded-full transition">
           <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h2 className="text-xl font-bold text-white">Post</h2>
      </div>

      {/* Main Tweet */}
      <TweetCard 
        tweet={tweet} 
        author={author} 
        isMainTweet={true} 
        onLike={onLike}
        isLiked={tweet.likedBy?.includes(currentUserId || '')}
      />

      {/* Loading State */}
      {loading && (
        <div className="p-8 flex flex-col items-center justify-center text-gray-500 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm">A IA está escrevendo comentários...</p>
        </div>
      )}

      {/* Replies */}
      <div>
         {existingReplies.map(reply => {
            const replyAuthor = world.profiles.find(p => p.id === reply.authorId);
            if (!replyAuthor) return null;
            return (
                <TweetCard 
                    key={reply.id} 
                    tweet={reply} 
                    author={replyAuthor} 
                    isReply={true} 
                    onLike={onLike}
                    isLiked={reply.likedBy?.includes(currentUserId || '')}
                />
            );
         })}
         
         {!loading && existingReplies.length === 0 && (
             <div className="p-8 text-center text-gray-500 text-sm">
                 Nenhum comentário ainda.
             </div>
         )}
      </div>
    </div>
  );
};
