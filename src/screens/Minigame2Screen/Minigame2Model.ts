export class Minigame2Model {
  private obstacleCount = 0;

  getObstacleCount(): number {
    return this.obstacleCount;
  }

  increaseObstacleCount(): void {
    this.obstacleCount += 1;
  }

  reset(): void {
    this.obstacleCount = 0;
  }
}
