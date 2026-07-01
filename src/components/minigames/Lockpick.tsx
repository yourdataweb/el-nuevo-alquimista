import { useState, useEffect, useRef, useCallback } from 'react';

const PINS = 3;
const BASE_RPM = 0.8;        // rotations per second for pin 0
const RPM_STEP = 0.25;       // each pin spins this much faster
const SWEET_DEG = 38;        // sweet-spot arc width in degrees
const SWEET_CENTER = 90;     // sweet-spot center angle (degrees, 0=top, clockwise)
const MAX_MISSES = 3;

type Phase = 'ready' | 'picking' | 'click' | 'miss' | 'done';

interface LockpickProps {
  onResult: (won: boolean) => void;
}

export default function Lockpick({ onResult }: LockpickProps) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [pin, setPin] = useState(0);
  const [angle, setAngle] = useState(0);
  const [misses, setMisses] = useState(0);
  const angleRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef(0);
  const resultFiredRef = useRef(false);
  const missesRef = useRef(0);
  const pinRef = useRef(0);
  const phaseRef = useRef<Phase>('ready');

  const rps = BASE_RPM + pin * RPM_STEP;

  const inSweetSpot = (deg: number) => {
    const norm = ((deg % 360) + 360) % 360;
    const diff = Math.abs(norm - SWEET_CENTER);
    const delta = Math.min(diff, 360 - diff);
    return delta <= SWEET_DEG / 2;
  };

  useEffect(() => {
    if (phase !== 'picking') return;
    phaseRef.current = 'picking';
    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      if (phaseRef.current !== 'picking') return;
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      angleRef.current = (angleRef.current + rps * 360 * dt) % 360;
      setAngle(angleRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(rafRef.current); };
  }, [phase, rps]);

  const handlePick = useCallback(() => {
    if (phase === 'ready') { setPhase('picking'); phaseRef.current = 'picking'; return; }
    if (phase !== 'picking') return;

    phaseRef.current = 'done'; // stop the loop
    cancelAnimationFrame(rafRef.current);

    const hit = inSweetSpot(angleRef.current);

    if (hit) {
      setPhase('click');
      const nextPin = pinRef.current + 1;
      if (nextPin >= PINS) {
        setTimeout(() => {
          if (!resultFiredRef.current) { resultFiredRef.current = true; onResult(true); }
          setPhase('done');
        }, 700);
      } else {
        setTimeout(() => {
          pinRef.current = nextPin;
          setPin(nextPin);
          phaseRef.current = 'picking';
          setPhase('picking');
        }, 650);
      }
    } else {
      const newMisses = missesRef.current + 1;
      missesRef.current = newMisses;
      setMisses(newMisses);
      setPhase('miss');
      if (newMisses >= MAX_MISSES) {
        setTimeout(() => {
          if (!resultFiredRef.current) { resultFiredRef.current = true; onResult(false); }
          setPhase('done');
        }, 700);
      } else {
        setTimeout(() => {
          phaseRef.current = 'picking';
          setPhase('picking');
        }, 650);
      }
    }
  }, [phase, onResult]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.code === 'Space') { e.preventDefault(); handlePick(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [handlePick]);

  // SVG dimensions
  const R = 62;
  const CX = 90;
  const CY = 90;
  const SIZE = 180;

  const toRad = (deg: number) => (deg - 90) * (Math.PI / 180);
  const pt = (deg: number) => ({
    x: CX + R * Math.cos(toRad(deg)),
    y: CY + R * Math.sin(toRad(deg)),
  });

  const ss1 = pt(SWEET_CENTER - SWEET_DEG / 2);
  const ss2 = pt(SWEET_CENTER + SWEET_DEG / 2);
  const needlePt = pt(angle);

  const needleColor =
    phase === 'click' ? '#22c55e' :
    phase === 'miss'  ? '#e94560' :
    inSweetSpot(angle) ? '#facc15' : '#e94560';

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-5 select-none items-center" onClick={handlePick}>
      {/* Progress: pins + misses */}
      <div className="flex items-center justify-between w-full text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <span>Pins:</span>
          {Array.from({ length: PINS }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                i < pin
                  ? 'bg-[#22c55e] border-[#22c55e]'
                  : i === pin && phase !== 'done'
                  ? 'border-yellow-400 bg-transparent animate-pulse'
                  : 'border-gray-700 bg-transparent'
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: MAX_MISSES }).map((_, i) => (
            <span key={i} className={`text-sm ${i < misses ? 'text-red-400' : 'text-gray-300'}`}>🔩</span>
          ))}
        </div>
      </div>

      {/* Lock */}
      <div className="relative cursor-pointer" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {/* Outer ring */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#d0ccc4" strokeWidth="14" />

          {/* Sweet-spot arc fill */}
          <path
            d={`M ${CX} ${CY} L ${ss1.x} ${ss1.y} A ${R} ${R} 0 0 1 ${ss2.x} ${ss2.y} Z`}
            fill="#22c55e"
            fillOpacity={phase === 'picking' ? 0.18 : 0.06}
          />
          {/* Sweet-spot arc outline */}
          <path
            d={`M ${ss1.x} ${ss1.y} A ${R} ${R} 0 0 1 ${ss2.x} ${ss2.y}`}
            fill="none"
            stroke="#22c55e"
            strokeWidth="4"
            strokeLinecap="round"
            strokeOpacity={phase === 'picking' ? 0.9 : 0.25}
          />

          {/* Needle */}
          <line
            x1={CX} y1={CY}
            x2={needlePt.x} y2={needlePt.y}
            stroke={needleColor}
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Pivot */}
          <circle cx={CX} cy={CY} r="5" fill="#1a1a1a" stroke={needleColor} strokeWidth="2" />

          {/* Lock body (centre icon) */}
          <text x={CX} y={CY - 14} textAnchor="middle" fontSize="20" dy=".35em">
            {phase === 'click' || (phase === 'done' && misses < MAX_MISSES && pin >= PINS) ? '🔓' : '🔒'}
          </text>
        </svg>

        {/* Feedback overlay */}
        {(phase === 'click' || phase === 'miss') && (
          <div className="absolute inset-0 flex items-end justify-center pb-3 pointer-events-none">
            <span className={`text-lg font-bold ${phase === 'click' ? 'text-[#22c55e]' : 'text-red-400'}`}>
              {phase === 'click' ? '✓ Click!' : '✗ Miss!'}
            </span>
          </div>
        )}
        {phase === 'done' && (
          <div className="absolute inset-0 flex items-end justify-center pb-3 pointer-events-none">
            <span className="text-lg font-bold">
              {misses < MAX_MISSES ? '🔓 Opened!' : '🔒 Jammed!'}
            </span>
          </div>
        )}
      </div>

      {/* Pin label */}
      {phase !== 'done' && (
        <p className="text-gray-400 text-sm">Pin {Math.min(pin + 1, PINS)} of {PINS}</p>
      )}

      {/* Instruction */}
      <div className="text-center w-full">
        {phase === 'ready' && (
          <div className="bg-[#252525] border border-gray-700 rounded-xl px-5 py-3">
            <p className="text-white font-semibold text-sm mb-0.5">Pick the lock</p>
            <p className="text-gray-500 text-xs">Tap when the needle is in the green arc · {MAX_MISSES} misses allowed</p>
          </div>
        )}
        {phase === 'picking' && (
          <p className={`text-sm font-semibold transition-colors ${inSweetSpot(angle) ? 'text-yellow-500 animate-pulse' : 'text-gray-500'}`}>
            {inSweetSpot(angle) ? '👆 Now! Tap to pick!' : 'Tap or press Space...'}
          </p>
        )}
      </div>
    </div>
  );
}
