import Konva from "konva";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants";

/**
 * Minigame 2 View - Renders the game UI using Konva
 */
export class Minigame2View {
    private group: Konva.Group;
    private carImage: Konva.Image | Konva.Circle | null = null;
    private obstacleText: Konva.Text;
    private timerText: Konva.Text;
    private roadDashes: Konva.Group;
    private roadAnimation: Konva.Animation;


    constructor() {
    this.group = new Konva.Group({ visible: false });

    // road background
    const road = new Konva.Rect({
        x: 0,
        y: 0,
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT,
        fill: "gray",
    })
    this.group.add(road);

    // road dashes
    const dashCount = 15;        // number of dashes visible at once
    const dashWidth = 60;
    const dashHeight = 10;
    const dashSpacing = 40;
    const roadCenterY = (STAGE_HEIGHT / 2) - (dashHeight / 2);

    this.roadDashes = new Konva.Group();

    for (let i = 0; i < dashCount; i++) {
        const dash = new Konva.Rect({
            x: i * (dashWidth + dashSpacing),
            y: roadCenterY,
            width: dashWidth,
            height: dashHeight,
            fill: "yellow",
        });
        this.roadDashes.add(dash);
    }
    this.group.add(this.roadDashes);

    // road dash animation
    const speed = 5;
    this.roadAnimation = new Konva.Animation((frame) => {
    if (!frame) return;

    // Move the whole dash group left
    this.roadDashes.x(this.roadDashes.x() - speed);

    // Reset when all dashes move past the screen
    if (this.roadDashes.x() < -(dashWidth + dashSpacing)) {
        this.roadDashes.x(0);
    }
    }, this.group.getLayer());



    // grass sides
    const grassTop = new Konva.Rect({
        x: 0,
        y: 0,
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT / 5,
        fill: "green",
    })
    const grassBottom = new Konva.Rect({
        x: 0,
        y: STAGE_HEIGHT - (STAGE_HEIGHT / 5),
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT / 5,
        fill: "green",
    })
    this.group.add(grassTop);
    this.group.add(grassBottom);

    // obstacle count
    this.obstacleText = new Konva.Text({
      x: 20,
      y: 20,
      text: "Obstacles hit: 0",
      fontSize: 24,
      fill: "black",
    });
    this.group.add(this.obstacleText);

    // timer display that counts down from 30 seconds
    this.timerText = new Konva.Text({
        x: STAGE_WIDTH - 150,
        y: 20,
        text: "Time left: 30",
        fontSize: 24,
        fill: "black",
    });
    this.group.add(this.timerText);

    Konva.Image.fromURL("/deliverycar.png", (img) => {
        img.width(200);
        img.height(200);
        img.x(200);
        img.y(STAGE_HEIGHT / 3 + 15);

        img.rotation(90);

        this.carImage = img;
        this.group.add(img);
        this.group.getLayer()?.draw();
        
        this.carImage = img;
        this.group.add(img);
        this.group.getLayer()?.draw();
    });

  }

  updateTimer(timeRemaining: number): void {
    // Update the timer display
    this.timerText.text(`Time left: ${timeRemaining}`);
    this.group.getLayer()?.draw();
  }
  
  getGroup(): Konva.Group {
    return this.group;
  }

  updateObstacleCount(count: number): void {
    this.obstacleText.text(`Obstacles: ${count}`);
  }

  show(): void {
    this.group.visible(true);
    this.roadAnimation?.start();
    this.group.getLayer()?.draw();
  }

  hide(): void {
    this.group.visible(false);
    this.roadAnimation?.stop();
    this.group.getLayer()?.draw();
  }
}