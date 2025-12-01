import type { OrderResult } from '../../data/OrderResult';
import { TOPPINGS, ToppingType } from '../../constants';

export type Minigame1Choice = "A" | "B" | "Equivalent";

export function getScreenShotResults(allResults: OrderResult[]): OrderResult[] {
    return allResults.filter(
        (r: OrderResult) => 
            !!r.screenshotDataUrl &&
            r.success &&
            !!r.order &&
            r.order.toppingsCounts 
    );
}

export function pickRandomPair(pool: OrderResult[]): { a: OrderResult; b: OrderResult } {
    const aIndex = Math.floor(Math.random() * pool.length);
    let bIndex = Math.floor(Math.random() * pool.length);
    while (bIndex === aIndex && pool.length > 1) {
        bIndex = Math.floor(Math.random() * pool.length);
    }

    const a = pool[aIndex];
    const b = pool[bIndex];

    return { a, b };
}

export function pickRandomTopping(): ToppingType {
    return TOPPINGS[Math.floor(Math.random() * TOPPINGS.length)] as ToppingType;
}

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
    const aOrder = a.order!;
    const bOrder = b.order!;

    const aCount = aOrder.toppingsCounts?.[topping] ?? 0;
    const bCount = bOrder.toppingsCounts?.[topping] ?? 0;

    const aTotalSlices = (a.currentPizzaNumber ?? 1) * (a.slicesUsed ?? 1);
    const bTotalSlices = (b.currentPizzaNumber ?? 1) * (b.slicesUsed ?? 1);
    
    let correct: Minigame1Choice = "Equivalent";

    if(aTotalSlices > 0 && bTotalSlices > 0) {
        const left = aCount * bTotalSlices;
        const right = bCount * aTotalSlices;
        
        if (left > right) {
            correct = "A";
        } else if (right > left) {
            correct = "B";
        } else {
            correct = "Equivalent";
        }
    }

    const isCorrect = choice === correct;

    return { isCorrect, correct, aCount, bCount };
}