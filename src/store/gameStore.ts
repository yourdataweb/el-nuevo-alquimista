import { create } from 'zustand';
import type { GameState, GamePhase, Stats, GameTime } from './types';

const INITIAL_STATS: Stats = {
  vitality: 50,
  resources: 200,
  knowledge: 10,
  social: 10,
  career: 10,
  fulfillment: 10,
};

function getInitialTime(): GameTime {
  const now = new Date();
  return {
    day: now.getDate(),
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    hour: 8,
    minute: 0,
    dayOfWeek: now.getDay(),
    timeLabel: `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} 08:00`,
  };
}

interface GameStore extends GameState {
  setPhase: (phase: GamePhase) => void;
  setChapter: (chapter: number) => void;
  setCurrentLocation: (locationId: string | null) => void;
  updateStats: (delta: Partial<Stats>) => void;
  setStats: (stats: Stats) => void;
  advanceTime: (hours: number, minutes?: number) => void;
  setTime: (time: GameTime) => void;
  addFlag: (flag: string) => void;
  removeFlag: (flag: string) => void;
  setCity: (cityId: string) => void;
  setBook: (bookId: string) => void;
  setCharacter: (characterId: string) => void;
  addVisitedLocation: (locationId: string) => void;
  addUsedHomeAction: (actionId: string) => void;
  recordDecision: (chapterId: string, nodeId: string, optionId: string) => void;
  markChapterComplete: (chapterId: string) => void;
  /** Mark a side‑quest activity as completed at a location (per‑visit). */
  markLocationActivityComplete: (locationId: string, activityId: string) => void;
  resetGame: () => void;
}

const initialState: GameState = {
  phase: 'title',
  currentChapter: 0,
  currentLocationId: null,
  stats: { ...INITIAL_STATS },
  time: getInitialTime(),
  dialogueHistory: [],
  flags: {},
  chosenCity: null,
  chosenBook: null,
  chosenCharacter: null,
  selectedOptionIds: [],
  visitedLocationIds: [],
  completedChapterIds: [],
  usedHomeActions: [],
  completedLocationActivities: {},
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),

  setChapter: (chapter) => set({ currentChapter: chapter, usedHomeActions: [] }),

  setCurrentLocation: (locationId) => set({ currentLocationId: locationId }),

  updateStats: (delta) =>
    set((state) => {
      const newStats = { ...state.stats };
      for (const [key, value] of Object.entries(delta)) {
        const k = key as keyof Stats;
        if (k === 'resources') {
          newStats[k] = Math.max(0, newStats[k] + (value as number));
        } else {
          newStats[k] = Math.max(0, Math.min(100, newStats[k] + (value as number)));
        }
      }
      return { stats: newStats };
    }),

  setStats: (stats) => set({ stats }),

  advanceTime: (hours, minutes = 0) =>
    set((state) => {
      const t = { ...state.time };
      let newHour = t.hour + hours;
      let newMinute = t.minute + minutes;
      let newDay = t.day;
      let newMonth = t.month;
      let newYear = t.year;
      let newDayOfWeek = t.dayOfWeek;

      if (newMinute >= 60) {
        newHour += Math.floor(newMinute / 60);
        newMinute = newMinute % 60;
      }

      if (newHour >= 24) {
        const days = Math.floor(newHour / 24);
        newHour = newHour % 24;
        newDay += days;
        newDayOfWeek = (newDayOfWeek + days) % 7;
      }

      const daysInMonth = new Date(newYear, newMonth, 0).getDate();
      if (newDay > daysInMonth) {
        newDay -= daysInMonth;
        newMonth += 1;
        if (newMonth > 12) {
          newMonth = 1;
          newYear += 1;
        }
      }

      const timeLabel = `${String(newDay).padStart(2, '0')}/${String(newMonth).padStart(2, '0')}/${newYear} ${String(newHour).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}`;

      return {
        time: {
          day: newDay,
          month: newMonth,
          year: newYear,
          hour: newHour,
          minute: newMinute,
          dayOfWeek: newDayOfWeek,
          timeLabel,
        },
      };
    }),

  setTime: (time) => set({ time }),

  addFlag: (flag) =>
    set((state) => ({ flags: { ...state.flags, [flag]: true } })),

  removeFlag: (flag) =>
    set((state) => {
      const newFlags = { ...state.flags };
      delete newFlags[flag];
      return { flags: newFlags };
    }),

  setCity: (cityId) => set({ chosenCity: cityId }),
  setBook: (bookId) => set({ chosenBook: bookId }),
  setCharacter: (characterId) => set({ chosenCharacter: characterId }),

  addUsedHomeAction: (actionId) =>
    set((state) => {
      if (state.usedHomeActions.includes(actionId)) return state;
      return { usedHomeActions: [...state.usedHomeActions, actionId] };
    }),

  addVisitedLocation: (locationId) =>
    set((state) => {
      if (state.visitedLocationIds.includes(locationId)) return state;
      return { visitedLocationIds: [...state.visitedLocationIds, locationId] };
    }),

  markLocationActivityComplete: (locationId, activityId) =>
    set((state) => {
      const current = state.completedLocationActivities[locationId] ?? [];
      if (current.includes(activityId)) return state;
      return {
        completedLocationActivities: {
          ...state.completedLocationActivities,
          [locationId]: [...current, activityId],
        },
      };
    }),

  recordDecision: (chapterId, nodeId, optionId) =>
    set((state) => ({
      selectedOptionIds: [...state.selectedOptionIds, `${chapterId}:${nodeId}:${optionId}`],
    })),

  markChapterComplete: (chapterId) =>
    set((state) => {
      if (state.completedChapterIds.includes(chapterId)) return state;
      return { completedChapterIds: [...state.completedChapterIds, chapterId] };
    }),

  resetGame: () => set({ ...initialState, time: getInitialTime() }),
}));

// Expose store globally for Cypress e2e tests
if (typeof window !== 'undefined') {
  (window as any).__GAME_STORE = useGameStore;
}
