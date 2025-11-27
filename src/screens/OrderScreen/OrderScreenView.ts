import Konva from "konva";
import type { View } from "../../types";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants";
import { ORDER_TITLE_COLOR, ORDER_BUTTON_FILL, ORDER_BUTTON_STROKE, SCREEN_OVERLAY, SCREEN_BACKGROUNDS, ORDER_PHRASES } from "../../constants";
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
    private orderAreaX = 0;
    private orderAreaWidth = 0;
    private restW = 0;
    private restH = 0;
    private restY = 0;
    private bubblePadding = 16;

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

            const bubblePadding = this.bubblePadding;
            const bubbleX = orderAreaX - bubblePadding;
            const textX = orderAreaX;

            const restText = "Slice by Slice! What can I get for you?";
            const restW = orderAreaWidth + bubblePadding * 2;
            const restH = 88;
            const restX = bubbleX;
            const restY = phone.y() + 10;

            this.orderAreaX = orderAreaX;
            this.orderAreaWidth = orderAreaWidth;
            this.restW = restW;
            this.restH = restH;
            this.restY = restY;

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
                    fontSize: 32,
                    fontFamily: FONTS.BODY,
                    fill: "#222",
                    align: "left",
                    lineHeight: 1.25,
                });

                this.orderText = new Konva.Text({
                    x: textX,
                    y: orderTextYStart + 10,
                    width: orderAreaWidth,
                    text: orderLines.join("\n"),
                    fontSize: 32,
                    fontFamily: FONTS.BODY,
                    fill: "#333",
                    align: "left",
                    lineHeight: 1.35,
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

                this.restaurantRect.width(bubbleW);
                this.restaurantRect.x(bubbleX);
                this.restaurantText.width(bubbleW - 24);

                this.group.add(this.restaurantRect!, this.restaurantTail!, this.restaurantText!, this.bubbleRect!, this.bubbleTail!, this.orderText!);
            } else {
                this.updateLayout();
            }

            this.group.getLayer()?.batchDraw();
        };

    const acceptBtnW = 180;
    const acceptBtnH = 56;
    const acceptMargin = 24;
    const acceptGroup = new Konva.Group({ x: STAGE_WIDTH / 2 - acceptBtnW / 2, y: STAGE_HEIGHT - acceptMargin - acceptBtnH });
    const acceptBtn = new Konva.Rect({ width: acceptBtnW, height: acceptBtnH, fill: ORDER_BUTTON_FILL, cornerRadius: 8, stroke: ORDER_BUTTON_STROKE, strokeWidth: 2 });
    const acceptText = new Konva.Text({
        x: acceptBtnW / 2,
        y: acceptBtnH / 2,
        text: "Sounds good",
        fontFamily: "Arial Black",
        fontSize: 20,
        fill: "white",
    });
    acceptText.offsetX(acceptText.width() / 2);
    acceptText.offsetY(acceptText.height() / 2);
    acceptGroup.add(acceptBtn, acceptText);
    acceptGroup.on("click", onAccept);

    this.group.add(bgKonva, overlay, phone, acceptGroup);
    }

    private buildOrderLines(order: Order): string[] {
        const items: string[] = [];
        const denom = order.fractionStruct?.denominator ?? (order.fraction ? parseInt(order.fraction.split('/')[1]) : undefined);
        if (!order.toppingsCounts) return [`${order.fraction}`];
        for (const [t, c] of Object.entries(order.toppingsCounts)) {
            const count = c as number;
            if (count > 0) {
                if (denom) items.push(`${count}/${denom} ${t}`);
                else items.push(`${count} ${t}`);
            }
        }

        if (!items.length) return [`${order.fraction}`];

        let list = "";
        if (items.length === 1) list = items[0];
        else if (items.length === 2) list = `${items[0]} and ${items[1]}`;
        else {
            const last = items[items.length - 1];
            list = `${items.slice(0, items.length - 1).join(', ')}, and ${last}`;
        }

        const template = ORDER_PHRASES[Math.floor(Math.random() * ORDER_PHRASES.length)];
        const sentence = template.replace("LIST", list);
        return [sentence];
    }

    private updateLayout(): void {
        if (!this.orderText || !this.bubbleRect || !this.bubbleTail || !this.restaurantRect || !this.restaurantText || !this.restaurantTail) return;

        const orderLines = this.buildOrderLines(this.model.getOrder());
        const orderAreaW = this.orderAreaWidth || (STAGE_WIDTH - (this.orderAreaX || 0) - 40);

        // order text
        this.orderText.width(orderAreaW);
        this.orderText.text(orderLines.join("\n"));

        const measuredH = this.orderText.height();
        const bubbleW = orderAreaW + this.bubblePadding * 2;
        const bubbleH = measuredH + 28;
        const bubbleX = this.orderAreaX - this.bubblePadding;
        const orderY = this.restY + this.restH + 12;

        this.bubbleRect.x(bubbleX);
        this.bubbleRect.y(orderY);
        this.bubbleRect.width(bubbleW);
        this.bubbleRect.height(bubbleH);

        const tailSize = 12;
        const tailMidY = orderY + bubbleH / 2;
        this.bubbleTail.points([bubbleX, tailMidY - tailSize, bubbleX - tailSize, tailMidY, bubbleX, tailMidY + tailSize]);

        this.orderText.x(this.orderAreaX);
        this.orderText.y(orderY + 10);

    this.restaurantRect.width(bubbleW);
    this.restaurantRect.x(bubbleX);
    this.restaurantRect.y(this.restY);
    this.restaurantText.width(bubbleW - 24);
    this.restaurantText.x(bubbleX + 12);
    this.restaurantText.y(this.restY + 12);
    const rMidY2 = this.restY + this.restaurantRect.height() / 2;
    const rTailX1b = bubbleX + bubbleW;
    this.restaurantTail.points([rTailX1b, rMidY2 - 10, rTailX1b + 10, rMidY2, rTailX1b, rMidY2 + 10]);

        this.group.getLayer()?.batchDraw();
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
        this.updateLayout();
    }
}