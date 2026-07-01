import { useState, useEffect, useRef, useCallback } from 'react';

const LANES = 3;
const TOTAL_OBSTACLES = 10;
const MAX_HITS = 3;
const BASE_SPEED = 0.45;       // fraction of screen per second
const SPEED_RAMP = 0.018;     // speed added per obstacle cleared
const SPAWN_INTERVAL_MS = 900;

interface Obstacle {
  id: number;
  lane: number;
  x: number; // 0 = left, 1 = right-edge
}

type Phase = 'ready' | 'running' | 'done';

interface ChaseProps {
  onResult: (won: boolean) => void;
}

export default function Chase({ onResult }: ChaseProps) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [playerLane, setPlayerLane] = useState(1);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [hits, setHits] = useState(0);
  const [cleared, setCleared] = useState(0);

  const resultFiredRef = useRef(false);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef(0);
  const idRef = useRef(0);

  // All mutable game state in one ref to avoid stale closures in rAF
  const gRef = useRef({
    playerLane: 1,
    hits: 0,
    cleared: 0,
    obstacles: [] as Obstacle[],
    spawned: 0,
    nextSpawnAt: 0,
    running: false,
  });

  const fireResult = useCallback((finalHits: number) => {
    if (resultFiredRef.current) return;
    resultFiredRef.current = true;
    onResult(finalHits < MAX_HITS);
  }, [onResult]);

  const startGame = useCallback(() => {
    const g = gRef.current;
    g.playerLane = 1;
    g.hits = 0;
    g.cleared = 0;
    g.obstacles = [];
    g.spawned = 0;
    g.nextSpawnAt = performance.now() + 600;
    g.running = true;
    setPhase('running');
    setPlayerLane(1);
    setHits(0);
    setCleared(0);
    setObstacles([]);
  }, []);

  useEffect(() => {
    if (phase !== 'running') return;

    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const g = gRef.current;
      if (!g.running) return;

      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      const speed = BASE_SPEED + g.cleared * SPEED_RAMP;

      // Spawn
      if (now >= g.nextSpawnAt && g.spawned < TOTAL_OBSTACLES) {
        const lane = Math.floor(Math.random() * LANES);
        g.obstacles = [...g.obstacles, { id: idRef.current++, lane, x: 1.05 }];
        g.spawned++;
        g.nextSpawnAt = now + SPAWN_INTERVAL_MS;
      }

      // Move obstacles
      const PLAYER_X = 0.13;
      const next: Obstacle[] = [];
      let hitThisFrame = false;

      for (const obs of g.obstacles) {
        const newX = obs.x - speed * dt;
        if (newX < PLAYER_X + 0.02) {
          // reached player zone
          if (obs.lane === g.playerLane) {
            g.hits++;
            hitThisFrame = true;
          }
          g.cleared++;
        } else {
          next.push({ ...obs, x: newX });
        }
      }
      g.obstacles = next;

      // Sync to React state (batched)
      setObstacles([...g.obstacles]);
      if (hitThisFrame) setHits(g.hits);
      setCleared(g.cleared);

      // End conditions
      if (g.hits >= MAX_HITS) {
        g.running = false;
        setPhase('done');
        setTimeout(() => fireResult(g.hits), 300);
        return;
      }
      if (g.cleared >= TOTAL_OBSTACLES && g.obstacles.length === 0 && g.spawned >= TOTAL_OBSTACLES) {
        g.running = false;
        setPhase('done');
        setTimeout(() => fireResult(g.hits), 300);
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      gRef.current.running = false;
    };
  }, [phase, fireResult]);

  const moveUp = useCallback(() => {
    setPlayerLane((l) => {
      const next = Math.max(0, l - 1);
      gRef.current.playerLane = next;
      return next;
    });
  }, []);

  const moveDown = useCallback(() => {
    setPlayerLane((l) => {
      const next = Math.min(LANES - 1, l + 1);
      gRef.current.playerLane = next;
      return next;
    });
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') { e.preventDefault(); moveUp(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); moveDown(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [moveUp, moveDown]);

  // Visual lane positions (as % of container height)
  const LANE_Y = [20, 50, 80]; // top-center of each lane as %
  const OBSTACLE_EMOJIS = ['🚧', '🚗', '🚶', '🏍️', '🚕'];
  const emojiForId = (id: number) => OBSTACLE_EMOJIS[id % OBSTACLE_EMOJIS.length];

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-4 select-none">
      {/* HUD */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{cleared}/{TOTAL_OBSTACLES} cleared</span>
        <div className="flex gap-1 items-center">
          <span className="text-gray-500 mr-1">Lives:</span>
          {Array.from({ length: MAX_HITS }).map((_, i) => (
            <span key={i} className={`text-base ${i < hits ? 'opacity-20' : 'text-red-400'}`}>💔</span>
          ))}
        </div>
      </div>

      {/* Track */}
      <div
        className="relative w-full bg-[#1f1f1f] rounded-xl overflow-hidden border border-gray-700"
        style={{ height: 180 }}
      >
        {/* Lane dividers */}
        {[1, 2].map((i) => (
          <div
            key={i}
            className="absolute left-0 right-0 border-t border-dashed border-gray-400/40"
            style={{ top: `${(i / LANES) * 100}%` }}
          />
        ))}

        {/* Road markings */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-px bg-transparent" />
        </div>

        {/* Player */}
        <div
          className="absolute transition-all duration-100 text-2xl flex items-center justify-center"
          style={{
            left: '10%',
            top: `${LANE_Y[playerLane]}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          🏃
        </div>

        {/* Obstacles */}
        {obstacles.map((obs) => (
          <div
            key={obs.id}
            className="absolute text-2xl flex items-center justify-center"
            style={{
              left: `${obs.x * 100}%`,
              top: `${LANE_Y[obs.lane]}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {emojiForId(obs.id)}
          </div>
        ))}

        {/* Arrow overlay: show which lane player is in */}
        {phase === 'running' && (
          <div className="absolute left-[10%] top-0 bottom-0 -translate-x-1/2 w-px border-l border-dashed border-[#22c55e]/20" />
        )}

        {phase === 'ready' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <p className="text-gray-100 font-bold">Dodge the obstacles!</p>
          </div>
        )}
        {phase === 'done' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="text-3xl">{hits < MAX_HITS ? '🏆 Escaped!' : '💥 Caught!'}</span>
          </div>
        )}
      </div>

      {/* Controls */}
      {phase === 'ready' ? (
        <button
          onClick={startGame}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white font-bold text-sm shadow-lg shadow-[#f59e0b]/20"
        >
          Run!
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={moveUp}
            className="py-5 rounded-xl bg-[#0f3460] border border-[#f59e0b]/40 text-2xl font-bold hover:border-[#f59e0b] active:scale-[0.93] transition-all"
          >
            ↑
          </button>
          <button
            onClick={moveDown}
            className="py-5 rounded-xl bg-[#0f3460] border border-[#f59e0b]/40 text-2xl font-bold hover:border-[#f59e0b] active:scale-[0.93] transition-all"
          >
            ↓
          </button>
        </div>
      )}

      <p className="text-center text-xs text-gray-400">
        Switch lanes to dodge obstacles · survive {TOTAL_OBSTACLES} obstacles to win
      </p>
    </div>
  );
}
