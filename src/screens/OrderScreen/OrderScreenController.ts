import { ScreenController } from "../../types";
import type { ScreenSwitcher } from "../../types";
import { OrderScreenView } from "./OrderScreenView";
import { OrderScreenModel } from "./OrderScreenModel";
import type { Difficulty, Order } from "../../types";

export class OrderScreenController extends ScreenController {
    private view: OrderScreenView;
    private model: OrderScreenModel;
    private screenSwitcher: ScreenSwitcher;
    private currentMode?: Difficulty;

    constructor(screenSwitcher: ScreenSwitcher) {
        super();
        this.screenSwitcher = screenSwitcher;
        this.model = new OrderScreenModel();
        this.view = new OrderScreenView(this.model, () => this.handleAccept());
    }

    // Prepare the Order screen for a generation mode and update the view.
    // mode: 'proper' | 'improper' | 'mixed'
    prepareForMode(mode: Difficulty): void {
        this.currentMode = mode;
        if (mode === "proper") {
            this.model.generateRandomProperOrder();
        } else if (mode === "improper") {
            // use the improper generator added to the model
            (this.model as any).generateRandomImproperOrder?.();
        } else {
            // mixed: pick randomly between proper and improper
            if (Math.random() < 0.5) this.model.generateRandomProperOrder();
            else (this.model as any).generateRandomImproperOrder?.();
        }

        if ((this.view as any).refresh) (this.view as any).refresh();
    }

    private handleAccept(): void {
        // forward order to game
        const order=this.model.getOrder();
        this.screenSwitcher.switchToScreen({type:"game", order, difficulty: this.currentMode});
    }

    getView(): OrderScreenView {
        return this.view;
    }
}
