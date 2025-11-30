import Konva from "konva";
import { STAGE_WIDTH, STAGE_HEIGHT, TOPPINGS } from "../../constants";
import { View } from "../../types";
import type { OrderResult } from "../../data/OrderResult";
import { PIZZA } from "../../constants";
import { FONTS } from "../../fonts";
import { createMenuSettingsPopup } from "../../BackButtonPopup";

export class Minigame1View implements View {
    private group: Konva.Group;
    private content: Konva.Group;
    private pizzaGroup = new Konva.Group();
    // map has key of strings and value of numbers
    // map key is `${sideIndex}-${subIndex}` where sideIndex is 0 for A (left) and 1 for B (right)
    // e.g. string "0-1" refers to left side, sub-pizza 1
    private pizzaRadius: Map<string, number> = new Map();
    private settingsPopup: Konva.Group | null = null;
    
    
    // controller will set this to go to Minigame 2
    public onGoToMinigame2: () => void = () => {};
    // controller can set this after a result to navigate away
    public onBackToGame: () => void = () => {};
    public handleInstructionsClick: () => void = () => {};
    // callback set by renderPair so bases can call it when clicked
    private onChoiceCallback: (choice: "A" | "B" | "Equivalent") => void = () => {};

    constructor(
        onBackToMenuClick: () => void,
        onInstructionsClick: () => void
        ) {
            this.group = new Konva.Group({ visible: false, listening: true });
            this.drawBackground()
            this.group.add(this.pizzaGroup);

            // Title
            this.group.add(new Konva.Text({
                x: 40,
                y: 80,
                text: "Minigame 1",
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
            text: "⚙︎  |  𝓲",
            fontFamily: FONTS.BUTTON,
            fontSize: 30,
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
        this.group.add(settingsGroup);
        
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

