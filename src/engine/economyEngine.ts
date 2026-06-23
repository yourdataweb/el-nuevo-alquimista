import type { Stats, DailyActivity } from '../store/types';

export const DAILY_ACTIVITIES: DailyActivity[] = [
  {
    id: 'work',
    title: 'Work',
    titleEs: 'Trabajar',
    titleCa: 'Treballar',
    durationHours: 8,
    effects: { resources: 40, career: 3, vitality: -5 },
    description: 'Full 8-hour workday at the office.',
    descriptionEs: 'Jornada completa de 8 horas en la oficina.',
    descriptionCa: 'Jornada completa de 8 hores a l\'oficina.',
  },
  {
    id: 'half-work',
    title: 'Half Day Work',
    titleEs: 'Media Jornada',
    titleCa: 'Mitja Jornada',
    durationHours: 4,
    effects: { resources: 20, career: 1 },
    description: 'Half a day at work. Leaves time for other things.',
    descriptionEs: 'Media jornada en el trabajo. Deja tiempo para otras cosas.',
    descriptionCa: 'Mitja jornada a la feina. Deixa temps per altres coses.',
  },
  {
    id: 'explore',
    title: 'Explore the City',
    titleEs: 'Explorar la Ciudad',
    titleCa: 'Explorar la Ciutat',
    durationHours: 4,
    effects: { knowledge: 3, fulfillment: 2, vitality: -3 },
    description: 'Wander through Barcelona. Discover new places.',
    descriptionEs: 'Pasear por Barcelona. Descubrir nuevos lugares.',
    descriptionCa: 'Passejar per Barcelona. Descobrir nous llocs.',
  },
  {
    id: 'read',
    title: 'Read / Study',
    titleEs: 'Leer / Estudiar',
    titleCa: 'Llegir / Estudiar',
    durationHours: 3,
    effects: { knowledge: 4, fulfillment: 1 },
    description: 'Hit the books. Knowledge is power.',
    descriptionEs: 'Darle a los libros. El conocimiento es poder.',
    descriptionCa: 'Donar als llibres. El coneixement és poder.',
  },
  {
    id: 'sport',
    title: 'Exercise',
    titleEs: 'Hacer Deporte',
    titleCa: 'Fer Esport',
    durationHours: 2,
    effects: { vitality: 5, resources: -5 },
    description: 'Work out. Stay fit.',
    descriptionEs: 'Entrenar. Mantenerse en forma.',
    descriptionCa: 'Entrenar. Mantenir-se en forma.',
  },
  {
    id: 'socialize',
    title: 'Hang Out with Friends',
    titleEs: 'Salir con Amigos',
    titleCa: 'Sortir amb Amics',
    durationHours: 3,
    effects: { social: 4, resources: -15, fulfillment: 2 },
    description: 'Coffee, drinks, laughs. Stay connected.',
    descriptionEs: 'Café, copas, risas. Mantener el contacto.',
    descriptionCa: 'Cafè, copes, riures. Mantenir el contacte.',
  },
  {
    id: 'meditate',
    title: 'Meditate / Reflect',
    titleEs: 'Meditar / Reflexionar',
    titleCa: 'Meditar / Reflexionar',
    durationHours: 1,
    effects: { fulfillment: 3, vitality: 2 },
    description: 'Sit quietly. Listen to yourself.',
    descriptionEs: 'Sentarse en silencio. Escucharse.',
    descriptionCa: 'Seure en silenci. Escoltar-se.',
  },
  {
    id: 'sleep',
    title: 'Sleep In',
    titleEs: 'Dormir Más',
    titleCa: 'Dormir Més',
    durationHours: 10,
    effects: { vitality: 8, resources: -5 },
    description: 'Extra sleep. Sometimes that is all you need.',
    descriptionEs: 'Dormir más. A veces es lo único que necesitas.',
    descriptionCa: 'Dormir més. De vegades és l\'únic que necessites.',
  },
];

export function getActivityByName(id: string): DailyActivity | undefined {
  return DAILY_ACTIVITIES.find((a) => a.id === id);
}

export function canAffordActivity(activity: DailyActivity, stats: Stats): boolean {
  const cost = Math.abs(activity.effects.resources ?? 0);
  return stats.resources >= cost;
}

export function calculateRent(): number {
  return 50;
}

export function calculateSalaryMultiplier(career: number): number {
  return 1 + career / 100;
}

export function calculateTransportCost(distanceKm: number): number {
  return Math.max(2, Math.round(distanceKm * 0.5));
}

export function getDayCount(stats: Stats): string {
  const total = stats.vitality + stats.resources + stats.knowledge + stats.social + stats.career + stats.fulfillment;
  if (total < 100) return 'struggling';
  if (total < 200) return 'getting by';
  if (total < 300) return 'finding your way';
  if (total < 400) return 'thriving';
  return 'flourishing';
}