import Konva from "konva";
import { ResultsScreenView } from "./ResultScreenView"; 
import { ScreenController, ScreenSwitcher } from "../../types";
import { STAGE_HEIGHT, STAGE_WIDTH } from "../../constants";

export class ResultScreenController extends ScreenController{
    private view: ResultsScreenView;

    constructor(private layer: Konva.Layer, private switcher: ScreenSwitcher) {
        super();
        this.view = new ResultsScreenView();

        //Helper function that creates screens to test for button functionality
        const placeHolderScreen = (label: string, fill: string = "#1f2937") => {
            const g = new Konva.Group({visible: false, listening: true});
            g.add(new Konva.Rect({x: 0, y: 0, width: STAGE_WIDTH, height: STAGE_HEIGHT, fill}));
            g.add(new Konva.Text({x: 20, y: 20, text: label, fontSize: 28, fill: "white"}));
            this.layer.add(g);
            return g;
        }

        const wrongOrders = placeHolderScreen("Wrong Orders", "#fde68a");
        const endGame = placeHolderScreen("End Game", "#fde68a");
        const nextDay = placeHolderScreen("Next Day", "#fde68a");

        const makeBackButton = (onClick: () => void): Konva.Group => {
            const width = 120;
            const height = 40;
            const g = new Konva.Group({x: STAGE_WIDTH - width - 40, y: STAGE_HEIGHT - height - 40, listening: true });
            const rect  = new Konva.Rect({
                fill: "#e5e7eb",
                stroke: "black",
                strokeWidth: 2,
                cornerRadius: 10
            });
            const label = new Konva.Text({text: "Back", x: 12, y: 10, fontSize: 18, fill: "black"});
            g.add(rect, label);
            g.on("mouseenter", () => document.body.style.cursor = "pointer")
            g.on("mouseleave", () => document.body.style.cursor = "default")
            g.on("click", onClick);
            return g;
        }

        wrongOrders.add(makeBackButton(() => show(this.view.getGroup())));
        endGame.add(makeBackButton(() => show(this.view.getGroup())));
        nextDay.add(makeBackButton(() => show(this.view.getGroup())));
        
        //Hides all locally-owned groups and shows one
        const show = (g: Konva.Group) => {
            this.view.getGroup().visible(false);
            wrongOrders.visible(false);
            endGame.visible(false);
            nextDay.visible(false);
            g.visible(true);
            this.layer.draw()
        };

        this.view.onViewWrongOrders = () => show(wrongOrders);
        this.view.onEndGame = () => show(endGame);
        this.view.onNextDay = () => show(nextDay);
        
        show(this.view.getGroup());

        //this.view.onViewWrongOrders = () => 
            //this.switcher.switchToScreen({type: "game"});
        

        //this.view.onEndGame = () => 
            //this.switcher.switchToScreen({type: "menu"});

        //this.view.onNextDay = () => 
            //this.switcher.switchToScreen({type: "game"});
        

        //this.layer.add(this.view.getGroup());
    }

    getView() {
        return this.view
    }

    //Updates the numbers displayed on the screen
    setStats(stats: {
        ordersReceived: number;
        ordersCorrect: number;
        tipsReceived: number;
        totalTips: number;
    }) {
        this.view.updateStats(stats);
    }
}
