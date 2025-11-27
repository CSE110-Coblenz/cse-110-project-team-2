import Konva from "konva";
import { ResultsScreenView } from "./ResultScreenView"; 
import { ScreenController, ScreenSwitcher } from "../../types";
import { STAGE_HEIGHT, STAGE_WIDTH } from "../../constants";
import { Difficulty } from "../../types";
import { ResultStore } from "../../data/ResultStore";
import { OrderResult } from "../../data/OrderResult";

export class ResultScreenController extends ScreenController{
    private view: ResultsScreenView;
    private nextDayDifficulty: Difficulty = "proper";

    private renderWrongOrdersScreen = (wrongOrders: Konva.Group) => {
        const children = wrongOrders.getChildren();
        const backButton = children[children.length - 1];
        wrongOrders.removeChildren();

        wrongOrders.add(new Konva.Rect({
            x: 0,
            y: 0, 
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            fill: "#fde68a",
        }));

        wrongOrders.add(new Konva.Text({ 
            x: 20, 
            y: 20, 
            text: "Wrong Orders",
            fontSize: 28,
            fontStyle: "bold",
            fill: "black"
        }));

        wrongOrders.add(backButton);

        const results = this.resultStore.getAll().filter(r => !r.success);

        let y = 80;
        const lineHeight = 20;

        if(results.length === 0) {
            wrongOrders.add(new Konva.Text({
                x: 20,
                y,
                text: "No wrong orders! Great job!",
                fontSize: 20,
                fill: "black"
            }));
            return;
        } 

        for (const result of results) {
            wrongOrders.add(new Konva.Text({
                x: 20,
                y, 
                text: `Day ${result.day} - Order #${result.orderNumber}`,
                fontSize: 20,
                fill: "black"
            }));
            y += lineHeight + 4;
                
            wrongOrders.add(new Konva.Text({
                x: 40, 
                y,
                text: result.details,
                fontSize: 16,
                fill: "black"
            }));
            y += lineHeight * (result.details.split("\n").length + 1);

            if(y > STAGE_HEIGHT - 60) {
                wrongOrders.add(new Konva.Text({
                    x: 20,
                    y,
                    text: "...more wrong orders not shown.",
                    fontSize: 16,
                    fill: "black"
                }));
                break;
            }                
        }
    };

    constructor(private layer: Konva.Layer, private switcher: ScreenSwitcher, private resultStore: ResultStore) {
        super();
        this.view = new ResultsScreenView();

        //Helper function that creates screens to test for button functionality
        const placeHolderScreen = (label: string, fill: string = "#1f2937") => {
            const g = new Konva.Group({visible: false, listening: true});
            g.add(new Konva.Rect({x: 0, y: 0, width: STAGE_WIDTH, height: STAGE_HEIGHT, fill}));
            g.add(new Konva.Text({x: 20, y: 20, text: label, fontSize: 28, fontStyle: "bold", fill: "black"}));
            this.layer.add(g);
            return g;
        };

        const wrongOrders = placeHolderScreen("Wrong Orders Screen", "#fde68a");
        const nextDay = placeHolderScreen("Next Day Screen", "#fde68a");

        const makeBackButton = (onClick: () => void): Konva.Group => {
            const width = 120;
            const height = 40;
            const g = new Konva.Group({x: STAGE_WIDTH - width - 40, y: STAGE_HEIGHT - height - 40, listening: true });
            const rect  = new Konva.Rect({
                x: 0,
                y: 0,
                width,
                height,    
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
        
        //Hides all locally-owned groups and shows one
        const show = (g: Konva.Group) => {
            this.view.getGroup().visible(false);
            wrongOrders.visible(false);
            nextDay.visible(false);
            g.visible(true);
            this.layer.draw()
        };

        this.view.onViewWrongOrders = () => {
            this.renderWrongOrdersScreen(wrongOrders);
            show(wrongOrders);  
        };

        this.view.onEndGame = () => this.switcher.switchToScreen({type: "menu"});
        this.view.onNextDay = () => { 
            this.resultStore.clear();
            this.switcher.switchToScreen({
            type: "order",
            mode: this.nextDayDifficulty
            });
        };
        
        show(this.view.getGroup());
    }

    setNextDayDifficulty(d: Difficulty) {
        this.nextDayDifficulty = d;
    }

    getView() {
        return this.view
    }

    refreshFromStore() {
        const results: OrderResult[] = this.resultStore.getAll();
        const ordersReceived = results.length;
        const ordersCorrect = results.filter(r => r.success).length;
        const tipsReceived = 0
        const totalTips = 0;
        this.view.updateStats({
            ordersReceived,
            ordersCorrect,
            tipsReceived,
            totalTips
        });
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
