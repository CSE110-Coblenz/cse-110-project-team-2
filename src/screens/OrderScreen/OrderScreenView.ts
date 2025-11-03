import Konva from "konva";
import type { View } from "../../types";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants";
import { ORDER_BG_COLOR, ORDER_TITLE_COLOR, ORDER_BUTTON_FILL, ORDER_BUTTON_STROKE } from "../../constants";
import type { Order } from "../../types";
import type { OrderScreenModel } from "./OrderScreenModel";

export class OrderScreenView implements View {
    private group: Konva.Group;
    private model: OrderScreenModel;
    private orderText: Konva.Text | null = null;

    constructor(model: OrderScreenModel, onAccept: () => void) {
        this.model = model;
        this.group = new Konva.Group({ visible: false });

        // Background
        const bg = new Konva.Rect({
            x: 0,
            y: 0,
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            fill: ORDER_BG_COLOR,
        });

        const title = new Konva.Text({
            x: STAGE_WIDTH / 2,
            y: 60,
            text: "New Order",
            fontSize: 48,
            fontFamily: "Arial Black",
            fill: ORDER_TITLE_COLOR,
            align: "center",
        });
        title.offsetX(title.width() / 2);

        const order = this.model.getOrder();

        this.orderText = new Konva.Text({
            x: STAGE_WIDTH / 2,
            y: 160,
            text: `${order.fraction} ${order.topping}`,
            fontSize: 34,
            fontFamily: "Arial",
            fill: "#333",
            align: "center",
        });
        this.orderText.offsetX(this.orderText.width() / 2);
        this.orderText.name("orderText");

        const acceptGroup = new Konva.Group({ x: STAGE_WIDTH / 2 - 90, y: STAGE_HEIGHT - 120 });
        const acceptBtn = new Konva.Rect({ width: 180, height: 56, fill: ORDER_BUTTON_FILL, cornerRadius: 8, stroke: ORDER_BUTTON_STROKE, strokeWidth: 2 });
        const acceptText = new Konva.Text({ x: 90, y: 18, text: "Sounds good", fontSize: 20, fill: "white" });
        acceptText.offsetX(acceptText.width() / 2);
        acceptText.offsetY(acceptText.height() / 2);
        acceptGroup.add(acceptBtn, acceptText);
        acceptGroup.on("click", onAccept);

        this.group.add(bg, title, this.orderText, acceptGroup);
    }

    invalidate(): void {
        const order = this.model.getOrder();
        if (this.orderText) {
            this.orderText.text(`${order.fraction} ${order.topping}`);
            this.orderText.offsetX(this.orderText.width() / 2);
        }
        this.group.getLayer()?.draw();
    }

    show(): void {
        this.group.visible(true);
        this.group.getLayer()?.draw();
    }

    hide(): void {
        this.group.visible(false);
        this.group.getLayer()?.draw();
    }

    getGroup(): Konva.Group {
        return this.group;
    }
}
