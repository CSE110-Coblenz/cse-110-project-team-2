import { ScreenController, ScreenSwitcher } from "../../types";
import { Minigame1View } from "./Minigame1View";
import { AudioManager } from "../../audio/AudioManager";

export class Minigame1Controller extends ScreenController {
    private view: Minigame1View

    constructor(private screenSwitcher: any, private audio: AudioManager) {  
        super();
        this.view = new Minigame1View(
            () => this.handleBackToMenuClick(),
            () => this.handleInstructionsClick()
        );

        this.view.onGoToMinigame2 = () => {
            this.screenSwitcher.switchToScreen({ type: "minigame2" });
        };

        this.view.onBackToGame = () => {
            this.screenSwitcher.switchToScreen({ type: "game" });
        }

    }

    getView(): Minigame1View {
        return this.view;
    }

    private handleBackToMenuClick(): void {
        this.screenSwitcher.switchToScreen({ type: "menu" });
      }
    
    private handleInstructionsClick(): void {
        this.screenSwitcher.switchToScreen({ type: "tutorial" });
    }

    show(): void {
        this.view.show();
        this.audio.musicStarted();
    }

    hide(): void {
        this.view.hide();
    }   
    startGame(): void {
        this.show();
    }
}