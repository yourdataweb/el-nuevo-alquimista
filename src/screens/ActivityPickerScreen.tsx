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
      <div className="p-4 max-w-2xl mx-auto fade-in">
        <h2 className="text-white font-bold text-lg mb-1">{t('ui.chooseActivity')}</h2>
        <p className="text-gray-400 text-sm mb-2">
          ⏳ {t('ui.timeRemaining')}: {hoursLeft}h · 📋 {selected.length}/{maxActivities} {t('ui.activitiesRemaining')}
        </p>

        {/* Activity grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
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
                className={`p-3 rounded-lg text-left transition-all ${
                  sel
                    ? 'bg-[#e94560]/20 border-2 border-[#e94560]'
                    : disabled
                    ? 'bg-gray-800/30 border border-gray-700 opacity-50 cursor-not-allowed'
                    : 'bg-[#16213e] border border-gray-700 hover:border-[#e94560] hover:bg-[#0f3460]/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-semibold text-sm">{getTitle(act)}</span>
                  <span className="text-[10px] text-gray-500">⏳ {act.durationHours}h</span>
                </div>
                <p className="text-xs text-gray-400 mb-1">{getDesc(act)}</p>
                <div className="flex gap-2 text-[10px] text-gray-500">
                  {formatEffect(act.effects.vitality, '💪')}
                  {formatEffect(act.effects.resources, '💰')}
                  {formatEffect(act.effects.knowledge, '🧠')}
                  {formatEffect(act.effects.social, '👥')}
                  {formatEffect(act.effects.career, '💼')}
                  {formatEffect(act.effects.fulfillment, '❤️')}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected summary */}
        {selected.length > 0 && (
          <div className="dialogue-box p-3 mb-4">
            <p className="text-xs text-gray-400 mb-2">
              {i18n.language === 'ca'
                ? 'Resum del dia:'
                : i18n.language === 'es'
                ? 'Resumen del día:'
                : 'Today\'s plan:'}
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

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          disabled={selected.length === 0 || confirmed}
          className={`w-full py-3 rounded-lg font-bold transition-all text-sm ${
            selected.length > 0 && !confirmed
              ? 'bg-[#e94560] hover:bg-[#c73a50] text-white'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          {confirmed
            ? (i18n.language === 'ca' ? '✅ Dia completat!' : i18n.language === 'es' ? '✅ ¡Día completado!' : '✅ Day completed!')
            : (i18n.language === 'ca' ? 'Confirmar dia' : i18n.language === 'es' ? 'Confirmar día' : 'Confirm day')}
        </button>
      </div>
    </GameLayout>
  );
}