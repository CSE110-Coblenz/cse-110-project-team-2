import { it, describe, expect, beforeEach, vi } from 'vitest';

function createView () {
    const onBackToMenu = vi.fn();
    const onGoToMinigame2 = vi.fn();
    return new Minigame1View(onBackToMenu, onGoToMinigame2);
}

// Konva mock 
vi.mock('konva', () => {
    class BaseNode {
        attrs: Record<string, any>;
        children: any[] = [];
        parent: any = null;
        _handlers: Record<string, (evt: any) => void> = {};

        constructor(attrs: Record<string, any> = {}) {
            this.attrs = { ...attrs };
        }

        add(...nodes: any[]) {
            for(const n of nodes) {
                this.children.push(n);
                n.parent = this;
            }
        }

        destroyChildren() {
            this.children = [];     
        }

        destroy() {
            if(this.parent && this.parent.children) {
                this.parent.children = this.parent.children.filter((c: any) => c !== this);
            }
        }

        setAttr(key: string, value: any) {
            this.attrs[key] = value;
        }
        
        getAttr(key: string) {
            return this.attrs[key];
        }

        on(event: string, handler: (evt: any) => void) {
            this._handlers[event] = handler;
        }

        trigger(event: string, evt: any = {}) {
            const h = this._handlers[event];
            if(h) h(evt);
        }

        visible(v?: boolean) {
            if(v === undefined) return this.attrs.visible ?? true;
            this.attrs.visible = v;
        }

        moveToBottom() {
            // no-op for testing
        }

        getLayer () {
            return { batchDraw: vi.fn() };
        }
    }

    class Group extends BaseNode {}
    class Rect extends BaseNode {}
    class Text extends BaseNode {
        width() {
            const text = this.attrs.text ?? "";
            return typeof text === "string" ? text.length * 8 : 100; 
        }

        height(v?: number) {
            if(v === undefined) {
                return this.attrs.height ?? 20;
            }
            this.attrs.height = v;
        }

        offsetX(v?: number) {
            if(v === undefined) return this.attrs.offsetX;
            this.attrs.offsetX = v;
        }

        offsetY(v?: number) {
            if(v === undefined) return this.attrs.offsetY;
            this.attrs.offsetY = v;
        }
    }

    class Image extends BaseNode {
        width() {
            return this.attrs.width ?? (this.attrs.image?.width ?? 100);
        }
        height() {
            return this.attrs.height ?? (this.attrs.image?.height ?? 100);
        }

        offSetX(v?: number) {
            if(v === undefined) return this.attrs.offsetX;
            this.attrs.offsetX = v;
        }

        offSetY(v?: number) {
            if(v === undefined) return this.attrs.offsetY;
            this.attrs.offsetY = v;
        }
    }

    const Konva = { Group, Rect, Text, Image };
    return {default: Konva };
});

import { Minigame1View } from "../screens/Minigame1Screen/Minigame1View";

beforeEach(() => {
    class HTMLImageMock {
        width = 200;
        height = 200;
        src = "";
        onload: null | (() => void) = null;

        constructor() {
            setTimeout(() => {
                if(this.onload) this.onload();
            }, 0);  
        }
    }

    (globalThis as any).Image = HTMLImageMock as any;
});

function findTextNodes(root: any, predicate: (text: string) => boolean): any[] {
    const result: any[] = [];

    function traverse(node: any) {
        if(node?.attrs?.text && typeof node.attrs.text == "string") {
            if(predicate(node.attrs.text)) result.push(node);
        }
        if(node?.children) {
            node.children.forEach(traverse);
        }
    }

    traverse(root);
    return result;
}

function findGroupsWithChildrenText(root: any, text: string): any[] {
    const result: any[] = [];

    function traverse(node: any) {
        if(node?.children && node.children.length > 0) {
            const hasTextChild = node.children.some(
                (c: any) => c?.attrs?.text === text
            );
            if(hasTextChild) result.push(node);
            node.children.forEach(traverse);
        }
    }

    traverse(root);
    return result;
}

function findNodesByAttr(root: any, key: string, value: any): any[] {
    const result: any[] = [];

    function traverse(node: any) {
        if(node?.attrs && node.attrs[key] === value) {
            result.push(node);
        }
        if(node?.children) {
            node.children.forEach(traverse);
        }   
    }

    traverse(root);
    return result;
}

describe("MiniGame1View", () => {
    it("toggles instruction visibility with show() / hide()", () => {
        const view = createView();
        const group: any = view.getGroup();

        expect(group.visible()).toBe(false);

        view.show();
        expect(group.visible()).toBe(true);

        view.hide();
        expect(group.visible()).toBe(false);
    });

    it("shows message when no screenshots are available", () => {
        const showMessageSpy = vi.spyOn(Minigame1View.prototype, "showMessage");

        const view = createView();

        const cb = vi.fn();
        const a = { screenshotDataUrl: undefined } as any;
        const b = { screenshotDataUrl: undefined } as any;

        view.renderPair(a, b, "Pepperoni", cb);

        expect(showMessageSpy).toHaveBeenCalledTimes(1);

        expect(showMessageSpy).toHaveBeenCalledWith("No pizza screenshots available for this minigame.");

        expect(cb).not.toHaveBeenCalled();

        showMessageSpy.mockRestore();
    });

    it("renders screenshot pairs and clicking left/right images calls the callback", async () => {
        const view = createView();
        const group: any = view.getGroup();

        const cb = vi.fn();
        const a = { screenshotDataUrl: "left-data-url" } as any;
        const b = { screenshotDataUrl: "right-data-url" } as any;
        
        view.renderPair(a, b, "Pepperoni", cb);

        await new Promise((resolve) => setTimeout(resolve, 5));

        const bases = findNodesByAttr(group, "isMinigameBase", true);
        const left = bases.find((n) => n.attrs.minigameIndex === 0);
        const right = bases.find((n) => n.attrs.minigameIndex === 1);

        expect(left).toBeTruthy();
        expect(right).toBeTruthy();

        left.trigger("click");
        expect(cb).toHaveBeenCalledWith("A");

        right.trigger("click");
        expect(cb).toHaveBeenCalledWith("B");
    });

    it("Equivalent button calls the callback with 'Equivalent'", async () => {
        const view = createView();
        const group: any = view.getGroup();

        const cb = vi.fn();
        const a = { screenshotDataUrl: "left-data-url" } as any;
        const b = { screenshotDataUrl: "right-data-url" } as any;
        
        view.renderPair(a, b, "Mushroom", cb);

        await new Promise((resolve) => setTimeout(resolve, 5));

        const [equivGroup] = findGroupsWithChildrenText(group, "Equivalent");
        expect(equivGroup).toBeTruthy();

        equivGroup.trigger("click");
        expect(cb).toHaveBeenCalledWith("Equivalent");
    });

    it("Minigame 2 button triggers onGoToMinigame2", () => {
        const view = createView();
        const group: any = view.getGroup();

        const handler = vi.fn();
        view.onGoToMinigame2 = handler;

        const [btnGroup] = findGroupsWithChildrenText(group, "Minigame 2");
        expect(btnGroup).toBeTruthy();

        btnGroup.trigger("click");
        expect(handler).toHaveBeenCalledTimes(1);
    });
});




