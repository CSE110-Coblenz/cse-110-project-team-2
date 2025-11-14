import Konva from "konva";
import {STAGE_WIDTH, STAGE_HEIGHT} from "../../constants";
import {View} from "../../types"; 
import {Group} from "konva/lib/Group";

export class ResultsScreenView implements View {
  private group: Konva.Group;

  //Text Fields to be updated
  private ordersReceived: Konva.Text;
  private ordersCorrect: Konva.Text;
  private percentCorrect: Konva.Text;
  private tipsReceived: Konva.Text;
  private totalTips: Konva.Text;

  //Callbacks to be assigned by controller
  public onViewWrongOrders: () => void = () => {};
  public onEndGame: () => void = () => {};
  public onNextDay: () => void = () => {};

  constructor () {
    //Main container group for screen
    this.group = new Konva.Group({visible: false, listening: true});
    
    //Background of the screen
    this.group.add(new Konva.Rect({
      x: 0,
      y: 0,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      fill: "#fde68a",
    }));

    //Center card
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

    const image = new window.Image();
    image.src = "pizza.png";
    image.onload = () => {
      const targetW = 240;
      const scale = targetW / image.width;
      const targetH = image.height * scale;

      const pizzaImage = new Konva.Image({
        x: card.x() + card.width() - targetW - 60,
        y: card.y() + 60,
        image: image,
        width: targetW,
        height: targetH,
        listening: false,
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
      fill: "black"
    });
    this.group.add(title);

    //Layout for rows
    const startY = title.y() + 60;
    const rowGap = 40;

    //Rows of stats
    this.ordersReceived = this.makeRow(card.x() + 26, startY + rowGap * 0, "Orders received:");
    this.ordersCorrect = this.makeRow(card.x() + 26, startY + rowGap * 1, "Orders correct:");
    this.percentCorrect = this.makeRow(card.x() + 26, startY + rowGap * 2,"% correct:");
    this.tipsReceived = this.makeRow(card.x() + 26, startY + rowGap * 3, "Tips received:");
    this.totalTips = this.makeRow(card.x() + 26, startY + rowGap * 4, "Total tips:");

    //Row for bottons
    const buttonsY = card.y() + card.height() - 90;

    //Wraps callbacks so the latest assigned function is used
    const btnWrong = this.makeButton(card.x() + 40, buttonsY, "View wrong orders", () => this.onViewWrongOrders());
    const btnEnd = this.makeButton(card.x() + card.width()/2 - 100, buttonsY, "Home screen", () =>  this.onEndGame());
    const btnNext = this.makeButton(card.x() + card.width() - 40 - 200, buttonsY, "Next day", () => this.onNextDay());

    this.group.add(btnWrong, btnEnd, btnNext);
  }

  //Creates a data row label and value
  private makeRow(x: number, y: number, label: string): Konva.Text { 
    const lbl = new Konva.Text({x, y, text: label, fontSize: 22, fill: "black"});
    const val = new Konva.Text({x: x + 260, y, text: "-", fontSize: 22, fill: "black"});
    this.group.add(lbl);
    this.group.add(val);
    return val;
  }

  //Creates clickable buttons
  private makeButton(x: number, y: number, text: string, onClick: () => void): Konva.Group {
    const g  = new Konva.Group({x, y, listening: true});
    const rect = new Konva.Rect({width: 200, height: 48, fill: "red", stroke: "black", strokeWidth: 3, cornerRadius: 10});
    const label = new Konva.Text({text, fontSize: 18, fill: "white", x: 12, y: 12});
    const hit = new Konva.Rect({width: 200, height: 48, fill: "rgba(0, 0, 0, 0.001)", listening: true});
    g.add(rect, label, hit);
    g.on("mouseenter", () => (document.body.style.cursor = "pointer"));
    g.on("mouseleave", () => (document.body.style.cursor = "default"));
    const handler = (e: Konva.KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true;
      if(onClick) onClick();
    };
    g.on("click", handler);
    rect.on("click", handler);
    return g;
  }

  //Will update displayed stats, not currently used
  updateStats(stats: {ordersReceived: number; ordersCorrect: number; tipsReceived: number; totalTips: number;}) : void {
    const received = Math.max(0, stats.ordersReceived | 0);
    const correct = Math.max(0, Math.min(received, stats.ordersCorrect | 0));
    const pct = received === 0 ? 0 : (correct / received) * 100;

    this.ordersReceived.text(String(received));
    this.ordersCorrect.text(String(correct));
    this.percentCorrect.text(pct.toFixed(1) + "%");
    this.tipsReceived.text(String(Math.max(0, stats.tipsReceived | 0)));
    this.totalTips.text("$" + Math.abs(stats.totalTips || 0).toFixed(2));

    this.group.draw();
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