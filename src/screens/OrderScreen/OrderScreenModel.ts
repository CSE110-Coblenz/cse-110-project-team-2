import type { Order } from "../../types";
import { TOPPINGS, SLICE_OPTIONS } from "../../constants";
import { MIN_TOPPING_TYPES } from "../../constants";
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
            this.generateRandomProperOrder();
        }
    }

    getOrder(): Order {
        return this.order;
    }

    setOrder(order: Order): void {
        this.order = order;
    }

    generateRandomImproperOrder(minTypes = MIN_TOPPING_TYPES): Order {
        // Pick denominator & total slices
        const denom = SLICE_OPTIONS[randInt(0, SLICE_OPTIONS.length - 1)];
        const totalSlices = denom * 2;
        const fraction = `${totalSlices}/${denom}`;

        // Pick how many toppings (at least 2)
        const maxTypes = Math.min(TOPPINGS.length, denom);
        const minTypesClamped = Math.max(1, Math.min(minTypes, maxTypes));
        const k = randInt(minTypesClamped, maxTypes);

        // Pick k toppings without replacement
        const pool = TOPPINGS.slice();
        const chosen: ToppingType[] = [];
        for (let i = 0; i < k; i++) {
            const idx = randInt(0, pool.length - 1);
            chosen.push(pool.splice(idx, 1)[0]);
        }

        // Assign slices so that one topping is improper
        const counts: Record<ToppingType, number> = Object.fromEntries(
            TOPPINGS.map(t => [t, 0])
        ) as Record<ToppingType, number>;

        const improperTopping = chosen[0];

        const maxImproper = totalSlices - (k - 1);
        const improperSlices = randInt(denom + 1, maxImproper);
        counts[improperTopping] = improperSlices;

        // Distribute remaining slices among others
        let remaining = totalSlices - improperSlices;

        for (let i = 1; i < chosen.length; i++) {
            const t = chosen[i];
            if (i < chosen.length - 1) {
                const add = randInt(0, remaining);
                counts[t] = add;
                remaining -= add;
            } else {
                counts[t] = remaining;
                remaining = 0;
            }
        }

        const order: Order = {
            fraction,
            fractionStruct: { numerator: totalSlices, denominator: denom },
            toppingsCounts: counts
        };

        this.order = order;
        return order;
    }


    // Generate a proper fraction (numerator < denominator) using denominators
    // from SLICE_OPTIONS and a randomized topping assignment per slice.
    generateRandomProperOrder(maxDenominator = 16): Order {
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
            if (present >= MIN_TOPPING_TYPES) break;
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
