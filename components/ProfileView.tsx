
import React, { useState, useRef } from 'react';
import { UserProfile, Tweet } from '../types';
import { TweetCard } from './TweetCard';
import { ArrowLeft, Calendar, MapPin, Link as LinkIcon, Edit3, Save, X, Camera, Mail, Crown, Zap, Palette } from 'lucide-react';
import { getAvatarUrl, getBannerUrl } from '../services/imageService';

interface ProfileViewProps {
  user: UserProfile;
  tweets: Tweet[];
  onBack: () => void;
  onEditProfile: (updatedProfile: UserProfile) => void;
  isOwnProfile: boolean;
  visualStyle?: string;
  onMessage?: (userId: string) => void;
  onLike: (tweetId: string) => void;
  currentUserId?: string;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ 
    user, 
    tweets, 
    onBack, 
    onEditProfile, 
    isOwnProfile, 
    visualStyle = "realistic", 
    onMessage,
    onLike,
    currentUserId
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.displayName);
  const [editBio, setEditBio] = useState(user.bio);
  
  // Custom Avatar State
  const [editAvatarUrl, setEditAvatarUrl] = useState<string | undefined>(user.avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onEditProfile({
      ...user,
      displayName: editName,
      bio: editBio,
      avatarUrl: editAvatarUrl // Persist the custom image
    });
    setIsEditing(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const userTweets = tweets.filter(t => t.authorId === user.id);

  // Create a temporary profile object for previewing the edited avatar
  const previewProfile = { ...user, avatarUrl: editAvatarUrl };

  const StatPill = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number, color: string }) => (
      <div className={`flex flex-col items-center justify-center p-3 bg-gray-900 rounded-xl border border-gray-800 ${color}`}>
          <div className="flex items-center gap-1 mb-1 opacity-80">
              {icon}
              <span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
          </div>
          <span className="text-xl font-black">{value}</span>
      </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-gray-800 px-4 py-3 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-800 rounded-full transition">
           <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
           <h2 className="text-xl font-bold text-white leading-5">{user.displayName}</h2>
           <p className="text-xs text-gray-500">{userTweets.length} Posts</p>
        </div>
      </div>

      {/* Banner */}
      <div className="h-32 md:h-48 bg-gray-800 relative overflow-hidden">
        <img 
            src={getBannerUrl(user.id, visualStyle)}
            className="w-full h-full object-cover opacity-70"
            alt="Banner"
        />
      </div>

      {/* Profile Info */}
      <div className="px-4 pb-4 border-b border-gray-800 relative">
        <div className="flex justify-between items-start">
            {/* Avatar */}
            <div className="-mt-16 md:-mt-20 mb-3 relative group">
                 <img 
                    src={getAvatarUrl(isEditing ? previewProfile : user, visualStyle)} 
                    alt={user.displayName}
                    className="w-32 h-32 md:w-36 md:h-36 rounded-full object-cover border-4 border-black bg-black"
                />
                {isEditing && (
                    <>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition cursor-pointer"
                            title="Carregar nova foto"
                        >
                            <Camera className="w-8 h-8 opacity-80" />
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileSelect}
                        />
                    </>
                )}
            </div>

            {/* Action Button */}
            <div className="mt-3">
                {isOwnProfile ? (
                    isEditing ? (
                        <div className="flex gap-2">
                            <button onClick={() => setIsEditing(false)} className="border border-gray-500 hover:bg-gray-900 text-white font-bold px-4 py-1.5 rounded-full">
                                Cancelar
                            </button>
                            <button onClick={handleSave} className="bg-white hover:bg-gray-200 text-black font-bold px-4 py-1.5 rounded-full">
                                Salvar
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="border border-gray-500 hover:bg-gray-900 text-white font-bold px-4 py-1.5 rounded-full">
                            Editar Perfil
                        </button>
                    )
                ) : (
                    <div className="flex gap-2">
                        <button 
                            onClick={() => onMessage && onMessage(user.id)}
                            className="border border-gray-500 hover:bg-gray-900 text-white p-2 rounded-full transition"
                            title="Enviar Mensagem"
                        >
                            <Mail className="w-5 h-5" />
                        </button>
                         <button className="bg-white hover:bg-gray-200 text-black font-bold px-4 py-1.5 rounded-full">
                            Seguir
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* Text Details */}
        <div className="mt-2 space-y-3">
            {isEditing ? (
                <div className="space-y-4 max-w-md">
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold">Nome</label>
                        <input 
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold">Bio</label>
                        <textarea 
                            value={editBio}
                            onChange={(e) => setEditBio(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-blue-500 outline-none resize-none h-20"
                        />
                    </div>
                </div>
            ) : (
                <>
                    <div>
                        <h2 className="text-xl font-bold text-white">{user.displayName}</h2>
                        <p className="text-gray-500">@{user.handle}</p>
                    </div>
                    <p className="text-white whitespace-pre-wrap">{user.bio}</p>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-gray-500 text-sm mb-2">
                        <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>SimuVerse</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Ingressou em 2024</span>
                        </div>
                    </div>

                    <div className="flex gap-4 text-sm mb-4">
                        <span className="text-white font-bold">{user.following} <span className="text-gray-500 font-normal">Seguindo</span></span>
                        <span className="text-white font-bold">{user.followers} <span className="text-gray-500 font-normal">Seguidores</span></span>
                    </div>

                    {/* RPG Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <StatPill 
                            label="Aura" 
                            value={user.aura || 0} 
                            icon={<Crown className="w-4 h-4" />} 
                            color="text-yellow-400 border-yellow-500/30" 
                        />
                         <StatPill 
                            label="Popularidade" 
                            value={user.popularity || 0} 
                            icon={<Zap className="w-4 h-4" />} 
                            color="text-green-400 border-green-500/30" 
                        />
                         <StatPill 
                            label="Criatividade" 
                            value={user.creativity || 0} 
                            icon={<Palette className="w-4 h-4" />} 
                            color="text-pink-400 border-pink-500/30" 
                        />
                    </div>
                </>
            )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        <div className="flex-1 hover:bg-gray-900 transition cursor-pointer p-4 text-center border-b-4 border-blue-500 font-bold text-white">
            Posts
        </div>
        <div className="flex-1 hover:bg-gray-900 transition cursor-pointer p-4 text-center text-gray-500">
            Respostas
        </div>
        <div className="flex-1 hover:bg-gray-900 transition cursor-pointer p-4 text-center text-gray-500">
            Mídia
        </div>
        <div className="flex-1 hover:bg-gray-900 transition cursor-pointer p-4 text-center text-gray-500">
            Curtidas
        </div>
      </div>

      {/* Tweets List */}
      <div>
         {userTweets.map(tweet => (
             <TweetCard 
                key={tweet.id} 
                tweet={tweet} 
                author={user} 
                visualStyle={visualStyle} 
                onLike={onLike}
                isLiked={tweet.likedBy?.includes(currentUserId || '')}
             />
         ))}
         {userTweets.length === 0 && (
             <div className="p-8 text-center text-gray-500">
                 Ainda não há posts.
             </div>
         )}
      </div>
    </div>
  );
};
