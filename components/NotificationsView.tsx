
import React from 'react';
import { Notification } from '../types';
import { Heart, UserPlus, AtSign, Star } from 'lucide-react';
import { getAvatarUrl } from '../services/imageService';

interface NotificationsViewProps {
  notifications: Notification[];
  visualStyle?: string;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ notifications, visualStyle = "realistic" }) => {
  const getIcon = (type: string) => {
    switch (type) {
        case 'LIKE': return <Heart className="w-7 h-7 text-pink-500 fill-current" />;
        case 'FOLLOW': return <UserPlus className="w-7 h-7 text-blue-500 fill-current" />;
        case 'MENTION': return <AtSign className="w-7 h-7 text-green-500" />;
        case 'WELCOME': return <Star className="w-7 h-7 text-purple-500 fill-current" />;
        default: return <Star className="w-7 h-7 text-blue-500" />;
    }
  };

  return (
    <div>
      <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-gray-800 px-4 py-3">
        <h2 className="text-xl font-bold text-white">Notificações</h2>
      </div>

      <div>
        {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
                Você não tem notificações ainda. Interaja com o mundo!
            </div>
        ) : (
            notifications.map(note => (
                <div key={note.id} className={`p-4 border-b border-gray-800 hover:bg-gray-900 transition flex gap-4 ${!note.read ? 'bg-gray-900/20' : ''}`}>
                    <div className="pt-1">
                        {getIcon(note.type)}
                    </div>
                    <div className="flex-1">
                        <div className="mb-2">
                             {note.user && (
                                 <img 
                                    src={getAvatarUrl(note.user, visualStyle)}
                                    className="w-8 h-8 rounded-full mb-2 object-cover"
                                    alt="Avatar"
                                 />
                             )}
                             <p className="text-white">
                                {note.user && <span className="font-bold">{note.user.displayName} </span>}
                                {note.content}
                             </p>
                        </div>
                        <p className="text-gray-500 text-sm">{note.timestamp}</p>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};
