import Konva from "konva";
import { ScreenSwitcher, Screen, ScreenController, View } from "./types";
import { STAGE_WIDTH, STAGE_HEIGHT } from "./constants";
import { MenuScreenController } from "./screens/MenuScreen/MenuScreenController";
import { GameScreenController } from "./screens/GameScreen/GameScreenController";
import { DifficultyScreenController } from "./screens/DifficultyScreen/DifficultyScreenController";

class App implements ScreenSwitcher {
	private stage: Konva.Stage;
	private layer: Konva.Layer;

	private menuController: MenuScreenController;
	private gameController: GameScreenController;
	private difficultyController: DifficultyScreenController;

	constructor(container: string) {
		this.stage = new Konva.Stage({ container, width: STAGE_WIDTH, height: STAGE_HEIGHT });
		this.layer = new Konva.Layer();
		this.stage.add(this.layer);

		this.menuController = new MenuScreenController(this);
		this.gameController = new GameScreenController(this);
		this.difficultyController = new DifficultyScreenController(this);

		this.layer.add(this.menuController.getView().getGroup());
		this.layer.add(this.gameController.getView().getGroup());
		this.layer.add(this.difficultyController.getView().getGroup());

		// Start on the menu
		this.switchToScreen({ type: "menu" });
	}

	switchToScreen(screen: Screen): void {
		// hide all screens
		this.menuController.hide();
		this.gameController.hide();
		this.difficultyController.hide();

		switch (screen.type) {
			case "menu":
				this.menuController.show();
				break;
			case "difficulty":
				this.difficultyController.show();
				break;
			case "game":
				this.gameController.startGame(screen.difficulty);
				break;
			default:
				this.menuController.show();
				break;
		}

		this.layer.draw();
	}
}

new App("container");