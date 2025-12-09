import { ToppingType } from "../constants";
import type { Order } from "../types";

/**
 * Represents the result of a single order attempt. 
 * Stored in ResultStore and used by: 
 * - ResultScreen to show performance summary (stats, wrong order details)
 * - Minigame1 (needed for screenshots + topping info) 
 */
export interface OrderResult {
  orderNumber: number; // sequential number of the order for the day
  success: boolean; // whether the order was completed correctly or not
  details: string; // text description of what went wrong 
  expectedTotal: number; // expected total fraction value for the order
  currentTotal: number; // Player's computed total fraction based on slices they placed
  expectedPizzaNum: number; // expected number of pizzas the order should have used 
  currentPizzaNumber: number; // number of pizzas the player used for this order
  slicesUsed: number; // total number of slices the player cut or placed 
  placedToppings?: PlacedTopping[]; // exact pizza toppings the player placed on each pizza
  tipsEarned: number; // tips earned from an order 
  order?: Order; // full Order definition (fractions + toppings requirement)
  screenshotDataUrl?: string; // screenshot of the completed pizza 
}

export interface PlacedTopping {
  type: ToppingType;
  x: number;
  y: number;
  pizzaIndex: 0 | 1;
}

export interface SavedTopping {
  type: ToppingType;
  offsetX: number
  offsetY: number;
  pizzaIndex: 0 | 1;
}


