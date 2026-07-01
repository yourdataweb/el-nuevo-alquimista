import { useGameStore } from '../store/gameStore';
import { elAlquimista } from '../data/story/el-alquimista';

interface MapBottomSheetProps {
  onPlay: () => void;
}

export default function MapBottomSheet({ onPlay }: MapBottomSheetProps) {
  const currentChapter = useGameStore((s) => s.currentChapter);

  const chapter = elAlquimista.chapters[currentChapter];

  return (
    <div className="pointer-events-auto h-full flex flex-col justify-end">
      {/* Tap-to-continue area */}
      <div className="flex-1" onClick={onPlay} />

      {/* Bottom sheet — just chapter info, locations are clicked via map markers */}
      <div className="bg-gradient-to-t from-[#1a1a1a]/95 via-[#1a1a1a]/90 to-transparent pt-10 pb-4 px-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-300 font-semibold uppercase tracking-wider">
              {chapter?.title ?? 'Explore'}
            </span>
            <p className="text-gray-400 text-xs mt-0.5">{chapter?.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}