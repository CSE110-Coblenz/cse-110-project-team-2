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

        this.group.add(bg, title, startButtonGroup);
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
