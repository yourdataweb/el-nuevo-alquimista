import { useTranslation } from 'react-i18next';
import { useGameStore } from '../store/gameStore';
import GameLayout from '../components/GameLayout';
import { elAlquimista } from '../data/story/el-alquimista';
import { getChapterTitle } from '../engine/storyEngine';

interface RecapScreenProps {
  chapterIndex: number;
  onNext: () => void;
  isLastChapter?: boolean;
}

export default function RecapScreen({ chapterIndex, onNext, isLastChapter }: RecapScreenProps) {
  const { t, i18n } = useTranslation();
  const stats = useGameStore((s) => s.stats);
  const visitedLocationIds = useGameStore((s) => s.visitedLocationIds);
  const time = useGameStore((s) => s.time);

  const chapter = elAlquimista.chapters[chapterIndex];
  const title = getChapterTitle(chapter);
  const desc = chapter.description;

  const totalStats = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <GameLayout>
      <div className="p-4 max-w-2xl mx-auto flex flex-col gap-4 fade-in">
        {/* Chapter title */}
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <h2 className="pixel-text text-sm text-[#e94560] mb-1">
            {t('ui.chapter')} {chapterIndex + 1} — {title}
          </h2>
          <p className="text-gray-400 text-sm">{desc}</p>
        </div>

        <div className="w-16 h-0.5 bg-[#e94560]/50 mx-auto" />

        {/* Stats summary */}
        <div className="dialogue-box p-4">
          <h3 className="text-white font-semibold text-sm mb-3">
            {i18n.language === 'ca'
              ? 'El teu progrés'
              : i18n.language === 'es'
              ? 'Tu progreso'
              : 'Your progress'}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'vitality', icon: '💪' },
              { key: 'resources', icon: '💰' },
              { key: 'knowledge', icon: '🧠' },
              { key: 'social', icon: '👥' },
              { key: 'career', icon: '💼' },
              { key: 'fulfillment', icon: '❤️' },
            ].map(({ key, icon }) => {
              const val = stats[key as keyof typeof stats];
              return (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <span>{icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">{t(`stats.${key}`)}</span>
                      <span className="text-gray-200">{val}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden mt-0.5">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${val}%`,
                          backgroundColor: val > 66 ? '#22c55e' : val > 33 ? '#eab308' : '#ef4444',
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Journey stats */}
        <div className="dialogue-box p-4">
          <h3 className="text-white font-semibold text-sm mb-3">
            {i18n.language === 'ca'
              ? 'El teu viatge'
              : i18n.language === 'es'
              ? 'Tu viaje'
              : 'Your journey'}
          </h3>
          <div className="space-y-2 text-sm text-gray-300">
            <p>📍 {visitedLocationIds.length} {i18n.language === 'ca' ? 'llocs visitats' : i18n.language === 'es' ? 'lugares visitados' : 'places visited'}</p>
            <p>📅 {time.day}/{time.month}/{time.year}</p>
            <p>
              💪 {i18n.language === 'ca' ? 'Puntuació total' : i18n.language === 'es' ? 'Puntuación total' : 'Total score'}: {totalStats}
            </p>
          </div>
        </div>

        {/* Next button */}
        <button
          onClick={onNext}
          className="w-full py-3 bg-[#e94560] hover:bg-[#c73a50] text-white font-bold rounded-lg transition-all text-sm"
        >
          {isLastChapter
            ? (i18n.language === 'ca' ? 'Veure l\'Epíleg' : i18n.language === 'es' ? 'Ver el Epílogo' : 'View Epilogue')
            : (i18n.language === 'ca' ? 'Següent Capítol' : i18n.language === 'es' ? 'Siguiente Capítulo' : 'Next Chapter')}
        </button>
      </div>
    </GameLayout>
  );
}