import { Minigame2Model } from "./Minigame2Model";
import { Minigame2View } from "./Minigame2View";
import { ScreenController, ScreenSwitcher } from "../../types";

export class Minigame2Controller extends ScreenController {
    private model: Minigame2Model;
    private view: Minigame2View;
    private switcher?: ScreenSwitcher; // optional if running standalone
    private gameTimer: number | null = null;

    constructor(switcher?: ScreenSwitcher) {
        super();
        this.model = new Minigame2Model();
        this.view = new Minigame2View();
        this.switcher = switcher;

        // // Connect UI events
        // this.view.onAddObstacle(() => this.handleAddObstacle());
    }

    private handleAddObstacle(): void {
        this.model.increaseObstacleCount();
        this.view.updateObstacleCount(this.model.getObstacleCount());

        // transition to next screen
        if (this.model.getObstacleCount() >= 10 && this.switcher) {
        this.switcher.switchToScreen({ type: "minigame2" }); // placeholder
        }
    }

    private startTimer(): void {
        let timeRemaining = 30;
        this.gameTimer = window.setInterval(() => {
            timeRemaining--;
            this.view.updateTimer(timeRemaining);
            if (timeRemaining <= 0) {
                this.endGame();
            }

        }, 1000);
    }   

    private stopTimer(): void {
        if (this.gameTimer !== null) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }

    }

    getView(): Minigame2View {
        return this.view;
    }

    startGame(): void {
        this.model.reset();

        // set up initial view state
        this.view.updateObstacleCount(0);
        this.view.updateTimer(30);

        this.view.show();
        this.startTimer();
    }

    endGame(): void {
        this.stopTimer();
        this.view.hide();
        // future work: switch screens or show results
        // this.screenSwitcher?.switchToScreen({ type: "minigame2" }); // placeholder
    }
}