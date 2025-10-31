import { ScreenController } from "../../types";
import type { ScreenSwitcher } from "../../types";
import { GameScreenView } from "./GameScreenView";

export class GameScreenController extends ScreenController {
    private view: GameScreenView;

    constructor(_screenSwitcher: ScreenSwitcher) {
        super();
        this.view = new GameScreenView();
    }

    show(): void {
        this.view.show();
    }

    hide(): void {
        this.view.hide();
    }

    getView(): GameScreenView {
        return this.view;
    }

    startGame(difficulty: "proper" | "improper" | "mixed"): void {
        // Configure game based on difficulty level:
        // proper: generates only proper fractions (numerator < denominator)
        // improper: generates only improper fractions (numerator > denominator)
        // mixed: generates both proper and improper fractions
        console.log(`Starting game with ${difficulty} difficulty`);
        this.view.show();
    }
}
