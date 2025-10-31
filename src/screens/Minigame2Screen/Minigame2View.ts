import Konva from "konva";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants";

/**
 * Minigame 2 View - Renders the game UI using Konva
 */
export class Minigame2View {
  private group: Konva.Group;
  private obstacleText: Konva.Text;
  private timerText: Konva.Text;


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
    this.group.getLayer()?.draw();
  }

  hide(): void {
    this.group.visible(false);
    this.group.getLayer()?.draw();
  }
}