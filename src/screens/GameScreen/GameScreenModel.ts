/**
 * GameScreenModel - Manages game state
 */
export class GameScreenModel {
    private score = 0;

    reset(): void {
        this.score = 0;
    }

    incrementScore(): void {
        this.score += 1;
    }

    getScore(): number {
        return this.score;
    }
}
