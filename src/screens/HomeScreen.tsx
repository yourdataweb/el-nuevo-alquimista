import { useTranslation } from 'react-i18next';
import { useGameStore } from '../store/gameStore';
import GameLayout from '../components/GameLayout';
import { homeLocation } from '../data/cities/barcelona';

interface HomeScreenProps {
  onGoToMap: () => void;
}

type StatEffect = Partial<{
  vitality: number;
  resources: number;
  knowledge: number;
  social: number;
  career: number;
  fulfillment: number;
}>;

export default function HomeScreen({ onGoToMap }: HomeScreenProps) {
  const { t, i18n } = useTranslation();
  const updateStats = useGameStore((s) => s.updateStats);
  const advanceTime = useGameStore((s) => s.advanceTime);
  const usedActions = useGameStore((s) => s.usedHomeActions);
  const addUsedHomeAction = useGameStore((s) => s.addUsedHomeAction);

  const home = homeLocation();
  const homeName = i18n.language === 'ca' ? home.nameCa : i18n.language === 'es' ? home.nameEs : home.name;
  const homeDesc = i18n.language === 'ca' ? home.descriptionCa : i18n.language === 'es' ? home.descriptionEs : home.description;

  const interactions: { id: string; icon: string; label: string; desc: string; effects: StatEffect; time: number }[] = [
    {
      id: 'goout',
      icon: '☀️',
      label: t('home.goOut'),
      desc: t('home.goOutDesc'),
      effects: {},
      time: 0,
    },
    {
      id: 'breakfast',
      icon: '🥐',
      label: t('home.breakfast'),
      desc: t('home.breakfastDesc'),
      effects: { vitality: 3, resources: -3 },
      time: 0.5,
    },
    {
      id: 'work',
      icon: '💻',
      label: t('home.workRemotely'),
      desc: t('home.workRemotelyDesc'),
      effects: { resources: 30, career: 2, vitality: -3 },
      time: 4,
    },
  ];

  const handleInteraction = (effect: StatEffect, hours: number, actionId: string) => {
    if (actionId !== 'goout') {
      addUsedHomeAction(actionId);
    }
    updateStats(effect as StatEffect);
    if (hours > 0) advanceTime(hours);
  };

  const isUsed = (id: string) => usedActions.includes(id);

  return (
    <GameLayout showMapButton={false}>
      <div className="flex flex-col h-full">

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4 max-w-2xl mx-auto">
            {/* Location header */}
            <div className="fade-in mb-4">
              <div className="text-4xl mb-2">🏠</div>
              <h2 className="text-white font-bold text-lg">{homeName}</h2>
              <p className="text-gray-500 text-sm">{homeDesc}</p>
            </div>

            {/* Morning feeling */}
            <div className="dialogue-box p-3 mb-4 text-sm text-gray-300">
              {i18n.language === 'ca'
                ? "El sol entra per la finestra. El ventilador de sosté gira. El somni d'aquesta nit encara és fresc a la teva ment. Què fas?"
                : i18n.language === 'es'
                ? 'El sol entra por la ventana. El ventilador de techo gira. El sueño de esta noche aún está fresco en tu mente. ¿Qué haces?'
                : "Sunlight streams through the window. The ceiling fan turns. Last night's dream is still fresh in your mind. What do you do?"}
            </div>

            {/* Morning activities grid */}
            <div className="grid grid-cols-2 gap-3">
              {interactions.filter((a) => a.id !== 'goout').map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleInteraction(action.effects, action.time, action.id)}
                  disabled={isUsed(action.id)}
                  className={`p-3 rounded-xl transition-all text-left active:scale-[0.98] ${
                    isUsed(action.id)
                      ? 'bg-[#252525]/50 border border-gray-700 opacity-50 cursor-not-allowed'
                      : 'bg-[#252525] border border-gray-700 hover:border-[#e94560]/70 hover:bg-[#e0dbd3] cursor-pointer'
                  }`}
                >
                  <div className="text-2xl mb-1">{action.icon}</div>
                  <div className="text-white font-semibold text-sm">{action.label}</div>
                  <div className="text-gray-400 text-xs mt-0.5">{action.desc}</div>
                  {action.time > 0 && (
                    <div className="text-xs text-gray-500 mt-1">⏳ {action.time}h</div>
                  )}
                  {isUsed(action.id) && (
                    <div className="text-xs text-green-600 mt-1">✓ Done</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Sticky go outside button ── */}
        <div className="shrink-0 px-4 py-3 bg-[#191919] border-t border-gray-700">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={onGoToMap}
              className="w-full py-4 rounded-xl font-bold text-base text-white bg-gradient-to-r from-[#22c55e] to-[#16a34a] shadow-lg shadow-[#22c55e]/25 hover:brightness-110 active:scale-[0.98] transition-all"
            >
              {interactions.find((a) => a.id === 'goout')?.icon} {interactions.find((a) => a.id === 'goout')?.label} →
            </button>
          </div>
        </div>

      </div>
    </GameLayout>
  );
}