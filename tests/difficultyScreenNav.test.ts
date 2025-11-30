import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock difficultyScreenView 

// Mock DifficultyScreenView BEFORE importing the controller
vi.mock("../src/screens/DifficultyScreen/DifficultyScreenView", () => {
    return {
      DifficultyScreenView: class {
        public triggerSettingsBackToMenu!: () => void;
        public triggerSettingsInstructions!: () => void;
  
        constructor(
            _onDifficultySelect: (difficulty: any) => void,
            onBackToMenuClick: () => void,
            onInstructionsClick: () => void
        ) {

          // manually triggers the callbacks
            this.triggerSettingsBackToMenu = onBackToMenuClick;
            this.triggerSettingsInstructions = onInstructionsClick;
        }
  
        // minimal api
        getGroup = vi.fn();
        show = vi.fn();
        hide = vi.fn();
      },
    };
  });
  
  //import the controller from the mock view
  import { DifficultyScreenController } from "../src/screens/DifficultyScreen/DifficultyScreenController";
  
  describe("DifficultyScreenController settings popup navigation", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
  
    // checks if the back to menu button works properly and navigates to menu screen
    it("navigates to menu when 'Back to Menu' is selected ", () => {
        const mockScreenSwitcher = { switchToScreen: vi.fn() } as any;
    
        const controller = new DifficultyScreenController(mockScreenSwitcher);
        const view = controller.getView() as unknown as {
            triggerSettingsBackToMenu: () => void;

        };
    
        expect(typeof view.triggerSettingsBackToMenu).toBe("function");
    
        // simulates clicking "Back to Menu" from the popup
        view.triggerSettingsBackToMenu();
    
        expect(mockScreenSwitcher.switchToScreen).toHaveBeenCalledWith({ type: "menu" });
    });
  
    it("navigates to tutorial when 'Instructions' is selected", () => {
        const mockScreenSwitcher = { switchToScreen: vi.fn() } as any;
  
        const controller = new DifficultyScreenController(mockScreenSwitcher);
        const view = controller.getView() as unknown as {
            triggerSettingsInstructions: () => void;
        };
  
        expect(typeof view.triggerSettingsInstructions).toBe("function");
  
      // simulates clicking "instructions" inside popup
        view.triggerSettingsInstructions();
  
        expect(mockScreenSwitcher.switchToScreen).toHaveBeenCalledWith({ type: "tutorial" });
    });
  });