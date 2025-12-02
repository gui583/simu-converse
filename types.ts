
export enum ProfileType {
  NORMAL = 'NORMAL',
  GOSSIP = 'GOSSIP',
  SPORTS = 'SPORTS',
  COOKING = 'COOKING',
  OFFICIAL = 'OFFICIAL',
  HUMOR = 'HUMOR',
  USER = 'USER'
}

export type ScenarioCategory = 'NORMAL' | 'NEWS' | 'RECIPES' | 'JOKES';

export type AppLanguage = 'pt-BR' | 'en-US' | 'es-ES';

export interface UserProfile {
  id: string;
  handle: string;
  displayName: string;
  bio: string;
  avatarSeed: string; // Used as the prompt subject now
  avatarUrl?: string; // Optional custom uploaded avatar (Base64)
  type: ProfileType;
  followers: number;
  following: number;
  followingIds: string[]; // List of user IDs this profile follows
  isVerified?: boolean;
  // RPG Stats
  aura: number;
  popularity: number;
  creativity: number;
}

export interface TweetMedia {
  type: 'IMAGE' | 'AUDIO';
  url?: string; // Optional real URL, usually simulated via seed
  thumbnailSeed: string; // Used as prompt description
  description?: string; // Alt text/context
}

export interface Tweet {
  id: string;
  authorId: string;
  content: string;
  timestamp: string;
  likes: number;
  likedBy?: string[]; // List of IDs who liked this tweet
  retweets: number;
  replies: number;
  replyToId?: string; // If it's a reply
  media?: TweetMedia; 
}

export interface TweetImpact {
  followersChange: number;
  auraChange: number;
  popularityChange: number;
  creativityChange: number;
  analysis: string; // Short text explaining why (e.g., "Fans loved the shade!")
}

export interface Notification {
  id: string;
  type: 'LIKE' | 'FOLLOW' | 'MENTION' | 'WELCOME';
  content: string;
  user?: UserProfile; // Who triggered it
  timestamp: string;
  read: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  read?: boolean;
}

export interface Conversation {
  id: string;
  participantId: string; // The NPC's ID
  messages: Message[];
  unreadCount: number;
  lastMessageTimestamp: string;
}

export interface AppSettings {
  themeColor: 'blue' | 'green' | 'pink' | 'purple' | 'orange';
  soundEnabled: boolean;
  customKeySoundUrl?: string; // Base64 string of custom audio
}

export interface WorldState {
  id?: string; // Unique identifier for the save file
  scenarioName: string;
  scenarioDescription: string;
  visualStyle: string; // E.g., "anime style", "cinematic", "pixel art"
  category?: ScenarioCategory; // The theme of the world
  language: AppLanguage; // The language of the simulation
  profiles: UserProfile[];
  tweets: Tweet[];
  userProfile: UserProfile | null;
  trends: string[];
  notifications: Notification[];
  conversations: Conversation[]; // New: Private messages
  gameTime: number; // Abstract tick counter
}

export type ScreenState = 'SETUP' | 'FEED' | 'PROFILE' | 'THREAD' | 'EXPLORE' | 'NOTIFICATIONS' | 'SETTINGS' | 'MESSAGES' | 'CHAT' | 'RPG';

export interface SetupFormData {
  scenario: string;
  category: ScenarioCategory;
  language: AppLanguage;
  userParams: {
    name: string;
    handle: string;
    bio: string;
  };
}
