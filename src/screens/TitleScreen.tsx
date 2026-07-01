import { useTranslation } from 'react-i18next';
import { useGameStore } from '../store/gameStore';
import GameLayout from '../components/GameLayout';

export default function TitleScreen() {
  const { t } = useTranslation();
  const setPhase = useGameStore((s) => s.setPhase);
  const resetGame = useGameStore((s) => s.resetGame);

  return (
    <GameLayout>
    <div className="flex flex-col items-center justify-center min-h-full w-full p-6">
      <div className="fade-in text-center max-w-md bg-[#1a1a2e]/80 backdrop-blur-sm rounded-2xl p-8 border border-white/5 shadow-2xl">
        {/* Title */}
        <h1 className="pixel-text text-2xl sm:text-3xl text-[#e94560] mb-2" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
          {t('app.title')}
        </h1>
        <p className="text-gray-300 text-sm mb-3 italic">
          {t('app.subtitle')}
        </p>

        {/* Decorative line */}
        <div className="w-24 h-0.5 bg-[#e94560]/50 mx-auto mb-8" />

        {/* Description */}
        <p className="text-gray-300 text-sm leading-relaxed mb-8">
          A narrative RPG set in real cities. Every journey is a story. Every city, a new Personal Legend.
        </p>

        {/* Start button */}
        <button
          onClick={() => {
            resetGame();
            setPhase('city_select');
          }}
          className="w-full py-4 px-6 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-[#e94560] to-[#c73a50] shadow-lg shadow-[#e94560]/30 hover:shadow-[#e94560]/50 hover:brightness-110 active:scale-[0.98] transition-all"
        >
          {t('app.startGame')}
        </button>

        {/* Footer */}
        <p className="text-gray-500 text-xs mt-8">
          Built with ❤️ for Barcelona
        </p>
      </div>
    </div>
    </GameLayout>
  );
}