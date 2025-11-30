import { describe, it, expect, vi, beforeEach } from "vitest";

// mock results store
/*vi.mock("../src/data/ResultStore", () => {
  return {
    ResultStore: class {
      add = vi.fn();
      getAll = vi.fn().mockReturnValue([]);
    },
  };
});*/

// mock game screen view
vi.mock("../src/screens/GameScreen/GameScreenView", () => {
  return {
    GameScreenView: class {
        public triggerSettingsBackToMenu!: () => void;
        public triggerSettingsInstructions!: () => void;

        public model = {};
        public onOrderSuccess: (d?: any) => void = () => {};
        public onGoToMinigame1: () => void = () => {};

      constructor(
            onBackToMenuClick: () => void,
            onInstructionsClick: () => void,
            _resultStore: any

      ) {
            this.triggerSettingsBackToMenu = onBackToMenuClick;
            this.triggerSettingsInstructions = onInstructionsClick;
      }

      show = vi.fn();
      hide = vi.fn();
      getGroup = vi.fn();

    },
  };
});

// Import real controller and ResultStore (they'll see mocks)
import { GameScreenController } from "../src/screens/GameScreen/GameScreenController";
import { ResultStore } from "../src/data/ResultStore";

describe("GameScreenController settings popup navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("navigates to menu when 'Back to Menu' is selected from settings popup", () => {
        const mockScreenSwitcher = { switchToScreen: vi.fn() } as any;
        const resultStore = new ResultStore();

        const controller = new GameScreenController(mockScreenSwitcher, resultStore);
        const view = controller.getView() as unknown as {
        triggerSettingsBackToMenu: () => void;
        };

        expect(typeof view.triggerSettingsBackToMenu).toBe("function");

        view.triggerSettingsBackToMenu();

        expect(mockScreenSwitcher.switchToScreen).toHaveBeenCalledWith({ type: "menu" });
    });

    it("navigates to tutorial when 'Instructions' is selected", () => {
        const mockScreenSwitcher = { switchToScreen: vi.fn() } as any;
        const resultStore = new ResultStore();

        const controller = new GameScreenController(mockScreenSwitcher, resultStore);
        const view = controller.getView() as unknown as {
            triggerSettingsInstructions: () => void;
        };

        expect(typeof view.triggerSettingsInstructions).toBe("function");
    // simulates clicking "instructions" inside popup
        view.triggerSettingsInstructions();

        expect(mockScreenSwitcher.switchToScreen).toHaveBeenCalledWith({ type: "tutorial" });
    });
});
