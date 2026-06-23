import type {
  StoryChapter,
  LocationPOI,
  CompletionCriteria,
  GamePhase,
} from '../store/types';

/**
 * Returns the locations that the player can see/interact with for a given chapter.
 */
export function getLocationsForChapter(
  chapter: StoryChapter,
  allLocations: LocationPOI[]
): LocationPOI[] {
  if (chapter.locationsToShow && chapter.locationsToShow.length > 0) {
    return chapter.locationsToShow
      .map((id) => allLocations.find((l) => l.id === id))
      .filter((l): l is LocationPOI => l !== undefined);
  }
  return allLocations;
}

/**
 * Checks whether a CompletionCriteria is satisfied by the player's current state.
 */
export function isCriteriaMet(
  criteria: CompletionCriteria | undefined,
  visitedLocationIds: string[]
): boolean {
  if (!criteria) return false;
  switch (criteria.kind) {
    case 'visit_location':
      return visitedLocationIds.includes(criteria.locationId);
    case 'visit_all_locations':
      return criteria.locationIds.every((id) => visitedLocationIds.includes(id));
    case 'none':
      return false;
    default:
      return false;
  }
}

/**
 * Given the current chapter index, checks whether the chapter's completion criteria
 * is met and returns the advance result if so. Returns null if not ready yet.
 */
export function checkAutoAdvance(
  currentChapterIndex: number,
  visitedLocationIds: string[],
  completedChapterIds: string[],
  allChapters: StoryChapter[]
): { phase: GamePhase; newChapterIndex: number } | null {
  const chapter = allChapters[currentChapterIndex];
  if (!chapter) return null;
  if (completedChapterIds.includes(chapter.id)) return null;

  // Story chapters advance via recap flow, not auto-check
  if (chapter.role === 'story') return null;

  // Sandbox chapters: check completion criteria
  if (!isCriteriaMet(chapter.completionCriteria, visitedLocationIds)) return null;

  return advanceChapter(currentChapterIndex, allChapters);
}

/**
 * Determines what happens after a dialogue completes.
 * Story chapters → recap.
 * Sandbox chapters → checks completion, advances if done, else back to map.
 */
export function handleDialogueComplete(
  chapter: StoryChapter | undefined,
  currentChapterIndex: number,
  visitedLocationIds: string[],
  allChapters: StoryChapter[]
): {
  phase: GamePhase;
  newChapterIndex?: number;
} {
  if (!chapter) return { phase: 'map' };

  if (chapter.role === 'story') {
    return { phase: 'recap' };
  }

  // Sandbox: check if chapter is now complete
  if (isCriteriaMet(chapter.completionCriteria, visitedLocationIds)) {
    return advanceChapter(currentChapterIndex, allChapters);
  }

  // Not complete yet — back to map
  return { phase: 'map' };
}

/**
 * Handles the recap → next transition.
 */
export function handleRecapNext(
  currentChapterIndex: number,
  allChapters: StoryChapter[]
): {
  phase: GamePhase;
  newChapterIndex: number;
} {
  return advanceChapter(currentChapterIndex, allChapters);
}

/**
 * Advances to the next chapter index and returns the new phase.
 * If it's the last chapter, goes to epilogue.
 */
function advanceChapter(
  currentChapterIndex: number,
  allChapters: StoryChapter[]
): { phase: GamePhase; newChapterIndex: number } {
  const isLast = currentChapterIndex >= allChapters.length - 1;
  if (isLast) {
    return { phase: 'epilogue', newChapterIndex: currentChapterIndex };
  }

  const nextIndex = currentChapterIndex + 1;
  const nextCh = allChapters[nextIndex];
  const phase: GamePhase =
    nextCh?.role === 'sandbox' ? 'activity_picker' : 'home';

  return { phase, newChapterIndex: nextIndex };
}

/**
 * Checks if a location is the "required" story-trigger location for a chapter.
 */
export function isCorrectLocation(
  chapter: StoryChapter | undefined,
  locationId: string
): boolean {
  const ids = chapter?.requiredLocationIds;
  if (!ids || ids.length === 0) return false;
  return ids.includes(locationId);
}

/**
 * Returns the title of a chapter.
 */
export function getChapterTitle(chapter: StoryChapter): string {
  return chapter.title;
}
