import { useTranslation } from 'react-i18next';

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

const CHARACTER_IMAGES: Record<string, string> = {
  protagonist: `${BASE}characters/protagonist.jpg`,
  melquisedec: `${BASE}characters/melquisedec.jpg`,
  merce: `${BASE}characters/merce.png`,
  englishman: `${BASE}characters/englishman.png`,
  alchemist: `${BASE}characters/alchemist.png`,
  narrator: `${BASE}characters/alchemist.png`, // reusing alchemist for narrator since no dedicated image
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

  const spriteKey = speakerSprite && CHARACTER_IMAGES[speakerSprite] ? speakerSprite : null;
  const imgSrc = spriteKey ? CHARACTER_IMAGES[spriteKey] : null;
  const emoji = speakerSprite ? CHARACTER_EMOJIS[speakerSprite] : null;

  return (
    <div className="dialogue-box p-4 sm:p-6 max-w-2xl mx-auto w-full fade-in">
      {/* Speaker portrait */}
      <div className="flex items-center gap-3 mb-4">
        {imgSrc ? (
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#e94560]/40 shrink-0 bg-[#1a1a2e]">
            <img
              src={imgSrc}
              alt={speaker}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ) : spriteKey || speakerSprite ? (
          <div className="w-10 h-10 bg-[#1a1a2e] rounded-full flex items-center justify-center text-xl border border-[#e94560]/30 shrink-0">
            {emoji || '❓'}
          </div>
        ) : null}
        <div>
          <p className="text-[#e94560] font-bold text-sm">{speaker}</p>
        </div>
      </div>

      {/* Text */}
      <div className="mb-6">
        <p className="story-text text-gray-200 leading-relaxed whitespace-pre-line">{text}</p>
      </div>

      {/* Options */}
      <div className="space-y-2">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">{t('ui.choose')}</p>
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={opt.onClick}
            disabled={opt.disabled}
            className={`w-full text-left p-3 rounded-lg option-btn transition-all text-sm ${
              opt.disabled
                ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                : 'bg-[#1a1a2e]/80 text-gray-200 hover:bg-[#0f3460]/80 hover:border-[#e94560]'
            }`}
            title={opt.disabledReason}
          >
            <div className="flex items-center gap-2">
              <span className="text-[#e94560]">▶</span>
              <span>{opt.text}</span>
              {opt.disabled && (
                <span className="text-xs text-gray-500 ml-auto">🔒 {opt.disabledReason}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
