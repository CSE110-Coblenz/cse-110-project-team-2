import Konva from "konva";
import { STAGE_WIDTH, STAGE_HEIGHT, TOPPINGS, ToppingType } from "../../constants";
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
                fontFamily: FONTS.HEADER,
        }));

        // content group for dynamic UI components
        this.content = new Konva.Group({ x: 0, y: 70 });
        this.group.add(this.content);

        // Button to go to Minigame 2
        const minigame2Group = new Konva.Group({
            x: STAGE_WIDTH - 140,
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
            fontFamily: FONTS.BUTTON,
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
    
    // calls other functions to render the pizza bases, then render the toppings on top with their choices
    renderPair(a: OrderResult, b: OrderResult, topping: string, onChoice: (choice: "A" | "B" | "Equivalent") => void) {
        this.content.destroyChildren();

        const question = new Konva.Text({ 
            x: 40,
            y: 300,
            text: `Which pizza has more \n${topping.toLowerCase()}?`,
            fontSize: 18,
            fill: "white",
            fontFamily: FONTS.HEADER,
        });
        this.content.add(question);

        // clear any previous pizza base
        this.pizzaGroup.destroyChildren();

        this.onChoiceCallback = onChoice;
        
        if (!a.screenshotDataUrl && !b.screenshotDataUrl) {
            this.showMessage("No pizza screenshots available for this minigame.");
            this.group.getLayer()?.batchDraw();
            return;
        } 

        this.renderScreenshotsPair(a.screenshotDataUrl!, b.screenshotDataUrl!);

        // TODO: Tie button probably won't need to be in main game? But for testing purposes it was needed. Randy decide if it's needed or not
        const btnY = 120;
        const btnTie = this.makeButton((STAGE_WIDTH / 2) - 20, btnY, "Equivalent", () => onChoice("Equivalent"));
        this.content.add(btnTie);

        this.group.getLayer()?.batchDraw();
    }

    private renderScreenshotsPair(leftUrl: string, rightUrl: string): void {
        const loadImage = (url: string): Promise<HTMLImageElement> => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = url;
                img.onload = () => resolve(img);
            });
        };

        const leftX = PIZZA.pizzaX1;
        const rightX = PIZZA.pizzaX2;
        const centerY = PIZZA.pizzaY;

        Promise.all([loadImage(leftUrl), loadImage(rightUrl)]).then(([leftImg, rightImg]) => {
            const maxWidth = 350;
            const maxHeight = 350;

            const computeScale = (img: HTMLImageElement) => {
                const sx = maxWidth / img.width;
                const sy = maxHeight / img.height;
                return Math.min(sx, sy, 1); // don't upscale
            };
            
            const leftScale = computeScale(leftImg);
            const rightScale = computeScale(rightImg);

            const leftNode  = new Konva.Image({
                image: leftImg,
                x: leftX,
                y: centerY,
                offsetX: (leftImg.width) / 2,
                offsetY: (leftImg.height) / 2,
                scaleX: leftScale,
                scaleY: leftScale,
                listening: true,
            });
            leftNode.setAttr("isMinigameBase", true);
            leftNode.setAttr("minigameIndex", 0);
            leftNode.on("click", () => {
                try {
                    if(this.onChoiceCallback) {
                        this.onChoiceCallback("A");
                    }
                } catch {}
            });
            leftNode.on("mouseenter", () => document.body.style.cursor = "pointer");
            leftNode.on("mouseleave", () => document.body.style.cursor = "default");

            const rightNode = new Konva.Image({
                image: rightImg,
                x: rightX,
                y: centerY,
                offsetX: (rightImg.width) / 2,
                offsetY: (rightImg.height) / 2,
                scaleX: rightScale,
                scaleY: rightScale,
                listening: true,
            });
            rightNode.setAttr("isMinigameBase", true);
            rightNode.setAttr("minigameIndex", 1);
            rightNode.on("click", () => {
                try {
                    if(this.onChoiceCallback) {
                        this.onChoiceCallback("B");
                    }
                } catch {}
            });
            rightNode.on("mouseenter", () => document.body.style.cursor = "pointer");
            rightNode.on("mouseleave", () => document.body.style.cursor = "default");

            this.pizzaGroup.add(leftNode, rightNode);
            this.group.getLayer()?.batchDraw();
        });
    }

    // result screen overlay
    showResult(isCorrect: boolean, details?: string) {
        const overlay = new Konva.Rect({ x: 0, y: 0, width: STAGE_WIDTH, height: STAGE_HEIGHT, fill: "black", opacity: 0.4 });
        const panelW = 520;
        const panelH = 220;
        const panelX = (STAGE_WIDTH - panelW) / 2;
        const panelY = (STAGE_HEIGHT - panelH) / 2;
        const panel = new Konva.Rect({
            x: panelX,
            y: panelY,
            width: panelW,
            height: panelH,
            fill: "#F5C753",
            stroke: "black",
            strokeWidth: 3,
            cornerRadius: 8
        });
        const title = new Konva.Text({
            x: panelX + panelW / 2,
            y: panelY + 24,
            text: isCorrect ? "Correct!" : "Incorrect",
            fontSize: 28,
            fill: isCorrect ? "green" : "red",
            align: "center",
            fontFamily: FONTS.HEADER
        });
        title.offsetX(title.width() / 2);
        const body = new Konva.Text({
            x: panelX + 20,
            y: panelY + 80,
            text: details ?? "",
            fontSize: 18,
            fill: "black",
            fontFamily: FONTS.BODY
        });

        const back = this.makeButton(panelX + panelW / 2 - 60, panelY + panelH - 70, "Continue", () => {
            overlay.destroy();
            panel.destroy();
            title.destroy();
            body.destroy();
            back.destroy();
            this.group.getLayer()?.batchDraw();
            this.onBackToGame();
        });

        this.group.add(overlay, panel, title, body, back);
        this.group.getLayer()?.batchDraw();
    }     

    // modified function from GameScreenView
    drawBackground() {
        const backgroundGroup=new Konva.Group()
        const bg = new Konva.Rect({
            x: 0,
            y: 0,
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            fill: "#F5C753",
            listening:false
        });
        backgroundGroup.add(bg);
        const board=new Image()
        board.src='/board.png'
        board.onload=()=>{
            const boardIm=new Konva.Image({
                scaleX:0.8,
                scaleY:0.8,
                image:board,
                offsetX:board.width/2,
                offsetY:board.height/2,
                listening:false,
                x:STAGE_WIDTH/2+75,
                y:STAGE_HEIGHT*3/4-35
            })
            backgroundGroup.add(boardIm);
        }
        const blackBoard=new Image()
        blackBoard.src='/blackboard.png'
        blackBoard.onload=()=>{
            const blackBoardIm=new Konva.Image({
                scaleX:0.667, //lol
                scaleY:0.55,
                image:blackBoard,
                offsetX:blackBoard.width/2,
                offsetY:blackBoard.height/2,
                listening:false,
                x:148,
                y:STAGE_HEIGHT*3/4-42,
                rotationDeg:90
            })
            backgroundGroup.add(blackBoardIm);
        }
        const receipt=new Image()
        receipt.src='/receipt.png'
        receipt.onload=()=>{
            const reciptIm=new Konva.Image({
                scaleX:0.5, 
                scaleY:0.48,
                image:receipt,
                offsetX:receipt.width/2,
                offsetY:receipt.height/2,
                listening:false,
                x:170,
                y:STAGE_HEIGHT*1/4-47,
                rotationDeg:180
            })
            backgroundGroup.add(reciptIm);
        }
        bg.moveToBottom()
        this.group.add(backgroundGroup)
    }

    // This is just a debug function we can delete when minigame 1 is done, shows a message with a back button
    showMessage(message: string) {
        this.content.destroyChildren();
        this.content.add(new Konva.Text({ x: 20, y: 150, text: message, fontSize: 20, fill: "black" }));
        
        // Temporary until back button works
        const back = this.makeButton(STAGE_WIDTH / 2 - 60, 120, "Back", () => {
            this.onBackToGame();
        });
        this.content.add(back);
        this.group.getLayer()?.batchDraw();
    }

    // the only place this is really needed is for the equivalent button. otherwise this was a debug function
    private makeButton(x: number, y: number, label: string, onClick: () => void) {
        const g = new Konva.Group({ x, y, listening: true });
        const rect = new Konva.Rect({ x: 0, y: 0, width: 120, height: 40, fill: "#e5e7eb", stroke: "black", strokeWidth: 2, cornerRadius: 8 });
        const text = new Konva.Text({ x: 10, y: 10, text: label, fontSize: 16, fill: "black", fontFamily: FONTS.BUTTON });
        g.add(rect, text);
        g.on("click", onClick);
        g.on("mouseenter", () => document.body.style.cursor = "pointer");
        g.on("mouseleave", () => document.body.style.cursor = "default");
        return g;
    }
}