import { useRef, useEffect, useState, useCallback } from 'react';

/* ── Config ── */
const GRID_COLS = 4;
const GRID_ROWS = 4;
const CARD_COUNT = GRID_COLS * GRID_ROWS;        // 16
const PAIR_COUNT = CARD_COUNT / 2;                // 8
const TIME_LIMIT_S = 50;
const ANIM_MS = 400;                               // flip animation duration

/* ── Card faces ── */
const SYMBOLS = [
  '🏛️', '📚', '🌳', '☕',
  '🎭', '⛪', '✈️', '🏢',
] as const;

/* ── State machine ── */
type GameState = 'playing' | 'won' | 'lost';

interface Card {
  index: number;
  symbolIndex: number;
  flipped: boolean;
  matched: boolean;
}

/* ── Helpers ── */

function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build cards: assign symbols correctly
function buildCardsCorrect(): Card[] {
  // Create two copies of each symbol index
  const indices: number[] = [];
  for (let i = 0; i < PAIR_COUNT; i++) {
    indices.push(i, i);
  }
  const shuffled = shuffle(indices);
  return shuffled.map((symbolIndex, i) => ({
    index: i,
    symbolIndex,
    flipped: false,
    matched: false,
  }));
}

interface MemoryMatchProps {
  onResult: (won: boolean) => void;
  symbolSet?: readonly string[];
}

export default function MemoryMatch({ onResult, symbolSet = SYMBOLS }: MemoryMatchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardsRef = useRef<Card[]>(buildCardsCorrect());
  const firstPickRef = useRef<number | null>(null);
  const lockRef = useRef(false); // lock while showing mismatch
  const animTimerRef = useRef<number | null>(null);

  const [gameState, setGameState] = useState<GameState>('playing');
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_S);
  const [pairsLeft, setPairsLeft] = useState(PAIR_COUNT);
  const [dim, setDim] = useState({ w: 600, h: 500 });

  /* ── Timer ── */
  useEffect(() => {
    if (gameState !== 'playing') return;
    const tick = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(tick);
          setGameState('lost');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [gameState]);

  /* ── Canvas draw ── */
  const draw = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    const w = c.width;
    const h = c.height;
    const padX = 12;
    const padY = 10;
    const gap = 6;
    const cardW = (w - padX * 2 - gap * (GRID_COLS - 1)) / GRID_COLS;
    const cardH = (h - padY * 2 - gap * (GRID_ROWS - 1)) / GRID_ROWS;
    const radius = 8;

    const cards = cardsRef.current;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#0f1730';
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, 16);
    ctx.fill();

    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c2 = 0; c2 < GRID_COLS; c2++) {
        const idx = r * GRID_COLS + c2;
        const card = cards[idx];
        const x = padX + c2 * (cardW + gap);
        const y = padY + r * (cardH + gap);

        // Card shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, cardW, cardH, radius);
        ctx.fill();

        // Card face
        const matched = card.matched;
        const flipped = card.flipped || matched;

        ctx.fillStyle = flipped ? '#1e2a4a' : '#16213e';
        ctx.strokeStyle = matched ? '#22c55e' : flipped ? '#4a5a8a' : '#2a3a5a';
        ctx.lineWidth = matched ? 2 : 1;
        ctx.beginPath();
        ctx.roundRect(x, y, cardW, cardH, radius);
        ctx.fill();
        ctx.stroke();

        if (flipped) {
          // Show symbol
          ctx.font = `${Math.min(cardW, cardH) * 0.45}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = matched ? '#22c55e' : '#ffffff';
          const sym = symbolSet[card.symbolIndex] ?? '❓';
          ctx.fillText(sym, x + cardW / 2, y + cardH / 2);

          if (matched) {
            // Glow
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(x + 1, y + 1, cardW - 2, cardH - 2, radius);
            ctx.stroke();
          }
        } else {
          // Card back pattern
          ctx.font = `${Math.min(cardW, cardH) * 0.35}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#3a4a6a';
          ctx.fillText('?', x + cardW / 2, y + cardH / 2);
        }
      }
    }

    // HUD overlay
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.roundRect(8, 8, 140, 28, 8);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`⏱ ${timeLeft}s  |  🎴 ${pairsLeft}`, 16, 22);
  }, [timeLeft, pairsLeft, symbolSet]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Resize
  useEffect(() => {
    const resize = () => {
      const maxW = Math.min(600, window.innerWidth - 48);
      const maxH = Math.min(520, window.innerHeight * 0.6);
      setDim({ w: maxW, h: maxH });
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  /* ── Game result ── */
  useEffect(() => {
    if (gameState === 'won') {
      const t = setTimeout(() => onResult(true), 800);
      return () => clearTimeout(t);
    }
    if (gameState === 'lost') {
      const t = setTimeout(() => onResult(false), 800);
      return () => clearTimeout(t);
    }
  }, [gameState, onResult]);

  /* ── Click handler ── */
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (gameState !== 'playing') return;
      if (lockRef.current) return;

      const c = canvasRef.current;
      if (!c) return;
      const rect = c.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (c.width / rect.width);
      const my = (e.clientY - rect.top) * (c.height / rect.height);

      const w = c.width;
      const h = c.height;
      const padX = 12;
      const padY = 10;
      const gap = 6;
      const cardW = (w - padX * 2 - gap * (GRID_COLS - 1)) / GRID_COLS;
      const cardH = (h - padY * 2 - gap * (GRID_ROWS - 1)) / GRID_ROWS;

      const col = Math.floor((mx - padX) / (cardW + gap));
      const row = Math.floor((my - padY) / (cardH + gap));
      if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return;

      const idx = row * GRID_COLS + col;
      const cards = cardsRef.current;
      const card = cards[idx];
      if (card.flipped || card.matched) return;

      // Flip it
      card.flipped = true;
      forceRender();

      const first = firstPickRef.current;
      if (first === null) {
        // First of pair
        firstPickRef.current = idx;
      } else {
        // Second pick — check match
        const firstCard = cards[first];
        lockRef.current = true;

        if (firstCard.symbolIndex === card.symbolIndex) {
          // Match!
          firstCard.matched = true;
          card.matched = true;
          firstPickRef.current = null;
          lockRef.current = false;
          setPairsLeft((p) => {
            const next = p - 1;
            if (next === 0) setGameState('won');
            return next;
          });
        } else {
          // Mismatch — flip back after delay
          animTimerRef.current = window.setTimeout(() => {
            firstCard.flipped = false;
            card.flipped = false;
            firstPickRef.current = null;
            lockRef.current = false;
            forceRender();
          }, ANIM_MS);
        }
      }

      forceRender();
    },
    [gameState]
  );

  function forceRender() {
    // Trigger redraw by toggling a dummy state
    setPairsLeft((p) => p);
  }

  return (
    <canvas
      ref={canvasRef}
      width={dim.w}
      height={dim.h}
      onClick={handleClick}
      className="cursor-pointer rounded-xl max-w-full"
      style={{ touchAction: 'manipulation' }}
    />
  );
}