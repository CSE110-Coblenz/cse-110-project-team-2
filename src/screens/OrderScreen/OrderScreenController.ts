import { ScreenController } from "../../types";
import type { ScreenSwitcher } from "../../types";
import { OrderScreenView } from "./OrderScreenView";
import { OrderScreenModel } from "./OrderScreenModel";

export class OrderScreenController extends ScreenController {
    private view: OrderScreenView;
    private model: OrderScreenModel;
    private screenSwitcher: ScreenSwitcher;

    constructor(screenSwitcher: ScreenSwitcher) {
        super();
        this.screenSwitcher = screenSwitcher;
        this.model = new OrderScreenModel();
        this.view = new OrderScreenView(this.model, () => this.handleAccept());
    }

    private handleAccept(): void {
        // we don't forward the order to the game screen yet
        this.screenSwitcher.switchToScreen({ type: "game" } as any);
    }

    getView(): OrderScreenView {
        return this.view;
    }
}
