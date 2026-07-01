import { useTranslation } from 'react-i18next';
import { useGameStore } from '../store/gameStore';

const BASE = import.meta.env.BASE_URL;

interface DialogueBoxProps {
  speaker: string;
  text: string;
  options: {
    id: string;
    text: string;
    disabled?: boolean;
    disabledReason?: string;
    onClick: () => void;
  }[];
  speakerSprite?: string;
}

const CHARACTER_FILES: Record<string, string> = {
  melquisedec: 'gandalf.png',
  merce: 'albanese.png',
  englishman: 'rooney.png',
  alchemist: 'alchemist.png',
  narrator: 'chuck.jpg',
};

const CHARACTER_PROTAGONIST_FILE: Record<string, string> = {
  trump: 'trump.png',
  ramos: 'ramos.png',
};

const CHARACTER_EMOJIS: Record<string, string> = {
  melquisedec: '🧙',
  merce: '👩‍🍳',
  englishman: '🧑‍🏫',
  alchemist: '🧝',
  narrator: '📖',
};

export default function DialogueBox({ speaker, text, options, speakerSprite }: DialogueBoxProps) {
  const { t } = useTranslation();
  const chosenCharacter = useGameStore((s) => s.chosenCharacter);

  const getImgSrc = (): string | null => {
    if (!speakerSprite) return null;
    if (speakerSprite === 'protagonist') {
      const file = CHARACTER_PROTAGONIST_FILE[chosenCharacter ?? ''] ?? 'protagonist.jpg';
      return `${BASE}characters/${file}`;
    }
    const file = CHARACTER_FILES[speakerSprite];
    return file ? `${BASE}characters/${file}` : null;
  };

  const imgSrc = getImgSrc();
  const emoji = speakerSprite ? CHARACTER_EMOJIS[speakerSprite] : null;

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full fade-in">

      {/* ── Scrollable speaker + text ── */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="dialogue-box p-4 sm:p-6 m-0 rounded-b-none border-b-0">
          <div className="flex items-center gap-3 mb-4">
            {imgSrc ? (
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#e94560]/40 shrink-0 bg-[#252525]">
                <img src={imgSrc} alt={speaker} className="w-full h-full object-cover" loading="lazy" />
              </div>
            ) : speakerSprite ? (
              <div className="w-10 h-10 bg-[#252525] rounded-full flex items-center justify-center text-xl border border-[#e94560]/30 shrink-0">
                {emoji || '❓'}
              </div>
            ) : null}
            <p className="text-[#e94560] font-bold text-sm">{speaker}</p>
          </div>
          <p className="story-text text-gray-300 leading-relaxed whitespace-pre-line">{text}</p>
        </div>
      </div>

      {/* ── Pinned options ── */}
      <div className="shrink-0 bg-[#191919] border-t border-[#e94560]/30 px-4 pt-3 pb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">{t('ui.choose')}</p>
        <div className="space-y-2">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={opt.onClick}
              disabled={opt.disabled}
              className={`w-full text-left p-3.5 rounded-xl transition-all text-sm active:scale-[0.99] ${
                opt.disabled
                  ? 'bg-gray-800 border border-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-[#1a1a1a] border border-gray-700 text-gray-300 hover:border-[#e94560] hover:bg-[#2a2a40]/50'
              }`}
              title={opt.disabledReason}
            >
              <div className="flex items-center gap-2">
                <span className={opt.disabled ? 'text-gray-300' : 'text-[#e94560]'}>▶</span>
                <span>{opt.text}</span>
                {opt.disabled && (
                  <span className="text-xs text-gray-400 ml-auto">🔒 {opt.disabledReason}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
