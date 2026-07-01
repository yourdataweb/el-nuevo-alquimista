# Badass Quest 2

A narrative RPG set on the real-world map of Barcelona.  
Every city is a new Personal Legend.

Powered by AI narrative generation.  
Built with React 19, TypeScript (strict), Vite 8, Leaflet + OpenStreetMap, Zustand 5, Tailwind CSS 4, and i18next.

---

## How to Run

### Prerequisites

- **Node.js 24.16+** (use `.nvmrc` to auto-switch)
- **npm**

### Install & Start

```bash
# Use the right node version (if nvm is installed)
nvm use

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open **http://localhost:5173** in your browser.

### Build for Production

```bash
npm run build
```

Output goes to `dist/`.

### Deployment

The app is deployed to [GitHub Pages](https://yourdataweb.github.io/badass-quest-2/) automatically via GitHub Actions on every push to `master`. See `.github/workflows/deploy.yml`.

To set this up in a new repo: go to **Settings → Pages** and set the source to **GitHub Actions**.

### TypeScript Check

```bash
npx tsc --noEmit
```

### E2E Tests

```bash
npm run test:e2e
```

Runs Cypress in headless Electron. 12 tests covering all screens, chapter progression, language switching, and state persistence.

---

## Architecture

The game follows a **phase-driven finite state machine** pattern with a clean separation of concerns:

```
┌──────────────────────┐
│     App.tsx          │  ← Phase orchestrator (reads store phase, renders the right screen)
├──────────────────────┤
│   screens/           │  ← One React component per game phase
├──────────────────────┤
│   components/        │  ← Shared UI (DialogueBox, StatsBar, MapBackground, etc.)
├──────────────────────┤
│   engine/            │  ← Pure functions (no React). Progression, time, economy.
├──────────────────────┤
│   data/              │  ← Static content. Locations, dialogue trees, chapter definitions.
├──────────────────────┤
│   store/             │  ← Zustand. Single global store, also exposed on window.__GAME_STORE
└──────────────────────┘
```

### State → UI flow

```
Game Store (Zustand)
    │
    ▼
App.tsx reads phase, currentChapter from store
    │
    ▼
Renders the matching screen component (e.g. <MapScreen />)
    │
    ▼
Screen uses store actions (setPhase, setChapter, addVisitedLocation...) for state changes
    │
    ▼
Store updates → React re-renders → new phase or screen
```

---

## Game Phases (State Machine)

The `phase` field in the store drives everything:

```
title ─→ city_select ─→ intro ─→ home ─→ map ─→ location ─→ dialogue ─→ recap ─→ next chapter
                                                                                      │
                                                                                (or activity_picker for sandbox chapters)
```

| Phase | Screen | Description |
|---|---|---|
| `title` | TitleScreen | Animated starfield, "Start Game" button |
| `city_select` | CitySelectScreen | Choose Barcelona (more cities coming) |
| `intro` | IntroScreen | Opening narration + character portrait |
| `home` | HomeScreen | Apartment: shower, phones, check notes |
| `map` | MapBackground + MapBottomSheet | Full-screen Leaflet map, click markers to visit |
| `location` | LocationScreen | Arrived at destination, "Investigate →" for story locations |
| `dialogue` | DialogueScreen | NPC conversation with branching choices + character sprites |
| `recap` | RecapScreen | Chapter summary with stat changes + "Next Chapter" |
| `activity_picker` | ActivityPickerScreen | Sandbox: pick a daily activity (work, explore, socialise) |
| `epilogue` | (in App.tsx) | "The End" screen, return to title |

---

## Story / Data Model

All narrative content lives in `src/data/story/el-alquimista.ts`. Chapters are typed objects:

```typescript
interface StoryChapter {
  id: string;
  title: string;
  role: 'story' | 'sandbox';
  requiredLocationIds: string[];    // locations that trigger story progress
  completionCriteria?: {            // how sandbox chapters auto-advance
    kind: 'visit_location' | 'visit_all_locations';
    locationId?: string;
    locationIds?: string[];
  };
  locations: string[];              // all locations available in this chapter
  dialogues?: DialogueNode[];       // narrative tree for story chapters
}
```

### Chapter types

- **Story chapters** (1, 3, 5, 7): linear narrative. Visit required location → dialogue plays → recap → advance.
- **Sandbox chapters** (2, 4): free exploration. Visit locations → when completion criteria met → auto-advance to next chapter.
- **Prologue & Epilogue**: book-end story chapters.

### Progression engine (`storyEngine.ts`)

Pure functions (no React, no side effects):

- `getLocationsForChapter(chapter, allLocations)` — filters available locations
- `isCorrectLocation(chapter, locationId)` — checks if location is required for current chapter
- `checkAutoAdvance(chapterIndex, visitedIds, completedIds, chapters)` — returns next phase/chapter or null
- `handleDialogueComplete(chapterIndex, chapters)` — determines next phase (recap or auto-advance)
- `handleRecapNext(chapterIndex, chapters)` — advances to next chapter phase after recap
- `isCriteriaMet(chapter, visitedIds)` — checks sandbox completion criteria

---

## State Management

Single Zustand store at `src/store/gameStore.ts`:

```typescript
interface GameState {
  phase: GamePhase;
  currentChapter: number;         // index into elAlquimista.chapters
  currentLocationId: string | null;
  stats: Stats;                   // vitality, resources, knowledge, social, career, fulfillment
  time: GameTime;                 // day, month, year, hour, minute
  visitedLocationIds: string[];
  completedChapterIds: string[];
  selectedOptionIds: string[];    // dialogue decision records
  flags: Record<string, boolean>; // arbitrary story flags
  chosenCity: string | null;
  chosenBook: string | null;
}
```

**No persistence middleware** — state resets on page refresh. The `resetGame()` action is called on "Start Game" from the title screen so replays start fresh.

The store is also exposed globally as `window.__GAME_STORE` for Cypress tests to inject state directly.

---

## Map System

The Leaflet map renders at `z-0` behind all UI. On the `map` phase, UI chrome (header, time, footer stats) sits at `z-50` above the map as thin fixed bars, leaving the map fully interactive.

### MapBackground (`components/MapBackground.tsx`)
- Creates a single Leaflet map instance (no React-Leaflet — raw Leaflet via ref)
- Renders location markers as colored circles with emoji icons
- Required (story) locations have red markers; other locations use type-based colors
- Markers have popups with a "Investigate →" or "Visit" button
- Player location marker (red circle with white border + 🧑 emoji) follows `currentLocationId`
- Interactivity (dragging, zoom) is disabled on title/city_select phases (map is decorative)
- Exported helpers: `flyToMap(lat, lng, zoom)` and `flyToPlayer()`

### MapBottomSheet (`components/MapBottomSheet.tsx`)
- Shows chapter title and description at the bottom of the map screen
- No location list — all location interaction is through map marker popups

---

## Side Activities & Mini Games

Every location on the map offers **side activities** — optional mini-challenges that are unrelated to the main story but reward stat improvements and consume in-game time.

### Activity buttons

When you arrive at a location, activity buttons appear in the sticky bottom bar (above the main story/navigation actions). Each button shows:
- An icon indicating the game type
- The activity name
- Duration in hours and stat effects
- A ✓ badge once completed (greys out and disables the button)

### Mini game types

| Icon | Type | Mechanic | Good for |
|---|---|---|---|
| 🧠 | **Quick Quiz** | 3 questions, 8 s each — get ≥ 2 correct to win | Knowledge-heavy activities (reading, studying, contemplating) |
| 🎯 | **Tap Challenge** | Stop a moving indicator inside a green zone — 5 rounds, win ≥ 3 | Timing/skill activities (exercise, haggling, photography) |

### Activity data

Activities are defined per location **type** (not per individual location) in `src/data/locationActivities.ts`. Each `ActivityDef` has:

```typescript
interface ActivityDef {
  id: string;
  i18nKey: string;          // key in activitiesSide namespace
  miniGame: 'quick_quiz' | 'tap_challenge';
  durationHours: number;
  effects: Partial<Stats>;  // stat deltas applied on win
  fluff: string;            // subtitle shown in the mini-game modal
  quizData?: QuizQuestion[];// required for quick_quiz activities
}
```

`quick_quiz` activities include contextual questions related to the location type (e.g. alchemical manuscripts at libraries, Gothic architecture at churches, meditation techniques at parks). `tap_challenge` activities reward timing skill (e.g. matching exercise rhythm, timing a market offer, capturing the perfect photo).

---

## Location Images

Travel photos are stored at `public/locations/{locationId}.jpg` (20 real Wikimedia Commons photos). The `LocationImage` component loads these with a gradient-initials fallback if missing.

Character sprites (pixel art) are at `public/characters/{name}.{jpg|png}` and load in the `DialogueBox` component.

---

## Internationalization

Three locales: **EN**, **ES**, **CA**. All user-facing text is in `.json` files at `src/i18n/locales/`. The `LanguageSwitcher` component toggles on any screen.

Inline dialogue text in the story data (el-alquimista.ts) uses three fields per dialogue node: `text`, `textEs`, `textCa`.

---

## Styling

- **Tailwind CSS 4** with a custom `tailwind.css` entry via `@tailwindcss/vite`
- CSS animations defined in `src/index.css`: starfield particles, shooting stars, fade-in, float, ambient glow blobs
- `pixel-text` class for the retro title font (Press Start 2P from Google Fonts)
- Fluid base font-size via `clamp(14px, 1.4vw + 9px, 17px)` on `html`
- `touch-target` utility class ensures ≥44px touch targets for mobile

---

## Project Structure

```
src/
├── main.tsx                     Entry point
├── App.tsx                      Phase orchestrator + render helpers
├── index.css                    Tailwind + custom animations + fluid typography
├── i18n/                        Internationalization
│   ├── index.ts
│   └── locales/{ca,es,en}.json
├── components/                  Reusable UI
│   ├── GameLayout.tsx           Shell with stats bar + time + header (used by most screens)
│   ├── StatsBar.tsx             6 RPG stat bars with glow under fill
│   ├── DialogueBox.tsx          NPC dialogue with character image, choices, speaker name
│   ├── MapBackground.tsx        Leaflet map instance + location markers + player marker
│   ├── MapBottomSheet.tsx       Map chapter info footer (no location list)
│   ├── LocationHUD.tsx          Current location name overlay on map
│   ├── LocationImage.tsx        Cached photo loader with gradient fallback
│   ├── MomentLimite.tsx         Timed critical decisions UI
│   ├── LanguageSwitcher.tsx     CAT / ES / EN segmented toggle
│   └── minigames/
│       ├── MiniGameModal.tsx    Full-screen overlay wrapper for mini games
│       ├── ResultSummary.tsx    Win/lose result card shown after a mini game
│       ├── QuickQuiz.tsx        3-question contextual quiz, 8 s timer per question
│       └── TapChallenge.tsx     Stop-the-indicator timing game, 5 rounds
├── screens/                     One component per game phase
│   ├── TitleScreen.tsx          Animated title with starfield + start button
│   ├── CitySelectScreen.tsx     City card selector
│   ├── IntroScreen.tsx          Story intro with portrait ring
│   ├── HomeScreen.tsx           Apartment: shower, phones, notes, street view banner
│   ├── MapScreen.tsx            (handled by MapBackground + MapBottomSheet in App.tsx)
│   ├── LocationScreen.tsx       Arrival at destination with hero image
│   ├── DialogueScreen.tsx       Dialogue engine wrapper
│   ├── ActivityPickerScreen.tsx Activity cards + stat effect badges + hour bar
│   └── RecapScreen.tsx          Journey stats + chapter summary
├── store/
│   ├── types.ts                 All TypeScript interfaces (GameState, Stats, StoryChapter, etc.)
│   └── gameStore.ts             Zustand store: state + actions + resetGame()
├── data/
│   ├── cities/barcelona.ts      20+ real Barcelona locations with coordinates + translations
│   ├── story/el-alquimista.ts   7 chapters: prologue + 5 chapters + epilogue, dialogue trees
│   └── locationActivities.ts    Side activities per location type (quick_quiz / tap_challenge)
└── engine/
    ├── storyEngine.ts           Pure functions: chapter progression, auto-advance, criteria checking
    ├── timeEngine.ts            Calendar/clock: formatTime, day-of-week, time labels
    └── economyEngine.ts         Money system: rent, salary, activity costs, stat effects
public/
├── locations/                   20 location photos (Wikimedia Commons, {id}.jpg)
├── characters/                  6 pixel-art character sprites (protagonist, melquisedec, merce, englishman, alchemist, narrator)
cypress/
└── e2e/
    └── game-flow.cy.ts          12 e2e tests: screen rendering, chapter progression, stats persistence
```

---

## Testing

12 Cypress e2e tests in `cypress/e2e/game-flow.cy.ts` run against the dev server:

1. Renders title screen with a Start button
2. Goes from title → city select → intro → home
3. Goes from home to map
4. Shows chapter info on the map bottom sheet
5. Character images render in dialogue
6. Dialogue option buttons work
7. ch2-sandbox auto-advances when Boqueria visited
8. ch4-sandbox auto-advances after all 3 locations visited
9. Partial visits do NOT trigger auto-advance
10. Sandbox without completionCriteria stays on same chapter
11. Recap advances chapter for story chapters
12. Window exposes game store with all state fields

Tests use `window.__GAME_STORE` to inject state directly, avoiding fragile UI navigation chains.

---

## Game Flow (Detailed)

```
TITLE → "Start Game" → resetGame()
  → CITY SELECT → pick Barcelona
    → INTRO → narrator text → "Continue"
      → HOME (apartment)
        → "Go Outside" → MAP
          → Click map marker
            → LOCATION (arrive)
              → "Investigate →" (required) or "Explore" (optional)
                → DIALOGUE (if required location)
                  → branching choices, character sprites
                    → RECAP (story chapters: stats + next)
                      → next chapter...
                    → or auto-advance (sandbox: check completion criteria)
          → click a non-required location → "Explore the area"
```

- **Stats**: Vitality, Resources, Knowledge, Social, Career, Fulfillment (each 0-100)
- **Time**: Real calendar, activities consume hours, rent due monthly
- **Money**: Earn by working (activity_picker), spend on life
- **Completed chapters** tracked in `completedChapterIds[]` — prevents re-advancement

---

## Roadmap (V1 → VN)

| Phase | Scope |
|---|---|
| **V1 (current)** | Barcelona + The Alchemist. MVP: single city, single story. |
| **V2** | More cities (Madrid, Valencia, Buenos Aires). More location types cached from OSM. |
| **V3** | Second book archetype (The Da Vinci Code, Normal People, etc.). |
| **VN** | Player-selectable city + book. Full generative narrative via LLM. |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Language | TypeScript (strict) |
| Framework | React 19 |
| Build | Vite 8 |
| Map | Leaflet + OpenStreetMap tiles |
| State | Zustand 5 |
| Styles | Tailwind CSS 4 + CSS custom animations |
| i18n | react-i18next + i18next |
| E2E | Cypress |
| Sprites | PNG pixel art (preloaded) |
| Location photos | Wikimedia Commons (20/21 locations) |

---

## License

MIT — do what you want with it.