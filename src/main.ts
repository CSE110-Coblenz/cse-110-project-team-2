import Konva from "konva";
import { ScreenSwitcher, Screen, ScreenController, View } from "./types";
import { STAGE_WIDTH, STAGE_HEIGHT } from "./constants";
import { MenuScreenController } from "./screens/MenuScreen/MenuScreenController";
import { GameScreenController } from "./screens/GameScreen/GameScreenController";
import { TutorialScreenController } from "./screens/TutorialScreen/TutorialScreenController";
import { ResultScreenController } from "./screens/ResultScreen/ResultScreenController";
import { Minigame2Controller } from "./screens/Minigame2Screen/Minigame2Controller";

class App implements ScreenSwitcher {
	private stage: Konva.Stage;
	private layer: Konva.Layer;

	private menuController: MenuScreenController;
	private gameController: GameScreenController;
	private tutorialController: TutorialScreenController;
    private resultsController: ResultScreenController;
    private minigame2Controller: Minigame2Controller;

	constructor(container: string) {
		this.stage = new Konva.Stage({ container, width: STAGE_WIDTH, height: STAGE_HEIGHT });
		this.layer = new Konva.Layer();
		this.stage.add(this.layer);

		this.menuController = new MenuScreenController(this);
		this.gameController = new GameScreenController(this);
		this.tutorialController = new TutorialScreenController(this);
        this.resultsController = new ResultScreenController(this.layer, this);
        this.minigame2Controller = new Minigame2Controller(this);

		this.layer.add(this.menuController.getView().getGroup());
		this.layer.add(this.gameController.getView().getGroup());
		this.layer.add(this.tutorialController.getView().getGroup());
        this.layer.add(this.resultsController.getView().getGroup());
        this.layer.add(this.minigame2Controller.getView().getGroup());

		// Start on the menu
		this.switchToScreen({ type: "result", score: 21 });
		// this.switchToScreen({ type: "minigame2" });
        // this.switchToScreen{type: "result, score: 21"}); for testing
	}

	switchToScreen(screen: Screen): void {
		// hide all
		this.menuController.hide();
		this.gameController.hide();
		this.tutorialController.hide();
        this.resultsController.hide();
        this.minigame2Controller.hide();

		switch (screen.type) {
			case "menu":
				this.menuController.show();
				break;
			case "game":
				this.gameController.startGame();
				break;
			case "tutorial":
				this.tutorialController.show();
				break;
            case "result":
                this.resultsController.setStats({
                    ordersReceived: 25, //Dummy Values, will replaced later on
                    ordersCorrect: screen.score,
                    tipsReceived: 12,
                    totalTips: 42
                });
                this.resultsController.show();
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