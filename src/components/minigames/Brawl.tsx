import { useState, useEffect, useRef, useCallback } from 'react';

type Dir = 'left' | 'up' | 'right';
type Phase = 'ready' | 'attack' | 'parried' | 'hit' | 'done';

const DIRS: Dir[] = ['left', 'up', 'right'];
const TOTAL_ATTACKS = 5;
const MAX_HITS = 2;
const BASE_WINDOW_MS = 1500;
const SPEED_STEP = 120;

const DIR_ARROW: Record<Dir, string> = { left: '◀', up: '▲', right: '▶' };
const DIR_LABEL: Record<Dir, string> = { left: '←', up: '↑', right: '→' };

interface BrawlProps {
  onResult: (won: boolean) => void;
}

export default function Brawl({ onResult }: BrawlProps) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [attackIndex, setAttackIndex] = useState(0);
  const [currentDir, setCurrentDir] = useState<Dir>('up');
  const [hits, setHits] = useState(0);
  const [timeLeft, setTimeLeft] = useState(BASE_WINDOW_MS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resultFiredRef = useRef(false);
  // track current values in refs to avoid stale closures in interval
  const hitsRef = useRef(0);
  const attackIndexRef = useRef(0);

  const windowMs = Math.max(600, BASE_WINDOW_MS - attackIndex * SPEED_STEP);

  const fireResult = useCallback((finalHits: number) => {
    if (resultFiredRef.current) return;
    resultFiredRef.current = true;
    onResult(finalHits < MAX_HITS);
  }, [onResult]);

  const launchAttack = useCallback((index: number, currentHits: number) => {
    if (index >= TOTAL_ATTACKS) {
      setPhase('done');
      setTimeout(() => fireResult(currentHits), 400);
      return;
    }
    attackIndexRef.current = index;
    hitsRef.current = currentHits;
    const dir = DIRS[Math.floor(Math.random() * DIRS.length)];
    setCurrentDir(dir);
    setAttackIndex(index);
    setHits(currentHits);
    setTimeLeft(Math.max(600, BASE_WINDOW_MS - index * SPEED_STEP));
    setPhase('attack');
  }, [fireResult]);

  // countdown during attack phase
  useEffect(() => {
    if (phase !== 'attack') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    const ws = Math.max(600, BASE_WINDOW_MS - attackIndexRef.current * SPEED_STEP);
    const startTime = performance.now();

    timerRef.current = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const remaining = Math.max(0, ws - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timerRef.current!);
        const newHits = hitsRef.current + 1;
        hitsRef.current = newHits;
        setHits(newHits);
        setPhase('hit');
        if (newHits >= MAX_HITS) {
          setTimeout(() => { setPhase('done'); fireResult(newHits); }, 800);
        } else {
          setTimeout(() => launchAttack(attackIndexRef.current + 1, newHits), 800);
        }
      }
    }, 16);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, launchAttack, fireResult]);

  const handleParry = useCallback((dir: Dir) => {
    if (phase !== 'attack') return;
    if (timerRef.current) clearInterval(timerRef.current);

    if (dir === currentDir) {
      setPhase('parried');
      setTimeout(() => launchAttack(attackIndexRef.current + 1, hitsRef.current), 500);
    } else {
      const newHits = hitsRef.current + 1;
      hitsRef.current = newHits;
      setHits(newHits);
      setPhase('hit');
      if (newHits >= MAX_HITS) {
        setTimeout(() => { setPhase('done'); fireResult(newHits); }, 800);
      } else {
        setTimeout(() => launchAttack(attackIndexRef.current + 1, newHits), 800);
      }
    }
  }, [phase, currentDir, launchAttack, fireResult]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handleParry('left');
      if (e.key === 'ArrowUp') handleParry('up');
      if (e.key === 'ArrowRight') handleParry('right');
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [handleParry]);

  const progressPct = (timeLeft / windowMs) * 100;
  const isUrgent = progressPct < 35;

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-5 select-none">
      {/* HUD */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Attack {Math.min(attackIndex + 1, TOTAL_ATTACKS)} / {TOTAL_ATTACKS}</span>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Health:</span>
          {Array.from({ length: MAX_HITS }).map((_, i) => (
            <span key={i} className={`text-base ${i < hits ? 'opacity-25' : 'text-red-400'}`}>❤️</span>
          ))}
        </div>
      </div>

      {/* Arena */}
      <div className={`relative w-full h-44 rounded-xl flex flex-col items-center justify-center border-2 transition-all duration-200 overflow-hidden ${
        phase === 'parried' ? 'bg-[#052e16] border-[#22c55e] shadow-[0_0_20px_rgba(34,197,94,0.2)]' :
        phase === 'hit'     ? 'bg-[#fee2e2] border-[#e94560] shadow-[0_0_20px_rgba(233,69,96,0.2)]' :
                              'bg-[#1f1f1f] border-gray-700'
      }`}>

        {phase === 'ready' && (
          <p className="text-gray-500 text-sm">Brace yourself...</p>
        )}

        {phase === 'attack' && (
          <div className="flex flex-col items-center gap-3 w-full px-6">
            {/* Opponent fist indicator */}
            <div className="text-5xl animate-bounce">{DIR_ARROW[currentDir]}</div>
            <p className="text-gray-500 text-xs">Incoming attack!</p>
            {/* Timer bar */}
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-none ${isUrgent ? 'bg-red-500' : 'bg-[#22c55e]'}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {phase === 'parried' && (
          <div className="flex flex-col items-center gap-1">
            <span className="text-5xl">🛡️</span>
            <span className="text-green-400 font-bold">Parried!</span>
          </div>
        )}

        {phase === 'hit' && (
          <div className="flex flex-col items-center gap-1">
            <span className="text-5xl">💥</span>
            <span className="text-red-500 font-bold">{hits >= MAX_HITS ? 'Knocked out!' : 'Took a hit!'}</span>
          </div>
        )}

        {phase === 'done' && (
          <div className="flex flex-col items-center gap-1">
            <span className="text-5xl">{hits < MAX_HITS ? '🏆' : '💀'}</span>
            <span className={`font-bold ${hits < MAX_HITS ? 'text-green-400' : 'text-red-500'}`}>
              {hits < MAX_HITS ? 'You win!' : 'Knocked out!'}
            </span>
          </div>
        )}
      </div>

      {/* Parry buttons */}
      {phase === 'ready' ? (
        <button
          onClick={() => launchAttack(0, 0)}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-bold text-sm"
        >
          Start Fight
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {DIRS.map((dir) => (
            <button
              key={dir}
              onClick={() => handleParry(dir)}
              className={`py-5 rounded-xl text-2xl font-bold border transition-all active:scale-[0.93] ${
                phase === 'attack'
                  ? 'bg-[#252525] border-gray-700 hover:bg-[#1a3a2a] hover:border-[#22c55e] hover:text-green-400 cursor-pointer'
                  : 'bg-[#252525] border-gray-700 text-gray-300 cursor-default'
              }`}
            >
              {DIR_LABEL[dir]}
            </button>
          ))}
        </div>
      )}

      <p className="text-center text-xs text-gray-400">
        Tap the matching direction to parry · survive {TOTAL_ATTACKS} attacks
      </p>
    </div>
  );
}
