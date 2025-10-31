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
        // Go to difficulty selection screen
        this.screenSwitcher.switchToScreen({ type: "difficulty" });
    }

    getView(): MenuScreenView {
        return this.view;
    }
}
