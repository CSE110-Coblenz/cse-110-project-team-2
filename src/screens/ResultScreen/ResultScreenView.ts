import Konva from "konva";
import {STAGE_WIDTH, STAGE_HEIGHT} from "../../constants";
import {View} from "../../types"; 
import {Group} from "konva/lib/Group";
import { FONTS } from "../../fonts";

export class ResultScreenView implements View {
  private group: Konva.Group;

  //Text Fields to be updated
  private ordersReceived: Konva.Text;
  private ordersCorrect: Konva.Text;
  private percentCorrect: Konva.Text;
  private tipsReceived: Konva.Text;

  // Callbacks to be assigned by controller
  public onViewWrongOrders: () => void = () => {};
  public onEndGame: () => void = () => {};
  public onNextDay: () => void = () => {};

  constructor () {
    // Main container group for screen
    this.group = new Konva.Group({visible: false, listening: true});
    
    //Background of the screen
    this.group.add(new Konva.Rect({
      x: 0,
      y: 0,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      fill: "#fde68a",
    }));

    // Center card panel
    const card = new Konva.Rect({
      x: 40,
      y: 40,
      width: STAGE_WIDTH - 80,
      height: STAGE_HEIGHT - 140,
      fill: "#fde68a",
      stroke: "black",
      strokeWidth: 3,
      cornerRadius: 16,
    });
    this.group.add(card);

    // Decorative pizza image, on the right side of the card
    const image = new window.Image();
    image.src = "pizza_res.png";
    image.onload = () => {
      // Scale image to a fixed target width while preserving aspect ratio
      const targetW = 240;
      const scale = targetW / image.width;
      const targetH = image.height * scale;

      const pizzaImage = new Konva.Image({
        x: card.x() + card.width() - targetW - 60,
        y: card.y() + 60,
        image: image,
        width: targetW,
        height: targetH,
        listening: false, // purely visual, no interaction
      });
      this.group.add(pizzaImage);
      this.group.draw();
    };
    
    //Title text
    const title = new Konva.Text({
      x: card.x() + 20,
      y: card.y() + 16,
      text: "End of Day Results",
      fontSize: 28,
      fontStyle: "bold",
      fill: "black",
      fontFamily: FONTS.HEADER,
    });
    this.group.add(title);

    // Layout for rows
    const startY = title.y() + 60;
    const rowGap = 40;

    // Rows of stats
    this.ordersReceived = this.makeRow(card.x() + 26, startY + rowGap * 0, "# attempts:");
    this.ordersCorrect = this.makeRow(card.x() + 26, startY + rowGap * 1, "# correct attempts:");
    this.percentCorrect = this.makeRow(card.x() + 26, startY + rowGap * 2,"% correct:");
    this.tipsReceived = this.makeRow(card.x() + 26, startY + rowGap * 3, "Tips received:");

    // Row for buttons
    const buttonsY = card.y() + card.height() - 90;

    // Wraps callbacks so the latest assigned function is used
    const btnWrong = this.makeButton(card.x() + 40, buttonsY, "View wrong orders", () => this.onViewWrongOrders());
    const btnEnd = this.makeButton(card.x() + card.width()/2 - 100, buttonsY, "Home screen", () =>  this.onEndGame());
    const btnNext = this.makeButton(card.x() + card.width() - 40 - 200, buttonsY, "Continue Playing", () => this.onNextDay());

    this.group.add(btnWrong, btnEnd, btnNext);
  }

  // Creates a data row label and value
  private makeRow(x: number, y: number, label: string): Konva.Text { 
    const lbl = new Konva.Text({x, y, text: label, fontSize: 22, fill: "black", fontFamily: FONTS.BODY});
    const val = new Konva.Text({x: x + 260, y, text: "-", fontSize: 22, fill: "black", fontFamily: FONTS.BODY});
    this.group.add(lbl);
    this.group.add(val);
    return val;
  }

  // Creates clickable buttons
  private makeButton(x: number, y: number, text: string, onClick: () => void): Konva.Group {
    const g  = new Konva.Group({x, y, listening: true});
    const rect = new Konva.Rect({width: 200, height: 48, fill: "red", stroke: "black", strokeWidth: 3, cornerRadius: 10});
    const label = new Konva.Text({text, fontSize: 18, fill: "white", x: 12, y: 12, fontFamily: FONTS.BUTTON});
    const hit = new Konva.Rect({width: 200, height: 48, fill: "rgba(0, 0, 0, 0.001)", listening: true});
    g.add(rect, label, hit);
    g.on("mouseenter", () => (document.body.style.cursor = "pointer"));
    g.on("mouseleave", () => (document.body.style.cursor = "default"));
    // Shared click handler so both the group and rect trigger it
    const handler = (e: Konva.KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true;
      if(onClick) onClick();
    };
    g.on("click", handler);
    rect.on("click", handler);
    return g;
  }

  // Will update displayed stats
  updateStats(stats: {ordersReceived: number; ordersCorrect: number; tipsReceived: number;}) : void {
    // Sanitize counts to avoid negative or NaN values.
    const received = Math.max(0, stats.ordersReceived | 0);
    const correct = Math.max(0, Math.min(received, stats.ordersCorrect | 0));
    // Compute percentage correct
    const pct = received === 0 ? 0 : (correct / received) * 100;

    // Update test nodes 
    this.ordersReceived.text(String(received));
    this.ordersCorrect.text(String(correct));
    this.percentCorrect.text(pct.toFixed(1) + "%");
    this.tipsReceived.text("$" + (stats.tipsReceived ?? 0).toFixed(2));
    this.group.draw();
  }

  /**
   * Shows a popup with study recommendations based on performance.
   * @param message The recommendation message to display
   * @param parent The Konva group to which the popup will be added
   */
  showRecommendationPopup = (message: string, parent: Konva.Group) => {
    // Semi-transparent overlay to dim background
    const overlay = new Konva.Rect({
      x: 0,
      y: 0,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      fill: "rgba(0,0,0,0.4)",
      listening: true,
    });
  
    // Dimensions and positions for popup box
    const boxW = 520;
    const boxH = 320;
    const boxX = (STAGE_WIDTH - boxW) / 2;
    const boxY = (STAGE_HEIGHT - boxH) / 2;
  
    // Popup panel background
    const panel = new Konva.Rect({
      x: boxX,
      y: boxY,
      width: boxW,
      height: boxH,
      fill: "#fef3c7",
      stroke: "black",
      strokeWidth: 2,
      cornerRadius: 12,
    });
  
    // Popup title 
    const title = new Konva.Text({
      x: boxX,
      y: boxY + 16,
      width: boxW,
      align: "center",
      text: "Study Recommendations",
      fontSize: 24,
      fontStyle: "bold",
      fill: "black",
    });
  
    // Popup body text
    const body = new Konva.Text({
      x: boxX + 20,
      y: boxY + 60,
      width: boxW - 40,
      text: message,
      fontSize: 18,
      fill: "black",
    });
  
    // Close button group
    const closeGroup = new Konva.Group({
      x: boxX + boxW - 110,
      y: boxY + boxH - 50,
      listening: true,
    });
  
    // Close button background
    const closeRect = new Konva.Rect({
      width: 100,
      height: 40,
      fill: "#e5e7eb",
      stroke: "black",
      strokeWidth: 2,
      cornerRadius: 8,
    });
  
    // Close button text
    const closeText = new Konva.Text({
      x: 0,
      y: 10,  
      align: "center",
      text: "Close",
      fontSize: 18,
      fill: "black",
    });
  
    closeGroup.add(closeRect, closeText);
    
    // Helper to clean up all popup elements
    const destroyAll = () => {
      overlay.destroy();
      panel.destroy();
      title.destroy();
      body.destroy();
      closeGroup.destroy();
      parent.getLayer()?.draw();
    };
    
    // Close popup on click
    closeGroup.on("click", destroyAll);
    overlay.on("click", destroyAll);
  
    parent.add(overlay, panel, title, body, closeGroup);
    parent.getLayer()?.draw();
  }

  // Expose the root group so the controller can add it to a layer.
  getGroup(): Konva.Group {
    return this.group;
  }

  // Show/hide helpers used by the controller
  show(): void {
    this.group.visible(true);
  }

  hide(): void {
    this.group.visible(false);
  }
}