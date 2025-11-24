import Konva from "konva";
import {
  STAGE_HEIGHT,
  STAGE_WIDTH,
  SLICE_OPTIONS,
  ToppingType,
  ORDERS_PER_DAY,
  GAME_BG_COLOR,
} from "../../constants";
import type { View, Order, Difficulty } from "../../types";
import { PIZZA } from "../../constants";
import { FONTS } from "../../fonts";
import type { GameScreenModel } from "./GameScreenModel";

export class GameScreenView implements View {
  group: Konva.Group;
  pizzaGroup = new Konva.Group();
  sliceArcs: Konva.Arc[] = [];

  private orderDisplay: Konva.Text;
  private orderNumber: Konva.Text;
  private rOuter = 0;
  private currentDifficulty: Difficulty = "proper";

  constructor(
    private model: GameScreenModel,
    private callbacks: {
      onBackToMenuClick: () => void;
      onGoToMinigame1: () => void;
      onPizzaNumSelected: (num: number) => void;
      onSliceNumSelected: (slices: number) => void;
      onToppingDragEnd: (
        topping: Konva.Group,
        type: ToppingType,
        pizzaX: number,
        rOuter: number
      ) => void;
      onTongsRemove: (type: ToppingType) => void;
      onSubmit: () => void;
    }
  ) {
    this.group = new Konva.Group({ visible: false });
    const basePizza = new Image();
    basePizza.src = "/pizza.png";
    basePizza.onload = () => {
      this.rOuter = (basePizza.width / 2) * 0.8 - 5;
      console.log(this.rOuter)
    };

    this.drawBackground();
    this.group.add(this.pizzaGroup);

    //Whiteboard with pizza num and slice nums
    const sliceText = new Konva.Text({
      text: "Pizza Size",
      fontSize: 36,
      fill: "white",
      align: "center",
      fontFamily:FONTS.SUBHEADER,
      x: 150,
      y: 440,
    });
    sliceText.offsetX(sliceText.width() / 2);
    this.group.add(sliceText);
    this.drawSlicesButton(150, 485, SLICE_OPTIONS[0]);
    this.drawSlicesButton(150, 521.67, SLICE_OPTIONS[1]);
    this.drawSlicesButton(150, 558.33, SLICE_OPTIONS[2]);
    this.drawSlicesButton(150, 595, SLICE_OPTIONS[3]);

    const numPizzaText = new Konva.Text({
      text: "# Pizzas",
      fontSize: 36,
      fill: "white",
      align: "center",
      fontFamily:FONTS.SUBHEADER,
      x: 150,
      y: 270,
    });
    numPizzaText.offsetX(numPizzaText.width() / 2);
    this.drawPizzaButton(150, 320, 1);
    this.drawPizzaButton(150, 350, 2);
    this.group.add(numPizzaText);

    //Topping bins
    this.drawTopping(450, 170, "Mushroom", "mushroom.png", 0.75);
    this.drawTopping(675, 170, "Pepperoni", "pepperoni.png", 0.75);
    this.drawTopping(900, 170, "Basil", "basil.png", 0.075);

    // Tongs
    const tongs = new Image();
    tongs.src = "/tongs.png";
    const Ytong: number = (STAGE_HEIGHT * 1) / 3 - 16;
    tongs.onload = () => {
      const tongsIm = new Konva.Image({
        scaleX: 0.5,
        scaleY: 0.5,
        image: tongs,
        offsetX: tongs.width / 2,
        offsetY: tongs.height / 2,
        listening: true,
        x: 1090,
        y: Ytong,
        draggable: true,
        rotation: 60,
      });
      this.group.add(tongsIm);
      tongsIm.on("dragstart", () => {
        tongsIm.rotation(0);
        this.group.getLayer()?.batchDraw();
      });
      tongsIm.on("dragend", () => {
        const box = tongsIm.getClientRect();
        const tongX = box.x + box.width / 2;
        const tongY = box.y + box.height / 2;
        const radius = 40;
        const toppings = this.group.find("Circle");
        let minDist = radius * radius;
        let closestType: ToppingType | undefined;

        toppings.forEach((node: Konva.Node) => {
          const rect = node.getClientRect();
          const x = rect.x + rect.width / 2 - tongX;
          const y = rect.y + rect.height / 2 - tongY;
          const dist = x * x + y * y;
          if (dist <= minDist) {
            minDist = dist;
            closestType = node.getAttr("toppingType") as ToppingType;
          }
        });

        tongsIm.setPosition({ x: 1090, y: Ytong });
        tongsIm.rotation(60);

        if (closestType) {
          this.callbacks.onTongsRemove(closestType);
        }

        this.group.getLayer()?.batchDraw();
      });
    };

    // order text
    const orderHeader = new Konva.Text({
      text: "Order:",
      fontSize: 36,
      fill: "black",
      align: "center",
      fontFamily:FONTS.HEADER,
      x: 160,
      y: 20,
    });
    orderHeader.offsetX(orderHeader.width() / 2);
    this.group.add(orderHeader);

    this.orderDisplay = new Konva.Text({
      x: 40,
      y: 70,
      width: 250,
      text: "",
      fontSize: 20,
      fontFamily:FONTS.BODY,
      fill: "black",
      align: "center",
      lineHeight:1.6
    });
    this.group.add(this.orderDisplay);

    // --- Submit button ---
    const submitGroup = new Konva.Group({
      x: STAGE_WIDTH - 142.5,
      y: STAGE_HEIGHT - 135,
    });
    const submit = new Konva.Rect({
      width: 135,
      height: 135,
      fill: "green",
      cornerRadius: 8,
      stroke: "green",
      strokeWidth: 2,
    });
    const submitText = new Konva.Text({
      x: 55,
      y: 67.5,
      text: "Submit",
      fontSize: 36,
      fontFamily:FONTS.BUTTON,
      fill: "white",
    });
    submitText.offsetX(submitText.width() / 2);
    submitText.offsetY(submitText.height() / 2);

    submitGroup.add(submit, submitText);
    submitGroup.on("click", () => this.callbacks.onSubmit());
    this.group.add(submitGroup);

    // minigame button
    const minigameGroup = new Konva.Group({
      x: STAGE_WIDTH - 142.5,
      y: STAGE_HEIGHT - 300,
    });
    const minigameBtn = new Konva.Rect({
      width: 135,
      height: 135,
      fill: "#1e40af",
      cornerRadius: 8,
      stroke: "#1e40af",
      strokeWidth: 2,
    });
    const minigameText = new Konva.Text({
      x: 67.5,
      y: 67.5,
      text: "Minigame 1",
      fontSize: 28,
      fontFamily:FONTS.BUTTON,
      fill: "white",
      align: "center",
    });
    minigameText.offsetX(minigameText.width() / 2);
    minigameText.offsetY(minigameText.height() / 2);
    minigameGroup.add(minigameBtn, minigameText);
    minigameGroup.on("click", () => this.callbacks.onGoToMinigame1());
    this.group.add(minigameGroup);

    //receipt with order in it
    const orderCount = new Konva.Group({ x: STAGE_WIDTH - 550, y: 20 });
    const orderRect = new Konva.Rect({
      width: 190,
      height: 50,
      fill: "#996228",
      cornerRadius: 8,
      stroke: "#996228",
      strokeWidth: 2,
    });
    this.orderNumber = new Konva.Text({
      x: 80,
      y: 25,
      text: `Order Number: 1 / ${ORDERS_PER_DAY}`,
      fontSize: 16,
      fontFamily:FONTS.BODY,
      fill: "white",
    });
    this.orderNumber.offsetX(this.orderNumber.width() / 2);
    this.orderNumber.offsetY(this.orderNumber.height() / 2);
    orderCount.add(orderRect, this.orderNumber);
    this.group.add(orderCount);

    //back button
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
      fontFamily:FONTS.BUTTON,
      fontSize: 16,
      fill: "white",
    });
    backText.offsetX(backText.width() / 2);
    backText.offsetY(backText.height() / 2);
    backGroup.add(backBtn, backText);
    backGroup.on("click", this.callbacks.onBackToMenuClick);
    this.group.add(backGroup);

    this.show();
  }


  resetForPizzaNum(numPizza: number): void {
    this.clearSlicesVisual();
    this.pizzaGroup.destroyChildren();
    this.sliceArcs.forEach(a => a.destroy());
    this.sliceArcs = [];

    if (numPizza === 1) {
      this.drawPizza(PIZZA.pizzaX);
    } else if (numPizza === 2) {
      this.drawPizza(PIZZA.pizzaX1);
      this.drawPizza(PIZZA.pizzaX2);
    }
    this.pizzaGroup.getLayer()?.batchDraw();
  }

  resetForSliceNum(slices: number): void {
    this.clearSlicesVisual();
    if (this.model.pizzaNum === 1) {
      this.makeSlices(slices, PIZZA.pizzaX);
    } else if (this.model.pizzaNum === 2) {
      this.makeSlices(slices, PIZZA.pizzaX1);
      this.makeSlices(slices, PIZZA.pizzaX2);
    }
  }

  clearSlicesVisual() {
    this.pizzaGroup.find("Line").forEach((node) => node.destroy());
    this.pizzaGroup.find(".slice").forEach((node) => node.destroy());
    this.sliceArcs.forEach(a => a.destroy());
    this.sliceArcs = [];
  }

  destroyToppingNodes(nodes: Konva.Group[]) {
    nodes.forEach(n => n.destroy());
    this.group.getLayer()?.batchDraw();
  }

  resetAfterSuccess() {
    this.clearSlicesVisual();
    this.pizzaGroup.destroyChildren();
    this.group.getLayer()?.batchDraw();
  }

  updateOrderNumber(orderNum: number) {
    this.orderNumber.text(`Order Number: ${orderNum} / ${ORDERS_PER_DAY}`);
    this.group.getLayer()?.batchDraw();
  }

  // display order in game screen
  displayOrder(order: Order): void {
    if (!order) {
      this.orderDisplay.text("");
      this.group.getLayer()?.batchDraw();
      return;
    }

    const denom = order.fractionStruct?.denominator;
    const lines: string[] = [];
    if (!order.toppingsCounts) {
      if (order.fraction) lines.push(order.fraction);
    } else {
      for (const [t, c] of Object.entries(order.toppingsCounts)) {
        if (c !== 0) lines.push(`${c}/${denom} ${t}`);
      }
    }

    if (lines.length) this.orderDisplay.text(lines.join("\n"));
    else this.orderDisplay.text(order.fraction ?? "");

    this.group.getLayer()?.batchDraw();
  }

  showResultPopup(
    lines: string,
    isSuccess: boolean,
    onClose: (success: boolean) => void
  ): void {
    const popupGroup: Konva.Group = new Konva.Group();

    const overlay = new Konva.Rect({
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      fill: "black",
      opacity: 0.5,
      listening: true,
    });

    const panel = new Konva.Rect({
      x: STAGE_WIDTH / 4,
      y: STAGE_HEIGHT / 4,
      width: STAGE_WIDTH / 2,
      height: STAGE_HEIGHT / 2,
      fill: GAME_BG_COLOR,
      cornerRadius: 8,
      stroke: "black",
      strokeWidth: 4,
    });

    const title = new Konva.Text({
      x: panel.x() + panel.width() / 2,
      y: panel.y() + 10,
      text: isSuccess ? "Correct!" : "Incorrect",
      fontSize: 30,
      fill: isSuccess ? "green" : "red",
      align: "center",
      fontFamily:FONTS.HEADER,
    });
    title.offsetX(title.width() / 2);

    const body = new Konva.Text({
      x: panel.x() + panel.width() / 10,
      y: panel.y() + 60,
      text: lines,
      fontSize: 24,
      fill: "black",
      align: "center",
      fontFamily:FONTS.BODY,
      lineHeight:1.6
    });

    const closeButton = new Konva.Group({ x: STAGE_WIDTH / 2 - 60, y: 400 });
    const close = new Konva.Rect({
      width: 120,
      height: 60,
      fill: "red",
      cornerRadius: 8,
      stroke: "black",
      strokeWidth: 4,
    });
    const closeText = new Konva.Text({
      x: 60,
      y: 24,
      text: "Close",
      fontSize: 18,
      fill: "white",
      fontFamily: FONTS.BUTTON,
    });
    closeText.offsetX(closeText.width() / 2);
    closeText.offsetY(closeText.height() / 2);
    closeButton.add(close, closeText);

    popupGroup.add(overlay, panel, title, body, closeButton);
    this.group.add(popupGroup);

    closeButton.on("click", () => {
      popupGroup.destroy();
      onClose(isSuccess);
      this.group.getLayer()?.batchDraw();
    });

    this.group.getLayer()?.batchDraw();
  }




  private drawPizzaButton(cx: number, cy: number, numPizza: number): void {
    const button = new Konva.Group({ x: cx, y: cy });

    const rect = new Konva.Rect({
      width: 100,
      height: 30,
      strokeWidth: 4,
    });

    const text = new Konva.Text({
      text: numPizza + " Pizza",
      fontSize: 20,
      fill: "white",
      width: rect.width(),
      align: "center",
      y: rect.height() / 2,
      fontFamily:FONTS.BODY,
    });

    button.add(rect, text);
    text.offsetX(text.width() / 2);
    text.offsetY(text.height() / 2);

    button.on("mouseover", () => rect.stroke(GAME_BG_COLOR));
    button.on("mouseout", () => rect.stroke(null));

    this.group.add(button);

    button.on("click", () => this.callbacks.onPizzaNumSelected(numPizza));
  }

  drawPizza(pizzaX: number): void {
    const basePizza = new Image();
    basePizza.src = "/pizza.png";
    const scale = 0.8;
    basePizza.onload = () => {
      const pizzaBase = new Konva.Image({
        scaleX: scale,
        scaleY: scale,
        image: basePizza,
        offsetX: basePizza.width / 2,
        offsetY: basePizza.height / 2,
        listening: false,
        x: pizzaX,
        y: PIZZA.pizzaY,
      });
      this.pizzaGroup.add(pizzaBase);
    };
  }

  private drawSlicesButton(cx: number, cy: number, slices: number): void {
    const button = new Konva.Group({ x: cx, y: cy });

    const rect = new Konva.Rect({
      width: 100,
      height: 30,
      strokeWidth: 4,
    });

    const text = new Konva.Text({
      text: slices + " slices",
      fontSize: 20,
      fill: "white",
      width: rect.width(),
      align: "center",
      y: rect.height() / 2,
      fontFamily:FONTS.BODY,
    });

    button.add(rect, text);
    text.offsetX(text.width() / 2);
    text.offsetY(text.height() / 2);

    button.on("mouseover", () => rect.stroke(GAME_BG_COLOR));
    button.on("mouseout", () => rect.stroke(null));

    this.group.add(button);

    button.on("click", () => this.callbacks.onSliceNumSelected(slices));
  }

  private makeSlices(slices: number, pizzaX: number) {
    const degPer = 360 / slices;

    for (let i = 0; i < slices; i++) {
      const a = (i * degPer * Math.PI) / 180;
      const x1 = pizzaX + 7 * Math.cos(a);
      const y1 = PIZZA.pizzaY + 7 * Math.sin(a);
      const x2 = pizzaX + this.rOuter * Math.cos(a);
      const y2 = PIZZA.pizzaY + this.rOuter * Math.sin(a);
      this.pizzaGroup.add(
        new Konva.Line({
          points: [x1, y1, x2, y2],
          stroke: "red",
          strokeWidth: 2,
          listening: false,
          opacity: 0.67,
          dash: [10, 5],
        })
      );
    }

    let realSlices = slices;
    let i = 0;
    if (pizzaX === PIZZA.pizzaX2) {
      realSlices *= 2;
      i += slices;
    }

    for (i; i < realSlices; i++) {
      const arc = new Konva.Arc({
        x: pizzaX,
        y: PIZZA.pizzaY,
        innerRadius: 0,
        outerRadius: this.rOuter,
        angle: degPer,
        rotation: i * degPer,
        id: `slice-${i}`,
        name: "slice",
      });
      this.pizzaGroup.add(arc);
      this.sliceArcs.push(arc);
    }

    this.pizzaGroup.getLayer()?.batchDraw();
  }

  private drawTopping(
    tinX: number,
    tinY: number,
    toppingType: ToppingType,
    toppingURL: string,
    toppingScale: number
  ): void {
    const toppingBin = new Konva.Group({ x: tinX, y: tinY });

    const text = new Konva.Text({
      text: toppingType,
      fontSize: 20,
      fill: "white",
      align: "center",
      y: 40,
      x: 0,
      fontFamily:FONTS.SUBHEADER,
    });

    const tin = new Image();
    tin.src = "/tin.png";
    tin.onload = () => {
      const tinIm = new Konva.Image({
        scaleX: 0.5,
        scaleY: 0.5,
        image: tin,
        offsetX: tin.width / 2,
        offsetY: tin.height / 2,
        listening: false,
        x: 0,
        y: 0,
      });

      toppingBin.add(text, tinIm);
      text.offsetX(text.width() / 2);
      this.group.add(toppingBin);
      this.group.getLayer()?.batchDraw();

      for (let i = 0; i < 5; i++) {
        this.createTopping(
          tinX - 25,
          tinY - 20,
          toppingType,
          toppingURL,
          toppingScale
        );
      }
    };
  }

  createTopping(
    toppingX: number,
    toppingY: number,
    toppingType: ToppingType,
    toppingURL: string,
    toppingScale: number
  ): void {
    const toppingIm = new Image();
    toppingIm.src = toppingURL;
    toppingIm.onload = () => {
      const toppingGroup = new Konva.Group({
        x: toppingX + Math.random() * 50,
        y: toppingY + Math.random() * 10,
        draggable: true,
        listening: true,
        name: toppingType,
      });

      const image = new Konva.Image({
        image: toppingIm,
        scale: { x: toppingScale, y: toppingScale },
        rotationDeg: Math.random() * 360,
      });
      image.offsetX(image.width() / 2);
      image.offsetY(image.height() / 2);

      const topping = new Konva.Circle({
        radius: (image.width() / 2) * toppingScale,
        fillEnabled: false,
      });
      topping.setAttr("countedSlice", null);
      topping.setAttr("isTopping", true);
      topping.setAttr("toppingType", toppingType);

      toppingGroup.add(image, topping);
      this.group.add(toppingGroup);

      toppingGroup.on("dragstart", () => {
        const x = toppingGroup.x() - toppingX;
        const y = toppingGroup.y() - toppingY;
        const dist = Math.sqrt(x * x + y * y);
        if (dist < 200) {
          this.createTopping(
            toppingX,
            toppingY,
            toppingType,
            toppingURL,
            toppingScale
          );
        }
      });

      toppingGroup.on("dragend", () => {
        if (this.model.pizzaNum === 0 || this.model.sliceNum === 0) {
          toppingGroup.destroy();
          return;
        }

        let pizzaX = PIZZA.pizzaX;
        if (this.model.pizzaNum === 2) {
          pizzaX = this.model.inPizza(
            toppingGroup.x(),
            toppingGroup.y(),
            PIZZA.pizzaX1,
            this.rOuter
          )
            ? PIZZA.pizzaX1
            : PIZZA.pizzaX2;
        }

        this.callbacks.onToppingDragEnd(
          toppingGroup,
          toppingType,
          pizzaX,
          this.rOuter
        );

        this.group.getLayer()?.batchDraw();
      });
    };
  }

  drawBackground() {
    const backgroundGroup = new Konva.Group();

    const bg = new Konva.Rect({
      x: 0,
      y: 0,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      fill: GAME_BG_COLOR,
      listening: false,
    });
    backgroundGroup.add(bg);

    const board = new Image();
    board.src = "/board.png";
    board.onload = () => {
      const boardIm = new Konva.Image({
        scaleX: 0.8,
        scaleY: 0.8,
        image: board,
        offsetX: board.width / 2,
        offsetY: board.height / 2,
        listening: false,
        x: STAGE_WIDTH / 2 + 75,
        y: (STAGE_HEIGHT * 3) / 4 - 35,
      });
      backgroundGroup.add(boardIm);
    };

    const blackBoard = new Image();
    blackBoard.src = "/blackboard.png";
    blackBoard.onload = () => {
      const blackBoardIm = new Konva.Image({
        scaleX: 0.667,
        scaleY: 0.55,
        image: blackBoard,
        offsetX: blackBoard.width / 2,
        offsetY: blackBoard.height / 2,
        listening: false,
        x: 148,
        y: (STAGE_HEIGHT * 3) / 4 - 42,
        rotationDeg: 90,
      });
      backgroundGroup.add(blackBoardIm);
    };

    const receipt = new Image();
    receipt.src = "/receipt.png";
    receipt.onload = () => {
      const reciptIm = new Konva.Image({
        scaleX: 0.5,
        scaleY: 0.48,
        image: receipt,
        offsetX: receipt.width / 2,
        offsetY: receipt.height / 2,
        listening: false,
        x: 170,
        y: STAGE_HEIGHT / 4 - 47,
        rotationDeg: 180,
      });
      backgroundGroup.add(reciptIm);
    };

    const pan = new Image();
    pan.src = "/pan.png";
    pan.onload = () => {
      const panIm = new Konva.Image({
        scaleX: 0.6,
        scaleY: 0.6,
        image: pan,
        offsetX: pan.width / 2,
        offsetY: pan.height / 2,
        listening: false,
        x: 1090,
        y: STAGE_HEIGHT / 3 - 10,
      });
      backgroundGroup.add(panIm);
    };

    bg.moveToBottom();
    this.group.add(backgroundGroup);
  }

  // capture an image of the current pizza 
  capturePizzaImage(): string | undefined {
    const layer = this.group.getLayer();
    if(!layer) return; 

    const radius = this.rOuter || 150;
    const margin = 20;

    let leftX: number;
    let rightX: number;

    if(this.model.pizzaNum === 2) {
        leftX = PIZZA.pizzaX1;
        rightX = PIZZA.pizzaX2;
    } else {
        const centerX = PIZZA.pizzaX;
        leftX = centerX;
        rightX = centerX;
    }

    const minX = leftX - radius - margin;
    const maxX = rightX + radius + margin;
    const x = minX
    const width = maxX - minX;

    const y = PIZZA.pizzaY - radius - margin;
    const height = radius * 2 + margin * 2;

    try {
        return this.group.toDataURL({
            x,
            y,
            width,
            height,
            pixelRatio: 2,
        });
    } catch (e) {
        console.error("Error capturing pizza image:", e);
        return undefined
    }
  }

  setDifficulty(d: Difficulty): void {
    this.currentDifficulty = d;
  }

  getGroup(): Konva.Group {
    return this.group;
  }

  show(): void {
    this.group.visible(true);
  }

  hide(): void {
    this.group.visible(false);
  }
}