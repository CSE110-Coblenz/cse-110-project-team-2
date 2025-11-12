import { ScreenController } from "../../types";
import type { ScreenSwitcher } from "../../types";
import { TutorialScreenView } from "./TutorialScreenView";

export class TutorialScreenController extends ScreenController {
    private view: TutorialScreenView;
    private screenSwitcher: ScreenSwitcher;

    constructor(screenSwitcher: ScreenSwitcher) {
        super();
        this.screenSwitcher = screenSwitcher;

        this.view = new TutorialScreenView(
        () => this.handleBackToMenuClick(),
        () => this.handleWatchTutorialClick()
        );
    }

    private handlePlayClick() {
        // go to order screen
        this.screenSwitcher.switchToScreen({ type: "order" });
    }
    private handleBackToMenuClick() {
        //goes to difficulty selection first
        this.screenSwitcher.switchToScreen({ type: "menu" });
    }

    private handleWatchTutorialClick() {
        // Placeholder- no demo for now
        // this.screenSwitcher.switchToScreen({ type: "tutorial" });
    }

    getView() {
        return this.view;
    }
}
