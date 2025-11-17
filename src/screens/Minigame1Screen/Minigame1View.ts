import Konva from "konva";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants";
import { View } from "../../types";  

export class Minigame1View implements View {
    private group: Konva.Group;

    // controller will set this to go to Minigaem 2
    public onGoToMinigame2: () => void = () => {};

    constructor() {
        this.group = new Konva.Group({ visible: false, listening: true });

        // Background
        this.group.add(new Konva.Rect({
            x: 0,
            y: 0,
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            fill: "#fde68a", 
        }));

        // Title
        this.group.add(new Konva.Text({
            x: 40,
            y: 40,
            text: "Minigame 1 Screen",
            fontSize: 32,
            fontStyle: "bold",
            fill: "black",
        }));

        // Button to go to Minigame 2
        const minigame2Group = new Konva.Group({
            x: STAGE_WIDTH / 2 - 60,
            y: STAGE_HEIGHT / 2 - 20,
            listening: true,
        });

        const minigame2Btn = new Konva.Rect({
            x: 0,
            y: 0,
            width: 120,
            height: 40,
            fill: "#e5e7eb",
            stroke: "black",
            strokeWidth: 2,
            cornerRadius: 8,
        });

        const minigame2Text = new Konva.Text({
            x: 10,
            y: 8,
            text: "Minigame 2",
            fontSize: 16,
            fill: "black",
        });      
        minigame2Group.add(minigame2Btn, minigame2Text);
        
        // click event → goes to minigame 2 screen
        minigame2Group.on("click", () => this.onGoToMinigame2());
        minigame2Group.on("mouseenter", () => document.body.style.cursor = "pointer");
        minigame2Group.on("mouseleave", () => document.body.style.cursor = "default");
        this.group.add(minigame2Group);
    }

    getGroup(): Konva.Group {
        return this.group;
    }

    show(): void {
        this.group.visible(true);
        this.group.getLayer()?.batchDraw();
    }

    hide(): void {
        this.group.visible(false);
        this.group.getLayer()?.batchDraw();
    }
}

