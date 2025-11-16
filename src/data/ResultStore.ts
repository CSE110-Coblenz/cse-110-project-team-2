import { Order } from "../types";
import type { OrderResult } from "./OrderResult";

const STORAGE_KEY = "slice_by_slice_order_results";

export class ResultStore {
    private results: OrderResult[] = [];

    constructor() {
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

    add(result: OrderResult): void {
        this.results.push(result);
        this.save();
    }

    getAll(): OrderResult[] {
        return this.results;
    }
    
    clear(): void {
        this.results = [];
        this.save();
    }

    private save(): void {
        if(typeof window !== "undefined") {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.results));
        }
    }
}