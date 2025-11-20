import { describe, it, expect} from "vitest";
import { calculateTipFromObstacles } from "../src/screens/Minigame2Screen/Minigame2Model";
import { TIP_TABLE } from "../src/constants";

describe("calculateTipFromObstacles", () => {
  it("returns correct tip and review for 0 obstacles", () => {
    // first row of TIP_TABLE (0 obstacles) 
    const result = calculateTipFromObstacles(0);
    const expected = TIP_TABLE[0]; // { tip: 6.0, review: "DELICIOUS! My pizza was fresh and hot 🔥" }

    expect(result.tip).toBe(expected.tip);
    expect(result.review).toBe(expected.review);
  });

  it("returns lower tip for moderate obstacles", () => {
    // fourth row of TIP_TABLE (5 or 6 obstacles)
    const result = calculateTipFromObstacles(6);
    const expected = TIP_TABLE[3]; // { tip: 3.0, review: "Good pizza, but toppings were slightly off." }

    expect(result.tip).toBe(expected.tip);
    expect(result.review).toBe(expected.review);
  });

  it("returns lowest tip for 10+ obstacles", () => {
    // last row of TIP_TABLE (more than 10 obstacles)
    const result = calculateTipFromObstacles(11);
    const expected = TIP_TABLE[TIP_TABLE.length - 1]; // { tip: 0.0, review: "Never ordering again 💀" }
    
    expect(result.tip).toBe(expected.tip);
    expect(result.review).toBe(expected.review);
  });

  
});

describe("edge cases", () => {
    it("throws error for negative obstacle counts", () => {
        expect(() => calculateTipFromObstacles(-1)).toThrow("obstacleCount cannot be negative");
    });

    it("handles extremely large obstacle counts", () => {
        const result = calculateTipFromObstacles(999999);
        expect(result).toEqual(TIP_TABLE[TIP_TABLE.length - 1]); // Infinity row
    });
});