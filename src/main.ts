import Konva from "konva";
import { ScreenSwitcher, Screen, ScreenController, View, Difficulty } from "./types";
import { STAGE_WIDTH, STAGE_HEIGHT } from "./constants";
import { MenuScreenController } from "./screens/MenuScreen/MenuScreenController";
import { GameScreenController } from "./screens/GameScreen/GameScreenController";
import { DifficultyScreenController } from "./screens/DifficultyScreen/DifficultyScreenController";
import { TutorialScreenController } from "./screens/TutorialScreen/TutorialScreenController";
import { OrderScreenController } from "./screens/OrderScreen/OrderScreenController";
import { ResultScreenController } from "./screens/ResultScreen/ResultScreenController";
import { Minigame2Controller } from "./screens/Minigame2Screen/Minigame2Controller";
import { ResultStore } from "./data/ResultStore";	

class App implements ScreenSwitcher {
	private stage: Konva.Stage;
	private layer: Konva.Layer;

	private currentDifficulty: Difficulty = "proper"
	getCurrentDifficulty() {
		return this.currentDifficulty;
	}
	
	private resultStore: ResultStore;
	private menuController: MenuScreenController;
	private gameController: GameScreenController;
	private difficultyController: DifficultyScreenController;
	private tutorialController: TutorialScreenController;
    private orderController: OrderScreenController;
    private resultsController: ResultScreenController;
    private minigame2Controller: Minigame2Controller;

	constructor(container: string) {
		this.stage = new Konva.Stage({ container, width: STAGE_WIDTH, height: STAGE_HEIGHT });
		this.layer = new Konva.Layer();
		this.stage.add(this.layer);

		this.resultStore = new ResultStore();
		this.menuController = new MenuScreenController(this);
		this.gameController = new GameScreenController(this, this.resultStore);
		this.difficultyController = new DifficultyScreenController(this);
		this.tutorialController = new TutorialScreenController(this);
		this.orderController = new OrderScreenController(this);
		this.resultsController = new ResultScreenController(this.layer, this, this.resultStore);
		this.minigame2Controller = new Minigame2Controller(this);

		this.layer.add(this.menuController.getView().getGroup());
		this.layer.add(this.gameController.getView().getGroup());
		this.layer.add(this.difficultyController.getView().getGroup());
		this.layer.add(this.tutorialController.getView().getGroup());
		this.layer.add(this.orderController.getView().getGroup());
		this.layer.add(this.resultsController.getView().getGroup());
		this.layer.add(this.minigame2Controller.getView().getGroup());

		// Start on the menu
		this.switchToScreen({ type: "menu"});
		// this.switchToScreen({ type: "minigame2" });
        //this.switchToScreen({type: "result", score: 21}); 
	}

	switchToScreen(screen: Screen): void {
		// hide all screens
		this.menuController.hide();
		this.gameController.hide();
		this.difficultyController.hide();
		this.tutorialController.hide();
        this.resultsController.hide();
        this.minigame2Controller.hide();
        this.orderController.hide();

		switch (screen.type) {
			case "menu":
				this.menuController.show();
				break;
			case "difficulty":
				this.difficultyController.show();
				break;
			case "game":
				// pass optional difficulty and order through to game controller
				// default to "proper" if no difficulty provided
				this.gameController.startGame(screen.difficulty??"proper", (screen as any).order);
				break;
			case "tutorial":
				this.tutorialController.show();
				break;
            case "order":
                this.orderController.show();
                break;
            case "result":
                this.resultsController.refreshFromStore();
				this.resultsController.show();
                break;    
				this.resultsController.setNextDayDifficulty(this.currentDifficulty);
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