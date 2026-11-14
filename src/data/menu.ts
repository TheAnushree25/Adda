/**
 * Menus. Prices are in the site currency; an item may list several sizes.
 * Dietary tags drive the filter on the menu page.
 */

export type DietTag = 'vegetarian' | 'vegan' | 'gluten-free' | 'spicy' | 'nuts';

export const dietLabels: Record<DietTag, { label: string; short: string }> = {
  vegetarian: { label: 'Vegetarian', short: 'V' },
  vegan: { label: 'Vegan', short: 'VG' },
  'gluten-free': { label: 'Gluten-free', short: 'GF' },
  spicy: { label: 'Spicy', short: 'S' },
  nuts: { label: 'Contains nuts', short: 'N' },
};

export interface MenuItem {
  name: string;
  description: string;
  prices: { amount: number; label?: string }[];
  tags?: DietTag[];
  signature?: boolean;
}

export interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
}

export interface Menu {
  id: string;
  title: string;
  icon: 'plate' | 'croissant' | 'pizza' | 'glass' | 'cup' | 'sun';
  hours: string;
  intro: string;
  sections: MenuSection[];
}

const p = (amount: number, label?: string) => ({ amount, label });

export const menus: Menu[] = [
  {
    id: 'all-day',
    title: 'All day',
    icon: 'plate',
    hours: 'Every day · 11 am to 10 pm',
    intro: 'Market-driven plates for long lunches and lingering dinners.',
    sections: [
      {
        id: 'small-plates',
        title: 'Small plates',
        items: [
          {
            name: 'Crispy calamari',
            description: 'Lemon salt, charred lime and a smoky pepper aioli.',
            prices: [p(15)],
            signature: true,
          },
          {
            name: 'Whipped ricotta',
            description: 'Wildflower honey, cracked pepper, grilled sourdough.',
            prices: [p(13)],
            tags: ['vegetarian'],
          },
          {
            name: 'Burrata & figs',
            description: 'Roasted figs, prosciutto, basil oil and toasted focaccia.',
            prices: [p(22)],
          },
          {
            name: 'Spiced chickpea fritters',
            description: 'Tahini yoghurt, pickled onion, herb salad.',
            prices: [p(12)],
            tags: ['vegan', 'gluten-free'],
          },
          {
            name: 'Garlic prawns',
            description: 'Sizzling in chilli butter, served with bread to mop it up.',
            prices: [p(17)],
            tags: ['spicy'],
          },
          {
            name: 'Fries',
            description: 'Hand-cut, twice-fried, with house mayo.',
            prices: [p(7, 'Regular'), p(11, 'Large')],
            tags: ['vegetarian', 'gluten-free'],
          },
        ],
      },
      {
        id: 'salads',
        title: 'Salads & bowls',
        items: [
          {
            name: 'Market salad',
            description: 'Leaves from the farm stand, shaved vegetables, mustard vinaigrette.',
            prices: [p(12, 'Side'), p(18, 'Main')],
            tags: ['vegan', 'gluten-free'],
          },
          {
            name: 'Grilled chicken Caesar',
            description: 'Gem lettuce, parmesan, anchovy dressing, garlic crumbs.',
            prices: [p(21)],
          },
          {
            name: 'Golden grain bowl',
            description: 'Farro, roasted squash, feta, pomegranate, pistachio dukkah.',
            prices: [p(19)],
            tags: ['vegetarian', 'nuts'],
          },
        ],
      },
      {
        id: 'pizza',
        title: 'Wood-fired pizza',
        items: [
          {
            name: 'Margherita',
            description: 'San Marzano tomato, fior di latte, basil, olive oil.',
            prices: [p(17)],
            tags: ['vegetarian'],
            signature: true,
          },
          {
            name: 'Hot honey',
            description: 'Spicy salami, mozzarella, chilli honey, oregano.',
            prices: [p(21)],
            tags: ['spicy'],
          },
          {
            name: 'Bianca',
            description: 'Ricotta, mozzarella, roasted garlic, lemon zest, rocket.',
            prices: [p(19)],
            tags: ['vegetarian'],
          },
          {
            name: 'Wild mushroom',
            description: 'Taleggio, thyme, caramelised onion, truffle oil.',
            prices: [p(22)],
            tags: ['vegetarian'],
          },
        ],
      },
      {
        id: 'pasta',
        title: 'Fresh pasta',
        items: [
          {
            name: 'Cacio e pepe',
            description: 'Hand-rolled tonnarelli, pecorino, toasted black pepper.',
            prices: [p(19)],
            tags: ['vegetarian'],
          },
          {
            name: 'Slow-cooked ragù',
            description: 'Beef and pork ragù, pappardelle, parmesan.',
            prices: [p(24)],
            signature: true,
          },
          {
            name: 'Prawn linguine',
            description: 'Cherry tomatoes, chilli, garlic, white wine, parsley.',
            prices: [p(26)],
            tags: ['spicy'],
          },
        ],
      },
      {
        id: 'mains',
        title: 'Mains',
        items: [
          {
            name: 'Steak frites',
            description: 'Grilled hanger steak, peppercorn sauce, fries.',
            prices: [p(34)],
            tags: ['gluten-free'],
            signature: true,
          },
          {
            name: 'Catch of the day',
            description: 'Ask your server — always with seasonal vegetables.',
            prices: [p(31)],
            tags: ['gluten-free'],
          },
          {
            name: 'Half roast chicken',
            description: 'Lemon and thyme, crispy potatoes, jus.',
            prices: [p(27)],
            tags: ['gluten-free'],
          },
          {
            name: 'Mirabelle burger',
            description: 'Aged cheddar, onion jam, pickles, brioche bun, fries.',
            prices: [p(22)],
          },
        ],
      },
      {
        id: 'desserts',
        title: 'Desserts',
        items: [
          {
            name: 'Plum tarte fine',
            description: 'Mirabelle plums, almond cream, vanilla ice cream.',
            prices: [p(12)],
            tags: ['vegetarian', 'nuts'],
            signature: true,
          },
          {
            name: 'Chocolate cake',
            description: 'Dark chocolate, whipped cream, raspberries.',
            prices: [p(11)],
            tags: ['vegetarian'],
          },
          {
            name: 'Affogato',
            description: 'Vanilla gelato drowned in a double espresso.',
            prices: [p(8)],
            tags: ['vegetarian', 'gluten-free'],
          },
        ],
      },
    ],
  },
  {
    id: 'brunch',
    title: 'Breakfast & brunch',
    icon: 'croissant',
    hours: 'Weekdays 7 to 11 am · Weekends 8 am to 3 pm',
    intro: 'Butter, eggs and good coffee — the way every day should start.',
    sections: [
      {
        id: 'bakery',
        title: 'From the bakery',
        items: [
          {
            name: 'Butter croissant',
            description: 'Laminated in-house every morning.',
            prices: [p(4.5)],
            tags: ['vegetarian'],
          },
          {
            name: 'Almond croissant',
            description: 'Twice-baked, frangipane, toasted almonds.',
            prices: [p(5.5)],
            tags: ['vegetarian', 'nuts'],
          },
          {
            name: 'Toast & jam',
            description: 'Sourdough, cultured butter, seasonal jam.',
            prices: [p(6)],
            tags: ['vegetarian'],
          },
        ],
      },
      {
        id: 'plates',
        title: 'Morning plates',
        items: [
          {
            name: 'The full Mirabelle',
            description: 'Two eggs, bacon, sausage, beans, mushrooms, toast.',
            prices: [p(19)],
            signature: true,
          },
          {
            name: 'Shakshuka',
            description: 'Eggs baked in spiced tomato, feta, herbs, flatbread.',
            prices: [p(17)],
            tags: ['vegetarian', 'spicy'],
          },
          {
            name: 'Ricotta pancakes',
            description: 'Berries, maple syrup, whipped butter.',
            prices: [p(16)],
            tags: ['vegetarian'],
          },
          {
            name: 'Avocado toast',
            description: 'Sourdough, chilli, lime, seeds — add a poached egg.',
            prices: [p(14), p(16.5, 'With egg')],
            tags: ['vegan'],
          },
        ],
      },
    ],
  },
  {
    id: 'drinks',
    title: 'Coffee & drinks',
    icon: 'cup',
    hours: 'All day',
    intro: 'Coffee roasted down the road, natural wines and a bar that knows the classics.',
    sections: [
      {
        id: 'coffee',
        title: 'Coffee & tea',
        items: [
          { name: 'Espresso', description: 'Our seasonal house blend.', prices: [p(3)] },
          { name: 'Flat white', description: 'Double ristretto, silky milk.', prices: [p(4.75)] },
          {
            name: 'Iced oat latte',
            description: 'Oat milk, cold and creamy.',
            prices: [p(5.5)],
            tags: ['vegan'],
          },
          {
            name: 'Loose-leaf tea',
            description: 'Black, green or herbal — ask what is brewing.',
            prices: [p(4)],
            tags: ['vegan'],
          },
        ],
      },
      {
        id: 'cocktails',
        title: 'Cocktails',
        items: [
          {
            name: 'Mirabelle spritz',
            description: 'Plum liqueur, bitter orange, prosecco, soda.',
            prices: [p(13)],
            signature: true,
          },
          {
            name: 'Smoked old fashioned',
            description: 'Bourbon, demerara, orange bitters, cedar smoke.',
            prices: [p(15)],
          },
          { name: 'Garden gimlet', description: 'Gin, cucumber, basil, lime.', prices: [p(13)] },
          {
            name: 'Zero-proof sour',
            description: 'Seedlip, citrus, aquafaba, cinnamon.',
            prices: [p(9)],
            tags: ['vegan'],
          },
        ],
      },
      {
        id: 'wine',
        title: 'Wine by the glass',
        items: [
          {
            name: 'House white',
            description: 'Crisp, citrus, mineral.',
            prices: [p(10, '5 oz'), p(38, 'Bottle')],
          },
          {
            name: 'House red',
            description: 'Juicy, dark fruit, soft tannins.',
            prices: [p(10, '5 oz'), p(38, 'Bottle')],
          },
          {
            name: 'Orange of the week',
            description: 'Skin-contact, ask for this week’s pour.',
            prices: [p(12, '5 oz'), p(46, 'Bottle')],
          },
        ],
      },
    ],
  },
  {
    id: 'golden-hour',
    title: 'Golden Hour',
    icon: 'sun',
    hours: 'Every day · 4 to 7 pm',
    intro: 'Half-price snacks and our favourite pours while the sun goes down.',
    sections: [
      {
        id: 'golden-drinks',
        title: 'Drinks',
        items: [
          { name: 'Draught beer', description: 'Local lager or IPA.', prices: [p(5)] },
          { name: 'Spritz of the day', description: 'Ask your bartender.', prices: [p(8)] },
          { name: 'House wine', description: 'Red, white or rosé.', prices: [p(7, '5 oz')] },
        ],
      },
      {
        id: 'golden-snacks',
        title: 'Snacks',
        items: [
          {
            name: 'Marinated olives',
            description: 'Orange zest, fennel seed, chilli.',
            prices: [p(4)],
            tags: ['vegan', 'gluten-free'],
          },
          {
            name: 'Fries',
            description: 'With house mayo.',
            prices: [p(4)],
            tags: ['vegetarian', 'gluten-free'],
          },
          { name: 'Calamari', description: 'Lemon salt and aioli.', prices: [p(8)] },
        ],
      },
    ],
  },
];
