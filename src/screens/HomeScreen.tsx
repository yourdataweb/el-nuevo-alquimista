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
    {
      id: 'phone',
      icon: '📱',
      label: t('home.phone'),
      desc: t('home.phoneDesc'),
      effects: { social: 1 },
      time: 0.25,
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
      <div className="p-4 max-w-2xl mx-auto">
        {/* Location header */}
        <div className="fade-in mb-4">
          <div className="text-4xl mb-2">🏠</div>
          <h2 className="text-white font-bold text-lg">{homeName}</h2>
          <p className="text-gray-400 text-sm">{homeDesc}</p>
        </div>

        {/* Morning feeling */}
        <div className="dialogue-box p-3 mb-4 text-sm text-gray-300">
          {i18n.language === 'ca'
            ? 'El sol entra per la finestra. El ventilador de sosté gira. El somni d\'aquesta nit encara és fresc a la teva ment. Què fas?'
            : i18n.language === 'es'
            ? 'El sol entra por la ventana. El ventilador de techo gira. El sueño de esta noche aún está fresco en tu mente. ¿Qué haces?'
            : 'Sunlight streams through the window. The ceiling fan turns. Last night\'s dream is still fresh in your mind. What do you do?'}
        </div>

        {/* Interaction grid */}
        <div className="grid grid-cols-2 gap-3">
          {interactions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                if (action.id === 'goout') {
                  onGoToMap();
                } else {
                  handleInteraction(action.effects, action.time, action.id);
                }
              }}
              disabled={isUsed(action.id)}
              className={`p-3 rounded-lg transition-all text-left ${
                isUsed(action.id)
                  ? 'bg-[#16213e]/40 border border-gray-800/50 opacity-50 cursor-not-allowed'
                  : 'bg-[#16213e] border border-gray-700 hover:border-[#e94560] hover:bg-[#0f3460]/80'
              }`}
            >
              <div className="text-2xl mb-1">{action.icon}</div>
              <div className="text-white font-semibold text-sm">{action.label}</div>
              <div className="text-gray-400 text-xs mt-0.5">{action.desc}</div>
              {action.time > 0 && (
                <div className="text-[10px] text-gray-500 mt-1">⏳ {action.time}h</div>
              )}
              {isUsed(action.id) && (
                <div className="text-[10px] text-green-500 mt-1">✓ Done</div>
              )}
            </button>
          ))}
        </div>
      </div>
    </GameLayout>
  );
}