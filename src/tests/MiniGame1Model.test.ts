import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getScreenShotResults, pickRandomPair, pickRandomTopping, evaluateChoice, type Minigame1Choice } from "../screens/Minigame1Screen/Minigame1Model";
import type { OrderResult } from "../data/OrderResult";
import { TOPPINGS, type ToppingType } from "../constants";

// Reset all mocked function after each test to avoid leakage between tests
afterEach(() => {
    vi.restoreAllMocks();
});

// Helper to create a minimal OrderResult with overrides
function makeOrderResult(partial: Partial<OrderResult>): OrderResult {
    return {
        success: false,
        order: undefined,
        screenshotDataUrl: undefined,
        currentPizzaNumber: 1,
        slicesUsed: 1,
        details: "",
        expectedTotal: 0,
        currentTotal: 0,
        expectedPizzaNum: 1,
        ...partial,
    } as any
}

describe("getScreenShotResults", () => {
    it("filters results correctly", () => {
        const toppingType = TOPPINGS[0] as ToppingType;

        const valid = makeOrderResult({
            success: true,
            screenshotDataUrl: "data-url-1.",
            order: {
                toppingsCounts: { [toppingType]: 2 },
            } as any,
        });
          
        const noScreenshot = makeOrderResult({
            success: true,
            screenshotDataUrl: "",
            order: {
                toppingsCounts: { [toppingType]: 1 },
            } as any,
        });

        const notSuccess = makeOrderResult({
            success: false,
            screenshotDataUrl: "data-url-2",
            order: {
                toppingsCounts: { [toppingType]: 1 },
            } as any,
        });

        const noOrder = makeOrderResult({
            success: true,
            screenshotDataUrl: "data-url-3",
            order: undefined,
        });

        const noToppingsCounts = makeOrderResult({
            success: true,
            screenshotDataUrl: "data-url-4",
            order: {
                toppingsCounts: undefined,
            } as any,
        });

        const input = [valid, noScreenshot, notSuccess, noOrder, noToppingsCounts];

        const results = getScreenShotResults(input);
        
        expect(results).toHaveLength(1);
        expect(results[0]).toBe(valid);
    });
});

describe("pickRandomPair", () => {
    it("picks two different results when pool length > 1", () => {
        const pool: OrderResult[] = [
            makeOrderResult({ details: "A" }),
            makeOrderResult({ details: "B" }),
            makeOrderResult({ details: "C" }),
        ];

        const randomSpy = vi
            .spyOn(Math, "random")
            .mockReturnValueOnce(0.1) // picks index 0
            .mockReturnValueOnce(0.1) // picks index 0 again, should retry
            .mockReturnValueOnce(0.9); // picks index 2

        const { a, b } = pickRandomPair(pool);

        expect(randomSpy).toHaveBeenCalled();
        expect(a).toBe(pool[0]);
        expect(b).toBe(pool[2]);
    });

    it("can return the same element twice when pool length === 1", () => {
        const only = makeOrderResult({ details: "Only" });
        const pool = [only];

        vi.spyOn(Math, "random").mockReturnValue(0); // index 0

        const { a, b } = pickRandomPair(pool);

        expect(a).toBe(only);
        expect(b).toBe(only);
    });
});

describe("pickRandomTopping", () => {
    it("returns a topping from TOPPINGS based on Math.random", () => {
        const index = 2;
        const fakeRandom = index / TOPPINGS.length;

        vi.spyOn(Math, "random").mockReturnValue(fakeRandom);

        const topping = pickRandomTopping();

        expect(topping).toBe(TOPPINGS[index]);
    });

    it("always returns a value that exists in TOPPINGS", () => {
        const topping = pickRandomTopping();

        expect(TOPPINGS).toContain(topping);
    });
});

describe("evaluateChoice", () => {
    const topping = TOPPINGS[0] as ToppingType;

    function makeOrderResultWithCounts(
        toppingCount: number,
        pizzaCount: number,
        slicesUsed: number
    ): OrderResult {
        return makeOrderResult({
            success: true,
            order: {
                toppingsCounts: { [topping]: toppingCount },
            } as any,
            currentPizzaNumber: pizzaCount,
            slicesUsed: slicesUsed,
        });
    }

    it("returns Equivalent and correct = true when fractions are equal and choice is Equivalent", () => {
        const a = makeOrderResultWithCounts(2, 1, 4); 
        const b = makeOrderResultWithCounts(3, 2, 3);
        const result = evaluateChoice(a, b, topping, "Equivalent");
        
        expect(result.correct).toBe("Equivalent");
        expect(result.isCorrect).toBe(true);
        expect(result.aCount).toBe(2);
        expect(result.bCount).toBe(3);
    });

    it("returns A when fraction for A is larger and choice is 'A'", () => {
        const a = makeOrderResultWithCounts(2, 1, 4); 
        const b = makeOrderResultWithCounts(2, 1, 8);

        const result = evaluateChoice(a, b, topping, "A");

        expect(result.correct).toBe<Minigame1Choice>("A");
        expect(result.isCorrect).toBe(true);
    });
});


