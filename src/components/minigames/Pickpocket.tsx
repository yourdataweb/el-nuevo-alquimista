import { useState, useEffect, useRef, useCallback } from 'react';

const ROUNDS = 3;
const WIN_ROUNDS = 2;
const CYCLE_MS = 2400;
const SAFE_THRESHOLD = 0.62;

type Phase = 'ready' | 'watching' | 'feedback' | 'done';
type FeedbackKind = 'stolen' | 'caught';

interface PickpocketProps {
  onResult: (won: boolean) => void;
}

export default function Pickpocket({ onResult }: PickpocketProps) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [distraction, setDistraction] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackKind | null>(null);
  const distractionRef = useRef(0);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef(0);
  const resultFiredRef = useRef(false);
  // speed increases slightly each round
  const cycleMs = CYCLE_MS - round * 150;

  const animate = useCallback(() => {
    const elapsed = (performance.now() - startTimeRef.current) % cycleMs;
    const t = elapsed / cycleMs;
    const val = Math.sin(t * Math.PI * 2) * 0.5 + 0.5;
    distractionRef.current = val;
    setDistraction(val);
    rafRef.current = requestAnimationFrame(animate);
  }, [cycleMs]);

  const startRound = useCallback(() => {
    setFeedback(null);
    startTimeRef.current = performance.now();
    setPhase('watching');
  }, []);

  useEffect(() => {
    if (phase !== 'watching') return;
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, animate]);

  const handleTap = useCallback(() => {
    if (phase === 'ready') { startRound(); return; }
    if (phase !== 'watching') return;
    cancelAnimationFrame(rafRef.current);

    const safe = distractionRef.current > SAFE_THRESHOLD;
    const kind: FeedbackKind = safe ? 'stolen' : 'caught';
    const newScore = score + (safe ? 1 : 0);
    const nextRound = round + 1;

    setFeedback(kind);
    setPhase('feedback');

    if (nextRound >= ROUNDS) {
      setTimeout(() => {
        if (!resultFiredRef.current) { resultFiredRef.current = true; onResult(newScore >= WIN_ROUNDS); }
        setScore(newScore);
        setPhase('done');
      }, 900);
    } else {
      setScore(newScore);
      setTimeout(() => { setRound(nextRound); startRound(); }, 900);
    }
  }, [phase, score, round, startRound, onResult]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.code === 'Space') { e.preventDefault(); handleTap(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [handleTap]);

  const isSafe = distraction > SAFE_THRESHOLD;

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-5 select-none" onClick={handleTap}>
      {/* Round dots */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Round {Math.min(round + 1, ROUNDS)} / {ROUNDS}</span>
        <div className="flex gap-1.5">
          {Array.from({ length: ROUNDS }).map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full transition-colors ${
              i < score ? 'bg-[#22c55e]' : i < round && i >= score ? 'bg-red-500/60' : 'bg-gray-700'
            }`} />
          ))}
        </div>
      </div>

      {/* Scene */}
      <div className="relative w-full h-52 bg-[#1f1f1f] rounded-xl overflow-hidden border border-gray-700 cursor-pointer">
        {/* Background crowd silhouettes */}
        {[0.08, 0.28, 0.72, 0.88].map((x, i) => (
          <div key={i} className="absolute bottom-0 flex flex-col items-center" style={{ left: `${x * 100}%` }}>
            <div className="w-5 h-5 rounded-full bg-gray-400/60" />
            <div className="w-4 h-10 bg-gray-400/60 rounded-sm" />
          </div>
        ))}

        {/* Mark */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
          {/* Head */}
          <div className={`w-8 h-8 rounded-full border-2 transition-colors duration-300 flex items-center justify-center text-sm
            ${phase === 'watching' ? (isSafe ? 'bg-amber-800 border-amber-600' : 'bg-gray-500 border-gray-400') : 'bg-gray-600 border-gray-500'}`}>
            {phase === 'watching' ? (isSafe ? '😴' : '😠') : '😐'}
          </div>
          {/* Body */}
          <div className={`w-10 h-16 rounded-t-sm transition-colors duration-300 relative
            ${phase === 'watching' ? (isSafe ? 'bg-amber-700' : 'bg-gray-500') : 'bg-gray-600'}`}>
            {/* Pocket */}
            <div className={`absolute top-4 left-1/2 -translate-x-1/2 w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center text-xs
              ${phase === 'watching' && isSafe
                ? 'border-yellow-400 bg-yellow-400/20 shadow-[0_0_10px_#facc15]'
                : 'border-gray-600 bg-transparent'}`}>
              {phase === 'watching' && isSafe ? '💰' : ''}
            </div>
          </div>
        </div>

        {/* Alert meter */}
        {phase === 'watching' && (
          <div className="absolute top-3 right-3 flex flex-col items-center gap-1">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Alert</span>
            <div className="w-3 h-20 bg-gray-700 rounded-full overflow-hidden border border-gray-700 flex flex-col-reverse">
              <div
                className="w-full rounded-full transition-none"
                style={{
                  height: `${(1 - distraction) * 100}%`,
                  background: isSafe ? '#22c55e' : '#e94560',
                }}
              />
            </div>
            <span className="text-sm">{isSafe ? '👁️' : '🔍'}</span>
          </div>
        )}

        {/* Feedback overlay */}
        {phase === 'feedback' && feedback && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className={`text-2xl font-bold ${feedback === 'stolen' ? 'text-yellow-600' : 'text-red-500'}`}>
              {feedback === 'stolen' ? '💰 Snatched!' : '🚨 Caught!'}
            </span>
          </div>
        )}
        {phase === 'done' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="text-2xl font-bold">{score >= WIN_ROUNDS ? '🥷 Clean escape!' : '🚔 Busted!'}</span>
          </div>
        )}
      </div>

      {/* Instruction */}
      <div className="text-center min-h-[2.5rem] flex items-center justify-center">
        {phase === 'ready' && (
          <div className="bg-[#252525] border border-gray-700 rounded-xl px-5 py-3 w-full">
            <p className="text-white font-semibold text-sm mb-0.5">Steal when the mark is distracted</p>
            <p className="text-gray-500 text-xs">Tap when they look away · {WIN_ROUNDS}/{ROUNDS} steals to win</p>
          </div>
        )}
        {phase === 'watching' && (
          <p className={`text-sm font-bold transition-all ${isSafe ? 'text-yellow-500 animate-pulse scale-110' : 'text-gray-500'}`}>
            {isSafe ? '👆 NOW — tap to steal!' : 'Wait for the right moment...'}
          </p>
        )}
      </div>
    </div>
  );
}
