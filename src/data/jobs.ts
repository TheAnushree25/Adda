export interface Job {
  title: string;
  type: string;
  summary: string;
  duties: string[];
}

export const jobs: Job[] = [
  {
    title: 'Server',
    type: 'Full-time · Part-time',
    summary: 'You read a table in two seconds and make every guest feel like a regular.',
    duties: [
      'Guide guests through the menu and wine list',
      'Keep service warm, quick and accurate',
      'Work closely with the bar and kitchen',
    ],
  },
  {
    title: 'Bartender',
    type: 'Evenings & weekends',
    summary: 'Classic cocktails, Golden Hour rushes and a bar that never feels rushed.',
    duties: [
      'Build and refine our cocktail list',
      'Run the bar during live nights',
      'Keep stock, prep and the bar top spotless',
    ],
  },
  {
    title: 'Floor Manager',
    type: 'Full-time',
    summary: 'The calm centre of a busy room — you lead the floor team shift by shift.',
    duties: [
      'Plan floor sections and breaks',
      'Look after private events on the night',
      'Coach new team members',
    ],
  },
  {
    title: 'Line Cook',
    type: 'Full-time',
    summary: 'Fast hands, clean station, and pride in every plate that leaves the pass.',
    duties: [
      'Run the grill or sauté station',
      'Prep to our recipes and standards',
      'Keep the line organised and safe',
    ],
  },
  {
    title: 'Pizzaiolo',
    type: 'Full-time',
    summary: 'Our wood-fired oven needs someone who loves dough as much as we do.',
    duties: [
      'Prepare and ferment dough daily',
      'Stretch, top and fire pizzas to order',
      'Manage the oven through service',
    ],
  },
  {
    title: 'Barista',
    type: 'Mornings',
    summary: 'First coffee of the day? Make it the best one.',
    duties: [
      'Dial in espresso every morning',
      'Craft milk drinks and pour-overs',
      'Keep the counter welcoming',
    ],
  },
  {
    title: 'Host',
    type: 'Part-time',
    summary: 'The first smile at the door and the conductor of the waiting list.',
    duties: ['Greet and seat guests', 'Manage reservations and walk-ins', 'Answer the phone with a smile'],
  },
  {
    title: 'Dishwasher',
    type: 'Full-time · Part-time',
    summary: 'The quiet hero of the kitchen — nothing works without you.',
    duties: [
      'Keep dishes, pots and glassware flowing',
      'Help with basic prep',
      'Keep the dish area clean and safe',
    ],
  },
];
