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

    startGame(): void {
        this.view.show();
    }
}
