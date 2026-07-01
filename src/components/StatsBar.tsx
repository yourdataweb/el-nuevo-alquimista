import { useTranslation } from 'react-i18next';
import { useGameStore } from '../store/gameStore';
import type { Stats } from '../store/types';

const STAT_ICONS: Record<keyof Stats, string> = {
  vitality: '💪',
  resources: '💰',
  knowledge: '🧠',
  social: '👥',
  career: '💼',
  fulfillment: '❤️',
};

export default function StatsBar() {
  const { t } = useTranslation();
  const stats = useGameStore((s) => s.stats);

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 px-2 py-2 bg-[#252525] border-t border-[#e94560]/20">
      {(Object.keys(stats) as (keyof Stats)[]).map((key) => {
        const value = stats[key];
        const barColor = value > 66 ? '#22c55e' : value > 33 ? '#eab308' : '#ef4444';
        return (
          <div key={key} className="flex flex-col items-center gap-0.5" title={t(`stats.${key}Desc`)}>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-sm">{STAT_ICONS[key]}</span>
              <span className="text-gray-400 font-medium">{value}</span>
            </div>
            <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${value}%`, backgroundColor: barColor }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}