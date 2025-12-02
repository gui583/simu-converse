
import React from 'react';
import { Sidebar } from './Sidebar';
import { TrendsSidebar } from './TrendsSidebar';
import { UserProfile, ScreenState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: UserProfile | null;
  trends: string[];
  onLogout: () => void;
  suggestedUsers: UserProfile[];
  currentScreen: ScreenState;
  onNavigate: (screen: ScreenState) => void;
  onSearch: (query: string) => void;
  isSaving?: boolean;
  onToggleFollow?: (userId: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  trends, 
  onLogout, 
  suggestedUsers, 
  currentScreen, 
  onNavigate, 
  onSearch, 
  isSaving = false,
  onToggleFollow
}) => {
  return (
    <div className="container mx-auto max-w-7xl min-h-screen flex">
      <header className="flex-shrink-0 w-auto xl:w-[275px] border-r border-gray-800 sticky top-0 h-screen">
        <Sidebar 
          user={user} 
          onLogout={onLogout} 
          currentScreen={currentScreen} 
          onNavigate={onNavigate}
          isSaving={isSaving}
        />
      </header>
      
      <main className="flex-1 border-r border-gray-800 max-w-[600px] w-full min-h-screen">
        {children}
      </main>

      <aside className="hidden lg:block w-[350px] pl-8 py-4 flex-shrink-0">
        <TrendsSidebar 
          trends={trends} 
          suggestedUsers={suggestedUsers} 
          onSearch={onSearch}
          currentUser={user}
          onToggleFollow={onToggleFollow}
        />
      </aside>
    </div>
  );
};
