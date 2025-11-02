import { ScreenController } from "../../types";
import type { ScreenSwitcher } from "../../types";
import { MenuScreenView } from "./MenuScreenView";
import { AudioManager } from "../../audio/AudioManager";


/**
 * MenuScreenController - Handles menu interactions
 */
export class MenuScreenController extends ScreenController {
    private view: MenuScreenView;
    private screenSwitcher: ScreenSwitcher;
    private audio: AudioManager;

    constructor(screenSwitcher: ScreenSwitcher) {
        super();
        this.screenSwitcher = screenSwitcher;
        this.audio = new AudioManager("/audio/pizza-299710.mp3", 0.5);
        this.view = new MenuScreenView(
                                    () => this.handleStartClick(),
                                    (musicOn: boolean) => this.audio.setMusicEnabled(musicOn),
                                    () => this.handleTutorialClick()
                                    );

        window.addEventListener("pointerdown", () => this.audio.musicStarted(), { once: true });
    }
    

    private handleStartClick(): void {
        //johnny: go to game screen for now (should go to difficulty/tutorial)
        this.screenSwitcher.switchToScreen({ type: "game" });
    }

    private handleTutorialClick() {
        console.log("switch to tutorial");
        this.screenSwitcher.switchToScreen({ type: "tutorial"});
    }

    getView(): MenuScreenView {
        return this.view;
    }
}
