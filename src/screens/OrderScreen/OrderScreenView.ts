import Konva from "konva";
import type { View } from "../../types";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants";
import { ORDER_TITLE_COLOR, ORDER_BUTTON_FILL, ORDER_BUTTON_STROKE, SCREEN_OVERLAY, SCREEN_BACKGROUNDS } from "../../constants";
import type { Order } from "../../types";
import type { OrderScreenModel } from "./OrderScreenModel";
import { FONTS } from "../../fonts";

export class OrderScreenView implements View {
    private group: Konva.Group;
    private model: OrderScreenModel;
    private orderText: Konva.Text | null = null;
    private bubbleRect: Konva.Rect | null = null;
    private bubbleTail: Konva.Line | null = null;
    private restaurantRect: Konva.Rect | null = null;
    private restaurantTail: Konva.Line | null = null;
    private restaurantText: Konva.Text | null = null;

    constructor(model: OrderScreenModel, onAccept: () => void) {
        this.model = model;
        this.group = new Konva.Group({ visible: false });

        const bgImg = new Image();
        bgImg.src = SCREEN_BACKGROUNDS.MENU;
        const bgKonva = new Konva.Image({ x: 0, y: 0, image: undefined, width: STAGE_WIDTH, height: STAGE_HEIGHT, listening: false });
        bgImg.onload = () => {
            bgKonva.image(bgImg);
            this.group.getLayer()?.batchDraw();
        };

        const overlay = new Konva.Rect({
            x: 0,
            y: 0,
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            fill: SCREEN_OVERLAY.COLOR,
        });        

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

            const bubblePadding = 16;
            const bubbleX = orderAreaX - bubblePadding;
            const textX = orderAreaX;

            const restText = "Slice by Slice! What can I get for you?";
            const restW = Math.min(300, orderAreaWidth + bubblePadding);
            const restH = 88;
            const restX = orderAreaX + orderAreaWidth - restW;
            const restY = phone.y() + 10;

            const orderTextYStart = restY + restH + 12;

            if (!this.orderText) {
                this.restaurantRect = new Konva.Rect({
                    x: restX,
                    y: restY,
                    width: restW,
                    height: restH,
                    fill: "#ffffff",
                    cornerRadius: 10,
                    shadowColor: "#000",
                    shadowBlur: 6,
                    shadowOpacity: 0.10,
                    stroke: "#e0e0e0",
                    strokeWidth: 3,
                });

                const rTailSize = 10;
                const rMidY = restY + restH / 2;
                const rTailX1 = restX + restW;
                const rTailX2 = rTailX1 + rTailSize;
                this.restaurantTail = new Konva.Line({
                    points: [rTailX1, rMidY - rTailSize, rTailX2, rMidY, rTailX1, rMidY + rTailSize],
                    fill: "#ffffff",
                    closed: true,
                    listening: false,
                });

                this.restaurantText = new Konva.Text({
                    x: restX + 12,
                    y: restY + 12,
                    width: restW - 24,
                    text: restText,
                    fontSize: 26,
                    fontFamily: FONTS.BODY,
                    fill: "#222",
                    align: "left",
                    lineHeight: 1.2,
                });

                this.orderText = new Konva.Text({
                    x: textX,
                    y: orderTextYStart + 10,
                    width: orderAreaWidth,
                    text: orderLines.join("\n"),
                    fontSize: 26,
                    fontFamily: FONTS.BODY,
                    fill: "#333",
                    align: "left",
                    lineHeight: 1.4,
                });
                this.orderText.name("orderText");

                const measuredH = this.orderText.height();
                const bubbleW = orderAreaWidth + bubblePadding * 2;
                const bubbleH = measuredH + 28;
                const bubbleY = orderTextYStart;

                this.bubbleRect = new Konva.Rect({
                    x: bubbleX,
                    y: bubbleY,
                    width: bubbleW,
                    height: bubbleH,
                    fill: "#ffffff",
                    cornerRadius: 12,
                    shadowColor: "#000",
                    shadowBlur: 8,
                    shadowOpacity: 0.12,
                    stroke: "#e0e0e0",
                    strokeWidth: 3,
                });

                const tailSize = 12;
                const tailMidY = bubbleY + bubbleH / 2;
                const tailX1 = bubbleX;
                const tailX2 = bubbleX - tailSize;
                this.bubbleTail = new Konva.Line({
                    points: [tailX1, tailMidY - tailSize, tailX2, tailMidY, tailX1, tailMidY + tailSize],
                    fill: "#ffffff",
                    closed: true,
                    listening: false,
                });

                this.group.add(this.restaurantRect, this.restaurantTail, this.restaurantText, this.bubbleRect, this.bubbleTail, this.orderText);
            } else {
                if (this.restaurantRect && this.restaurantTail && this.restaurantText) {
                    const restWcur = this.restaurantRect.width();
                    const restXcur = orderAreaX + orderAreaWidth - restWcur;
                    this.restaurantRect.x(restXcur);
                    this.restaurantRect.y(restY);
                    this.restaurantText.x(restXcur + 12);
                    this.restaurantText.y(restY + 12);
                    const rMidY2 = restY + this.restaurantRect.height() / 2;
                    const rTailX1b = restXcur + restWcur;
                    const rTailX2b = rTailX1b + 10;
                    this.restaurantTail.points([rTailX1b, rMidY2 - 10, rTailX2b, rMidY2, rTailX1b, rMidY2 + 10]);
                }

                const orderY = restY + restH + 12;
                if (this.orderText) {
                    this.orderText.width(orderAreaWidth);
                    this.orderText.x(textX);
                    this.orderText.y(orderY + 10);
                    this.orderText.text(orderLines.join("\n"));
                }

                if (this.bubbleRect) {
                    const measuredH = this.orderText ? this.orderText.height() : 0;
                    const bubbleW = orderAreaWidth + bubblePadding * 2;
                    const bubbleH = measuredH + 28;
                    this.bubbleRect.x(bubbleX);
                    this.bubbleRect.y(orderY);
                    this.bubbleRect.width(bubbleW);
                    this.bubbleRect.height(bubbleH);
                }

                if (this.bubbleTail && this.bubbleRect) {
                    const bubbleH2 = this.bubbleRect.height();
                    const tailSize2 = 12;
                    const tailMidY2 = orderY + bubbleH2 / 2;
                    const tailX1b = bubbleX;
                    const tailX2b = bubbleX - tailSize2;
                    this.bubbleTail.points([tailX1b, tailMidY2 - tailSize2, tailX2b, tailMidY2, tailX1b, tailMidY2 + tailSize2]);
                }
            }

            this.group.getLayer()?.batchDraw();
        };

        const acceptGroup = new Konva.Group({ x: STAGE_WIDTH / 2 - 90, y: STAGE_HEIGHT - 120 });
        const acceptBtn = new Konva.Rect({ width: 180, height: 56, fill: ORDER_BUTTON_FILL, cornerRadius: 8, stroke: ORDER_BUTTON_STROKE, strokeWidth: 2 });
        const acceptText = new Konva.Text({ x: 90, y: 18, text: "Sounds good", fontFamily: FONTS.BUTTON, fontSize: 20, fill: "white" });
        acceptText.offsetX(acceptText.width() / 2);
        acceptText.offsetY(acceptText.height() / 2);
        acceptGroup.add(acceptBtn, acceptText);
        acceptGroup.on("click", onAccept);

    this.group.add(bgKonva, overlay, phone, acceptGroup);
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
