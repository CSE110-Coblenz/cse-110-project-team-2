import Konva from "konva";
import { GameScreenModel } from "./GameScreenModel";
import { GameScreenView } from "./GameScreenView";
import { PIZZA } from "../../constants";
import { ScreenController, Difficulty, Order } from "../../types";
import { ScreenSwitcher } from "../../types";
import { ResultStore } from "../../data/ResultStore";

export class GameScreenController extends ScreenController {
  private model: GameScreenModel;
  private view: GameScreenView;
  private screen?: ScreenSwitcher;

  constructor(
    screenSwitcher: ScreenSwitcher,
    private resultStore: ResultStore
  ) {
    super();
    this.view = new GameScreenView(
      () => this.handleBackToMenuClick(),
      this.resultStore
    );
    this.view.onOrderSuccess = (d) => this.handleOrderSuccess(d);
    this.model = this.view.model;
    this.view.onGoToMinigame1 = () => {
      this.screen?.switchToScreen({ type: "minigame1" });
    };
    this.screen = screenSwitcher;
    this.view.show();
  }

  private handleOrderSuccess(difficulty?: Difficulty): void {
    this.screen?.switchToScreen({
      type: "order",
      mode: difficulty ?? "proper",
      returnToGame: true,
    });
  }

  getView(): GameScreenView {
    return this.view;
  }

  private handleBackToMenuClick() {
    this.screen?.switchToScreen({ type: "menu" });
  }
  startGame(difficulty: Difficulty, order?: Order): void {
    // Configure game based on difficulty level:
    // proper: generates only proper fractions (numerator < denominator)
    // improper: generates only improper fractions (numerator > denominator)
    // mixed: generates both proper and improper fractions
    console.log(`Starting game with ${difficulty} difficulty`);
    if ((this.view as any).setDifficulty)
      (this.view as any).setDifficulty(difficulty);
    if (order) {
      // forward the order to the view
      this.view.displayOrder(order);
    }
    this.view.show();
  }

  endGame() {
    this.view.hide();
  }
}
