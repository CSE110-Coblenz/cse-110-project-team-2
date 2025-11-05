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
        // Switch to the game screen with the selected difficulty
        this.screenSwitcher.switchToScreen({ 
            type: "game",
            difficulty: difficulty
        });
    }

    getView(): DifficultyScreenView {
        return this.view;
    }
}