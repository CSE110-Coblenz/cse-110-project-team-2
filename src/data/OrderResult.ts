import type { Order } from "../types";

export interface OrderResult {
  orderNumber: number;
  day: number;
  success: boolean;
  details: string;
  expectedTotal: number;
  currentTotal: number;
  expectedPizzaNum: number;
  currentPizzaNumber: number;
  slicesUsed: number;
  // Optional full order data (toppings, fraction, etc.) so minigames
  // and results screens can inspect exact order contents.
  order?: Order;
}
