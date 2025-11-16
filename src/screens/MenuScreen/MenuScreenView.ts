import Konva from "konva";
import type { View } from "../../types";
import { STAGE_WIDTH, STAGE_HEIGHT, SCREEN_BACKGROUNDS, SCREEN_OVERLAY } from "../../constants";


/**
 * MenuScreenView - Renders the menu screen
 */
export class MenuScreenView implements View {
    private group: Konva.Group;
    
    // Popup overlay for settings; originally null
    private settingsPopup: Konva.Group | null = null; 
    private musicOn: boolean = true;

    private sfxOn: boolean = true;

    constructor(onStartClick: () => void, 
                private onToggleMusic: (on: boolean) => void,
                private onToggleSfx: (on: boolean) => void,
                private onTutorialClick: () => void) {
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

        const popupWidth = 300;
        const popupHeight = 220; 

        const popup = new Konva.Group({
            //x: STAGE_WIDTH / 2 - 150,
            //y: STAGE_HEIGHT / 2 - 100,
            x: STAGE_WIDTH / 2 - popupWidth / 2,
            y: STAGE_HEIGHT / 2 - popupHeight / 2,
        });
        
        const popupBackground = new Konva.Rect({
            //width: 300,
            //height: 200,
            width: popupWidth,
            height: popupHeight,
            fill: "white",
            stroke: "black",
            cornerRadius: 8,
            shadowBlur: 10,
        });

        // Close button for the popup
        const closePopup = new Konva.Text({
            text: "X",
            //x: 270,
            x: popupWidth - 30,
            y: 10,
            fontSize: 20,
            fill: "black",
        });

        // Title
        const popupTitle = new Konva.Text({
            text: "SETTINGS",
            //x: 110,
            x: popupWidth / 2,
            y: 20,
            fontSize: 18,
            fill: "black",
            //fontStyle: "bold",
        })
        popupTitle.offsetX(popupTitle.width() / 2);

        const toggleWidth = 140;
        const toggleHeight = 40;
        const centerX = (popupWidth - toggleWidth) / 2;
        
        const musicGroup = new Konva.Group({ x: centerX, y: 80, width: toggleWidth, height: toggleHeight });
        // Toggle button to turn on/off the music
        const musicToggle = new Konva.Rect({
            //x: 90,
            //y: 70,
            //width: 120,
            //height: 40,
            x: 0,
            y: 0,
            width: toggleWidth,
            height: toggleHeight,
            fill: musicOn ? "green" : "red",
            cornerRadius: 8,
        });
        const musicToggleText = new Konva.Text({
            //x: 120,
            //y: 80,
            x: toggleWidth / 2,
            y: toggleHeight / 2,
            text: musicOn ? "Music ON" : "Music OFF",
            fontSize: 16,
            fill: "white",
            listening: false,
        });
        musicToggleText.offsetX(musicToggleText.width() / 2);
        musicToggleText.offsetY(musicToggleText.height() / 2);

        musicGroup.add(musicToggle, musicToggleText);

        //Toggle button to turn on/off the sound effects
        const sfxGroup = new Konva.Group({ x: centerX, y: 140, width: toggleWidth, height: toggleHeight });

        const sfxToggle = new Konva.Rect({
            x: 0,
            y: 0,
            //width: 140,
            //height: 40,
            width: toggleWidth,
            height: toggleHeight,
            fill: this.sfxOn ? "green" : "red",
            cornerRadius: 8,
            
        });
        const sfxText = new Konva.Text({
            //x: 70,
            //y: 20,
            x: toggleWidth / 2,
            y: toggleHeight / 2,
            // may replace with image later
            text: this.sfxOn ? "Effects ON" : " Effects OFF",
            fontSize: 16,
            fill: "white",
            listening: false,
        });
        sfxText.offsetX(sfxText.width() / 2);
        sfxText.offsetY(sfxText.height() / 2);
        sfxGroup.add(sfxToggle, sfxText);


        // event handler to change the color of the music button
        musicToggle.on("click", () => {
            this.musicOn = !this.musicOn;
            musicToggle.fill(this.musicOn ? "green" : "red");
            musicToggleText.text(this.musicOn ? "Music ON" : "Music OFF");
            musicToggleText.offsetX(musicToggleText.width() / 2);
            this.onToggleMusic(this.musicOn);

            this.group.getLayer()?.draw();
        });

        // event handler to change the color of the sfx button
        sfxGroup.on("click tap", () => {
            this.sfxOn = !this.sfxOn;
            sfxToggle.fill(this.sfxOn ? "green" : "red");
            sfxText.text(this.sfxOn ? "Effects ON" : "Effects OFF");
            sfxText.offsetX(sfxText.width() / 2);
            this.onToggleSfx(this.sfxOn);
            this.group.getLayer()?.batchDraw();
          });

        // Event handler to close the settings popup
        closePopup.on("click", () => {
            popup.destroy();
            this.group.getLayer()?.draw();
            onClose();
        });

        popup.add(popupBackground, closePopup, popupTitle, musicGroup, sfxGroup);
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

