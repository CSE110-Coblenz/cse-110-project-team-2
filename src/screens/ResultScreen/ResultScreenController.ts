
import Konva from "konva";
import { ResultScreenView } from "./ResultScreenView"; 
import { ScreenController, ScreenSwitcher } from "../../types";
import { STAGE_HEIGHT, STAGE_WIDTH } from "../../constants";
import { Difficulty } from "../../types";
import { ResultStore } from "../../data/ResultStore";
import { OrderResult } from "../../data/OrderResult";

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

        const results = this.resultStore.getAll().filter(r => !r.success);

        let y = 0;
        const lineHeight = 20;

        if(results.length === 0) {
            this.wrongOrdersContent.add(new Konva.Text({
                x: 20,
                y: y,
                text: "No wrong orders! Great job!",
                fontSize: 18,
                fill: "black",
            }));
            wrongOrders.getLayer()?.draw();
            return;
        }

        for(const result of results) {
            this.wrongOrdersContent.add(new Konva.Text({
                x: 20,
                y: y,
                text: `Order #: ${result.orderNumber}`,
                fontSize: 18,
                fill: "black",
            }));
            y += lineHeight + 4;

            this.wrongOrdersContent.add(new Konva.Text({
                x: 40,
                y: y,
                text: result.details,
                fontSize: 16,
                fill: "black",
            }));
            y += lineHeight * (result.details.split("\n").length + 1);
        }

        wrongOrders.getLayer()?.draw();
    };

    private showRecommendationPopup = (parent: Konva.Group, message: string) => {
        const overlay = new Konva.Rect({
            x: 0,
            y: 0,
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            fill: "rgba(0,0,0,0.4)",
            listening: true,
        });

        const bowW = 520;
        const bowH = 320;
        const boxX = (STAGE_WIDTH - bowW) / 2;
        const boxY = (STAGE_HEIGHT - bowH) / 2;

        const panel = new Konva.Rect({
            x: boxX,
            y: boxY,
            width: bowW,
            height: bowH,
            fill: "#fef3c7",
            stroke: "black",
            strokeWidth: 2,
            cornerRadius: 12,
        });

        const title = new Konva.Text({
            x: boxX,
            y: boxY + 16,
            width: bowW,
            align: "center",
            text: "Study Recommendations",
            fontSize: 24,
            fontStyle: "bold",
            fill: "black",
        });

        const body = new Konva.Text({
            x: boxX + 20,
            y: boxY + 60,
            width: bowW - 40,
            text: message,
            fontSize: 18,
            fill: "black",
        });

        const closeGroup = new Konva.Group({
            x: boxX + bowW - 110,
            y: boxY + bowH - 50,
            listening: true,
        });

        const closeRect = new Konva.Rect({
            width: 100,
            height: 40,
            fill: "#e5e7eb",
            stroke: "black",
            strokeWidth: 2,
            cornerRadius: 8,
        });

        const closeText = new Konva.Text({
            x: 0,
            y: 10,  
            align: "center",
            text: "Close",
            fontSize: 18,
            fill: "black",
        });

        closeGroup.add(closeRect, closeText);

        const destroyAll = () => {
            overlay.destroy();
            panel.destroy();
            title.destroy();
            body.destroy();
            closeGroup.destroy();
            parent.getLayer()?.draw();
        };
        
        closeGroup.on("click", destroyAll);
        overlay.on("click", destroyAll);

        parent.add(overlay, panel, title, body, closeGroup);
        parent.getLayer()?.draw();
    }

    private analyzeResults(): string [] {
        const wrong = this.resultStore.getAll().filter(r => !r.success);
        const freq: Record<string, number> = {};

        for(const r of wrong) {
            const lines = r.details.split("\n");
            for(const line of lines) {
                const match = line.match(/(.+) : expected (\d+)\/(\d+)\s+-\s+current (\d+)\/(\d+)/);
                if(!match) continue;

                const topping = match[1].trim();
                const expected = Number(match[2]);
                const total = Number(match[3]);
                const current = Number(match[4]);
                
                if(expected !== current) {
                    const fraction = `${expected}/${total}`;
                    const key = `${topping} (${fraction})`;
                    freq[key] = (freq[key] || 0) + 1;
                }
            }
        }

        return Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .map(([name, count]) => `${name} - missed ${count} time${count > 1 ? "s" : ""}`);
    }

    private getMostCommonDenominators(wrong : OrderResult[]): number[] {
        const denomCounts = new Map<number, number>();

        for(const r of wrong) {
            const lines = r.details.split("\n");
            for(const line of lines) {
                const match = line.match(/(\d+)\s*\/\s*(\d+)/);
                if(!match) continue;
                
                const denom = parseInt(match[2], 10);
                if(!Number.isFinite(denom)) continue;

                denomCounts.set(denom, (denomCounts.get(denom) ?? 0) + 1);
            }
        }

        if(denomCounts.size === 0) return [];

        let maxCount = 0;
        const mostCommon: number[] = [];

        for(const [denom, count] of denomCounts) {
            if(count > maxCount) {
                maxCount = count;
                mostCommon.length = 0;
                mostCommon.push(denom);
            } else if(count === maxCount) {
                mostCommon.push(denom);
            }
        }

        return mostCommon.sort((a, b) => a - b);
    }

    private builderRecommendationMessage(): string {
        const wrong = this.resultStore.getAll().filter(r => !r.success);
        if(wrong.length === 0) {
            return "You got all orders correct! Great job!";
        }

        const count = wrong.length;
        const commonDenoms = this.getMostCommonDenominators(wrong);

        let message = `You had ${count} incorrect order${count > 1 ? "s" : ""}.\n\n`;
    
        if(commonDenoms.length > 0) {
            const denomList = commonDenoms.join(", ");

            if(commonDenoms.length === 1) {
                const d = commonDenoms[0];
                message += `It looks like you had trouble with fractions involving ${d} slices. `;
                message += `Review how to work with fractions with a denominator of ${d}.\n\n`;
            } else {
                message += `It looks like you had trouble with fractions involving the following denominators: ${denomList}. `;
                message += `Review how to work with fractions with these denominators.\n\n`;
            }
        } else {
            message += `Your mistakes were varied. Keep practicing to improve your skills!\n\n`;
        }
        return message;
    }

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
                fill: "black"
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
                const message = this.builderRecommendationMessage();
                this.showRecommendationPopup(wrongOrders, message);
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
        const ordersReceived = results.length;
        const ordersCorrect = results.filter(r => r.success).length;
        const totalTips = this.resultStore.getTotalTips();
        const tipsReceived = totalTips
        this.view.updateStats({
            ordersReceived,
            ordersCorrect,
            tipsReceived,
        });
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