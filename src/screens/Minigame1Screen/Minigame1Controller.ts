import { ScreenController, ScreenSwitcher } from "../../types";
import { Minigame1View } from "./Minigame1View";
import { AudioManager } from "../../audio/AudioManager";
import { ResultStore } from "../../data/ResultStore";
import type { OrderResult } from "../../data/OrderResult";
import { getScreenShotResults, pickRandomPair, pickRandomTopping, evaluateChoice, Minigame1Choice } from "./Minigame1Model";

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
        const screenShotResults: OrderResult[] = getScreenShotResults(allResults);

        // NOTE: This won't be needed in the actual game because the player won't be able to go to the minigame manually. I think.
        if (allResults.length < 2) {
            this.view.showMessage("Not enough completed orders for today to play this minigame.");
            this.show();
            return;
        }

        const pool = screenShotResults;

        // pick two random distinct orders
        const { a, b } = pickRandomPair(pool);

        // pick a random topping to ask about
        const topping = pickRandomTopping();

        // render pair and evaluate player's choice
        this.view.renderPair(a, b, topping, (choice: "A" | "B" | "Equivalent") => {
            const { isCorrect, aCount, bCount } = evaluateChoice(
                a,
                b,
                topping,
                choice as Minigame1Choice
            );

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