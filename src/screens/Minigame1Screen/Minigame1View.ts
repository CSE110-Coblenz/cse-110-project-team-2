import Konva from "konva";
import { STAGE_WIDTH, STAGE_HEIGHT, TOPPINGS } from "../../constants";
import { View } from "../../types";
import type { OrderResult } from "../../data/OrderResult";
import { PIZZA } from "../../constants";


export class Minigame1View implements View {
    private group: Konva.Group;
    private content: Konva.Group;
    private pizzaGroup =new Konva.Group();
    private pizzaRadius: Map<number, number> = new Map();
    
    
    // controller will set this to go to Minigame 2
    public onGoToMinigame2: () => void = () => {};
    // controller can set this after a result to navigate away
    public onBackToMenu: () => void = () => {};

    constructor() {
        this.group = new Konva.Group({ visible: false, listening: true });
        this.drawBackground()
        this.group.add(this.pizzaGroup);
        // add two blank pizzas to the board (pass index so we can identify them later)
        this.drawPizza(PIZZA.pizzaX1, 0)
        this.drawPizza(PIZZA.pizzaX2, 1)

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

    // NOTE: This is really only for showing the message that there's not enough pizzas to compare
    // In the actual game, this function won't be needed
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

        // render toppings visually on the pizzas
        this.clearMinigameToppings();
        this.clearMinigameSlices();

        // determine how many pizzas the order used (saved in OrderResult as currentPizzaNumber)
        const aPizzaNum = a.currentPizzaNumber;
        const bPizzaNum = b.currentPizzaNumber;

        const aSlicesPerPizza = a.slicesUsed && aPizzaNum
            ? a.slicesUsed / aPizzaNum
            : a.order?.fractionStruct?.denominator || 0;

        const bSlicesPerPizza = b.slicesUsed && bPizzaNum
            ? b.slicesUsed / bPizzaNum
            : b.order?.fractionStruct?.denominator || 0;

        // draw slice lines on pizzas 
        this.drawSlicesForPizza(PIZZA.pizzaX1, aSlicesPerPizza);
        this.drawSlicesForPizza(PIZZA.pizzaX2, bSlicesPerPizza);

        
        // If pizzaNum === 1 (there was only one pizza), put all toppings on the left (index 0). If 2 pizzas in one order, split ceil/ floor between A and B.
        this.renderToppingsForOrder(a.order!, aPizzaNum, 0, aSlicesPerPizza);
        this.renderToppingsForOrder(b.order!, bPizzaNum, 1, bSlicesPerPizza);

        // make pizza bases clickable
        const bases = this.pizzaGroup.find((node: Konva.Node) => node.getAttr && node.getAttr("isMinigameBase"));
        bases.forEach((node: Konva.Node) => {
            // remove any previous click handlers
            try { node.off && node.off("click"); } catch {}
            const idx = node.getAttr("minigameIndex");
            node.on && node.on("click", () => {
                if (idx === 0) onChoice("A");
                else onChoice("B");
            });
            node.on && node.on("mouseenter", () => document.body.style.cursor = "pointer");
            node.on && node.on("mouseleave", () => document.body.style.cursor = "default");
        });

        // NOTE: Tie button probably won't need to be in main game? But for testing purposes it was needed
        const btnY = 300;
        const btnTie = this.makeButton((STAGE_WIDTH / 2) - 60, btnY, "Tie", () => onChoice("Tie"));
        this.content.add(btnTie);

        this.group.getLayer()?.batchDraw();
    }

    // Remove previously added minigame topping images
    private clearMinigameToppings() {
        const nodes = this.pizzaGroup.find((node: Konva.Node) => node.getAttr && node.getAttr("isMinigameTopping"));
        nodes.forEach((n: Konva.Node) => n.destroy());
    }

    private clearMinigameSlices() {
        const node = this.pizzaGroup.find((node: Konva.Node) => node.getAttr && node.getAttr("isMinigameSlice"));   
        node.forEach((n: Konva.Node) => n.destroy());
    }

    private drawSlicesForPizza(pizzaX:number, slices:number) {
        if(!slices || !Number.isFinite(slices) || slices < 1 ) {
            return;
        }

        const rOuter = this.pizzaRadius.get(pizzaX) ?? 80;
        for(let i=0; i<slices; i++) {
            const angle = (2*Math.PI/slices)*i - Math.PI/2; 
            const x1 = pizzaX;
            const y1 = PIZZA.pizzaY;
            const x2 = pizzaX + rOuter * Math.cos(angle);
            const y2 = PIZZA.pizzaY + rOuter * Math.sin(angle);
        
            const line = new Konva.Line({
                points: [x1, y1, x2, y2],
                stroke: "black",
                strokeWidth: 2,
                listening: false,
            });
            line.setAttr("isMinigameSlice", true);
            this.pizzaGroup.add(line);
        }
        this.group.getLayer()?.batchDraw();
    }

    // Render toppings for an order on pizza index (0 -> pizzaX1, 1 -> pizzaX2)
    // NOTE: I wasn't sure what to do if there were two pizzas in one order so I asked my copilot.
    private renderToppingsForOrder(order: any, pizzaCount: number, pizzaIndex: number, slicesPerPizza?: number) {
        if (!order || !order.toppingsCounts) return;
        const pizzaX = pizzaIndex === 0 ? PIZZA.pizzaX1 : PIZZA.pizzaX2; // is this the left or right pizza?
        const rOuter = this.pizzaRadius.get(pizzaX) ?? 80;

        const toppingMap: Record<string, { url: string; scale: number }> = {
            Mushroom: { url: "/mushroom.png", scale: 0.75 },
            Pepperoni: { url: "/pepperoni.png", scale: 0.75 },
            Basil: { url: "/basil.png", scale: 0.075 },
        };

        for (const t of Object.keys(order.toppingsCounts)) {
            const total = order.toppingsCounts[t] ?? 0;
            let countForThisPizza = 0;
            if (pizzaCount === 1) {
                // all on the first pizza (we'll show them on the pizzaX position passed in)
                countForThisPizza = total;
            } else {
                // split between the two pizzas: assign ceil to pizzaIndex 0, floor to pizzaIndex 1
                if (pizzaIndex === 0) countForThisPizza = Math.ceil(total / 2);
                else countForThisPizza = Math.floor(total / 2);
            }

            const info = toppingMap[t] ?? { url: "/" + t.toLowerCase() + ".png", scale: 0.5 };
            for (let i = 0; i < countForThisPizza; i++) {
                this.createStaticTopping(pizzaX, rOuter, info.url, info.scale, slicesPerPizza);
            }
        }
    }

    // Create a static topping image inside pizza area
    private createStaticTopping(pizzaX: number, rOuter: number, url: string, scale: number, slicesPerPizza?: number) {
        const img = new Image();
        img.src = url;
        img.onload = () => {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * (rOuter - 20);
            const x = pizzaX + radius * Math.cos(angle);
            const y = PIZZA.pizzaY + radius * Math.sin(angle);
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

    showResult(isCorrect: boolean, details?: string) {
        // overlay panel
        const overlay = new Konva.Rect({ x: 0, y: 0, width: STAGE_WIDTH, height: STAGE_HEIGHT, fill: "black", opacity: 0.4 });
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

    drawPizza(pizzaX:number, index: number = 0): void {
        //build the base circle
        const basePizza=new Image()
        basePizza.src='/pizza.png'
        const scale=0.8;
        basePizza.onload=()=>{
            const pizzaBase=new Konva.Image({
                scaleX:scale,
                scaleY:scale,
                image:basePizza,
                offsetX:basePizza.width/2,
                offsetY:basePizza.height/2,
                listening:true, // makes the pizzas clickable
                x:pizzaX,
                y:PIZZA.pizzaY
            })
            // mark base as interactive for minigame (clickable)
            pizzaBase.setAttr("isMinigameBase", true);
            pizzaBase.setAttr("minigameIndex", index);
            this.pizzaGroup.add(pizzaBase);
            // compute and store outer radius for placing toppings
            const rOuter = (basePizza.width / 2) * scale - 5;
            this.pizzaRadius.set(pizzaX, rOuter);
            this.group.getLayer()?.batchDraw();
        } 
    }
}