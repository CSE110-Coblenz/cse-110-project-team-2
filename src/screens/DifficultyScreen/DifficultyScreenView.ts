import Konva from "konva";
import type { View } from "../../types";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants";

export type Difficulty = "proper" | "improper" | "mixed";

/**
 * DifficultyScreenView - Renders the difficulty selection screen
 * proper: only proper fractions (numerator < denominator)
 * improper: only improper fractions (numerator > denominator)
 * mixed: combination of both proper and improper fractions
 */
export class DifficultyScreenView implements View {
    private group: Konva.Group;

    constructor(onDifficultySelect: (difficulty: Difficulty) => void) {
        this.group = new Konva.Group({ visible: true });

        // Background
        const bg = new Konva.Rect({
            x: 0,
            y: 0,
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            fill: "#ffe0b2"
        });

        // Title text
        const title = new Konva.Text({
            x: STAGE_WIDTH / 2,
            y: 120,
            text: "Select Difficulty",
            fontSize: 48,
            fontFamily: "Arial",
            fill: "#6d4c41",
            align: "center"
        });
        title.offsetX(title.width() / 2);

        // Create difficulty level buttons
        const buttonConfigs: Array<{difficulty: Difficulty; y: number; color: string; strokeColor: string; example: string; description: string}> = [
            { 
                difficulty: "proper", 
                y: 240, 
                color: "#66bb6a", 
                strokeColor: "#2e7d32", 
                example: "2/3, 3/4", 
                description: "Only proper fractions"
            },
            { 
                difficulty: "improper", 
                y: 320, 
                color: "#ffa726", 
                strokeColor: "#ef6c00", 
                example: "5/3, 7/4", 
                description: "Only improper fractions"
            },
            { 
                difficulty: "mixed", 
                y: 400, 
                color: "#ef5350", 
                strokeColor: "#c62828", 
                example: "2/3, 5/3", 
                description: "Mix of proper and improper"
            }
        ];

        const buttons = buttonConfigs.map(config => {
            const buttonGroup = new Konva.Group();
            
            const button = new Konva.Rect({
                x: STAGE_WIDTH / 2 - 90,
                y: config.y,
                width: 180,
                height: 56,
                fill: config.color,
                cornerRadius: 8,
                stroke: config.strokeColor,
                strokeWidth: 2
            });

            // Main label
            const text = new Konva.Text({
                x: STAGE_WIDTH / 2,
                y: config.y + 8,
                text: config.difficulty.charAt(0).toUpperCase() + config.difficulty.slice(1),
                fontSize: 22,
                fontFamily: "Arial",
                fill: "white",
                align: "center"
            });
            text.offsetX(text.width() / 2);

            // Description and examples
            const description = new Konva.Text({
                x: STAGE_WIDTH / 2,
                y: config.y + 32,
                text: `${config.description} (${config.example})`,
                fontSize: 14,
                fontFamily: "Arial",
                fill: "white",
                align: "center"
            });
            description.offsetX(description.width() / 2);

            buttonGroup.add(button);
            buttonGroup.add(text);
            buttonGroup.add(description);
            
            // Add hover effect
            buttonGroup.on("mouseenter", () => {
                document.body.style.cursor = "pointer";
                button.strokeWidth(3);
                this.group.getLayer()?.draw();
            });
            
            buttonGroup.on("mouseleave", () => {
                document.body.style.cursor = "default";
                button.strokeWidth(2);
                this.group.getLayer()?.draw();
            });

            // Add click handler
            buttonGroup.on("click", () => onDifficultySelect(config.difficulty));

            return buttonGroup;
        });

        // Add all elements to the main group
        this.group.add(bg, title, ...buttons);
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