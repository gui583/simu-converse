
import React from 'react';
import { Home, Search, Bell, Mail, User, LogOut, Settings, Feather, Cloud, Check, Swords, Crown, Zap, Sparkles } from 'lucide-react';
import { UserProfile, ScreenState } from '../types';
import { getAvatarUrl } from '../services/imageService';

interface SidebarProps {
  user: UserProfile | null;
  onLogout: () => void;
  currentScreen: ScreenState;
  onNavigate: (screen: ScreenState) => void;
  isSaving: boolean;
  visualStyle?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, onLogout, currentScreen, onNavigate, isSaving, visualStyle }) => {
  return (
    <div className="hidden sm:flex flex-col h-full pl-2 pr-4 md:w-[275px]">
      <div className="p-3 mb-2">
        <div 
            className="w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center cursor-pointer transition shadow-lg shadow-blue-500/20" 
            onClick={() => onNavigate('FEED')}
        >
            <Sparkles className="text-white w-7 h-7 fill-current" />
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        <NavItem 
          icon={<Home className="w-7 h-7" />} 
          label="Início" 
          active={currentScreen === 'FEED'} 
          onClick={() => onNavigate('FEED')}
        />
        <NavItem 
          icon={<Search className="w-7 h-7" />} 
          label="Explorar" 
          active={currentScreen === 'EXPLORE'} 
          onClick={() => onNavigate('EXPLORE')}
        />
        <NavItem 
          icon={<Swords className="w-7 h-7" />} 
          label="Eventos (RPG)" 
          active={currentScreen === 'RPG'} 
          onClick={() => onNavigate('RPG')}
        />
        <NavItem 
          icon={<Bell className="w-7 h-7" />} 
          label="Notificações" 
          active={currentScreen === 'NOTIFICATIONS'} 
          onClick={() => onNavigate('NOTIFICATIONS')}
        />
         <NavItem 
          icon={<Mail className="w-7 h-7" />} 
          label="Mensagens" 
          active={currentScreen === 'MESSAGES' || currentScreen === 'CHAT'} 
          onClick={() => onNavigate('MESSAGES')}
        />
        <NavItem 
          icon={<User className="w-7 h-7" />} 
          label="Perfil" 
          active={currentScreen === 'PROFILE'} 
          onClick={() => onNavigate('PROFILE')}
        />
        <NavItem 
          icon={<Settings className="w-7 h-7" />} 
          label="Configurações" 
          active={currentScreen === 'SETTINGS'} 
          onClick={() => onNavigate('SETTINGS')}
        />

        <button 
          onClick={() => onNavigate('FEED')}
          className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3.5 rounded-full shadow-lg transition duration-200 hidden xl:block"
        >
          Postar
        </button>
        <button 
          onClick={() => onNavigate('FEED')}
          className="mt-4 w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition duration-200 xl:hidden"
        >
          <Feather className="w-6 h-6" />
        </button>
      </nav>

      <div className="px-3 mb-2 hidden xl:flex items-center gap-2 text-xs text-gray-500 transition-opacity duration-500">
         <Cloud className={`w-3 h-3 ${isSaving ? 'animate-pulse text-yellow-500' : 'text-green-500'}`} />
         {isSaving ? "Salvando na nuvem..." : "Salvo e Seguro"}
      </div>

      {user && (
        <div className="mb-4 p-3 rounded-full hover:bg-gray-900 transition flex items-center justify-between cursor-pointer group" onClick={onLogout}>
          <div className="flex items-center gap-3">
             <img 
                src={getAvatarUrl(user, visualStyle)}
                alt={user.displayName}
                className="w-10 h-10 rounded-full object-cover"
            />
            <div className="hidden xl:block">
                <p className="font-bold text-sm text-white truncate max-w-[120px]">{user.displayName}</p>
                
                {/* Mini Stats */}
                <div className="flex items-center gap-3 text-xs mt-0.5">
                   <span className="flex items-center gap-1 text-yellow-500" title="Aura">
                      <Crown className="w-3 h-3 fill-current" />
                      {user.aura || 0}
                   </span>
                   <span className="flex items-center gap-1 text-green-500" title="Popularidade">
                      <Zap className="w-3 h-3 fill-current" />
                      {user.popularity || 0}
                   </span>
                </div>
            </div>
          </div>
          <div className="hidden xl:block">
            <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-500" />
          </div>
        </div>
      )}
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className="flex items-center gap-4 p-3 rounded-full hover:bg-gray-900 transition w-fit xl:w-full group">
    <div className={`${active ? 'text-white font-bold' : 'text-gray-300 group-hover:text-white'} transition relative`}>
      {icon}
      {active && <div className="absolute -right-1 -top-1 w-2 h-2 bg-blue-500 rounded-full" />}
    </div>
    <span className={`hidden xl:block text-xl ${active ? 'font-bold text-white' : 'text-gray-300 group-hover:text-white'}`}>
      {label}
    </span>
  </button>
);
