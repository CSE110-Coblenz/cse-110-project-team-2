import { TIP_TABLE } from "../../constants";

export class Minigame2Model {
  private obstacleCount = 0;
  tip = 0;
  review: string = "";

  calculateTip(): void {
    const result = calculateTipFromObstacles(this.obstacleCount);
    this.tip = result.tip;
    this.review = result.review;
  }

  getObstacleCount(): number {
    return this.obstacleCount;
  }

  increaseObstacleCount(): void {
    this.obstacleCount += 1;
  }

  reset(): void {
    this.obstacleCount = 0;
    this.tip = 0;
    this.review = "";
  }
}

// helper (logic is extracted for easier testing)
export function calculateTipFromObstacles(obstacleCount: number): { tip: number; review: string } {
  if (obstacleCount < 0) {
    throw new Error("obstacleCount cannot be negative");
  }
  return TIP_TABLE.find(row => obstacleCount <= row.max) ?? TIP_TABLE[TIP_TABLE.length - 1]; // default to no tip
} 

