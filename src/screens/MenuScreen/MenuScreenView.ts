import Konva from "konva";
import type { View } from "../../types";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants";

/**
 * MenuScreenView - Renders the menu screen
 */
export class MenuScreenView implements View {
    private group: Konva.Group;
    
    // Popup overlay for settings; originally null
    private settingsPopup: Konva.Group | null = null; 
    private musicOn: boolean = true;

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

        // Start button  -----
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


        // Instruction Button  -----
        const instructionButtonGroup = new Konva.Group();
        const instructionButton = new Konva.Rect({
            x: STAGE_WIDTH - 200,
            y: STAGE_HEIGHT - 70,
            width: 110,
            height: 56,
            fill: "#d84315",
            cornerRadius: 8,
            stroke: "#b71c1c",
            strokeWidth: 2,
        });

        const instructionText = new Konva.Text({
            x: STAGE_WIDTH - 190,
            y: STAGE_HEIGHT - 50,
            text: "INSTRUCTIONS",
            fontsize: 22, 
            fill: "white",
        });

        instructionButtonGroup.add(instructionButton);
        instructionButtonGroup.add(instructionText);

        // Settings Button ----
        const settingButtonGroup = new Konva.Group();
        const settingButton = new Konva.Rect({
            x: STAGE_WIDTH - 350,
            y: STAGE_HEIGHT - 70,
            width: 110,
            height: 56,
            fill: "#d84315",
            cornerRadius: 8,
            stroke: "#b71c1c",
            strokeWidth: 2,
        });

        const settingText = new Konva.Text({
            x: STAGE_WIDTH - 325,
            y: STAGE_HEIGHT - 50,
            text: "SETTINGS",
            fontsize: 22, 
            fill: "white",
        });

        settingButtonGroup.add(settingButton);
        settingButtonGroup.add(settingText);

        // event handler to open teh setting popup
        settingButtonGroup.on("click", () => {
            this.showSettingsPopup(this.musicOn, 
                () => (this.settingsPopup = null), // closes callback
                () => {
                    this.musicOn = !this.musicOn; // music toggle
                    this.showSettingsPopup(this.musicOn, () => {}, () => {});
                }

            );
        });

        this.group.add(bg, title, startButtonGroup, instructionButtonGroup, settingButtonGroup);
    }


    /**
     * Settings popup window
     */
    showSettingsPopup(musicOn: boolean, onClose: () => void, onToggle: () => void) {

        // If popup already exists, destroy it
        if(this.settingsPopup){
            this.settingsPopup.destroy();
        }

        const popup = new Konva.Group({
            x: STAGE_WIDTH / 2 - 150,
            y: STAGE_HEIGHT / 2 - 100,
        });

        const popupBackground = new Konva.Rect({
            width: 300,
            height: 200,
            fill: "white",
            stroke: "black",
            cornerRadius: 8,
            shadowBlur: 10,
        });

        // Close button for the popup
        const closePopup = new Konva.Text({
            text: "X",
            x: 270,
            y: 10,
            fontSize: 20,
            fill: "black",
        });

        // Title
        const popupTitle = new Konva.Text({
            text: "SETTINGS",
            x: 110,
            y: 20,
            fontSize: 18,
            fill: "black",
            //fontStyle: "bold",
        })

        // Toggle button to turn on/off the music
        const musicToggle = new Konva.Rect({
            x: 100,
            y: 100,
            width: 100,
            height: 40,
            fill: musicOn ? "green" : "red",
            cornerRadius: 8,
        });
        const musicToggleText = new Konva.Text({
            x: 120,
            y: 110,
            text: musicOn ? "Music ON" : "Music OFF",
            fontSize: 16,
            fill: "white",
        });

        // Event handler to close the settings popup
        closePopup.on("click", () => {
            popup.destroy();
            this.group.getLayer()?.draw();
            onClose();
        });

        musicToggle.on("click", () => {
            onToggle();
        });


        popup.add(popupBackground, closePopup, popupTitle, musicToggle, musicToggleText);
        this.group.add(popup);
        this.group.getLayer()?.draw();

        this.settingsPopup = popup;

    };


    // Makes the view visible
    show(): void {
        this.group.visible(true);
        this.group.getLayer()?.draw();
    }

    // Hides this view from the screen
    hide(): void {
        this.group.visible(false);
        this.group.getLayer()?.draw();
    }

    // Lets the controller access the view's Konva Group
    getGroup(): Konva.Group {
        return this.group;
    }
}

