// Seed dataset lifted verbatim from the design handoff prototype
// (Mxologist.dc.html). Frontend-only mock data — no API wiring.

export type Flavor =
  | "boozy"
  | "bitter"
  | "sour"
  | "sweet"
  | "refreshing"
  | "herbal";

export const FLAVORS: Flavor[] = [
  "boozy",
  "bitter",
  "sour",
  "sweet",
  "refreshing",
  "herbal",
];

export type Category =
  | "Spirits"
  | "Liqueurs"
  | "Mixers"
  | "Citrus & Fresh"
  | "Pantry";

export const CAT_ORDER: Category[] = [
  "Spirits",
  "Liqueurs",
  "Mixers",
  "Citrus & Fresh",
  "Pantry",
];

export type CatalogItem = { name: string; cat: Category };

export const CATALOG: CatalogItem[] = [
  { name: "Bourbon", cat: "Spirits" },
  { name: "Gin", cat: "Spirits" },
  { name: "Vodka", cat: "Spirits" },
  { name: "White Rum", cat: "Spirits" },
  { name: "Tequila", cat: "Spirits" },
  { name: "Rye Whiskey", cat: "Spirits" },
  { name: "Campari", cat: "Liqueurs" },
  { name: "Sweet Vermouth", cat: "Liqueurs" },
  { name: "Dry Vermouth", cat: "Liqueurs" },
  { name: "Triple Sec", cat: "Liqueurs" },
  { name: "Coffee Liqueur", cat: "Liqueurs" },
  { name: "Absinthe", cat: "Liqueurs" },
  { name: "Tonic Water", cat: "Mixers" },
  { name: "Soda Water", cat: "Mixers" },
  { name: "Espresso", cat: "Mixers" },
  { name: "Lemon", cat: "Citrus & Fresh" },
  { name: "Lime", cat: "Citrus & Fresh" },
  { name: "Orange", cat: "Citrus & Fresh" },
  { name: "Mint", cat: "Citrus & Fresh" },
  { name: "Sugar", cat: "Pantry" },
  { name: "Simple Syrup", cat: "Pantry" },
  { name: "Angostura Bitters", cat: "Pantry" },
  { name: "Egg White", cat: "Pantry" },
];

export type RecipeIngredient = { n: string; m: string };

export type Drink = {
  id: string;
  name: string;
  mono: string;
  glass: string;
  base: string;
  accent: string;
  rgb: string;
  tags: string[];
  vector: Partial<Record<Flavor, number>>;
  ingredients: RecipeIngredient[];
  steps: string[];
};

export const DRINKS: Drink[] = [
  {
    id: "old-fashioned",
    name: "Old Fashioned",
    mono: "OF",
    glass: "Rocks",
    base: "Bourbon",
    accent: "#d9933a",
    rgb: "217,147,58",
    tags: ["Boozy", "Bitter", "Classic"],
    vector: { boozy: 3, bitter: 2, sweet: 1 },
    ingredients: [
      { n: "Bourbon", m: "60 ml" },
      { n: "Angostura Bitters", m: "2 dashes" },
      { n: "Sugar", m: "1 cube" },
      { n: "Orange", m: "1 twist" },
    ],
    steps: [
      "Muddle the sugar with bitters and a splash of water.",
      "Add bourbon and ice; stir until well chilled.",
      "Strain over a large cube and express an orange peel.",
    ],
  },
  {
    id: "negroni",
    name: "Negroni",
    mono: "NE",
    glass: "Rocks",
    base: "Gin",
    accent: "#c0392b",
    rgb: "192,57,43",
    tags: ["Bitter", "Boozy", "Herbal"],
    vector: { bitter: 3, boozy: 2, herbal: 2 },
    ingredients: [
      { n: "Gin", m: "30 ml" },
      { n: "Campari", m: "30 ml" },
      { n: "Sweet Vermouth", m: "30 ml" },
      { n: "Orange", m: "1 twist" },
    ],
    steps: [
      "Build gin, Campari and sweet vermouth over ice.",
      "Stir until cold and silky.",
      "Strain over fresh ice; garnish with orange.",
    ],
  },
  {
    id: "gin-tonic",
    name: "Gin & Tonic",
    mono: "GT",
    glass: "Highball",
    base: "Gin",
    accent: "#9fb86a",
    rgb: "159,184,106",
    tags: ["Refreshing", "Bitter", "Light"],
    vector: { refreshing: 3, bitter: 1, herbal: 1 },
    ingredients: [
      { n: "Gin", m: "50 ml" },
      { n: "Tonic Water", m: "150 ml" },
      { n: "Lime", m: "1 wedge" },
    ],
    steps: [
      "Fill a tall glass with plenty of ice.",
      "Pour gin, then top with chilled tonic.",
      "Squeeze a lime wedge and drop it in.",
    ],
  },
  {
    id: "boulevardier",
    name: "Boulevardier",
    mono: "BO",
    glass: "Coupe",
    base: "Bourbon",
    accent: "#c2602f",
    rgb: "194,96,47",
    tags: ["Boozy", "Bitter", "Rich"],
    vector: { boozy: 3, bitter: 3, herbal: 1 },
    ingredients: [
      { n: "Bourbon", m: "45 ml" },
      { n: "Campari", m: "30 ml" },
      { n: "Sweet Vermouth", m: "30 ml" },
      { n: "Orange", m: "1 twist" },
    ],
    steps: [
      "Combine bourbon, Campari and vermouth over ice.",
      "Stir for 20–30 seconds until chilled.",
      "Strain into a chilled glass; orange twist.",
    ],
  },
  {
    id: "whiskey-sour",
    name: "Whiskey Sour",
    mono: "WS",
    glass: "Coupe",
    base: "Bourbon",
    accent: "#e0b54a",
    rgb: "224,181,74",
    tags: ["Sour", "Sweet", "Boozy"],
    vector: { sour: 3, sweet: 2, boozy: 2 },
    ingredients: [
      { n: "Bourbon", m: "60 ml" },
      { n: "Lemon", m: "25 ml" },
      { n: "Sugar", m: "15 ml" },
      { n: "Egg White", m: "1" },
    ],
    steps: [
      "Dry-shake bourbon, lemon, sugar and egg white.",
      "Add ice and shake again until frothy.",
      "Strain into a glass; a few drops of bitters on top.",
    ],
  },
  {
    id: "daiquiri",
    name: "Daiquiri",
    mono: "DA",
    glass: "Coupe",
    base: "White Rum",
    accent: "#b9c97e",
    rgb: "185,201,126",
    tags: ["Sour", "Refreshing", "Bright"],
    vector: { sour: 3, refreshing: 2, sweet: 1 },
    ingredients: [
      { n: "White Rum", m: "60 ml" },
      { n: "Lime", m: "25 ml" },
      { n: "Sugar", m: "15 ml" },
    ],
    steps: [
      "Shake white rum, lime and sugar with ice.",
      "Shake hard until frosty.",
      "Double-strain into a chilled coupe.",
    ],
  },
  {
    id: "manhattan",
    name: "Manhattan",
    mono: "MN",
    glass: "Coupe",
    base: "Rye Whiskey",
    accent: "#b23a4e",
    rgb: "178,58,78",
    tags: ["Boozy", "Herbal", "Smooth"],
    vector: { boozy: 3, herbal: 2, bitter: 1, sweet: 1 },
    ingredients: [
      { n: "Rye Whiskey", m: "60 ml" },
      { n: "Sweet Vermouth", m: "30 ml" },
      { n: "Angostura Bitters", m: "2 dashes" },
    ],
    steps: [
      "Stir rye, sweet vermouth and bitters with ice.",
      "Stir until properly chilled.",
      "Strain into a coupe; garnish with a cherry.",
    ],
  },
  {
    id: "margarita",
    name: "Margarita",
    mono: "MA",
    glass: "Rocks",
    base: "Tequila",
    accent: "#8fbf6a",
    rgb: "143,191,106",
    tags: ["Sour", "Refreshing", "Citrus"],
    vector: { sour: 3, refreshing: 2, sweet: 1 },
    ingredients: [
      { n: "Tequila", m: "50 ml" },
      { n: "Lime", m: "25 ml" },
      { n: "Triple Sec", m: "20 ml" },
    ],
    steps: [
      "Shake tequila, lime and triple sec with ice.",
      "Salt the rim if you like.",
      "Strain over fresh ice in a rocks glass.",
    ],
  },
  {
    id: "sazerac",
    name: "Sazerac",
    mono: "SZ",
    glass: "Rocks",
    base: "Rye Whiskey",
    accent: "#c76a35",
    rgb: "199,106,53",
    tags: ["Boozy", "Bitter", "Herbal"],
    vector: { boozy: 3, bitter: 2, herbal: 2 },
    ingredients: [
      { n: "Rye Whiskey", m: "60 ml" },
      { n: "Absinthe", m: "rinse" },
      { n: "Sugar", m: "1 cube" },
      { n: "Angostura Bitters", m: "3 dashes" },
    ],
    steps: [
      "Rinse a chilled glass with absinthe; discard.",
      "Stir rye, sugar and bitters with ice.",
      "Strain into the glass; express a lemon peel.",
    ],
  },
  {
    id: "espresso-martini",
    name: "Espresso Martini",
    mono: "EM",
    glass: "Coupe",
    base: "Vodka",
    accent: "#a3744a",
    rgb: "163,116,74",
    tags: ["Boozy", "Sweet", "Rich"],
    vector: { sweet: 3, boozy: 2 },
    ingredients: [
      { n: "Vodka", m: "50 ml" },
      { n: "Coffee Liqueur", m: "30 ml" },
      { n: "Espresso", m: "30 ml" },
      { n: "Sugar", m: "5 ml" },
    ],
    steps: [
      "Shake vodka, coffee liqueur and fresh espresso.",
      "Shake very hard with ice for a thick foam.",
      "Strain into a coupe; three coffee beans.",
    ],
  },
];
