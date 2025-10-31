import { ScreenController } from "../../types";
import type { ScreenSwitcher } from "../../types";
import { MenuScreenView } from "./MenuScreenView";

/**
 * MenuScreenController - Handles menu interactions
 */
export class MenuScreenController extends ScreenController {
    private view: MenuScreenView;
    private screenSwitcher: ScreenSwitcher;

    constructor(screenSwitcher: ScreenSwitcher) {
        super();
        this.screenSwitcher = screenSwitcher;
    this.view = new MenuScreenView(() => this.handleStartClick());
    }

    private handleStartClick(): void {
        //johnny: go to game screen for now (should go to difficulty/tutorial)
        this.screenSwitcher.switchToScreen({ type: "game" });
    }

    getView(): MenuScreenView {
        return this.view;
    }
}
