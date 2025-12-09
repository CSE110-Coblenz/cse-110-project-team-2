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
    private nextDayDifficulty: Difficulty;

    // Container that holds scrollable wrong orders content on wrong orders screen
    private wrongOrdersContent?: Konva.Group;
    // Current vertical scroll position of wrong orders content
    private wrongOrdersScrollY = 0;

    // Renders the wrong orders screen content based on ResultStore data
    private renderWrongOrdersScreen = (wrongOrders: Konva.Group) => {
        if(!this.wrongOrdersContent) return;

        // Clear previous content
        this.wrongOrdersContent.destroyChildren();
        this.wrongOrdersScrollY = 0;
        this.wrongOrdersContent.y(80);

        // Get summaries of wrong orders from the model 
        const summaries = getWrongOrderSummaries(this.resultStore.getAll());

        let y = 0;
        const lineHeight = 20;

        // If no wrong orders, display a message
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

        // Otherwise, render each wrong order summary
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

            // Details of what went wrong on that order
            this.wrongOrdersContent.add(new Konva.Text({
                x: 40,
                y,
                text: result.details,
                fontSize: 16,
                fill: "black",
                fontFamily: FONTS.BODY,
            }));

            // Advance y position by a line per line in details 
            y += lineHeight * (result.details.split("\n").length + 1);
        }

        // Redraw the layer to show updates
        wrongOrders.getLayer()?.draw();
    };


    constructor(private layer: Konva.Layer, private switcher: ScreenSwitcher, private resultStore: ResultStore, currentDifficulty: Difficulty) {
        super();
        this.view = new ResultScreenView();
        this.nextDayDifficulty = currentDifficulty;

        //Helper function that creates "placeholder" full screen groups.
        // These are used as sub-screen (Wrong Orders, Next Day) that can be switched to.
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

        // Sub-screen for showing wrong orders
        const wrongOrders = placeHolderScreen("Wrong Orders", "#fde68a");
        // Sub-screen for next day (screen not used, but defines nextDay)
        const nextDay = placeHolderScreen("Next Day", "#fde68a");

        // Group that holds scrollable wrong-orders content
        this.wrongOrdersContent = new Konva.Group ({
            x: 0,
            y: 80, // initial y position so content appears below the header
        });
        wrongOrders.add(this.wrongOrdersContent);

        // Enable mouse-wheel scrolling on wrong orders screen
        wrongOrders.on("wheel", (evt) => {
            if(!this.wrongOrdersContent) return;
            evt.evt.preventDefault();

            const delta = evt.evt.deltaY;
            // Scroll in opposite direction of wheel delta.
            this.wrongOrdersScrollY -= delta;

            // clamp scrolling so content can't be scrolled too far 
            const minY = -1000; // max scroll up (arbitrary large negative)
            const maxY = 80; // original position (can't scroll below original)
            if(this.wrongOrdersScrollY < minY) this.wrongOrdersScrollY = minY;
            if(this.wrongOrdersScrollY > maxY) this.wrongOrdersScrollY = maxY;

            this.wrongOrdersContent.y(this.wrongOrdersScrollY);
            this.layer.draw();
        });

        // Helper to create buttons
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

        // "Back" button for wrong orders screen to return to main results screen
        const backButton = makeButton(
            STAGE_WIDTH - 160,
            STAGE_HEIGHT - 60,
            "Back",
            () => {
                show(this.view.getGroup());
            }
        );
        
        // Button to open a popup with study recommendations
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
        
        //Hides all locally-owned groups and shows exactly one
        const show = (g: Konva.Group) => {
            this.view.getGroup().visible(false);
            wrongOrders.visible(false);
            nextDay.visible(false);
            g.visible(true);
            this.layer.draw()
        };

        // View callback: open wrong orders from main results screen
        this.view.onViewWrongOrders = () => {
            this.renderWrongOrdersScreen(wrongOrders);
            show(wrongOrders);  
        };

        // View callback: "End Game" button to return to main menu
        this.view.onEndGame = () => {
            this.resultStore.clear();
            this.switcher.switchToScreen({type: "menu"});
        };

        // View callback: "Next Day" button to continue playing 
        this.view.onNextDay = () => { 
            this.resultStore.clear();
            this.switcher.switchToScreen({
            type: "order",
            mode: this.nextDayDifficulty
            });
        };
        
        // Start by showing main results screen
        show(this.view.getGroup());
    }

    // Allow external code to set next day's difficulty
    setNextDayDifficulty(d: Difficulty) {
        this.nextDayDifficulty = d;
    }

    getView() {
        return this.view
    }

    // Pulls latest results from ResultStore and updates the screen
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