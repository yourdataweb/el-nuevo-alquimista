import { useTranslation } from 'react-i18next';
import { useEffect, useState, useRef } from 'react';

export interface MomentOption {
  id: string;
  text: string;
  requirements?: Partial<Record<string, number>>;
  currentStats?: Record<string, number>;
  effects: Record<string, number>;
  resultText: string;
  onClick: () => void;
}

interface MomentLimiteProps {
  text: string;
  timeSeconds: number;
  options: MomentOption[];
  onTimeout?: () => void;
}

export default function MomentLimite({ text, timeSeconds, options, onTimeout }: MomentLimiteProps) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(timeSeconds);
  const [selected, setSelected] = useState<string | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    if (selected) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          onTimeout?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [selected, onTimeout]);

  const handleSelect = (optId: string) => {
    if (selected && timerRef.current) return;
    setSelected(optId);
    if (timerRef.current) clearInterval(timerRef.current);
    const opt = options.find((o) => o.id === optId);
    if (opt) {
      setResultText(opt.resultText);
      opt.onClick();
    }
  };

  const canChoose = (opt: MomentOption): boolean => {
    if (!opt.requirements || !opt.currentStats) return true;
    return Object.entries(opt.requirements).every(
      ([key, val]) => (opt.currentStats?.[key] ?? 0) >= (val ?? 0)
    );
  };

  const timerPercent = (timeLeft / timeSeconds) * 100;
  const timerColor = timerPercent > 50 ? '#22c55e' : timerPercent > 25 ? '#eab308' : '#ef4444';

  return (
    <div className="fade-in max-w-2xl mx-auto w-full">
      {/* Timer */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500 uppercase tracking-wider">⏱️ {t('ui.choose')}</span>
          <span className="text-sm font-mono text-gray-400">{timeLeft}s</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${timerPercent}%`, backgroundColor: timerColor }}
          />
        </div>
      </div>

      {/* Context text */}
      <div className="dialogue-box p-4 mb-4">
        <p className="text-gray-300 leading-relaxed whitespace-pre-line">{text}</p>
      </div>

      {resultText ? (
        /* Result after choosing */
        <div className="dialogue-box p-4 bg-[#052e16] border-[#22c55e] slide-up">
          <p className="text-gray-300 leading-relaxed whitespace-pre-line">{resultText}</p>
        </div>
      ) : (
        /* Options */
        <div className="space-y-2">
          {options.map((opt) => {
            const available = canChoose(opt);
            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                disabled={!available || selected !== null}
                className={`w-full text-left p-3 rounded-lg option-btn transition-all text-sm ${
                  !available
                    ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                    : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#2a2a40]/50 hover:border-[#e94560]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[#e94560]">▶</span>
                  <span>{opt.text}</span>
                  {opt.requirements && !available && (
                    <span className="text-xs text-gray-500 ml-auto">
                      🔒 Requires stats check
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}