import { ScreenController, ScreenSwitcher } from "../../types";
import { Minigame1View } from "./Minigame1View";
import { AudioManager } from "../../audio/AudioManager";
import { ResultStore } from "../../data/ResultStore";
import type { OrderResult } from "../../data/OrderResult";
import { getScreenShotResults, pickRandomPair, pickRandomTopping, evaluateChoice, Minigame1Choice } from "./Minigame1Model";

export class Minigame1Controller extends ScreenController {
    private view: Minigame1View

    constructor(private screenSwitcher: any, private audio: AudioManager, private resultStore: ResultStore) {  
        super();
        // Create the view and wire up its built-in Back + Instructions buttons
        this.view = new Minigame1View(
            () => this.handleBackToMenuClick(), // callback for Back button
            () => this.handleInstructionsClick() // callback for Instructions button
        );

        // When the player finishes the minigame and wants to go to Minigame 2.
        this.view.onGoToMinigame2 = () => {
            this.screenSwitcher.switchToScreen({ type: "minigame2" });
        };

        // When the Back button should return to the main game screen.
        this.view.onBackToGame = () => {
            this.screenSwitcher.switchToScreen({ type: "game" });
        }

    }

    getView(): Minigame1View {
        return this.view;
    }

    // Switches back to the menu screen.
    private handleBackToMenuClick(): void {
        this.screenSwitcher.switchToScreen({ type: "menu" });
      }
    
    // Switches to the tutorial screen.
    private handleInstructionsClick(): void {
        this.screenSwitcher.switchToScreen({ type: "tutorial" });
    }

    // Called when the screen becomes active.
    show(): void {
        this.view.show();
        this.audio.musicStarted(); // Starts minigame music
    }

    // Called when switching away from this screen.
    hide(): void {
        this.view.hide();
    }   

    // Starts the minigame.
    startGame(): void {
        // Get all stored results
        const allResults = this.resultStore.getAll()

        // Only keep results that:
        // - have screenshots
        // - were orders completed successfully
        // - have topping counts available
        const screenShotResults: OrderResult[] = getScreenShotResults(allResults);

        // If fewer than 2 results exist, cannot play minigame, show message. (Potentially removed in final version)
        if (allResults.length < 2) {
            this.view.showMessage("Not enough completed orders for today to play this minigame.");
            this.show();
            return;
        }

        // Pool of valid entries for the minigame.
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

            // Build details string displayed in the popup
            let details = `A: ${aCount}, B: ${bCount}`;
            // Tip logic - award $2 tip for correct choice
            if (isCorrect) {
                this.resultStore.addTips(2);
                details += " (earned $2 tip)";
            } else {
                details += " (no tip earned)";
            }
            
            // Shows minigame result popup in the view
            this.view.showResult(isCorrect, details);

            // after showing result, provide a Back button to return to game.
            this.view.onBackToGame = () => { this.startGame();
        };
    });
        // Show the view.
        this.show();
    }
}