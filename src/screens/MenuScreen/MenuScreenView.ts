import Konva from "konva";
import type { View } from "../../types";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants";

/**
 * MenuScreenView - Renders the menu screen
 */
export class MenuScreenView implements View {
    private group: Konva.Group;

    constructor(onStartClick: () => void) {
        this.group = new Konva.Group({ visible: true });

        // Background
        const bg = new Konva.Rect({ x: 0, y: 0, width: STAGE_WIDTH, height: STAGE_HEIGHT, fill: "#ffe0b2" });

        // Title text
        const title = new Konva.Text({
            x: STAGE_WIDTH / 2,
            y: 120,
            text: "Slice by Slice",
            fontSize: 48,
            fontFamily: "Arial",
            fill: "#6d4c41",
            align: "center",
        });
        title.offsetX(title.width() / 2);

        const startButtonGroup = new Konva.Group();
        const startButton = new Konva.Rect({
            x: STAGE_WIDTH / 2 - 90,
            y: 260,
            width: 180,
            height: 56,
            fill: "#d84315",
            cornerRadius: 8,
            stroke: "#b71c1c",
            strokeWidth: 2,
        });

        const startText = new Konva.Text({ x: STAGE_WIDTH / 2, y: 278, text: "Start", fontSize: 22, fill: "white" });
        startText.offsetX(startText.width() / 2);

        startButtonGroup.add(startButton);
        startButtonGroup.add(startText);
        startButtonGroup.on("click", onStartClick);

        const musicButtonGroup = new Konva.Group();
        const musicButton = new Konva.Circle({
            x: STAGE_WIDTH - 50,  // Position in bottom-right corner
            y: STAGE_HEIGHT - 50,
            radius: 25,          // Smaller, more reasonable size
            fill: "#d84315",
            stroke: "#b71c1c",
            strokeWidth: 2
        });
        const musicLabel = new Konva.Text({
            x: STAGE_WIDTH - 50,  // Same x as the circle center
            y: STAGE_HEIGHT - 50, // Same y as the circle center
            fontSize: 20,
            fill: "white",
            text: "♪",
            align: "center"
        });
        // Center the label within the circle
        musicLabel.offsetX(musicLabel.width() / 2);
        musicLabel.offsetY(musicLabel.height() / 2);
        
        musicButtonGroup.add(musicButton);
        musicButtonGroup.add(musicLabel);
        musicButtonGroup.on("click", onStartClick);

        this.group.add(bg, title, startButtonGroup, musicButtonGroup);
    }

    show(): void {
        this.group.visible(true);
        this.group.getLayer()?.draw();
    }

    hide(): void {
        this.group.visible(false);
        this.group.getLayer()?.draw();
    }

    getGroup(): Konva.Group {
        return this.group;
    }
}
