import { describe, it, expect, vi, beforeEach } from "vitest";
import type { OrderResult} from "../src/data/OrderResult";  


// Konva mock 
vi.mock('konva', () => {
    class BaseNode {
        attrs: Record<string, any>;
        children: any[] = [];
        parent: any = null;
        _handlers: Record<string, (evt: any) => void> = {};

        constructor(attrs: Record<string, any> = {}) {
            this.attrs = { ...attrs };
        }

        add(...nodes: any[]) {
            for(const n of nodes) {
                this.children.push(n);
                n.parent = this;
            }
        }

        destroyChildren() {
            this.children = [];     
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

        on(event: string, handler: (evt: any) => void) {
            this._handlers[event] = handler;
        }

        trigger(event: string, evt: any = {}) {
            const h = this._handlers[event];
            if(h) h(evt);
        }

        visible(v?: boolean) {
            if(v === undefined) return this.attrs.visible ?? true;
            this.attrs.visible = v;
        }

        moveToBottom() {
            // no-op for testing
        }

        getLayer () {
            return { batchDraw: vi.fn() };
        }
    }

    class Group extends BaseNode {}
    class Rect extends BaseNode {}
    class Text extends BaseNode {
        width() {
            const text = this.attrs.text ?? "";
            return typeof text === "string" ? text.length * 8 : 100; 
        }

        height(v?: number) {
            if(v === undefined) {
                return this.attrs.height ?? 20;
            }
            this.attrs.height = v;
        }

        offsetX(v?: number) {
            if(v === undefined) return this.attrs.offsetX;
            this.attrs.offsetX = v;
        }

        offsetY(v?: number) {
            if(v === undefined) return this.attrs.offsetY;
            this.attrs.offsetY = v;
        }
    }

    class Image extends BaseNode {
        width() {
            return this.attrs.width ?? (this.attrs.image?.width ?? 100);
        }
        height() {
            return this.attrs.height ?? (this.attrs.image?.height ?? 100);
        }

        offsetX(v?: number) {
            if(v === undefined) return this.attrs.offsetX;
            this.attrs.offsetX = v;
        }

        offsetY(v?: number) {
            if(v === undefined) return this.attrs.offsetY;
            this.attrs.offsetY = v;
        }
    }

    const Konva = { Group, Rect, Text, Image };
    return {default: Konva };
});

vi.mock("../src/screens/MiniGame1Screen/MiniGame1Model", () => ({
    getScreenShotResults: vi.fn(),
    pickRandomPair: vi.fn(),
    pickRandomTopping: vi.fn(),
    evaluateChoice: vi.fn(),
}));

import * as MiniGame1Model from "../src/screens/Minigame1Screen/Minigame1Model";
import { Minigame1Controller } from "../src/screens/Minigame1Screen/Minigame1Controller";

const mockedModel = vi.mocked(MiniGame1Model);
const getScreenShotResultsMock = mockedModel.getScreenShotResults;
const pickRandomPairMock = mockedModel.pickRandomPair;
const pickRandomToppingMock = mockedModel.pickRandomTopping;
const evaluateChoiceMock = mockedModel.evaluateChoice;


beforeEach(() => {
    class HTMLImageMock {
        width = 200;
        height = 200
        src = "";
        onload: null | (() => void) = null;

        constructor() {
            setTimeout(() => {
                if(this.onload) this.onload();
            }, 0);
        }
    }
    
    (global as any).Image = HTMLImageMock;
    
    vi.clearAllMocks();
});

function createControllerWithDep(opts: {getAllReturn?: OrderResult[] } = {}) {
    const screenSwitcher = {
        switchToScreen: vi.fn(),
    };

    const audio = {
        musicStarted: vi.fn(),
    }; 

    const resultStore = {
        getAll: vi.fn().mockReturnValue(opts.getAllReturn ?? []),
        addTips: vi.fn(),
    };

    const controller = new Minigame1Controller(
        screenSwitcher as any,
        audio as any,
        resultStore as any
    );

    const view: any = controller.getView();

    return { controller, screenSwitcher, audio, resultStore, view };

}// tests 
describe("MiniGame1Controller", () => {
    it("constructor wires Minigame 2 button to screen switcher", () => {
        const { view, screenSwitcher} = createControllerWithDep();

        view.onGoToMinigame2();
        expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({ type: "minigame2" });

        view.onBackToGame();
        expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({ type: "game" });
    });

    it("show() displays the view and starts music", () => {
        const { controller, audio, view } = createControllerWithDep();

        const showSpy = vi.spyOn(view, "show");

        controller.show();
        expect(showSpy).toHaveBeenCalledTimes(1);
        expect(audio.musicStarted).toHaveBeenCalledTimes(1);
    });

    it("hide() hides the view", () => {
        const { controller, view } = createControllerWithDep();

        const hideSpy = vi.spyOn(view, "hide");
        
        controller.hide();
        expect(hideSpy).toHaveBeenCalledTimes(1);
    });

    it("startGame shows message when fewer than 2 order results exist", () => {
        const singleResult: OrderResult = { 
            screenshotDataUrl: "data-url-1", 
            success: true,
            order: { toppingsCounts: {} as any },
        } as any;
        
        getScreenShotResultsMock.mockReturnValue([singleResult]);

        const { controller, resultStore, view } = createControllerWithDep({
            getAllReturn: [singleResult],  
        });

        const getAllSpy = vi.spyOn(resultStore, "getAll");
        const showMessageSpy = vi.spyOn(view, "showMessage");

        controller.startGame();

        expect(getAllSpy).toHaveBeenCalledTimes(1);
        expect(getScreenShotResultsMock).toHaveBeenCalledWith([singleResult]);
        expect(showMessageSpy).toHaveBeenCalledWith("Not enough completed orders for today to play this minigame.");
        expect(showMessageSpy).toHaveBeenCalledTimes(1);
    });

    it("startGame picks two orders, render pair, and handles correct choice with tips", () => {
        const orderA: OrderResult = { 
            screenshotDataUrl: "a-url", 
            success: true,
            order: { toppingsCounts: {} as any },
        } as any;

        const orderB: OrderResult = { 
            screenshotDataUrl: "b-url", 
            success: true,
            order: { toppingsCounts: {} as any },
        } as any;

        getScreenShotResultsMock.mockReturnValue([orderA, orderB]);
        pickRandomPairMock.mockReturnValue({ a: orderA, b: orderB });
        pickRandomToppingMock.mockReturnValue("Pepperoni");
        evaluateChoiceMock.mockReturnValue({isCorrect: true, aCount: 3, bCount: 1, tipEarned: 2 });

        const { controller, resultStore, view } = createControllerWithDep({
            getAllReturn: [
                orderA,
                orderB,
            ],
        });

        const renderPairSpy = vi.spyOn(view, "renderPair");
        const showResultSpy = vi.spyOn(view, "showResult");
        const getAllSpy = vi.spyOn(resultStore, "getAll");

        const randomSpy = vi.spyOn(Math, "random");
        randomSpy
            .mockReturnValueOnce(0) // pick orderA
            .mockReturnValueOnce(0.5) // pick orderB
            .mockReturnValueOnce(0); // pick first topping
            
        controller.startGame();

        expect(getAllSpy).toHaveBeenCalledTimes(1);
        expect(renderPairSpy).toHaveBeenCalledTimes(1);

        const [renderedA, renderedB, topping, onChoice] = 
            renderPairSpy.mock.calls[0] as [
                OrderResult,
                OrderResult,
                string,
                (choice: "A" | "B" | "Equivalent") => void
            ];

        expect(renderedA).toBe(orderA);
        expect(renderedB).toBe(orderB);

        const toppingKey = topping as string;
        (orderA.order as any).toppingsCounts[toppingKey] = 3;
        (orderB.order as any).toppingsCounts[toppingKey] = 1;

        onChoice("A");

        expect(resultStore.addTips).toHaveBeenCalledWith(2);
        expect(showResultSpy).toHaveBeenCalledTimes(1);

        const[isCorrect, details] = showResultSpy.mock.calls[0];
        expect(isCorrect).toBe(true);
        expect(details).toContain("A: 3, B: 1");
        expect(details).toContain("earned $2 tip");

        expect(typeof view.onBackToGame).toBe("function");

        randomSpy.mockRestore();
    });

});

