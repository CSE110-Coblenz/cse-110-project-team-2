import type { OrderResult } from '../../data/OrderResult';
import { TOPPINGS, ToppingType } from '../../constants';

// Represents the three possible choices the player can make in Minigame 1.
export type Minigame1Choice = "A" | "B" | "Equivalent";

/**
 * Filters order results to only those that have:
 * - have a screenshot saved
 * - were successfully completed
 * - have an associated order with toppingsCounts
 * @param allResults Array of OrderResult to filter
 * @returns Filtered array of OrderResult
 */
export function getScreenShotResults(allResults: OrderResult[]): OrderResult[] {
    return allResults.filter(
        (r: OrderResult) => 
            !!r.screenshotDataUrl &&
            r.success &&
            !!r.order &&
            r.order.toppingsCounts 
    );
}

/**
 * Pickss two distinct random results from the given pool.
 * Ensrues bIndex is different from aIndex (Unless pool length is 1).
 * @param pool 
 * @returns Object with properties a and b representing the two picked OrderResults
 */
export function pickRandomPair(pool: OrderResult[]): { a: OrderResult; b: OrderResult } {
    const aIndex = Math.floor(Math.random() * pool.length);
    // Pick bIndex until it's different from aIndex.
    let bIndex = Math.floor(Math.random() * pool.length);
    while (bIndex === aIndex && pool.length > 1) {
        bIndex = Math.floor(Math.random() * pool.length);
    }

    const a = pool[aIndex];
    const b = pool[bIndex];

    return { a, b };
}

/**
 * Selects a random topping from the list of TOPPINGS.
 * @returns 
 */
export function pickRandomTopping(): ToppingType {
    return TOPPINGS[Math.floor(Math.random() * TOPPINGS.length)] as ToppingType;
}/**
 * Evaluates whether the player's choice is correct 
 * @param a Left-side pizza
 * @param b Right-side pizza 
 * @param topping Topping the minigame is asking about
 * @param choice Player's choice
 * @returns Object with properties:
 *  - isCorrect: whether the player's choice is correct
 *  - correct: the correct choice
 *  - aCount: number of the specified topping on pizza A
 *  - bCount: number of the specified topping on pizza B
 */
export function evaluateChoice(
    a: OrderResult, 
    b: OrderResult, 
    topping: ToppingType, 
    choice: Minigame1Choice
): { 
    isCorrect: boolean; 
    correct: Minigame1Choice;
    aCount: number;
    bCount: number;
} {
    const aOrder = a.order!; // order object is guranteed by filtering.
    const bOrder = b.order!;

    // Number of pieces of the chosen topping on each order.
    const aCount = aOrder.toppingsCounts?.[topping] ?? 0;
    const bCount = bOrder.toppingsCounts?.[topping] ?? 0;

    // Total slices for each result.
    const aTotalSlices = (a.currentPizzaNumber ?? 1) * (a.slicesUsed ?? 1);
    const bTotalSlices = (b.currentPizzaNumber ?? 1) * (b.slicesUsed ?? 1);
    
    // Default correct choice is Equivalent.
    let correct: Minigame1Choice = "Equivalent";
    // Cross-multiply to reflect fractions values.
    if(aTotalSlices > 0 && bTotalSlices > 0) {
        const left = aCount * bTotalSlices;
        const right = bCount * aTotalSlices;
        // Determine correct choice based on comparison.
        if (left > right) {
            correct = "A";
        } else if (right > left) {
            correct = "B";
        } else {
            correct = "Equivalent";
        }
    }

    // Whether player chose the correct answer. 
    const isCorrect = choice === correct;

    return { isCorrect, correct, aCount, bCount };
}