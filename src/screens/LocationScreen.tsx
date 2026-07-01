import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../store/gameStore';
import GameLayout from '../components/GameLayout';
import LocationImage from '../components/LocationImage';
import MiniGameModal from '../components/minigames/MiniGameModal';
import ResultSummary from '../components/minigames/ResultSummary';
import QuickQuiz from '../components/minigames/QuickQuiz';
import TapChallenge from '../components/minigames/TapChallenge';
import { getActivitiesForType, type ActivityDef } from '../data/locationActivities';
import type { LocationPOI, Stats } from '../store/types';

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

const MG_ICON: Record<string, string> = {
  quick_quiz: '🧠',
  tap_challenge: '🎯',
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

  /* ── Activity / mini‑game view state ── */
  type ActivityView = { kind: 'idle' } | { kind: 'game'; act: ActivityDef } | { kind: 'result'; act: ActivityDef; won: boolean; effects: Partial<Stats> };
  const [view, setView] = useState<ActivityView>({ kind: 'idle' });

  /** Called when a mini‑game finishes. */
  const handleGameResult = (activity: ActivityDef) => (won: boolean) => {
    // Defer EVERYTHING to the next macro task so React finishes the current
    // render cycle (including StrictMode double-mount shenanigans) first.
    setTimeout(() => {
      setView({ kind: 'result', act: activity, won, effects: activity.effects });
      advanceTime(activity.durationHours);
      if (won) updateStats(activity.effects);
      markLocationActivityComplete(location.id, activity.id);
    });
  };

  const activities = getActivitiesForType(location.type);

  return (
    <GameLayout>
      <div className="flex flex-col h-full">

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto min-h-0">
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
              <p className="text-gray-400 text-xs">{location.address ?? ''}</p>
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

            {/* activity buttons have moved to the pinned bar below */}
          </div>
        </div>

        {/* ── Sticky action bar ── */}
        <div className="shrink-0 px-4 py-3 bg-[#0d1220] border-t border-gray-800/80">
          <div className="max-w-2xl mx-auto flex flex-col gap-2">

            {/* Activity buttons */}
            {activities.length > 0 && (
              <div className="grid grid-cols-2 gap-2 pb-1">
                {activities.map((act) => {
                  const done = completedActivities.includes(act.id);
                  return (
                    <button
                      key={act.id}
                      onClick={() => { if (!done) setView({ kind: 'game', act }); }}
                      disabled={done}
                      className={`p-3 rounded-xl text-left transition-all active:scale-[0.97] ${
                        done
                          ? 'bg-[#16213e] border border-gray-700 opacity-40 cursor-not-allowed'
                          : 'bg-[#0f4c5c] border border-[#0e7490] hover:bg-[#155e75] hover:border-[#22d3ee] cursor-pointer shadow-md shadow-black/30'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-base">{MG_ICON[act.miniGame] ?? '🎮'}</span>
                        <span className="text-white font-semibold text-sm truncate">
                          {t(`activitiesSide.${act.i18nKey}` as any)}
                        </span>
                        {done && <span className="ml-auto text-green-400 text-xs">✓</span>}
                      </div>
                      <div className="flex flex-wrap gap-x-2 text-xs text-gray-300">
                        <span>⏳ {act.durationHours}h</span>
                        {Object.entries(act.effects).map(([k, v]) => (
                          <span key={k} className={v && v > 0 ? 'text-green-400' : 'text-red-400'}>
                            {STAT_LABELS[k] ?? k}{v && v > 0 ? '+' : ''}{v}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            {isCorrect && !otherRequiredVisited && (
              <button
                onClick={() => {
                  addVisitedLocation(location.id);
                  onProceed();
                }}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#e94560] to-[#c73a50] shadow-lg shadow-[#e94560]/25 hover:brightness-110 active:scale-[0.98] transition-all"
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
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#22c55e]/80 to-[#16a34a]/80 shadow-lg shadow-[#22c55e]/20 hover:brightness-110 active:scale-[0.98] transition-all"
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
              className="w-full py-2.5 rounded-xl font-medium text-sm text-gray-200 bg-[#16213e] border border-gray-600 hover:bg-[#1e2d50] hover:border-gray-500 active:scale-[0.98] transition-all"
            >
              {i18n.language === 'ca'
                ? '← Tornar al mapa'
                : i18n.language === 'es'
                ? '← Volver al mapa'
                : '← Back to map'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mini‑game modal ── */}
      {view.kind === 'game' && (
        <MiniGameModal
          title={(t as any)(`activitiesSide.${view.act.i18nKey}`, { defaultValue: view.act.i18nKey })}
          subtitle={`${MG_ICON[view.act.miniGame] ?? '🎮'} ${view.act.fluff}`}
          onClose={() => setView({ kind: 'idle' })}
        >
          {view.act.miniGame === 'quick_quiz' && (
            <QuickQuiz
              questions={view.act.quizData ?? []}
              onResult={handleGameResult(view.act)}
            />
          )}
          {view.act.miniGame === 'tap_challenge' && (
            <TapChallenge onResult={handleGameResult(view.act)} />
          )}
        </MiniGameModal>
      )}

      {/* ── Result summary (shown after game finishes, before returning to location) ── */}
      {view.kind === 'result' && (
        <ResultSummary
          won={view.won}
          effects={view.effects}
          onClose={() => setView({ kind: 'idle' })}
        />
      )}
    </GameLayout>
  );
}