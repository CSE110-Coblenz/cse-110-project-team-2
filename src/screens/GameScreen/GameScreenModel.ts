import Konva from "konva";
import { PIZZA, ToppingType } from "../../constants";
import type { Order } from "../../types";
import { PlacedTopping } from "../../data/OrderResult";
export type OrderEval = {
  success: boolean;
  lines: string[];
  expectedTotal: number;
  currentTotal: number;
  expectedPizzaNum: number;
};


export class GameScreenModel{

    public placedToppings:PlacedTopping[]=[];
    resetnewOrder() {
      this.placedToppings=[];
    }
    registerPlacedTopping(x:number,y:number, type:ToppingType, pizzaIndex: 0|1) {
      this.placedToppings.push({x,y,type, pizzaIndex});
  }
    
  // list of Konva toppings currently on pizza
  toppingsOnPizza = new Map<ToppingType, Konva.Group[]>();

  // number of pizza slices
  sliceNum: number = 0;

  // number of pizzas
  pizzaNum: number = 0;

  // shows how many pizza slices are filled by what toppings
  filled = new Map<ToppingType, Set<number>>();

  setPizzaNum(num: number) {
    this.pizzaNum = num;
  }

  setSliceNum(num: number) {
    this.sliceNum = num;
  }

  resetToppingsState() {
    this.filled.clear();
    this.toppingsOnPizza.clear();
  }

  resetAll() {
    this.resetToppingsState();
    this.sliceNum = 0;
    this.pizzaNum = 0;
  }

  getToppings(type: ToppingType): Konva.Group[] {
    return this.toppingsOnPizza.get(type) ?? [];
  }

  clearTopping(type: ToppingType) {
    this.toppingsOnPizza.delete(type);
    this.filled.get(type)?.clear();
  }

  // calculate if midpoint of topping is on pizza
  inPizza(x: number, y: number, pizzaX: number, rOuter: number): boolean {
    return (
      Math.pow(x - pizzaX, 2) + Math.pow(y - PIZZA.pizzaY, 2) <=
      Math.pow(rOuter, 2)
    );
  }

  // calculate which slice topping is on (midpoint)
  sliceIndex(x: number, y: number, pizzaX: number): number {
    if (this.sliceNum <= 0) return 0;
    let ang = Math.atan2(y - PIZZA.pizzaY, x - pizzaX);
    if (ang < 0) ang += Math.PI * 2;
    const id = Math.floor((ang / (Math.PI * 2)) * this.sliceNum);
    return Math.max(0, Math.min(this.sliceNum - 1, id));
  }

  // create value set/array for Map if not present
  typeCheck(type: ToppingType) {
    if (!this.filled.has(type)) {
      this.filled.set(type, new Set<number>());
    }
    if (!this.toppingsOnPizza.has(type)) {
      this.toppingsOnPizza.set(type, []);
    }
  }

  //topping logic upon dragging it, updating game state and topping attributes. 
  updateToppingPlacement(
    topping: Konva.Group,
    toppingType: ToppingType,
    pizzaX: number,
    rOuter: number
  ) {
    this.typeCheck(toppingType);
    const previousSlice = topping.getAttr("countedSlice");

    if (this.inPizza(topping.x(), topping.y(), pizzaX, rOuter)) {
      // add to list of toppings on the pizza if its not there
      if (!this.toppingsOnPizza.get(toppingType)!.includes(topping)) {
        this.toppingsOnPizza.get(toppingType)!.push(topping);
      }

      let currentSlice = this.sliceIndex(topping.x(), topping.y(), pizzaX);
      if (pizzaX === PIZZA.pizzaX2) {
        currentSlice += this.sliceNum;
      }

      // If other topping types already occupy this slice, remove those toppings.
      for (const [type, toppings] of this.toppingsOnPizza.entries()) {
        if (type === toppingType) continue;
        const filled = this.filled.get(type);
        if (!filled || !filled.has(currentSlice)) continue;

        for (let i = toppings.length - 1; i >= 0; i--) {
          const node = toppings[i];
          if (node.getAttr("countedSlice") === currentSlice) {
            node.destroy(); // still minimal-change: model knows Konva nodes
            toppings.splice(i, 1);
          }
        }
        filled.delete(currentSlice);
      }

      if (previousSlice !== null && previousSlice !== currentSlice) {
        let removeSlice: boolean = true;

        for (const other of this.toppingsOnPizza.get(toppingType)!) {
          if (other === topping) continue;
          const otherSlice = other.getAttr("countedSlice");
          if (otherSlice !== null && otherSlice === previousSlice) {
            removeSlice = false;
            break;
          }
        }

        if (removeSlice) {
          this.filled.get(toppingType)!.delete(previousSlice);
        }
      }

      topping.setAttr("countedSlice", currentSlice);
      this.filled.get(toppingType)!.add(currentSlice);
    } else {
      // if topping is not on pizza remove it from list and filled
      if (previousSlice !== null) {
        let removeSlice: boolean = true;

        for (const other of this.toppingsOnPizza.get(toppingType)!) {
          if (other === topping) continue;
          const otherSlice = other.getAttr("countedSlice");
          if (otherSlice !== null && otherSlice === previousSlice) {
            removeSlice = false;
            break;
          }
        }

        if (removeSlice) {
          this.filled.get(toppingType)!.delete(previousSlice);
        }
        topping.setAttr("countedSlice", null);
      }

      const id = this.toppingsOnPizza.get(toppingType)!.indexOf(topping);
      if (id !== -1) {
        this.toppingsOnPizza.get(toppingType)!.splice(id, 1);
      }
      topping.destroy();
    }
  }

  // checks the current pizzas against the expected
  evaluateOrder(order: Order): OrderEval {
    const denom = order.fractionStruct?.denominator;
    const lines: string[] = [];
    let allMatch = true;
    let expectedTotal = 0;
    let currentTotal = 0;
    let expectedPizzaNum = 1;

    if (!denom) {
      return {
        success: false,
        lines: ["Invalid order (missing denominator)."],
        expectedTotal: 0,
        currentTotal: 0,
        expectedPizzaNum: this.pizzaNum,
      };
    }

    if (order.toppingsCounts) {
      for (const [topping, count] of Object.entries(order.toppingsCounts)) {
        const expected = count as number;
        let current = this.filled.get(topping as ToppingType)?.size ?? 0;
        const LCM = denom / this.sliceNum;
        const weightedCurrent = current * LCM;

        expectedTotal += expected;
        currentTotal += weightedCurrent || 0;

        lines.push(
          `${topping}: expected ${expected}/${denom}  —  current ${current}/${this.sliceNum}`
        );

        if (expected !== weightedCurrent) {
          allMatch = false;
        }
        if (expectedTotal > denom) expectedPizzaNum = 2;
      }

      lines.push(
        `#Pizza: expected ${expectedPizzaNum}  —  current ${this.pizzaNum}`
      );
    }

    const success =
      allMatch &&
      expectedTotal === currentTotal &&
      expectedPizzaNum === this.pizzaNum;

    return {
      success,
      lines,
      expectedTotal,
      currentTotal,
      expectedPizzaNum,
    };
  }
}
