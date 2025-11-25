import Konva from "konva";
import { STAGE_WIDTH, STAGE_HEIGHT, TOPPINGS } from "../../constants";
import { View } from "../../types";
import type { OrderResult } from "../../data/OrderResult";
import { PIZZA } from "../../constants";

export class Minigame1View implements View {
    private group: Konva.Group;
    private content: Konva.Group;
    private pizzaGroup = new Konva.Group();
    // map has key of strings and value of numbers
    // map key is `${sideIndex}-${subIndex}` where sideIndex is 0 for A (left) and 1 for B (right)
    // e.g. string "0-1" refers to left side, sub-pizza 1
    private pizzaRadius: Map<string, number> = new Map();
    
    
    // controller will set this to go to Minigame 2
    public onGoToMinigame2: () => void = () => {};
    // controller can set this after a result to navigate away
    public onBackToMenu: () => void = () => {};
    // callback set by renderPair so bases can call it when clicked
    private onChoiceCallback: (choice: "A" | "B" | "Tie") => void = () => {};

    constructor() {
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

        // content group for dynamic UI components
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

        // clear any previous pizza base
        this.clearMinigameToppings();
        this.pizzaGroup.destroyChildren();
        this.pizzaRadius.clear();

        // determine how many pizzas the order used (saved in OrderResult as currentPizzaNumber)
        const aPizzaNum = a.currentPizzaNumber;
        const bPizzaNum = b.currentPizzaNumber;

        this.onChoiceCallback = onChoice;
        // draw bases for each order (left = side 0, right = side 1)
        this.createBasesForOrder(aPizzaNum, 0);
        this.createBasesForOrder(bPizzaNum, 1);

        // render toppings on the newly created bases
        this.renderToppingsForOrder(a.order!, aPizzaNum, 0);
        this.renderToppingsForOrder(b.order!, bPizzaNum, 1);

        // TODO: Tie button probably won't need to be in main game? But for testing purposes it was needed. Randy decide if it's needed or not
        const btnY = 300;
        const btnTie = this.makeButton((STAGE_WIDTH / 2) - 60, btnY, "Tie", () => onChoice("Tie"));
        this.content.add(btnTie);

        this.group.getLayer()?.batchDraw();
    }

    // render toppings on base(s). sideIndex: 0 => left (A), 1 => right (B)
    private renderToppingsForOrder(order: any, pizzaCount: number, sideIndex: number) {
        if (!order || !order.toppingsCounts) return;

        const toppingMap: Record<string, { url: string; scale: number }> = {
            Mushroom: { url: "/mushroom.png", scale: 0.75 },
            Pepperoni: { url: "/pepperoni.png", scale: 0.75 },
            Basil: { url: "/basil.png", scale: 0.075 },
        };

        // compute pizzaX positions for this side depending on whether there are 1 or 2 pizzas
        const baseCenter = sideIndex === 0 ? PIZZA.pizzaX1 : PIZZA.pizzaX2;
        const dx = 70; // separation when drawing two smaller pizzas

        for (const t of Object.keys(order.toppingsCounts)) {
            const total = order.toppingsCounts[t] ?? 0;

            if (pizzaCount === 1) {
                const info = toppingMap[t] ?? { url: "/" + t.toLowerCase() + ".png", scale: 0.5 };
                const key = `${sideIndex}-0`;
                // multiply by 1.25 to increase topping radius
                const rOuter = (this.pizzaRadius.get(key) ?? 80) * 1.25;
                const pizzaY = PIZZA.pizzaY;
                for (let i = 0; i < total; i++) {
                    const pizzaX = baseCenter;
                    this.createStaticTopping(pizzaX, pizzaY, rOuter, info.url, info.scale);
                }
            } else {
                // split toppings between the two pizzas: ceil -> sub 0 (left), floor -> sub 1 (right)
                const leftCount = Math.ceil(total / 2);
                const rightCount = Math.floor(total / 2);

                const info = toppingMap[t] ?? { url: "/" + t.toLowerCase() + ".png", scale: 0.5 };

                // left sub-pizza
                const leftKey = `${sideIndex}-0`;
                const leftX = baseCenter - dx;
                const leftROuter = (this.pizzaRadius.get(leftKey) ?? 60) * 1.25;
                const leftY = PIZZA.pizzaY - dx;
                for (let i = 0; i < leftCount; i++) {
                    this.createStaticTopping(leftX, leftY, leftROuter, info.url, info.scale);
                }

                // right sub-pizza
                const rightKey = `${sideIndex}-1`;
                const rightX = baseCenter + dx;
                const rightROuter = (this.pizzaRadius.get(rightKey) ?? 60) * 1.25;
                const rightY = PIZZA.pizzaY + dx;
                for (let i = 0; i < rightCount; i++) {
                    this.createStaticTopping(rightX, rightY, rightROuter, info.url, info.scale);
                }
            }
        }
    }

    // Create a static topping image inside pizza area
    private createStaticTopping(pizzaX: number, pizzaY: number, rOuter: number, url: string, scale: number) {
        const img = new Image();
        img.src = url;
        img.onload = () => {
            const inner = Math.max(6, rOuter * 0.12); // keep toppings off the very center
            const angle = Math.random() * Math.PI * 2;
            const radius = inner + Math.sqrt(Math.random()) * Math.max(0, (rOuter - inner)); // sqrt(random) randomizes where the topping is placed
            const x = pizzaX + radius * Math.cos(angle);
            const y = pizzaY + radius * Math.sin(angle);
            const k = new Konva.Image({
                image: img,
                x,
                y,
                scaleX: scale,
                scaleY: scale,
                offsetX: img.width / 2,
                offsetY: img.height / 2,
                listening: false,
            });
            k.setAttr("isMinigameTopping", true);
            this.pizzaGroup.add(k);
            this.group.getLayer()?.batchDraw();
        };
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
            align: "center"
        });
        title.offsetX(title.width() / 2);
        const body = new Konva.Text({
            x: panelX + 20,
            y: panelY + 80,
            text: details ?? "",
            fontSize: 18,
            fill: "black"
        });

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

    // Create bases for an order side. sideIndex 0 => left (A), 1 => right (B)
    private createBasesForOrder(pizzaCount: number, sideIndex: number) {
        const baseCenter = sideIndex === 0 ? PIZZA.pizzaX1 : PIZZA.pizzaX2;
        if (pizzaCount <= 1) {
            // single larger pizza
            const scale = 0.8;
            const img = new Image();
            img.src = '/pizza.png';
            img.onload = () => {
                const k = new Konva.Image({
                    scaleX: scale,
                    scaleY: scale,
                    image: img,
                    offsetX: img.width / 2,
                    offsetY: img.height / 2,
                    listening: true,
                    x: baseCenter,
                    y: PIZZA.pizzaY,
                });
                k.setAttr('isMinigameBase', true);
                k.setAttr('minigameIndex', sideIndex);
                // attach click handler to choose this side (A or B)
                k.on('click', () => { try { if (this.onChoiceCallback) this.onChoiceCallback(sideIndex === 0 ? 'A' : 'B'); } catch {} });
                k.on('mouseenter', () => document.body.style.cursor = 'pointer');
                k.on('mouseleave', () => document.body.style.cursor = 'default');
                
                this.pizzaGroup.add(k);
                const rOuter = (img.width / 2) * scale - 5;
                this.pizzaRadius.set(`${sideIndex}-0`, rOuter);
                this.group.getLayer()?.batchDraw();
            };
        } else {
            // two smaller pizzas side-by-side
            const scale = 0.4;
            const dx = 70;
            const img = new Image();
            img.src = '/pizza.png';
            img.onload = () => {
                const left = new Konva.Image({
                    scaleX: scale,
                    scaleY: scale,
                    image: img,
                    offsetX: img.width / 2,
                    offsetY: img.height / 2,
                    listening: true,
                    x: baseCenter - dx,
                    y: PIZZA.pizzaY - dx,
                });
                left.setAttr('isMinigameBase', true);
                left.setAttr('minigameIndex', sideIndex);
                left.on('click', () => { try { if (this.onChoiceCallback) this.onChoiceCallback(sideIndex === 0 ? 'A' : 'B'); } catch {} });
                left.on('mouseenter', () => document.body.style.cursor = 'pointer');
                left.on('mouseleave', () => document.body.style.cursor = 'default');
                this.pizzaGroup.add(left);

                const right = new Konva.Image({
                    scaleX: scale,
                    scaleY: scale,
                    image: img,
                    offsetX: img.width / 2,
                    offsetY: img.height / 2,
                    listening: true,
                    x: baseCenter + dx,
                    y: PIZZA.pizzaY + dx,
                });
                right.setAttr('isMinigameBase', true);
                right.setAttr('minigameIndex', sideIndex);
                right.on('click', () => { try { if (this.onChoiceCallback) this.onChoiceCallback(sideIndex === 0 ? 'A' : 'B'); } catch {} });
                right.on('mouseenter', () => document.body.style.cursor = 'pointer');
                right.on('mouseleave', () => document.body.style.cursor = 'default');
                this.pizzaGroup.add(right);

                const rOuter = (img.width / 2) * scale - 5;
                this.pizzaRadius.set(`${sideIndex}-0`, rOuter);
                this.pizzaRadius.set(`${sideIndex}-1`, rOuter);
                this.group.getLayer()?.batchDraw();
            };
        }
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

    // Remove previously added minigame topping images
    private clearMinigameToppings() {
        const nodes = this.pizzaGroup.find((node: Konva.Node) => node.getAttr && node.getAttr("isMinigameTopping"));
        nodes.forEach((n: Konva.Node) => n.destroy());
    }

    // TODO: This is really only for showing the message that there's not enough pizzas to compare
    // This is just a debug function we can delete when minigame 1 is done
    showMessage(message: string) {
        this.content.destroyChildren();
        this.content.add(new Konva.Text({ x: 40, y: 20, text: message, fontSize: 20, fill: "black" }));
        
        // Temporary until back button works
        // TODO: Why does this not work
        const back = this.makeButton(STAGE_WIDTH / 2 - 60, 120, "Back", () => {
            this.onBackToMenu();
        });
        this.content.add(back);
        this.group.getLayer()?.batchDraw();
    }

    // TODO: the only place this is really needed is for the tie button. otherwise this was a debug function
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