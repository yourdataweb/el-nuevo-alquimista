/**
 * Side‑quest location activities: independent of the main story.
 * Each location type offers a set of activities; each activity links
 * to a mini‑game that must be played (and won) to earn stat rewards.
 */

import type { Stats } from '../store/types';

/** Which mini‑game runs for this activity. */
export type MiniGameKind = 'memory_match' | 'timing_bar';

export interface ActivityDef {
  /** Unique id within the activity catalog, e.g. "library_read" */
  id: string;
  /** i18n key prefix – resolved as `activitiesSide.${id}` */
  i18nKey: string;
  /** Which mini‑game engine to open */
  miniGame: MiniGameKind;
  /** Time consumed whether the player wins or loses (hours) */
  durationHours: number;
  /** Stat deltas applied *only* on a successful play‑through */
  effects: Partial<Stats>;
  /** Short flavour description (not i18n, shown in tooltip) */
  fluff: string;
}

/** Standard activities grouped by location type. */
const ACTIVITIES: Record<string, ActivityDef[]> = {
  library: [
    {
      id: 'library_read',
      i18nKey: 'libraryRead',
      miniGame: 'memory_match',
      durationHours: 1.5,
      effects: { knowledge: 5 },
      fluff: 'Match ancient symbols to unlock hidden knowledge.',
    },
    {
      id: 'library_research',
      i18nKey: 'libraryResearch',
      miniGame: 'timing_bar',
      durationHours: 2,
      effects: { knowledge: 3, career: 2 },
      fluff: 'Find rare books before the librarian closes.',
    },
  ],

  park: [
    {
      id: 'park_exercise',
      i18nKey: 'parkExercise',
      miniGame: 'timing_bar',
      durationHours: 1,
      effects: { vitality: 5 },
      fluff: 'Train your reflexes with calisthenics.',
    },
    {
      id: 'park_meditate',
      i18nKey: 'parkMeditate',
      miniGame: 'memory_match',
      durationHours: 1,
      effects: { fulfillment: 4 },
      fluff: 'Focus your mind and let the city fade.',
    },
  ],

  cafe: [
    {
      id: 'cafe_chat',
      i18nKey: 'cafeChat',
      miniGame: 'timing_bar',
      durationHours: 1,
      effects: { social: 4 },
      fluff: 'Strike up a conversation with a stranger.',
    },
    {
      id: 'cafe_write',
      i18nKey: 'cafeWrite',
      miniGame: 'memory_match',
      durationHours: 2,
      effects: { career: 3, knowledge: 2 },
      fluff: 'Write your thoughts between sips of coffee.',
    },
  ],

  market: [
    {
      id: 'market_haggle',
      i18nKey: 'marketHaggle',
      miniGame: 'timing_bar',
      durationHours: 1,
      effects: { resources: 5, social: 2 },
      fluff: 'Haggle for a better price on fresh goods.',
    },
    {
      id: 'market_taste',
      i18nKey: 'marketTaste',
      miniGame: 'memory_match',
      durationHours: 0.5,
      effects: { vitality: 3, resources: 2 },
      fluff: 'Identify ingredients by taste and smell.',
    },
  ],

  plaza: [
    {
      id: 'plaza_street',
      i18nKey: 'plazaStreet',
      miniGame: 'timing_bar',
      durationHours: 1,
      effects: { social: 3, resources: 3 },
      fluff: 'Perform for passers‑by and collect tips.',
    },
    {
      id: 'plaza_people',
      i18nKey: 'plazaPeople',
      miniGame: 'memory_match',
      durationHours: 1,
      effects: { social: 2, knowledge: 2 },
      fluff: 'Observe the crowd — every face tells a story.',
    },
  ],

  church: [
    {
      id: 'church_contemplate',
      i18nKey: 'churchContemplate',
      miniGame: 'memory_match',
      durationHours: 1,
      effects: { fulfillment: 5 },
      fluff: 'Find peace in the silence of stone arches.',
    },
    {
      id: 'church_inspect',
      i18nKey: 'churchInspect',
      miniGame: 'timing_bar',
      durationHours: 1.5,
      effects: { knowledge: 4 },
      fluff: 'Decipher the hidden symbols in the stained glass.',
    },
  ],

  theatre: [
    {
      id: 'theatre_watch',
      i18nKey: 'theatreWatch',
      miniGame: 'memory_match',
      durationHours: 2,
      effects: { fulfillment: 3, knowledge: 2 },
      fluff: 'Get lost in a story on stage.',
    },
  ],

  office: [
    {
      id: 'office_network',
      i18nKey: 'officeNetwork',
      miniGame: 'timing_bar',
      durationHours: 1,
      effects: { career: 3, social: 2 },
      fluff: 'Make the right contacts at the right moment.',
    },
    {
      id: 'office_upskill',
      i18nKey: 'officeUpskill',
      miniGame: 'memory_match',
      durationHours: 2,
      effects: { career: 4, knowledge: 2 },
      fluff: 'Crash an online course during lunch break.',
    },
  ],

  monument: [
    {
      id: 'monument_photo',
      i18nKey: 'monumentPhoto',
      miniGame: 'timing_bar',
      durationHours: 1,
      effects: { fulfillment: 3, knowledge: 2 },
      fluff: 'Capture the perfect shot at golden hour.',
    },
    {
      id: 'monument_study',
      i18nKey: 'monumentStudy',
      miniGame: 'memory_match',
      durationHours: 1.5,
      effects: { knowledge: 4 },
      fluff: 'Learn the history carved into every stone.',
    },
  ],
};

/** Ensure every location type gets at least one activity. */
const ALL_TYPES = [
  'plaza', 'library', 'park', 'market', 'church',
  'monument', 'cafe', 'theatre', 'office',
] as const;

for (const t of ALL_TYPES) {
  if (!ACTIVITIES[t]) {
    ACTIVITIES[t] = [
      {
        id: `${t}_default`,
        i18nKey: `${t}Default`,
        miniGame: 'memory_match',
        durationHours: 1,
        effects: { knowledge: 2 },
        fluff: 'Explore the area and discover something new.',
      },
    ];
  }
}

/** Get available side‑quest activities for a given location type. */
export function getActivitiesForType(type: string): ActivityDef[] {
  return ACTIVITIES[type] ?? ACTIVITIES.plaza;
}

export default ACTIVITIES;
