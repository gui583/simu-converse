
import React, { useState, useEffect, useRef } from 'react';
import { SetupFormData, WorldState, UserProfile, Tweet, ScreenState, Notification, AppSettings, Conversation, Message, ProfileType, TweetImpact } from './types';
import { SetupGame } from './components/SetupGame';
import { Layout } from './components/Layout';
import { TweetCard } from './components/TweetCard';
import { ThreadView } from './components/ThreadView';
import { ProfileView } from './components/ProfileView';
import { ExploreView } from './components/ExploreView';
import { NotificationsView } from './components/NotificationsView';
import { SettingsView } from './components/SettingsView';
import { MessagesListView } from './components/MessagesListView';
import { ChatView } from './components/ChatView';
import { RPGView } from './components/RPGView';
import { TweetImpactModal } from './components/TweetImpactModal';
import { generateWorldData, generateNewTweets, generateReplyOrReaction, generateTweetsForTopic, generateCharacter, generateId, generateDirectMessageReply, generateRPGReactions, analyzeTweetImpact, generateTweetSuggestions } from './services/geminiService';
import { saveGame, deleteGame, generateSaveId } from './services/storageService';
import { Image, Loader2, RefreshCw, CloudLightning, X, Music, Lightbulb, Sparkles } from 'lucide-react';
import { getAvatarUrl } from './services/imageService';

// Audio Context Singleton
let audioContext: AudioContext | null = null;

const playKeystrokeSound = () => {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        const t = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();

        // Sound Design: "Thocky" Mechanical Switch
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1500, t);
        filter.frequency.exponentialRampToValueAtTime(100, t + 0.05);

        gain.gain.setValueAtTime(0.15, t); // Volume
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioContext.destination);

        osc.start(t);
        osc.stop(t + 0.05);

        // Add a tiny bit of high frequency noise for the "click"
        const noiseBufferSize = audioContext.sampleRate * 0.01; // 0.01s noise
        const buffer = audioContext.createBuffer(1, noiseBufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < noiseBufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = audioContext.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = audioContext.createGain();
        noiseGain.gain.setValueAtTime(0.05, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.01);
        
        noise.connect(noiseGain);
        noiseGain.connect(audioContext.destination);
        noise.start(t);

    } catch (e) {
        // Silent fail if audio not supported
    }
};

const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenState>('SETUP');
  const [loading, setLoading] = useState(false);
  const [world, setWorld] = useState<WorldState | null>(null);
  const [inputContent, setInputContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({ themeColor: 'blue', soundEnabled: true });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Media Upload State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  
  // Track selected tweet for Thread View
  const [selectedTweetId, setSelectedTweetId] = useState<string | null>(null);
  
  // Messaging State
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isChatTyping, setIsChatTyping] = useState(false);

  // RPG State
  const [isRPGGenerating, setIsRPGGenerating] = useState(false);

  // Feed Category State
  const [feedTab, setFeedTab] = useState<'ALL' | 'NEWS' | 'COOKING' | 'HUMOR' | 'SPORTS'>('ALL');

  // Tweet Impact State
  const [lastTweetImpact, setLastTweetImpact] = useState<TweetImpact | null>(null);

  // Tweet Ideas State
  const [tweetIdeas, setTweetIdeas] = useState<string[]>([]);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);
  const ideasGenerationRef = useRef(0);

  // Keyboard Sound Effect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (settings.soundEnabled && !e.repeat) {
            if (settings.customKeySoundUrl) {
                // Play custom sound
                const audio = new Audio(settings.customKeySoundUrl);
                audio.volume = 0.5; // Default volume for custom sounds
                audio.play().catch(() => {
                    // Ignore autoplay errors if user hasn't interacted yet
                });
            } else {
                // Play default synth sound
                playKeystrokeSound();
            }
        }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.soundEnabled, settings.customKeySoundUrl]);

  // Auto-save effect
  useEffect(() => {
    if (world && world.userProfile) {
        setIsSaving(true);
        const timer = setTimeout(() => {
            saveGame(world);
            // Artificial small delay to let user see "Saving..."
            setTimeout(() => setIsSaving(false), 500);
        }, 1500); // Debounce save
        return () => clearTimeout(timer);
    }
  }, [world]);

  const handleStartGame = async (formData: SetupFormData) => {
    setLoading(true);
    try {
      const data = await generateWorldData(formData.scenario, formData.userParams, formData.category, formData.language);
      
      const welcomeNotification: Notification = {
          id: 'welcome',
          type: 'WELCOME',
          content: `Bem-vindo ao universo de ${formData.scenario}!`,
          timestamp: 'Agora',
          read: false
      };

      const newWorld: WorldState = {
        id: generateId(),
        scenarioName: formData.scenario,
        scenarioDescription: formData.scenario,
        visualStyle: data.visualStyle,
        category: formData.category,
        language: formData.language,
        profiles: data.profiles,
        tweets: data.initialTweets,
        userProfile: data.profiles[0], // First profile is user
        trends: data.trends,
        notifications: [welcomeNotification],
        conversations: [], // Init empty conversations
        gameTime: 0
      };

      // Force immediate save so it persists even if user refreshes immediately
      saveGame(newWorld);
      
      setWorld(newWorld);
      setScreen('FEED');
    } catch (error) {
      alert("Falha ao criar o universo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadGame = (savedWorld: WorldState) => {
      // Ensure conversations exists for older saves
      const safeWorld = { 
          ...savedWorld, 
          conversations: savedWorld.conversations || [],
          language: savedWorld.language || 'pt-BR' // Fallback for old saves
      };
      setWorld(safeWorld);
      setScreen('FEED');
  };

  const handleDeleteCurrentWorld = () => {
      if (!world) return;
      // Confirmation is now handled in the UI button
      const id = generateSaveId(world);
      deleteGame(id);
      setWorld(null);
      setScreen('SETUP');
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImage(reader.result as string);
            setSelectedAudio(null); // Mutually exclusive
        };
        reader.readAsDataURL(file);
    }
  };

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedAudio(reader.result as string);
            setSelectedImage(null); // Mutually exclusive
        };
        reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
                setSelectedAudio(null);
            };
            reader.readAsDataURL(file);
        } else if (file.type.startsWith('audio/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedAudio(reader.result as string);
                setSelectedImage(null);
            };
            reader.readAsDataURL(file);
        }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleClearIdeas = () => {
      setTweetIdeas([]);
      ideasGenerationRef.current++; // Invalidate any pending requests
      setIsLoadingIdeas(false);
  };

  const handleGetTweetIdeas = async () => {
      if (!world || !world.userProfile) return;
      
      const currentGenId = ++ideasGenerationRef.current;
      setIsLoadingIdeas(true);
      setTweetIdeas([]); // Clear old ideas while loading new ones
      
      try {
          const suggestions = await generateTweetSuggestions(world, world.userProfile);
          // Only update if this request is still the latest one
          if (currentGenId === ideasGenerationRef.current) {
             setTweetIdeas(suggestions);
          }
      } catch (e) {
          console.error("Failed to get ideas");
      } finally {
          if (currentGenId === ideasGenerationRef.current) {
              setIsLoadingIdeas(false);
          }
      }
  };

  const handlePostTweet = async () => {
    if ((!inputContent.trim() && !selectedImage && !selectedAudio) || !world || !world.userProfile) return;
    
    setIsPosting(true);
    
    const newTweet: Tweet = {
      id: Math.random().toString(36).substr(2, 9),
      authorId: world.userProfile.id,
      content: inputContent,
      timestamp: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      retweets: 0,
      replies: 0,
      media: selectedImage ? {
          type: 'IMAGE',
          url: selectedImage,
          thumbnailSeed: 'user-upload',
          description: 'User uploaded image'
      } : selectedAudio ? {
          type: 'AUDIO',
          url: selectedAudio,
          thumbnailSeed: 'user-audio',
          description: 'User uploaded audio'
      } : undefined
    };

    // 1. Add tweet to state first
    setWorld(prev => {
        if(!prev) return null;
        return {
            ...prev,
            tweets: [newTweet, ...prev.tweets]
        }
    });

    try {
        // 2. Analyze impact
        const impact = await analyzeTweetImpact(inputContent, world.userProfile, world);
        setLastTweetImpact(impact);

        // 3. Update User Stats based on impact
        setWorld(prev => {
            if (!prev || !prev.userProfile) return null;
            return {
                ...prev,
                userProfile: {
                    ...prev.userProfile,
                    followers: Math.max(0, prev.userProfile.followers + impact.followersChange),
                    aura: Math.max(0, (prev.userProfile.aura || 0) + impact.auraChange),
                    popularity: Math.max(0, (prev.userProfile.popularity || 0) + impact.popularityChange),
                    creativity: Math.max(0, (prev.userProfile.creativity || 0) + impact.creativityChange)
                }
            }
        });

        // 4. Generate Reactions
        const mediaContext = selectedImage ? '[Com imagem]' : selectedAudio ? '[Com áudio]' : '';
        const reactions = await generateReplyOrReaction(world, `Postou: "${newTweet.content}" ${mediaContext}`);
        if (reactions.length > 0) {
            setWorld(prev => {
                if(!prev) return null;
                
                // Create notifications for replies
                const newNotes: Notification[] = reactions.map(r => {
                    const author = prev.profiles.find(p => p.id === r.authorId);
                    return {
                        id: Math.random().toString(36),
                        type: 'MENTION',
                        content: `respondeu ao seu post: "${r.content.substring(0, 20)}..."`,
                        user: author,
                        timestamp: 'Agora',
                        read: false
                    };
                });

                return {
                    ...prev,
                    tweets: [...reactions, ...prev.tweets],
                    notifications: [...newNotes, ...prev.notifications]
                }
            });
        }
    } catch (e) {
        console.error("Failed to process tweet impact/reactions", e);
    } finally {
        setIsPosting(false);
        setInputContent('');
        setSelectedImage(null);
        setSelectedAudio(null);
        setTweetIdeas([]); // Clear ideas after posting
    }
  };

  const handleLikeTweet = (tweetId: string) => {
      if (!world || !world.userProfile) return;
      const userId = world.userProfile.id;

      setWorld(prev => {
          if (!prev) return null;
          
          const updatedTweets = prev.tweets.map(t => {
              if (t.id === tweetId) {
                  const likedBy = t.likedBy || [];
                  const isLiked = likedBy.includes(userId);
                  
                  return {
                      ...t,
                      likes: isLiked ? t.likes - 1 : t.likes + 1,
                      likedBy: isLiked ? likedBy.filter(id => id !== userId) : [...likedBy, userId]
                  };
              }
              return t;
          });

          return {
              ...prev,
              tweets: updatedTweets
          };
      });
  };

  const handleRefreshFeed = async () => {
      if(!world) return;
      setLoading(true);
      try {
          const newTweets = await generateNewTweets(world);
          setWorld(prev => {
              if(!prev) return null;
              return {
                  ...prev,
                  tweets: [...newTweets, ...prev.tweets]
              }
          });
      } catch (e) {
          console.error("Failed to refresh");
      } finally {
          setLoading(false);
      }
  }

  const handleLogout = () => {
      // Force save before exiting
      if (world) {
          setIsSaving(true);
          saveGame(world);
          setTimeout(() => setIsSaving(false), 500);
      }
      
      setWorld(null);
      setScreen('SETUP');
      setSelectedTweetId(null);
      setSearchQuery('');
  }

  const handleTweetClick = (tweetId: string) => {
      setSelectedTweetId(tweetId);
      setScreen('THREAD');
  }

  const handleBackToFeed = () => {
      setScreen('FEED');
      setSelectedTweetId(null);
  }

  const handleUpdateWorldFromThread = (newTweets: Tweet[], newProfiles: UserProfile[]) => {
      setWorld(prev => {
          if(!prev) return null;
          return {
              ...prev,
              profiles: [...prev.profiles, ...newProfiles],
              tweets: [...prev.tweets, ...newTweets]
          }
      });
  }

  const handleNavigate = (newScreen: ScreenState) => {
      setScreen(newScreen);
      if (newScreen !== 'EXPLORE') {
          setSearchQuery('');
      }
  };

  const handlePerformSearch = async (query: string) => {
      setSearchQuery(query);
      setScreen('EXPLORE');
      
      if (!world || !query.trim()) return;

      setIsSearching(true);
      try {
          const newTweets = await generateTweetsForTopic(world, query);
          setWorld(prev => {
              if (!prev) return null;
              return {
                  ...prev,
                  tweets: [...newTweets, ...prev.tweets]
              }
          });
      } catch (e) {
          console.error("Failed to generate search results", e);
      } finally {
          setIsSearching(false);
      }
  };

  // 1. Just generate the preview, don't add to state yet
  const handlePreviewCharacter = async (name: string): Promise<{ profile: UserProfile, introTweet: Tweet } | null> => {
      if (!world) return null;
      return await generateCharacter(name, world.scenarioName, world.language);
  };

  // 2. Actually add to state when confirmed
  const handleAddCharacterToWorld = (characterData: { profile: UserProfile, introTweet: Tweet }) => {
      setWorld(prev => {
          if(!prev) return null;
          return {
              ...prev,
              profiles: [characterData.profile, ...prev.profiles],
              tweets: [characterData.introTweet, ...prev.tweets]
          }
      });
  };

  const handleEditProfile = (updatedProfile: UserProfile) => {
      setWorld(prev => {
          if(!prev) return null;
          return {
              ...prev,
              userProfile: updatedProfile,
              profiles: prev.profiles.map(p => p.id === updatedProfile.id ? updatedProfile : p)
          }
      });
  };

  const handleCreateRPGEvent = async (title: string, description: string, participantIds: string[]) => {
      if (!world) return;
      setIsRPGGenerating(true);
      try {
          const newTweets = await generateRPGReactions(world, title, description, participantIds);
          
          setWorld(prev => {
              if (!prev) return null;
              return {
                  ...prev,
                  tweets: [...newTweets, ...prev.tweets],
                  // Optionally add a notification that the event happened
                  notifications: [
                      {
                          id: generateId(),
                          type: 'WELCOME', // Using welcome icon for generic system note
                          content: `Evento RPG: "${title}" gerou repercussão!`,
                          timestamp: 'Agora',
                          read: false
                      },
                      ...prev.notifications
                  ]
              }
          });
          
          // Go back to feed to see the chaos
          setScreen('FEED');
      } catch (e) {
          console.error("Failed RPG event", e);
      } finally {
          setIsRPGGenerating(false);
      }
  };

  const handleToggleFollow = (targetUserId: string) => {
      setWorld(prev => {
          if (!prev || !prev.userProfile) return null;
          
          const targetUser = prev.profiles.find(p => p.id === targetUserId);
          if (!targetUser) return prev;

          const isFollowing = (prev.userProfile.followingIds || []).includes(targetUserId);
          
          let updatedUser = { ...prev.userProfile };
          let updatedTarget = { ...targetUser };

          if (isFollowing) {
              // Unfollow
              updatedUser.followingIds = updatedUser.followingIds.filter(id => id !== targetUserId);
              updatedUser.following = Math.max(0, updatedUser.following - 1);
              updatedTarget.followers = Math.max(0, updatedTarget.followers - 1);
          } else {
              // Follow
              updatedUser.followingIds = [...(updatedUser.followingIds || []), targetUserId];
              updatedUser.following = updatedUser.following + 1;
              updatedTarget.followers = updatedTarget.followers + 1;
          }

          const newProfiles = prev.profiles.map(p => {
              if (p.id === updatedUser.id) return updatedUser;
              if (p.id === updatedTarget.id) return updatedTarget;
              return p;
          });

          return {
              ...prev,
              userProfile: updatedUser,
              profiles: newProfiles
          };
      });
  };

  // --- MESSAGING LOGIC ---

  const handleOpenChat = (participantId: string) => {
      if (!world) return;
      
      // Check if conversation exists
      let conversation = world.conversations.find(c => c.participantId === participantId);
      
      if (!conversation) {
          // Create new
          conversation = {
              id: generateId(),
              participantId,
              messages: [],
              unreadCount: 0,
              lastMessageTimestamp: new Date().toISOString()
          };
          setWorld(prev => ({
              ...prev!,
              conversations: [...(prev?.conversations || []), conversation!]
          }));
      }

      setActiveConversationId(conversation.id);
      setScreen('CHAT');
  };

  const handleSendDirectMessage = async (content: string) => {
      if (!world || !activeConversationId || !world.userProfile) return;

      const conversation = world.conversations.find(c => c.id === activeConversationId);
      if (!conversation) return;

      const userMsg: Message = {
          id: generateId(),
          senderId: world.userProfile.id,
          content,
          timestamp: new Date().toISOString()
      };

      // Optimistic update
      setWorld(prev => {
          if (!prev) return null;
          return {
              ...prev,
              conversations: prev.conversations.map(c => 
                  c.id === activeConversationId 
                  ? { ...c, messages: [...c.messages, userMsg], lastMessageTimestamp: userMsg.timestamp }
                  : c
              )
          };
      });

      // AI Response
      setIsChatTyping(true);
      const participant = world.profiles.find(p => p.id === conversation.participantId);
      
      if (participant) {
        try {
            // Get updated history
            const updatedHistory = [...conversation.messages, userMsg];
            const replyContent = await generateDirectMessageReply(participant, world.userProfile, updatedHistory, world.scenarioName, world.language);
            
            const replyMsg: Message = {
                id: generateId(),
                senderId: participant.id,
                content: replyContent,
                timestamp: new Date().toISOString()
            };

            setWorld(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    conversations: prev.conversations.map(c => 
                        c.id === activeConversationId 
                        ? { ...c, messages: [...c.messages, replyMsg], lastMessageTimestamp: replyMsg.timestamp }
                        : c
                    )
                };
            });
        } catch (e) {
            console.error(e);
        } finally {
            setIsChatTyping(false);
        }
      }
  };

  // Helper to dynamically inject theme color
  const getThemeColorClass = () => {
      switch(settings.themeColor) {
          case 'green': return 'text-green-500 bg-green-500 border-green-500';
          case 'pink': return 'text-pink-500 bg-pink-500 border-pink-500';
          case 'purple': return 'text-purple-500 bg-purple-500 border-purple-500';
          case 'orange': return 'text-orange-500 bg-orange-500 border-orange-500';
          default: return 'text-blue-500 bg-blue-500 border-blue-500';
      }
  };

  const getButtonClass = () => {
       switch(settings.themeColor) {
          case 'green': return 'bg-green-500 hover:bg-green-600';
          case 'pink': return 'bg-pink-500 hover:bg-pink-600';
          case 'purple': return 'bg-purple-500 hover:bg-purple-600';
          case 'orange': return 'bg-orange-500 hover:bg-orange-600';
          default: return 'bg-blue-500 hover:bg-blue-600';
      }
  };

  // Filter tweets based on active Tab
  const getFilteredTweets = () => {
      if (!world) return [];
      const tweets = world.tweets.filter(t => !t.replyToId); // Only main tweets
      
      if (feedTab === 'ALL') return tweets;
      
      return tweets.filter(t => {
          const author = world.profiles.find(p => p.id === t.authorId);
          if (!author) return false;
          
          if (feedTab === 'NEWS') return author.type === ProfileType.OFFICIAL || author.type === ProfileType.GOSSIP;
          if (feedTab === 'COOKING') return author.type === ProfileType.COOKING;
          if (feedTab === 'SPORTS') return author.type === ProfileType.SPORTS;
          if (feedTab === 'HUMOR') return author.type === ProfileType.HUMOR || author.type === ProfileType.NORMAL; // Include Normal for variance
          
          return true;
      });
  };

  if (screen === 'SETUP') {
    return (
        <SetupGame 
            onStart={handleStartGame} 
            onLoad={handleLoadGame} 
            isLoading={loading} 
        />
    );
  }

  if (!world || !world.userProfile) return <div>Error State</div>;

  return (
    <div className={settings.themeColor === 'blue' ? '' : `theme-${settings.themeColor}`}>
        {lastTweetImpact && (
            <TweetImpactModal 
                impact={lastTweetImpact} 
                onClose={() => setLastTweetImpact(null)} 
            />
        )}
        
        <Layout 
            user={world.userProfile} 
            trends={world.trends} 
            onLogout={handleLogout}
            suggestedUsers={world.profiles.filter(p => p.id !== world.userProfile?.id)}
            currentScreen={screen}
            onNavigate={handleNavigate}
            onSearch={handlePerformSearch}
            isSaving={isSaving}
            onToggleFollow={handleToggleFollow}
        >
        {screen === 'FEED' && (
            <>
                <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-gray-800 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                    <div className="flex justify-between items-center px-4 py-3">
                        <div>
                            <h2 className="text-xl font-bold text-white">Início</h2>
                            <p className="text-xs text-gray-500 truncate max-w-sm">{world.scenarioName}</p>
                        </div>
                        {isSaving && (
                            <div className="flex items-center gap-1 text-xs text-gray-400 animate-pulse">
                                <CloudLightning className="w-3 h-3" />
                                Salvando...
                            </div>
                        )}
                    </div>
                    
                    {/* Feed Tabs */}
                    <div className="flex overflow-x-auto no-scrollbar">
                        {(['ALL', 'NEWS', 'HUMOR', 'COOKING', 'SPORTS'] as const).map(tab => (
                            <button 
                                key={tab}
                                onClick={(e) => { e.stopPropagation(); setFeedTab(tab); }}
                                className={`
                                    flex-1 px-4 py-3 text-center text-sm font-bold transition whitespace-nowrap
                                    ${feedTab === tab 
                                        ? `text-white border-b-4 ${getThemeColorClass().split(' ')[2]}` 
                                        : 'text-gray-500 hover:bg-gray-900'
                                    }
                                `}
                            >
                                {tab === 'ALL' && 'Para você'}
                                {tab === 'NEWS' && 'Notícias'}
                                {tab === 'HUMOR' && 'Humor'}
                                {tab === 'COOKING' && 'Culinária'}
                                {tab === 'SPORTS' && 'Esportes'}
                            </button>
                        ))}
                    </div>
                </div>

                <div 
                  className="border-b border-gray-800 px-4 py-3"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                    <div className="flex gap-4">
                    <img 
                        src={getAvatarUrl(world.userProfile, world.visualStyle)}
                        alt="My Avatar"
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                        <textarea 
                            value={inputContent}
                            onChange={(e) => setInputContent(e.target.value)}
                            placeholder="O que está acontecendo? (Arraste mídia para cá)"
                            className="w-full bg-transparent text-xl text-white placeholder-gray-500 border-none focus:ring-0 resize-none h-24 p-0 outline-none"
                        />
                        
                        {/* Generated Tweet Ideas */}
                        {tweetIdeas.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4 animate-in fade-in slide-in-from-top-2">
                                {tweetIdeas.map((idea, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setInputContent(idea)}
                                        className="text-left text-xs bg-gray-900 border border-gray-700 hover:border-blue-500 hover:bg-gray-800 text-blue-300 rounded-lg px-3 py-2 transition max-w-full"
                                    >
                                        <span className="font-bold mr-1">💡</span>
                                        {idea}
                                    </button>
                                ))}
                            </div>
                        )}

                        {selectedImage && (
                            <div className="relative mt-2 mb-4">
                                <img src={selectedImage} alt="Preview" className="rounded-2xl max-h-64 object-cover border border-gray-800" />
                                <button 
                                    onClick={() => setSelectedImage(null)}
                                    className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1 rounded-full backdrop-blur-sm transition"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {selectedAudio && (
                             <div className="relative mt-2 mb-4 bg-gray-900 rounded-2xl p-4 border border-gray-800 flex items-center gap-3">
                                <div className="p-3 bg-blue-500/20 rounded-full text-blue-500">
                                    <Music className="w-6 h-6" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                     <audio controls src={selectedAudio} className="w-full h-8" />
                                </div>
                                <button 
                                    onClick={() => setSelectedAudio(null)}
                                    className="p-1 hover:bg-gray-800 rounded-full transition"
                                >
                                    <X className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                        )}

                        <div className="flex justify-between items-center border-t border-gray-800 pt-3 mt-2">
                            <div className={`flex gap-2 ${getThemeColorClass().split(' ')[0]}`}>
                                <button 
                                  onClick={() => fileInputRef.current?.click()}
                                  className="p-2 hover:bg-gray-800 rounded-full transition"
                                  title="Adicionar imagem"
                                >
                                    <Image className="w-5 h-5" />
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                />
                                <button 
                                  onClick={() => audioInputRef.current?.click()}
                                  className="p-2 hover:bg-gray-800 rounded-full transition"
                                  title="Adicionar áudio/música"
                                >
                                    <Music className="w-5 h-5" />
                                </button>
                                <input 
                                    type="file" 
                                    ref={audioInputRef} 
                                    className="hidden" 
                                    accept="audio/*"
                                    onChange={handleAudioSelect}
                                />
                                <button 
                                    onClick={() => {
                                        if (isLoadingIdeas) return;
                                        handleGetTweetIdeas();
                                    }}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        handleClearIdeas();
                                    }}
                                    className={`p-2 hover:bg-gray-800 rounded-full transition relative group ${isLoadingIdeas ? 'opacity-50' : ''}`}
                                    title="Gerar ideias com IA (Botão direito para limpar)"
                                >
                                    {isLoadingIdeas ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lightbulb className="w-5 h-5" />}
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                                        Ideias (Botão direito limpa)
                                    </span>
                                </button>
                            </div>
                            <button 
                                onClick={handlePostTweet}
                                disabled={(!inputContent.trim() && !selectedImage && !selectedAudio) || isPosting}
                                className={`${getButtonClass()} disabled:opacity-50 text-white font-bold px-4 py-2 rounded-full transition`}
                            >
                                {isPosting ? 'Postando...' : 'Postar'}
                            </button>
                        </div>
                    </div>
                    </div>
                </div>

                <div 
                    className={`py-3 border-b border-gray-800 flex justify-center hover:bg-gray-900 transition cursor-pointer text-sm ${getThemeColorClass().split(' ')[0]}`}
                    onClick={handleRefreshFeed}
                >
                    {loading ? (
                        <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Atualizando o mundo...</span>
                    ) : (
                        <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4"/> Avançar Tempo (Gerar Novos Tweets)</span>
                    )}
                </div>

                <div className="pb-20">
                    {getFilteredTweets().length === 0 ? (
                        <div className="p-10 text-center text-gray-500">
                            <p>Nenhum post nesta categoria ainda.</p>
                            <button onClick={handleRefreshFeed} className="text-blue-500 hover:underline mt-2">Gerar novos posts</button>
                        </div>
                    ) : (
                        getFilteredTweets().map(tweet => {
                            const author = world.profiles.find(p => p.id === tweet.authorId);
                            if(!author) return null;
                            return (
                                <TweetCard 
                                    key={tweet.id} 
                                    tweet={tweet} 
                                    author={author} 
                                    onClick={() => handleTweetClick(tweet.id)}
                                    visualStyle={world.visualStyle}
                                    onLike={handleLikeTweet}
                                    isLiked={tweet.likedBy?.includes(world.userProfile?.id || '')}
                                />
                            );
                        })
                    )}
                </div>
            </>
        )}

        {screen === 'THREAD' && selectedTweetId && (
            <ThreadView 
                tweet={world.tweets.find(t => t.id === selectedTweetId)!}
                world={world}
                onBack={handleBackToFeed}
                onUpdateWorld={handleUpdateWorldFromThread}
                onLike={handleLikeTweet}
            />
        )}

        {screen === 'PROFILE' && (
            <ProfileView 
                user={world.userProfile} 
                tweets={world.tweets}
                onBack={handleBackToFeed}
                onEditProfile={handleEditProfile}
                isOwnProfile={true}
                visualStyle={world.visualStyle}
                onMessage={undefined} // No messaging self
                onLike={handleLikeTweet}
                currentUserId={world.userProfile.id}
            />
        )}

        {screen === 'EXPLORE' && (
            <ExploreView 
                world={world}
                initialQuery={searchQuery}
                onTweetClick={handleTweetClick}
                onSearch={handlePerformSearch}
                isSearching={isSearching}
                onLike={handleLikeTweet}
            />
        )}

        {screen === 'NOTIFICATIONS' && (
            <NotificationsView 
                notifications={world.notifications} 
                visualStyle={world.visualStyle}
            />
        )}
        
        {screen === 'MESSAGES' && (
            <MessagesListView 
                conversations={world.conversations || []} 
                profiles={world.profiles}
                onSelectConversation={(id) => {
                    setActiveConversationId(id);
                    setScreen('CHAT');
                }}
                onStartChat={handleOpenChat}
                onBack={handleBackToFeed}
                visualStyle={world.visualStyle}
            />
        )}

        {screen === 'CHAT' && activeConversationId && (
            <ChatView 
                conversation={world.conversations.find(c => c.id === activeConversationId)!}
                participant={world.profiles.find(p => p.id === world.conversations.find(c => c.id === activeConversationId)?.participantId)!}
                currentUser={world.userProfile}
                onBack={() => setScreen('MESSAGES')}
                onSendMessage={handleSendDirectMessage}
                visualStyle={world.visualStyle}
                isTyping={isChatTyping}
            />
        )}

        {screen === 'RPG' && (
            <RPGView 
                world={world}
                onBack={handleBackToFeed}
                onSubmit={handleCreateRPGEvent}
                isGenerating={isRPGGenerating}
                visualStyle={world.visualStyle}
            />
        )}

        {screen === 'SETTINGS' && (
            <SettingsView 
                settings={settings} 
                onUpdateSettings={setSettings} 
                onBack={handleBackToFeed}
                onPreviewCharacter={handlePreviewCharacter}
                onAddCharacter={handleAddCharacterToWorld}
                onDeleteWorld={handleDeleteCurrentWorld}
                visualStyle={world.visualStyle}
            />
        )}
        
        </Layout>
    </div>
  );
};

export default App;
