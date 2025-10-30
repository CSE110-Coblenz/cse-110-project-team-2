import { Minigame2Model } from "./Minigame2Model";
import { Minigame2View } from "./Minigame2View";
import type { ScreenController, ScreenSwitcher } from "../../types";

export class Minigame2Controller implements ScreenController {
  private model: Minigame2Model;
  private view: Minigame2View;
  private switcher: ScreenSwitcher;

  constructor(switcher: ScreenSwitcher) {
    this.model = new Minigame2Model();
    this.view = new Minigame2View();
    this.switcher = switcher;
  }

  private handleAddObstacle(): void {
    this.model.increaseObstacleCount();
    this.view.updateObstacleCount(this.model.getObstacleCount());

    // next steps?
    // if (this.model.getObstacleCount() >= 10) {
    //   this.switcher.switchToScreen({ type: "result" });
    // }
  }

  getView(): Minigame2View {
    return this.view;
  }

  show(): void {
    this.view.show();
  }

  hide(): void {
    this.view.hide();
  }
}
