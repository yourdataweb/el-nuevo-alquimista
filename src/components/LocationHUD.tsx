import { useTranslation } from 'react-i18next';
import { useGameStore } from '../store/gameStore';
import { getLocationById } from '../data/cities/barcelona';
import { flyToPlayer } from './MapBackground';

export default function LocationHUD() {
  const { i18n } = useTranslation();
  const currentLocationId = useGameStore((s) => s.currentLocationId);

  const location = currentLocationId ? getLocationById(currentLocationId) : null;
  if (!location) return null;

  const locName = i18n.language === 'ca'
    ? location.nameCa
    : i18n.language === 'es'
    ? location.nameEs
    : location.name;

  return (
    <div className="fixed top-14 left-3 z-20 flex items-center gap-2 bg-[#1a1a2e]/80 backdrop-blur-md rounded-xl px-3 py-2 border border-white/10 shadow-lg pointer-events-auto max-w-[60vw]">
      {/* Character avatar */}
      <div className="w-9 h-9 rounded-full bg-[#e94560] flex items-center justify-center text-lg shadow-lg shrink-0 border-2 border-white/20">
        🧑
      </div>

      {/* Location info */}
      <div className="min-w-0">
        <div className="text-[10px] text-gray-400 uppercase tracking-wider">
          Current location
        </div>
        <div className="text-sm text-white font-semibold truncate flex items-center gap-1">
          {locName}
        </div>
      </div>

      {/* Center-on-player button */}
      <button
        onClick={flyToPlayer}
        className="ml-1 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs shrink-0 transition-colors"
        title="Center on player"
      >
        📍
      </button>
    </div>
  );
}