import { useState, useEffect, useRef, useCallback } from 'react';

const SHOTS = 3;
const WIN_SHOTS = 2;
const CYCLE_MS = 2200;
const SWEET_MIN = 0.38;
const SWEET_MAX = 0.62;

type Phase = 'ready' | 'framing' | 'shot' | 'missed' | 'done';

interface PhotographProps {
  onResult: (won: boolean) => void;
}

const SUBJECTS = ['🕊️', '🌹', '👤', '🐦', '🌸'];

export default function Photograph({ onResult }: PhotographProps) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [pos, setPos] = useState(0.5);
  const [subject] = useState(() => SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)]);
  const posRef = useRef(0.5);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef(0);
  const resultFiredRef = useRef(false);
  const cycleMs = Math.max(1200, CYCLE_MS - round * 180);

  const animate = useCallback(() => {
    const elapsed = (performance.now() - startTimeRef.current) % cycleMs;
    const t = elapsed / cycleMs;
    const val = Math.sin(t * Math.PI * 2) * 0.5 + 0.5;
    posRef.current = val;
    setPos(val);
    rafRef.current = requestAnimationFrame(animate);
  }, [cycleMs]);

  const startRound = useCallback(() => {
    setPhase('framing');
    startTimeRef.current = performance.now();
  }, []);

  useEffect(() => {
    if (phase !== 'framing') return;
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, animate]);

  const handleShoot = useCallback(() => {
    if (phase === 'ready') { startRound(); return; }
    if (phase !== 'framing') return;
    cancelAnimationFrame(rafRef.current);

    const inSweet = posRef.current >= SWEET_MIN && posRef.current <= SWEET_MAX;
    const nextRound = round + 1;
    const newScore = score + (inSweet ? 1 : 0);

    setPhase(inSweet ? 'shot' : 'missed');

    if (nextRound >= SHOTS) {
      setTimeout(() => {
        if (!resultFiredRef.current) { resultFiredRef.current = true; onResult(newScore >= WIN_SHOTS); }
        setScore(newScore);
        setPhase('done');
      }, 900);
    } else {
      setScore(newScore);
      setTimeout(() => { setRound(nextRound); startRound(); }, 900);
    }
  }, [phase, round, score, startRound, onResult]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.code === 'Space') { e.preventDefault(); handleShoot(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [handleShoot]);

  const inSweet = pos >= SWEET_MIN && pos <= SWEET_MAX;

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-5 select-none" onClick={handleShoot}>
      {/* Shot counter */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Shot {Math.min(round + 1, SHOTS)} / {SHOTS}</span>
        <div className="flex gap-1.5">
          {Array.from({ length: SHOTS }).map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full transition-colors ${
              i < score ? 'bg-[#22c55e]' :
              i < round && i >= score ? 'bg-red-500/60' :
              'bg-gray-700'
            }`} />
          ))}
        </div>
      </div>

      {/* Viewfinder */}
      <div className="relative w-full h-52 bg-[#1f1f1f] rounded-xl overflow-hidden border border-gray-700 cursor-pointer">
        {/* Corner brackets */}
        {[['top-2 left-2', 'border-t-2 border-l-2'],
          ['top-2 right-2', 'border-t-2 border-r-2'],
          ['bottom-2 left-2', 'border-b-2 border-l-2'],
          ['bottom-2 right-2', 'border-b-2 border-r-2']].map(([pos, border], i) => (
          <div key={i} className={`absolute w-5 h-5 ${pos} ${border} ${inSweet ? 'border-[#22c55e]' : 'border-gray-400'} transition-colors`} />
        ))}

        {/* Crosshair center lines */}
        <div className={`absolute inset-x-0 top-1/2 h-px opacity-30 transition-colors ${inSweet ? 'bg-[#22c55e]' : 'bg-gray-400'}`} />
        <div className={`absolute inset-y-0 left-1/2 w-px opacity-30 transition-colors ${inSweet ? 'bg-[#22c55e]' : 'bg-gray-400'}`} />

        {/* Subject */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-4xl transition-none"
          style={{ left: `${pos * 80 + 10}%` }}
        >
          {subject}
        </div>

        {/* Sweet-spot zone indicator */}
        <div
          className="absolute inset-y-0 bg-[#22c55e]/10 border-x border-[#22c55e]/30 pointer-events-none"
          style={{ left: `${SWEET_MIN * 80 + 10}%`, right: `${(1 - SWEET_MAX) * 80 + 10}%` }}
        />

        {/* Feedback flash */}
        {phase === 'shot' && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/20 animate-pulse pointer-events-none">
            <span className="text-2xl font-bold text-white drop-shadow-lg">📸 Click!</span>
          </div>
        )}
        {phase === 'missed' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
            <span className="text-2xl font-bold text-red-400">❌ Too early!</span>
          </div>
        )}
        {phase === 'done' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
            <span className="text-2xl font-bold">{score >= WIN_SHOTS ? '🌟 Great shots!' : '🎞️ Try again!'}</span>
          </div>
        )}
      </div>

      {/* Position bar */}
      {phase === 'framing' && (
        <div className="relative w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
          <div
            className="absolute inset-y-0 bg-[#22c55e]/20 border-x border-[#22c55e]/40"
            style={{ left: `${SWEET_MIN * 80 + 10}%`, right: `${(1 - SWEET_MAX) * 80 + 10}%` }}
          />
          <div
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full transition-none ${inSweet ? 'bg-[#22c55e]' : 'bg-[#e94560]'}`}
            style={{ left: `${pos * 80 + 10}%` }}
          />
        </div>
      )}

      {/* Instruction */}
      <div className="text-center min-h-[2.5rem] flex items-center justify-center">
        {phase === 'ready' && (
          <div className="bg-[#252525] border border-gray-700 rounded-xl px-5 py-3 w-full">
            <p className="text-white font-semibold text-sm mb-0.5">Frame the perfect shot</p>
            <p className="text-gray-400 text-xs">Tap when the subject is centred · {WIN_SHOTS}/{SHOTS} good shots to win</p>
          </div>
        )}
        {phase === 'framing' && (
          <p className={`text-sm font-bold transition-all ${inSweet ? 'text-[#22c55e] animate-pulse scale-110' : 'text-gray-500'}`}>
            {inSweet ? '📸 Now! Tap to shoot!' : 'Wait for the right moment...'}
          </p>
        )}
      </div>
    </div>
  );
}
