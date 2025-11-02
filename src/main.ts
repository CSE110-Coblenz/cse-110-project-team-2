import Konva from "konva";
import { ScreenSwitcher, Screen, ScreenController, View } from "./types";
import { STAGE_WIDTH, STAGE_HEIGHT } from "./constants";
import { MenuScreenController } from "./screens/MenuScreen/MenuScreenController";
import { GameScreenController } from "./screens/GameScreen/GameScreenController";
import { Minigame2Controller } from "./screens/Minigame2Screen/Minigame2Controller";

class App implements ScreenSwitcher {
	private stage: Konva.Stage;
	private layer: Konva.Layer;

	private menuController: MenuScreenController;
	private gameController: GameScreenController;
  private minigame2Controller: Minigame2Controller;

	constructor(container: string) {
		this.stage = new Konva.Stage({ container, width: STAGE_WIDTH, height: STAGE_HEIGHT });
		this.layer = new Konva.Layer();
		this.stage.add(this.layer);

		this.menuController = new MenuScreenController(this);
		this.gameController = new GameScreenController(this);
    this.minigame2Controller = new Minigame2Controller(this);

		this.layer.add(this.menuController.getView().getGroup());
		this.layer.add(this.gameController.getView().getGroup());
        this.layer.add(this.minigame2Controller.getView().getGroup());

		// Start on the menu
		this.switchToScreen({ type: "menu" });
		// this.switchToScreen({ type: "minigame2" });
	}

	switchToScreen(screen: Screen): void {
		// hide all
		this.menuController.hide();
		this.gameController.hide();
    this.minigame2Controller.hide();

		switch (screen.type) {
			case "menu":
				this.menuController.show();
				break;
			case "game":
				this.gameController.startGame();
				break;
      case "minigame2":
        this.minigame2Controller.startGame();
        break;
			default:
				this.menuController.show();
				break;
		}

		this.layer.draw();
	}
}

new App("container");
