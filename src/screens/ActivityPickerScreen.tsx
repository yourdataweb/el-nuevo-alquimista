import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../store/gameStore';
import GameLayout from '../components/GameLayout';
import { DAILY_ACTIVITIES } from '../engine/economyEngine';
import type { DailyActivity } from '../store/types';

interface ActivityPickerScreenProps {
  onComplete: () => void;
  maxActivities?: number;
}

export default function ActivityPickerScreen({ onComplete, maxActivities = 3 }: ActivityPickerScreenProps) {
  const { t, i18n } = useTranslation();
  const updateStats = useGameStore((s) => s.updateStats);
  const advanceTime = useGameStore((s) => s.advanceTime);

  const [selected, setSelected] = useState<DailyActivity[]>([]);
  const [confirmed, setConfirmed] = useState(false);

  const getTitle = (act: DailyActivity): string => {
    if (i18n.language === 'ca' && act.titleCa) return act.titleCa;
    if (i18n.language === 'es' && act.titleEs) return act.titleEs;
    return act.title;
  };

  const getDesc = (act: DailyActivity): string => {
    if (i18n.language === 'ca' && act.descriptionCa) return act.descriptionCa;
    if (i18n.language === 'es' && act.descriptionEs) return act.descriptionEs;
    return act.description;
  };

  const isSelected = (act: DailyActivity): boolean => {
    return selected.some((s) => s.id === act.id);
  };

  const totalHours = selected.reduce((sum, a) => sum + a.durationHours, 0);
  const hoursLeft = Math.max(0, 14 - totalHours); // 14 hours in a day max

  const toggleActivity = (act: DailyActivity) => {
    if (confirmed) return;
    if (isSelected(act)) {
      setSelected((prev) => prev.filter((s) => s.id !== act.id));
    } else {
      if (selected.length < maxActivities && totalHours + act.durationHours <= 14) {
        setSelected((prev) => [...prev, act]);
      }
    }
  };

  const handleConfirm = () => {
    selected.forEach((act) => {
      updateStats(act.effects);
      advanceTime(act.durationHours);
    });
    setConfirmed(true);
    setTimeout(onComplete, 500);
  };

  const formatEffect = (val: number | undefined, icon: string): string | null => {
    if (val === undefined || val === 0) return null;
    return val > 0 ? `${icon}+${val}` : `${icon}${val}`;
  };

  return (
    <GameLayout>
      <div className="flex flex-col h-full">

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4 max-w-2xl mx-auto fade-in">
            <h2 className="text-white font-bold text-lg mb-1">{t('ui.chooseActivity')}</h2>
            <p className="text-gray-400 text-sm mb-3">
              ⏳ {t('ui.timeRemaining')}: {hoursLeft}h · 📋 {selected.length}/{maxActivities} {t('ui.activitiesRemaining')}
            </p>

            {/* Activity grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {DAILY_ACTIVITIES.map((act) => {
                const sel = isSelected(act);
                const tooMany = selected.length >= maxActivities && !sel;
                const tooLong = totalHours + act.durationHours > 14;
                const disabled = tooMany || tooLong;
                return (
                  <button
                    key={act.id}
                    onClick={() => toggleActivity(act)}
                    disabled={disabled && !sel}
                    className={`p-3 rounded-xl text-left transition-all active:scale-[0.97] ${
                      sel
                        ? 'bg-[#e94560]/15 border-2 border-[#e94560] shadow-md shadow-[#e94560]/20'
                        : disabled
                        ? 'bg-gray-800/30 border border-gray-800 opacity-40 cursor-not-allowed'
                        : 'bg-[#16213e] border border-gray-600 hover:border-[#e94560]/60 hover:bg-[#1e2d50] cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-semibold text-sm">{getTitle(act)}</span>
                      {sel && <span className="text-[#e94560] text-base">✓</span>}
                    </div>
                    <p className="text-xs text-gray-300 mb-1.5">{getDesc(act)}</p>
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs">
                      <span className="text-gray-400">⏳ {act.durationHours}h</span>
                      {formatEffect(act.effects.vitality, '💪') && <span className="text-green-400">{formatEffect(act.effects.vitality, '💪')}</span>}
                      {formatEffect(act.effects.resources, '💰') && <span className={act.effects.resources && act.effects.resources > 0 ? 'text-green-400' : 'text-red-400'}>{formatEffect(act.effects.resources, '💰')}</span>}
                      {formatEffect(act.effects.knowledge, '🧠') && <span className="text-green-400">{formatEffect(act.effects.knowledge, '🧠')}</span>}
                      {formatEffect(act.effects.social, '👥') && <span className="text-green-400">{formatEffect(act.effects.social, '👥')}</span>}
                      {formatEffect(act.effects.career, '💼') && <span className="text-green-400">{formatEffect(act.effects.career, '💼')}</span>}
                      {formatEffect(act.effects.fulfillment, '❤️') && <span className="text-green-400">{formatEffect(act.effects.fulfillment, '❤️')}</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected summary */}
            {selected.length > 0 && (
              <div className="dialogue-box p-3">
                <p className="text-xs text-gray-400 mb-2">
                  {i18n.language === 'ca' ? 'Resum del dia:' : i18n.language === 'es' ? 'Resumen del día:' : "Today's plan:"}
                </p>
                <ul className="space-y-1 text-sm text-gray-300">
                  {selected.map((act) => (
                    <li key={act.id} className="flex items-center gap-2">
                      <span className="text-[#e94560]">•</span>
                      <span>{getTitle(act)} ({act.durationHours}h)</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* ── Sticky confirm button ── */}
        <div className="shrink-0 px-4 py-3 bg-[#0d1220] border-t border-gray-800/80">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={handleConfirm}
              disabled={selected.length === 0 || confirmed}
              className={`w-full py-3.5 rounded-xl font-bold transition-all text-sm active:scale-[0.98] ${
                selected.length > 0 && !confirmed
                  ? 'bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white shadow-lg shadow-[#22c55e]/25 hover:brightness-110'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
              }`}
            >
              {confirmed
                ? (i18n.language === 'ca' ? '✅ Dia completat!' : i18n.language === 'es' ? '✅ ¡Día completado!' : '✅ Day completed!')
                : (i18n.language === 'ca' ? 'Confirmar dia' : i18n.language === 'es' ? 'Confirmar día' : 'Confirm day')}
            </button>
          </div>
        </div>

      </div>
    </GameLayout>
  );
}