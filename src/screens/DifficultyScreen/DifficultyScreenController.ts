import { ScreenController } from "../../types";
import type { ScreenSwitcher } from "../../types";
import { DifficultyScreenView, type Difficulty } from "./DifficultyScreenView";


export class DifficultyScreenController extends ScreenController {
    private view: DifficultyScreenView;
    private screenSwitcher: ScreenSwitcher;

    constructor(screenSwitcher: ScreenSwitcher) {
        super();
        this.screenSwitcher = screenSwitcher;
        this.view = new DifficultyScreenView(
            (difficulty) => this.handleDifficultySelect(difficulty),
            () => this.handleBackToMenuClick(),
            () => this.handleInstructionsClick()
            );
    }

    private handleDifficultySelect(difficulty: Difficulty): void {
        if (difficulty === "proper") {
            this.screenSwitcher.switchToScreen({ type: "order", mode: "proper" });
            return;
        }

        if (difficulty === "improper") {
            this.screenSwitcher.switchToScreen({ type: "order", mode: "improper" });
            return;
        }
        this.screenSwitcher.switchToScreen({ type: "order", mode: "mixed" });
    }

    private handleBackToMenuClick() {
        this.screenSwitcher.switchToScreen({ type: "menu" });
    }   

    private handleInstructionsClick(): void {
        this.screenSwitcher.switchToScreen({ type: "tutorial"});
    }

    getView(): DifficultyScreenView {
        return this.view;
    }
}