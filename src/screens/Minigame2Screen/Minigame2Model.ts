// /**
//  * Minigame2Model - Manages minigame 2 state
//  */


export class Minigame2Model {
  private score = 0;

  getScore(): number {
    return this.score;
  }

  incrementScore(): void {
    this.score++;
  }

  reset(): void {
    this.score = 0;
  }
}