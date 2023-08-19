import { add } from "./index";

describe("add", () => {
  test("adds two numbers", () => {
    expect(add(1, 2)).toStrictEqual(3);
  });
});
