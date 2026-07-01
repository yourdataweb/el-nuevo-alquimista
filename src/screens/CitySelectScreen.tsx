import { useTranslation } from 'react-i18next';
import { useGameStore } from '../store/gameStore';
import { barcelona } from '../data/cities/barcelona';

const BASE = import.meta.env.BASE_URL;

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
    <div className="relative flex flex-col items-center justify-center h-full w-full overflow-hidden">
      {/* Background image */}
      <img
        src={`${BASE}cities/barcelona.jpg`}
        alt="Barcelona"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d1220]/60 via-[#0d1220]/40 to-[#0d1220]/80" />

      {/* Content */}
      <div className="relative z-10 fade-in text-center max-w-md w-full px-6">
        <h2 className="pixel-text text-xl text-white mb-2 drop-shadow-lg" style={{ textShadow: '0 2px 16px rgba(0,0,0,0.8)' }}>
          {t('app.selectCity')}
        </h2>
        <p className="text-gray-300 text-sm mb-8 drop-shadow">Where does your story begin?</p>

        {/* City card */}
        <div
          onClick={handleSelectCity}
          className="group w-full rounded-2xl overflow-hidden border-2 border-white/20 hover:border-[#e94560] cursor-pointer transition-all hover:shadow-2xl hover:shadow-[#e94560]/30 active:scale-[0.98] bg-black/30 backdrop-blur-sm"
        >
          <div className="relative h-40 overflow-hidden">
            <img
              src={`${BASE}cities/barcelona.jpg`}
              alt="Barcelona"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-white font-bold text-2xl drop-shadow-lg">Barcelona</h3>
                  <p className="text-gray-300 text-sm">Spain</p>
                </div>
                <span className="text-white text-2xl group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 flex items-center justify-center gap-4 border-t border-white/10">
            <span className="text-xs text-gray-300">🏘️ 40+ locations</span>
            <span className="text-xs text-gray-500">·</span>
            <span className="text-xs text-gray-300">📖 1 story</span>
          </div>
        </div>

        <p className="text-gray-500 text-xs mt-6 italic">
          More cities coming soon...
        </p>
      </div>
    </div>
  );
}
