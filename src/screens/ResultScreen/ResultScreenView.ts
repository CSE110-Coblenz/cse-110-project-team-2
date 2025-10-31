import Konva from "konva";

export class ResultsScreenView {
  private STAGE_HEIGHT = 600;
  private STAGE_WIDTH = 800;
  private group: Konva.Group;

  private ordersReceived: Konva.Text;
  private ordersCorrect: Konva.Text;
  private percentCorrect: Konva.Text;
  private tipsReceived: Konva.Text;
  private totalTips: Konva.Text;

  public onViewWrongOrders: () => void = () => alert("View wrong orders");
  public onEndGame: () => void = () => alert("End game");
  public onNextDay: () => void = () => alert("Next day");

  constructor () {
    this.group = new Konva.Group({visible: false});
    
    const background = new Konva.Rect({
    x: 0,
    y: 0,
    width: this.STAGE_WIDTH,
    height: this.STAGE_HEIGHT,
    fill: "87CEEB",
    });
    this.group.add(background);

    const card = new Konva.Rect({
      x: 40,
      y: 40,
      width: this.STAGE_WIDTH - 80,
      height: this.STAGE_HEIGHT - 140,
      fill: "fde68a",
      stroke: "black",
      strokewidth: 3,
      cornerRadius: 16,
    });
    this.group.add(card);

    const title = new Konva.Text({
      x: card.x() + 20,
      y: card.y() + 16,
      text: "End of Day Results",
      fontSize: 28,
      fontStyle: "bold",
      fill: "black"
    });
    this.group.add(title);

    const startY = title.y() + 48;
    const rowGap = 36;

    this.ordersReceived = this.makeRow(card.x() + 26, startY + rowGap * 0, "Ordered received:");
    this.ordersCorrect = this.makeRow(card.x() + 26, startY + rowGap * 1, "Orders correct:");
    this.percentCorrect = this.makeRow(card.x() + 26, startY + rowGap * 2,"% correct");
    this.tipsReceived = this.makeRow(card.x() + 26, startY + rowGap * 3, "Tips received");
    this.totalTips = this.makeRow(card.x() + 26, startY + rowGap * 4, "Total tips");

    const buttonsY = card.y() + card.height() - 80;
    const btnW = 200;
    const gap = 20;
    const fristX = card.x() + 26;

    const btnWrong = this.makeButton(fristX + (btnW + gap) * 0, buttonsY, "View wrong orders", () => this.onViewWrongOrders());
    const btnEnd = this.makeButton(fristX + (btnW + gap) * 1, buttonsY, "End game", () => this.onEndGame());
    const btnNext = this.makeButton(fristX + (btnW + gap) * 2, buttonsY, "Next day", () => this.onNextDay());

    this.group.add(btnWrong, btnEnd, btnNext);
  }

  private makeRow(x: number, y: number, label: string): Konva.Text { 
    const lbl = new Konva.Text({x, y, text: label, fontSize: 22, fill: "black"});
    const val = new Konva.Text({x: x + 260, y, text: "-", fontSize: 22, fill: "black"});
    this.group.add(lbl);
    this.group.add(val);
    return val;
  }

  private makeButton(x: number, y: number, text: string, onClick: () => void): Konva.Group {
    const g  = new Konva.Group({x, y});
    const rect = new Konva.Rect({width: 200, height: 48, fill: "red", stroke: "black", strokeWidth: 3, cornerRadius: 10});
    const label = new Konva.Text({text, fontSize: 18, fill: "white", x: 12, y: 12});
    g.add(rect);
    g.add(label);
    g.on("click", onClick);
    return g;
  }

  updateStats(stats: {ordersReceived: number; ordersCorrect: number; tipsReceived: number; totalTips: number;}) : void {
    const received = Math.max(0, stats.ordersReceived | 0);
    const correct = Math.max(0, Math.min(received, stats.ordersCorrect | 0));
    const pct = received === 0 ? 0 : (correct / received) * 100;

    this.ordersReceived.text(String(received));
    this.ordersCorrect.text(String(correct));
    this.percentCorrect.text(pct.toFixed(1) + "%");
    this.tipsReceived.text(String(Math.max(0, stats.tipsReceived | 0)));
    this.totalTips.text("$" + Math.abs(stats.totalTips || 0).toFixed(2));
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


