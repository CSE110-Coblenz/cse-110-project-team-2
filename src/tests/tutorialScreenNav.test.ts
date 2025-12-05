import { describe, it, expect, vi, beforeEach } from "vitest";

// mock tutorial screen view 
vi.mock("../screens/TutorialScreen/TutorialScreenView", () => {
    return {
      TutorialScreenView: class {
        public triggerSettingsBackToMenu!: () => void;
        public triggerSettingsInstructions!: () => void;
  
        constructor(
            onBackToMenuClick: () => void,
            _onWatchTutorialClick: () => void,
            onInstructionsClick: () => void

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
  
  // import controller
  import { TutorialScreenController } from "../screens/TutorialScreen/TutorialScreenController";
  
describe("TutorialScreenController settings popup navigation", () => {
    beforeEach(() => {
          vi.clearAllMocks();
    });
  
    it("navigates to menu when 'Back to Menu' is selected", () => {
        const mockScreenSwitcher = { switchToScreen: vi.fn() } as any;
    
        const controller = new TutorialScreenController(mockScreenSwitcher);
        const view = controller.getView() as unknown as {
            triggerSettingsBackToMenu: () => void;
        };
    
        expect(typeof view.triggerSettingsBackToMenu).toBe("function");
    
        view.triggerSettingsBackToMenu();
    
        expect(mockScreenSwitcher.switchToScreen).toHaveBeenCalledWith({ type: "menu" });

    });
  
    it("navigates to tutorial when 'instructions' is selected", () => {
        const mockScreenSwitcher = { switchToScreen: vi.fn() } as any;
    
        const controller = new TutorialScreenController(mockScreenSwitcher);
        const view = controller.getView() as unknown as {
            triggerSettingsInstructions: () => void;
        };
    
        expect(typeof view.triggerSettingsInstructions).toBe("function");
    
        view.triggerSettingsInstructions();
    
        // handleInstructionsClick goes to tutorial
        expect(mockScreenSwitcher.switchToScreen).toHaveBeenCalledWith({ type: "tutorial" });
    });
  });