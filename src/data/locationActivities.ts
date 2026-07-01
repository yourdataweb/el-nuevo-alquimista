import type { Stats } from '../store/types';

export type MiniGameKind = 'quick_quiz' | 'tap_challenge' | 'pickpocket' | 'brawl' | 'chase' | 'lockpick' | 'photograph';

export interface QuizQuestion {
  q: string;
  options: string[];
  correct: number;
}

export interface ActivityDef {
  id: string;
  i18nKey: string;
  miniGame: MiniGameKind;
  durationHours: number;
  effects: Partial<Stats>;
  fluff: string;
  quizData?: QuizQuestion[];
}

const ACTIVITIES: Record<string, ActivityDef[]> = {
  library: [
    {
      id: 'library_read',
      i18nKey: 'libraryRead',
      miniGame: 'quick_quiz',
      durationHours: 1.5,
      effects: { knowledge: 5 },
      fluff: 'Decipher old manuscripts and unlock hidden knowledge.',
      quizData: [
        {
          q: 'A manuscript uses the symbol ☿. In alchemy this represents:',
          options: ['Gold', 'Mercury', 'Salt', 'Silver'],
          correct: 1,
        },
        {
          q: 'You find two versions of the same text — one from 1670 and one from 1890. Which is the more reliable primary source?',
          options: ['The 1890 copy', 'The 1670 original', 'Neither — they are equal', 'A modern translation'],
          correct: 1,
        },
        {
          q: '"Prima Materia" in alchemical texts refers to:',
          options: ['A Roman philosopher', 'The base substance of all matter', 'A sacred city', 'The first chapter of a scroll'],
          correct: 1,
        },
        {
          q: 'The term "as above, so below" originates from:',
          options: ['The Bible', 'The Emerald Tablet', 'Plato\'s Republic', 'Aristotle\'s Metaphysics'],
          correct: 1,
        },
        {
          q: 'The ouroboros — a serpent eating its own tail — symbolises:',
          options: ['Destruction and chaos', 'Eternal renewal and cyclicality', 'Poison and danger', 'The solar system'],
          correct: 1,
        },
        {
          q: 'An illuminated manuscript is distinguished by:',
          options: ['Movable type printing', 'Decorative gold leaf and hand-painted images', 'Being written in Latin only', 'Its pocket-sized format'],
          correct: 1,
        },
        {
          q: 'In alchemical tradition, the four classical elements are:',
          options: ['Earth, wind, fire, lightning', 'Earth, water, fire, air', 'Stone, water, flame, sky', 'Sulphur, mercury, salt, earth'],
          correct: 1,
        },
      ],
    },
    {
      id: 'library_research',
      i18nKey: 'libraryResearch',
      miniGame: 'quick_quiz',
      durationHours: 2,
      effects: { knowledge: 3, career: 2 },
      fluff: 'Navigate the catalogue and find rare sources before closing time.',
      quizData: [
        {
          q: 'You need a reliable academic source. Which do you choose?',
          options: ['An anonymous blog post', 'A peer-reviewed journal', 'A social media thread', 'A magazine summary'],
          correct: 1,
        },
        {
          q: 'In the Dewey Decimal System, philosophy books are in the:',
          options: ['000s', '100s', '300s', '500s'],
          correct: 1,
        },
        {
          q: 'You have 2 hours and 8 books. Best strategy?',
          options: ['Read every page of each', 'Read only the first chapter', 'Scan indices and key chapters', 'Pick one and read fully'],
          correct: 2,
        },
        {
          q: 'A bibliography lists sources:',
          options: ['In order of importance', 'At the end of a text to credit them', 'Only from the last decade', 'Only books, never articles'],
          correct: 1,
        },
        {
          q: '"Ibid." in an academic footnote means:',
          options: ['See also', 'The same source as immediately above', 'In comparison', 'Author unknown'],
          correct: 1,
        },
        {
          q: 'The best way to evaluate a source\'s credibility is to check:',
          options: ['Its page count', 'Author credentials and peer-review status', 'How many people liked it online', 'Whether it confirms your hypothesis'],
          correct: 1,
        },
        {
          q: 'A primary source is:',
          options: ['A textbook summarising a topic', 'An original document or first-hand account', 'A Wikipedia article', 'A documentary film'],
          correct: 1,
        },
      ],
    },
  ],

  park: [
    {
      id: 'park_exercise',
      i18nKey: 'parkExercise',
      miniGame: 'chase',
      durationHours: 1,
      effects: { vitality: 5 },
      fluff: 'Dodge joggers, pigeons and tourists on a full-tilt parkour sprint.',
    },
    {
      id: 'park_meditate',
      i18nKey: 'parkMeditate',
      miniGame: 'quick_quiz',
      durationHours: 1,
      effects: { fulfillment: 4 },
      fluff: 'Sit still and let the city fade around you.',
      quizData: [
        {
          q: 'Your mind drifts to tomorrow\'s worries. The correct response is:',
          options: ['Force yourself to stop thinking', 'Gently bring attention back to your breath', 'Open your eyes and give up', 'Think about the worry until it goes away'],
          correct: 1,
        },
        {
          q: 'Box breathing follows which pattern?',
          options: ['Inhale 4 — hold 4 — exhale 4 — hold 4', 'Inhale 8 — exhale 8', 'Inhale 2 — exhale 10', 'Inhale 1 — hold 5 — exhale 1'],
          correct: 0,
        },
        {
          q: 'A pigeon lands a metre away. You:',
          options: ['Chase it off', 'Watch it calmly without moving', 'Check your phone', 'Start over'],
          correct: 1,
        },
        {
          q: 'In mindfulness practice, thoughts are best treated as:',
          options: ['Problems to solve immediately', 'Clouds passing through — observed, not grasped', 'Enemies to be suppressed', 'Signs that you are failing'],
          correct: 1,
        },
        {
          q: 'The body scan technique involves:',
          options: ['Checking your phone for notifications', 'Slowly directing attention through each part of the body', 'Measuring your heart rate', 'Exercising each muscle group in sequence'],
          correct: 1,
        },
        {
          q: 'Regular meditation is most consistently shown to reduce:',
          options: ['Intelligence', 'Cortisol (stress hormone) levels', 'Long-term memory', 'Physical strength'],
          correct: 1,
        },
        {
          q: 'The "default mode network" is most active when you are:',
          options: ['Solving a maths problem', 'Mind-wandering or daydreaming', 'Running at full speed', 'Listening carefully to music'],
          correct: 1,
        },
      ],
    },
  ],

  cafe: [
    {
      id: 'cafe_discussion',
      i18nKey: 'cafeDiscussion',
      miniGame: 'brawl',
      durationHours: 1,
      effects: { social: 4 },
      fluff: 'A heated debate turns physical — parry the blows to earn respect.',
    },
    {
      id: 'cafe_write',
      i18nKey: 'cafeWrite',
      miniGame: 'quick_quiz',
      durationHours: 2,
      effects: { career: 3, knowledge: 2 },
      fluff: 'Capture your thoughts between sips of coffee.',
      quizData: [
        {
          q: 'You want to write something meaningful. Best first step:',
          options: ['Edit as you go', 'Write freely without judging', 'Wait for perfect conditions', 'Plan every sentence first'],
          correct: 1,
        },
        {
          q: 'Writer\'s block hits mid-sentence. You:',
          options: ['Delete everything and start over', 'Take a short walk to reset', 'Force every word until it\'s done', 'Give up for the day'],
          correct: 1,
        },
        {
          q: 'You want readers to feel the atmosphere of a Barcelona morning. Best technique:',
          options: ['List the facts clearly', 'Use specific sensory details', 'Keep it abstract', 'Quote a famous author'],
          correct: 1,
        },
        {
          q: 'Hemingway\'s "iceberg theory" argues that:',
          options: ['Stories should be cold and detached', 'Most meaning should lie beneath the surface, implied', 'All sentences must be short', 'Stories must begin in winter'],
          correct: 1,
        },
        {
          q: 'Which sentence "shows" rather than "tells"?',
          options: ['"She was nervous."', '"Her hands wouldn\'t stop shaking."', '"She felt bad."', '"It was a hard moment."'],
          correct: 1,
        },
        {
          q: '"In medias res" means starting a story:',
          options: ['With a prologue', 'In the middle of the action', 'In chronological order', 'With a flashback'],
          correct: 1,
        },
        {
          q: 'The most important quality of a compelling opening sentence is:',
          options: ['Containing the main character\'s name', 'Creating a question the reader wants answered', 'Being shorter than 10 words', 'Using elevated vocabulary'],
          correct: 1,
        },
      ],
    },
  ],

  market: [
    {
      id: 'market_haggle',
      i18nKey: 'marketHaggle',
      miniGame: 'pickpocket',
      durationHours: 1,
      effects: { resources: 5, social: 2 },
      fluff: 'The crowd is thick — snatch the deal before the vendor turns around.',
    },
    {
      id: 'market_taste',
      i18nKey: 'marketTaste',
      miniGame: 'quick_quiz',
      durationHours: 0.5,
      effects: { vitality: 3, resources: 2 },
      fluff: 'Identify what you taste before the vendor reveals the price.',
      quizData: [
        {
          q: 'A fruit is tart, tropical, and slightly floral. It is most likely:',
          options: ['Apple', 'Passion fruit (maracuyá)', 'Pear', 'Lemon'],
          correct: 1,
        },
        {
          q: 'A spice smells earthy, warm, and slightly bitter. It is probably:',
          options: ['Cinnamon', 'Cumin', 'Sugar', 'Vanilla'],
          correct: 1,
        },
        {
          q: 'The vendor says the jamón has "Denominación de Origen". This means:',
          options: ['It\'s frozen', 'It comes from a certified region', 'It\'s on discount', 'It\'s synthetic'],
          correct: 1,
        },
        {
          q: 'Umami is best described as:',
          options: ['Sour and sharp', 'Savoury and meaty depth', 'Sweet and floral', 'Bitter and dry'],
          correct: 1,
        },
        {
          q: 'The five basic tastes are:',
          options: ['Sweet, sour, salty, spicy, umami', 'Sweet, sour, salty, bitter, umami', 'Sweet, salty, bitter, tangy, spicy', 'Sweet, sour, salty, bitter, smoky'],
          correct: 1,
        },
        {
          q: 'At La Boqueria, a "flauta" is:',
          options: ['A flute player', 'A long thin sandwich', 'A type of cured fish', 'A fried pastry'],
          correct: 1,
        },
        {
          q: 'Saffron is so expensive because:',
          options: ['It only grows in Antarctica', 'Each flower yields only three hand-picked stigmas', 'It takes 10 years to harvest', 'It is artificially coloured'],
          correct: 1,
        },
      ],
    },
  ],

  plaza: [
    {
      id: 'plaza_street',
      i18nKey: 'plazaStreet',
      miniGame: 'pickpocket',
      durationHours: 1,
      effects: { social: 3, resources: 3 },
      fluff: 'Las Ramblas is famous for it — work the crowd while they watch the show.',
    },
    {
      id: 'plaza_people',
      i18nKey: 'plazaPeople',
      miniGame: 'quick_quiz',
      durationHours: 1,
      effects: { social: 2, knowledge: 2 },
      fluff: 'Read the crowd — every face tells a story.',
      quizData: [
        {
          q: 'A man checks his watch every 30 seconds. He is most likely:',
          options: ['Bored', 'Waiting for someone', 'A watchmaker', 'Lost'],
          correct: 1,
        },
        {
          q: 'Two people greet with two cheek kisses. This is a common custom in:',
          options: ['Japan', 'Catalonia', 'England', 'Germany'],
          correct: 1,
        },
        {
          q: 'A child drops an ice cream and laughs. An observer learns:',
          options: ['Nothing useful', 'Something about their resilience', 'The price of ice cream', 'The flavour preference'],
          correct: 1,
        },
        {
          q: 'Mirroring someone\'s posture subconsciously usually signals:',
          options: ['Disagreement', 'Rapport and connection', 'Boredom', 'Deception'],
          correct: 1,
        },
        {
          q: 'The "mere exposure effect" means people tend to prefer:',
          options: ['New and unfamiliar things', 'Things they have encountered more frequently', 'Expensive items', 'Rare objects'],
          correct: 1,
        },
        {
          q: 'A group of strangers forms an orderly queue without being asked. This illustrates:',
          options: ['Fear of authority', 'Social norms and implicit coordination', 'Mob mentality', 'Pure coincidence'],
          correct: 1,
        },
        {
          q: 'Eye contact held for too long in conversation typically signals:',
          options: ['Friendship', 'Dominance or aggression', 'Shyness', 'Agreement'],
          correct: 1,
        },
      ],
    },
  ],

  church: [
    {
      id: 'church_contemplate',
      i18nKey: 'churchContemplate',
      miniGame: 'quick_quiz',
      durationHours: 1,
      effects: { fulfillment: 5 },
      fluff: 'Find peace in the silence of stone arches.',
      quizData: [
        {
          q: 'Sitting still in silence, your heart rate slows. This physiological state is called:',
          options: ['Hyperventilation', 'The relaxation response', 'An anxiety spike', 'Sympathetic arousal'],
          correct: 1,
        },
        {
          q: 'Stained glass windows in Gothic churches were originally intended to:',
          options: ['Let in maximum light', 'Tell Bible stories to the illiterate', 'Display patron wealth', 'Cool the interior'],
          correct: 1,
        },
        {
          q: 'The Greek term "ataraxia" means:',
          options: ['Grief', 'Restless ambition', 'Tranquil peace of mind', 'Intense joy'],
          correct: 2,
        },
        {
          q: 'The Latin phrase "memento mori" translates to:',
          options: ['"Remember to love"', '"Remember you will die"', '"Forget your worries"', '"In memory of"'],
          correct: 1,
        },
        {
          q: 'In Buddhist thought, the root cause of suffering is:',
          options: ['Poverty', 'Attachment and craving', 'Ignorance of science', 'Physical pain alone'],
          correct: 1,
        },
        {
          q: 'The Stoic practice of "negative visualisation" involves:',
          options: ['Imagining the worst to appreciate what you have', 'Avoiding all negative thoughts', 'Writing down daily failures', 'Meditating in darkness'],
          correct: 0,
        },
        {
          q: 'Pascal wrote: "All of humanity\'s problems stem from man\'s inability to sit quietly in a room alone." He was arguing for the value of:',
          options: ['Social isolation', 'Stillness and self-reflection', 'Religious devotion', 'Hard physical labour'],
          correct: 1,
        },
      ],
    },
    {
      id: 'church_inspect',
      i18nKey: 'churchInspect',
      miniGame: 'quick_quiz',
      durationHours: 1.5,
      effects: { knowledge: 4 },
      fluff: 'Decipher the symbols carved into stone and glass.',
      quizData: [
        {
          q: 'Two fish swimming in a circle is the symbol of:',
          options: ['Cancer', 'Pisces', 'Aquarius', 'Gemini'],
          correct: 1,
        },
        {
          q: 'Christian churches typically face east because:',
          options: ['Better morning light', 'Toward Jerusalem', 'Away from prevailing winds', 'It is a tradition with no symbolic meaning'],
          correct: 1,
        },
        {
          q: 'Flying buttresses on Gothic cathedrals primarily serve to:',
          options: ['Add decoration', 'Transfer roof thrust outward to external piers', 'Support bell towers', 'Frame stained glass'],
          correct: 1,
        },
        {
          q: 'The mandorla (almond-shaped halo) in Christian art typically surrounds:',
          options: ['Angels', 'Christ or the Virgin Mary in scenes of glory', 'Saints holding swords', 'The Holy Spirit as a dove'],
          correct: 1,
        },
        {
          q: 'Gargoyles on medieval churches served a dual purpose: decoration and:',
          options: ['Ringing bells', 'Channelling rainwater away from the walls', 'Providing nesting for doves', 'Marking compass directions'],
          correct: 1,
        },
        {
          q: 'Romanesque architecture (pre-Gothic) is characterised by:',
          options: ['Pointed arches and flying buttresses', 'Thick walls, small windows, and rounded arches', 'Steel frames and glass facades', 'Minarets and large domes'],
          correct: 1,
        },
        {
          q: 'The ichthys (fish symbol) was used by early Christians as:',
          options: ['A decorative motif', 'A secret sign of recognition under persecution', 'A symbol of baptism only', 'An emblem of the clergy'],
          correct: 1,
        },
      ],
    },
  ],

  theatre: [
    {
      id: 'theatre_watch',
      i18nKey: 'theatreWatch',
      miniGame: 'quick_quiz',
      durationHours: 2,
      effects: { fulfillment: 3, knowledge: 2 },
      fluff: 'Follow the performance and notice what the director chose.',
      quizData: [
        {
          q: 'A character speaks alone on stage revealing their thoughts. This technique is called a:',
          options: ['Deus ex machina', 'Soliloquy', 'Aside', 'Prologue'],
          correct: 1,
        },
        {
          q: 'The stage lighting turns red during a confrontation. This conventionally represents:',
          options: ['Sunrise', 'Peace', 'Danger or passion', 'A lighting error'],
          correct: 2,
        },
        {
          q: 'The play ends without resolving the main conflict. This type of ending is called:',
          options: ['Dénouement', 'Open ending', 'Climax', 'Catharsis'],
          correct: 1,
        },
        {
          q: '"Catharsis", as Aristotle used it in the context of theatre, refers to:',
          options: ['A plot twist', 'Emotional purging felt by the audience', 'The final act of a play', 'The villain\'s downfall'],
          correct: 1,
        },
        {
          q: 'Breaking the "fourth wall" means:',
          options: ['Destroying the set', 'A character directly addressing the audience', 'The climax of the performance', 'A scene change with blackout'],
          correct: 1,
        },
        {
          q: '"Chekhov\'s gun" is a principle that states:',
          options: ['Every play needs a weapon', 'Every introduced element must eventually be used', 'Endings should always surprise', 'Russian drama is superior'],
          correct: 1,
        },
        {
          q: 'A "deus ex machina" ending is criticised because:',
          options: ['It is too slow', 'It resolves conflict artificially, without earning the solution', 'It requires expensive stage machinery', 'It is too violent'],
          correct: 1,
        },
      ],
    },
  ],

  office: [
    {
      id: 'office_network',
      i18nKey: 'officeNetwork',
      miniGame: 'brawl',
      durationHours: 1,
      effects: { career: 3, social: 2 },
      fluff: 'The pitch competition gets aggressive — block every objection they throw at you.',
    },
    {
      id: 'office_upskill',
      i18nKey: 'officeUpskill',
      miniGame: 'quick_quiz',
      durationHours: 2,
      effects: { career: 4, knowledge: 2 },
      fluff: 'Crash an online course during your lunch break.',
      quizData: [
        {
          q: 'The most effective way to retain a new skill is:',
          options: ['Read about it once carefully', 'Watch a video twice', 'Practice it immediately after learning', 'Explain it to someone later'],
          correct: 2,
        },
        {
          q: 'You finish a module but don\'t understand it. You:',
          options: ['Move on and hope it sticks', 'Review it and try a different explanation', 'Skip the whole skill', 'Mark it as complete anyway'],
          correct: 1,
        },
        {
          q: 'You have 2 hours to learn a new tool from scratch. Best approach:',
          options: ['Read all the documentation first', 'Follow a structured tutorial', 'Experiment randomly', 'Ask a colleague to do it'],
          correct: 1,
        },
        {
          q: 'The "Pomodoro Technique" involves working in focused blocks of:',
          options: ['10 minutes', '25 minutes with short breaks', '1 uninterrupted hour', '45-minute cycles'],
          correct: 1,
        },
        {
          q: 'Spaced repetition is effective because:',
          options: ['It reduces study to a single session', 'Revisiting material at increasing intervals strengthens long-term memory', 'It works best for physical skills only', 'It requires no active recall'],
          correct: 1,
        },
        {
          q: 'The best way to verify you have truly learned something is:',
          options: ['Feeling confident about it', 'Being able to teach or explain it to someone else', 'Finishing all the course material', 'Passing a multiple-choice test'],
          correct: 1,
        },
        {
          q: 'Deliberate practice differs from regular practice in that it:',
          options: ['Takes longer', 'Focuses on specific weaknesses with immediate feedback', 'Is more enjoyable', 'Requires a coach at all times'],
          correct: 1,
        },
      ],
    },
  ],

  monument: [
    {
      id: 'monument_photo',
      i18nKey: 'monumentPhoto',
      miniGame: 'photograph',
      durationHours: 1,
      effects: { fulfillment: 3, knowledge: 2 },
      fluff: 'The light is perfect right now — wait for the right moment and capture the shot.',
    },
    {
      id: 'monument_study',
      i18nKey: 'monumentStudy',
      miniGame: 'quick_quiz',
      durationHours: 1.5,
      effects: { knowledge: 4 },
      fluff: 'Read the history carved into every stone.',
      quizData: [
        {
          q: 'La Sagrada Família was designed by:',
          options: ['Le Corbusier', 'Antoni Gaudí', 'Picasso', 'Santiago Calatrava'],
          correct: 1,
        },
        {
          q: 'The Arc de Triomf in Barcelona was built for:',
          options: ['A Napoleonic victory', 'The 1888 Universal Exhibition', 'The 1992 Olympics', 'King Felipe II'],
          correct: 1,
        },
        {
          q: 'Gothic architecture is most recognisable by its:',
          options: ['Flat concrete roofs', 'Pointed arches and ribbed vaults', 'Round domes and columns', 'Minimalist steel facades'],
          correct: 1,
        },
        {
          q: 'The Palau de la Música Catalana was designed by:',
          options: ['Antoni Gaudí', 'Lluís Domènech i Montaner', 'Josep Puig i Cadafalch', 'Santiago Calatrava'],
          correct: 1,
        },
        {
          q: 'Catalan Modernisme (Art Nouveau) flourished primarily during:',
          options: ['1750–1800', '1880–1920', '1940–1960', '1960–1990'],
          correct: 1,
        },
        {
          q: 'The 1992 Barcelona Olympics most transformed which district?',
          options: ['El Born', 'Gràcia', 'Barceloneta and Poblenou', 'Les Corts'],
          correct: 2,
        },
        {
          q: 'The Eixample grid\'s distinctive chamfered corners were designed by:',
          options: ['Antoni Gaudí', 'Ildefons Cerdà', 'Enric Sagnier', 'Josep Fontserè'],
          correct: 1,
        },
      ],
    },
  ],
};

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
        miniGame: 'quick_quiz',
        durationHours: 1,
        effects: { knowledge: 2 },
        fluff: 'Explore the area and discover something new.',
      },
    ];
  }
}

export function getActivitiesForType(type: string): ActivityDef[] {
  return ACTIVITIES[type] ?? ACTIVITIES.plaza;
}

export default ACTIVITIES;
