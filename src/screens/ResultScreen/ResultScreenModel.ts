import type { OrderResult } from "../../data/OrderResult";
import { Order } from "../../types";

/**
 * Aggregated stats displayed on the Result Screen.
 */
export type ResultsStats = {
    ordersReceived: number;
    ordersCorrect: number;
    tipsReceived: number;
};

/**
 * A simplifed record describing a wrong order for display purposes.
 */
export type WrongOrderSummary = {
    orderNumber: number;
    details: string;
};

/**
 * Given a list of wrong orders, determine which denominator(s) appear most frequently.
 * @param wrong List of wrong OrderResults
 * @returns denominators that appear most frequently.
 */
function getMostCommonDenominators(wrong: OrderResult[]): number[] {    
    // Map<denominator, count>
    const denomCount = new Map<number, number>();

    // Loop through each wrong order result entry
    for(const r of wrong) {
        // Split details into lines, since each order has multiple notes
        const lines = r.details.split('\n');
        for(const line of lines) {
            // Regex extract patterns like "3/8 " or "1 / 4" with optional spaces
            const match = line.match(/(\d+)\s*\/\s*(\d+)/);
            if(!match) continue;

            //Extract denominator
            const denom = parseInt(match[2], 10);
            if(!Number.isFinite(denom)) continue;

            // Increase count in the map
            denomCount.set(denom, (denomCount.get(denom) ?? 0) + 1);
        }
    }

    // If no denominators found, return empty list.
    if(denomCount.size === 0) return [];

    // Track the highest count seen so far.
    let maxCount = 0;

    // List of denominators that share the highest frequency.
    const mostCommon: number[] = [];

    for(const [denom, count] of denomCount) {
        if(count > maxCount) {
            // Found a new highest count -> reset list
            maxCount = count;
            mostCommon.length = 0;
            mostCommon.push(denom);
        } else if (count === maxCount) {
            // Tie for highest count -> add to list
            mostCommon.push(denom);
        }
    }

    // Return denominators sorted ascending for consistency
    return mostCommon.sort((a, b) => a - b);
}

/**
 * Builds a study recommendation message based on the player's wrong orders.
 * @param results List of all OrderResults
 * @returns a string message with recommendations
 */
export function builderRecommendationMessage(results: OrderResult[]): string {
    // Only wrong results matter for this message.
    const wrong = results.filter(r => !r.success);

    if(wrong.length === 0) {
        // All correct -> no recommendations needed.
        return "All orders were completed correctly! Great job!";
    }

    const count = wrong.length;
    const commonDenoms = getMostCommonDenominators(wrong);

    // Opening line describing number of wrong orders
    let message = `You had ${count} incorrect order${count > 1 ? 's' : ""}.\n\n`;

    // If denominators were found, provide targeted recommendations
    if(commonDenoms.length > 0) {
        const denomList = commonDenoms.join(", ");

        if(commonDenoms.length === 1) {
            // Single common denominator
            const d = commonDenoms[0];
            message += `It looks like you had trouble with fractions involving ${d} slices. `;
            message += `Review how to work with fractions with a denominator of ${d}.\n\n`;
        } else {
            // Multiple common denominators
            message += `It looks like you had trouble with fractions involving the following denominators: ${denomList}. `;
            message += `Review how to work with fractions with these denominators.\n\n`;
        }
    } else {
        // No common denominators found
        message += `Your mistakes were varied. Keep practicing to improve your skills!\n\n`;
    }

    return message;
}

/** 
 * Compute simple stats for the results sc.
 * @param results List of all OrderResults
 * @param totalTips Total tips earned across all orders
 * @returns ResultsStats object
 */
export function computeStats(results: OrderResult[], totalTips: number): ResultsStats {
    const ordersReceived = results.length;
    const ordersCorrect = results.filter(r => r.success).length;
    const tipsReceived = totalTips;

    return { ordersReceived, ordersCorrect, tipsReceived };
}

/**
 * Builds a simple array describing all incorrect orders.
 * Used for the scrolling "Wrong Orders" screen.
 */
export function getWrongOrderSummaries(results: OrderResult[]): WrongOrderSummary[] {
    return results
        .filter(r => !r.success)
        .map(r => ({
            orderNumber: r.orderNumber,
            details: r.details,
        }));
}

