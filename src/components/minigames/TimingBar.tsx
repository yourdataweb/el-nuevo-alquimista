import { useRef, useEffect, useState, useCallback } from 'react';

/* ── Config ── */
const ROUNDS_TOTAL = 5;
const ROUNDS_TO_WIN = 3;
const BAR_W = 400;
const BAR_H = 40;
const INDICATOR_R = 18;

// Difficulty: target zone moves and shrinks slightly each round
function getTargetWidth(round: number): number {
  return Math.max(60, 100 - round * 8);
}

function getSpeed(round: number): number {
  return 1.5 + round * 0.25;
}

type GameState = 'ready' | 'playing' | 'won' | 'lost';

interface TimingBarProps {
  onResult: (won: boolean) => void;
}

export default function TimingBar({ onResult }: TimingBarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posRef = useRef(0); // indicator position 0..1
  const dirRef = useRef(1); // 1 = right, -1 = left
  const roundRef = useRef(0);
  const scoreRef = useRef(0);
  const targetRef = useRef(0); // target center 0..1
  const rafRef = useRef<number>(0);
  const readyRef = useRef(false);

  const [gameState, setGameState] = useState<GameState>('ready');
  const [dim, setDim] = useState({ w: 600, h: 400 });

  /* ── Generate random target ── */
  const newTarget = useCallback(() => {
    const tw = getTargetWidth(roundRef.current);
    const min = tw / 2 / BAR_W;
    const max = 1 - tw / 2 / BAR_W;
    targetRef.current = min + Math.random() * (max - min);
  }, []);

  /* ── Start a round ── */
  const startRound = useCallback(() => {
    posRef.current = 0;
    dirRef.current = 1;
    newTarget();
    readyRef.current = true;
    setGameState('playing');
  }, [newTarget]);

  /* ── Game loop ── */
  useEffect(() => {
    if (gameState !== 'playing') return;

    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      if (!readyRef.current) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      // Move indicator
      const speed = getSpeed(roundRef.current);
      posRef.current += dirRef.current * speed * 0.01;
      if (posRef.current >= 1) {
        posRef.current = 1;
        dirRef.current = -1;
      } else if (posRef.current <= 0) {
        posRef.current = 0;
        dirRef.current = 1;
      }

      draw(ctx, c.width, c.height, posRef.current, targetRef.current, roundRef.current);
      rafRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(rafRef.current);
  }, [gameState]);

  /* ── Draw ── */
  function draw(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    pos: number,
    target: number,
    roundNum: number
  ) {
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#0f1730';
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, 16);
    ctx.fill();

    const cx = w / 2;
    const cy = h / 2;
    const barX = cx - BAR_W / 2;
    const barY = cy - BAR_H / 2;

    // Bar track
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.roundRect(barX, barY, BAR_W, BAR_H, 8);
    ctx.fill();

    // Target zone
    const tw = getTargetWidth(roundNum);
    const targetLeft = barX + target * BAR_W - tw / 2;
    ctx.fillStyle = 'rgba(34, 197, 94, 0.25)';
    ctx.beginPath();
    ctx.roundRect(targetLeft, barY, tw, BAR_H, 8);
    ctx.fill();

    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(targetLeft, barY, tw, BAR_H, 8);
    ctx.stroke();

    // Indicator
    const indX = barX + pos * BAR_W;
    const indicatorColor = '#e94560';

    ctx.shadowColor = indicatorColor;
    ctx.shadowBlur = 12;
    ctx.fillStyle = indicatorColor;
    ctx.beginPath();
    ctx.arc(indX, cy, INDICATOR_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(indX, cy, INDICATOR_R * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Arrow (to show direction)
    const arrowDir = dirRef.current;
    ctx.fillStyle = '#ffffff66';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(arrowDir > 0 ? '→' : '←', indX, cy + BAR_H / 2 + 18);

    // HUD
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.roundRect(8, 8, 180, 28, 8);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Round ${roundNum + 1}/${ROUNDS_TOTAL}  ✅ ${scoreRef.current}`, 16, 22);

    // Instructions
    ctx.fillStyle = '#888';
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('Tap / Click to stop the indicator in the green zone', cx, h - 8);
  }

  /* ── Handle tap/click ── */
  const handleTap = useCallback(() => {
    if (gameState === 'ready') {
      roundRef.current = 0;
      scoreRef.current = 0;
      newTarget();
      startRound();
      return;
    }

    if (gameState !== 'playing') return;
    if (!readyRef.current) {
      // First tap after round begins — start the indicator moving
      readyRef.current = true;
      return;
    }

    // Check if in target
    const pos = posRef.current;
    const tw = getTargetWidth(roundRef.current);
    const targetLeft = targetRef.current - tw / 2 / BAR_W;
    const hit = pos >= targetLeft && pos <= targetRef.current + tw / 2 / BAR_W;

    if (hit) scoreRef.current += 1;

    roundRef.current += 1;

    if (roundRef.current >= ROUNDS_TOTAL) {
      // Game over — call onResult immediately, no setTimeout.
      const won = scoreRef.current >= ROUNDS_TO_WIN;
      onResult(won);
    } else {
      // Next round
      startRound();
    }
  }, [gameState, startRound, newTarget, onResult]);

  /* ── Resize ── */
  useEffect(() => {
    const resize = () => {
      const maxW = Math.min(600, window.innerWidth - 48);
      const maxH = Math.min(420, window.innerHeight * 0.55);
      setDim({ w: maxW, h: maxH });
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  /* ── Initial draw (ready state) ── */
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    const w = c.width;
    const h = c.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f1730';
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, 16);
    ctx.fill();

    const cx = w / 2;
    const cy = h / 2;

    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎯 Timing Challenge', cx, cy - 40);

    ctx.fillStyle = '#aaa';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('Tap to start the indicator', cx, cy + 10);

    ctx.fillStyle = '#666';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText(`Get ${ROUNDS_TO_WIN}/${ROUNDS_TOTAL} to succeed`, cx, cy + 40);
  }, [dim]);

  return (
    <canvas
      ref={canvasRef}
      width={dim.w}
      height={dim.h}
      onClick={handleTap}
      className="cursor-pointer rounded-xl max-w-full"
      style={{ touchAction: 'manipulation' }}
    />
  );
}