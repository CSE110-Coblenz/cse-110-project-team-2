// Shared constants for the pizza game
export const STAGE_WIDTH = 1300;
export const STAGE_HEIGHT = 650;

export const DIFFICULTY_LEVELS = ["easy", "medium", "hard"] as const;
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];

export const FRACTION_TYPES = [
    "proper",
    "improper",
    "mixed"
] as const;

export type FractionType = typeof FRACTION_TYPES[number];

export type ToppingType='Mushroom'|'Pepper'|'Pepperoni';
export const PIZZA ={ R_OUTER:200};
export const SLICE_OPTIONS=[4,8,12,16] as const;

export const MINIGAME2_DURATION = 30;