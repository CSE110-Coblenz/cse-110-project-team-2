import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Konva Mock ---
vi.mock("konva", () => {
    const listenersKey = Symbol("listeners");

    let LayerRef: any;

    class Shape {
        attrs: Record<string, any>;
        parent: any = null;
        children: any[] = [];
        private _visible = true;
        [listenersKey]: Record<string, (evt: any) => void> = {};

        constructor(attrs: Record<string, any> = {}) {
            this.attrs = {...attrs};
            if(attrs.visible !== undefined) {
                this._visible = !!attrs.visible;
            }
        }

        add(...nodes: any[]) {
            for(const n of nodes) {
                if(!n) continue;
                n.parent = this;
                this.children.push(n);
            }
        }

        destroyChildren() {
            this.children = [];
        }

        on(event: string, handler: (evt: any) => void) {
            this[listenersKey][event] = handler;
        }

        trigger(event: string, evt: any = {}) {
            const h = this[listenersKey][event];
            if(h) h(evt);
        }

        y(v?: number) {
            if(v === undefined) return this.attrs.y;
            this.attrs.y = v;
        }

        x(v?: number) {
            if(v === undefined) return this.attrs.x;
            this.attrs.x = v;
        }

        visible(v?: boolean) {
            if(v === undefined) return this._visible;
            this._visible = !!v;
        }

        getLayer(): any {
            let node: any = this;
            while(node) {
                if(LayerRef && node instanceof LayerRef) return node;
                node = node.parent;
            }
            return null;
        }
    }

    class Group extends Shape {}

    class Rect extends Shape {}
    
    class Text extends Shape {}

    class Layer extends Group {
        draw = vi.fn();
    }

    LayerRef = Layer;
    
    return {
        default: { Group, Rect, Text, Layer },
    };
});

// --- Mock ResultScreenView ---
import Konva from "konva";

vi.mock("../screens/ResultScreen/ResultScreenView", () => {
    class ResultScreenView {
        public onViewWrongOrders: () => void = () => {};
        public onEndGame: () => void = () => {};
        public onNextDay: () => void = () => {};

        public updateStats = vi.fn();
        public showRecommendationPopup = vi.fn();

        public group: any;

        constructor() {
            this.group = new (Konva as any).Group({visible: false});
        }

        getGroup() {
            return this.group;
        }
    }

    return { ResultScreenView };
});


vi.mock("../screens/ResultScreen/ResultScreenModel", () => {
    return {
        computeStats: vi.fn(),
        builderRecommendationMessage: vi.fn(),
        getWrongOrderSummaries: vi.fn(),
    };
});
// import the mocked functions
import { computeStats, builderRecommendationMessage, getWrongOrderSummaries } from "../screens/ResultScreen/ResultScreenModel";

// --- import the controller after mocking ---
import { ResultScreenController } from "../screens/ResultScreen/ResultScreenController";

type MockResultStore = {
    getAll: ReturnType<typeof vi.fn>;
    getTotalTips: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;    
};

type MockSwitcher = {
    switchToScreen: ReturnType<typeof vi.fn>;
};

// --- Helper to create a controller with a mocked Layer, ResultStore, and Switcher ---
function createController(overrides?: Partial<MockResultStore>, currentDifficulty: any = "proper") {
    const layer = new (Konva as any).Layer();

    const switcher: MockSwitcher = {
        switchToScreen: vi.fn(),
    };

    const resultStore: MockResultStore = {
        getAll: vi.fn().mockReturnValue([]),
        getTotalTips: vi.fn().mockReturnValue(0),
        clear: vi.fn(),
    };

    const store = { ...resultStore, ...overrides } as unknown as any;

    const controller = new ResultScreenController(
        layer,
        switcher as any,
        store,
        currentDifficulty,
    );

    const view = controller.getView() as any;

    return { controller, layer, switcher, store, view };
}

// -- Helper to locate specific groups and buttons within the mocked Konva tree ---
function findWrongOrdersGroup(layer: any) {
    const Text = (Konva as any).Text;
    return layer.children.find((g: any) => 
        g.children?.some(
            (c: any) => c instanceof Text && c.attrs.text === "Wrong Orders",   
        ),
    );
}

function findButtonGroupByLabel(parent: any, label: string) {
    const Text = (Konva as any).Text;
    return parent.children.find(
        (g: any) => g instanceof (Konva as any).Group && g.children?.some((c: any) => c instanceof Text && c.attrs.text === label),
    );
}

function findTextNode(parent: any, text: string) {
    const Text = (Konva as any).Text;
    return parent.children.find(
        (c: any) => c instanceof Text && c.attrs.text === text,
    );
}

// --- Tests ---
describe("ResultScreenController", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (getWrongOrderSummaries as any).mockReturnValue([]);
    });

    it("refreshFromStore calls computeStats and updates the view", () => {
        const results = [{ dummy: 1 }] as any;
        const totalTips = 42;

        (computeStats as any).mockReturnValue({
            ordersReceived: 10,
            ordersCorrect: 7,
            tipsReceived: 42,
        });

        const { controller, store, view } = createController({
            getAll: vi.fn().mockReturnValue(results),
            getTotalTips: vi.fn().mockReturnValue(totalTips),
        } as any);

        controller.refreshFromStore();

        expect(store.getAll).toHaveBeenCalledTimes(1);
        expect(store.getTotalTips).toHaveBeenCalledTimes(1);
        expect(computeStats).toHaveBeenCalledWith(results, totalTips);
        expect(view.updateStats).toHaveBeenCalledWith({
            ordersReceived: 10,
            ordersCorrect: 7,
            tipsReceived: 42,
        });
    });

    it("setStats forwards stats to view.updateStats", () => {
        const { controller, view } = createController();

        const stats = {
            ordersReceived: 5,
            ordersCorrect: 4,
            tipsReceived: 12,
        };

        controller.setStats(stats);

        expect(view.updateStats).toHaveBeenCalledWith(stats);
    });

    it("onEndGame clears store and switches to menu", () => {
        const { view, store, switcher } = createController();

        view.onEndGame();

        expect(store.clear).toHaveBeenCalledTimes(1);
        expect(switcher.switchToScreen).toHaveBeenCalledWith({ type: "menu" });
    });

    it("onNextDay uses constructor difficulty and clears ResultStore, switching to order screen", () => {
        const startingDifficulty = "improper";
        const { view, store, switcher } = createController(undefined, startingDifficulty);

        view.onNextDay();

        expect(store.clear).toHaveBeenCalledTimes(1);
        expect(switcher.switchToScreen).toHaveBeenCalledWith({
            type: "order",
            mode: startingDifficulty,
        });
    });

    it("clicking 'Study Tips' button build recommendation message and shows popup", () => {
        const results = [{a: 1}] as any;
        const message = "Study fractions with denomianator 12.";
        (builderRecommendationMessage as any).mockReturnValue(message);

        const { layer, store, view } = createController(
            {
                getAll: vi.fn().mockReturnValue(results),
            } as any,
            "proper",
        );

        const wrongOrdersGroup = findWrongOrdersGroup(layer);
        expect(wrongOrdersGroup).toBeDefined();

        const studyTipsButton = findButtonGroupByLabel(wrongOrdersGroup, "Study Tips");
        expect(studyTipsButton).toBeDefined();

        studyTipsButton.trigger("click", { evt: {} });

        expect(store.getAll).toHaveBeenCalledTimes(1);
        expect(builderRecommendationMessage).toHaveBeenCalledWith(results);
        expect(view.showRecommendationPopup).toHaveBeenCalledTimes(1);

        const [calledMessage, calledGroup] = (view.showRecommendationPopup as any).mock.calls[0];
        expect(calledMessage).toBe(message);
        expect(calledGroup).toBe(wrongOrdersGroup); 
    });

    it("clicking 'Back' from wrong orders screen shows main results screen", () => {
        const { layer, view } = createController();

        const mainGroup = view.getGroup();
        expect(mainGroup.visible()).toBe(true);

        const wrongOrdersGroup = findWrongOrdersGroup(layer);
        expect(wrongOrdersGroup).toBeDefined();
        expect(wrongOrdersGroup.visible()).toBe(false);

        view.onViewWrongOrders();

        expect(mainGroup.visible()).toBe(false);
        expect(wrongOrdersGroup.visible()).toBe(true);

        const backButton = findButtonGroupByLabel(wrongOrdersGroup, "Back");
        expect(backButton).toBeDefined();

        backButton.trigger("click", { evt: {} });

        expect(mainGroup.visible()).toBe(true);
        expect(wrongOrdersGroup.visible()).toBe(false);
    });
});