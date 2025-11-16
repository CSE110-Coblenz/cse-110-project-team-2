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

        const phoneImg = new Image();
        phoneImg.src = "/telephone.png";
        const phoneX = 20;
        const phone = new Konva.Image({ x: phoneX, y: 0, image: undefined, listening: false });
        phoneImg.onload = () => {
            phone.image(phoneImg);

            const naturalW = phoneImg.naturalWidth;
            const naturalH = phoneImg.naturalHeight;
            const maxH = STAGE_HEIGHT - 80;

            phone.width(naturalW);
            phone.height(naturalH);

            let scale = 1;
            if (naturalH > maxH) {
                scale = maxH / naturalH;
                phone.scale({ x: scale, y: scale });
            }

            const finalW = Math.round(naturalW * scale);
            const finalH = Math.round(naturalH * scale);
            phone.y(Math.floor((STAGE_HEIGHT - finalH) / 2));

            const orderAreaX = phone.x() + finalW + 40;
            const orderAreaWidth = STAGE_WIDTH - orderAreaX - 40;

            const orderLines = this.buildOrderLines(this.model.getOrder());

            if (!this.orderText) {
                this.orderText = new Konva.Text({
                    x: orderAreaX,
                    y: phone.y() + 20,
                    width: orderAreaWidth,
                    text: orderLines.join("\n"),
                    fontSize: 32,
                    fontFamily: "Arial",
                    fill: "#333",
                    align: "left",
                    lineHeight: 1.4,
                });
                this.orderText.name("orderText");
                this.group.add(this.orderText);
            } else {
                // update existing
                this.orderText.width(orderAreaWidth);
                this.orderText.x(orderAreaX);
                this.orderText.y(phone.y() + 20);
                this.orderText.text(orderLines.join("\n"));
            }

            this.group.getLayer()?.batchDraw();
        };

        const acceptGroup = new Konva.Group({ x: STAGE_WIDTH / 2 - 90, y: STAGE_HEIGHT - 120 });
        const acceptBtn = new Konva.Rect({ width: 180, height: 56, fill: ORDER_BUTTON_FILL, cornerRadius: 8, stroke: ORDER_BUTTON_STROKE, strokeWidth: 2 });
        const acceptText = new Konva.Text({ x: 90, y: 18, text: "Sounds good", fontSize: 20, fill: "white" });
        acceptText.offsetX(acceptText.width() / 2);
        acceptText.offsetY(acceptText.height() / 2);
        acceptGroup.add(acceptBtn, acceptText);
        acceptGroup.on("click", onAccept);

        this.group.add(bg, title, phone, acceptGroup);
    }

    private buildOrderLines(order: Order): string[] {
        const lines: string[] = [];
        const denom = order.fractionStruct?.denominator ?? (order.fraction ? parseInt(order.fraction.split('/')[1]) : 1);
        if (!order.toppingsCounts) return [`${order.fraction}`];
        for (const [t, c] of Object.entries(order.toppingsCounts)) {
            if ((c as number) > 0) {
                lines.push(`${c}/${denom} ${t}`);
            }
        }
        return lines.length ? lines : [`${order.fraction}`];
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

    // Refresh the displayed order from the current model state.
    refresh(): void {
        if (!this.orderText) return;
        const orderLines = this.buildOrderLines(this.model.getOrder());
        this.orderText.text(orderLines.join("\n"));
        this.group.getLayer()?.batchDraw();
    }
}
