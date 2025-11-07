import { ScreenController } from "../../types";
import type { ScreenSwitcher } from "../../types";
import { DifficultyScreenView, type Difficulty } from "./DifficultyScreenView";

export class DifficultyScreenController extends ScreenController {
    private view: DifficultyScreenView;
    private screenSwitcher: ScreenSwitcher;

    constructor(screenSwitcher: ScreenSwitcher) {
        super();
        this.screenSwitcher = screenSwitcher;
        this.view = new DifficultyScreenView((difficulty) => this.handleDifficultySelect(difficulty));
    }

    private handleDifficultySelect(difficulty: Difficulty): void {
        // If the user chose 'proper' difficulty, go to the Order screen first
        // Johnny (todo): we need to implement different behavior for proper vs improper/mixed
        if (difficulty === "proper") {
            this.screenSwitcher.switchToScreen({ type: "order" });
            return;
        }
        // For improper and mixed, go directly to the game screen for now
        this.screenSwitcher.switchToScreen({ 
            type: "game",
            difficulty: difficulty
        });
    }

    getView(): DifficultyScreenView {
        return this.view;
    }
}