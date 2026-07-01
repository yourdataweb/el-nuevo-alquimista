import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../store/gameStore';
import GameLayout from '../components/GameLayout';
import LocationImage from '../components/LocationImage';
import MiniGameModal from '../components/minigames/MiniGameModal';
import ResultSummary from '../components/minigames/ResultSummary';
import QuickQuiz from '../components/minigames/QuickQuiz';
import TapChallenge from '../components/minigames/TapChallenge';
import Pickpocket from '../components/minigames/Pickpocket';
import Brawl from '../components/minigames/Brawl';
import Chase from '../components/minigames/Chase';
import Lockpick from '../components/minigames/Lockpick';
import Photograph from '../components/minigames/Photograph';
import { getActivitiesForType, type ActivityDef } from '../data/locationActivities';
import type { LocationPOI, Stats } from '../store/types';

interface LocationScreenProps {
  location: LocationPOI;
  isCorrect: boolean;
  otherRequiredTypeVisited: boolean;
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
  pickpocket: '🥷',
  brawl: '🥊',
  chase: '🏃',
  lockpick: '🔓',
  photograph: '📸',
};

const BASE = import.meta.env.BASE_URL;

const MG_BACKGROUND: Record<string, string> = {
  chase:         `${BASE}minigames/bg-chase.png`,
  brawl:         `${BASE}minigames/bg-brawl.png`,
  lockpick:      `${BASE}minigames/bg-lockpick.png`,
  photograph:    `${BASE}minigames/bg-photograph.png`,
  pickpocket:    `${BASE}minigames/bg-pickpocket.png`,
  quick_quiz:    `${BASE}minigames/bg-quiz.png`,
  tap_challenge: `${BASE}minigames/bg-tap.png`,
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
  otherRequiredTypeVisited,
  onBackToMap,
  onProceed,
}: LocationScreenProps) {
  const { i18n, t } = useTranslation();
  const addVisitedLocation = useGameStore((s) => s.addVisitedLocation);
  const updateStats = useGameStore((s) => s.updateStats);
  const advanceTime = useGameStore((s) => s.advanceTime);
  const completedActivitiesRaw = useGameStore((s) => s.completedLocationActivities[location.id]);
  const completedActivities = completedActivitiesRaw ?? [];
  const markLocationActivityComplete = useGameStore((s) => s.markLocationActivityComplete);

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
          <div className="max-w-2xl mx-auto fade-in p-4">

            {/* ── Hero image with identity overlay ── */}
            <div className="relative w-full h-56 rounded-xl overflow-hidden">
              <LocationImage
                locationId={location.id}
                name={locName}
                type={location.type}
                className="w-full h-full"
              />
              {/* gradient scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/10" />
              {/* identity anchored to bottom of image */}
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm text-white/60 border border-white/10 mb-1.5">
                  {TYPE_EMOJIS[location.type] ?? '📍'} {location.type}
                </span>
                <h2 className="text-white font-bold text-xl leading-tight">{locName}</h2>
                {location.address && (
                  <p className="text-white/50 text-xs mt-0.5">{location.address}</p>
                )}
              </div>
            </div>

            {/* ── Content below hero ── */}
            <div className="mt-3 px-4 pt-4 pb-3 bg-black/75 backdrop-blur-sm rounded-xl">
              {isCorrect && (
                <div className="flex items-start gap-2 mb-4 px-3 py-2.5 rounded-lg bg-[#22c55e]/30 border border-[#22c55e]/70">
                  <span className="text-base mt-px">✨</span>
                  <p className="text-green-300 text-sm font-medium leading-relaxed">
                    {i18n.language === 'ca'
                      ? 'Aquest lloc et ressona. Alguna cosa et diu que has vingut al lloc correcte.'
                      : i18n.language === 'es'
                      ? 'Este lugar te resuena. Algo te dice que has venido al sitio correcto.'
                      : 'This place resonates with you. Something tells you this is the right place.'}
                  </p>
                </div>
              )}

              <p className="story-text text-gray-300 text-sm leading-relaxed">{locDesc}</p>

            </div>

          </div>
        </div>

        {/* ── Sticky action bar ── */}
        <div className="shrink-0 px-4 py-3 bg-[#191919] border-t border-gray-700">
          <div className="max-w-2xl mx-auto flex flex-col gap-2">

            {/* Investigate — always on top */}
            {isCorrect && !otherRequiredTypeVisited && (
              <button
                onClick={() => {
                  addVisitedLocation(location.id);
                  onProceed();
                }}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#22c55e] to-[#16a34a] shadow-lg shadow-[#22c55e]/20 hover:brightness-110 active:scale-[0.98] transition-all"
              >
                {i18n.language === 'ca' ? 'Investigar' : i18n.language === 'es' ? 'Investigar' : 'Investigate'} →
              </button>
            )}

            {isCorrect && otherRequiredTypeVisited && (
              <button
                onClick={() => {
                  addVisitedLocation(location.id);
                  onBackToMap();
                }}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#22c55e] to-[#16a34a] shadow-lg shadow-[#22c55e]/20 hover:brightness-110 active:scale-[0.98] transition-all"
              >
                {i18n.language === 'ca'
                  ? 'Investigar → Tornar al mapa'
                  : i18n.language === 'es'
                  ? 'Investigar → Volver al mapa'
                  : 'Investigate → Back to map'}
              </button>
            )}

            {/* Activity buttons — between Investigate and Back */}
            {activities.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {activities.map((act) => {
                  const done = completedActivities.includes(act.id);
                  return (
                    <button
                      key={act.id}
                      onClick={() => { if (!done) setView({ kind: 'game', act }); }}
                      disabled={done}
                      className={`p-3 rounded-xl text-left transition-all active:scale-[0.97] ${
                        done
                          ? 'bg-[#252525] border border-gray-700 opacity-75 cursor-not-allowed'
                          : 'bg-[#0c3a38] border border-[#0d9488]/60 hover:bg-[#0f4a47] hover:border-[#0d9488] cursor-pointer shadow-md shadow-black/20'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-base">{MG_ICON[act.miniGame] ?? '🎮'}</span>
                        <span className="text-white font-semibold text-sm truncate">
                          {t(`activitiesSide.${act.i18nKey}` as any)}
                        </span>
                        {done && <span className="ml-auto text-green-400 text-xs">✓</span>}
                      </div>
                      <div className="flex flex-wrap gap-x-2 text-xs text-teal-200/70">
                        <span>⏳ {act.durationHours}h</span>
                        {Object.entries(act.effects).map(([k, v]) => (
                          <span key={k} className={v && v > 0 ? 'text-green-400' : 'text-red-500'}>
                            {STAT_LABELS[k] ?? k}{v && v > 0 ? '+' : ''}{v}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Back to map — always at bottom */}
            <button
              onClick={onBackToMap}
              className="w-full py-2.5 rounded-xl font-medium text-sm text-slate-400 bg-[#1e293b] border border-[#334155] hover:bg-[#253347] hover:text-slate-300 active:scale-[0.98] transition-all"
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
          backgroundImage={MG_BACKGROUND[view.act.miniGame]}
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
          {view.act.miniGame === 'pickpocket' && (
            <Pickpocket onResult={handleGameResult(view.act)} />
          )}
          {view.act.miniGame === 'brawl' && (
            <Brawl onResult={handleGameResult(view.act)} />
          )}
          {view.act.miniGame === 'chase' && (
            <Chase onResult={handleGameResult(view.act)} />
          )}
          {view.act.miniGame === 'lockpick' && (
            <Lockpick onResult={handleGameResult(view.act)} />
          )}
          {view.act.miniGame === 'photograph' && (
            <Photograph onResult={handleGameResult(view.act)} />
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
