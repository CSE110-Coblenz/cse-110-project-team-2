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
export const TOPPINGS = ["Mushroom", "Pepper", "Pepperoni"] as const;
export type ToppingType = typeof TOPPINGS[number];
export const PIZZA ={ R_OUTER:200};
export const SLICE_OPTIONS=[4,8,12,16] as const;
export const ORDER_BG_COLOR = "#fff3e0";
export const ORDER_TITLE_COLOR = "#6d4c41";
export const ORDER_BUTTON_FILL = "#43a047";
export const ORDER_BUTTON_STROKE = "#2e7d32";

export const MINIGAME2_DURATION = 30; // seconds
