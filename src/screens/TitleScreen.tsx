import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../store/gameStore';
import GameLayout from '../components/GameLayout';

const BASE = import.meta.env.BASE_URL;

const CHARACTERS = [
  { id: 'trump', name: 'The Maverick', file: 'trump.png' },
  { id: 'ramos', name: 'The Fighter', file: 'ramos.png' },
];

export default function TitleScreen() {
  const { t } = useTranslation();
  const setPhase = useGameStore((s) => s.setPhase);
  const resetGame = useGameStore((s) => s.resetGame);
  const setCharacter = useGameStore((s) => s.setCharacter);
  const [selected, setSelected] = useState<string>(CHARACTERS[0].id);

  const handleStart = () => {
    resetGame();
    setCharacter(selected);
    setPhase('city_select');
  };

  return (
    <GameLayout>
      <div className="flex flex-col items-center justify-center min-h-full w-full p-6">
        <div className="fade-in text-center max-w-md w-full bg-[#1a1a2e]/80 backdrop-blur-sm rounded-2xl p-8 border border-white/5 shadow-2xl">
          {/* Title */}
          <h1 className="pixel-text text-2xl sm:text-3xl text-[#e94560] mb-2" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
            {t('app.title')}
          </h1>
          <p className="text-gray-300 text-sm mb-3 italic">
            {t('app.subtitle')}
          </p>

          <div className="w-24 h-0.5 bg-[#e94560]/50 mx-auto mb-6" />

          {/* Character picker */}
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">Choose your character</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {CHARACTERS.map((char) => {
              const isSelected = selected === char.id;
              return (
                <button
                  key={char.id}
                  onClick={() => setSelected(char.id)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all active:scale-[0.97] ${
                    isSelected
                      ? 'border-[#e94560] shadow-lg shadow-[#e94560]/30'
                      : 'border-gray-700 hover:border-gray-500'
                  }`}
                >
                  <img
                    src={`${BASE}characters/${char.file}`}
                    alt={char.name}
                    className="w-full aspect-square object-cover object-top"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent`} />
                  <div className="absolute bottom-0 left-0 right-0 pb-2 px-2">
                    <p className="text-white text-xs font-semibold">{char.name}</p>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#e94560] flex items-center justify-center text-white text-xs font-bold">✓</div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Start button */}
          <button
            onClick={handleStart}
            className="w-full py-4 px-6 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-[#22c55e] to-[#16a34a] shadow-lg shadow-[#22c55e]/30 hover:shadow-[#22c55e]/50 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            {t('app.startGame')}
          </button>

          <p className="text-gray-500 text-xs mt-6">
            Built with ❤️ for Barcelona
          </p>
        </div>
      </div>
    </GameLayout>
  );
}
