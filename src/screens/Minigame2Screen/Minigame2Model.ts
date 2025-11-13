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
  if (obstacleCount <= 0)
    return { tip: 9.0, review: "DELICIOUS! My pizza was fresh and hot 🔥" };
  else if (obstacleCount <= 2)
    return { tip: 7.5, review: "Tasted great, but sauce leaked a bit." };
  else if (obstacleCount <= 4)
    return { tip: 6.0, review: "Good pizza, but toppings were slightly off." };
  else if (obstacleCount <= 6)
    return { tip: 4.5, review: "My pizza arrived tilted and a bit messy." };
  else if (obstacleCount <= 8)
    return { tip: 3.0, review: "Why was my pizza upside down? 😕" };
  else if (obstacleCount <= 10)
    return { tip: 1.5, review: "Pizza was all crushed up..." };
  else
    return { tip: 0.0, review: "Never ordering again 💀" };
}
