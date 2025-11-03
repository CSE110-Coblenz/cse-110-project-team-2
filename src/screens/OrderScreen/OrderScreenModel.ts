import type { Order } from "../../types";

export class OrderScreenModel {
    private order: Order;

    constructor(initial?: Order) {
        // will replace with random generation.
        this.order = initial ?? { fraction: "1/2", topping: "pepperoni" };
    }

    getOrder(): Order {
        return this.order;
    }

    setOrder(order: Order): void {
        this.order = order;
    }
}
