import { GameScreenModel } from "./GameScreenModel";
import { GameScreenView } from "./GameScreenView";
import { ToppingType, ORDERS_PER_DAY } from "../../constants";
import { ScreenController, Difficulty, Order } from "../../types";
import { ScreenSwitcher } from "../../types";
import { ResultStore } from "../../data/ResultStore";

export class GameScreenController extends ScreenController {
  private model: GameScreenModel;
  private view: GameScreenView;
  private screen?: ScreenSwitcher;

  private currentOrder?: Order;
  private currentDifficulty: Difficulty = "proper";
  private orderNum = 1;

  constructor(
    screenSwitcher: ScreenSwitcher,
    private resultStore: ResultStore
  ) {
    super();

    this.model = new GameScreenModel();

    this.view = new GameScreenView(this.model, {
      onBackToMenuClick: () => this.handleBackToMenuClick(),
      onGoToMinigame1: () => {
        this.screen?.switchToScreen({ type: "minigame1" });
      },
      onPizzaNumSelected: (num) => this.handlePizzaNumSelected(num),
      onSliceNumSelected: (slices) => this.handleSliceNumSelected(slices),
      onToppingDragEnd: (t, type, pizzaX, rOuter) =>
        this.model.updateToppingPlacement(t, type, pizzaX, rOuter),
      onTongsRemove: (type) => this.handleTongsRemove(type),
      onSubmit: () => this.handleSubmit(),
    });

    this.screen = screenSwitcher;
    this.view.show();
  }

  getView(): GameScreenView {
    return this.view;
  }

  private handleBackToMenuClick() {
    this.screen?.switchToScreen({ type: "menu" });
  }

  private handlePizzaNumSelected(numPizza: number) {
    // clear toppings first
    this.clearAllToppingsVisual();
    this.model.resetToppingsState();

    this.model.setPizzaNum(numPizza);
    this.model.setSliceNum(0);

    this.view.resetForPizzaNum(numPizza);
  }

  private handleSliceNumSelected(slices: number) {
    if (this.model.pizzaNum === 0) return;

    this.clearAllToppingsVisual();
    this.model.resetToppingsState();

    this.model.setSliceNum(slices);
    this.view.resetForSliceNum(slices);
  }

  private handleTongsRemove(type: ToppingType) {
    const nodes = this.model.getToppings(type);
    this.view.destroyToppingNodes(nodes);
    this.model.clearTopping(type);
  }

  private clearAllToppingsVisual() {
    for (let toppingList of this.model.toppingsOnPizza.values()) {
      toppingList.forEach((n) => n.destroy());
    }
    this.view.getGroup().getLayer()?.batchDraw();
  }

  private handleSubmit(): void {
    const order = this.currentOrder;
    if (!order) return;
    if (this.model.pizzaNum === 0 || this.model.sliceNum === 0) return;

    const evalResult = this.model.evaluateOrder(order);

    this.resultStore.add({
      orderNumber: this.orderNum,
      success: evalResult.success,
      details: evalResult.lines.join("\n"),
      expectedTotal: evalResult.expectedTotal,
      currentTotal: evalResult.currentTotal,
      expectedPizzaNum: evalResult.expectedPizzaNum,
      currentPizzaNumber: this.model.pizzaNum,
    });

    if (evalResult.success) {
      this.orderNum += 1;
      if (this.orderNum > ORDERS_PER_DAY) this.orderNum = 1;
      this.view.updateOrderNumber(this.orderNum);

      this.clearAllToppingsVisual();
      this.model.resetAll();
      this.view.resetAfterSuccess();
    }

    this.view.showResultPopup(
      evalResult.lines.join("\n"),
      evalResult.success,
      (success) => {
        if (success) {
          this.screen?.switchToScreen({
            type: "order",
            mode: this.currentDifficulty,
            returnToGame: true,
          });
        }
      }
    );
  }

  startGame(difficulty: Difficulty, order?: Order): void {
    this.currentDifficulty = difficulty;
    this.view.setDifficulty(difficulty);
    if (order) this.displayOrder(order);
    this.view.show();
  }

  displayOrder(order: Order) {
    this.currentOrder = order;
    this.view.displayOrder(order);
  }

  endGame() {
    this.view.hide();
  }
}
