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
import { ResultScreenController } from "../src/screens/ResultScreen/ResultScreenController";

class MockResultStore {
    results: any[] = [];
    totalTips: number = 0;
    clear = vi.fn();

    getAll() {
        return this.results;
    }

    getTotalTips() {
        return this.totalTips;
    }
}

describe("ResultScreenController", () => {
    let layer: any;
    let switcher: {switchToScreen: ReturnType<typeof vi.fn> };
    let store: MockResultStore;
    let controller: ResultScreenController;
    let view: any;
    let updateStatsSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        const Layer = (Konva as any).Layer;
        layer = new Layer();
        switcher = { switchToScreen: vi.fn() } as any;
        
        store = new MockResultStore();
        store.results = [];
        store.totalTips = 0;
        store.clear.mockClear();

        controller = new ResultScreenController(layer as any, switcher as any, store as any);

        view = controller.getView() as any;

        updateStatsSpy = vi.spyOn(view, "updateStats");
    });

    it("shows the main view results view by default", () => {
        const maingroup = view.getGroup();
        expect(maingroup.visible()).toBe(true);

        const children = layer.getChildren();
        expect(children.length).toBe(2);
    });

    it("refresheFromStore computes stats and passes them to the view", () => {
        store.results = [
            {success: true},
            {success: false},
            {success: true},
        ] as any;
        store.totalTips = 15;

        controller.refreshFromStore();

        expect(updateStatsSpy).toHaveBeenCalledTimes(1);
        expect(updateStatsSpy).toHaveBeenCalledWith({
            ordersReceived: 3,
            ordersCorrect: 2,
            tipsReceived: 15,
        });
    });

    it("setStats forward stats to the view's updateStats", () => {
        const stats = {
            ordersReceived: 10,
            ordersCorrect: 7,
            tipsReceived: 20,
        };

        controller.setStats(stats);

        expect(updateStatsSpy).toHaveBeenCalledWith(stats);
    });

    it("onEndGame clears store and swithes to menu", () => {
        view.onEndGame?.();

        expect(store.clear).toHaveBeenCalledTimes(1);
        expect(switcher.switchToScreen).toHaveBeenCalledWith({type: "menu"});
    });

    it("onNextDay clears store and switches to order screen with corrrect difficulty", () => {
        controller.setNextDayDifficulty("improper" as any);

        view.onNextDay?.();

        expect(store.clear).toHaveBeenCalledTimes(1);
        expect(switcher.switchToScreen).toHaveBeenCalledWith({ 
            type: "order", 
            mode: "improper",
        });
    });

    it("onViewWrongOrders populates wrong orders and shows that screen", () => {
        store.results = [
            {
                orderNumber: 1,
                success: false,
                details: "Pepperoni : expected 1/2 - current 1/4",
            },
            {
                orderNumber: 2,
                success: true,
                details: "All good",
            },
        ] as any;

        const wrongOrdersContnent = (controller as any).wrongOrdersContent;
        expect(wrongOrdersContnent).toBeDefined();
        expect(typeof view.onViewWrongOrders).toBe("function");

        // Simullate clicking "View Wrong Orders"
        view.onViewWrongOrders!();

        const contentChildren = wrongOrdersContnent.getChildren();
        expect(contentChildren.length).toBeGreaterThan(0);

        const layerChildren = layer.getChildren();
        const wrongOrdersScreen = layerChildren[0];
        const mainGroup = view.getGroup();
        
        // Wrong orders screen should be visible, main hidden
        expect(wrongOrdersScreen.visible()).toBe(true);
        expect(mainGroup.visible()).toBe(false);
    });

    it("builderRecommendationMessage mentions common denominators for wrong orders", () => {
        store.results = [
            {
                success: false,
                details: "Pepperoni : expected 1/4 - current 0/4",
            },
            {
                success: false,
                details: "Mushrooms : expected 3/4 - current 2/4",
            },
            {
                success: false,
                details: "Olives : expected 1/8 - current 0/8",
            },
        ] as any;
        
        const message = (controller as any).builderRecommendationMessage() as string;

        expect(message).toContain("denominator of 4");
        expect(message).not.toContain("denominator of 8");
    });
});