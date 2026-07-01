import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../store/gameStore';
import GameLayout from '../components/GameLayout';
import DialogueBox from '../components/DialogueBox';
import MomentLimite from '../components/MomentLimite';
import { elAlquimista } from '../data/story/el-alquimista';
import type { DialogueNode } from '../store/types';

interface DialogueScreenProps {
  chapterIndex: number;
  onComplete: () => void;
}

export default function DialogueScreen({ chapterIndex, onComplete }: DialogueScreenProps) {
  const { t, i18n } = useTranslation();
  const updateStats = useGameStore((s) => s.updateStats);
  const recordDecision = useGameStore((s) => s.recordDecision);
  const stats = useGameStore((s) => s.stats);
  const statsRecord: Record<string, number> = stats as unknown as Record<string, number>;

  const chapter = elAlquimista.chapters[chapterIndex];
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [showMomentLimit, setShowMomentLimit] = useState(false);

  const currentNode: DialogueNode | undefined = chapter.dialogue[currentNodeIndex];
  const hasMomentLimit = chapter.momentLimit !== undefined;

  const getSpeakerName = (speaker: string): string => {
    const key = speaker.toLowerCase();
    if (['melquisedec', 'merce', 'englishman', 'alchemist', 'narrator'].includes(key)) {
      return t(`characters.${key}`);
    }
    return speaker;
  };

  const getLocalizedText = (
    text: string,
    textEs?: string,
    textCa?: string
  ): string => {
    if (i18n.language === 'ca' && textCa) return textCa;
    if (i18n.language === 'es' && textEs) return textEs;
    return text;
  };

  const handleOption = (optionId: string) => {
    const opt = currentNode?.options.find((o) => o.id === optionId);
    if (!opt) return;

    // Apply effects
    updateStats(opt.effects);
    recordDecision(chapter.id, currentNode?.id ?? '', optionId);

    // Check for next node
    if (opt.nextNodeId) {
      const nextIdx = chapter.dialogue.findIndex((d) => d.id === opt.nextNodeId);
      if (nextIdx !== -1) {
        setCurrentNodeIndex(nextIdx);
        return;
      }
    }

    // If dialogue ends here, check for moment limit or complete
    if (hasMomentLimit) {
      setShowMomentLimit(true);
    } else {
      onComplete();
    }
  };

  const handleMomentOption = (optionId: string) => {
    const opt = chapter.momentLimit?.options.find((o) => o.id === optionId);
    if (!opt) return;
    updateStats(opt.effects);
    recordDecision(chapter.id, 'moment_limit', optionId);
  };

  const handleMomentComplete = () => {
    setShowMomentLimit(false);
    onComplete();
  };

  if (!currentNode) return null;

  if (showMomentLimit && chapter.momentLimit) {
    const ml = chapter.momentLimit;
    return (
      <GameLayout>
        <div className="h-full p-4 max-w-2xl mx-auto">
          <MomentLimite
            text={getLocalizedText(ml.text, ml.textEs, ml.textCa)}
            timeSeconds={ml.timeSeconds}
            options={ml.options.map((opt) => ({
              id: opt.id,
              text: getLocalizedText(opt.text, opt.textEs, opt.textCa),
              requirements: opt.requirements as Partial<Record<string, number>> | undefined,
              currentStats: statsRecord,
              effects: opt.effects as Record<string, number>,
              resultText: getLocalizedText(opt.resultText, opt.resultTextEs, opt.resultTextCa),
              onClick: () => {
                handleMomentOption(opt.id);
              },
            }))}
            onTimeout={handleMomentComplete}
          />
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout>
      <div className="h-full p-4">
        <DialogueBox
          speaker={getSpeakerName(currentNode.speaker)}
          text={getLocalizedText(currentNode.text, currentNode.textEs, currentNode.textCa)}
          speakerSprite={currentNode.sprite}
          options={currentNode.options.map((opt) => ({
            id: opt.id,
            text: getLocalizedText(opt.text, opt.textEs, opt.textCa),
            disabled: false,
            onClick: () => handleOption(opt.id),
          }))}
        />
      </div>
    </GameLayout>
  );
}