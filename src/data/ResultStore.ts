import type { OrderResult } from "./OrderResult";

const STORAGE_KEY = "slice_by_slice_order_results";
const SESSION_FLAG = "slice_by_slice_session_active";

/**
 * Data structure for storing results and tips in localStorage
 */
type StoredData = {
    results: OrderResult[];
    totalTips: number;
};

/**
 * ResultStore manages:
 * - All order results for the current game session
 * - Total tips accumulated 
 * - Saving & loading from localStorage
 * 
 * Ensures data is cleared when the browser tab is closed (using sessionStorage). 
 */
export class ResultStore {
    // In-memory list of all saved order results.
    private results: OrderResult[] = [];
    // Running total of tips earned during the session.
    private totalTips: number = 0;

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

            // Mark session as active, reloading the page does NOT reset storage
            sessionStorage.setItem(SESSION_FLAG, "1");

            // === Load existing stored results (if available) ===
            const storedResults = window.localStorage.getItem(STORAGE_KEY);
            if (storedResults) {
                try {
                    const parsed = JSON.parse(storedResults);  

                    // Support both array-only and full object formats
                    if (Array.isArray(parsed)) {
                        // old format: just an array of results
                        this.results = parsed as OrderResult[];
                        this.totalTips = 0;
                    } else {
                        // new format: StoredData object
                        this.results = (parsed.results ??[]) as OrderResult[];
                        this.totalTips = Number(parsed.totalTips ?? 0);
                    } 
                } catch {
                    // if parsing fails, start fresh
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