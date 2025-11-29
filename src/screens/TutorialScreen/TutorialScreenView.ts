import Konva from "konva";
import type { View } from "../../types";
import { STAGE_WIDTH, STAGE_HEIGHT, SCREEN_BACKGROUNDS, SCREEN_OVERLAY } from "../../constants";
import { FONTS } from "../../fonts";

export class TutorialScreenView implements View {
  private group: Konva.Group;

  constructor(onBackToMenuClick: () => void, onWatchTutorialClick: () => void) {
    this.group = new Konva.Group({ visible: false });

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
      
    // title
    const title = new Konva.Text({
      x: STAGE_WIDTH / 2,
      y: 35,
      text: "INSTRUCTIONS",
      fontSize: 60,
      fontFamily: FONTS.HEADER,
      fill: "#AB321B",
      align: "center",
      shadowColor: "rgba(0,0,0,0.25)",
      shadowBlur: 6,
      shadowOffsetY: 5,
    });

    const titleOutline = new Konva.Text({
        x: STAGE_WIDTH / 2,
        y: 35,
        text: "INSTRUCTIONS",
        fontSize: 60,
        fontFamily: FONTS.HEADER,
        fill: "transparent",
        stroke: "#4B1F0E",           
        strokeWidth: 3,              
        align: "center",
    })

    title.offsetX(title.width() / 2);
    titleOutline.offsetX(titleOutline.width() / 2);

    // big text block placeholder
    const textBoxW = STAGE_WIDTH - 200//Math.min(700, STAGE_WIDTH - 120);
    const textBoxX = (STAGE_WIDTH - textBoxW) / 2;

    const block = new Konva.Rect({
      x: textBoxX,
      y: 95,
      width: textBoxW,
      height: 475,
      fill: "white",
      stroke: "#999",
      cornerRadius: 8,
      shadowColor: "black",
      shadowBlur: 10,
      shadowOpacity: 0.2,
    });

    const blockText = new Konva.Text({
      x: textBoxX,
      y: 105,
      width: textBoxW ,
      text:
        "Welcome to *Slice by Slice*! Your goal is to make the perfect pizza orders while earning tips.\n\n" +

        "🍕 Game Instructions 🍕\n" +
        "• First pay attention to the order you have received.\n" +
        "• To make your pizza, first select the number of pizzas you would like to make.\nThen choose the number of slices you want on that pizza.\n" +
        "• Use your mouse to drag toppings onto the pizza.\n" +
        "• To remove a topping, drag the tongs to the topping you would like to remove.\n" +
        "• Remember to pay attention to your order! Click submit when you believe your order is correct.\nKeep trying until you get it, keep up the good work!\n\n" +

        "🎯 OBJECTIVE:\n" +
        "• Each customer wants a specific number of slices and toppings per pizza fraction.\n" +
        "• Follow the order exactly — correct portions = happy customers!\n\n" +

        "🍕 MINI GAMES:\n" +
        "• *Compare Toppings*: Match the right topping ratios to win bonus tips.\n Pay attention to what the question is asking for and select the correct pizza!\n" +
        "• *Delivery Challenge*: At the end of the day, deliver your pizza while dodging obstacles\n to earn extra rewards. Use the UP and DOWN arrow keys to move your car.\n\n" +


        "Good luck, chef - the customers are waiting!",
      fontSize: 15,
      lineHeight: 1.4,
      fontFamily: FONTS.BODY,
      fill: "#333",
      align: "center",
    });

    // buttons at bottom
    const btnY = STAGE_HEIGHT - 120;

    // Watch Tutorial (no-op for now)
    const tutorialGroup = new Konva.Group({ x: STAGE_WIDTH / 2 - 100, y: btnY +50});
    const tutorialBtn = new Konva.Rect({
      width: 180,
      height: 56,
      fill: "#bdbdbd",
      cornerRadius: 8,
      stroke: "#9e9e9e",
      strokeWidth: 2,
    });
    const tutorialText = new Konva.Text({
      x: 80,
      y: 28,
      text: "Watch Tutorial",
      fontFamily: FONTS.BUTTON,
      fontSize: 20,
      fill: "#212121",
    });
    tutorialText.offsetX(tutorialText.width() / 2);
    tutorialText.offsetY(tutorialText.height() / 2);
    tutorialGroup.add(tutorialBtn, tutorialText);
    // no demo yet
    tutorialGroup.on("click", onWatchTutorialClick);

    // Back to main menu button (top-right corner)
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
      fontFamily: FONTS.BUTTON,
      fontSize: 16,
      fill: "white",
    });

    backText.offsetX(backText.width() / 2);
    backText.offsetY(backText.height() / 2);
    backGroup.add(backBtn, backText);
    backGroup.on("click", onBackToMenuClick);

    this.group.add(bg, overlay, title, titleOutline, block, blockText, tutorialGroup, backGroup);
  }


  show(): void {
    this.group.visible(true);
    this.group.getLayer()?.draw();
  }
  hide(): void {
    this.group.visible(false);
    this.group.getLayer()?.draw();
  }
  getGroup(): Konva.Group {
    return this.group;
  }
}

