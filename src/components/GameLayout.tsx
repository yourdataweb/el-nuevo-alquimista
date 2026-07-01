import { useTranslation } from 'react-i18next';
import { useGameStore } from '../store/gameStore';
import { formatTime } from '../engine/timeEngine';
import { APP_VERSION } from '../generated-version';
import StatsBar from './StatsBar';
import LanguageSwitcher from './LanguageSwitcher';

interface GameLayoutProps {
  children: React.ReactNode;
  showStats?: boolean;
  showMapButton?: boolean;
  onMapClick?: () => void;
}

export default function GameLayout({ children, showStats = true, showMapButton = false, onMapClick }: GameLayoutProps) {
  const { t, i18n } = useTranslation();
  const time = useGameStore((s) => s.time);
  const currentChapter = useGameStore((s) => s.currentChapter);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Top bar */}
      <header className="flex items-center justify-between px-3 py-2 bg-[#252525] border-b border-[#e94560]/30 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[#e94560] pixel-text text-[8px] sm:text-[10px] truncate">
            {t('app.title')}
          </span>
          {currentChapter > 0 && (
            <span className="text-gray-500 text-xs hidden sm:inline">
              | {t('ui.chapter')} {currentChapter}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <LanguageSwitcher />
        </div>
        {/* Version badge */}
        <span className="hidden sm:inline text-[10px] text-gray-400 ml-2 select-none" title={APP_VERSION.build}>
          v{APP_VERSION.build}
        </span>
      </header>

      {/* Time display */}
      <div className="px-3 py-1 bg-[#2a2a40]/50 text-center text-xs sm:text-sm text-gray-400 shrink-0">
        {formatTime(time, i18n.language)}
      </div>

      {/* Main content */}
      <main className="flex-1 min-h-0 overflow-hidden">
        {children}
      </main>

      {/* Bottom stats bar */}
      {showStats && (
        <div className="shrink-0">
          <StatsBar />
        </div>
      )}

      {/* Map button (when applicable) */}
      {showMapButton && onMapClick && (
        <div className="shrink-0 px-3 py-2 bg-[#252525] border-t border-[#e94560]/20">
          <button
            onClick={onMapClick}
            className="w-full py-2 px-4 bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold rounded-lg transition-colors text-sm"
          >
            {t('ui.goToMap')} 🗺️
          </button>
        </div>
      )}
    </div>
  );
}