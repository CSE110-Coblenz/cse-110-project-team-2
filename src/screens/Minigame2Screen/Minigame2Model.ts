export class Minigame2Model {
  private obstacleCount = 0;
  tip = 0;
  review: string = "";

  calculateTip(): void {
    let result: { tip: number; review: string };

    if (this.obstacleCount <= 0) {
      this.tip = 9.00;
      this.review = "DELICIOUS! My pizza was fresh and hot 🔥";
    }
    else if (this.obstacleCount <= 2) {
      this.tip = 7.50;
      this.review = "Tasted great, but sauce leaked a bit.";
    }
    else if (this.obstacleCount <= 4) {
      this.tip = 6.00;
      this.review = "Good pizza, but toppings were slightly off." ;
    }
    else if (this.obstacleCount <= 6) {
      this.tip = 4.50;
      this.review = "My pizza arrived tilted and a bit messy.";
    }
    else if (this.obstacleCount <= 8) {
      this.tip = 3.00;
      this.review = "Why was my pizza upside down? 😕";
    }

    else if (this.obstacleCount <= 10) {
      this.tip = 1.50;
      this.review = "Pizza was all crushed up...";
    }
    else {
      this.tip = 0.00;
      this.review = "Never ordering again 💀";
    }
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
