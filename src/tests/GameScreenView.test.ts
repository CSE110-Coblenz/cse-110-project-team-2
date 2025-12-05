import { describe, it, expect, vi, beforeEach } from "vitest";

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
      // no-op, but exists so GameScreenView doesn't crash
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
      // overridden in Group; here just return parent if it has getLayer
      if (this.parent && typeof this.parent.getLayer === "function") {
        return this.parent.getLayer();
      }
      return null;
    }

    toDataURL() {
      // used by capturePizzaImage; simple stub
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
      // simple: don't actually filter, not needed for these tests
      return [];
    }

    draw() {
      // no-op
    }

    batchDraw() {
      // no-op
    }

    getLayer() {
      // treat the group itself as the layer
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

// needed because GameScreenView uses Konva.Group type
vi.mock("konva/lib/Group", () => {
  const Konva = require("konva") as any;
  return { Group: Konva.Group };
});

// ---------- imports under test ----------
import Konva from "konva";
import { GameScreenView } from "../src/screens/GameScreen/GameScreenView";
import { GameScreenModel } from "../src/screens/GameScreen/GameScreenModel";
import type { Order } from "../src/types";

describe("GameScreenView (simple)", () => {
  let view: GameScreenView;
  let group: any;

  beforeEach(() => {
    const model = new GameScreenModel();

    view = new GameScreenView(model, {
      onBackToMenuClick: vi.fn(),
      onGoToMinigame1: vi.fn(),
      onPizzaNumSelected: vi.fn(),
      onSliceNumSelected: vi.fn(),
      onToppingDragEnd: vi.fn(),
      onTongsRemove: vi.fn(),
      onSubmit: vi.fn(),
    });

    group = view.getGroup() as any;
  });

  it("starts visible by default", () => {
    expect(group.visible()).toBe(true);
  });

  it("show() and hide() toggle visibility", () => {
    view.show();
    expect(group.visible()).toBe(true);

    view.hide();
    expect(group.visible()).toBe(false);
  });

  it("displayOrder writes a readable description of the order", () => {
    const order: Order = {
      // only the fields used by displayOrder matter
      fractionStruct: { denominator: 4 } as any,
      toppingsCounts: {
        Mushroom: 2,
        Pepperoni: 1,
      } as any,
    } as any;

    view.displayOrder(order);

    const TextClass = (Konva as any).Text;
    const texts = group
      .getChildren()
      .filter((c: any) => c instanceof TextClass) as any[];

    const combined = texts.map((t: any) => t.text()).join("\n");

    expect(combined).toContain("2/4 Mushroom");
    expect(combined).toContain("1/4 Pepperoni");
  });
});
