import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock AudioManager and MenuScreenView BEFORE importing the controller
vi.mock("../audio/AudioManager", () => {
  return {
    AudioManager: class {
      constructor(_src?: string, _vol?: number) {}
      setMusicEnabled = vi.fn();
      musicStarted = vi.fn();
    },
  };
});

vi.mock("../screens/MenuScreen/MenuScreenView", () => {
  return {
    MenuScreenView: class {
      public triggerStart!: () => void;
      public triggerToggleMusic!: (b: boolean) => void;
      public triggerTutorial!: () => void;
      constructor(onStart: () => void, onMusicToggle: (b: boolean) => void, onTutorial: () => void) {
        this.triggerStart = onStart;
        this.triggerToggleMusic = onMusicToggle;
        this.triggerTutorial = onTutorial;
      }
      // provide a minimal API used by production (if any)
      render = vi.fn();
    },
  };
});

// Now import the real modules that depend on the mocked ones
import { MenuScreenController } from "../screens/MenuScreen/MenuScreenController";
import { MenuScreenModel } from "../screens/MenuScreen/MenuScreenModel";

describe("MenuScreenController navigation + MenuScreenModel behavior", () => {
  beforeEach(() => {
    // minimal window mock so constructor's addEventListener call won't throw
    (globalThis as any).window = { addEventListener: vi.fn() };
    vi.clearAllMocks();
  });

  it("navigates to difficulty screen when Play is clicked", () => {
    const mockScreenSwitcher = { switchToScreen: vi.fn() } as any;
    const controller = new MenuScreenController(mockScreenSwitcher);
    const view = controller.getView() as unknown as { triggerStart: () => void };

    expect(view).toBeDefined();
    expect(typeof view.triggerStart).toBe("function");

    // Simulate clicking "Play"
    view.triggerStart();

    expect(mockScreenSwitcher.switchToScreen).toHaveBeenCalledWith({ type: "difficulty" });
  });

  it("toggles music state correctly in MenuScreenModel", () => {
    const model = new MenuScreenModel();
    expect(model.isMusicOn()).toBe(true);

    model.toggleMusic();
    expect(model.isMusicOn()).toBe(false);

    model.toggleMusic();
    expect(model.isMusicOn()).toBe(true);
  });

  it("calls screenSwitcher for tutorial when tutorial is clicked", () => {
    const mockScreenSwitcher = { switchToScreen: vi.fn() } as any;
    const controller = new MenuScreenController(mockScreenSwitcher);
    const view = controller.getView() as unknown as { triggerTutorial: () => void };

    expect(typeof view.triggerTutorial).toBe("function");

    view.triggerTutorial();

    expect(mockScreenSwitcher.switchToScreen).toHaveBeenCalledWith({ type: "tutorial" });
  });
});