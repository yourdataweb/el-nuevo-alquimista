import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useGameStore } from './store/gameStore';
import { getCityById, getAllCities, getHomeLocationId, getLocationById } from './data/cities/index';
import { getStoryById, getAllStories } from './data/story/index';
import { flyToMap } from './components/MapBackground';
import {
  isCorrectLocation,
  resolveRequiredLocations,
  handleDialogueComplete as engineDialogueComplete,
  handleRecapNext as engineRecapNext,
  checkAutoAdvance,
} from './engine/storyEngine';
import type { LocationPOI, Position } from './store/types';

function distKm(a: Position, b: Position): number {
  const dlat = (b.lat - a.lat) * 111.32;
  const dlng = (b.lng - a.lng) * 111.32 * Math.cos(a.lat * Math.PI / 180);
  return Math.sqrt(dlat * dlat + dlng * dlng);
}

import MapBackground from './components/MapBackground';
import MapBottomSheet from './components/MapBottomSheet';
import TitleScreen from './screens/TitleScreen';
import CitySelectScreen from './screens/CitySelectScreen';
import IntroScreen from './screens/IntroScreen';
import HomeScreen from './screens/HomeScreen';
import LocationScreen from './screens/LocationScreen';
import DialogueScreen from './screens/DialogueScreen';
import ActivityPickerScreen from './screens/ActivityPickerScreen';
import RecapScreen from './screens/RecapScreen';
import SideScroller from './components/minigames/SideScroller';
import GameLayout from './components/GameLayout';
import LanguageSwitcher from './components/LanguageSwitcher';
import StatsBar from './components/StatsBar';
import { formatTime } from './engine/timeEngine';
import { assertStoryForCity } from './engine/validateStory';
import { useTranslation } from 'react-i18next';

if (import.meta.env.DEV) {
  for (const story of getAllStories()) {
    for (const city of getAllCities()) {
      assertStoryForCity(story, city);
    }
  }
}

function Overlay({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-10 flex flex-col bg-[#1a1a2e]/20 backdrop-blur-[1px] overflow-y-auto">
      {children}
    </div>
  );
}

function Cover({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-10 flex flex-col bg-[#1a1a2e] overflow-y-auto">
      {children}
    </div>
  );
}

export default function App() {
  const phase = useGameStore((s) => s.phase);
  const currentChapter = useGameStore((s) => s.currentChapter);
  const visitedLocationIds = useGameStore((s) => s.visitedLocationIds);
  const completedChapterIds = useGameStore((s) => s.completedChapterIds);
  const setPhase = useGameStore((s) => s.setPhase);
  const updateStats = useGameStore((s) => s.updateStats);
  const setChapter = useGameStore((s) => s.setChapter);
  const currentLocationId = useGameStore((s) => s.currentLocationId);
  const setCurrentLocation = useGameStore((s) => s.setCurrentLocation);
  const advanceTime = useGameStore((s) => s.advanceTime);
  const markChapterComplete = useGameStore((s) => s.markChapterComplete);
  const time = useGameStore((s) => s.time);
  const chosenCity = useGameStore((s) => s.chosenCity);
  const chosenBook = useGameStore((s) => s.chosenBook);
  const [travelSecs, setTravelSecs] = useState(25);
  const { i18n } = useTranslation();

  const city = chosenCity ? getCityById(chosenCity) : null;
  const story = chosenBook ? getStoryById(chosenBook) : null;
  const allChapters = story?.chapters ?? [];
  const chapter = allChapters[currentChapter];
  const isLastChapter = currentChapter >= allChapters.length - 1;
  const showMapBackground = true;

  const doAdvance = useCallback((advance: { phase: string; newChapterIndex: number }, markCurrentId: string) => {
    markChapterComplete(markCurrentId);
    setChapter(advance.newChapterIndex);
    setPhase(advance.phase as any);
  }, [markChapterComplete, setChapter, setPhase]);

  useEffect(() => {
    if (phase !== 'map' || !city) return;
    if (chapter && completedChapterIds.includes(chapter.id)) return;

    const advance = checkAutoAdvance(currentChapter, visitedLocationIds, completedChapterIds, allChapters, city.locations);
    if (advance && chapter) {
      doAdvance(advance, chapter.id);
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== 'map' || !city) return;
    if (chapter && completedChapterIds.includes(chapter.id)) return;

    const advance = checkAutoAdvance(currentChapter, visitedLocationIds, completedChapterIds, allChapters, city.locations);
    if (advance && chapter) {
      doAdvance(advance, chapter.id);
    }
  }, [visitedLocationIds]);

  const handleLocationSelect = useCallback((loc: LocationPOI) => {
    const fromLoc = (currentLocationId && city) ? getLocationById(city, currentLocationId) : null;
    const km = fromLoc ? distKm(fromLoc.position, loc.position) : 5;
    setTravelSecs(Math.round(Math.max(2, Math.min(13, 2 + km))));
    flyToMap(loc.position.lat, loc.position.lng, 16);
    setCurrentLocation(loc.id);
    setPhase('walking');
  }, [setPhase, setCurrentLocation, currentLocationId, city]);

  const handleLocationBack = useCallback(() => {
    setPhase('map');
  }, [setPhase]);

  const handleLocationProceed = useCallback(() => {
    setPhase('dialogue');
  }, [setPhase]);

  const handleDialogueComplete = useCallback(() => {
    const result = engineDialogueComplete(chapter, currentChapter, visitedLocationIds, allChapters, city?.locations ?? []);
    if (result.newChapterIndex !== undefined && chapter) {
      doAdvance(result as any, chapter.id);
    } else {
      setPhase(result.phase as any);
    }
  }, [chapter, currentChapter, visitedLocationIds, allChapters, city, setPhase, doAdvance]);

  const handleRecapNext = useCallback(() => {
    if (isLastChapter) {
      if (chapter) markChapterComplete(chapter.id);
      setPhase('epilogue');
    } else {
      const result = engineRecapNext(currentChapter, allChapters);
      if (chapter) markChapterComplete(chapter.id);
      setChapter(result.newChapterIndex);
      setPhase(result.phase as any);
    }
  }, [currentChapter, isLastChapter, chapter, allChapters, setChapter, setPhase, markChapterComplete]);

  const handleEpilogueDone = useCallback(() => {
    setPhase('title');
  }, [setPhase]);

  const handleActivityDone = useCallback(() => {
    setPhase('map');
  }, [setPhase]);

  const handleHomeGoToMap = useCallback(() => {
    advanceTime(0.5);
    if (city) setCurrentLocation(getHomeLocationId(city));
    setPhase('map');
  }, [setPhase, advanceTime, setCurrentLocation, city]);

  const handleIntroDone = useCallback(() => {
    if (city) setCurrentLocation(getHomeLocationId(city));
    setPhase('home');
  }, [setCurrentLocation, setPhase, city]);

  const renderPhase = () => {
    switch (phase) {
      case 'title':
        return <Overlay><TitleScreen /></Overlay>;
      case 'city_select':
        return <Overlay><CitySelectScreen /></Overlay>;
      case 'intro':
        return <Overlay><IntroScreen onContinue={handleIntroDone} /></Overlay>;
      case 'home':
        return <Overlay><HomeScreen onGoToMap={handleHomeGoToMap} /></Overlay>;
      case 'walking':
        return (
          <div className="fixed inset-0 z-10 flex flex-col bg-[#1a1a2e]">
            <GameLayout>
              <SideScroller
                travelSecs={travelSecs}
                onComplete={(deltas) => {
                  updateStats(deltas);
                  setPhase('location');
                }}
              />
            </GameLayout>
          </div>
        );
      case 'map':
        return (
          <>
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-3 py-2 bg-[#16213e]/80 backdrop-blur-md border-b border-[#e94560]/30">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[#e94560] pixel-text text-[8px] sm:text-[10px] truncate">
                  Badass Quest 2
                </span>
              </div>
              <LanguageSwitcher />
            </div>
            <div className="fixed top-[40px] left-0 right-0 z-50 px-3 py-1 bg-[#0f3460]/60 backdrop-blur-sm text-center text-xs text-gray-300">
              {formatTime(time, i18n.language)}
            </div>
            <MapBottomSheet onPlay={() => {}} />
            <div className="fixed bottom-0 left-0 right-0 z-50">
              <StatsBar />
            </div>
          </>
        );
      case 'location': {
        const currentLoc = (currentLocationId && city) ? getLocationById(city, currentLocationId) ?? null : null;
        if (!currentLoc) return <MapBottomSheet onPlay={() => {}} />;
        return (
          <Overlay>
            <LocationScreen
              location={currentLoc}
              isCorrect={isCorrectLocation(chapter, currentLoc, city?.locations ?? [])}
              otherRequiredTypeVisited={resolveRequiredLocations(
                chapter?.requiredLocationTypes ?? [],
                city?.locations ?? []
              ).some((l) => l.id !== currentLoc.id && visitedLocationIds.includes(l.id))}
              onBackToMap={handleLocationBack}
              onProceed={handleLocationProceed}
            />
          </Overlay>
        );
      }
      case 'dialogue':
        if (currentChapter >= allChapters.length) return null;
        return (
          <Overlay>
            <DialogueScreen chapterIndex={currentChapter} onComplete={handleDialogueComplete} />
          </Overlay>
        );
      case 'activity_picker':
        return (
          <Overlay>
            <ActivityPickerScreen onComplete={handleActivityDone} />
          </Overlay>
        );
      case 'recap':
        if (currentChapter >= allChapters.length) return null;
        return (
          <Overlay>
            <RecapScreen chapterIndex={currentChapter} onNext={handleRecapNext} isLastChapter={isLastChapter} />
          </Overlay>
        );
      case 'epilogue':
        return (
          <Cover>
            <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-6">
              <div className="fade-in text-center max-w-md">
                <div className="text-6xl mb-6">🏁</div>
                <h1 className="pixel-text text-3xl text-[#e94560] mb-4">The End</h1>
                <p className="text-gray-300 text-base mb-8 leading-relaxed">
                  The journey is never truly over. Someone else is just beginning theirs.
                </p>
                <button
                  onClick={handleEpilogueDone}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm
                    bg-gradient-to-r from-[#22c55e] to-[#16a34a]
                    hover:shadow-[0_0_30px_rgba(34,197,94,0.35)]
                    active:scale-[0.98] text-white transition-all"
                >
                  Return to Title
                </button>
              </div>
            </div>
          </Cover>
        );
      default:
        return <Cover><TitleScreen /></Cover>;
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#1a1a2e]">
      {showMapBackground && (
        <MapBackground onLocationSelect={handleLocationSelect} />
      )}
      {renderPhase()}
    </div>
  );
}
