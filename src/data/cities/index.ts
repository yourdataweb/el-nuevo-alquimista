import { barcelona } from './barcelona';
import { newYork } from './new-york';
import { paris } from './paris';
import { seville } from './seville';
import type { City, LocationPOI } from '../../store/types';

const registry = new Map<string, City>([
  ['barcelona', barcelona],
  ['new-york', newYork],
  ['paris', paris],
  ['seville', seville],
]);

export function getCityById(id: string): City {
  const city = registry.get(id);
  if (!city) throw new Error(`Unknown city: '${id}'`);
  return city;
}

export function getAllCities(): City[] {
  return [...registry.values()];
}

export function getHomeLocation(city: City): LocationPOI {
  const home = city.locations.find((l) => l.type === 'home');
  if (!home) throw new Error(`City '${city.id}' has no home location`);
  return home;
}

export function getHomeLocationId(city: City): string {
  return getHomeLocation(city).id;
}

export function getLocationById(city: City, id: string): LocationPOI | undefined {
  return city.locations.find((l) => l.id === id);
}
