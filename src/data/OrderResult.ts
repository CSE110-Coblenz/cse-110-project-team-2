import type { Order } from "../types";
import { ToppingType } from "../constants";

export interface OrderResult {
  orderNumber: number;
  success: boolean;
  details: string;
  expectedTotal: number;
  currentTotal: number;
  expectedPizzaNum: number;
  currentPizzaNumber: number;
  slicesUsed: number;
  placedToppings?: PlacedTopping[];
  tipsEarned: number;
  // Optional full order data (toppings, fraction, etc.) so minigames
  // and results screens can inspect exact order contents.
  order?: Order;
}

export interface PlacedTopping {
  type: ToppingType;
  x: number;
  y: number;
  pizzaIndex: 0 | 1;
}


