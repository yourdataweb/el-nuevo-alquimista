import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../store/gameStore';
import GameLayout from '../components/GameLayout';
import LocationImage from '../components/LocationImage';
import MiniGameModal from '../components/minigames/MiniGameModal';
import MemoryMatch from '../components/minigames/MemoryMatch';
import TimingBar from '../components/minigames/TimingBar';
import { getActivitiesForType, type ActivityDef, type MiniGameKind } from '../data/locationActivities';
import type { LocationPOI } from '../store/types';

interface LocationScreenProps {
  location: LocationPOI;
  isCorrect: boolean;
  chapterRequiredIds: string[];
  onBackToMap: () => void;
  onProceed: () => void;
}

const TYPE_EMOJIS: Record<string, string> = {
  home: '🏠',
  plaza: '🏛️',
  library: '📚',
  park: '🌳',
  market: '🛒',
  church: '⛪',
  monument: '🏛️',
  cafe: '☕',
  theatre: '🎭',
  office: '🏢',
  airport: '✈️',
};

/** Mini‑game icon and flavour colour per kind. */
const MG_META: Record<MiniGameKind, { icon: string; color: string }> = {
  memory_match: { icon: '🧠', color: 'from-purple-600/40 to-purple-800/20' },
  timing_bar: { icon: '🎯', color: 'from-orange-600/40 to-orange-800/20' },
};

/** Stat labels (short) for display. */
const STAT_LABELS: Record<string, string> = {
  vitality: '💪',
  resources: '💰',
  knowledge: '🧠',
  social: '👥',
  career: '💼',
  fulfillment: '❤️',
};

export default function LocationScreen({
  location,
  isCorrect,
  chapterRequiredIds,
  onBackToMap,
  onProceed,
}: LocationScreenProps) {
  const { i18n, t } = useTranslation();
  const addVisitedLocation = useGameStore((s) => s.addVisitedLocation);
  const visitedLocationIds = useGameStore((s) => s.visitedLocationIds);
  const updateStats = useGameStore((s) => s.updateStats);
  const advanceTime = useGameStore((s) => s.advanceTime);
  const completedActivitiesRaw = useGameStore((s) => s.completedLocationActivities[location.id]);
  const completedActivities = completedActivitiesRaw ?? [];
  const markLocationActivityComplete = useGameStore((s) => s.markLocationActivityComplete);

  const otherRequiredVisited = chapterRequiredIds.some(
    (id) => id !== location.id && visitedLocationIds.includes(id)
  );

  const locName =
    (i18n.language === 'ca'
      ? location.nameCa
      : i18n.language === 'es'
      ? location.nameEs
      : location.name) ?? location.name;
  const locDesc =
    (i18n.language === 'ca'
      ? location.descriptionCa
      : i18n.language === 'es'
      ? location.descriptionEs
      : location.description) ?? location.description;

  /* ── Mini‑game modal state ── */
  const [activeActivity, setActiveActivity] = useState<ActivityDef | null>(null);
  const [gameResult, setGameResult] = useState<{ won: boolean; act: ActivityDef } | null>(null);

  /** Called when a mini‑game finishes. */
  const handleGameResult = (activity: ActivityDef) => (won: boolean) => {
    // Always consume time
    advanceTime(activity.durationHours);

    if (won) {
      // Apply stat effects
      updateStats(activity.effects);
    }

    // Mark as completed (consumed regardless of win/loss)
    markLocationActivityComplete(location.id, activity.id);
    setGameResult({ won, act: activity });
  };

  const closeModal = () => {
    setActiveActivity(null);
    setGameResult(null);
  };

  const activities = getActivitiesForType(location.type);

  /* ── Render mini‑game engine inside modal ── */
  const renderGame = (activity: ActivityDef) => {
    const icon = MG_META[activity.miniGame]?.icon ?? '🎮';
    const title =
      (i18n.language === 'ca'
        ? (t as any)(`activitiesSide.${activity.i18nKey}`, { defaultValue: activity.i18nKey })
        : i18n.language === 'es'
        ? (t as any)(`activitiesSide.${activity.i18nKey}`, { defaultValue: activity.i18nKey })
        : (t as any)(`activitiesSide.${activity.i18nKey}`, { defaultValue: activity.i18nKey })) ??
      activity.i18nKey;

    const subtitle = `${icon} ${activity.fluff}`;
    const resultMsg =
      gameResult?.act.id === activity.id
        ? gameResult.won
          ? i18n.language === 'ca'
            ? 'Completat! Stats augmentats.'
            : i18n.language === 'es'
            ? '¡Completado! Estadísticas aumentadas.'
            : 'Completed! Stats increased.'
          : i18n.language === 'ca'
          ? 'No ha sigut suficient. Prova una altra activitat.'
          : i18n.language === 'es'
          ? 'No ha sido suficiente. Prueba otra actividad.'
          : 'Not quite. Try another activity.'
        : undefined;

    return (
      <MiniGameModal
        title={title}
        subtitle={subtitle}
        onClose={closeModal}
        resultBanner={
          gameResult?.act.id === activity.id
            ? {
                success: gameResult.won,
                message: resultMsg ?? '',
                effects: activity.effects,
              }
            : null
        }
      >
        {activity.miniGame === 'memory_match' && (
          <MemoryMatch onResult={handleGameResult(activity)} />
        )}
        {activity.miniGame === 'timing_bar' && (
          <TimingBar onResult={handleGameResult(activity)} />
        )}
      </MiniGameModal>
    );
  };

  return (
    <GameLayout>
      <div className="p-4 max-w-2xl mx-auto fade-in">
        {/* Hero image */}
        <LocationImage
          locationId={location.id}
          name={locName}
          type={location.type}
          className="w-full h-48 rounded-xl mb-4"
        />

        {/* Location header */}
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">{TYPE_EMOJIS[location.type] ?? '📍'}</div>
          <h2 className="text-white font-bold text-lg">{locName}</h2>
          <p className="text-gray-500 text-xs">{location.address ?? ''}</p>
        </div>

        {/* Arrival description */}
        <div className="dialogue-box p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">{TYPE_EMOJIS[location.type] ?? '📍'}</span>
            <span className="text-[#e94560] text-xs uppercase tracking-wider">
              {i18n.language === 'ca'
                ? 'Has arribat a'
                : i18n.language === 'es'
                ? 'Has llegado a'
                : 'You arrived at'}
            </span>
          </div>
          <p className="story-text text-gray-200 leading-relaxed">{locDesc}</p>

          {isCorrect && (
            <div className="mt-4 p-3 bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-lg">
              <p className="text-[#22c55e] text-sm font-semibold">
                {i18n.language === 'ca'
                  ? '✨ Aquest lloc et ressona. Alguna cosa et diu que has vingut al lloc correcte.'
                  : i18n.language === 'es'
                  ? '✨ Este lugar te resuena. Algo te dice que has venido al sitio correcto.'
                  : '✨ This place resonates with you. Something tells you this is the right place.'}
              </p>
            </div>
          )}

          {!isCorrect && (
            <div className="mt-4 p-3 bg-gray-800/30 border border-gray-600/30 rounded-lg">
              <p className="text-gray-400 text-sm">
                {i18n.language === 'ca'
                  ? 'Un lloc interesant, però no té res a veure amb el teu somni.'
                  : i18n.language === 'es'
                  ? 'Un lugar interesante, pero no tiene nada que ver con tu sueño.'
                  : 'An interesting place, but it has nothing to do with your dream.'}
              </p>
            </div>
          )}
        </div>

        {/* ── Side‑quest activity buttons ── */}
        {activities.length > 0 && (
          <div className="mb-4">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2 px-1">
              {i18n.language === 'ca'
                ? 'Activitats del lloc'
                : i18n.language === 'es'
                ? 'Actividades del lugar'
                : 'Activities'}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {activities.map((act) => {
                const done = completedActivities.includes(act.id);
                const meta = MG_META[act.miniGame] ?? { icon: '🎮', color: '' };
                return (
                  <button
                    key={act.id}
                    onClick={() => {
                      if (done) return;
                      setActiveActivity(act);
                      setGameResult(null);
                    }}
                    disabled={done}
                    className={`relative p-3 rounded-xl text-left transition-all ${
                      done
                        ? 'bg-[#16213e]/40 border border-gray-800/50 opacity-50 cursor-not-allowed'
                        : 'bg-[#2563eb]/40 border border-[#2563eb]/60 hover:bg-[#2563eb]/60 hover:border-[#3b82f6] cursor-pointer'
                    }`}
                  >
                    {/* Gradient accent */}
                    <div
                      className={`absolute inset-0 rounded-xl bg-gradient-to-br ${meta.color} opacity-30 pointer-events-none`}
                    />

                    <div className="relative z-10">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-lg">{meta.icon}</span>
                        <span className="text-white font-semibold text-sm truncate">
                          {t(`activitiesSide.${act.i18nKey}` as any)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-gray-400">
                        <span>⏳ {act.durationHours}h</span>
                        {Object.entries(act.effects).map(([k, v]) => (
                          <span key={k} className={v && v > 0 ? 'text-green-400' : ''}>
                            {STAT_LABELS[k] ?? k}+{v}
                          </span>
                        ))}
                      </div>
                      {done && (
                        <div className="text-[10px] text-green-500 mt-0.5">✓ Done</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Story actions ── */}
        <div className="flex flex-col gap-2">
          {isCorrect && !otherRequiredVisited && (
            <button
              onClick={() => {
                addVisitedLocation(location.id);
                onProceed();
              }}
              className="w-full py-3 bg-[#e94560] hover:bg-[#c73a50] text-white font-bold rounded-lg transition-all text-sm"
            >
              {i18n.language === 'ca' ? 'Investigar' : i18n.language === 'es' ? 'Investigar' : 'Investigate'} →
            </button>
          )}

          {isCorrect && otherRequiredVisited && (
            <button
              onClick={() => {
                addVisitedLocation(location.id);
                onBackToMap();
              }}
              className="w-full py-3 bg-[#22c55e]/20 hover:bg-[#22c55e]/30 border border-[#22c55e]/30 text-[#22c55e] font-semibold rounded-lg transition-all text-sm"
            >
              {i18n.language === 'ca'
                ? 'Investigar → Tornar al mapa'
                : i18n.language === 'es'
                ? 'Investigar → Volver al mapa'
                : 'Investigate → Back to map'}
            </button>
          )}



          <button
            onClick={onBackToMap}
            className="w-full py-2 bg-[#16213e] hover:bg-[#0f3460] text-gray-300 font-medium rounded-lg transition-all text-sm border border-gray-700"
          >
            {i18n.language === 'ca'
              ? 'Tornar al mapa'
              : i18n.language === 'es'
              ? 'Volver al mapa'
              : 'Back to map'}
          </button>
        </div>
      </div>

      {/* ── Mini‑game modal ── */}
      {activeActivity && renderGame(activeActivity)}
    </GameLayout>
  );
}