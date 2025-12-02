
import React, { useState, useEffect } from 'react';
import { SetupFormData, WorldState, ScenarioCategory, AppLanguage } from '../types';
import { Loader2, Sparkles, Trash2, Clock, CloudLightning, Newspaper, Utensils, Smile, LayoutTemplate, Cloud, Globe } from 'lucide-react';
import { getSavedGames, deleteGame, SavedGame } from '../services/storageService';
import { getAvatarUrl } from '../services/imageService';

interface SetupGameProps {
  onStart: (data: SetupFormData) => void;
  onLoad: (world: WorldState) => void;
  isLoading: boolean;
}

const translations = {
  'pt-BR': {
    newGame: "Novo Jogo",
    subtitle: "Crie seu universo. A IA cria a vida.",
    languageLabel: "Idioma do Universo",
    scenarioLabel: "Escolha ou Descreva seu Cenário",
    scenarioPlaceholder: "Ex: Uma colônia em Marte onde a água é moeda de troca...",
    contentFocusLabel: "Foco do Conteúdo",
    yourCharacter: "Seu Personagem",
    nameLabel: "Nome",
    namePlaceholder: "Ex: João da Silva",
    handleLabel: "Arroba (@)",
    handlePlaceholder: "joao_silva",
    bioLabel: "Bio (Opcional)",
    bioPlaceholder: "Ex: Apenas um cara normal tentando sobreviver...",
    createButton: "Criar Mundo",
    generating: "Gerando Universo...",
    simuCloud: "SimuCloud",
    savedGamesSubtitle: "Seus universos salvos automaticamente.",
    noSavedGames: "Nenhum jogo salvo encontrado.",
    savedLabel: "Salvo",
    deleteConfirm: "Tem certeza que deseja excluir este universo? Todo o progresso será perdido.",
    presets: [
        "Hogwarts em 2024: Magia e Smartphones",
        "Gotham City: O Cavaleiro das Trevas vs Influencers",
        "Vila Olímpica de Paris 2024",
        "Reality Show: A Fazenda Espacial",
        "High School Musical mas é Drama Realista"
    ],
    categories: {
        NORMAL: { label: 'Padrão', desc: 'Balanceado' },
        NEWS: { label: 'Notícias', desc: 'Foco em fatos' },
        RECIPES: { label: 'Culinária', desc: 'Receitas e chefs' },
        JOKES: { label: 'Humor', desc: 'Só risadas' },
    }
  },
  'en-US': {
    newGame: "New Game",
    subtitle: "Create your universe. AI creates life.",
    languageLabel: "Universe Language",
    scenarioLabel: "Choose or Describe your Scenario",
    scenarioPlaceholder: "Ex: A colony on Mars where water is currency...",
    contentFocusLabel: "Content Focus",
    yourCharacter: "Your Character",
    nameLabel: "Name",
    namePlaceholder: "Ex: John Doe",
    handleLabel: "Handle (@)",
    handlePlaceholder: "john_doe",
    bioLabel: "Bio (Optional)",
    bioPlaceholder: "Ex: Just a normal guy trying to survive...",
    createButton: "Create World",
    generating: "Generating Universe...",
    simuCloud: "SimuCloud",
    savedGamesSubtitle: "Your universes saved automatically.",
    noSavedGames: "No saved games found.",
    savedLabel: "Saved",
    deleteConfirm: "Are you sure you want to delete this universe? All progress will be lost.",
    presets: [
        "Hogwarts in 2024: Magic and Smartphones",
        "Gotham City: The Dark Knight vs Influencers",
        "Paris 2024 Olympic Village",
        "Reality Show: Space Farm",
        "High School Musical but Realistic Drama"
    ],
    categories: {
        NORMAL: { label: 'Standard', desc: 'Balanced' },
        NEWS: { label: 'News', desc: 'Fact focused' },
        RECIPES: { label: 'Cooking', desc: 'Recipes & chefs' },
        JOKES: { label: 'Humor', desc: 'Just laughs' },
    }
  },
  'es-ES': {
    newGame: "Nuevo Juego",
    subtitle: "Crea tu universo. La IA crea la vida.",
    languageLabel: "Idioma del Universo",
    scenarioLabel: "Elige o Describe tu Escenario",
    scenarioPlaceholder: "Ej: Una colonia en Marte donde el agua es moneda...",
    contentFocusLabel: "Enfoque del Contenido",
    yourCharacter: "Tu Personaje",
    nameLabel: "Nombre",
    namePlaceholder: "Ej: Juan Pérez",
    handleLabel: "Usuario (@)",
    handlePlaceholder: "juan_perez",
    bioLabel: "Bio (Opcional)",
    bioPlaceholder: "Ej: Solo un tipo normal tratando de sobrevivir...",
    createButton: "Crear Mundo",
    generating: "Generando Universo...",
    simuCloud: "SimuCloud",
    savedGamesSubtitle: "Tus universos guardados automáticamente.",
    noSavedGames: "No se encontraron juegos guardados.",
    savedLabel: "Guardado",
    deleteConfirm: "¿Estás seguro de que quieres eliminar este universo? Se perderá todo el progreso.",
    presets: [
        "Hogwarts en 2024: Magia y Smartphones",
        "Gotham City: El Caballero Oscuro vs Influencers",
        "Villa Olímpica de París 2024",
        "Reality Show: La Granja Espacial",
        "High School Musical pero Drama Realista"
    ],
    categories: {
        NORMAL: { label: 'Estándar', desc: 'Equilibrado' },
        NEWS: { label: 'Noticias', desc: 'Enfoque en hechos' },
        RECIPES: { label: 'Cocina', desc: 'Recetas y chefs' },
        JOKES: { label: 'Humor', desc: 'Solo risas' },
    }
  }
};

export const SetupGame: React.FC<SetupGameProps> = ({ onStart, onLoad, isLoading }) => {
  const [scenario, setScenario] = useState('');
  const [category, setCategory] = useState<ScenarioCategory>('NORMAL');
  const [language, setLanguage] = useState<AppLanguage>('pt-BR');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [savedGames, setSavedGames] = useState<SavedGame[]>([]);

  // Get current translation based on state
  const t = translations[language];

  useEffect(() => {
    // Load saved games immediately from local storage
    setSavedGames(getSavedGames());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenario || !name || !handle) return;
    onStart({ scenario, category, language, userParams: { name, handle, bio } });
  };

  const handleDeleteSave = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(window.confirm(t.deleteConfirm)) {
        deleteGame(id);
        setSavedGames(getSavedGames());
    }
  };

  const categories: { id: ScenarioCategory; icon: React.ReactNode }[] = [
    { id: 'NORMAL', icon: <LayoutTemplate className="w-5 h-5"/> },
    { id: 'NEWS', icon: <Newspaper className="w-5 h-5"/> },
    { id: 'RECIPES', icon: <Utensils className="w-5 h-5"/> },
    { id: 'JOKES', icon: <Smile className="w-5 h-5"/> },
  ];

  const languages: { id: AppLanguage; label: string; flag: string }[] = [
    { id: 'pt-BR', label: 'Português (BR)', flag: '🇧🇷' },
    { id: 'en-US', label: 'English (US)', flag: '🇺🇸' },
    { id: 'es-ES', label: 'Español', flag: '🇪🇸' },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Create New Game Column */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 shadow-2xl">
            <div className="text-center mb-6">
            <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-white w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold mb-2">{t.newGame}</h1>
            <p className="text-gray-400">{t.subtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Language Selector */}
            <div>
                 <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" /> {t.languageLabel}
                 </label>
                 <div className="flex bg-black rounded-lg p-1 border border-gray-700">
                     {languages.map(lang => (
                         <button
                            key={lang.id}
                            type="button"
                            onClick={() => setLanguage(lang.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-md transition ${language === lang.id ? 'bg-gray-800 text-white font-bold shadow' : 'text-gray-500 hover:text-gray-300'}`}
                         >
                             <span>{lang.flag}</span>
                             <span className="hidden sm:inline">{lang.label}</span>
                         </button>
                     ))}
                 </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                {t.scenarioLabel}
                </label>
                <textarea
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition h-24 resize-none"
                placeholder={t.scenarioPlaceholder}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                {t.presets.map((preset) => (
                    <button
                    key={preset}
                    type="button"
                    onClick={() => setScenario(preset)}
                    className="text-xs bg-gray-800 hover:bg-gray-700 text-blue-400 px-3 py-1 rounded-full border border-gray-700 transition"
                    >
                    {preset}
                    </button>
                ))}
                </div>
            </div>

            {/* Category Selector */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t.contentFocusLabel}
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => (
                        <div 
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            className={`
                                cursor-pointer rounded-lg p-3 border transition flex items-center gap-3
                                ${category === cat.id 
                                    ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                                    : 'bg-black border-gray-700 hover:border-gray-500 text-gray-400'
                                }
                            `}
                        >
                            {cat.icon}
                            <div>
                                <p className="font-bold text-sm">{t.categories[cat.id].label}</p>
                                <p className="text-[10px] opacity-80">{t.categories[cat.id].desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-800">
                <h2 className="text-lg font-semibold text-white">{t.yourCharacter}</h2>
                
                <div>
                <label className="block text-xs text-gray-500 uppercase font-bold mb-1">{t.nameLabel}</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black border border-gray-700 rounded-lg p-2 text-white focus:border-blue-500 outline-none"
                    placeholder={t.namePlaceholder}
                />
                </div>

                <div>
                <label className="block text-xs text-gray-500 uppercase font-bold mb-1">{t.handleLabel}</label>
                <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">@</span>
                    <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.replace(/\s/g, ''))}
                    className="w-full bg-black border border-gray-700 rounded-lg p-2 pl-7 text-white focus:border-blue-500 outline-none"
                    placeholder={t.handlePlaceholder}
                    />
                </div>
                </div>

                <div>
                <label className="block text-xs text-gray-500 uppercase font-bold mb-1">{t.bioLabel}</label>
                <input
                    type="text"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-black border border-gray-700 rounded-lg p-2 text-white focus:border-blue-500 outline-none"
                    placeholder={t.bioPlaceholder}
                />
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading || !scenario || !name || !handle}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-full transition flex items-center justify-center gap-2"
            >
                {isLoading ? (
                <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    {t.generating}
                </>
                ) : (
                t.createButton
                )}
            </button>
            </form>
        </div>

        {/* Saved Games Column */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 shadow-2xl flex flex-col h-full relative overflow-hidden">
            <div className="text-center mb-6">
                <div className="bg-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CloudLightning className="text-white w-6 h-6" />
                </div>
                <h1 className="text-3xl font-bold mb-2">{t.simuCloud}</h1>
                <p className="text-gray-400">{t.savedGamesSubtitle}</p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[500px] no-scrollbar">
                {savedGames.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                        <Cloud className="w-12 h-12 mb-2" />
                        <p>{t.noSavedGames}</p>
                    </div>
                ) : (
                    savedGames.map((save) => {
                        // Fallback logic for loading avatar without loading entire world context yet
                        const userProfile = save.worldState.userProfile;
                        const avatarUrl = userProfile 
                            ? getAvatarUrl(userProfile, save.worldState.visualStyle || "realistic") 
                            : "";

                        return (
                            <div 
                                key={save.id}
                                onClick={() => !isLoading && onLoad(save.worldState)}
                                className={`group relative bg-black border border-gray-800 hover:border-blue-500 p-4 rounded-xl cursor-pointer transition ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                <div className="flex items-center gap-4">
                                    <img 
                                        src={avatarUrl}
                                        alt={save.userName}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-700 group-hover:border-blue-500 transition"
                                    />
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-white truncate max-w-[150px]">{save.scenario}</h3>
                                            <span className="flex items-center gap-1 text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                                                <CloudLightning className="w-3 h-3" />
                                                {t.savedLabel}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400 truncate">{save.userName} <span className="text-gray-600">(@{save.userHandle})</span></p>
                                        <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(save.timestamp).toLocaleDateString()}
                                            {save.worldState.language && (
                                                <span className="ml-2 px-1 bg-gray-800 rounded text-[10px] border border-gray-700 uppercase">
                                                    {save.worldState.language}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Delete Button - Always visible now */}
                                <button 
                                    onClick={(e) => handleDeleteSave(e, save.id)}
                                    className="absolute top-1/2 -translate-y-1/2 right-4 p-2 bg-gray-800 text-gray-400 hover:text-white hover:bg-red-600 rounded-full transition shadow-lg z-10"
                                    title="Apagar"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>

      </div>
    </div>
  );
};
