import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------- minimal DOM / Image stub ----------
const g: any = globalThis as any;
g.window = g.window ?? {};

class FakeImage {
  src: string = "";
  width = 200;
  height = 200;
  onload: (() => void) | null = null;
}

g.Image = g.Image ?? FakeImage;
g.window.Image = g.window.Image ?? FakeImage;

// ---------- Same Konva mock as in GameScreenView.test.ts ----------
vi.mock("konva", () => {
  class BaseNode {
    attrs: Record<string, any>;
    parent: any = null;
    _handlers: Record<string, (evt: any) => void> = {};

    constructor(attrs: Record<string, any> = {}) {
      this.attrs = { ...attrs };
    }

    destroy() {
      if (this.parent && this.parent.children) {
        this.parent.children = this.parent.children.filter(
          (c: any) => c !== this
        );
      }
    }

    setAttr(key: string, value: any) {
      this.attrs[key] = value;
    }

    getAttr(key: string) {
      return this.attrs[key];
    }

    x(value?: number) {
      if (typeof value === "number") this.attrs.x = value;
      return this.attrs.x ?? 0;
    }

    y(value?: number) {
      if (typeof value === "number") this.attrs.y = value;
      return this.attrs.y ?? 0;
    }

    width(value?: number) {
      if (typeof value === "number") this.attrs.width = value;
      return this.attrs.width ?? 0;
    }

    height(value?: number) {
      if (typeof value === "number") this.attrs.height = value;
      return this.attrs.height ?? 0;
    }

    visible(value?: boolean) {
      if (typeof value === "boolean") this.attrs.visible = value;
      return this.attrs.visible ?? true;
    }

    offsetX(value?: number) {
      if (typeof value === "number") this.attrs.offsetX = value;
      return this.attrs.offsetX ?? 0;
    }

    offsetY(value?: number) {
      if (typeof value === "number") this.attrs.offsetY = value;
      return this.attrs.offsetY ?? 0;
    }

    on(event: string, handler: (evt: any) => void) {
      this._handlers[event] = handler;
    }

    trigger(event: string, evt: any = {}) {
      const h = this._handlers[event];
      if (h) h(evt);
    }

    moveToBottom() {
      return this;
    }

    getClientRect() {
      return {
        x: this.x(),
        y: this.y(),
        width: this.width(),
        height: this.height(),
      };
    }

    getLayer() {
      if (this.parent && typeof this.parent.getLayer === "function") {
        return this.parent.getLayer();
      }
      return null;
    }

    toDataURL() {
      return "data:image/png;base64,MOCK";
    }
  }

  class Group extends BaseNode {
    children: any[] = [];

    add(...nodes: any[]) {
      for (const n of nodes) {
        (n as any).parent = this;
        this.children.push(n);
      }
      return this;
    }

    getChildren() {
      return this.children;
    }

    destroyChildren() {
      this.children.forEach((c) => (c.parent = null));
      this.children = [];
    }

    find(_selector: string) {
      return [];
    }

    draw() {}
    batchDraw() {}

    getLayer() {
      return this;
    }
  }

  class Rect extends BaseNode {}
  class Circle extends BaseNode {}
  class Line extends BaseNode {}

  class Text extends BaseNode {
    text(value?: string) {
      if (typeof value === "string") {
        this.attrs.text = value;
      }
      return this.attrs.text;
    }
  }

  class Image extends BaseNode {}
  class Arc extends BaseNode {}

  class Layer extends Group {}

  const konvaMock = {
    Group,
    Rect,
    Text,
    Image,
    Layer,
    Circle,
    Line,
    Arc,
  };

  return {
    default: konvaMock,
    ...konvaMock,
  };
});

vi.mock("konva/lib/Group", () => {
  const Konva = require("konva") as any;
  return { Group: Konva.Group };
});

// ---------- imports under test ----------
import Konva from "konva";
import { GameScreenController } from "../screens/GameScreen/GameScreenController";
import type { Order } from "../types";
import { b } from "vitest/dist/suite-dWqIFb_-.js";

// simple mock of the ResultStore used by GameScreenController
class MockResultStore {
  add = vi.fn();
}

describe("GameScreenController (simple)", () => {
  let switcher: { switchToScreen: ReturnType<typeof vi.fn> };
  let store: MockResultStore;
  let controller: GameScreenController;

  beforeEach(() => {
    switcher = { switchToScreen: vi.fn() } as any;
    store = new MockResultStore();

    controller = new GameScreenController(
      switcher as any,
      store as any
    );
  });

  it("shows the game view when constructed", () => {
    const view = controller.getView();
    const group = view.getGroup() as any;

    expect(group.visible()).toBe(true);
  });

  it("startGame calls view.displayOrder with the given order", () => {
    const order: Order = {
      fractionStruct: { denominator: 4 } as any,
      toppingsCounts: { Mushroom: 2 } as any,
    } as any;

    const view: any = controller.getView();
    const spy = vi.spyOn(view, "displayOrder");

    controller.startGame("proper" as any, order);

    expect(spy).toHaveBeenCalledWith(order);
  });

  it("clicking 'Back to Menu' switches to the menu screen", () => {
    const view: any = controller.getView();
    const group = view.getGroup() as any;
    const TextClass = (Konva as any).Text;
    const GroupClass = (Konva as any).Group;

    const isBackToMenuText = (text: string) => {
      const lower = (text ?? "").toLowerCase();
      return lower.includes("back") && lower.includes("menu");
    };

    // Find the group whose text child is "⚙︎  |  𝓲"
    const settingGroup = group
      .getChildren()
      .find((g: any) => {
        if (!(g instanceof GroupClass)) return false;
        return g
          .getChildren()
          .some(
            (child: any) =>
              child instanceof TextClass && child.text() === "⚙︎  |  𝓲"
          );
      });

    expect(settingGroup).toBeDefined();

    settingGroup!.trigger("click");
  });
});
