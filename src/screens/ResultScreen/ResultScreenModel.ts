import type { OrderResult } from "../../data/OrderResult";
import { Order } from "../../types";

export type ResultsStats = {
    ordersReceived: number;
    ordersCorrect: number;
    tipsReceived: number;
};

export type WrongOrderSummary = {
    orderNumber: number;
    details: string;
};

function getMostCommonDenominators(wrong: OrderResult[]): number[] {    
    const denomCount = new Map<number, number>();

    for(const r of wrong) {
        const lines = r.details.split('\n');
        for(const line of lines) {
            const match = line.match(/(\d+)\s*\/\s*(\d+)/);
            if(!match) continue;

            const denom = parseInt(match[2], 10);
            if(!Number.isFinite(denom)) continue;

            denomCount.set(denom, (denomCount.get(denom) ?? 0) + 1);
        }
    }

    if(denomCount.size === 0) return [];

    let maxCount = 0;
    const mostCommon: number[] = [];

    for(const [denom, count] of denomCount) {
        if(count > maxCount) {
            maxCount = count;
            mostCommon.length = 0;
            mostCommon.push(denom);
        } else if (count === maxCount) {
            mostCommon.push(denom);
        }
    }

    return mostCommon.sort((a, b) => a - b);
}

export function builderRecommendationMessage(results: OrderResult[]): string {
    const wrong = results.filter(r => !r.success);

    if(wrong.length === 0) {
        return "All orders were completed correctly! Great job!";
    }

    const count = wrong.length;
    const commonDenoms = getMostCommonDenominators(wrong);

    let message = `You had ${count} incorrect order${count > 1 ? 's' : ""}.\n\n`;

    if(commonDenoms.length > 0) {
        const denomList = commonDenoms.join(", ");

        if(commonDenoms.length === 1) {
            const d = commonDenoms[0];
            message += `It looks like you had trouble with fractions involving ${d} slices. `;
            message += `Review how to work with fractions with a denominator of ${d}.\n\n`;
        } else {
            message += `It looks like you had trouble with fractions involving the following denominators: ${denomList}. `;
            message += `Review how to work with fractions with these denominators.\n\n`;
        }
    } else {
        message += `Your mistakes were varied. Keep practicing to improve your skills!\n\n`;
    }

    return message;
}

export function computeStats(results: OrderResult[], totalTips: number): ResultsStats {
    const ordersReceived = results.length;
    const ordersCorrect = results.filter(r => r.success).length;
    const tipsReceived = totalTips;

    return { ordersReceived, ordersCorrect, tipsReceived };
}

export function getWrongOrderSummaries(results: OrderResult[]): WrongOrderSummary[] {
    return results
        .filter(r => !r.success)
        .map(r => ({
            orderNumber: r.orderNumber,
            details: r.details,
        }));
}

