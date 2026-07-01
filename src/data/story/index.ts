import { theAlchemist } from './the-alchemist';
import type { BookArchetype } from '../../store/types';

const registry = new Map<string, BookArchetype>([
  ['the-alchemist', theAlchemist],
]);

export function getStoryById(id: string): BookArchetype {
  const story = registry.get(id);
  if (!story) throw new Error(`Unknown story: '${id}'`);
  return story;
}

export function getAllStories(): BookArchetype[] {
  return [...registry.values()];
}
