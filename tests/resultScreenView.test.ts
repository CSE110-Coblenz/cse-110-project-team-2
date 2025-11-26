import { describe, it, expect, vi, beforeEach } from "vitest";

(globalThis as any).window = (globalThis as any). window ?? {};

class FakeImage {
    src: string = "";
    width = 100;
    height = 100;
    onload: (() => void) | null = null;
}
(globalThis as any).window.Image = FakeImage;

vi.mock("konva", () => {
    class BaseNode {
        attrs: Record<string, any>;
        parent: any = null;
        _handers: Record<string, (evt: any) => void> = {};

        constructor(attrs: Record<string, any> = {}) {
            this.attrs = { ...attrs };
        }

        destroy() {
            if(this.parent && this.parent.children) {
                this.parent.children = this.parent.children.filter((c: any) => c !== this);
            }
        }

        setAttr(key: string, value: any) {
            this.attrs[key] = value;
        }

        getAttr(key: string) {
            return this.attrs[key];
        }

        x(value?: number) {
            if(typeof value === "number") {
                this.attrs.x = value;
            }
            return this.attrs.x ?? 0;
        }

        y(value?: number) {
            if(typeof value === "number") {
                this.attrs.y = value;
            }
            return this.attrs.y ?? 0;
        }

        width(value?: number) {
            if(typeof value === "number") {
                this.attrs.width = value;
            }
            return this.attrs.width ?? 0;
        }

        height(value?: number) {
            if(typeof value === "number") {
                this.attrs.height = value;
            }
            return this.attrs.height ?? 0;
        }

        on(event: string, handler: (evt: any) => void) {
            this._handers[event] = handler;
        }

        trigger(event: string, evt: any = {}) {
            const h = this._handers[event];
            if(h) h(evt);
        }
    }

    class Group extends BaseNode {
        children: any[] = [];

        add(...nodes: any[]) {
            for(const n of nodes) {
                (n as any).parent = this;
                this.children.push(n);
            }
            return this
        }

        getChildren() {
            return this.children;
        }

        destroyChildren() {
            this.children = [];
        }

        y(value?: number) {
            if(typeof value === "number") {
                this.attrs.y = value;
            }
            return this.attrs.y ?? 0;
        }

        visible(value?: boolean) {
            if(typeof value === "boolean") {
                this.attrs.visible = value;
            }
            return this.attrs.visible ?? true;
        }

        draw() {    
            // no-op
        }

        getLayer() {
            if((this as any).draw && typeof (this as any).draw === "function") {
                return this;
            }
            if(this.parent && this.parent.draw) return this.parent;
            return null;
        }
    }

    class Rect extends BaseNode {}
    class Text extends BaseNode {
        text(value?: string) {
            if(typeof value === "string") {
                this.attrs.text = value;
            }
            return this.attrs.text;
        }
    }

    class Image extends BaseNode {}
    class Layer extends Group {
        draw() {
            // no-op
        }
    }

    const konvaMock = {
        Group,
        Rect,
        Text,
        Image,
        Layer,
    };
    return {
        default: konvaMock,
        ...konvaMock
    };
});

vi.mock("konva/lib/Group", () => {
    const Konva = require("konva") as any;
    return { Group: Konva.Group };
});

import Konva from "konva";
import { ResultScreenView } from "../src/screens/ResultScreen/ResultScreenView";

describe("ResultScreenView", () => {
    let view: ResultScreenView;
    let group: any;

    beforeEach(() => {
        view = new ResultScreenView();
        group = view.getGroup() as any;
    });

    it("starts hidden by default", () => {
        expect(group.visible()).toBe(false);
    });

    it("show() and hide() toggle visibility", () => {
        view.show();
        expect(group.visible()).toBe(true);

        view.hide();
        expect(group.visible()).toBe(false);
    });

    it("clicking 'View Wrong Orders' calls onViewWrongOrders", () => {
        const spy = vi.fn();
        view.onViewWrongOrders = spy;

        const children = group.getChildren();
        const TextClass = (Konva as any).Text;

        const buttonGroup = children.find((c: any) => {
            if(!(c instanceof Konva.Group)) return false;
            return c.getChildren().some((child: any) => child instanceof TextClass && child.text() === "View wrong orders");
        }) as any;

        expect(buttonGroup).toBeDefined();

        const evt = { cancelBubble: false };
        buttonGroup.trigger("click", evt);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(evt.cancelBubble).toBe(true);
    });

    it("clicking 'Home screen' calls onEndGame", () => {
        const spy = vi.fn();
        view.onEndGame = spy;

        const children = group.getChildren();
        const TextClass = (Konva as any).Text;

        const buttonGroup = children.find((c: any) => {
            if(!(c instanceof Konva.Group)) return false;
            return c.getChildren().some((child: any) => child instanceof TextClass && child.text() === "Home screen");
        }) as any;

        expect(buttonGroup).toBeDefined();

        buttonGroup.trigger("click", { cancelBubble: false });

        expect(spy).toHaveBeenCalledTimes(1);
    });

    it("clicking 'Continue Playing' calls onNextDay", () => {
        const spy = vi.fn();
        view.onNextDay = spy;

        const children = group.getChildren();
        const TextClass = (Konva as any).Text;

        const buttonGroup = children.find((c: any) => {
            if(!(c instanceof Konva.Group)) return false;
            return c.getChildren().some((child: any) => child instanceof TextClass && child.text() === "Continue Playing");
        }) as any;

        expect(buttonGroup).toBeDefined();

        buttonGroup.trigger("click", { cancelBubble: false });

        expect(spy).toHaveBeenCalledTimes(1);
    });

    it("updateStats updates the displayed numbers & percent correctly", () => {
        view.updateStats({
            ordersReceived: 5,
            ordersCorrect: 3,
            tipsReceived: 4.5,
        });

        const texts = group.getChildren().filter((c: any) => c instanceof Konva.Text) as any[];

        const values = texts.map((t) => t.text());

        expect(values).toContain("5");
        expect(values).toContain("3");
        expect(values).toContain("60.0%");
        expect(values).toContain("$4.50");
    });     

    it("updateStats handles zero orders correctly", () => {
        view.updateStats({
            ordersReceived: 0,
            ordersCorrect: 0,
            tipsReceived: 0,
        });
        
        const texts = group.getChildren().filter((c: any) => c instanceof Konva.Text) as any[];

        const values = texts.map((t) => t.text());

        expect(values).toContain("0");
        expect(values).toContain("0");
        expect(values).toContain("0.0%");
        expect(values).toContain("$0.00");
    });
});