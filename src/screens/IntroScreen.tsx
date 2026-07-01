import { useTranslation } from 'react-i18next';
import GameLayout from '../components/GameLayout';
import { useGameStore } from '../store/gameStore';
import { getCityById } from '../data/cities/index';
import { getStoryById } from '../data/story/index';

const BASE = import.meta.env.BASE_URL;

interface IntroScreenProps {
  onContinue: () => void;
}

export default function IntroScreen({ onContinue }: IntroScreenProps) {
  const { t, i18n } = useTranslation();
  const chosenCity = useGameStore((s) => s.chosenCity);
  const chosenBook = useGameStore((s) => s.chosenBook);

  const city = chosenCity ? getCityById(chosenCity) : null;
  const story = chosenBook ? getStoryById(chosenBook) : null;

  const bookTitle = story
    ? (i18n.language === 'ca' ? story.titleCa : i18n.language === 'es' ? story.titleEs : story.title)
    : '';

  const introText = story
    ? (i18n.language === 'ca' ? story.introCa : i18n.language === 'es' ? story.introEs : story.intro)
    : '';

  return (
    <GameLayout>
      <div className="flex flex-col h-full">

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4 max-w-2xl mx-auto flex flex-col gap-4">
            <div className="fade-in text-center">
              <div className="text-5xl mb-4">📖</div>
              <h2 className="pixel-text text-lg text-[#e94560] mb-2">{bookTitle}</h2>
              <p className="text-gray-400 text-sm mb-4">{city?.name} · {new Date().getFullYear()}</p>
              <div className="w-16 h-0.5 bg-[#e94560]/50 mx-auto mb-6" />
            </div>

            <div className="dialogue-box p-4 sm:p-6 fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#e94560]/40 shrink-0 bg-[#252525]">
                  <img src={`${BASE}characters/chuck.jpg`} alt="Narrator" className="w-full h-full object-cover" loading="lazy" />
                </div>
                <span className="text-[#e94560] font-bold text-sm">{t('characters.narrator')}</span>
              </div>
              <p className="story-text text-gray-300 leading-relaxed whitespace-pre-line">
                {introText}
              </p>
            </div>
          </div>
        </div>

        {/* ── Sticky continue button ── */}
        <div className="shrink-0 px-4 py-3 bg-[#191919] border-t border-gray-700">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={onContinue}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#22c55e] to-[#16a34a] shadow-lg shadow-[#22c55e]/25 hover:brightness-110 active:scale-[0.98] transition-all"
            >
              {t('ui.start')} →
            </button>
          </div>
        </div>

      </div>
    </GameLayout>
  );
}
