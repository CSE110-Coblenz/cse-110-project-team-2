import Konva from "konva";
import { ScreenSwitcher, Screen, ScreenController, View } from "./types";
import { STAGE_WIDTH, STAGE_HEIGHT } from "./constants";
import { MenuScreenController } from "./screens/MenuScreen/MenuScreenController";
import { GameScreenController } from "./screens/GameScreen/GameScreenController";

class App implements ScreenSwitcher {
	private stage: Konva.Stage;
	private layer: Konva.Layer;

	private menuController: MenuScreenController;
	private gameController: GameScreenController;

	constructor(container: string) {
		this.stage = new Konva.Stage({ container, width: STAGE_WIDTH, height: STAGE_HEIGHT });
		this.layer = new Konva.Layer();
		this.stage.add(this.layer);

		this.menuController = new MenuScreenController(this);
		this.gameController = new GameScreenController(this);

		this.layer.add(this.menuController.getView().getGroup());
		this.layer.add(this.gameController.getView().getGroup());

		// Start on the menu
		this.switchToScreen({ type: "menu" });
	}

	switchToScreen(screen: Screen): void {
		// hide all
		this.menuController.hide();
		this.gameController.hide();

		switch (screen.type) {
			case "menu":
				this.menuController.show();
				break;
			case "game":
				this.gameController.startGame();
				break;
			default:
				this.menuController.show();
				break;
		}

		this.layer.draw();
	}
}

new App("container");