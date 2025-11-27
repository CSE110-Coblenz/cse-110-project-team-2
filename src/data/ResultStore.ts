import { Order } from "../types";
import type { OrderResult } from "./OrderResult";

const STORAGE_KEY = "slice_by_slice_order_results";

type StoredData = {
    results: OrderResult[];
    totalTips: number;
};

export class ResultStore {
    // In-memory storage of results
    private results: OrderResult[] = [];
    private totalTips: number = 0;

    constructor() {
        // Load existing results from localStorage
        if(typeof window !== "undefined") {
            const storedResults = window.localStorage.getItem(STORAGE_KEY);
            if (storedResults) {
                try {
                    const parsed = JSON.parse(storedResults);  
                    if (Array.isArray(parsed)) {
                        this.results = parsed as OrderResult[];
                        this.totalTips = 0;
                    } else {
                        this.results = (parsed.results ??[]) as OrderResult[];
                        this.totalTips = Number(parsed.totalTips ?? 0);
                    } 
                } catch {
                    this.results = [];
                    this.totalTips = 0;
                }
            }
        }
    }

    // Add a new order result
    add(result: OrderResult): void {
        this.results.push(result);
        this.save();
    }

    // Award tips
    addTips(amount: number): void {
        if(!Number.isFinite(amount)) return;
        this.totalTips += amount;
        this.save();
    }

    // Get total tips
    getTotalTips(): number {
        return this.totalTips;
    }

    // Retrieve all stored results
    getAll(): OrderResult[] {
        return this.results;
    }
    
    // Clear all stored results
    clear(): void {
        this.results = [];
        this.totalTips = 0;
        this.save();
    }
    
    // Save results to localStorage
    private save(): void {
        if(typeof window !== "undefined") {
            const payload: StoredData = {
                results: this.results,
                totalTips: this.totalTips,
            };
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        }
    }
}