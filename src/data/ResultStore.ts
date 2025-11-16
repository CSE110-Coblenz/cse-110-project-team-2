import { Order } from "../types";
import type { OrderResult } from "./OrderResult";

const STORAGE_KEY = "slice_by_slice_order_results";

export class ResultStore {
    // In-memory storage of results
    private results: OrderResult[] = [];

    constructor() {
        // Load existing results from localStorage
        if(typeof window !== "undefined") {
            const storedResults = window.localStorage.getItem(STORAGE_KEY);
            if (storedResults) {
                try {
                    this.results = JSON.parse(storedResults) as OrderResult[];
                } catch {
                    this.results = [];
                }
            }
        }
    }

    // Add a new order result
    add(result: OrderResult): void {
        this.results.push(result);
        this.save();
    }

    // Retrieve all stored results
    getAll(): OrderResult[] {
        return this.results;
    }
    
    // Clear all stored results
    clear(): void {
        this.results = [];
        this.save();
    }
    
    // Save results to localStorage
    private save(): void {
        if(typeof window !== "undefined") {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.results));
        }
    }
}