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

    constructor(screenSwitcher: ScreenSwitcher, audio:AudioManager) {
        super();
        this.screenSwitcher = screenSwitcher;
        //this.audio = new AudioManager("/audio/pizza-299710.mp3", 0.5);
        this.audio = audio;

        //sfx audio effects
        //this.audio.registerSfx("splash", "/audio/water-splash.mp3" );
        this.audio.registerSfx("start", "/audio/game-start.mp3");

        this.view = new MenuScreenView(
                                    () => {
                                        this.audio.playSfx("start");
                                        this.handleStartClick();
                                    },
                                    (musicOn: boolean) => this.audio.setMusicEnabled(musicOn),
                                    (sfxOn: boolean)  => this.audio.setSfxEnabled(sfxOn),
                                    () => this.handleTutorialClick()
                               
                                    );

        window.addEventListener("pointerdown", () => this.audio.musicStarted(), { once: true });
    }
    

    private handleStartClick(): void {
        // Go to difficulty selection screen
        this.screenSwitcher.switchToScreen({ type: "difficulty" });
        //this.screenSwitcher.switchToScreen({ type: "minigame2"});
    }

    private handleTutorialClick() {
        console.log("switch to tutorial");
        this.screenSwitcher.switchToScreen({ type: "tutorial"});
    }

    getView(): MenuScreenView {
        return this.view;
    }
}
