import { ScreenController, ScreenSwitcher } from "../../types";
import { Minigame1View } from "./Minigame1View";
import { AudioManager } from "../../audio/AudioManager";
import { ResultStore } from "../../data/ResultStore";
import type { OrderResult } from "../../data/OrderResult";
import { TOPPINGS, ToppingType } from "../../constants";

export class Minigame1Controller extends ScreenController {
    private view: Minigame1View

    constructor(private screenSwitcher: ScreenSwitcher, private audio: AudioManager, private resultStore: ResultStore) {  
        super();
        this.view = new Minigame1View(
            () => this.handleBackToMenuClick(),
            () => this.handleInstructionsClick()
        );

        this.view.onGoToMinigame2 = () => {
            this.screenSwitcher.switchToScreen({ type: "minigame2" });
        };

        this.view.onBackToGame = () => {
            this.screenSwitcher.switchToScreen({ type: "game" });
        }

    }

    getView(): Minigame1View {
        return this.view;
    }

    private handleBackToMenuClick(): void {
        this.screenSwitcher.switchToScreen({ type: "menu" });
      }
    
    private handleInstructionsClick(): void {
        this.screenSwitcher.switchToScreen({ type: "tutorial" });
    }

    show(): void {
        this.view.show();
        this.audio.musicStarted();
    }

    hide(): void {
        this.view.hide();
    }   

    startGame(): void {
        // Get all stored results
        const allResults = this.resultStore.getAll()

        // Only keep results that:
        // - have screenshots
        // - were orders completed successfully
        // - have topping counts available
        const screenShotResults: OrderResult[] = allResults.filter(
            (r: OrderResult) => 
                !!r.screenshotDataUrl &&
                r.success &&
                !!r.order &&
                r.order.toppingsCounts
        );

        // NOTE: This won't be needed in the actual game because the player won't be able to go to the minigame manually. I think.
        if (allResults.length < 2) {
            this.view.showMessage("Not enough completed orders for today to play this minigame.");
            this.show();
            return;
        }

        const pool = screenShotResults;

        // pick two random distinct orders
        const aIndex = Math.floor(Math.random() * pool.length);
        let bIndex = Math.floor(Math.random() * pool.length);
        while (bIndex === aIndex && pool.length > 1) {
            bIndex = Math.floor(Math.random() * pool.length);
        }

        const a = pool[aIndex];
        const b = pool[bIndex];

        // pick a random topping to ask about
        const topping = TOPPINGS[Math.floor(Math.random() * TOPPINGS.length)] as ToppingType;

        // render pair and evaluate player's choice
        this.view.renderPair(a, b, topping, (choice: "A" | "B" | "Equivalent") => {
            const aOrder = a.order!;
            const bOrder = b.order!;

            const aCount = aOrder.toppingsCounts?.[topping] ?? 0;
            const bCount = bOrder.toppingsCounts?.[topping] ?? 0;

            const aTotalSlices = (a.currentPizzaNumber ?? 1) * (a.slicesUsed ?? 1);
            const bTotalSlices = (b.currentPizzaNumber ?? 1) * (b.slicesUsed ?? 1);

            let correct: "A" | "B" | "Equivalent" = "Equivalent";

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

            // Tip logic 
            let details = `A: ${aCount}, B: ${bCount}`;
            if (isCorrect) {
                this.resultStore.addTips(2);
                details += " (earned $2 tip)";
            } else {
                details += " (no tip earned)";
            }
            
            // Shows minigame result 
            this.view.showResult(isCorrect, details);

            // after showing result, provide a Back button to return to menu
            this.view.onBackToGame = () => { this.startGame();
        };
    });

        this.show();
    }
}