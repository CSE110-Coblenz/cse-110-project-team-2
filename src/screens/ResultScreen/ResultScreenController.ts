import Konva from "konva";
import { ResultScreenView } from "./ResultScreenView"; 
import { ScreenController, ScreenSwitcher } from "../../types";
import { STAGE_HEIGHT, STAGE_WIDTH } from "../../constants";
import { Difficulty } from "../../types";
import { ResultStore } from "../../data/ResultStore";
import { OrderResult } from "../../data/OrderResult";
import { builderRecommendationMessage, computeStats, getWrongOrderSummaries } from "./ResultScreenModel";
import { FONTS } from "../../fonts";

export class ResultScreenController extends ScreenController{
    private view: ResultScreenView;
    private nextDayDifficulty: Difficulty = "proper";

    private wrongOrdersContent?: Konva.Group;
    private wrongOrdersScrollY = 0;

    private renderWrongOrdersScreen = (wrongOrders: Konva.Group) => {
        if(!this.wrongOrdersContent) return;

        // Clear previous content
        this.wrongOrdersContent.destroyChildren();
        this.wrongOrdersScrollY = 0;
        this.wrongOrdersContent.y(80);

        
        const summaries = getWrongOrderSummaries(this.resultStore.getAll());

        let y = 0;
        const lineHeight = 20;

        if(summaries.length === 0) {
            this.wrongOrdersContent.add(new Konva.Text({
                x: 20,
                y,
                text: "No wrong orders! Great job!",
                fontSize: 18,
                fill: "black",
                fontFamily: FONTS.BODY,
            }));
            wrongOrders.getLayer()?.draw();
            return;
        }

        for(const result of summaries) {
            this.wrongOrdersContent.add(new Konva.Text({
                x: 20,
                y,
                text: `Order #${result.orderNumber}:`,
                fontSize: 18,
                fontStyle: "bold",
                fill: "black",
                fontFamily: FONTS.BODY,
            }));
            y += lineHeight + 4;

            this.wrongOrdersContent.add(new Konva.Text({
                x: 40,
                y,
                text: result.details,
                fontSize: 16,
                fill: "black",
                fontFamily: FONTS.BODY,
            }));
            y += lineHeight * (result.details.split("\n").length + 1);
        }

        wrongOrders.getLayer()?.draw();
    };


    constructor(private layer: Konva.Layer, private switcher: ScreenSwitcher, private resultStore: ResultStore) {
        super();
        this.view = new ResultScreenView();

        //Helper function that creates screens to test for button functionality
        const placeHolderScreen = (label: string, fill: string = "#1f2937") => {
            const g = new Konva.Group({visible: false, listening: true});
            g.add(new Konva.Rect({x: 0, y: 0, width: STAGE_WIDTH, height: STAGE_HEIGHT, fill}));
            const title = new Konva.Text({
                x: 20, 
                y: 20,
                width: STAGE_WIDTH,
                text: label,
                align: "center",
                fontSize: 28, 
                fontStyle: "bold",
                fill: "black",
                fontFamily: FONTS.HEADER,
            });
            g.add(title);
            this.layer.add(g);
            return g;
        };

        const wrongOrders = placeHolderScreen("Wrong Orders", "#fde68a");
        const nextDay = placeHolderScreen("Next Day", "#fde68a");

        this.wrongOrdersContent = new Konva.Group ({
            x: 0,
            y: 80,
        });
        wrongOrders.add(this.wrongOrdersContent);

        wrongOrders.on("wheel", (evt) => {
            if(!this.wrongOrdersContent) return;
            evt.evt.preventDefault();

            const delta = evt.evt.deltaY;
            this.wrongOrdersScrollY -= delta;

            // clamp scrolling
            const minY = -1000;
            const maxY = 80;
            if(this.wrongOrdersScrollY < minY) this.wrongOrdersScrollY = minY;
            if(this.wrongOrdersScrollY > maxY) this.wrongOrdersScrollY = maxY;

            this.wrongOrdersContent.y(this.wrongOrdersScrollY);
            this.layer.draw();
        });

        const makeButton = (
            x: number,
            y: number,
            labelText: string,
            onClick: () => void
        ): Konva.Group => {
            const width = 140;
            const height = 40;

            const g = new Konva.Group({
                x,
                y,
                listening: true,
            });

            const rect = new Konva.Rect({
                x: 0, 
                y: 0,
                width,
                height,
                fill: "#e5e7eb",
                stroke: "black",
                strokeWidth: 2,
                cornerRadius: 10,
            });

            const label = new Konva.Text({
                x: 12,
                y: 10,
                text: labelText,
                fontSize: 18,
                fill: "black",
                fontFamily: FONTS.BUTTON,
            });

            g.add(rect, label);
            g.on("mouseenter", () => {document.body.style.cursor = "pointer"});
            g.on("mouseleave", () => (document.body.style.cursor = "default"));
            g.on("click", onClick)
            return g;;
        }

        const backButton = makeButton(
            STAGE_WIDTH - 160,
            STAGE_HEIGHT - 60,
            "Back",
            () => {
                show(this.view.getGroup());
            }
        );
        
        const recommendStudyButton = makeButton( 
            STAGE_WIDTH - 160,
            20,
            "Study Tips",
            () => {
                const message = builderRecommendationMessage(this.resultStore.getAll());
                this.view.showRecommendationPopup(message, wrongOrders);
            }
        );

        wrongOrders.add(backButton);
        wrongOrders.add(recommendStudyButton);
        
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

        this.view.onEndGame = () => {
            this.resultStore.clear();
            this.switcher.switchToScreen({type: "menu"});
        };

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
        const totalTips = this.resultStore.getTotalTips();

        const stats = computeStats(results, totalTips);
        this.view.updateStats(stats);
    }

    //Updates the numbers displayed on the screen
    setStats(stats: {
        ordersReceived: number;
        ordersCorrect: number;
        tipsReceived: number;
    }) {
        this.view.updateStats(stats);
    }
}
