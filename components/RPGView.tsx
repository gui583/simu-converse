
import React, { useState } from 'react';
import { UserProfile, WorldState } from '../types';
import { ArrowLeft, Swords, CheckCircle2, Loader2, Users } from 'lucide-react';
import { getAvatarUrl } from '../services/imageService';

interface RPGViewProps {
  world: WorldState;
  onBack: () => void;
  onSubmit: (title: string, description: string, participantIds: string[]) => void;
  isGenerating: boolean;
  visualStyle?: string;
}

export const RPGView: React.FC<RPGViewProps> = ({ world, onBack, onSubmit, isGenerating, visualStyle = "realistic" }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  
  // Filter out the current user for selection logic (though user can theoretically participate, usually you narrate interactions with NPCs)
  const availableNPCs = world.profiles.filter(p => p.type !== 'USER');

  const toggleParticipant = (id: string) => {
    setSelectedParticipants(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) return;
    onSubmit(title, description, selectedParticipants);
  };

  return (
    <div>
      <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-gray-800 px-4 py-3 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-800 rounded-full transition">
           <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-purple-500" />
            <h2 className="text-xl font-bold text-white">Criar Evento RPG</h2>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-20">
        
        {/* Intro Box */}
        <div className="bg-purple-900/10 border border-purple-500/30 rounded-xl p-4">
            <h3 className="text-purple-400 font-bold mb-1">Narrativa do Mundo</h3>
            <p className="text-sm text-gray-400">
                Crie um momento específico, uma batalha, um escândalo ou um encontro. 
                Descreva o que aconteceu e a IA gerará as reações do mundo e dos personagens envolvidos.
            </p>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">Título do Evento</label>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                    placeholder="Ex: A Batalha do Vale, O Casamento Real, O Show da Virada..."
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">Descrição da Cena</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full h-40 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none resize-none"
                    placeholder="Descreva o que aconteceu, quem fez o que, qual foi o resultado..."
                />
            </div>
        </div>

        {/* Participant Selector */}
        <div>
            <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-gray-400" />
                <label className="block text-sm font-bold text-gray-300">Personagens Envolvidos (Opcional)</label>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {availableNPCs.map(npc => {
                    const isSelected = selectedParticipants.includes(npc.id);
                    return (
                        <div 
                            key={npc.id}
                            onClick={() => toggleParticipant(npc.id)}
                            className={`
                                flex items-center gap-3 p-2 rounded-lg cursor-pointer border transition
                                ${isSelected 
                                    ? 'bg-purple-900/20 border-purple-500' 
                                    : 'bg-gray-900 border-gray-800 hover:border-gray-600'
                                }
                            `}
                        >
                            <img 
                                src={getAvatarUrl(npc, visualStyle)} 
                                className="w-8 h-8 rounded-full object-cover"
                                alt={npc.displayName}
                            />
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold truncate ${isSelected ? 'text-purple-400' : 'text-white'}`}>
                                    {npc.displayName}
                                </p>
                                <p className="text-xs text-gray-500 truncate">@{npc.handle}</p>
                            </div>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-500" />}
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Action Button */}
        <button
            onClick={handleSubmit}
            disabled={!title.trim() || !description.trim() || isGenerating}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-4 rounded-full shadow-lg shadow-purple-900/20 transition flex items-center justify-center gap-2"
        >
            {isGenerating ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Simulando Reações...
                </>
            ) : (
                <>
                    <Swords className="w-5 h-5" />
                    Publicar Evento e Ver Reações
                </>
            )}
        </button>

      </div>
    </div>
  );
};
