import { useState, useEffect, useRef, useCallback } from 'react';

const ROUNDS_TOTAL = 5;
const ROUNDS_TO_WIN = 3;
const ZONE_WIDTH = 0.18; // fraction of track width
const BASE_SPEED = 0.008;

interface TapChallengeProps {
  onResult: (won: boolean) => void;
}

type Phase = 'ready' | 'playing' | 'hit' | 'miss' | 'done';

export default function TapChallenge({ onResult }: TapChallengeProps) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [zonePos, setZonePos] = useState(0.35); // fraction 0..1 (left edge of zone)
  const [indicatorPos, setIndicatorPos] = useState(0); // fraction 0..1
  const [lastHit, setLastHit] = useState<boolean | null>(null);
  const resultFiredRef = useRef(false);

  const posRef = useRef(0);
  const dirRef = useRef(1);
  const rafRef = useRef<number>(0);
  const phaseRef = useRef<Phase>('ready');
  phaseRef.current = phase;

  /* ── Randomise zone position each round ── */
  const newZone = useCallback(() => {
    const pos = 0.1 + Math.random() * (0.8 - ZONE_WIDTH);
    setZonePos(pos);
    return pos;
  }, []);

  /* ── Start a round ── */
  const startRound = useCallback((roundNum: number) => {
    posRef.current = 0;
    dirRef.current = 1;
    newZone();
    setRound(roundNum);
    setLastHit(null);
    setPhase('playing');
  }, [newZone]);

  /* ── Animation loop ── */
  useEffect(() => {
    if (phase !== 'playing') return;

    const speed = BASE_SPEED + round * 0.0015;

    const loop = () => {
      posRef.current += dirRef.current * speed;
      if (posRef.current >= 1) { posRef.current = 1; dirRef.current = -1; }
      if (posRef.current <= 0) { posRef.current = 0; dirRef.current = 1; }
      setIndicatorPos(posRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, round]);

  /* ── Handle tap ── */
  const handleTap = useCallback(() => {
    if (phase === 'ready') {
      startRound(0);
      return;
    }
    if (phase !== 'playing') return;

    cancelAnimationFrame(rafRef.current);
    const pos = posRef.current;
    const hit = pos >= zonePos && pos <= zonePos + ZONE_WIDTH;

    const newScore = score + (hit ? 1 : 0);
    const nextRound = round + 1;

    setLastHit(hit);
    setPhase(hit ? 'hit' : 'miss');

    if (nextRound >= ROUNDS_TOTAL) {
      setTimeout(() => {
        if (!resultFiredRef.current) {
          resultFiredRef.current = true;
          onResult(newScore >= ROUNDS_TO_WIN);
        }
        setScore(newScore);
        setPhase('done');
      }, 800);
    } else {
      setScore(newScore);
      setTimeout(() => startRound(nextRound), 800);
    }
  }, [phase, zonePos, score, round, startRound, onResult]);

  /* ── Keyboard support ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); handleTap(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleTap]);

  const pct = (v: number) => `${(v * 100).toFixed(2)}%`;

  return (
    <div
      className="w-full max-w-lg mx-auto flex flex-col gap-6 select-none"
      onClick={handleTap}
    >
      {/* Round / score header */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Round {Math.min(round + 1, ROUNDS_TOTAL)} / {ROUNDS_TOTAL}</span>
        <div className="flex gap-1">
          {Array.from({ length: ROUNDS_TOTAL }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all ${
                i < score
                  ? 'bg-[#22c55e]'
                  : i < round && i >= score
                  ? 'bg-[#e94560]/60'
                  : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Track */}
      <div className="relative w-full h-14 bg-[#1f1f1f] rounded-xl overflow-hidden cursor-pointer border border-gray-700">
        {/* Zone */}
        <div
          className="absolute top-0 bottom-0 bg-[#22c55e]/20 border-x-2 border-[#22c55e] transition-none"
          style={{ left: pct(zonePos), width: pct(ZONE_WIDTH) }}
        />

        {/* Indicator */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-white shadow-lg transition-none ${
            phase === 'hit' ? 'bg-[#22c55e] shadow-[#22c55e]/50' :
            phase === 'miss' ? 'bg-[#e94560] shadow-[#e94560]/50' :
            'bg-[#e94560]'
          }`}
          style={{ left: `calc(${pct(indicatorPos)} - 16px)` }}
        />

        {/* Feedback label */}
        {(phase === 'hit' || phase === 'miss') && (
          <div className={`absolute inset-0 flex items-center justify-center text-lg font-bold ${phase === 'hit' ? 'text-green-600' : 'text-[#e94560]'}`}>
            {phase === 'hit' ? '✓ Hit!' : '✗ Miss'}
          </div>
        )}
      </div>

      {/* Instruction / CTA */}
      <div className="text-center">
        {phase === 'ready' && (
          <div className="bg-[#252525] border border-gray-700 rounded-xl px-6 py-4">
            <p className="text-white font-semibold text-sm mb-1">Stop the marker inside the green zone</p>
            <p className="text-gray-500 text-xs">Tap or press Space · {ROUNDS_TO_WIN}/{ROUNDS_TOTAL} hits to succeed</p>
          </div>
        )}
        {phase === 'playing' && (
          <p className="text-gray-400 text-sm animate-pulse">Tap to stop!</p>
        )}
        {(phase === 'hit' || phase === 'miss') && (
          <p className="text-gray-500 text-xs">{lastHit ? 'Nice timing' : 'Just outside the zone'}</p>
        )}
      </div>
    </div>
  );
}
