
import { UserProfile, TweetMedia } from '../types';

export const getAvatarUrl = (profile: UserProfile, visualStyle: string = "realistic") => {
    // If the user has uploaded a custom image, use it
    if (profile.avatarUrl) {
        return profile.avatarUrl;
    }
    
    // Fallback to picsum for stable, fast, consistent avatars
    return `https://picsum.photos/seed/${profile.avatarSeed}/200`;
};

export const getTweetImageUrl = (media: TweetMedia, visualStyle: string = "realistic") => {
    // If it's a data URL (user upload), return it directly
    if (media.url && media.url.startsWith('data:')) {
        return media.url;
    }
    
    // Fallback for any other image needs
    return `https://picsum.photos/seed/${media.thumbnailSeed}/800/450`;
};

export const getBannerUrl = (seed: string, visualStyle: string = "realistic") => {
    // Standard abstract banner
    return `https://picsum.photos/seed/${seed}/1000/300`;
};
