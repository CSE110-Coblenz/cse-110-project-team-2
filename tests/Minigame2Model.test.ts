import { describe, it, expect} from "vitest";
import { calculateTipFromObstacles } from "../src/screens/Minigame2Screen/Minigame2Model";

describe("calculateTipFromObstacles", () => {
  it("returns correct tip and review for 0 obstacles", () => {
    const result = calculateTipFromObstacles(0);
    expect(result.tip).toBe(9.0);
    expect(result.review).toBe("DELICIOUS! My pizza was fresh and hot 🔥");
  });

  it("returns lower tip for moderate obstacles", () => {
    const result = calculateTipFromObstacles(3);
    expect(result.tip).toBe(6.0);
    expect(result.review).toBe("Good pizza, but toppings were slightly off.");
  });

  it("returns lowest tip for 10+ obstacles", () => {
    const result = calculateTipFromObstacles(11);
    expect(result.tip).toBe(0.0);
    expect(result.review).toBe("Never ordering again 💀");
  });
});