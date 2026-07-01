// ── Shared Types for Badass Quest 2 ──

export interface Position {
  lat: number;
  lng: number;
}

export interface LocationPOI {
  id: string;
  name: string;
  nameEs?: string;
  nameCa?: string;
  type: LocationType;
  position: Position;
  address: string;
  description: string;
  descriptionEs?: string;
  descriptionCa?: string;
  sprite?: string;
}

export type LocationType =
  | 'plaza'
  | 'library'
  | 'park'
  | 'market'
  | 'church'
  | 'monument'
  | 'cafe'
  | 'theatre'
  | 'office'
  | 'home'
  | 'airport';

export interface StoryRole {
  role: string;
  requiredType: LocationType;
  label: string;
  description: string;
}

export type CompletionCriteria =
  | { kind: 'visit_location'; locationId: string }
  | { kind: 'visit_all_locations'; locationIds: string[] }
  | { kind: 'none' };

export interface StoryChapter {
  id: string;
  title: string;
  role: 'story' | 'sandbox';
  description: string;
  locationsToShow?: string[];
  /** Location IDs that trigger the chapter dialogue when visited (story-critical locations). Can be one or many. */
  requiredLocationIds?: string[];
  completionCriteria?: CompletionCriteria;
  dialogue: DialogueNode[];
  momentLimit?: MomentLimit;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  textEs?: string;
  textCa?: string;
  sprite?: string;
  options: DialogueOption[];
}

export interface DialogueOption {
  id: string;
  text: string;
  textEs?: string;
  textCa?: string;
  requirements?: Partial<Stats>;
  effects: Partial<Stats>;
  nextNodeId?: string;
  flags?: Record<string, boolean>;
}

export interface MomentLimit {
  text: string;
  textEs?: string;
  textCa?: string;
  timeSeconds: number;
  options: MomentOption[];
}

export interface MomentOption {
  id: string;
  text: string;
  textEs?: string;
  textCa?: string;
  requirements?: Partial<Stats>;
  effects: Partial<Stats>;
  resultText: string;
  resultTextEs?: string;
  resultTextCa?: string;
  flags?: Record<string, boolean>;
}

export interface City {
  id: string;
  name: string;
  nameEs: string;
  nameCa: string;
  country: string;
  position: Position;
  locations: LocationPOI[];
}

export interface BookArchetype {
  id: string;
  title: string;
  titleEs: string;
  titleCa: string;
  roles: StoryRole[];
  chapters: StoryChapter[];
}

export interface Stats {
  vitality: number;
  resources: number;
  knowledge: number;
  social: number;
  career: number;
  fulfillment: number;
}

export interface GameState {
  phase: GamePhase;
  currentChapter: number;
  currentLocationId: string | null;
  stats: Stats;
  time: GameTime;
  dialogueHistory: string[];
  flags: Record<string, boolean>;
  chosenCity: string | null;
  chosenBook: string | null;
  chosenCharacter: string | null;
  selectedOptionIds: string[];
  visitedLocationIds: string[];
  completedChapterIds: string[];
  usedHomeActions: string[];
  /** Per‑location tracking of completed side‑quest activity IDs. Reset each visit. */
  completedLocationActivities: Record<string, string[]>;
}

export type GamePhase =
  | 'title'
  | 'city_select'
  | 'intro'
  | 'home'
  | 'map'
  | 'walking'
  | 'location'
  | 'dialogue'
  | 'moment_limite'
  | 'activity_picker'
  | 'recap'
  | 'epilogue';

export interface GameTime {
  day: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
  dayOfWeek: number;
  timeLabel: string;
}

export interface DailyActivity {
  id: string;
  title: string;
  titleEs?: string;
  titleCa?: string;
  durationHours: number;
  effects: Partial<Stats>;
  description: string;
  descriptionEs?: string;
  descriptionCa?: string;
}

export interface PlayerDecision {
  chapterId: string;
  nodeId: string;
  chosenOptionId: string;
  timestamp: GameTime;
}