import { ScreenController, ScreenSwitcher } from "../../types";
import { Minigame1View } from "./Minigame1View";
import { AudioManager } from "../../audio/AudioManager";
import { ResultStore } from "../../data/ResultStore";
import type { OrderResult } from "../../data/OrderResult";
import { TOPPINGS, ToppingType } from "../../constants";

export class Minigame1Controller extends ScreenController {
    private view: Minigame1View

    constructor(private screenSwitcher: ScreenSwitcher, private audio: AudioManager, private resultStore: ResultStore) {  
        super();
        this.view = new Minigame1View();

        this.view.onGoToMinigame2 = () => {
            this.screenSwitcher.switchToScreen({ type: "minigame2" });
        };
    }

    getView(): Minigame1View {
        return this.view;
    }

    show(): void {
        this.view.show();
        this.audio.musicStarted();
    }

    hide(): void {
        this.view.hide();
    }   

    startGame(): void {
        // pick two orders from the most recent day that have order data
        const all = this.resultStore.getAll();
        if (!all || all.length === 0) {
            this.view.showMessage("No orders recorded yet today.");
            this.show();
            return;
        }

        // find the latest day value
        const days = all.map(r => r.day);
        const latestDay = Math.max(...days);
        const todays = all.filter(r => r.day === latestDay && r.order && r.order.toppingsCounts);

        if (todays.length < 2) {
            this.view.showMessage("Not enough completed orders for today to play this minigame.");
            this.show();
            return;
        }

        // pick two random distinct orders
        const aIndex = Math.floor(Math.random() * todays.length);
        let bIndex = Math.floor(Math.random() * todays.length);
        while (bIndex === aIndex && todays.length > 1) {
            bIndex = Math.floor(Math.random() * todays.length);
        }

        const a = todays[aIndex];
        const b = todays[bIndex];

        // pick a random topping to ask about
        const topping = TOPPINGS[Math.floor(Math.random() * TOPPINGS.length)] as ToppingType;

        // render pair and evaluate player's choice
        this.view.renderPair(a, b, topping, (choice: "A" | "B" | "Tie") => {
            const aCount = a.order!.toppingsCounts?.[topping] ?? 0;
            const bCount = b.order!.toppingsCounts?.[topping] ?? 0;
            let correct: "A" | "B" | "Tie" = "Tie";
            if (aCount > bCount) correct = "A";
            else if (bCount > aCount) correct = "B";

            const isCorrect = choice === correct;
            this.view.showResult(isCorrect, `A: ${aCount}, B: ${bCount}`);

            // after showing result, provide a Back button to return to menu
            this.view.onBackToMenu = () => this.screenSwitcher.switchToScreen({ type: "menu" });
        });

        this.show();
    }
}