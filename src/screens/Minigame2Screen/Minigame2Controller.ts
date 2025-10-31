import { Minigame2Model } from "./Minigame2Model";
import { Minigame2View } from "./Minigame2View";
import { ScreenController, ScreenSwitcher } from "../../types";

export class Minigame2Controller extends ScreenController {
  private model: Minigame2Model;
  private view: Minigame2View;
  private switcher?: ScreenSwitcher; // optional if running standalone

  constructor(switcher?: ScreenSwitcher) {
    super();
    this.model = new Minigame2Model();
    this.view = new Minigame2View();
    this.switcher = switcher;

    // // Connect UI events
    // this.view.onAddObstacle(() => this.handleAddObstacle());
  }

  private handleAddObstacle(): void {
    this.model.increaseObstacleCount();
    this.view.updateObstacleCount(this.model.getObstacleCount());

    // transition to next screen
    if (this.model.getObstacleCount() >= 10 && this.switcher) {
      this.switcher.switchToScreen({ type: "minigame2" }); // placeholder
    }
  }

  getView(): Minigame2View {
    return this.view;
  }

  startGame(): void {
    this.model.reset();
    this.view.updateObstacleCount(0);
    this.view.show();
  }

  endGame(): void {
    this.view.hide();
  }
}