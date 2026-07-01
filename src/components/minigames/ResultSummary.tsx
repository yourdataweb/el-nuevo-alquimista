import type { Stats } from '../../store/types';

const STAT_ICONS: Record<keyof Stats, string> = {
  vitality: '💪',
  resources: '💰',
  knowledge: '🧠',
  social: '👥',
  career: '💼',
  fulfillment: '❤️',
};

const STAT_LABELS: Record<keyof Stats, string> = {
  vitality: 'Vitality',
  resources: 'Resources',
  knowledge: 'Knowledge',
  social: 'Social',
  career: 'Career',
  fulfillment: 'Fulfillment',
};

interface ResultSummaryProps {
  /** Whether the player won the mini‑game. */
  won: boolean;
  /** Activity effects (stat deltas). */
  effects: Partial<Stats>;
  onClose: () => void;
}

/**
 * Dedicated result summary screen shown after a mini‑game ends.
 * Replaces the game modal entirely so the user gets a clear "result page".
 */
export default function ResultSummary({ won, effects, onClose }: ResultSummaryProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md mx-4 bg-[#1a1a1a] border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Accent bar */}
        <div
          className={`h-2 ${
            won ? 'bg-[#22c55e]' : 'bg-[#e94560]'
          }`}
        />

        {/* Content */}
        <div className="px-6 py-8 text-center">
          {/* Big result emoji */}
          <div className="text-6xl mb-3">{won ? '🎉' : '😔'}</div>

          {/* Result title */}
          <h2
            className={`text-2xl font-bold mb-1 ${
              won ? 'text-[#22c55e]' : 'text-[#e94560]'
            }`}
          >
            {won ? 'Success!' : 'Failed'}
          </h2>

          <p className="text-gray-500 text-sm mb-6">
            {won
              ? 'You completed the activity and earned stat points.'
              : 'You didn\'t succeed this time. No stat points earned.'}
          </p>

          {/* ── Stat breakdown ── */}
          {won && (
            <div className="mb-6">
              <h3 className="text-gray-500 text-xs uppercase tracking-wider mb-3 text-left">
                Stats earned
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(effects).map(([key, val]) => {
                  if (val == null || val <= 0) return null;
                  const k = key as keyof Stats;
                  const icon = STAT_ICONS[k] ?? key;
                  const label = STAT_LABELS[k] ?? key;
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-2 bg-[#252525] border border-green-800 rounded-lg px-3 py-2"
                    >
                      <span className="text-xl">{icon}</span>
                      <div className="text-left">
                        <p className="text-xs text-gray-500">{label}</p>
                        <p className="text-[#22c55e] font-bold text-sm">+{val}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {!won && (
            <div className="mb-6 py-4">
              <p className="text-gray-500 text-sm">
                💡 Try a different activity or come back later.
              </p>
            </div>
          )}

          {/* Continue button */}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold transition-all text-base"
          >
            Continue
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out; }
      `}</style>
    </div>
  );
}