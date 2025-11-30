import { GameScreenModel } from "./GameScreenModel";
import { GameScreenView } from "./GameScreenView";
import { ToppingType, ORDERS_PER_DAY } from "../../constants";
import { ScreenController, Difficulty, Order } from "../../types";
import { ScreenSwitcher } from "../../types";
import { ResultStore } from "../../data/ResultStore";
import type { OrderResult, PlacedTopping } from "../../data/OrderResult";

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
    this.view.clearSelectionWarning();
  }

  private handleSliceNumSelected(slices: number) {
    if (this.model.pizzaNum === 0) return;

    this.clearAllToppingsVisual();
    this.model.resetToppingsState();

    this.model.setSliceNum(slices);
    this.view.resetForSliceNum(slices);
    this.view.clearSelectionWarning();
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
    //if the user hasn't selected pizza or slice num yet
    if (this.model.pizzaNum === 0 || this.model.sliceNum === 0) {
      if (this.model.pizzaNum === 0 && this.model.sliceNum === 0) {
        this.view.showSelectionWarning(
          "Select how many pizzas and a pizza size before submitting!"
        );
      } else if (this.model.pizzaNum === 0) {
        this.view.showSelectionWarning(
          "Select how many pizzas before submitting!"
        );
      } else if (this.model.sliceNum === 0) {
        this.view.showSelectionWarning(
          "Select a pizza size (number of slices) before submitting!"
        );
      }
      return;
    }

    const evalResult = this.model.evaluateOrder(order);

    const { success, lines, expectedTotal, currentTotal, expectedPizzaNum } =
      evalResult;

    //const pizzaCount = this.model.pizzaNum;
    const screenshotDataUrl = this.view.capturePizzaImage();

    // keeps track if this is the last order of the day
    const isLastOrderOfDay = this.orderNum >= ORDERS_PER_DAY;

    this.resultStore.add({
      orderNumber: this.orderNum,
      success,
      details: lines.join("\n"),
      expectedTotal,
      currentTotal,
      expectedPizzaNum,
      currentPizzaNumber: this.model.pizzaNum,
      slicesUsed: this.model.sliceNum,
      order,
      tipsEarned: 0,
      screenshotDataUrl,
    });

    if (evalResult.success) {
      if(!isLastOrderOfDay) {
        this.orderNum += 1;
        this.view.updateOrderNumber(this.orderNum);
      }

      this.clearAllToppingsVisual();
      this.model.resetAll();
      this.view.resetAfterSuccess();
    }

    this.view.showResultPopup(
      evalResult.lines.join("\n"),
      evalResult.success,
      (success) => {
        if (!success) {
          return;
        }
        
        // if last order of the day, go to minigame1 screen
        if (isLastOrderOfDay) {
          this.orderNum = 1; // reset for next day
          this.view.updateOrderNumber(this.orderNum);
          this.screen?.switchToScreen({ 
            type: "minigame1",
          }); 
        } else {
          // proceed to next order
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
    this.view.resetSelectionWarning();
    if (order) this.displayOrder(order);
    this.view.show();
  }

  displayOrder(order: Order) {
    this.currentOrder = order;
    this.view.displayOrder(order);
  }
  private handleInstructionsClick(){
        this.screen?.switchToScreen({type:"tutorial"});
  }

  endGame() {
    this.view.hide();
  }
}
