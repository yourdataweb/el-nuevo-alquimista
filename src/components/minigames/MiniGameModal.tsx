import { useRef, useEffect } from 'react';

interface MiniGameModalProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onClose: () => void;
  /** Set to true when a result banner should show */
  resultBanner?: { success: boolean; message: string } | null;
}

/**
 * Full‑screen modal that hosts a mini‑game.
 * Dark overlay + centred game area that takes most of the viewport.
 */
export default function MiniGameModal({
  title,
  subtitle,
  children,
  onClose,
  resultBanner,
}: MiniGameModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      {/* Main card */}
      <div className="relative w-full max-w-3xl mx-4 max-h-[92vh] flex flex-col bg-[#1a1a2e] border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700 bg-[#16213e]/60">
          <div className="min-w-0">
            <h2 className="text-white font-bold text-lg truncate">{title}</h2>
            <p className="text-gray-400 text-xs truncate">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-3 shrink-0 w-8 h-8 flex items-center justify-center rounded-full
              bg-gray-700 hover:bg-[#e94560] text-gray-300 hover:text-white
              transition-colors text-lg font-bold"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Game area */}
        <div className="relative flex-1 flex items-center justify-center p-4 min-h-[400px]">
          {children}

          {/* Result banner overlay */}
          {resultBanner && (
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center 
                bg-black/60 backdrop-blur-sm animate-fadeIn z-10`}
            >
              <div
                className={`text-center px-8 py-6 rounded-xl ${
                  resultBanner.success
                    ? 'bg-[#22c55e]/20 border border-[#22c55e]/40'
                    : 'bg-[#e94560]/20 border border-[#e94560]/40'
                }`}
              >
                <div className="text-5xl mb-3">
                  {resultBanner.success ? '🎉' : '😔'}
                </div>
                <p className="text-white font-bold text-lg mb-4">{resultBanner.message}</p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-lg bg-[#e94560] hover:bg-[#c73a50] text-white font-semibold transition-all text-sm"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </div>
  );
}