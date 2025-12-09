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
export const TOPPINGS = ["Mushroom", "Basil", "Pepperoni"] as const;
export type ToppingType = typeof TOPPINGS[number];
export const PIZZA ={pizzaX:STAGE_WIDTH/2+75, pizzaY:STAGE_HEIGHT-205, pizzaX1:STAGE_WIDTH/3+75, pizzaX2:STAGE_WIDTH*2/3+75};
export const SLICE_OPTIONS=[4,6,8,12] as const;
// Minimum number of distinct topping types to appear in an improper-order
export const MIN_TOPPING_TYPES = 2;
export const ORDER_BG_COLOR = "#fff3e0";
export const ORDER_TITLE_COLOR = "#6d4c41";
export const ORDER_BUTTON_FILL = "#43a047";
export const ORDER_BUTTON_STROKE = "#2e7d32";
export const GAME_BG_COLOR = "#F5C753"
export const ORDERS_PER_DAY:number = 5

export const TITLE_COLOR = "#AB321B";

export const MINIGAME_POPUP_WIDTH = 500;
export const MINIGAME_POPUP_HEIGHT = 275;
export const MINIGAME2_DURATION = 30; // seconds

export const TIP_TABLE = [
  { max: 0, tip: 6.0, review: "DELICIOUS! My pizza was fresh and hot 🔥" },
  { max: 2, tip: 5.0, review: "Tasted great, but sauce leaked a bit." },
  { max: 4, tip: 4.0, review: "Good pizza, but toppings were slightly off." },
  { max: 6, tip: 3.0, review: "My pizza arrived tilted and a bit messy." },
  { max: 8, tip: 2.0, review: "Why was my pizza upside down? 😕" },
  { max: 10, tip: 1.0, review: "Pizza was all crushed up..." },
  { max: Infinity, tip: 0.0, review: "Never ordering again 💀" },
] as const;

// Background Constants
export const SCREEN_BACKGROUNDS = {
    MENU: "/background-checkers.jpg",
} as const;

// Background Overlay
export const SCREEN_OVERLAY = {
    COLOR: "rgba(228,202,192,0.50)",
}
// Order phrasing templates. Use the placeholder LIST which will be replaced with the toppings list.
export const ORDER_PHRASES = [
    "I heard this place has the best pizza. Can I get LIST?",
    "Hey! I’ll take LIST, please.",
    "Can I order LIST? I’ve been craving this all day.",
    "I’m starving—hook me up with LIST.",
    "Could I grab LIST? Thanks!",
    "Let’s gooo, pizza time! I’ll take LIST.",
    "I have journeyed far for your pizza. Grant me LIST.",
] as const;

export type OrderPhrase = typeof ORDER_PHRASES[number]; 