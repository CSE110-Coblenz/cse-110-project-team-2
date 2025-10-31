import Konva from "konva";

/**
 * The MenuScreenView represents the view for the main game menu
 */
export class MenuScreenView {

    stage: Konva.Stage;
    layer: Konva.Layer;
    // A group for the settings popup window. Null until the popup is created.
    settingsPopup: Konva.Group | null = null; 

    // ID of the HTMKL container with the canvas
    constructor(containerId: string){
        this.stage = new Konva.Stage({
            container: containerId,
            width: window.innerWidth,
            height: window.innerHeight,

    });

    // Create a drawing layer in the stage 
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    // Create buttons for the instruction and game settings
    this.createButtons();

    }



    /**
     * Creates the buttons on the screen
     */

    private createButtons(){
        const buttonY = this.stage.height() - 60; //Button near bottom of the screen
        const buttonX = this.stage.width() - 200; //Button near right of the screen
        
        // Instructions Button
        const instructionBtn = new Konva.Rect({
            x: buttonX,
            y: buttonY,
            width: 90,
            height: 40,
            fill: "red",
            corderRadius: 15,
        });

        const instructionBtnText = new Konva.Text({
            x: buttonX + 10,
            y: buttonY + 10,
            text: "INSTRUCTIONS",
            fontSize: 18,
            fill: "black",
        });

        
        
        
        
    }
}