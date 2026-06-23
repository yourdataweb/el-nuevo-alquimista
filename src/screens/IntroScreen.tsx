import { useTranslation } from 'react-i18next';
import GameLayout from '../components/GameLayout';
import { elAlquimista } from '../data/story/el-alquimista';
import { barcelona } from '../data/cities/barcelona';

interface IntroScreenProps {
  onContinue: () => void;
}

export default function IntroScreen({ onContinue }: IntroScreenProps) {
  const { t, i18n } = useTranslation();
  const book = elAlquimista;
  const city = barcelona;

  const bookTitle = i18n.language === 'ca' ? book.titleCa : i18n.language === 'es' ? book.titleEs : book.title;

  return (
    <GameLayout>
      <div className="p-4 max-w-2xl mx-auto flex flex-col gap-4">
        <div className="fade-in text-center">
          <div className="text-5xl mb-4">📖</div>
          <h2 className="pixel-text text-lg text-[#e94560] mb-2">
            {bookTitle}
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            {city.name} · {new Date().getFullYear()}
          </p>
          <div className="w-16 h-0.5 bg-[#e94560]/50 mx-auto mb-6" />
        </div>

        <div className="dialogue-box p-4 sm:p-6 fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#1a1a2e] rounded-full flex items-center justify-center text-xl border border-[#e94560]/30">
              📖
            </div>
            <span className="text-[#e94560] font-bold text-sm">{t('characters.narrator')}</span>
          </div>
          <p className="story-text text-gray-200 leading-relaxed whitespace-pre-line">
            {i18n.language === 'ca'
              ? 'Barcelona, 2026. Tens 26 anys i una vida normal. Un pis a Gràcia. Una feina. Uns amics. Però fa dies que somies la mateixa escena cada nit: una plaça plena de coloms que s\'alcen alhora, i una figura que assenyala al nord.\n\nCada matí et despertes amb la sensació que el somni vol dir alguna cosa. Avui, alguna cosa et diu que hauries de seguir-lo.'
              : i18n.language === 'es'
              ? 'Barcelona, 2026. Tienes 26 años y una vida normal. Un piso en Gràcia. Un trabajo. Unos amigos. Pero llevas días soñando la misma escena cada noche: una plaza llena de palomas que se alzan a la vez, y una figura que señala al norte.\n\nCada mañana te despiertas con la sensación de que el sueño significa algo. Hoy, algo te dice que deberías seguirlo.'
              : 'Barcelona, 2026. You are 26 with a normal life. An apartment in Gràcia. A job. Friends. But you keep dreaming the same scene every night: a square full of pigeons taking flight at once, and a figure pointing north.\n\nEvery morning you wake up feeling the dream means something. Today, something tells you to follow it.'}
          </p>
        </div>

        <button
          onClick={onContinue}
          className="w-full py-3 px-6 bg-[#e94560] hover:bg-[#c73a50] text-white font-bold rounded-lg transition-all text-sm"
        >
          {t('ui.start')} →
        </button>
      </div>
    </GameLayout>
  );
}