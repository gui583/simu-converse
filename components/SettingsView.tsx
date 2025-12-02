
import React, { useState, useRef } from 'react';
import { AppSettings, UserProfile, Tweet } from '../types';
import { ArrowLeft, Palette, Globe, Search, Plus, Loader2, BadgeCheck, Trash2, AlertTriangle, CheckCircle2, Info, Volume2, ToggleLeft, ToggleRight, Music } from 'lucide-react';
import { getAvatarUrl } from '../services/imageService';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (s: AppSettings) => void;
  onBack: () => void;
  onPreviewCharacter?: (name: string) => Promise<{ profile: UserProfile, introTweet: Tweet } | null>;
  onAddCharacter?: (data: { profile: UserProfile, introTweet: Tweet }) => void;
  onDeleteWorld?: () => void;
  visualStyle?: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdateSettings, onBack, onPreviewCharacter, onAddCharacter, onDeleteWorld, visualStyle = "realistic" }) => {
  const [activeTab, setActiveTab] = useState<'APP' | 'WORLD'>('APP');
  const [characterQuery, setCharacterQuery] = useState('');
  const [isGeneratingChar, setIsGeneratingChar] = useState(false);
  const [previewData, setPreviewData] = useState<{ profile: UserProfile, introTweet: Tweet } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const soundInputRef = useRef<HTMLInputElement>(null);

  const colors: {name: string, value: AppSettings['themeColor'], class: string}[] = [
    { name: 'Azul (Padrão)', value: 'blue', class: 'bg-blue-500' },
    { name: 'Verde', value: 'green', class: 'bg-green-500' },
    { name: 'Rosa', value: 'pink', class: 'bg-pink-500' },
    { name: 'Roxo', value: 'purple', class: 'bg-purple-500' },
    { name: 'Laranja', value: 'orange', class: 'bg-orange-500' },
  ];

  const handleSearchCharacter = async () => {
    if (!characterQuery.trim() || !onPreviewCharacter) return;
    setIsGeneratingChar(true);
    setPreviewData(null);
    try {
        const result = await onPreviewCharacter(characterQuery);
        if (result) {
            setPreviewData(result);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setIsGeneratingChar(false);
    }
  };

  const handleConfirmAdd = () => {
      if (previewData && onAddCharacter) {
          onAddCharacter(previewData);
          setCharacterQuery('');
          setPreviewData(null);
          alert("Personagem adicionado com sucesso!");
      }
  };

  const handleDeleteClick = () => {
      if (confirmDelete) {
          if (onDeleteWorld) onDeleteWorld();
      } else {
          setConfirmDelete(true);
          // Auto reset after 3 seconds if not clicked
          setTimeout(() => setConfirmDelete(false), 3000);
      }
  };

  const handleSoundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              onUpdateSettings({ ...settings, customKeySoundUrl: reader.result as string });
          };
          reader.readAsDataURL(file);
      }
  };

  const handleRemoveCustomSound = () => {
      onUpdateSettings({ ...settings, customKeySoundUrl: undefined });
  };

  return (
    <div>
        <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-gray-800 px-4 py-3 flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-800 rounded-full transition">
                <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h2 className="text-xl font-bold text-white">Configurações</h2>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800">
             <button 
                onClick={() => setActiveTab('APP')}
                className={`flex-1 p-4 text-center font-bold hover:bg-gray-900 transition ${activeTab === 'APP' ? 'text-white border-b-4 border-blue-500' : 'text-gray-500'}`}
             >
                Aparência
             </button>
             <button 
                onClick={() => setActiveTab('WORLD')}
                className={`flex-1 p-4 text-center font-bold hover:bg-gray-900 transition ${activeTab === 'WORLD' ? 'text-white border-b-4 border-blue-500' : 'text-gray-500'}`}
             >
                Gerenciar Mundo
             </button>
        </div>

        <div className="p-4">
            
            {activeTab === 'APP' && (
                <div className="space-y-6">
                    <div className="bg-gray-900 rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-gray-800 rounded-full">
                                <Palette className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-lg">Cor de destaque</h4>
                                <p className="text-gray-500 text-sm">Escolha a cor principal do SimuVerse.</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 justify-center">
                            {colors.map(c => (
                                <button
                                    key={c.value}
                                    onClick={() => onUpdateSettings({ ...settings, themeColor: c.value })}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition hover:scale-110 ${c.class} ${settings.themeColor === c.value ? 'ring-4 ring-white' : ''}`}
                                    title={c.name}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <div className="p-3 bg-gray-800 rounded-full">
                                    <Volume2 className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">Sons do Teclado</h4>
                                    <p className="text-gray-500 text-sm">Efeitos sonoros ao digitar.</p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
                                className={`w-14 h-8 rounded-full flex items-center p-1 transition-colors duration-300 ${settings.soundEnabled ? 'bg-green-500' : 'bg-gray-700'}`}
                            >
                                <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        {settings.soundEnabled && (
                            <div className="bg-black/50 p-4 rounded-xl border border-gray-700">
                                <h5 className="text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                                    <Music className="w-4 h-4" />
                                    Som Personalizado
                                </h5>
                                <div className="flex items-center gap-2">
                                    {settings.customKeySoundUrl ? (
                                        <div className="flex-1 flex items-center justify-between bg-gray-800 px-3 py-2 rounded-lg">
                                            <span className="text-sm text-green-400 flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4" /> Som Ativo
                                            </span>
                                            <button 
                                                onClick={handleRemoveCustomSound}
                                                className="text-xs text-red-400 hover:text-red-300 font-bold"
                                            >
                                                Restaurar Padrão
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => soundInputRef.current?.click()}
                                            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm py-2 px-3 rounded-lg transition text-left"
                                        >
                                            Clique para enviar som (MP3/WAV)...
                                        </button>
                                    )}
                                    <input 
                                        type="file" 
                                        accept="audio/*" 
                                        ref={soundInputRef} 
                                        className="hidden" 
                                        onChange={handleSoundUpload}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Envie um arquivo de áudio curto para substituir o som de "clique" mecânico padrão.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'WORLD' && (
                <div className="space-y-6">
                     <div className="bg-gray-900 rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-gray-800 rounded-full">
                                <Globe className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-lg">Adicionar Personagem</h4>
                                <p className="text-gray-500 text-sm">Traga alguém de outro universo para cá.</p>
                            </div>
                        </div>

                        <div className="flex gap-2 mb-4">
                            <input 
                                value={characterQuery}
                                onChange={(e) => setCharacterQuery(e.target.value)}
                                placeholder="Nome (ex: Batman, Naruto)"
                                className="flex-1 bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                            />
                            <button 
                                onClick={handleSearchCharacter}
                                disabled={isGeneratingChar || !characterQuery}
                                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold px-4 rounded-lg transition flex items-center"
                            >
                                {isGeneratingChar ? <Loader2 className="animate-spin w-5 h-5"/> : <Search className="w-5 h-5" />}
                            </button>
                        </div>

                        {previewData && (
                             <div className="bg-black border border-gray-800 rounded-xl p-4 animate-in fade-in zoom-in duration-300">
                                <h5 className="text-gray-400 text-xs uppercase font-bold mb-3">Personagem Gerado (Prévia)</h5>
                                <div className="flex items-start gap-4">
                                     <img 
                                        src={getAvatarUrl(previewData.profile, visualStyle)}
                                        className="w-16 h-16 rounded-full object-cover border-2 border-white"
                                        alt={previewData.profile.displayName}
                                     />
                                     <div className="flex-1">
                                         <div className="flex items-center gap-1">
                                             <span className="font-bold text-white text-lg">{previewData.profile.displayName}</span>
                                             <BadgeCheck className="w-5 h-5 text-blue-500 fill-current" />
                                         </div>
                                         <p className="text-gray-500">@{previewData.profile.handle}</p>
                                         <p className="text-white text-sm mt-2 italic">"{previewData.profile.bio}"</p>
                                         
                                         <div className="mt-4 flex justify-end">
                                             <button 
                                                onClick={handleConfirmAdd}
                                                className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-full flex items-center gap-2"
                                             >
                                                 <Plus className="w-4 h-4" />
                                                 Confirmar Adição
                                             </button>
                                         </div>
                                     </div>
                                </div>
                             </div>
                        )}
                     </div>

                     {/* Warning Section */}
                     <div className="bg-yellow-900/10 border border-yellow-900/50 rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-900/20 rounded-full">
                                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                            </div>
                            <div>
                                <h4 className="font-bold text-yellow-500 text-lg">AVISO</h4>
                                <p className="text-gray-400 text-sm">Seus cenarios não seram salvos.</p>
                            </div>
                        </div>
                     </div>

                     {/* Danger Zone */}
                     <div className="bg-red-900/10 border border-red-900/50 rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-red-900/20 rounded-full">
                                <Trash2 className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <h4 className="font-bold text-red-500 text-lg">Zona de Perigo</h4>
                                <p className="text-gray-500 text-sm">Ações irreversíveis.</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <p className="text-gray-400 text-sm">Excluir permanentemente este cenário e todo o progresso.</p>
                            <button 
                                onClick={handleDeleteClick}
                                className={`
                                    text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition
                                    ${confirmDelete 
                                        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                                        : 'bg-red-600 hover:bg-red-700 text-white'
                                    }
                                `}
                            >
                                <Trash2 className="w-4 h-4" />
                                {confirmDelete ? "Tem certeza?" : "Excluir Universo"}
                            </button>
                        </div>
                        {confirmDelete && (
                            <p className="text-red-400 text-xs mt-2 text-right">Clique novamente para confirmar.</p>
                        )}
                     </div>
                </div>
            )}

            <div className="text-center text-gray-500 text-sm mt-12">
                SimuVerse Social v1.2.2
                <br/>
                Powered by Google Gemini
            </div>
        </div>
    </div>
  );
};
