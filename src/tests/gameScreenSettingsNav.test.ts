import { describe, it, expect, vi, beforeEach } from "vitest";

//mock GameScreenView 
vi.mock("../src/screens/GameScreen/GameScreenView", () => {
    return {
        GameScreenView: class {
            public triggerSettingsBackToMenu: () => void;
            public triggerSettingsInstructions: () => void;
            
            //mock the constructor
            constructor(
                _model: any,
                callbacks: {
                onBackToMenuClick?: () => void;
                onInstructionsClick?: () => void;
                onGoToMinigame1?: () => void;
                onPizzaNumSelected?: (n: number) => void;
                onSliceNumSelected?: (s: number) => void;
                onToppingDragEnd?: (...args: any[]) => void;
                onTongsRemove?: (t: any) => void;
                onSubmit?: () => void;
                }
            ) {
                // manually triggers the callbacks
                this.triggerSettingsBackToMenu =
                callbacks.onBackToMenuClick ?? (() => {});
                this.triggerSettingsInstructions =
                callbacks.onInstructionsClick ?? (() => {});
            }
    
            show = vi.fn();
            hide = vi.fn();
            displayOrder = vi.fn();
            setDifficulty = vi.fn();
            getGroup = vi.fn(() => ({
            getLayer: () => ({ batchDraw: vi.fn() }),
            }));
        },
      };
    });

// Import after mocking
import { GameScreenController } from "../src/screens/GameScreen/GameScreenController";
import { ResultStore } from "../src/data/ResultStore";

describe("GameScreenController settings popup navigation", () => {
    let mockScreenSwitcher: any;
    let fakeResultStore: ResultStore;

    beforeEach(() => {
        mockScreenSwitcher = { switchToScreen: vi.fn() } as any;
        fakeResultStore = new ResultStore();
        vi.clearAllMocks();
    });

    it("navigates to menu when 'Back to Menu' is selected", () => {
            const controller = new GameScreenController(
            mockScreenSwitcher,
            fakeResultStore
        );

        const view = controller.getView() as any;

        expect(typeof view.triggerSettingsBackToMenu).toBe("function");

        // Simulate clicking “Back to Menu”
        view.triggerSettingsBackToMenu();

        expect(mockScreenSwitcher.switchToScreen).toHaveBeenCalledWith({
        type: "menu",
        });
    });

  it("navigates to tutorial when 'Instructions' is selected", () => {
            const controller = new GameScreenController(
            mockScreenSwitcher,
            fakeResultStore
        );

        const view = controller.getView() as any;

        expect(typeof view.triggerSettingsInstructions).toBe("function");

        // Simulate clicking “Instructions”
        view.triggerSettingsInstructions();

        expect(mockScreenSwitcher.switchToScreen).toHaveBeenCalledWith({
            type: "tutorial",
        });
    });
});
