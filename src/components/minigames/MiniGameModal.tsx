import { useRef } from 'react';

interface MiniGameModalProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onClose: () => void;
  backgroundImage?: string;
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
  backgroundImage,
}: MiniGameModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

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
              bg-gray-700 hover:bg-[#16a34a] text-gray-300 hover:text-white
              transition-colors text-lg font-bold"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Game area */}
        <div
          className="flex-1 flex items-center justify-center p-4 min-h-[400px]"
          style={backgroundImage ? {
            backgroundImage: `linear-gradient(rgba(15,23,48,0.82), rgba(15,23,48,0.82)), url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } : undefined}
        >
          {children}
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