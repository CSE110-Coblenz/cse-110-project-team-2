import Konva from "konva";
import type { View } from "../../types";
import { STAGE_WIDTH, STAGE_HEIGHT, SCREEN_BACKGROUNDS, SCREEN_OVERLAY, TITLE_COLOR } from "../../constants";
import { FONTS } from "../../fonts";
import { createMenuSettingsPopup } from "../../BackButtonPopup";

export type Difficulty = "proper" | "improper" | "mixed";

/**
 * DifficultyScreenView - Renders the difficulty selection screen
 * proper: only proper fractions (numerator < denominator)
 * improper: only improper fractions (numerator > denominator)
 * mixed: combination of both proper and improper fractions
 */
export class DifficultyScreenView implements View {
    private group: Konva.Group;
    private settingsPopup: Konva.Group | null = null;

    constructor(onDifficultySelect: (difficulty: Difficulty) => void,
                onBackToMenuClick: () => void,
                onInstructionsClick: () => void
                ) {
        this.group = new Konva.Group({ visible: true });

        // background
        const bgImage = new Image();
        //bgImage.src = "/background-checkers.jpg";
        bgImage.src = SCREEN_BACKGROUNDS.MENU;
        
        
        const bg = new Konva.Image();
        bg.x(0);
        bg.y(0);
        bg.width(STAGE_WIDTH);
        bg.height(STAGE_HEIGHT);
        bg.listening(false);

        bgImage.onload = () => {
            bg.image(bgImage);
            bg.moveToBottom()
            this.group.getLayer()?.batchDraw();
        }
        // Make the background softer
        const overlay = new Konva.Rect({
            x: 0,
            y: 0,
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            //fill: "rgba(228,202,192,0.50)",
            fill: SCREEN_OVERLAY.COLOR,
            listening: false,
        });

        // Title text
        const title = new Konva.Text({
            x: STAGE_WIDTH / 2,
            y: 120,
            text: "Select Difficulty",
            fontSize: 80,
            fontFamily: FONTS.HEADER,
            fill: TITLE_COLOR,
            align: "center"
        });
        title.offsetX(title.width() / 2);

        const titleOutline = new Konva.Text({
            x: STAGE_WIDTH / 2,
            y: 120,
            text: "Select Difficulty",
            fontSize: 80,
            fontFamily: FONTS.HEADER,
            fill: "transparent",
            stroke: "#4B1F0E",           
            strokeWidth: 3,              
            align: "center",
        })
        titleOutline.offsetX(titleOutline.width() / 2);
        

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
                x: STAGE_WIDTH / 2 - 125,
                y: config.y,
                width: 300,
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
                fontFamily: FONTS.SUBHEADER,
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
                fontFamily: FONTS.BUTTON,
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

        /*
        // Back to main menu button (top-right corner)
        const backGroup = new Konva.Group({ x: STAGE_WIDTH - 180, y: 20 });

        const backBtn = new Konva.Rect({
            width: 160,
            height: 50,
            fill: "#d84315",
            cornerRadius: 8,
            stroke: "#b71c1c",
            strokeWidth: 2,
        });

        const backText = new Konva.Text({
            x: 80,
            y: 25,
            text: "Back to Menu",
            fontFamily: FONTS.BUTTON,
            fontSize: 16,
            fill: "white",
        });
        backText.offsetX(backText.width() / 2);
        backText.offsetY(backText.height() / 2);

        backGroup.add(backBtn, backText);

        // click event → goes back to menu
        backGroup.on("click", onBackToMenuClick);


        // Add all elements to the main group
        this.group.add(bg, overlay, title, titleOutline, ...buttons, backGroup);
        */
       // SETTINGS BUTTON (top-right corner)
        const settingsGroup = new Konva.Group({ x: STAGE_WIDTH - 180, y: 20 });

        const settingsBtn = new Konva.Rect({
            width: 160,
            height: 50,
            fill: "#d84315",
            cornerRadius: 8,
            stroke: "#b71c1c",
            strokeWidth: 2,
        });

        const settingsText = new Konva.Text({
            x: 80,
            y: 25,
            text: "SETTINGS",
            fontFamily: FONTS.BUTTON,
            fontSize: 16,
            fill: "white",
        });
        settingsText.offsetX(settingsText.width() / 2);
        settingsText.offsetY(settingsText.height() / 2);

        settingsGroup.add(settingsBtn, settingsText);

        // clicking opens/closes popup
        settingsGroup.on("click tap", () => {
            if (this.settingsPopup) {
                this.settingsPopup.destroy();
                this.settingsPopup = null;
                this.group.getLayer()?.draw();
                return;
            }

            this.settingsPopup = createMenuSettingsPopup({
                onBackToMenu: onBackToMenuClick,
                onInstructions: onInstructionsClick,
                onClose: () => {
                    this.settingsPopup = null;
                    this.group.getLayer()?.draw();
                },
            });

            this.group.add(this.settingsPopup);
            this.group.getLayer()?.draw();
        });

        // Add all elements to the main group
        this.group.add(bg, overlay, title, titleOutline, ...buttons, settingsGroup);

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