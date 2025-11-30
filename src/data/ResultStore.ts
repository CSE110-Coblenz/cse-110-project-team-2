import { Order } from "../types";
import type { OrderResult } from "./OrderResult";

const STORAGE_KEY = "slice_by_slice_order_results";
const SESSION_FLAG = "slice_by_slice_session_active";

export class ResultStore {
    // In-memory storage of results
    private results: OrderResult[] = [];

    constructor() {
        if(typeof window !== "undefined") {
            // === Detect tab close using sessionStorage ===
            const hadSession = !!sessionStorage.getItem(SESSION_FLAG);

            // If sessionStorage missing -> previous tab was closed -> clear results
            if(!hadSession) {
                try {
                    window.localStorage.removeItem(STORAGE_KEY);
                } catch (e) {
                    console.error("Failed to clear stored results on new session:", e);
                }
            }

            // Mark session as active
            sessionStorage.setItem(SESSION_FLAG, "1");

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