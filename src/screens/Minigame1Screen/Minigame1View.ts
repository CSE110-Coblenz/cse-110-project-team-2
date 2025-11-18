import Konva from "konva";
import { STAGE_WIDTH, STAGE_HEIGHT, TOPPINGS } from "../../constants";
import { View } from "../../types";
import type { OrderResult } from "../../data/OrderResult";

export class Minigame1View implements View {
    private group: Konva.Group;
    private content: Konva.Group;
    
    // controller will set this to go to Minigame 2
    public onGoToMinigame2: () => void = () => {};
    // controller can set this after a result to navigate away
    public onBackToMenu: () => void = () => {};

    constructor(onBackToMenuClick: () => void) {
        this.group = new Konva.Group({ visible: false, listening: true });
        this.drawBackground()

        // Title
        this.group.add(new Konva.Text({
            x: 40,
            y: 80,
            text: "Minigame 1",
            fontSize: 32,
            fontStyle: "bold",
            fill: "black",
        }));

        // content group for dynamic UI
        this.content = new Konva.Group({ x: 0, y: 70 });
        this.group.add(this.content);

        // keep an affordance to go to minigame 2 if desired
        const minigame2Group = new Konva.Group({
            x: STAGE_WIDTH - 140,
            y: 20,
            listening: true,
        });

        const minigame2Btn = new Konva.Rect({
            x: 0,
            y: 0,
            width: 120,
            height: 34,
            fill: "#e5e7eb",
            stroke: "black",
            strokeWidth: 2,
            cornerRadius: 8,
        });

        const minigame2Text = new Konva.Text({
            x: 12,
            y: 6,
            text: "Minigame 2",
            fontSize: 14,
            fill: "black",
        });
        minigame2Group.add(minigame2Btn, minigame2Text);
        
        // click event → goes to minigame 2 screen
        minigame2Group.on("click", () => this.onGoToMinigame2());
        minigame2Group.on("mouseenter", () => document.body.style.cursor = "pointer");
        minigame2Group.on("mouseleave", () => document.body.style.cursor = "default");
        this.group.add(minigame2Group);

        // Back to main menu button (top-right corner)
        // TODO: Why is this nonfunctional?
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
            fontSize: 16,
            fill: "white",
            });
        backText.offsetX(backText.width() / 2);
        backText.offsetY(backText.height() / 2);

        backGroup.add(backBtn, backText);

        // click event → goes back to menu
        backGroup.on("click", onBackToMenuClick);
        this.group.add(backGroup);
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

    // modified function from GameScreenView. Thanks Woojin
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

    showMessage(message: string) {
        this.content.destroyChildren();
        this.content.add(new Konva.Text({ x: 40, y: 20, text: message, fontSize: 20, fill: "black" }));

        const back = this.makeButton(STAGE_WIDTH / 2 - 60, 120, "Back", () => {
            this.onBackToMenu();
        });
        this.content.add(back);
        this.group.getLayer()?.batchDraw();
    }

    
    renderPair(a: OrderResult, b: OrderResult, topping: string, onChoice: (choice: "A" | "B" | "Tie") => void) {
        this.content.destroyChildren();

        const question = new Konva.Text({ 
            x: 40,
            y: 300,
            text: `Which pizza has more \n${topping.toLowerCase()}?`,
            fontSize: 22,
            fill: "white"
        });
        this.content.add(question);

        // left box (A)
        const leftX = 60;
        const boxW = 420;
        const boxH = 220;
        const leftBox = new Konva.Rect({ x: leftX, y: 50, width: boxW, height: boxH, fill: "white", stroke: "black" });
        this.content.add(leftBox);
        this.content.add(new Konva.Text({ x: leftX + 12, y: 60, text: `Pizza A (Day ${a.day} #${a.orderNumber})`, fontSize: 18, fill: "black" }));

        // right box (B)
        const rightX = leftX + boxW + 40;
        const rightBox = new Konva.Rect({ x: rightX, y: 50, width: boxW, height: boxH, fill: "white", stroke: "black" });
        this.content.add(rightBox);
        this.content.add(new Konva.Text({ x: rightX + 12, y: 60, text: `Pizza B (Day ${b.day} #${b.orderNumber})`, fontSize: 18, fill: "black" }));

        // show topping counts for each topping type
        const toppingsToShow = TOPPINGS;
        let yy = 95;
        for (const t of toppingsToShow) {
            const aCount = (a.order!.toppingsCounts as any)?.[t] ?? 0;
            const bCount = (b.order!.toppingsCounts as any)?.[t] ?? 0;
            this.content.add(new Konva.Text({ x: leftX + 12, y: yy, text: `${t}: ${aCount}`, fontSize: 16, fill: "black" }));
            this.content.add(new Konva.Text({ x: rightX + 12, y: yy, text: `${t}: ${bCount}`, fontSize: 16, fill: "black" }));
            yy += 28;
        }

        // choice buttons
        const btnY = 300;
        const btnA = this.makeButton(leftX + 40, btnY, "Pizza A", () => onChoice("A"));
        const btnB = this.makeButton(rightX + 40, btnY, "Pizza B", () => onChoice("B"));
        const btnTie = this.makeButton((STAGE_WIDTH / 2) - 60, btnY, "Tie", () => onChoice("Tie"));
        this.content.add(btnA, btnB, btnTie);

        this.group.getLayer()?.batchDraw();
    }

    showResult(isCorrect: boolean, details?: string) {
        // overlay panel
        const overlay = new Konva.Rect({
            x: 0,
            y: 0,
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            fill: "black",
            opacity: 0.4 });
        const panelW = 520;
        const panelH = 220;
        const panelX = (STAGE_WIDTH - panelW) / 2;
        const panelY = (STAGE_HEIGHT - panelH) / 2;
        const panel = new Konva.Rect({ x: panelX, y: panelY, width: panelW, height: panelH, fill: "#F5C753", stroke: "black", strokeWidth: 3, cornerRadius: 8 });
        const title = new Konva.Text({ x: panelX + panelW / 2, y: panelY + 24, text: isCorrect ? "Correct!" : "Incorrect", fontSize: 28, fill: isCorrect ? "green" : "red", align: "center" });
        title.offsetX(title.width() / 2);
        const body = new Konva.Text({ x: panelX + 20, y: panelY + 80, text: details ?? "", fontSize: 18, fill: "black" });

        const back = this.makeButton(panelX + panelW / 2 - 60, panelY + panelH - 70, "Back to Menu", () => {
            overlay.destroy();
            panel.destroy();
            title.destroy();
            body.destroy();
            back.destroy();
            this.group.getLayer()?.batchDraw();
            this.onBackToMenu();
        });

        this.group.add(overlay, panel, title, body, back);
        this.group.getLayer()?.batchDraw();
    }

    private makeButton(x: number, y: number, label: string, onClick: () => void) {
        const g = new Konva.Group({ x, y, listening: true });
        const rect = new Konva.Rect({ x: 0, y: 0, width: 120, height: 40, fill: "#e5e7eb", stroke: "black", strokeWidth: 2, cornerRadius: 8 });
        const text = new Konva.Text({ x: 10, y: 10, text: label, fontSize: 16, fill: "black" });
        g.add(rect, text);
        g.on("click", onClick);
        g.on("mouseenter", () => document.body.style.cursor = "pointer");
        g.on("mouseleave", () => document.body.style.cursor = "default");
        return g;
    }
}

