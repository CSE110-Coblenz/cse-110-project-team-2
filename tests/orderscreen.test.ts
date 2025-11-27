import { describe, it, expect, vi } from "vitest";
import { OrderScreenModel } from "../src/screens/OrderScreen/OrderScreenModel";
import { MIN_TOPPING_TYPES, TOPPINGS } from "../src/constants";

// Mock Konva
vi.mock("konva", () => {
  const mockLayer = { batchDraw: vi.fn(), draw: vi.fn() };

  class Group {
    private _visible = false;
    constructor(opts?: any) {}
    getLayer() { return mockLayer; }
    add() {}
    on(_: string, __: Function) {}
    visible(v?: boolean) {
      if (v === undefined) return this._visible;
      this._visible = v;
    }
  }

  class Rect {
    private opts: any;
    constructor(opts?: any) { this.opts = opts || {}; }
    width(w?: number) { if (w === undefined) return this.opts.width; this.opts.width = w; }
    height(h?: number) { if (h === undefined) return this.opts.height; this.opts.height = h; }
    x(v?: number) { if (v === undefined) return this.opts.x; this.opts.x = v; }
    y(v?: number) { if (v === undefined) return this.opts.y; this.opts.y = v; }
  }

  class Line {
    private opts: any;
    constructor(opts?: any) { this.opts = opts || {}; }
    points(p?: number[]) { if (p === undefined) return this.opts.points; this.opts.points = p; }
  }

  class Text {
    private opts: any;
    private _text: string;
    private _width: number;
    private _height: number;
    constructor(opts?: any) {
      this.opts = opts || {};
      this._text = this.opts.text || "";
      this._width = this.opts.width ?? 100;
      this._height = 20;
    }
    width(w?: number) { if (w === undefined) return this._width; this._width = w; }
    height() { return this._height; }
    x(v?: number) { if (v === undefined) return this.opts.x; this.opts.x = v; }
    y(v?: number) { if (v === undefined) return this.opts.y; this.opts.y = v; }
    text(t?: string) { if (t === undefined) return this._text; this._text = t; }
    name(n?: string) { if (n === undefined) return this.opts.name; this.opts.name = n; }
    offsetX(_: number) {}
    offsetY(_: number) {}
  }

  class Image {
    private opts: any;
    constructor(opts?: any) { this.opts = opts || {}; }
    width(w?: number) { if (w === undefined) return this.opts.width; this.opts.width = w; }
    height(h?: number) { if (h === undefined) return this.opts.height; this.opts.height = h; }
    scale(s?: any) { if (s === undefined) return this.opts.scale; this.opts.scale = s; }
    y(v?: number) { if (v === undefined) return this.opts.y; this.opts.y = v; }
    x(v?: number) { if (v === undefined) return this.opts.x; this.opts.x = v; }
    image(i?: any) { if (i === undefined) return this.opts.image; this.opts.image = i; }
  }

  return { default: { Group, Rect, Line, Text, Image } };
});

(global as any).Image = class {
  onload: (() => void) | null = null;
  naturalWidth = 100;
  naturalHeight = 100;
  private _src = "";
  set src(v: string) {
    this._src = v;
    setTimeout(() => { if (this.onload) this.onload(); }, 0);
  }
  get src() { return this._src; }
};

import { OrderScreenView } from "../src/screens/OrderScreen/OrderScreenView";

describe("OrderScreenModel", () => {
  it("generates proper orders with valid fractions and counts", () => {
    const model = new OrderScreenModel();
    const order = model.generateRandomProperOrder();
    expect(order.fractionStruct!.numerator).toBeLessThan(order.fractionStruct!.denominator);

    const denom = order.fractionStruct!.denominator;
    expect(order.toppingsPerSlice).toHaveLength(denom);

    const sum = Object.values(order.toppingsCounts ?? {}).reduce((acc, v) => acc + (v as number), 0);
    expect(sum).toBe(denom);

    const present = Object.values(order.toppingsCounts ?? {}).filter((c) => (c as number) > 0).length;
    expect(present).toBeGreaterThanOrEqual(MIN_TOPPING_TYPES);
  });

  it("generates improper orders with numerator > denominator and proper totals", () => {
    const model = new OrderScreenModel();
    const order = model.generateRandomImproperOrder();
  expect(order.fractionStruct!.numerator).toBeGreaterThan(order.fractionStruct!.denominator);

  const total = order.fractionStruct!.numerator;
  const sum = Object.values(order.toppingsCounts ?? {}).reduce((acc, v) => acc + (v as number), 0);
  expect(sum).toBe(total);

  // At least one topping should be improper (count > denominator)
  const denom = order.fractionStruct!.denominator;
  const improperFound = Object.values(order.toppingsCounts ?? {}).some((c) => (c as number) > denom);
  expect(improperFound).toBe(true);
  });

  it("setOrder/getOrder round trips an order", () => {
    const model = new OrderScreenModel();
    const sample = {
      fraction: "1/2",
      fractionStruct: { numerator: 1, denominator: 2 },
      toppingsCounts: Object.fromEntries(TOPPINGS.map((t) => [t, 0])) as any,
    };
    model.setOrder(sample as any);
    expect(model.getOrder()).toBe(sample);
  });
});

describe("OrderScreenView (light UI checks)", () => {
  it("shows/hides the group and refresh updates the displayed text", async () => {
    const model = new OrderScreenModel();
    const view = new OrderScreenView(model, () => {});
    await new Promise((res) => setTimeout(res, 0));

    expect(view.getGroup().visible()).toBe(false);

    view.show();
    expect(view.getGroup().visible()).toBe(true);

    view.hide();
    expect(view.getGroup().visible()).toBe(false);

    const newOrder = {
      fraction: "2/4",
      fractionStruct: { numerator: 2, denominator: 4 },
      toppingsCounts: Object.fromEntries(TOPPINGS.map((t) => [t, 0])) as any,
    };
    newOrder.toppingsCounts[Object.keys(newOrder.toppingsCounts)[0]] = 2;

    model.setOrder(newOrder as any);
    // ensure the private orderText exists and gets updated by refresh()
    view.refresh();
    const orderText = (view as any).orderText;
    expect(typeof orderText.text()).toBe("string");
    // It should include the fraction numerator/denominator for the topping lines
    expect(orderText.text()).toContain("2/");
  });
});

describe("OrderScreenModel stress tests", () => {
  it("repeatedly generates proper orders without invariant violations", () => {
    const model = new OrderScreenModel();
    const iterations = 500;
    for (let i = 0; i < iterations; i++) {
      const order = model.generateRandomProperOrder();

      // fractionStruct should exist and be a proper fraction
      expect(order.fractionStruct).toBeDefined();
      const num = order.fractionStruct!.numerator;
      const den = order.fractionStruct!.denominator;
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThan(den);

      // toppingsPerSlice must match denominator and counts must sum to denominator
      expect(order.toppingsPerSlice).toHaveLength(den);
      const sum = Object.values(order.toppingsCounts ?? {}).reduce((acc, v) => acc + (v as number), 0);
      expect(sum).toBe(den);

      // counts should be integers >= 0
      for (const v of Object.values(order.toppingsCounts ?? {})) {
        expect(Number.isInteger(v as number)).toBe(true);
        expect((v as number) >= 0).toBe(true);
      }

      // at least MIN_TOPPING_TYPES present
      const present = Object.values(order.toppingsCounts ?? {}).filter((c) => (c as number) > 0).length;
      expect(present).toBeGreaterThanOrEqual(MIN_TOPPING_TYPES);
    }
  });

  it("repeatedly generates improper orders", () => {
    const model = new OrderScreenModel();
    const iterations = 500;
    for (let i = 0; i < iterations; i++) {
      const order = model.generateRandomImproperOrder();

      expect(order.fractionStruct).toBeDefined();
      const num = order.fractionStruct!.numerator;
      const den = order.fractionStruct!.denominator;
      expect(num).toBeGreaterThan(den);

      const sum = Object.values(order.toppingsCounts ?? {}).reduce((acc, v) => acc + (v as number), 0);
      expect(sum).toBe(num);

      const improperFound = Object.values(order.toppingsCounts ?? {}).some((c) => (c as number) > den);
      expect(improperFound).toBe(true);

      for (const v of Object.values(order.toppingsCounts ?? {})) {
        expect(Number.isInteger(v as number)).toBe(true);
        expect((v as number) >= 0).toBe(true);
      }
    }
  });
});

describe("OrderScreenView list replacement and formatting", () => {
  it("formats two toppings with 'and' and replaces LIST", async () => {
    const model = new OrderScreenModel();
    const view = new OrderScreenView(model, () => {});
    await new Promise((res) => setTimeout(res, 0));

    const denom = 4;
    const newOrder = {
      fraction: "2/4",
      fractionStruct: { numerator: 2, denominator: denom },
      toppingsCounts: Object.fromEntries(TOPPINGS.map((t) => [t, 0])) as any,
    };
    newOrder.toppingsCounts[TOPPINGS[0]] = 1;
    newOrder.toppingsCounts[TOPPINGS[1]] = 1;
    model.setOrder(newOrder as any);
    view.refresh();

    const txt = (view as any).orderText.text();
    expect(txt).not.toContain("LIST");
    expect(txt).toContain(TOPPINGS[0]);
    expect(txt).toContain(TOPPINGS[1]);
    // two item formatting should include and
    expect(txt).toContain(" and ");
  });

  it("formats three or more toppings with commas and ', and' and replaces LIST", async () => {
    const model = new OrderScreenModel();
    const view = new OrderScreenView(model, () => {});
    await new Promise((res) => setTimeout(res, 0));

    const denom = 6;
    const newOrder = {
      fraction: "6/6",
      fractionStruct: { numerator: 6, denominator: denom },
      toppingsCounts: Object.fromEntries(TOPPINGS.map((t) => [t, 2])) as any,
    };
    model.setOrder(newOrder as any);
    view.refresh();

    const txt = (view as any).orderText.text();
    expect(txt).not.toContain("LIST");
    for (const t of TOPPINGS) expect(txt).toContain(t);
    // three+ items formatting uses ', and'
    expect(txt).toMatch(/, and |, and/);
  });
});
