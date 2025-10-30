import Konva from "konva";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants";

/**
 * Minigame 2 View - Renders the game UI using Konva
 */
export class Minigame2View {
  private group: Konva.Group;
  private obstacleText: Konva.Text;

  constructor() {
    this.group = new Konva.Group({ visible: false });

    // Display for obstacle count
    this.obstacleText = new Konva.Text({
      x: 20,
      y: 20,
      text: "Obstacles hit: 0",
      fontSize: 24,
      fill: "black",
    });

    this.group.add(this.obstacleText);

  }

  getGroup(): Konva.Group {
    return this.group;
  }

  updateObstacleCount(count: number): void {
    this.obstacleText.text(`Obstacles: ${count}`);
  }

  show(): void {
    this.group.visible(true);
  }

  hide(): void {
    this.group.visible(false);
  }
}