import type {
  StoryChapter,
  LocationPOI,
  LocationType,
  CompletionCriteria,
  GamePhase,
} from '../store/types';

function sortedLocations(locations: LocationPOI[]): LocationPOI[] {
  return [...locations].sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Resolves an ordered list of location type slots to specific LocationPOI instances.
 * Duplicate types are resolved to successive occurrences in stable alphanumeric ID order.
 * e.g. ['plaza', 'plaza'] → [firstPlaza, secondPlaza]
 */
export function resolveRequiredLocations(
  requiredLocationTypes: LocationType[],
  allLocations: LocationPOI[]
): LocationPOI[] {
  allLocations = sortedLocations(allLocations);
  const countByType = new Map<LocationType, number>();
  const result: LocationPOI[] = [];
  for (const type of requiredLocationTypes) {
    const idx = countByType.get(type) ?? 0;
    const match = allLocations.filter((l) => l.type === type)[idx];
    if (match) result.push(match);
    countByType.set(type, idx + 1);
  }
  return result;
}

/**
 * Returns the locations that the player can see/interact with for a given chapter.
 * Required locations are resolved to specific instances; locationsToShow adds all
 * locations of those types. Required instances are always included.
 */
export function getLocationsForChapter(
  chapter: StoryChapter,
  allLocations: LocationPOI[]
): LocationPOI[] {
  allLocations = sortedLocations(allLocations);
  const required = resolveRequiredLocations(chapter.requiredLocationTypes ?? [], allLocations);
  const showTypes = new Set<LocationType>(chapter.locationsToShow ?? []);
  const byType = allLocations.filter((l) => showTypes.has(l.type));

  const seen = new Set<string>();
  const result: LocationPOI[] = [];
  for (const loc of [...required, ...byType]) {
    if (!seen.has(loc.id)) {
      seen.add(loc.id);
      result.push(loc);
    }
  }
  return result.length > 0 ? result : allLocations;
}

/**
 * Checks whether a CompletionCriteria is satisfied.
 * Types in criteria are resolved to specific instances and checked by ID.
 */
export function isCriteriaMet(
  criteria: CompletionCriteria | undefined,
  visitedLocationIds: string[],
  allLocations: LocationPOI[]
): boolean {
  if (!criteria) return false;
  switch (criteria.kind) {
    case 'visit_location': {
      const resolved = resolveRequiredLocations([criteria.locationType], allLocations);
      return resolved.length > 0 && visitedLocationIds.includes(resolved[0].id);
    }
    case 'visit_all_locations': {
      const resolved = resolveRequiredLocations(criteria.locationTypes, allLocations);
      return resolved.every((l) => visitedLocationIds.includes(l.id));
    }
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
  allChapters: StoryChapter[],
  allLocations: LocationPOI[]
): { phase: GamePhase; newChapterIndex: number } | null {
  const chapter = allChapters[currentChapterIndex];
  if (!chapter) return null;
  if (completedChapterIds.includes(chapter.id)) return null;

  if (chapter.role === 'story') return null;

  if (!isCriteriaMet(chapter.completionCriteria, visitedLocationIds, allLocations)) return null;

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
  allChapters: StoryChapter[],
  allLocations: LocationPOI[]
): {
  phase: GamePhase;
  newChapterIndex?: number;
} {
  if (!chapter) return { phase: 'map' };

  if (chapter.role === 'story') {
    return { phase: 'recap' };
  }

  if (isCriteriaMet(chapter.completionCriteria, visitedLocationIds, allLocations)) {
    return advanceChapter(currentChapterIndex, allChapters);
  }

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
 * Checks if a specific location is one of the resolved required instances for the chapter.
 */
export function isCorrectLocation(
  chapter: StoryChapter | undefined,
  location: LocationPOI,
  allLocations: LocationPOI[]
): boolean {
  const required = resolveRequiredLocations(chapter?.requiredLocationTypes ?? [], allLocations);
  return required.some((l) => l.id === location.id);
}

export function getChapterTitle(chapter: StoryChapter): string {
  return chapter.title;
}
