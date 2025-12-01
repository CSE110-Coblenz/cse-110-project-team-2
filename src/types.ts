import type { Group } from "konva/lib/Group";
import type { ToppingType } from "./constants";

export interface View {
    getGroup(): Group;
    show(): void;
    hide(): void;
}

export type Difficulty = "proper" | "improper" | "mixed";

export type FractionStruct = {
    numerator: number;
    denominator: number;
};

export type Order = {
    fraction: string;
    fractionStruct?: FractionStruct;
    toppingsPerSlice?: ToppingType[];
    toppingsCounts?: Record<ToppingType, number>;
};

export type Screen =
    | { type: "menu" }
    // 'game' screen may optionally include a difficulty and/or an Order to start with
    | { type: "game"; difficulty?: Difficulty; order?: Order }
    | { type: "order"; mode?: Difficulty; returnToGame?: boolean }
    | { type: "result"; mode?: Difficulty }
    | { type: "tutorial" }
    | { type: "settings" }
    | { type: "difficulty" }
    | { type: "minigame1" }
    | { type: "minigame2" };

export abstract class ScreenController {
    abstract getView(): View;

    show(): void {
        this.getView().show();
    }

    hide(): void {
        this.getView().hide();
    }
}

export interface ScreenSwitcher {
    switchToScreen(screen: Screen): void;
}
