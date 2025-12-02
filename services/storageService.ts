
import { WorldState } from '../types';

const STORAGE_KEY = 'simuverse_saves_v1';

export interface SavedGame {
    id: string;
    timestamp: number;
    scenario: string;
    userName: string;
    userHandle: string;
    worldState: WorldState;
}

export const getSavedGames = (): SavedGame[] => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        // Validate that it's an array
        if (!Array.isArray(parsed)) return [];
        return parsed;
    } catch (e) {
        console.error("Failed to load saves", e);
        return [];
    }
};

export const generateSaveId = (world: WorldState) => {
    if (world.id) return world.id;
    if (!world.userProfile) return 'unknown';
    // Fallback for older saves
    return `${world.userProfile.handle}-${world.scenarioName.replace(/\s+/g, '-')}`;
};

export const saveGame = (world: WorldState) => {
    if (!world.userProfile) return;
    
    try {
        const saves = getSavedGames();
        // Create a unique ID based on world ID or handle/scenario
        const id = generateSaveId(world);
        
        // Ensure world has the ID if it didn't
        if (!world.id) world.id = id;

        const newSave: SavedGame = {
            id,
            timestamp: Date.now(),
            scenario: world.scenarioName,
            userName: world.userProfile.displayName,
            userHandle: world.userProfile.handle,
            worldState: world
        };
        
        // Remove existing save with same ID (update it) to prevent duplicates
        const filtered = saves.filter(s => s.id !== id);
        
        // Add to front
        filtered.unshift(newSave);
        
        // Limit to 20 to allow more scenarios
        const trimmed = filtered.slice(0, 20);
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e) {
        console.error("Storage full or error", e);
    }
};

export const deleteGame = (id: string) => {
    const saves = getSavedGames().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
};
