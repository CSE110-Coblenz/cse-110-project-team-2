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

    constructor(onStartClick: () => void, 
                private onToggleMusic: (on: boolean) => void,
                private onTutorialClick: () => void) {
        this.group = new Konva.Group({ visible: true });

        
        // background
        const bgImage = new Image();
        bgImage.src = "/background-checkers.jpg";
        
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
            x: 0, y: 0, width: STAGE_WIDTH, height: STAGE_HEIGHT,
            fill: "rgba(228,202,192,0.50)",
            listening: false,
        });

        // Title text

        const title = new Konva.Text({
            x: STAGE_WIDTH / 2,
            y: 90,
            text: "Slice by Slice",
            fontSize: 80,
            fontFamily: "Arial Black",
            fill: "#AB321B",
            align: "center",
            shadowColor: "rgba(0,0,0,0.25)",
            shadowBlur: 6,
            shadowOffsetY: 5,
        });
    
        const titleOutline = new Konva.Text({
            x: STAGE_WIDTH / 2,
            y: 90,
            text: "Slice by Slice",
            fontSize: 80,
            fontFamily: "Arial Black",
            fill: "transparent",
            stroke: "#4B1F0E",           
            strokeWidth: 3,              
            align: "center",
        })
        title.offsetX(title.width() / 2);
        titleOutline.offsetX(titleOutline.width() / 2);

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
            fontSize: 13, 
            fill: "white",
            listening: false,
        });

        instructionText.listening(false);

        instructionButtonGroup.add(instructionButton, instructionText);

        instructionButtonGroup.on("click tap", () => {
            console.log("tutorial button clicked");
            this.onTutorialClick();            
          });

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
            fontSize: 13, 
            fill: "white",
        });

        settingButtonGroup.add(settingButton, settingText);
    

        settingButtonGroup.on("click", () => {
            if (this.settingsPopup) {
              this.settingsPopup.destroy();
              this.settingsPopup = null;
              this.group.getLayer()?.draw();
            } else {
              this.showSettingsPopup(this.musicOn, () => (this.settingsPopup = null));
            }
          });


        this.group.add(bg, overlay, title, titleOutline, startButtonGroup, instructionButtonGroup, settingButtonGroup);
    }


    /**
     * Settings popup window
     */
    //showSettingsPopup(musicOn: boolean, onClose: () => void, onToggle: () => void) {
    showSettingsPopup(musicOn: boolean, onClose: () => void) {
        // If popup already exists, destroy it
        if(this.settingsPopup){
            this.settingsPopup.destroy();
            this.settingsPopup = null;
            this.group.getLayer()?.draw();
            return;
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

        const musicGroup = new Konva.Group({ x: 90, y: 70, width: 120, height: 40 });

        // Toggle button to turn on/off the music
        const musicToggle = new Konva.Rect({
            x: 90,
            y: 70,
            width: 120,
            height: 40,
            fill: musicOn ? "green" : "red",
            cornerRadius: 8,
        });
        const musicToggleText = new Konva.Text({
            x: 120,
            y: 80,
            text: musicOn ? "Music ON" : "Music OFF",
            fontSize: 16,
            fill: "white",
            listening: false,
        });

        musicGroup.add(musicToggle, musicToggleText);

        //Toggle button to turn on/off the sound effects
        /*const soundEffectToggle = new Konva.Rect({
            x: 120,
            y: 100,
            width: 120,
            height: 40,
            fill: musicOn ? "green" : "red",
            cornerRadius: 8,
            
        });
        const soundEffectText = new Konva.Text({
            x: 120,
            y: 80,
            // may replace with image later
            text: musicOn ? "Sound Effects ON" : "Sound Effects OFF",
            fontSize: 16,
            fill: "white",
            listening: false,
        });*/

        // event handler to change the color of the music button
        musicToggle.on("click", () => {
            this.musicOn = !this.musicOn;
            musicToggle.fill(this.musicOn ? "green" : "red");
            musicToggleText.text(this.musicOn ? "Music ON" : "Music OFF");

            this.onToggleMusic(this.musicOn);

            this.group.getLayer()?.draw();
        });

        // Event handler to close the settings popup
        closePopup.on("click", () => {
            popup.destroy();
            this.group.getLayer()?.draw();
            onClose();
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

