import type { BookArchetype, City, LocationType } from '../store/types';

export interface ValidationError {
  chapter: string;
  field: string;
  message: string;
}

export function validateStoryForCity(book: BookArchetype, city: City): ValidationError[] {
  const errors: ValidationError[] = [];

  // Pre-compute how many locations of each type the city has
  const cityTypeCount = new Map<LocationType, number>();
  for (const loc of city.locations) {
    cityTypeCount.set(loc.type, (cityTypeCount.get(loc.type) ?? 0) + 1);
  }

  for (const chapter of book.chapters) {
    const showSet = new Set<LocationType>(chapter.locationsToShow ?? []);
    const requiredTypes = chapter.requiredLocationTypes ?? [];

    // No overlap between locationsToShow and requiredLocationTypes
    for (const type of requiredTypes) {
      if (showSet.has(type)) {
        errors.push({
          chapter: chapter.id,
          field: 'locationsToShow / requiredLocationTypes',
          message: `'${type}' appears in both locationsToShow and requiredLocationTypes`,
        });
      }
    }

    // City must have at least one location for every shown type
    for (const type of showSet) {
      if (!cityTypeCount.has(type)) {
        errors.push({
          chapter: chapter.id,
          field: 'locationsToShow',
          message: `city '${city.id}' has no '${type}' location`,
        });
      }
    }

    // City must have enough locations to satisfy each required slot (duplicates count)
    const neededByType = new Map<LocationType, number>();
    for (const type of requiredTypes) {
      neededByType.set(type, (neededByType.get(type) ?? 0) + 1);
    }
    for (const [type, needed] of neededByType) {
      const available = cityTypeCount.get(type) ?? 0;
      if (available < needed) {
        errors.push({
          chapter: chapter.id,
          field: 'requiredLocationTypes',
          message: `city '${city.id}' needs ${needed} '${type}' location(s) but only has ${available}`,
        });
      }
    }

    // completionCriteria types must be a subset of requiredLocationTypes (same order/count)
    if (chapter.completionCriteria) {
      const { kind } = chapter.completionCriteria;
      const criteriaTypes: LocationType[] =
        kind === 'visit_location'
          ? [chapter.completionCriteria.locationType]
          : kind === 'visit_all_locations'
          ? chapter.completionCriteria.locationTypes
          : [];

      const requiredCount = new Map<LocationType, number>();
      for (const type of requiredTypes) {
        requiredCount.set(type, (requiredCount.get(type) ?? 0) + 1);
      }
      const criteriaCount = new Map<LocationType, number>();
      for (const type of criteriaTypes) {
        criteriaCount.set(type, (criteriaCount.get(type) ?? 0) + 1);
      }
      for (const [type, count] of criteriaCount) {
        if ((requiredCount.get(type) ?? 0) < count) {
          errors.push({
            chapter: chapter.id,
            field: 'completionCriteria',
            message: `'${type}' appears ${count}x in completionCriteria but only ${requiredCount.get(type) ?? 0}x in requiredLocationTypes`,
          });
        }
      }
    }
  }

  return errors;
}

export function assertStoryForCity(book: BookArchetype, city: City): void {
  const errors = validateStoryForCity(book, city);
  if (errors.length === 0) return;
  const lines = errors.map((e) => `  [${e.chapter}] ${e.field}: ${e.message}`).join('\n');
  console.error(`Story validation failed for '${book.id}' + '${city.id}':\n${lines}`);
}
