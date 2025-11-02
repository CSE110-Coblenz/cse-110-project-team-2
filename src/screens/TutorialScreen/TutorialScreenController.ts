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
        () => this.handlePlayClick(),
        () => this.handleWatchTutorialClick()
        );
    }

    private handlePlayClick() {
        //goes to game menu
        this.screenSwitcher.switchToScreen({ type: "game" });
    }

    private handleWatchTutorialClick() {
        // Placeholder- no demo for now
        // this.screenSwitcher.switchToScreen({ type: "tutorial" });
    }

    getView() {
        return this.view;
    }
}
