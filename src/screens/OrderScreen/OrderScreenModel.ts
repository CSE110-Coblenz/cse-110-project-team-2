import type { Order } from "../../types";
import { TOPPINGS, SLICE_OPTIONS } from "../../constants";
import type { ToppingType } from "../../constants";

function randInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export class OrderScreenModel {
    private order!: Order;

    constructor(initial?: Order) {
        if (initial) {
            this.order = initial;
        } else {
            this.generateRandomOrder();
        }
    }

    getOrder(): Order {
        return this.order;
    }

    setOrder(order: Order): void {
        this.order = order;
    }

    // Generate a proper fraction (numerator < denominator) using denominators
    // from SLICE_OPTIONS and a randomized topping assignment per slice.
    generateRandomOrder(maxDenominator = 16): Order {
        const denom = SLICE_OPTIONS[randInt(0, SLICE_OPTIONS.length - 1)];
        const num = randInt(1, denom - 1); // proper

        const fraction = `${num}/${denom}`;

        let toppingsPerSlice: ToppingType[] = [];
        let counts: Record<ToppingType, number> = Object.fromEntries(
            TOPPINGS.map((t) => [t, 0])
        ) as Record<ToppingType, number>;

        do {
            toppingsPerSlice = [];
            for (let i = 0; i < denom; i++) {
                const pick = TOPPINGS[Math.floor(Math.random() * TOPPINGS.length)] as ToppingType;// chooses topping randomly
                toppingsPerSlice.push(pick);
            }

            counts = Object.fromEntries(TOPPINGS.map((t) => [t, 0])) as Record<ToppingType, number>; //mushroom: x, pepper: y...
            for (const t of toppingsPerSlice) counts[t] = (counts[t] || 0) + 1;

            const present = Object.values(counts).filter((c) => c > 0).length;
            if (present >= 2) break;
        } while (true);

        const order: Order = {
            fraction,
            fractionStruct: { numerator: num, denominator: denom },
            toppingsPerSlice,
            toppingsCounts: counts,
        };

        this.order = order;
        return order;
    }
}
