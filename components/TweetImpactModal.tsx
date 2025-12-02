
import React, { useEffect, useState } from 'react';
import { TweetImpact } from '../types';
import { Users, Crown, Zap, Palette, X } from 'lucide-react';

interface TweetImpactModalProps {
  impact: TweetImpact;
  onClose: () => void;
}

export const TweetImpactModal: React.FC<TweetImpactModalProps> = ({ impact, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    // Auto close after 5 seconds if not closed manually
    const timer = setTimeout(() => {
        handleClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
      setVisible(false);
      setTimeout(onClose, 300); // Wait for animation
  };

  const renderStat = (label: string, value: number, icon: React.ReactNode, colorClass: string) => (
      <div className="flex items-center justify-between p-2 rounded-lg bg-gray-900/50 mb-2">
          <div className="flex items-center gap-2 text-gray-300">
              {icon}
              <span className="text-sm font-bold">{label}</span>
          </div>
          <span className={`font-black text-lg ${value >= 0 ? 'text-green-400' : 'text-red-500'}`}>
              {value > 0 ? '+' : ''}{value}
          </span>
      </div>
  );

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <div className={`bg-black/90 backdrop-blur-xl border border-gray-700 p-6 rounded-2xl shadow-2xl max-w-sm w-full transform transition-all duration-300 pointer-events-auto ${visible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'}`}>
            <button onClick={handleClose} className="absolute top-2 right-2 p-1 text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white">Impacto do Tweet</h3>
                <p className="text-sm text-gray-400 italic">"{impact.analysis}"</p>
            </div>

            <div className="space-y-1">
                {renderStat("Seguidores", impact.followersChange, <Users className="w-4 h-4 text-blue-400" />, "text-blue-400")}
                {renderStat("Aura", impact.auraChange, <Crown className="w-4 h-4 text-yellow-400" />, "text-yellow-400")}
                {renderStat("Popularidade", impact.popularityChange, <Zap className="w-4 h-4 text-green-400" />, "text-green-400")}
                {renderStat("Criatividade", impact.creativityChange, <Palette className="w-4 h-4 text-pink-400" />, "text-pink-400")}
            </div>

            <button onClick={handleClose} className="w-full mt-6 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg font-bold text-sm transition">
                Continuar
            </button>
        </div>
    </div>
  );
};
