export class Minigame2Model {
  private obstacleCount = 0;

  getObstacleCount(): number {
    return this.obstacleCount;
  }

  increaseObstacleCount(amount = 1): void {
    this.obstacleCount += amount;
  }

  reset(): void {
    this.obstacleCount = 0;
  }
}
