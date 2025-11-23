import Konva from "konva";
import { Minigame2Model } from "./Minigame2Model";
import { Minigame2View } from "./Minigame2View";
import { ScreenController, ScreenSwitcher } from "../../types";
import { MINIGAME2_DURATION } from "../../constants";
import { AudioManager } from "../../audio/AudioManager";
import { ResultStore } from "../../data/ResultStore";
import type { OrderResult } from "../../data/OrderResult";

export class Minigame2Controller extends ScreenController {
    private model: Minigame2Model;
    private view: Minigame2View;
    private switcher?: ScreenSwitcher; // optional if running standalone
    private gameTimer: number | null = null;
    private movementDirection: "up" | "down" | null = null;
    private movementSpeed = 2; // pixels per frame
    private movementAnimation: Konva.Animation | null = null;
    private audio: AudioManager; // Uses shared audio manager
    private resultStore: ResultStore; // Stores game results


    constructor(switcher: ScreenSwitcher, audio: AudioManager, resultStore: ResultStore) {
        super();
        this.model = new Minigame2Model();
        this.view = new Minigame2View();
        this.switcher = switcher;
        this.audio = audio;
        this.resultStore = resultStore;

        //this.splashSound = new AudioManager("/audio/water-splash.mp3", 0.3, false);
        this.audio.registerSfx("splash", "/audio/water-splash.mp3");
        this.view.setOnPuddleHit(() => {
            this.handleAddObstacle();
            this.audio.playSfx("splash");
        });
        this.view.setOnResultsButtonClick(() => this.handleResultsButtonClick());
    }

    private handleAddObstacle(): void {
        this.model.increaseObstacleCount();
        this.view.updateObstacleCount(this.model.getObstacleCount());
    }

    private handleResultsButtonClick(): void {
        this.view.clearSummary();
        this.switcher?.switchToScreen({ type: "result", score: this.model.tip });
    }

    private setupInput(): void {
        window.addEventListener("keydown", (e) => {
            if (e.key === "ArrowUp") {
                this.movementDirection = "up";
            } else if (e.key === "ArrowDown") {
                this.movementDirection = "down";
            }
        });

        window.addEventListener("keyup", (e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                // stop movement if needed
                this.movementDirection = null;
            }
        });

        this.movementAnimation = new Konva.Animation(() => {
            if (this.movementDirection === "up") {
                this.view.moveCarUp();
            } else if (this.movementDirection === "down") {
                this.view.moveCarDown();
            }
        }, this.view.getGroup().getLayer());

        this.movementAnimation.start();
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

        // clear previous summary display if any
        this.view.clearSummary();

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
        this.movementAnimation?.stop();
        
        this.model.calculateTip();
        const tip = this.model.tip;
        this.resultStore.addTips(tip);

        this.view.showSummary(this.model.getObstacleCount(), this.model.tip, this.model.review);
    }
}