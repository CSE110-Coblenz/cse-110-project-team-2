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

        const wrongOrders = placeHolderScreen("Wrong Orders", "red");
        const endGame = placeHolderScreen("End Game", "red");
        const nextDay = placeHolderScreen("Next Day", "red");
        
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
