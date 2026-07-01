import { useTranslation } from 'react-i18next';
import { useGameStore } from '../store/gameStore';
import { barcelona } from '../data/cities/barcelona';

export default function CitySelectScreen() {
  const { t } = useTranslation();
  const setPhase = useGameStore((s) => s.setPhase);
  const setCity = useGameStore((s) => s.setCity);
  const setBook = useGameStore((s) => s.setBook);

  const handleSelectCity = () => {
    setCity(barcelona.id);
    setBook('el-alquimista');
    setPhase('intro');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6">
      <div className="fade-in text-center max-w-md w-full bg-[#1a1a2e]/80 backdrop-blur-sm rounded-2xl p-8 border border-white/5 shadow-2xl">
        <h2 className="pixel-text text-xl text-[#e94560] mb-6" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
          {t('app.selectCity')}
        </h2>

        {/* City card */}
        <div
          onClick={handleSelectCity}
          className="group w-full p-6 rounded-xl bg-[#16213e] border-2 border-[#e94560]/40 hover:border-[#e94560] cursor-pointer transition-all hover:shadow-lg hover:shadow-[#e94560]/20 active:scale-[0.98]"
        >
          <div className="text-4xl mb-3">🏛️</div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-white font-bold text-lg">Barcelona</h3>
            <span className="text-[#e94560] text-lg group-hover:translate-x-1 transition-transform">→</span>
          </div>
          <p className="text-gray-300 text-sm">Spain</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-xs text-gray-400">🏘️ 20+ locations</span>
            <span className="text-xs text-gray-400">📖 1 story</span>
          </div>
        </div>

        {/* More cities coming soon */}
        <p className="text-gray-500 text-xs mt-6 italic">
          More cities coming soon...
        </p>
      </div>
    </div>
  );
}