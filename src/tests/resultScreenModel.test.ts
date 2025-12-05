import { describe, it, expect } from "vitest";
import { OrderResult } from "../data/OrderResult";
import { builderRecommendationMessage, computeStats, getWrongOrderSummaries } from "../screens/ResultScreen/ResultScreenModel";

describe("builderRecommendationMessage", () => {
    const makeResult = (overrides: Partial<OrderResult>): OrderResult => 
        ({
            orderNumber: 1,
            success: false,
            details: "",
            ...overrides,
        } as OrderResult);

    it("returns all-correct message when all orders are correct", () => {
        const results: OrderResult[] = [
            makeResult({ success: true }),
            makeResult({ success: true }),
        ];

        const message = builderRecommendationMessage(results);
        expect(message).toContain("All orders were completed correctly! Great job!");
    });

    it("mentions a signle incorrecr order and its denominator", () => {
        const results: OrderResult[] = [
            makeResult({
                orderNumber: 1,
                success: false,
                details: "Expected 3/12, got 2/12",
            }),
        ];

        const message = builderRecommendationMessage(results);
        expect(message).toContain("You had 1 incorrect order.");
        expect(message).toContain("trouble with fractions involving 12 slices");
        expect(message).toContain("denominator of 12");
    });

    it("handles multiple wrong orderes with the same denominator", () => {
        const results: OrderResult[] = [
            makeResult({
                orderNumber: 1,
                success: false,
                details: "Expected 3/12, got 2/12",
            }),
            makeResult({
                orderNumber: 2,
                success: false,
                details: "Expected 4/12, got 3/12",
            }),
        ]; 

        const message = builderRecommendationMessage(results);
        expect(message).toContain("You had 2 incorrect orders.");
        expect(message).toContain("trouble with fractions involving 12 slices");
        expect(message).toContain("denominator of 12");
    });

    it("picks the most common denominator when multiple are present", () => {
        const results: OrderResult[] = [
            makeResult({
                orderNumber: 1,
                success: false,
                details: "Expected 1/4, got 2/4",
            }),
            makeResult({
                orderNumber: 2,
                success: false,
                details: "Expected 3/8, got 2/8",
            }),
            makeResult({
                orderNumber: 3,
                success: false,
                details: "Expected 5/8, got 4/8",
            }),
        ];

        const message = builderRecommendationMessage(results);
        expect(message).toContain("You had 3 incorrect orders.");
        expect(message).toContain("trouble with fractions involving 8 slices");
        expect(message).toContain("denominator of 8");
        expect(message).not.toContain("4 slices");
    });

    it("lists multiple denominators when there is a tie", () => {
        const results: OrderResult[] = [
            makeResult({
                orderNumber: 1,
                success: false,
                details: "Expected 1/3, got 2/3",
            }),
            makeResult({
                orderNumber: 2,
                success: false,
                details: "Expected 2/5, got 1/5",
            }),
        ];

        const message = builderRecommendationMessage(results);
        expect(message).toContain("You had 2 incorrect orders.");
        expect(message).toContain("trouble with fractions involving the following denominators: 3, 5");
        expect(message).toContain("denominators");
    });
});

describe("computeStats", () => {
    const makeResult = (overrides: Partial<OrderResult>): OrderResult => 
        ({
            orderNumber: 1,
            success: false,
            details: "",
            ...overrides,
        } as OrderResult);

    it("computes ordersReceived, ordersCorrect, and tipsReceived correctly", () => {
        const results: OrderResult[] = [
            makeResult({ orderNumber: 1, success: true }),
            makeResult({ orderNumber: 2, success: false }),
            makeResult({ orderNumber: 3, success: true }),
        ];

        const stats = computeStats(results, 7);

        expect(stats.ordersReceived).toBe(3);
        expect(stats.ordersCorrect).toBe(2);
        expect(stats.tipsReceived).toBe(7);
    });

    it("handles empty results", () => {
        const stats = computeStats([], 0);

        expect(stats.ordersReceived).toBe(0);
        expect(stats.ordersCorrect).toBe(0);
        expect(stats.tipsReceived).toBe(0);
    });
});

describe("getWrongOrderSummaries", () => {
    const makeResult = (overrides: Partial<OrderResult>): OrderResult => 
        ({
            orderNumber: 1,
            success: false,
            details: "",
            ...overrides,
        } as OrderResult);

    it("returns summaries for wrong orders only", () => {
        const results: OrderResult[] = [
            makeResult({ orderNumber: 1, success: true, details: "Correct order 1"}),
            makeResult({ orderNumber: 2, success: false, details: "Wrong order 2" }),
            makeResult({ orderNumber: 3, success: false, details: "Wrong order 3" }),
        ];

        const summaries = getWrongOrderSummaries(results);

        expect(summaries).toHaveLength(2);
        expect(summaries).toEqual([
            { orderNumber: 2, details: "Wrong order 2" },
            { orderNumber: 3, details: "Wrong order 3" },
        ]);
    });

    it("returns an empty array when there are no wrong orders", () => {
        const results: OrderResult[] = [
            makeResult({ orderNumber: 1, success: true }),
            makeResult({ orderNumber: 2, success: true }),
        ];

        const summaries = getWrongOrderSummaries(results);

        expect(summaries).toEqual([]);
    });
});
