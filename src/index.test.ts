import { initialize } from "./index";

describe("initialize", () => {
  test("it can run", () => {
    expect(initialize()).not.toBeUndefined();
  });
});
