export interface OrderResult {
  orderNumber: number;
  day: number;
  success: boolean;
  details: string;
  expectedTotal: number;
  currentTotal: number;
  expectedPizzaNum: number;
  currentPizzaNumber: number;
}