// All Harry Potter flavour lives in src/lore/, so it can be swapped out in
// one place if this personal fan project is ever shared publicly.

export type HouseId = "gryffindor" | "hufflepuff" | "ravenclaw" | "slytherin";

export interface House {
  id: HouseId;
  name: string;
  crest: string;
  colors: [string, string];
  traits: string;
  hatLine: string;
}

export const HOUSES: Record<HouseId, House> = {
  gryffindor: {
    id: "gryffindor",
    name: "Gryffindor",
    crest: "🦁",
    colors: ["#ae0001", "#eeba30"],
    traits: "bravery, daring and nerve",
    hatLine: "Plenty of courage, I see... you'd charge straight at a bug at midnight. Better be... GRYFFINDOR!",
  },
  hufflepuff: {
    id: "hufflepuff",
    name: "Hufflepuff",
    crest: "🦡",
    colors: ["#ecb939", "#372e29"],
    traits: "patience, loyalty and hard work",
    hatLine: "Patient, loyal, unafraid of testing every line twice... HUFFLEPUFF!",
  },
  ravenclaw: {
    id: "ravenclaw",
    name: "Ravenclaw",
    crest: "🦅",
    colors: ["#3d6fb5", "#b08d57"],
    traits: "wit, learning and curiosity",
    hatLine: "A mind that asks *why* the spell works, not just *how*... RAVENCLAW!",
  },
  slytherin: {
    id: "slytherin",
    name: "Slytherin",
    crest: "🐍",
    colors: ["#2a623d", "#aaaaaa"],
    traits: "ambition, cunning and resourcefulness",
    hatLine: "Ahh, a natural Parselmouth - Python is the language of snakes, after all... SLYTHERIN!",
  },
};

export interface SortingQuestion {
  prompt: string;
  answers: { text: string; house: HouseId }[];
}

export const SORTING_QUESTIONS: SortingQuestion[] = [
  {
    prompt: "A bug appears in your spell at midnight. What do you do?",
    answers: [
      { text: "Charge straight in and fix it now", house: "gryffindor" },
      { text: "Patiently test every line until I find it", house: "hufflepuff" },
      { text: "Read up on *why* it happens first", house: "ravenclaw" },
      { text: "Find a clever way around it", house: "slytherin" },
    ],
  },
  {
    prompt: "Which would you most like to be remembered for?",
    answers: [
      { text: "Standing up for others", house: "gryffindor" },
      { text: "Always being there for my friends", house: "hufflepuff" },
      { text: "A brilliant discovery", house: "ravenclaw" },
      { text: "Achieving something great", house: "slytherin" },
    ],
  },
  {
    prompt: "Pick a magical object to take to class:",
    answers: [
      { text: "A sword that appears when needed", house: "gryffindor" },
      { text: "A cup that never runs empty", house: "hufflepuff" },
      { text: "A diadem that sharpens the mind", house: "ravenclaw" },
      { text: "A locket that opens only for you", house: "slytherin" },
    ],
  },
  {
    prompt: "Your group project is due tomorrow. You...",
    answers: [
      { text: "Take the lead and rally everyone", house: "gryffindor" },
      { text: "Make sure everyone's part gets done", house: "hufflepuff" },
      { text: "Perfect the trickiest piece yourself", house: "ravenclaw" },
      { text: "Make sure *our* project wins", house: "slytherin" },
    ],
  },
];

export function sortIntoHouse(answers: HouseId[], random = Math.random): HouseId {
  const tally: Record<HouseId, number> = { gryffindor: 0, hufflepuff: 0, ravenclaw: 0, slytherin: 0 };
  answers.forEach((h) => tally[h]++);
  const best = Math.max(...Object.values(tally));
  const tied = (Object.keys(tally) as HouseId[]).filter((h) => tally[h] === best);
  return tied[Math.floor(random() * tied.length)];
}

export const LEVEL_TITLES = [
  "Wide-eyed First-Year",
  "Wand-Waving Apprentice",
  "Charms Enthusiast",
  "Potions Tinkerer",
  "Herbology Helper",
  "Library Regular",
  "Duelling Novice",
  "Prefect of Parseltongue",
  "Seeker of Bugs",
  "Arithmancy Adept",
  "Defence Specialist",
  "Head Student of Syntax",
  "Ministry Apprentice",
  "Unspeakable of Algorithms",
  "Auror of Algorithms",
  "Order of the Phoenix Pythonista",
  "Master Curse-Breaker",
  "Headmaster of Loops",
  "Legend of the Wizarding World",
  "Master of the Elder Wand",
];

export const levelTitle = (level: number) =>
  LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length) - 1];

export const MENTOR = {
  name: "Professor Ashwood",
  title: "Professor of Parseltongue (the Python language)",
  portrait: "🧙‍♀️",
};

export const LOADING_LINES = [
  "Summoning the Python interpreter from the Room of Requirement...",
  "Polishing the crystal balls in the Divination tower...",
  "Convincing the staircases to stay still...",
  "Feeding the owls in the Owlery...",
  "Waking the portraits in the Great Hall...",
];

export const YEAR_NAMES = [
  "First Year - The Philosopher's Syntax",
  "Second Year - The Chamber of Collections",
  "Third Year - The Prisoner of Recursion",
  "Fourth Year - The Goblet of Objects",
  "Fifth Year - The Order of Algorithms",
  "Sixth Year - The Half-Blood Pythonista",
  "Seventh Year - The Deathly Algorithms",
];
