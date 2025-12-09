import { describe, it, expect, vi, beforeEach } from "vitest";
import type { OrderResult} from "../data/OrderResult";  

// Konva mock (to be able to run tests in a Node environment)
vi.mock('konva', () => {
    class BaseNode {
        attrs: Record<string, any>;
        children: any[] = [];
        parent: any = null;
        _handlers: Record<string, (evt: any) => void> = {};

        constructor(attrs: Record<string, any> = {}) {
            this.attrs = { ...attrs };
        }

        // Add children to this node; sets child's parent.
        add(...nodes: any[]) {
            for(const n of nodes) {
                this.children.push(n);
                n.parent = this;
            }
        }

        // Removes all children
        destroyChildren() {
            this.children = [];     
        }

        // Remove this node from its parent
        destroy() {
            if(this.parent && this.parent.children) {
                this.parent.children = this.parent.children.filter((c: any) => c !== this);
            }
        }

        // Basic attr accessors
        setAttr(key: string, value: any) {
            this.attrs[key] = value;
        }
        
        getAttr(key: string) {
            return this.attrs[key];
        }

        // Event handling
        on(event: string, handler: (evt: any) => void) {
            this._handlers[event] = handler;
        }

        trigger(event: string, evt: any = {}) {
            const h = this._handlers[event];
            if(h) h(evt);
        }

        // Show/hide node
        visible(v?: boolean) {
            if(v === undefined) return this.attrs.visible ?? true;
            this.attrs.visible = v;
        }

        moveToBottom() {
            // no-op for testing
        }

        // used so code can call layer.batchDraw()
        getLayer () {
            return { batchDraw: vi.fn() };
        }
    }

    class Group extends BaseNode {}
    class Rect extends BaseNode {}
    // Simple Text mock with width/height/offset methods
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

    // Simple Image mock with width/height/offset methods
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


import * as MiniGame1Model from "../screens/Minigame1Screen/Minigame1Model";
import { Minigame1Controller } from "../screens/Minigame1Screen/Minigame1Controller";

const getScreenShotResultsMock = vi.spyOn(MiniGame1Model, "getScreenShotResults");
const pickRandomPairMock = vi.spyOn(MiniGame1Model, "pickRandomPair");
const pickRandomToppingMock = vi.spyOn(MiniGame1Model, "pickRandomTopping");
const evaluateChoiceMock = vi.spyOn(MiniGame1Model, "evaluateChoice");

// Global setup before each test
beforeEach(() => {
    // Mock global Image so Konva.Image can pretend to load images
    class HTMLImageMock {
        width = 200;
        height = 200
        src = "";
        onload: null | (() => void) = null;

        constructor() {
            // Simulate async image loading
            setTimeout(() => {
                if(this.onload) this.onload();
            }, 0);
        }
    }
    
    (global as any).Image = HTMLImageMock;
    
    // Reset all spies/mocks between tests so they don't leak state
    vi.clearAllMocks();
});

// Helper to build controller with mocked dependencies
function createControllerWithDep(opts: {getAllReturn?: OrderResult[] } = {}) {
    // Fake screen switcher, audio manager, and result store
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

    // Create the controller with fakes
    const controller = new Minigame1Controller(
        screenSwitcher as any,
        audio as any,
        resultStore as any
    );

    // Get the view instance 
    const view: any = controller.getView();

    return { controller, screenSwitcher, audio, resultStore, view };

}

// Tests for Minigame1Controller
describe("MiniGame1Controller", () => {
    it("constructor wires Minigame 2 button to screen switcher", () => {
        const { view, screenSwitcher} = createControllerWithDep();

        // Simulate clicking the Minigame 2 button
        view.onGoToMinigame2();
        expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({ type: "minigame2" });

        // Simulate clicking the back to game button
        view.onBackToGame();
        expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({ type: "game" });
    });

    it("show() displays the view and starts music", () => {
        const { controller, audio, view } = createControllerWithDep();

        // Spy on view.show()
        const showSpy = vi.spyOn(view, "show");

        controller.show();
        expect(showSpy).toHaveBeenCalledTimes(1);
        expect(audio.musicStarted).toHaveBeenCalledTimes(1);
    });

    it("hide() hides the view", () => {
        const { controller, view } = createControllerWithDep();
        
        // Spy on view.hide()
        const hideSpy = vi.spyOn(view, "hide");
        
        controller.hide();
        expect(hideSpy).toHaveBeenCalledTimes(1);
    });

    it("startGame shows message when fewer than 2 order results exist", () => {
        // Fake a single order result with screenshot.
        const singleResult: OrderResult = { 
            screenshotDataUrl: "data-url-1", 
            success: true,
            order: { toppingsCounts: {} as any },
        } as any;
        
        // Make the model function return that single result so that
        // the controller thinks there is only one available.
        getScreenShotResultsMock.mockReturnValue([singleResult]);

        const { controller, resultStore, view } = createControllerWithDep({
            getAllReturn: [singleResult],  
        });

        const getAllSpy = vi.spyOn(resultStore, "getAll");
        const showMessageSpy = vi.spyOn(view, "showMessage");

        controller.startGame();

        // Controller should have pull all results from ResultStore
        expect(getAllSpy).toHaveBeenCalledTimes(1);
        // ... then pass them to getScreenShotResults
        expect(getScreenShotResultsMock).toHaveBeenCalledWith([singleResult]);
        expect(showMessageSpy).toHaveBeenCalledWith("Not enough completed orders for today to play this minigame.");
        expect(showMessageSpy).toHaveBeenCalledTimes(1);
    });

    it("startGame picks two orders, render pair, and handles correct choice with tips", () => {
        // Fake two order results with screenshots
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
        evaluateChoiceMock.mockReturnValue({ isCorrect: true, correct: "A", aCount: 3, bCount: 1 });

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

        // clean up Math.random spy.
        randomSpy.mockRestore();
    });
});

