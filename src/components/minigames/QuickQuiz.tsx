import { useState, useEffect, useRef, useMemo } from 'react';
import type { QuizQuestion } from '../../data/locationActivities';

const QUESTIONS_PER_GAME = 3;
const SECONDS_PER_QUESTION = 8;
const FEEDBACK_MS = 1200;
const WIN_THRESHOLD = 2;

interface QuickQuizProps {
  questions: QuizQuestion[];
  onResult: (won: boolean) => void;
}

type Phase = 'answering' | 'feedback' | 'done';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuickQuiz({ questions, onResult }: QuickQuizProps) {
  // Pick a fresh random subset once per mount — stable across re-renders
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const qs = useMemo(() => shuffle(questions).slice(0, QUESTIONS_PER_GAME), []);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('answering');
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resultFiredRef = useRef(false);

  const current = qs[index];

  /* ── Countdown timer ── */
  useEffect(() => {
    if (phase !== 'answering') return;
    setTimeLeft(SECONDS_PER_QUESTION);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          // Time's up — treat as wrong
          setSelected(-1);
          setPhase('feedback');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [index, phase]);

  /* ── After feedback delay, advance ── */
  useEffect(() => {
    if (phase !== 'feedback') return;
    const t = setTimeout(() => {
      const nextIndex = index + 1;
      if (nextIndex >= qs.length) {
        setPhase('done');
      } else {
        setIndex(nextIndex);
        setSelected(null);
        setPhase('answering');
      }
    }, FEEDBACK_MS);
    return () => clearTimeout(t);
  }, [phase, index, qs.length]);

  /* ── Fire result once when done ── */
  useEffect(() => {
    if (phase !== 'done') return;
    if (resultFiredRef.current) return;
    resultFiredRef.current = true;
    onResult(score >= WIN_THRESHOLD);
  }, [phase, score, onResult]);

  const handleAnswer = (optionIndex: number) => {
    if (phase !== 'answering') return;
    clearInterval(timerRef.current!);
    const correct = optionIndex === current.correct;
    if (correct) setScore((s) => s + 1);
    setSelected(optionIndex);
    setPhase('feedback');
  };

  const progress = (timeLeft / SECONDS_PER_QUESTION) * 100;

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-4">
      {/* Progress header */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
        <span>Question {index + 1} / {qs.length}</span>
        <span className={timeLeft <= 3 ? 'text-red-400 font-bold' : ''}>⏱ {timeLeft}s</span>
      </div>

      {/* Timer bar */}
      <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${progress}%`,
            backgroundColor: timeLeft <= 3 ? '#ef4444' : '#e94560',
          }}
        />
      </div>

      {/* Question */}
      <div className="dialogue-box p-4">
        <p className="text-gray-100 text-sm leading-relaxed font-medium">{current?.q}</p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-2">
        {current?.options.map((opt, i) => {
          let style = 'bg-[#252525] border border-gray-700 text-gray-300 hover:border-[#e94560]/70 hover:bg-[#333] cursor-pointer';
          if (phase === 'feedback') {
            if (i === current.correct) {
              style = 'bg-[#22c55e]/10 border-2 border-[#22c55e] text-gray-100';
            } else if (i === selected && selected !== current.correct) {
              style = 'bg-[#e94560]/10 border-2 border-[#e94560] text-gray-100';
            } else {
              style = 'bg-[#252525] border border-gray-700 text-gray-400 opacity-50';
            }
          }
          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={phase !== 'answering'}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all active:scale-[0.98] ${style}`}
            >
              <span className="text-gray-500 mr-2">{String.fromCharCode(65 + i)}.</span>
              {opt}
              {phase === 'feedback' && i === current.correct && (
                <span className="ml-2 text-green-400">✓</span>
              )}
              {phase === 'feedback' && i === selected && i !== current.correct && (
                <span className="ml-2 text-[#e94560]">✗</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Score dots */}
      <div className="flex justify-center gap-2 pt-1">
        {qs.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              i < index
                ? 'bg-[#22c55e]'
                : i === index
                ? 'bg-[#e94560]'
                : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
