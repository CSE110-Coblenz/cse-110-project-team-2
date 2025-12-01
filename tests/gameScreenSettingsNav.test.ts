import { describe, it, expect, vi, beforeEach } from "vitest";

//mock GameScreenView 
//mock GameScreenView 
vi.mock("../src/screens/GameScreen/GameScreenView", () => {
    return {
      GameScreenView: class {
        // test only triggers
        public triggerSettingsBackToMenu!: () => void;
        public triggerSettingsInstructions!: () => void;
  
        constructor(
          onBackToMenuClick: () => void,
          _resultStore: any,
          instructionsArg: any 
        ) {
          // instance fields to the callbacks the controller passes in
          this.triggerSettingsBackToMenu = onBackToMenuClick;
  
          if (typeof instructionsArg === "function") {

            // controller passed a plain callback
            this.triggerSettingsInstructions = instructionsArg;
          } else if (
            instructionsArg &&
            typeof instructionsArg.onInstructionsClick === "function"
          ) {
            
            // controller passed
            this.triggerSettingsInstructions = instructionsArg.onInstructionsClick;
          } else {
            // fallback to no-op
            this.triggerSettingsInstructions = () => {};
          }
        }
  
        show = vi.fn();
        hide = vi.fn();
        displayOrder = vi.fn();
        setDifficulty = vi.fn();
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
