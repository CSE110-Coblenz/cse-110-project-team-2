import { Minigame2Model } from "./Minigame2Model";
import { Minigame2View } from "./Minigame2View";
import { ScreenController, ScreenSwitcher } from "../../types";
import { MINIGAME2_DURATION } from "../../constants";

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

        this.view.setOnPuddleHit(() => this.handleAddObstacle());
    }

    private handleAddObstacle(): void {
        this.model.increaseObstacleCount();
        this.view.updateObstacleCount(this.model.getObstacleCount());
    }

    private setupInput(): void {
        window.addEventListener("keydown", (e) => {
        if (e.key === "ArrowUp") {
            this.view.moveCarUp();
        } else if (e.key === "ArrowDown") {
            this.view.moveCarDown();
        }
        });
    }

    private startTimer(): void {
        let timeRemaining = MINIGAME2_DURATION;
        this.gameTimer = window.setInterval(() => {
            timeRemaining--;
            this.view.updateTimer(timeRemaining);
            if (timeRemaining <= 0) {
                this.endGame(); // can be a different method later !!
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
        this.view.updateTimer(MINIGAME2_DURATION);

        this.view.show();
        this.startTimer();
        this.setupInput();
    }

    endGame(): void {
        this.stopTimer();
        this.view.stopAnimation();
        // this.view.hide();

        // future work: switch screens or show results
        // this.screenSwitcher?.switchToScreen({ type: "minigame2" }); // placeholder
    }
}